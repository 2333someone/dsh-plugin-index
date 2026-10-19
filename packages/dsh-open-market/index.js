import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const name = 'dsh-open-market';
// Wait for the Custom plugin markets bundle; without it there is no Discover tab to add to.
export const inject = ['pluginMarket'];

export const INDEX_URL = 'https://dshopen.org/index.json';
// Earlier address of the same index; a profile that already has it needs no second copy.
const ALIASES = ['https://polang233.github.io/dsh-plugin-index/index.json'];
const STATE_FILE = '.dsh-open-market.json';

const canonical = url => URL.canParse(url) ? new URL(url).href : url;

/** The marker lives in the profile, so each profile is set up once and a removed source stays removed. */
async function readState(dir) {
  if (!dir) return {};
  try { return JSON.parse(await readFile(join(dir, STATE_FILE), 'utf8')); } catch { return {}; }
}

/**
 * Add the index to the configured sources unless this profile already received it.
 * @returns 'added' | 'present' | 'skipped'
 */
export async function ensureIndex(market, { url = INDEX_URL, dir } = {}) {
  const state = await readState(dir);
  const seeded = Array.isArray(state.added) ? state.added : [];
  if (seeded.includes(canonical(url))) return 'skipped';
  const current = market.listIndexes().map(source => source.url);
  const same = new Set([url, ...(url === INDEX_URL ? ALIASES : [])].map(canonical));
  const present = current.some(source => same.has(canonical(source)));
  if (!present) await market.setIndexes([...current, url]);
  if (dir) await writeFile(join(dir, STATE_FILE), JSON.stringify({ added: [...seeded, canonical(url)] }, null, 2) + '\n');
  return present ? 'present' : 'added';
}

export function apply(ctx, config = {}) {
  const url = typeof config?.indexUrl === 'string' ? config.indexUrl : INDEX_URL;
  const dir = ctx.get?.('profileContext')?.dir;
  const logger = ctx.logger?.('dsh-open-market') ?? ctx.logger;
  ensureIndex(ctx.pluginMarket, { url, dir }).then(
    result => { if (result === 'added') logger?.info?.('Added %s to plugin market sources', url); },
    error => logger?.warn?.('Could not add %s to plugin market sources: %s', url, error?.message ?? error)
  );
}
