import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index';
import { applyMarketDisplay, releaseAge } from '../scripts/market-display.mjs';
import { collectDownloads } from '../scripts/downloads.mjs';
import { checkMarketDisplay } from '../scripts/check-published.mjs';
import { approximateDownloads } from '../scripts/metric-format.mjs';

const NOW = Date.parse('2026-10-18T12:00:00Z');
const plugin = { name: '@owner/plugin', description: { en: 'Real description.', zh: '实际介绍。' }, repository: { url: 'https://github.com/owner/plugin' }, versions: [{ version: '1.0.0', publishTimestamp: Date.parse('2026-10-15T12:00:00Z') / 1000, source: { type: 'npm' } }] };
const index = { format: 1, title: 'Market', plugins: [plugin] };
const record = (name = plugin.name, downloads = 1234) => ({ package: name, downloads, start: '2026-09-18', end: '2026-10-17' });
const github = { repositories: { 'owner/plugin': { status: 'ok', stars: 2345, fetchedAt: '2026-10-18T12:00:00Z' } } };

test('DSH places exact stars before descriptions and buckets downloads in native tags', async () => {
  const downloads = await collectDownloads(index, { now: NOW, fetchImpl: async (url, options) => {
    assert.equal(url, 'https://api.npmjs.org/downloads/point/last-month/%40owner/plugin');
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers, undefined);
    return Response.json(record());
  } });
  const result = applyMarketDisplay(index, { github, downloads, now: NOW });
  const parsed = parseMarketIndex(result.index, 'https://example.org/index.json');
  assert.deepEqual(parsed.plugins[0].description, { en: '★ 2,345 │ Real description.', zh: '★ 2,345 │ 实际介绍。' });
  const tags = parsed.plugins[0].metadata.labels.map(id => parsed.metadata.labels[id].title);
  assert.deepEqual(tags, [{ en: '↓ 1.3k+', zh: '↓ 1.3k+' }, { en: '◷ Updated 3 days ago', zh: '◷ 3 天前更新' }]);
  assert.equal(parsed.plugins[0].versions[0].publishTimestamp, plugin.versions[0].publishTimestamp);
  assert.equal(parsed.plugins[0].metadata.sortKeys['npm-downloads-month'], 1234);
  assert.deepEqual(result.display.plugins[plugin.name].description, plugin.description);
  assert.deepEqual(checkMarketDisplay(result.index, github, downloads, result.display), { stars: 1, downloads: 1, identities: 0 });
  const invisible = structuredClone(result.index);
  invisible.plugins[0].metadata.labels = [];
  assert.throws(() => checkMarketDisplay(invisible, github, downloads, result.display), /visible DSH metrics/);
  const wrongStar = structuredClone(result.index);
  wrongStar.plugins[0].description.zh = '★ 999 │ 实际介绍。';
  assert.throws(() => checkMarketDisplay(wrongStar, github, downloads, result.display), /visible DSH metrics/);
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
  assert.ok(result.index.plugins[0].metadata.labels.some(id => /缓存 2026-10-17/.test(result.index.metadata.labels[id].title.zh)));
});

test('invalid identities, dates, negative counts and expired cache do not become zero', async () => {
  for (const response of [{ ...record(), package: 'other' }, { ...record(), downloads: -1 }, { ...record(), end: '2027-01-01' }, { ...record(), start: '2026-09-01' }, { error: 'not found' }]) {
    const snapshot = await collectDownloads(index, { now: NOW, previous: { packages: { [plugin.name]: { ...record(), status: 'ok', fetchedAt: '2026-10-01T12:00:00Z' } } }, fetchImpl: async () => Response.json(response) });
    assert.equal(snapshot.packages[plugin.name].status, 'unavailable');
    assert.equal(snapshot.packages[plugin.name].downloads, undefined);
    const result = applyMarketDisplay(index, { downloads: snapshot, now: NOW });
    assert.ok(result.index.plugins[0].metadata.labels.every(id => !result.index.metadata.labels[id].title.en.startsWith('↓')));
    assert.equal(result.index.metadata.sortKeys['npm-downloads-month'], undefined);
  }
});

test('identity badge requires both the exact reviewed package and repository', () => {
  const publishers = { schema: 1, entries: [{ id: 'owner', kind: 'company', title: { en: 'Owner · Official', zh: 'Owner · 官方' }, packages: [plugin.name], repository: plugin.repository.url, reviewedAt: '2026-10-18', evidence: ['https://github.com/owner'] }] };
  const result = applyMarketDisplay(index, { publishers, now: NOW }).index;
  assert.deepEqual(result.plugins[0].metadata.labels.filter(id => id.startsWith('publisher-')), ['publisher-owner']);
  const otherRepo = applyMarketDisplay({ ...index, plugins: [{ ...plugin, repository: { url: 'https://github.com/other/plugin' } }] }, { publishers, now: NOW }).index;
  assert.deepEqual(otherRepo.plugins[0].metadata.labels.filter(id => id.startsWith('publisher-')), []);
  const similarName = applyMarketDisplay({ ...index, plugins: [{ ...plugin, name: '@owner/unreviewed' }] }, { publishers, now: NOW }).index;
  assert.deepEqual(similarName.plugins[0].metadata.labels.filter(id => id.startsWith('publisher-')), []);
});

test('native metric declarations are shared and refreshed without retaining old counts', () => {
  const other = { ...plugin, name: '@owner/other' };
  const readings = downloads => ({ schema: 1, packages: Object.fromEntries([plugin.name, other.name].map(name => [name, { ...record(name, downloads), status: 'ok' }])) });
  const first = applyMarketDisplay({ ...index, plugins: [plugin, other] }, { github, downloads: readings(1234), now: NOW }).index;
  assert.equal(Object.keys(first.metadata.labels).length, 2);
  const sameBucket = applyMarketDisplay({ ...index, plugins: [plugin, other] }, { github, downloads: readings(1299), now: NOW }).index;
  assert.deepEqual(sameBucket.metadata.labels, first.metadata.labels);
  const next = applyMarketDisplay({ ...first, plugins: first.plugins.map(item => ({ ...item, description: plugin.description })) }, { github, downloads: readings(9999), now: NOW }).index;
  assert.equal(Object.keys(next.metadata.labels).length, 2);
  assert.ok(Object.values(next.metadata.labels).some(label => label.title.en === '↓ 10k+'));
  assert.ok(Object.values(next.metadata.labels).every(label => !label.title.en.includes('1.3k+')));
  const unmeasured = applyMarketDisplay({ ...next, plugins: next.plugins.map(item => ({ ...item, description: plugin.description })) }, { now: NOW }).index;
  assert.equal(Object.keys(unmeasured.metadata.labels).length, 1);
  assert.ok(Object.values(unmeasured.metadata.labels).every(label => label.title.en.startsWith('◷')));
  assert.deepEqual(unmeasured.plugins[0].description, plugin.description);
});

test('download buckets round upwards across unit boundaries and preserve real zero', () => {
  for (const [value, expected] of [[0,'0'],[11,'20+'],[525,'600+'],[999,'1k+'],[1000,'1k+'],[1001,'1.1k+'],[1569,'1.6k+'],[1600,'1.6k+'],[9999,'10k+'],[41576,'42k+'],[107548,'110k+'],[999999,'1m+'],[1_234_567,'1.3m+']]) assert.equal(approximateDownloads(value), expected);
  let previous = 0;
  for (let value = 0; value < 200_000; value += 37) {
    const text = approximateDownloads(value);
    const [,number,suffix] = /^(\d+(?:\.\d+)?)([kmb]?)\+?$/.exec(text);
    const displayed = Number(number) * ({k:1000,m:1_000_000,b:1_000_000_000}[suffix] ?? 1);
    assert.ok(displayed >= value && displayed >= previous, text);
    previous = displayed;
  }
});

test('measured zero and unavailable stars remain distinct in default descriptions', () => {
  const zero = { repositories: { 'owner/plugin': { ...github.repositories['owner/plugin'], stars: 0 } } };
  const result = applyMarketDisplay(index, { github: zero, now: NOW });
  assert.equal(result.index.plugins[0].description.zh, '★ 0 │ 实际介绍。');
  const missing = applyMarketDisplay(index, { now: NOW });
  assert.equal(missing.index.plugins[0].description.zh, '实际介绍。');
  assert.ok(Object.values(result.index.metadata.labels).every(label => !label.title.en.startsWith('★')));
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
