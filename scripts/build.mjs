import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { buildIndex } from './lib.mjs';
import { collectGitHub, applyGitHubStars } from './github.mjs';
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
const index = applyGitHubStars(built.index, github);
const states = Object.values(github.repositories);
const evidence = {
  ...built.evidence,
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
await writeFile(new URL('index.json', output), `${JSON.stringify(index, null, 2)}\n`);
await writeFile(new URL('status.json', output), `${JSON.stringify(evidence, null, 2)}\n`);
await writeFile(new URL('github.json', output), `${JSON.stringify(github, null, 2)}\n`);
await writeFile(new URL('github.json', cache), `${JSON.stringify(github, null, 2)}\n`);
await writeSite(index, evidence);
console.log(`Generated format-1 index: ${index.plugins.length} plugins; official validator ${evidence.validator.version}.`);
console.log(`GitHub metadata: ${evidence.github.fetched} fetched, ${evidence.github.cached} cached, ${evidence.github.unavailable} unavailable.`);
