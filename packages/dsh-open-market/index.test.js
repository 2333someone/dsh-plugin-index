import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ensureIndex, INDEX_URL } from './index.js';

function market(urls = []) {
  return {
    urls,
    listIndexes() { return this.urls.map(url => ({ url })); },
    async setIndexes(next) { this.urls = next; }
  };
}

test('adds the index after existing sources and records the profile marker', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opm-'));
  const fake = market(['https://example.org/index.json']);
  assert.equal(await ensureIndex(fake, { dir }), 'added');
  assert.deepEqual(fake.urls, ['https://example.org/index.json', INDEX_URL]);
  assert.deepEqual(JSON.parse(await readFile(join(dir, '.dsh-open-market.json'), 'utf8')).added, [INDEX_URL]);
});

test('respects a source the user removed after the first setup', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'opm-'));
  const fake = market();
  await ensureIndex(fake, { dir });
  fake.urls = [];
  assert.equal(await ensureIndex(fake, { dir }), 'skipped');
  assert.deepEqual(fake.urls, []);
});

test('does not duplicate an index that is already configured', async () => {
  const fake = market([INDEX_URL]);
  fake.setIndexes = () => assert.fail('should not rewrite sources');
  assert.equal(await ensureIndex(fake, {}), 'present');
});

test('treats the earlier github.io address as the same index', async () => {
  const fake = market(['https://polang233.github.io/dsh-plugin-index/index.json']);
  fake.setIndexes = () => assert.fail('should not add a second copy');
  assert.equal(await ensureIndex(fake, {}), 'present');
});
