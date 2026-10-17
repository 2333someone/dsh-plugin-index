import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { buildIndex } from './lib.mjs';
import { writeSite } from './site.mjs';

const config = JSON.parse(await readFile(new URL('../sources.json', import.meta.url), 'utf8'));
const { index, evidence } = await buildIndex(config);
const output = new URL('../public/', import.meta.url);
// All downloads and validation finish before touching the last successful output.
await mkdir(output, { recursive: true });
await writeFile(new URL('index.json', output), `${JSON.stringify(index, null, 2)}\n`);
await writeFile(new URL('status.json', output), `${JSON.stringify(evidence, null, 2)}\n`);
await writeSite(index, evidence);
console.log(`Generated format-1 index: ${index.plugins.length} plugins; official validator ${evidence.validator.version}.`);
