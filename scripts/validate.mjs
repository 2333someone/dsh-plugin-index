import { readFile } from 'node:fs/promises';
import { parseMarketIndex, marketInstallTarget } from '@deepseek-ai/dsh-plugin-market-index';

const input = process.argv[2];
let raw;
let base = 'https://index.invalid/index.json';
if (input && /^https?:\/\//.test(input)) {
  base = input;
  const response = await fetch(input, { redirect: 'error', signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  raw = await response.json();
} else {
  raw = JSON.parse(await readFile(input ?? new URL('../public/index.json', import.meta.url), 'utf8'));
}
const index = parseMarketIndex(raw, base);
if (!index.plugins.length) throw new Error('Refusing an empty published index');
console.log(`Official format-1 validation passed: ${index.plugins.length} plugins.`);
for (const plugin of index.plugins) console.log(JSON.stringify({ name: plugin.name, install: marketInstallTarget(plugin.name, plugin.versions[0]) }));
