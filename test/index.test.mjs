import test from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { buildIndex, checkBundle, collectPackage, download, dshEngines, inspectArchive, repositoryFrom, resolveRepository, verifyIntegrity } from '../scripts/lib.mjs';
import { marketInstallTarget, parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index';

function archive(entries) {
  const chunks = [];
  for (const [name, value] of entries) {
    const data = Buffer.from(value);
    const header = Buffer.alloc(512);
    header.write(name, 0, 100);
    header.write('0000644\0', 100, 8);
    header.write('0000000\0', 108, 8);
    header.write('0000000\0', 116, 8);
    header.write(`${data.length.toString(8).padStart(11, '0')}\0`, 124, 12);
    header.write('00000000000\0', 136, 12);
    header.fill(32, 148, 156);
    header.write('0', 156);
    header.write('ustar\0', 257, 6);
    header.write('00', 263, 2);
    const checksum = header.reduce((sum, value) => sum + value, 0);
    header.write(`${checksum.toString(8).padStart(6, '0')}\0 `, 148, 8);
    chunks.push(header, data, Buffer.alloc((512 - data.length % 512) % 512));
  }
  return gzipSync(Buffer.concat([...chunks, Buffer.alloc(1024)]));
}
function fixture({ patch = true, integrity = true, version = '1.2.3' } = {}) {
  const manifest = { name: '@example/dsh-plugin', version, dsh: { bundle: { patch: './cordis.patch.yml' } }, main: 'lib/index.js', peerDependencies: { '@deepseek-ai/dsh': '>=0.2.0 <0.3.0' } };
  const entries = [['package/package.json', JSON.stringify(manifest)], ['package/lib/index.js', 'throw new Error("This must never execute");']];
  if (patch) entries.push(['package/cordis.patch.yml', '- id: example']);
  const bytes = archive(entries);
  const metadata = { 'dist-tags': { latest: manifest.version }, time: { [version]: '2026-01-01T00:00:00Z' }, versions: { [version]: { ...manifest, dist: { tarball: 'https://registry.npmjs.org/@example/plugin.tgz', integrity: integrity ? `sha512-${createHash('sha512').update(bytes).digest('base64')}` : 'sha512-invalid' } } } };
  return { manifest, fetchImpl: async (url, opts) => {
    assert.equal(opts.redirect, 'error');
    return new Response(url.endsWith('.tgz') ? bytes : JSON.stringify(metadata), { status: 200 });
  } };
}
const config = { title: { en: 'Test', zh: '测试' }, description: 'Fixture index', packages: [{ name: '@example/dsh-plugin' }] };

test('real archive shape produces an official-format index and exact install target', async () => {
  const result = await buildIndex(config, { ...fixture(), now: Date.parse('2026-02-01') });
  const parsed = parseMarketIndex(result.index, 'https://example.org/index.json');
  assert.equal(parsed.plugins[0].versions[0].publishTimestamp, 1767225600);
  assert.equal(marketInstallTarget(parsed.plugins[0].name, parsed.plugins[0].versions[0]).spec, '@example/dsh-plugin@1.2.3');
  assert.equal(result.evidence.packages[0].checks.includes('bundle-patch-present'), true);
  assert.ok(parsed.plugins[0].versions[0].engines.dsh);
});
test('rejects a tampered tarball', async () => {
  await assert.rejects(collectPackage(config.packages[0], fixture({ integrity: false })), /integrity/);
  assert.throws(() => verifyIntegrity(Buffer.from('x'), undefined), /integrity/);
});
test('missing bundle patch prevents publication', async () => {
  await assert.rejects(buildIndex(config, fixture({ patch: false })), /Cannot publish index.*missing/);
});
test('duplicate names and empty sources cannot publish', async () => {
  await assert.rejects(buildIndex({ ...config, packages: [] }), /nonempty/);
  await assert.rejects(buildIndex({ ...config, packages: [...config.packages, ...config.packages] }, fixture()), /duplicates/);
});
test('external tarball URLs are rejected before a request', async () => {
  await assert.rejects(download('https://example.org/plugin.tgz', { fetchImpl: () => assert.fail('must not fetch') }), /public npm registry/);
});
test('compatibility preserves OR intersections and rejects incompatible peers', () => {
  assert.equal(dshEngines({ engines: { dsh: '*' } }).dsh, undefined);
  assert.equal(dshEngines({ peerDependencies: { '@deepseek-ai/dsh': 'workspace:^' } }).dsh, undefined);
  const result = dshEngines({ peerDependencies: { '@deepseek-ai/dsh': '^0.2.0 || ^0.3.0', '@deepseek-ai/dsh-core': '>=0.3.2 <0.4.0' } });
  assert.match(result.dsh, />=0.3.2/);
  assert.throws(() => dshEngines({ peerDependencies: { '@deepseek-ai/dsh': '<0.2.0', '@deepseek-ai/dsh-core': '>=0.3.0' } }), /intersection/);
  assert.throws(() => dshEngines({ engines: { dsh: 'workspace:*' } }), /Invalid/);
});
test('multiple patch files are checked and archive identity cannot drift', () => {
  const manifest = { name: 'test', version: '1.0.0', dsh: { bundle: { patch: ['a.yml', 'b.yml'] } } };
  assert.equal(checkBundle(manifest, new Set(['package/a.yml', 'package/b.yml']), 'test', '1.0.0').length, 2);
  assert.throws(() => checkBundle(manifest, new Set(['package/a.yml']), 'test', '1.0.0'), /missing/);
  assert.throws(() => checkBundle(manifest, new Set(), 'other', '1.0.0'), /identity/);
});
test('unsafe and duplicate archive paths reject cleanly', async () => {
  await assert.rejects(inspectArchive(archive([['package/../bad', 'x']])), /Unexpected|abort/);
  await assert.rejects(inspectArchive(archive([['package/package.json', '{}'], ['package/package.json', '{}']])), /Duplicate|abort/);
});
test('build metadata remains an exact installable version; prefixes are rejected', async () => {
  const { index } = await buildIndex(config, fixture({ version: '1.2.3+build.4' }));
  assert.equal(index.plugins[0].versions[0].version, '1.2.3+build.4');
  await assert.rejects(buildIndex(config, fixture({ version: 'v1.2.3' })), /exact valid/);
});
test('explicit DSH range retains wildcard and prerelease semantics', () => {
  assert.deepEqual(dshEngines({ engines: { dsh: ' 0.2.x ' } }), { dsh: '0.2.x' });
});
test('bilingual editorial descriptions and categories survive official validation', async () => {
  const catalog = { ...config, metadata: { categories: { tools: { title: { en: 'Tools', zh: '工具' } } } }, packages: [{ ...config.packages[0], title: { en: 'Example', zh: '示例' }, description: { en: 'A useful tool.', zh: '一个工具。' }, category: 'tools' }] };
  const { index } = await buildIndex(catalog, fixture());
  const entry = parseMarketIndex(index, 'https://example.org/index.json').plugins[0];
  assert.equal(entry.title.zh, '示例');
  assert.equal(entry.metadata.category, 'tools');
  await assert.rejects(buildIndex({ ...catalog, metadata: {} }, fixture()), /undeclared/);
});
test('temporary HTTP failures retry but missing packages fail immediately', async () => {
  let calls = 0;
  const bytes = await download('https://registry.npmjs.org/test', { retryDelayMs: 0, fetchImpl: async () => ++calls < 3 ? new Response('busy', { status: 503 }) : new Response('ok') });
  assert.equal(bytes.toString(), 'ok');
  assert.equal(calls, 3);
  calls = 0;
  await assert.rejects(download('https://registry.npmjs.org/test', { retryDelayMs: 0, fetchImpl: async () => { calls++; return new Response('missing', { status: 404 }); } }), /404/);
  assert.equal(calls, 1);
});
test('source policy prevents a package without repository and license from publishing', async () => {
  await assert.rejects(buildIndex({ ...config, requireSourceMetadata: true }, fixture()), /repository and declared license/);
});
test('repository metadata preserves package directories and strips git transport details', () => {
  assert.deepEqual(repositoryFrom({ repository: { url: 'git+https://github.com/example/plugin.git#main', directory: 'packages/plugin' } }), { url: 'https://github.com/example/plugin', directory: 'packages/plugin' });
  assert.equal(repositoryFrom({ repository: 'github:example/plugin' }).url, 'https://github.com/example/plugin');
  assert.equal(repositoryFrom({ repository: 'file:///private/path' }), undefined);
});
test('single peer ranges retain wildcard and prerelease semantics', () => {
  assert.deepEqual(dshEngines({ peerDependencies: { '@deepseek-ai/dsh': '0.2.x' } }), { dsh: '0.2.x' });
  assert.doesNotThrow(() => dshEngines({ peerDependencies: { '@deepseek-ai/dsh': '0.2.x', '@deepseek-ai/dsh-core': '>=0.2.0-rc.1 <0.2.0' } }));
});
test('reviewed repositories are tied to an exact release, integrity and source commit', () => {
  const review = { version: '1.2.3', url: 'https://github.com/example/plugin', commit: 'a'.repeat(40), integrity: 'sha512-fixture' };
  const input = { version: '1.2.3', repositoryReview: review };
  const result = resolveRepository({}, input, '1.2.3', 'sha512-fixture');
  assert.equal(result.provenance, 'review');
  assert.equal(result.repository.url, review.url);
  assert.equal(result.review.evidence, `${review.url}/blob/${review.commit}/package.json`);
  assert.throws(() => resolveRepository({}, { repositoryReview: review }, '1.2.3', 'sha512-fixture'), /pinned/);
  assert.throws(() => resolveRepository({}, input, '1.2.4', 'sha512-fixture'), /pinned/);
  assert.throws(() => resolveRepository({}, input, '1.2.3', 'sha512-changed'), /integrity/);
  assert.throws(() => resolveRepository({ repository: 'https://github.com/other/plugin' }, input, '1.2.3', 'sha512-fixture'), /conflicts/);
  for (const url of ['http://github.com/example/plugin', 'https://secret@github.com/example/plugin', 'https://github.com/example/plugin?x=1', 'https://evil.example/example/plugin']) {
    assert.throws(() => resolveRepository({}, { ...input, repositoryReview: { ...review, url } }, '1.2.3', 'sha512-fixture'), /canonical/);
  }
  assert.throws(() => resolveRepository({}, { ...input, repositoryReview: { ...review, commit: 'main' } }, '1.2.3', 'sha512-fixture'), /immutable/);
});
test('source reviews are disclosed by collectPackage after archive verification', async () => {
  const source = fixture();
  const metadata = await (await source.fetchImpl('https://registry.npmjs.org/example', { redirect: 'error' })).json();
  const input = { ...config.packages[0], version: '1.2.3', repositoryReview: { version: '1.2.3', url: 'https://github.com/example/plugin', commit: 'a'.repeat(40), integrity: metadata.versions['1.2.3'].dist.integrity } };
  const result = await collectPackage(input, source);
  assert.equal(result.entry.repository.url, input.repositoryReview.url);
  assert.equal(result.evidence.repositorySource, 'review');
  assert.equal(result.evidence.repositoryReview.commit, 'a'.repeat(40));
});
test('publication time comes from registry rather than generation time', async () => {
  await assert.rejects(collectPackage(config.packages[0], { ...fixture(), now: 0 }), /publication date/);
});
