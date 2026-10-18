window.__ModuleLoader__.load({id:"@polang233/dsh-market-listing-ui",factory:()=>{
const SELECTOR = '[data-plugin-tab="discover"] [data-market-entry]';
const MARK = 'data-opm-original';
const CSS = `
[data-market-entry] [data-opm-original]{display:none!important}
.opm-description{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.opm-metrics{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:5px;font-size:12px;line-height:18px}
.opm-metric{display:inline-flex;align-items:center;padding:2px 7px;border-radius:5px;font-variant-numeric:tabular-nums;font-weight:500}
.opm-star{color:light-dark(#2458ad,#a7c8ff);background:light-dark(#eaf1ff,#21324d)}
.opm-download{color:light-dark(#22734b,#9bdfba);background:light-dark(#e7f5ed,#1f3a2d)}
.opm-age{color:light-dark(#685583,#cebee5);background:light-dark(#f0ecf6,#35303f)}
.opm-author{color:var(--dsw-alias-label-tertiary);margin-left:2px}
`;

/** Only recognize the index's explicit metric prefix; other market rows remain intact. */
function parseSummary(text) {
  const separator = text.indexOf(' — ');
  if (separator < 0) return undefined;
  const parts = text.slice(0, separator).split(' · ');
  const metrics = [];
  for (const part of parts) {
    let match = /^(★|↓) ([\d,]+)(?:\/30天|\/30d)?((?:（缓存 \d{4}-\d{2}-\d{2}）| \(cached \d{4}-\d{2}-\d{2}\))?)$/.exec(part);
    if (match) {
      metrics.push({ kind: match[1] === '★' ? 'star' : 'download', text: match[1] + ' ' + match[2], title: (match[1] === '★' ? 'GitHub stars' : 'npm downloads · 30 days') + match[3] });
      continue;
    }
    match = /^(?:◷ )?(今天更新|\d+ 天前更新|Updated today|Updated \d+ days? ago)$/.exec(part);
    if (!match) return undefined;
    metrics.push({ kind: 'age', text: '◷ ' + match[1], title: part });
  }
  if (!metrics.length || new Set(metrics.map(metric => metric.kind)).size !== metrics.length) return undefined;
  return { description: text.slice(separator + 3), metrics };
}

function mount(document) {
  const window = document.defaultView;
  const active = new Map();
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  let stopped = false, queued = false;
  const restore = state => {
    state.description.removeAttribute(MARK);
    state.meta.removeAttribute(MARK);
    state.clean.remove();
    state.metrics.remove();
  };
  const scan = () => {
    queued = false;
    if (stopped) return;
    observer.disconnect();
    for (const [row, state] of active) if (!row.isConnected) { restore(state); active.delete(row); }
    for (const row of document.querySelectorAll(SELECTOR)) {
      const main = row.children[1];
      if (!main || main.tagName !== 'DIV') continue;
      const spans = [...main.children].filter(node => node.tagName === 'SPAN' && !node.classList.contains('opm-description'));
      if (spans.length !== 2) continue;
      const [description, meta] = spans;
      const fingerprint = description.textContent + '\n' + meta.textContent;
      const previous = active.get(row);
      if (previous?.fingerprint === fingerprint && previous.clean.isConnected && previous.metrics.isConnected) continue;
      if (previous) { restore(previous); active.delete(row); }
      const parsed = parseSummary(description.textContent);
      if (!parsed) continue;
      const clean = document.createElement('span');
      clean.className = 'opm-description';
      clean.textContent = parsed.description;
      const metrics = document.createElement('div');
      metrics.className = 'opm-metrics';
      for (const metric of parsed.metrics) {
        const badge = document.createElement('span');
        badge.className = 'opm-metric opm-' + metric.kind;
        badge.textContent = metric.text;
        badge.title = metric.title;
        metrics.append(badge);
      }
      const authorParts = meta.textContent.split(' · ');
      if (authorParts.length >= 3) {
        const author = document.createElement('span');
        author.className = 'opm-author';
        author.textContent = authorParts.slice(1, -1).join(' · ');
        metrics.append(author);
      }
      description.setAttribute(MARK, '');
      meta.setAttribute(MARK, '');
      main.append(clean, metrics);
      active.set(row, { description, meta, clean, metrics, fingerprint });
    }
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  };
  const observer = new window.MutationObserver(records => {
    const relevant = records.some(record => record.target.nodeType === 1
      ? record.target.closest?.('[data-plugin-tab="discover"]') || [...record.addedNodes].some(node => node.nodeType === 1 && (node.matches?.('[data-plugin-tab="discover"]') || node.querySelector?.(SELECTOR)))
      : record.target.parentElement?.closest('[data-plugin-tab="discover"]'));
    if (!relevant || queued || stopped) return;
    queued = true;
    window.queueMicrotask(scan);
  });
  scan();
  return () => {
    stopped = true;
    observer.disconnect();
    for (const state of active.values()) restore(state);
    active.clear();
    style.remove();
  };
}

function apply(ctx) {
  ctx.effect(() => mount(document), 'Open Plugin Market: listing metric tags');
}

return {apply};
}});
