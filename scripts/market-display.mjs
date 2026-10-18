import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index';
import { githubRepository, applyGitHubStars } from './github.mjs';
import { recommendIndex } from './recommendations.mjs';

const DAY = 86_400_000;
const measured = value => value && ['ok', 'stale'].includes(value.status);
const count = value => Number.isSafeInteger(value) && value >= 0;
const sortId = 'npm-downloads-month';

export function releaseAge(timestamp, now, language) {
  if (!Number.isFinite(timestamp) || timestamp < 0 || timestamp * 1000 > now) return undefined;
  const days = Math.floor((now - timestamp * 1000) / DAY);
  return language === 'zh' ? (days === 0 ? '今天更新' : `${days} 天前更新`) : (days === 0 ? 'Updated today' : `Updated ${days} ${days === 1 ? 'day' : 'days'} ago`);
}

/** Compose supported description text; DSH renders it in each real Discover row. */
export function marketSummary(plugin, github, downloads, now, language) {
  const repo = github.repositories?.[githubRepository(plugin.repository?.url)?.key];
  const npm = downloads.packages?.[plugin.name];
  const parts = [];
  const format = value => new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : 'en-US').format(value);
  const cached = record => record.status === 'stale' ? (language === 'zh' ? `（缓存 ${record.fetchedAt.slice(0, 10)}）` : ` (cached ${record.fetchedAt.slice(0, 10)})`) : '';
  if (measured(repo) && count(repo.stars)) parts.push(`★ ${format(repo.stars)}${cached(repo)}`);
  if (measured(npm) && count(npm.downloads)) parts.push(`↓ ${format(npm.downloads)}${cached(npm)}`);
  const age = releaseAge(plugin.versions[0]?.publishTimestamp, now, language);
  if (age) parts.push('◷ ' + age);
  return parts.join(' · ');
}

function publisherFor(plugin, publishers) {
  const repo = githubRepository(plugin.repository?.url)?.key;
  return publishers.entries.find(entry => entry.packages.includes(plugin.name) && githubRepository(entry.repository)?.key === repo);
}

/** Identity claims bind an exact package to a reviewed repository, never just an npm prefix. */
export function validatePublishers(publishers) {
  const ids = new Set(), names = new Set();
  if (publishers.schema !== 1 || !Array.isArray(publishers.entries)) throw new Error('Invalid publisher evidence');
  for (const entry of publishers.entries) {
    if (!/^[a-z0-9-]+$/.test(entry.id) || ids.has(entry.id) || !['company', 'developer'].includes(entry.kind) || !githubRepository(entry.repository) || !entry.title?.en || !entry.title?.zh || !Number.isFinite(Date.parse(entry.reviewedAt)) || !entry.evidence?.length || !entry.packages?.length) throw new Error('Invalid publisher identity: ' + entry.id);
    ids.add(entry.id);
    for (const url of entry.evidence) if (!URL.canParse(url) || new URL(url).protocol !== 'https:') throw new Error('Invalid publisher source');
    for (const name of entry.packages) {
      if (names.has(name)) throw new Error('Repeated publisher package: ' + name);
      names.add(name);
    }
  }
}

export function applyMarketDisplay(index, { github = {}, downloads = {}, publishers = { schema: 1, entries: [] }, now = Date.now() } = {}) {
  validatePublishers(publishers);
  const starred = applyGitHubStars(index, github);
  const metadata = { ...starred.metadata, labels: { ...starred.metadata?.labels }, sortKeys: { ...starred.metadata?.sortKeys } };
  for (const id of Object.keys(metadata.labels)) if (id.startsWith('publisher-')) delete metadata.labels[id];
  delete metadata.sortKeys[sortId];
  const display = { schema: 1, generatedAt: new Date(now).toISOString(), plugins: {} };
  let withDownloads = 0;
  const plugins = starred.plugins.map(plugin => {
    const labels = (plugin.metadata?.labels ?? []).filter(id => !id.startsWith('publisher-'));
    const publisher = publisherFor(plugin, publishers);
    if (publisher) {
      const id = 'publisher-' + publisher.id;
      metadata.labels[id] = { title: publisher.title };
      labels.push(id);
    }
    const summary = Object.fromEntries(['en', 'zh'].map(language => [language, marketSummary(plugin, github, downloads, now, language)]));
    const description = typeof plugin.description === 'string' ? { en: plugin.description, zh: plugin.description } : { ...plugin.description };
    const composed = Object.fromEntries(Object.entries(description).map(([language, value]) => [language, (summary[language.startsWith('zh') ? 'zh' : 'en'] ? summary[language.startsWith('zh') ? 'zh' : 'en'] + ' — ' : '') + value]));
    // Plugins without authored text still receive the measured row summary.
    for (const language of ['en', 'zh']) if (!composed[language] && summary[language]) composed[language] = summary[language];
    const sortKeys = { ...plugin.metadata?.sortKeys };
    delete sortKeys[sortId];
    const npm = downloads.packages?.[plugin.name];
    if (measured(npm) && count(npm.downloads)) { sortKeys[sortId] = npm.downloads; withDownloads++; }
    display.plugins[plugin.name] = { description, summary, ...(publisher ? { publisher: publisher.id } : {}) };
    return { ...plugin, ...(Object.keys(composed).length ? { description: composed } : {}), metadata: { ...plugin.metadata, labels, sortKeys } };
  });
  if (withDownloads) metadata.sortKeys[sortId] = { title: { en: 'npm downloads (30 days)', zh: 'npm 近 30 天下载量' }, order: 'desc' };
  const result = recommendIndex({ ...starred, metadata, plugins }, {github, now});
  parseMarketIndex(result, 'https://polang233.github.io/dsh-plugin-index/index.json');
  return { index: result, display };
}
