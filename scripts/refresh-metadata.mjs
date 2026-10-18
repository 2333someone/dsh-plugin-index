import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index';
import { collectGitHub } from './github.mjs';
import { collectDownloads } from './downloads.mjs';
import { applyMarketDisplay } from './market-display.mjs';
import { writeSite } from './site.mjs';

const read = async path => JSON.parse(await readFile(new URL('../' + path, import.meta.url), 'utf8'));
const optional = async path => { try { return await read(path); } catch { return undefined; } };
const config = await read('sources.json');
const current = await read('public/index.json');
const evidence = await read('public/status.json');
const oldDisplay = await optional('public/display.json');
const byName = new Map(config.packages.map(source => [source.name, source]));
if (byName.size !== config.packages.length || current.plugins.length !== byName.size) throw new Error('Package allowlist changed; run pnpm build');
const plugins = current.plugins.map(plugin => {
  const source = byName.get(plugin.name);
  const checked = evidence.packages.find(record => record.name === plugin.name);
  if (!source || (source.version && source.version !== plugin.versions[0].version) || checked?.version !== plugin.versions[0].version || !checked.checks?.includes('sha512-integrity')) throw new Error('Unvalidated package version; run pnpm build: ' + plugin.name);
  return { ...plugin, description: source.description ?? oldDisplay?.plugins?.[plugin.name]?.description ?? plugin.description };
});
const base = { ...current, title: config.title, description: config.description, plugins };
parseMarketIndex(base, 'https://polang233.github.io/dsh-plugin-index/index.json');
const github = await collectGitHub(base, { previous: await optional('.cache/github.json') ?? await optional('public/github.json') });
const downloads = await collectDownloads(base, { previous: await optional('.cache/downloads.json') ?? await optional('public/downloads.json') });
const { index, display } = applyMarketDisplay(base, { github, downloads, publishers: await read('publishers.json'), now: Date.parse(downloads.generatedAt) });
// Package validation timestamps remain unchanged during a metrics-only refresh.
evidence.market = { generatedAt: display.generatedAt, downloads: 'downloads.json', display: 'display.json', publisherEvidence: 'https://github.com/polang233/dsh-plugin-index/blob/main/publishers.json' };
const counts = Object.values(github.repositories);
evidence.github = { snapshot: 'github.json', fetched: counts.filter(record => record.status === 'ok').length, cached: counts.filter(record => record.status === 'stale').length, unavailable: counts.filter(record => record.status === 'unavailable').length };
await mkdir(new URL('../.cache/', import.meta.url), { recursive: true });
for (const [file, value] of Object.entries({ 'index.json': index, 'status.json': evidence, 'github.json': github, 'downloads.json': downloads, 'display.json': display })) await writeFile(new URL('../public/' + file, import.meta.url), JSON.stringify(value, null, 2) + '\n');
for (const [file, value] of Object.entries({ 'github.json': github, 'downloads.json': downloads })) await writeFile(new URL('../.cache/' + file, import.meta.url), JSON.stringify(value, null, 2) + '\n');
await writeSite(index, evidence, github, downloads, display);
console.log(JSON.stringify({ plugins: index.plugins.length, downloads: Object.values(downloads.packages).reduce((counts, record) => ({ ...counts, [record.status]: (counts[record.status] ?? 0) + 1 }), {}) }));
