import {createHash, randomInt} from 'node:crypto';
import {githubRepository} from './github.mjs';

const DAY = 86_400_000;
const KEY = 'recommended';
const age = (timestamp, now) => Number.isFinite(timestamp) && timestamp <= now ? (now - timestamp) / DAY : Infinity;

/**
 * Blend momentum (maintenance, download and star growth, releases, newness) with trust and reach (verification by
 * other markets, downloads, stars). Momentum carries most of the weight, and repeated developers or categories are
 * pushed down, so small projects that are moving get seen next to established ones.
 */
export function recommendIndex(index, {github = {}, signals = {}, now = Date.now(), randomIntImpl = randomInt} = {}) {
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
    const signal = signals[plugin.name] ?? {};
    const growth = Number.isFinite(signal.growth) ? Math.min(1, Math.max(0, Math.log2(signal.growth) / 2)) : 0;
    const cadence = Math.min(1, (signal.releases30 ?? 0) / 20);
    const fresh = Number.isFinite(signal.ageDays) ? Math.exp(-signal.ageDays / 14) : 0;
    const starGrowth = signal.starsWeek > 0 ? Math.min(1, Math.log1p(signal.starsWeek) / Math.log1p(50)) : 0;
    const reach = Math.log1p(Math.min(signal.downloads ?? 0, 100_000)) / Math.log1p(100_000);
    const verified = signal.verifiedBy?.length ? 1 : signal.listedBy?.length ? 0.5 : 0;
    return {
      plugin,
      developer: repo?.key.split('/')[0] ?? plugin.author?.trim().toLowerCase() ?? plugin.name,
      category: plugin.metadata?.category ?? 'other',
      score: 0.25 * Math.exp(-age(maintained, now) / 30)
        + 0.07 * Math.exp(-age(published, now) / 30)
        + 0.12 * growth
        + 0.1 * starGrowth
        + 0.08 * cadence
        + 0.07 * fresh
        + 0.08 * verified
        + 0.1 * reach
        + 0.08 * Math.log1p(Math.min(stars, 5000)) / Math.log1p(5000)
        + 0.05 * rotation - (observed && record.archived ? 2 : 0)
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
  // Fisher–Yates gives every complete permutation equal probability, independent of recommendation signals.
  const shuffled = [...ordered];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomIntImpl(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const randomRanks = new Map(shuffled.map((plugin, position) => [plugin.name, shuffled.length - position]));
  return {
    ...index,
    metadata: {...index.metadata, sortKeys: {...index.metadata?.sortKeys, [KEY]: {title: {en: '✨ Smart picks', zh: '✨ 智能推荐'}, order: 'desc'}, 'random-resources': {title: {en: 'Random resources', zh: '随机资源'}, order: 'desc'}}},
    plugins: ordered.map((plugin, position) => ({...plugin, metadata: {...plugin.metadata, sortKeys: {...plugin.metadata?.sortKeys, [KEY]: ordered.length - position, 'random-resources': randomRanks.get(plugin.name)}}}))
  };
}

/**
 * DSH's "Default" sort is the index order. It favors reach and trust: downloads, stars, a logo and verification,
 * with a light touch of recent maintenance and the same developer spread as the recommendations.
 */
export function orderByDefault(index, {github = {}, signals = {}, now = Date.now()} = {}) {
  const week = Math.floor(now / (7 * DAY));
  const candidates = index.plugins.map(plugin => {
    const repo = githubRepository(plugin.repository?.url);
    const record = github.repositories?.[repo?.key];
    const observed = record && ['ok', 'stale'].includes(record.status);
    const signal = signals[plugin.name] ?? {};
    const stars = observed && Number.isSafeInteger(record.stars) && record.stars >= 0 ? record.stars : 0;
    const pushed = observed ? Date.parse(record.pushedAt) : NaN;
    const maintained = Number.isFinite(pushed) && pushed <= now ? pushed : plugin.versions[0]?.publishTimestamp * 1000;
    const rotation = createHash('sha256').update('default:' + week + ':' + plugin.name).digest().readUInt32BE(0) / 0xffffffff;
    return {
      plugin,
      developer: repo?.key.split('/')[0] ?? plugin.author?.trim().toLowerCase() ?? plugin.name,
      score: 0.32 * Math.log1p(Math.min(signal.downloads ?? 0, 100_000)) / Math.log1p(100_000)
        + 0.28 * Math.log1p(Math.min(stars, 5000)) / Math.log1p(5000)
        + 0.15 * (plugin.icon ? 1 : 0)
        + 0.1 * (signal.verifiedBy?.length ? 1 : signal.listedBy?.length ? 0.5 : 0)
        + 0.1 * Math.exp(-age(maintained, now) / 60)
        + 0.05 * rotation - (observed && record.archived ? 2 : 0)
    };
  });
  const developers = new Map(), ordered = [];
  const score = item => item.score - 0.3 * (developers.get(item.developer) ?? 0);
  while (candidates.length) {
    candidates.sort((a, b) => score(b) - score(a) || (a.plugin.name < b.plugin.name ? -1 : a.plugin.name > b.plugin.name ? 1 : 0));
    const chosen = candidates.shift();
    ordered.push(chosen.plugin);
    developers.set(chosen.developer, (developers.get(chosen.developer) ?? 0) + 1);
  }
  return {...index, plugins: ordered};
}
