import {createHash} from 'node:crypto';
import {githubRepository} from './github.mjs';

const DAY = 86_400_000;
const KEY = 'recommended';
const age = (timestamp, now) => Number.isFinite(timestamp) && timestamp <= now ? (now - timestamp) / DAY : Infinity;

/** Balance recent maintenance with category and developer exposure; popularity has a bounded influence. */
export function recommendIndex(index, {github = {}, now = Date.now()} = {}) {
  const week = Math.floor(now / (7 * DAY));
  const candidates = index.plugins.map(plugin => {
    const repo = githubRepository(plugin.repository?.url);
    const record = github.repositories?.[repo?.key];
    const observed = record && ['ok', 'stale'].includes(record.status);
    const published = plugin.versions[0]?.publishTimestamp * 1000;
    const pushed = observed ? Date.parse(record.pushedAt) : NaN;
    const maintained = Number.isFinite(pushed) && pushed <= now ? pushed : published;
    const stars = observed && Number.isSafeInteger(record.stars) && record.stars >= 0 ? record.stars : 0;
    const rotation = createHash('sha256').update(week + ':' + plugin.name).digest().readUInt32BE(0) / 0xffffffff;
    return {
      plugin,
      developer: repo?.key.split('/')[0] ?? plugin.author?.trim().toLowerCase() ?? plugin.name,
      category: plugin.metadata?.category ?? 'other',
      score: 0.65 * Math.exp(-age(maintained, now) / 45)
        + 0.15 * Math.exp(-age(published, now) / 30)
        + 0.2 * Math.log1p(Math.min(stars, 1000)) / Math.log1p(1000)
        + 0.08 * rotation - (observed && record.archived ? 2 : 0)
    };
  });
  const developers = new Map(), categories = new Map(), ordered = [];
  const score = item => item.score - 0.55 * (developers.get(item.developer) ?? 0) - 0.15 * (categories.get(item.category) ?? 0);
  while (candidates.length) {
    candidates.sort((a, b) => score(b) - score(a) || (a.plugin.name < b.plugin.name ? -1 : a.plugin.name > b.plugin.name ? 1 : 0));
    const chosen = candidates.shift();
    ordered.push(chosen.plugin);
    developers.set(chosen.developer, (developers.get(chosen.developer) ?? 0) + 1);
    categories.set(chosen.category, (categories.get(chosen.category) ?? 0) + 1);
  }
  return {
    ...index,
    metadata: {...index.metadata, sortKeys: {...index.metadata?.sortKeys, [KEY]: {title: {en: 'Recommended', zh: '推荐排序'}, order: 'desc'}}},
    plugins: ordered.map((plugin, position) => ({...plugin, metadata: {...plugin.metadata, sortKeys: {...plugin.metadata?.sortKeys, [KEY]: ordered.length - position}}}))
  };
}
