import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index';
import { applyMarketDisplay, releaseAge } from '../scripts/market-display.mjs';
import { collectDownloads } from '../scripts/downloads.mjs';
import { checkMarketDisplay } from '../scripts/check-published.mjs';

const NOW = Date.parse('2026-10-18T12:00:00Z');
const plugin = { name: '@owner/plugin', description: { en: 'Real description.', zh: '实际介绍。' }, repository: { url: 'https://github.com/owner/plugin' }, versions: [{ version: '1.0.0', publishTimestamp: Date.parse('2026-10-15T12:00:00Z') / 1000, source: { type: 'npm' } }] };
const index = { format: 1, title: 'Market', plugins: [plugin] };
const record = (name = plugin.name, downloads = 1234) => ({ package: name, downloads, start: '2026-09-18', end: '2026-10-17' });
const github = { repositories: { 'owner/plugin': { status: 'ok', stars: 2345, fetchedAt: '2026-10-18T12:00:00Z' } } };

test('DSH receives measured numbers in the supported description, not only sort keys', async () => {
  const downloads = await collectDownloads(index, { now: NOW, fetchImpl: async (url, options) => {
    assert.equal(url, 'https://api.npmjs.org/downloads/point/last-month/%40owner/plugin');
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers, undefined);
    return Response.json(record());
  } });
  const result = applyMarketDisplay(index, { github, downloads, now: NOW });
  const parsed = parseMarketIndex(result.index, 'https://example.org/index.json');
  assert.equal(parsed.plugins[0].description.zh, '★ 2,345 · ↓ 1,234 · ◷ 3 天前更新 — 实际介绍。');
  assert.equal(parsed.plugins[0].description.en, '★ 2,345 · ↓ 1,234 · ◷ Updated 3 days ago — Real description.');
  assert.equal(parsed.plugins[0].versions[0].publishTimestamp, plugin.versions[0].publishTimestamp);
  assert.equal(parsed.plugins[0].metadata.sortKeys['npm-downloads-month'], 1234);
  assert.deepEqual(parsed.metadata.labels, {});
  assert.deepEqual(result.display.plugins[plugin.name].description, plugin.description);
  assert.deepEqual(checkMarketDisplay(result.index, github, downloads, result.display), { stars: 1, downloads: 1, identities: 0 });
  const invisible = structuredClone(result.index);
  invisible.plugins[0].description = plugin.description;
  assert.throws(() => checkMarketDisplay(invisible, github, downloads, result.display), /visible DSH metrics/);
});

test('bulk npm queries keep scoped packages separate and accept measured zero', async () => {
  const input = { plugins: [plugin, ...['one', 'two'].map(name => ({ ...plugin, name }))] };
  const calls = [];
  const snapshot = await collectDownloads(input, { now: NOW, fetchImpl: async url => {
    calls.push(url);
    return Response.json(url.endsWith('one,two') ? { one: record('one', 0), two: record('two', 1) } : record());
  } });
  assert.equal(calls.length, 2);
  assert.equal(snapshot.packages.one.downloads, 0);
  assert.equal(snapshot.packages[plugin.name].status, 'ok');
});

test('npm failure retains a bounded cache with original dates and visible cache text', async () => {
  const previous = { packages: { [plugin.name]: { ...record(), status: 'ok', fetchedAt: '2026-10-17T12:00:00Z' } } };
  const downloads = await collectDownloads(index, { now: NOW, previous, fetchImpl: async () => new Response('', { status: 404 }) });
  const cached = downloads.packages[plugin.name];
  assert.equal(cached.status, 'stale');
  assert.equal(cached.fetchedAt, previous.packages[plugin.name].fetchedAt);
  assert.equal(cached.start, '2026-09-18');
  const result = applyMarketDisplay(index, { downloads, now: NOW });
  assert.match(result.index.plugins[0].description.zh, /缓存 2026-10-17/);
});

test('invalid identities, dates, negative counts and expired cache do not become zero', async () => {
  for (const response of [{ ...record(), package: 'other' }, { ...record(), downloads: -1 }, { ...record(), end: '2027-01-01' }, { ...record(), start: '2026-09-01' }, { error: 'not found' }]) {
    const snapshot = await collectDownloads(index, { now: NOW, previous: { packages: { [plugin.name]: { ...record(), status: 'ok', fetchedAt: '2026-10-01T12:00:00Z' } } }, fetchImpl: async () => Response.json(response) });
    assert.equal(snapshot.packages[plugin.name].status, 'unavailable');
    assert.equal(snapshot.packages[plugin.name].downloads, undefined);
    const result = applyMarketDisplay(index, { downloads: snapshot, now: NOW });
    assert.doesNotMatch(result.index.plugins[0].description.en, /↓/);
    assert.equal(result.index.metadata.sortKeys['npm-downloads-month'], undefined);
  }
});

test('identity badge requires both the exact reviewed package and repository', () => {
  const publishers = { schema: 1, entries: [{ id: 'owner', kind: 'company', title: { en: 'Owner · Official', zh: 'Owner · 官方' }, packages: [plugin.name], repository: plugin.repository.url, reviewedAt: '2026-10-18', evidence: ['https://github.com/owner'] }] };
  const result = applyMarketDisplay(index, { publishers, now: NOW }).index;
  assert.deepEqual(result.plugins[0].metadata.labels, ['publisher-owner']);
  const otherRepo = applyMarketDisplay({ ...index, plugins: [{ ...plugin, repository: { url: 'https://github.com/other/plugin' } }] }, { publishers, now: NOW }).index;
  assert.deepEqual(otherRepo.plugins[0].metadata.labels, []);
  const similarName = applyMarketDisplay({ ...index, plugins: [{ ...plugin, name: '@owner/unreviewed' }] }, { publishers, now: NOW }).index;
  assert.deepEqual(similarName.plugins[0].metadata.labels, []);
});

test('release age never rewrites timestamps or invents an age for future values', () => {
  assert.equal(releaseAge(NOW / 1000, NOW, 'zh'), '今天更新');
  assert.equal(releaseAge(NOW / 1000 - 86_400, NOW, 'en'), 'Updated 1 day ago');
  assert.equal(releaseAge(NOW / 1000 + 1, NOW, 'zh'), undefined);
  assert.equal(releaseAge(NaN, NOW, 'en'), undefined);
});

test('recent successful download readings retain their real fetch time without another API call', async () => {
  const previous = { packages: { [plugin.name]: { ...record(), status: 'ok', fetchedAt: '2026-10-18T11:00:00Z' } } };
  const snapshot = await collectDownloads(index, { now: NOW, previous, fetchImpl: () => assert.fail('Recent reading should be reused') });
  assert.equal(snapshot.packages[plugin.name].fetchedAt, '2026-10-18T11:00:00Z');
  assert.equal(snapshot.packages[plugin.name].downloads, 1234);
});
