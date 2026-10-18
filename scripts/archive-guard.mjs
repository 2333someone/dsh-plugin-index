import { Transform } from 'node:stream';
import { Header, Pax } from 'tar';

const META_TYPES = new Set(['ExtendedHeader', 'OldExtendedHeader', 'GlobalExtendedHeader', 'NextFileHasLongPath', 'OldGnuLongPath', 'NextFileHasLongLinkpath']);
const BLOCK = 512;
const MAX_META_BYTES = 1024 * 1024;

/** Count raw tar framing, including metadata which Parser intentionally hides from entry callbacks. */
export class ArchiveGuard extends Transform {
  constructor(maxBytes, maxEntries = 20_000) {
    super();
    this.maxBytes = maxBytes;
    this.maxEntries = maxEntries;
    this.decodedBytes = 0;
    this.payloadBytes = 0;
    this.entries = 0;
    this.header = Buffer.alloc(BLOCK);
    this.headerLength = 0;
    this.remaining = 0;
    this.meta = undefined;
    this.extended = undefined;
    this.globalExtended = undefined;
    this.endBlocks = 0;
  }

  _transform(chunk, encoding, callback) {
    try {
      this.decodedBytes += chunk.length;
      if (this.decodedBytes > this.maxBytes) throw new Error('Archive exceeds inspection limits: decoded bytes');
      let offset = 0;
      while (offset < chunk.length) {
        if (this.remaining) {
          const count = Math.min(this.remaining, chunk.length - offset);
          if (this.meta) {
            const content = Math.min(count, this.meta.size - this.meta.received);
            if (content > 0) {
              this.meta.chunks.push(chunk.subarray(offset, offset + content));
              this.meta.received += content;
            }
          }
          this.remaining -= count;
          offset += count;
          if (!this.remaining && this.meta) this.finishMetadata();
          continue;
        }
        const count = Math.min(BLOCK - this.headerLength, chunk.length - offset);
        chunk.copy(this.header, this.headerLength, offset, offset + count);
        this.headerLength += count;
        offset += count;
        if (this.headerLength !== BLOCK) continue;
        this.headerLength = 0;
        const header = new Header(this.header, 0, this.extended, this.globalExtended);
        if (header.nullBlock) { this.endBlocks++; continue; }
        if (this.endBlocks >= 2) throw new Error('Unexpected data after tar end');
        this.endBlocks = 0;
        if (!header.cksumValid || !header.path) throw new Error('Invalid tar header');
        const size = header.size ?? 0;
        if (!Number.isSafeInteger(size) || size < 0) throw new Error('Invalid tar entry size');
        this.entries++;
        this.payloadBytes += size;
        if (this.entries > this.maxEntries || this.payloadBytes > this.maxBytes) throw new Error('Archive exceeds inspection limits: entries or payload');
        this.remaining = BLOCK * Math.ceil(size / BLOCK);
        if (META_TYPES.has(header.type)) {
          if (size > MAX_META_BYTES) throw new Error('Archive metadata is too large');
          // Empty metadata is still an entry, but Parser does not apply any overrides for it.
          if (size) this.meta = { type: header.type, size, received: 0, chunks: [] };
        } else this.extended = undefined;
      }
      callback(null, chunk);
    } catch (error) { callback(error); }
  }

  finishMetadata() {
    const { type, chunks } = this.meta;
    const text = Buffer.concat(chunks).toString('utf8');
    this.meta = undefined;
    if (type === 'ExtendedHeader' || type === 'OldExtendedHeader') this.extended = Pax.parse(text, this.extended, false);
    else if (type === 'GlobalExtendedHeader') this.globalExtended = Pax.parse(text, this.globalExtended, true);
    else {
      this.extended ??= Object.create(null);
      this.extended[type === 'NextFileHasLongLinkpath' ? 'linkpath' : 'path'] = text.replace(/\0.*/, '');
    }
  }

  _flush(callback) {
    callback(this.remaining || this.headerLength ? new Error('Truncated tar archive') : undefined);
  }
}
