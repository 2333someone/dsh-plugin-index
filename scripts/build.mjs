import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { buildIndex } from './lib.mjs';
import { collectGitHub } from './github.mjs';
import { collectDownloads } from './downloads.mjs';
import { applyMarketDisplay } from './market-display.mjs';
import { writeSite } from './site.mjs';

async function readSnapshot(url) {
  try {
    const value = JSON.parse(await readFile(url, 'utf8'));
    return value.schema === 1 && value.repositories ? value : undefined;
  } catch { return undefined; }
}

const config = JSON.parse(await readFile(new URL('../sources.json', import.meta.url), 'utf8'));
const built = await buildIndex(config);
const output = new URL('../public/', import.meta.url);
const cache = new URL('../.cache/', import.meta.url);
const previous = await readSnapshot(new URL('github.json', cache)) ?? await readSnapshot(new URL('github.json', output));
const github = await collectGitHub(built.index, { previous });
let previousDownloads;
for (const root of [cache, output]) {
  try { previousDownloads = JSON.parse(await readFile(new URL('downloads.json', root), 'utf8')); break; } catch { /* Next source. */ }
}
const downloads = await collectDownloads(built.index, { previous: previousDownloads });
const publishers = JSON.parse(await readFile(new URL('../publishers.json', import.meta.url), 'utf8'));
const { index, display } = applyMarketDisplay(built.index, { github, downloads, publishers, now: Date.parse(downloads.generatedAt) });
const states = Object.values(github.repositories);
const evidence = {
  ...built.evidence,
  market: { generatedAt: display.generatedAt, downloads: 'downloads.json', display: 'display.json', publisherEvidence: 'https://github.com/polang233/dsh-plugin-index/blob/main/publishers.json' },
  github: {
    snapshot: 'github.json',
    fetched: states.filter(repo => repo.status === 'ok').length,
    cached: states.filter(repo => repo.status === 'stale').length,
    unavailable: states.filter(repo => repo.status === 'unavailable').length
  }
};
// All package downloads and validation finish before touching the last successful output.
await mkdir(output, { recursive: true });
await mkdir(cache, { recursive: true });
await mkdir(new URL('icons/', output), { recursive: true });
for (const asset of new Map(built.assets.map(asset => [asset.path, asset])).values()) {
  await writeFile(new URL(asset.path, output), asset.bytes);
}
await writeFile(new URL('index.json', output), `${JSON.stringify(index, null, 2)}\n`);
await writeFile(new URL('status.json', output), `${JSON.stringify(evidence, null, 2)}\n`);
await writeFile(new URL('github.json', output), `${JSON.stringify(github, null, 2)}\n`);
await writeFile(new URL('github.json', cache), `${JSON.stringify(github, null, 2)}\n`);
await writeFile(new URL('downloads.json', output), `${JSON.stringify(downloads, null, 2)}\n`);
await writeFile(new URL('downloads.json', cache), `${JSON.stringify(downloads, null, 2)}\n`);
await writeFile(new URL('display.json', output), `${JSON.stringify(display, null, 2)}\n`);
await writeSite(index, evidence, github, downloads, display);
console.log(`Generated format-1 index: ${index.plugins.length} plugins; official validator ${evidence.validator.version}.`);
console.log(`GitHub metadata: ${evidence.github.fetched} fetched, ${evidence.github.cached} cached, ${evidence.github.unavailable} unavailable.`);
