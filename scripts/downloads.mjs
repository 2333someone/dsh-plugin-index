const DAY = 86_400_000;
const MAX_CACHE_AGE = 7 * DAY;
const validCount = value => Number.isSafeInteger(value) && value >= 0;
const date = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const timestamp = Date.parse(value + 'T00:00:00Z');
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value ? timestamp : NaN;
};
const endpoint = names => 'https://api.npmjs.org/downloads/range/last-month/' + names.map(name => name.split('/').map(encodeURIComponent).join('/')).join(',');

/** Collapse npm's daily range into the 30-day total plus the last 7 days, which feeds growth signals. */
function summarize(value) {
  if (!value || !Array.isArray(value.downloads)) return value;
  const days = value.downloads.filter(day => validCount(day?.downloads)).sort((a, b) => a.day < b.day ? -1 : a.day > b.day ? 1 : 0);
  if (days.length !== value.downloads.length) return { ...value, downloads: -1 };
  const total = days.reduce((sum, day) => sum + day.downloads, 0);
  const week = days.slice(-7).reduce((sum, day) => sum + day.downloads, 0);
  return { package: value.package, downloads: total, week, start: value.start, end: value.end };
}
const keep = record => ({ package: record.package, downloads: record.downloads, ...(validCount(record.week) ? { week: record.week } : {}), start: record.start, end: record.end });

function validRecord(value, name, now) {
  if (!value || value.package !== name || !validCount(value.downloads)) return false;
  const start = date(value.start), end = date(value.end);
  return Number.isFinite(start) && Number.isFinite(end) && end - start === 29 * DAY && end < now && now - end <= 10 * DAY;
}

async function readCounts(names, fetchImpl, now) {
  let response;
  for (let attempt = 0; attempt < 2; attempt++) {
    response = await fetchImpl(endpoint(names), { redirect: 'error', signal: AbortSignal.timeout(15_000) });
    if (![429, 503].includes(response.status) || attempt === 1) break;
    const seconds = Number(response.headers.get('retry-after'));
    await response.body?.cancel();
    await new Promise(resolve => setTimeout(resolve, Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds * 1000, 10_000) : 2_000));
  }
  if (!response.ok || !response.body) {
    await response.body?.cancel();
    throw new Error('HTTP ' + response.status);
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > 256 * 1024) throw new Error('Response too large');
    chunks.push(chunk);
  }
  const body = JSON.parse(Buffer.concat(chunks));
  const records = names.length === 1 ? { [names[0]]: body } : body;
  return Object.fromEntries(names.map(name => {
    const record = summarize(records?.[name]);
    return [name, validRecord(record, name, now) ? record : undefined];
  }));
}

/** npm counts are package downloads over the last 30 available days, not DSH installs. */
export async function collectDownloads(index, { fetchImpl = fetch, previous = {}, now = Date.now(), concurrency = 2 } = {}) {
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 8) throw new Error('Download concurrency must be between 1 and 8');
  const names = [...new Set(index.plugins.filter(plugin => plugin.versions.some(version => version.source.type === 'npm')).map(plugin => plugin.name))].sort();
  const packages = {};
  // npm aggregates daily. Reuse a successful recent reading without inventing a new fetch date.
  const pending = names.filter(name => {
    const cached = previous.packages?.[name], fetched = Date.parse(cached?.fetchedAt);
    if (cached?.status !== 'ok' || !validRecord(cached, name, now) || !validCount(cached.week) || cached.week > cached.downloads
      || !Number.isFinite(fetched) || fetched > now || now - fetched > 4 * 60 * 60 * 1000) return true;
    packages[name] = { ...keep(cached), fetchedAt: cached.fetchedAt, source: endpoint([name]), status: 'ok' };
    return false;
  });
  const plain = pending.filter(name => !name.startsWith('@'));
  const batches = pending.filter(name => name.startsWith('@')).map(name => [name]);
  for (let offset = 0; offset < plain.length; offset += 20) batches.push(plain.slice(offset, offset + 20));
  const timestamp = new Date(now).toISOString();
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, batches.length) }, async () => {
    while (next < batches.length) {
      const batch = batches[next++];
      let records = {}, error;
      try { records = await readCounts(batch, fetchImpl, now); }
      catch (cause) { error = cause instanceof Error && /^HTTP \d+$/.test(cause.message) ? cause.message : 'npm downloads request failed'; }
      for (const name of batch) {
        const record = records[name];
        const source = endpoint([name]);
        if (record) {
          packages[name] = { ...keep(record), source, status: 'ok', fetchedAt: timestamp };
          continue;
        }
        const cached = previous.packages?.[name];
        const fetched = Date.parse(cached?.fetchedAt);
        const usable = ['ok', 'stale'].includes(cached?.status) && validRecord(cached, name, now) && Number.isFinite(fetched) && fetched <= now && now - fetched <= MAX_CACHE_AGE;
        packages[name] = usable
          ? { ...keep(cached), fetchedAt: cached.fetchedAt, source, status: 'stale', attemptedAt: timestamp, error: error ?? 'Invalid npm download record' }
          : { package: name, source, status: 'unavailable', attemptedAt: timestamp, error: error ?? 'Invalid npm download record' };
      }
    }
  }));
  return { schema: 1, period: 'last-month', generatedAt: timestamp, packages: Object.fromEntries(names.map(name => [name, packages[name]])) };
}
