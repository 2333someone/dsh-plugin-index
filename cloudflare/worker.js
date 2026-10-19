// Serves the built site from static assets and counts reads of index.json.
// A "read" is one fetch of the index, which DSH makes when Discover loads or refreshes this market.
// Daily unique readers are counted by a salted hash of IP and user agent; neither is stored.

const COUNTED = new Set(['/index.json']);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/stats.json') return stats(env);
    const response = await env.ASSETS.fetch(request);
    const own = request.headers.get('user-agent') === 'dshopen-check';
    if (COUNTED.has(url.pathname) && request.method === 'GET' && response.ok && !own) ctx.waitUntil(count(request, env));
    return response;
  }
};

async function count(request, env) {
  const day = new Date().toISOString().slice(0, 10);
  const visitor = `${request.headers.get('cf-connecting-ip') ?? ''}|${request.headers.get('user-agent') ?? ''}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${env.STATS_SALT ?? 'dshopen'}|${day}|${visitor}`));
  const hash = [...new Uint8Array(digest).slice(0, 12)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  const seen = await env.DB.prepare('INSERT OR IGNORE INTO visitors (day, hash) VALUES (?, ?)').bind(day, hash).run();
  const unique = seen.meta.changes > 0 ? 1 : 0;
  await env.DB.prepare('INSERT INTO reads (day, reads, readers) VALUES (?, 1, ?) ON CONFLICT(day) DO UPDATE SET reads = reads + 1, readers = readers + ?')
    .bind(day, unique, unique).run();
  // Hashes are only needed for the current day; prune older ones now and then.
  if (Math.random() < 0.01) await env.DB.prepare('DELETE FROM visitors WHERE day < ?').bind(day).run();
}

async function stats(env) {
  const today = new Date().toISOString().slice(0, 10);
  const since = new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10);
  const [total, recent] = await env.DB.batch([
    env.DB.prepare('SELECT COALESCE(SUM(reads), 0) AS reads FROM reads'),
    env.DB.prepare('SELECT day, reads, readers FROM reads WHERE day >= ? ORDER BY day').bind(since)
  ]);
  const days = recent.results;
  const sum = key => days.reduce((value, row) => value + row[key], 0);
  const todayRow = days.find(row => row.day === today) ?? { reads: 0, readers: 0 };
  const body = {
    schema: 1,
    note: 'Reads of index.json, made when DSH loads or refreshes this market. Readers are distinct IP and user agent pairs per day.',
    total: total.results[0].reads,
    today: { reads: todayRow.reads, readers: todayRow.readers },
    last30Days: { reads: sum('reads'), readers: sum('readers'), daily: days }
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300', 'access-control-allow-origin': '*' }
  });
}
