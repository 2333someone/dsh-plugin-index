import { readFile } from 'node:fs/promises';
import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index';
import { writeSite } from './site.mjs';

const index = JSON.parse(await readFile(new URL('../public/index.json', import.meta.url), 'utf8'));
const evidence = JSON.parse(await readFile(new URL('../public/status.json', import.meta.url), 'utf8'));
parseMarketIndex(index, 'https://polang233.github.io/dsh-plugin-index/index.json');
const github = JSON.parse(await readFile(new URL('../public/github.json', import.meta.url), 'utf8'));
await writeSite(index, evidence, github);
console.log(`Built English and Chinese pages for ${index.plugins.length} plugins.`);
