import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');

async function readUrl(url, fetchImpl, maxBytes = 8 * 1024 * 1024) {
  const response = await fetchImpl(url, {redirect: 'error', signal: AbortSignal.timeout(30000)});
  if (!response.ok || !response.body) throw new Error('HTTP ' + response.status + ': ' + url);
  const chunks = [];
  let length = 0;
  for await (const chunk of response.body) {
    length += chunk.length;
    if (length > maxBytes) throw new Error('Response exceeds byte limit: ' + url);
    chunks.push(chunk);
  }
  return {bytes: Buffer.concat(chunks), type: response.headers.get('content-type') ?? ''};
}

/** Check the deployed catalog and every referenced author icon, without redirects. */
export async function checkPublished(indexUrl, {expectedNames, fetchImpl = fetch, brandAssets = []} = {}) {
  const raw = await readUrl(indexUrl, fetchImpl);
  if (!/application\/json/i.test(raw.type)) throw new Error('Index is not served as JSON');
  const index = JSON.parse(raw.bytes);
  if (index.format !== 1 || !Array.isArray(index.plugins) || !index.plugins.length) throw new Error('Missing format-1 plugins');
  const names = index.plugins.map(plugin => plugin.name);
  if (new Set(names).size !== names.length) throw new Error('Published package names are duplicated');
  if (expectedNames && JSON.stringify([...names].sort()) !== JSON.stringify([...expectedNames].sort())) throw new Error('Published catalog differs from the source allowlist');
  const status = JSON.parse((await readUrl(new URL('status.json', indexUrl), fetchImpl)).bytes);
  for (const plugin of index.plugins) {
    const record = status.packages?.find(item => item.name === plugin.name);
    if (!record || record.version !== plugin.versions?.[0]?.version || !record.checks?.includes('sha512-integrity') || !record.checks.includes('bundle-patch-present')) throw new Error('Missing package evidence: ' + plugin.name);
  }
  const icons = [...new Set(index.plugins.map(plugin => plugin.icon).filter(Boolean))];
  let next = 0;
  await Promise.all(Array.from({length: Math.min(8, icons.length)}, async () => {
    while (next < icons.length) {
      const icon = icons[next++];
      const match = /^icons\/([a-f0-9]{64})\.(svg|png|jpg|webp)$/.exec(icon);
      if (!match) throw new Error('Unexpected icon path: ' + icon);
      const result = await readUrl(new URL(icon, indexUrl), fetchImpl, 256 * 1024);
      const type = {svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp'}[match[2]];
      if (!result.type.toLowerCase().startsWith(type)) throw new Error('Unexpected icon content type: ' + icon);
      if (digest(result.bytes) !== match[1]) throw new Error('Icon hash mismatch: ' + icon);
    }
  }));
  for (const language of ['', 'zh/']) {
    const page = (await readUrl(new URL(language || './', indexUrl), fetchImpl)).bytes.toString('utf8');
    const rows = page.match(/\bdata-plugin(?=[\s>])/g) ?? [];
    if (rows.length !== index.plugins.length || !page.includes('assets/logo-256.png')) throw new Error('Website does not match published index: ' + language);
  }
  for (const asset of brandAssets) {
    const published = await readUrl(new URL('assets/' + asset.name, indexUrl), fetchImpl, 2 * 1024 * 1024);
    if (digest(published.bytes) !== digest(asset.bytes)) throw new Error('Brand asset differs from this release: ' + asset.name);
  }
  return {plugins: index.plugins.length, pluginsWithIcons: index.plugins.filter(plugin => plugin.icon).length, uniqueIcons: icons.length, brandAssets: brandAssets.length, indexUrl: String(indexUrl), redirectedRequests: false};
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const indexUrl = process.argv[2] ?? 'https://polang233.github.io/dsh-plugin-index/index.json';
  const config = JSON.parse(await readFile(new URL('../sources.json', import.meta.url), 'utf8'));
  const brandAssets = await Promise.all(['logo.png', 'logo-256.png', 'favicon.png', 'apple-touch-icon.png', 'social.png'].map(async name => ({name, bytes: await readFile(new URL('../site/' + name, import.meta.url))})));
  const result = await checkPublished(indexUrl, {expectedNames: config.packages.map(input => input.name), brandAssets});
  console.log(JSON.stringify(result));
}
