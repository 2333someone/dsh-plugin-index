import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseMarketIndex,marketInstallTarget} from '@deepseek-ai/dsh-plugin-market-index';
import {parseSummary} from '../packages/market-listing-ui/src/client.mjs';

test('metric prefix parsing accepts old and new indexes, zero and dated caches',()=>{
  const old=parseSummary('★ 0 · ↓ 42/30d · Updated 1 day ago — Description — continuation');
  assert.equal(old.metrics[0].text,'★ 0');
  assert.equal(old.metrics[1].text,'↓ 42');
  assert.equal(old.description,'Description — continuation');
  const cached=parseSummary('★ 2（缓存 2026-10-18） · ↓ 3 · ◷ 今天更新 — 介绍');
  assert.match(cached.metrics[0].title,/缓存/);
  assert.equal(cached.metrics[2].text,'◷ 今天更新');
  for(const text of ['Normal description','★ helpful — plain text','★ 1 · unexpected — description','★ 1 · ★ 2 — duplicate']) assert.equal(parseSummary(text),undefined);
});
test('enhancement index supplies an exact installable Git commit and package directory',async()=>{
  const read=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));
  const index=parseMarketIndex(await read('public/enhancements.json'),'https://example.org/enhancements.json');
  const manifest=await read('packages/market-listing-ui/package.json');
  const release=await read('enhancement-release.json');
  assert.equal(index.plugins[0].name,manifest.name);
  assert.equal(index.plugins[0].versions[0].version,manifest.version);
  const target=marketInstallTarget(manifest.name,index.plugins[0].versions[0]);
  assert.ok(target.spec.includes('#'+release.commit+'&path:/packages/market-listing-ui'));
  await readFile(new URL('../packages/market-listing-ui/'+manifest.dsh.bundle.patch,import.meta.url));
  await readFile(new URL('../packages/market-listing-ui/client.js',import.meta.url));
});
