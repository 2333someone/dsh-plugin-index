import { createHash } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { Parser } from 'tar';
import semver from 'semver';
import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index';

export const REGISTRY = 'https://registry.npmjs.org/';
export const VALIDATOR_VERSION = '0.2.1-rc.2';
const PACKAGE = /^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/;

export async function download(url, { fetchImpl = fetch, maxBytes = 64 * 1024 * 1024, retryDelayMs = 500 } = {}) {
  const parsed = new URL(url);
  if (parsed.origin !== new URL(REGISTRY).origin || parsed.username || parsed.password) {
    throw new Error(`Only the public npm registry is supported: ${url}`);
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchImpl(url, {
        redirect: 'error', signal: AbortSignal.timeout(30_000),
        headers: { 'user-agent': 'dsh-plugin-index/0.1 (+https://github.com/polang233/dsh-plugin-index)' }
      });
      if (!response.ok || !response.body) {
        await response.body?.cancel();
        const error = new Error(`HTTP ${response.status}: ${url}`);
        error.retryable = response.status === 429 || response.status >= 500;
        throw error;
      }
      const chunks = [];
      let bytes = 0;
      for await (const chunk of response.body) {
        bytes += chunk.length;
        if (bytes > maxBytes) {
          const error = new Error(`Response exceeds ${maxBytes} bytes: ${url}`);
          error.retryable = false;
          throw error;
        }
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      if (error.retryable === false || attempt === 2) throw error;
      await delay(retryDelayMs * 2 ** attempt);
    }
  }
}

export function verifyIntegrity(bytes, integrity) {
  const hashes = typeof integrity === 'string' ? integrity.split(/\s+/).filter(x => x.startsWith('sha512-')) : [];
  const actual = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
  if (!hashes.includes(actual)) throw new Error('Published tarball has no matching SHA-512 integrity');
}

export async function inspectArchive(bytes) {
  const files = new Set();
  let manifest;
  let expanded = 0;
  const parser = new Parser({ strict: true, onReadEntry(entry) {
    try {
    expanded += entry.size;
    if (expanded > 100 * 1024 * 1024 || files.size > 20_000) throw new Error('Archive exceeds inspection limits');
    if (entry.type !== 'File' && entry.type !== 'OldFile') { entry.resume(); return; }
    if (!entry.path.startsWith('package/') || entry.path.includes('\\') || entry.path.split('/').includes('..')) {
      throw new Error(`Unexpected archive path: ${entry.path}`);
    }
    if (files.has(entry.path)) throw new Error(`Duplicate archive entry: ${entry.path}`);
    files.add(entry.path);
    if (entry.path === 'package/package.json') {
      if (entry.size > 1024 * 1024) throw new Error('Package manifest is too large');
      const chunks = [];
      entry.on('data', chunk => chunks.push(chunk));
      entry.on('end', () => { manifest = Buffer.concat(chunks).toString('utf8'); });
    } else entry.resume();
    } catch (error) { parser.abort(error); }
  } });
  await pipeline(Readable.from([bytes]), parser);
  if (!manifest) throw new Error('Published archive has no package/package.json');
  return { manifest: JSON.parse(manifest), files };
}

function packageFile(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Bundle patch must name a file');
  const path = value.replace(/^\.\//, '');
  if (path.startsWith('/') || path.includes('\\') || path.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error(`Invalid package file: ${value}`);
  }
  return `package/${path}`;
}

export function checkBundle(manifest, files, expectedName, expectedVersion) {
  if (manifest.name !== expectedName || manifest.version !== expectedVersion) throw new Error('Published archive identity differs from registry metadata');
  const declared = manifest.dsh?.bundle?.patch;
  const patches = (Array.isArray(declared) ? declared : [declared]).map(packageFile);
  if (!patches.length) throw new Error('Bundle must declare at least one patch');
  for (const patch of patches) if (!files.has(patch)) throw new Error(`Bundle patch is missing from published archive: ${patch}`);
  if (typeof manifest.main === 'string' && !files.has(packageFile(manifest.main))) throw new Error('Declared main file is missing from published archive');
  return patches;
}

export function dshEngines(manifest) {
  const explicit = manifest.engines && Object.hasOwn(manifest.engines, 'dsh');
  if (explicit) {
    const range = typeof manifest.engines.dsh === 'string' ? manifest.engines.dsh.trim() : '';
    if (!range || !semver.validRange(range) || semver.minVersion(new semver.Range(range, { includePrerelease: true })) === null) throw new Error('Invalid DSH compatibility range');
    return range === '*' ? {} : { dsh: range };
  }
  const peers = Object.entries(manifest.peerDependencies ?? {}).filter(([name]) => name === '@deepseek-ai/dsh' || name.startsWith('@deepseek-ai/dsh-'));
  const ranges = peers.map(([, value]) => value).filter(value => !['workspace:*', 'workspace:^', 'workspace:~'].includes(value));
  const used = [...new Set(ranges.map(value => typeof value === 'string' ? value.trim() : value))].filter(value => value !== '*');
  let combinations = [''];
  for (const value of used) {
    if (typeof value !== 'string' || !value || !semver.validRange(value)) throw new Error('Invalid DSH compatibility range');
    const sets = new semver.Range(value, { includePrerelease: true }).set.map(set => set.map(comparator => comparator.value).filter(Boolean).join(' '));
    if (combinations.length * sets.length > 256) throw new Error('DSH compatibility range is too complex');
    combinations = combinations.flatMap(left => sets.map(right => [...new Set(`${left} ${right}`.trim().split(/\s+/))].join(' ')))
      .filter(range => semver.minVersion(new semver.Range(range, { includePrerelease: true })) !== null);
  }
  if (!combinations.length) throw new Error('DSH peer compatibility ranges have no intersection');
  if (!used.length) return {};
  return { dsh: used.length === 1 ? used[0] : [...new Set(combinations)].join(' || ') };
}

export function repositoryFrom(manifest) {
  const raw = typeof manifest.repository === 'string' ? manifest.repository : manifest.repository?.url;
  if (typeof raw !== 'string') return undefined;
  let value = raw.replace(/^git\+/, '');
  if (/^(?:github:)?[\w.-]+\/[\w.-]+$/.test(value)) value = `https://github.com/${value.replace(/^github:/, '')}`;
  value = value.replace(/^git:\/\/github.com\//, 'https://github.com/').replace(/^git@github.com:/, 'https://github.com/');
  if (!URL.canParse(value)) return undefined;
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) return undefined;
  url.username = ''; url.password = ''; url.search = ''; url.hash = '';
  url.pathname = url.pathname.replace(/\.git$/, '');
  const directory = manifest.repository?.directory;
  const validDirectory = typeof directory === 'string' && directory.split('/').every(part => /^[A-Za-z0-9._@+-]+$/.test(part) && part !== '.' && part !== '..');
  return { url: url.href, ...(validDirectory ? { directory } : {}) };
}

export function resolveRepository(manifest, input, version, integrity) {
  const declared = repositoryFrom(manifest);
  const review = input.repositoryReview;
  if (review === undefined) return { repository: declared, provenance: declared ? 'package' : null };
  if (input.version !== version || review.version !== version || review.integrity !== integrity) {
    throw new Error('Repository review must match the pinned package version and integrity');
  }
  if (typeof review.commit !== 'string' || !/^[0-9a-f]{40}$/.test(review.commit)) throw new Error('Repository review requires an immutable commit');
  if (typeof review.url !== 'string' || !URL.canParse(review.url)) throw new Error('Repository review requires a canonical GitHub repository URL');
  const url = new URL(review.url);
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password || url.search || url.hash || !/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(url.pathname) || url.href !== review.url) {
    throw new Error('Repository review requires a canonical GitHub repository URL');
  }
  if (declared && declared.url.toLowerCase() !== review.url.toLowerCase()) throw new Error('Repository review conflicts with the published manifest');
  return {
    repository: declared ?? { url: review.url },
    provenance: declared ? 'package' : 'review',
    review: { version, integrity, commit: review.commit, url: review.url, evidence: `${review.url}/blob/${review.commit}/package.json` }
  };
}

export async function collectPackage(input, { fetchImpl = fetch, now = Date.now() } = {}) {
  if (!PACKAGE.test(input.name) || input.name.length > 214) throw new Error('Invalid npm package name');
  const metadataUrl = `${REGISTRY}${encodeURIComponent(input.name)}`;
  const metadata = JSON.parse((await download(metadataUrl, { fetchImpl })).toString('utf8'));
  const version = input.version ?? metadata['dist-tags']?.latest;
  if (typeof version !== 'string' || !semver.valid(version) || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) throw new Error('No exact valid release version');
  const published = metadata.versions?.[version];
  if (!published || published.deprecated) throw new Error('Requested version is missing or deprecated');
  const time = Date.parse(metadata.time?.[version]);
  if (!Number.isFinite(time) || time < 0 || time > now) throw new Error('Missing or invalid publication date');
  const bytes = await download(published.dist?.tarball, { fetchImpl });
  verifyIntegrity(bytes, published.dist?.integrity);
  const { manifest, files } = await inspectArchive(bytes);
  const patch = checkBundle(manifest, files, input.name, version);
  const repositoryInfo = resolveRepository(manifest, input, version, published.dist.integrity);
  const repository = repositoryInfo.repository;
  const author = typeof manifest.author === 'string' ? manifest.author.replace(/\s*<[^>]*>/g, '').replace(/\s*\([^)]*\)/g, '').trim() : manifest.author?.name;
  const description = input.description ?? manifest.description;
  const entry = {
    name: manifest.name,
    ...(input.title ? { title: input.title } : {}),
    ...(description && (typeof description !== 'string' || description.trim()) ? { description } : {}),
    ...(typeof author === 'string' && author.trim() ? { author } : {}),
    ...(repository ? { repository } : {}),
    ...(typeof manifest.homepage === 'string' && URL.canParse(manifest.homepage) && ['https:', 'http:'].includes(new URL(manifest.homepage).protocol) ? { homepage: manifest.homepage } : {}),
    metadata: {
      ...(input.category ? { category: input.category } : {}),
      keywords: Array.isArray(manifest.keywords) ? manifest.keywords.filter(x => typeof x === 'string') : []
    },
    versions: [{ version, publishTimestamp: Math.floor(time / 1000), source: { type: 'npm', registry: REGISTRY }, engines: dshEngines(manifest) }]
  };
  const lifecycleScripts = Object.keys(manifest.scripts ?? {}).filter(key => ['preinstall', 'install', 'postinstall'].includes(key));
  return {
    entry,
    evidence: { name: manifest.name, version, license: typeof manifest.license === 'string' ? manifest.license : null, repository: repository?.url ?? null, repositorySource: repositoryInfo.provenance, ...(repositoryInfo.review ? { repositoryReview: repositoryInfo.review } : {}), metadataUrl, tarball: published.dist.tarball, integrity: published.dist.integrity, patch, filesChecked: files.size, lifecycleScripts, checks: ['registry-identity', 'sha512-integrity', 'archive-manifest-identity', 'bundle-patch-present', ...(manifest.main ? ['main-file-present'] : [])], limitations: ['No runtime installation test', 'No code audit', 'Patch references and transitive dependencies are not validated'] }
  };
}

export async function buildIndex(config, options = {}) {
  if (!Array.isArray(config.packages) || config.packages.length === 0) throw new Error('An explicit nonempty package allowlist is required');
  const names = config.packages.map(input => input.name);
  if (new Set(names).size !== names.length) throw new Error('Source list duplicates a package name');
  const concurrency = options.concurrency ?? 4;
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 8) throw new Error('Concurrency must be between 1 and 8');
  const results = [];
  const errors = [];
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, config.packages.length) }, async () => {
    while (next < config.packages.length) {
      const input = config.packages[next++];
      try {
        const result = await collectPackage(input, options);
        if (config.requireSourceMetadata && (!result.evidence.repository || !result.evidence.license?.trim() || result.evidence.license === 'UNLICENSED')) {
          throw new Error('A public source repository and declared license are required');
        }
        results.push(result);
      }
      catch (error) { errors.push(`${input.name}: ${error.message}`); }
    }
  }));
  if (errors.length) throw new Error(`Cannot publish index: ${errors.join('; ')}`);
  results.sort((a, b) => a.entry.name.localeCompare(b.entry.name, 'en'));
  const index = {
    format: 1, title: config.title, description: config.description,
    ...(config.metadata ? { metadata: config.metadata } : {}), plugins: results.map(x => x.entry)
  };
  parseMarketIndex(index, 'https://polang233.github.io/dsh-plugin-index/index.json');
  return {
    index,
    evidence: {
      generatedAt: new Date(options.now ?? Date.now()).toISOString(),
      validator: { name: '@deepseek-ai/dsh-plugin-market-index', version: VALIDATOR_VERSION },
      packages: results.map(x => x.evidence)
    }
  };
}
