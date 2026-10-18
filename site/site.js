const copyButton = document.querySelector('[data-copy]');
const indexInput = document.querySelector('#index-url');
const copyStatus = document.querySelector('#copy-status');
const text = JSON.parse(document.querySelector('#site-messages').textContent);

if (copyButton && indexInput) {
  copyButton.hidden = false;
  copyButton.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(indexInput.value);
      copyButton.querySelector('span').textContent = text.copied;
      copyStatus.textContent = text.copySuccess;
    } catch {
      copyButton.querySelector('span').textContent = text.copy;
      indexInput.focus();
      indexInput.select();
      indexInput.setSelectionRange(0, indexInput.value.length);
      copyStatus.textContent = text.copyFailure;
    }
  });
  indexInput.addEventListener('click', () => indexInput.select());
}

const PAGE_SIZE = 24;
const controls = document.querySelector('[data-filters]');
const search = document.querySelector('#plugin-search');
const chips = [...document.querySelectorAll('[data-chip]')];
const rows = [...document.querySelectorAll('[data-plugin]')];
const count = document.querySelector('#result-count');
const empty = document.querySelector('#empty-results');
const reset = document.querySelector('[data-reset]');
const moreWrap = document.querySelector('[data-more-wrap]');
const moreButton = document.querySelector('[data-more]');
const progress = document.querySelector('[data-progress]');
const bar = document.querySelector('[data-bar]');
const sentinel = document.querySelector('[data-sentinel]');
const normalize = value => value.normalize('NFKC').toLocaleLowerCase().trim();
const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key]);

let category = '';
let limit = PAGE_SIZE;
let matches = rows;
let auto = false;

// Show the first `limit` matches; the rest stay hidden until the reader asks for more.
function render() {
  matches.forEach((row, at) => { row.hidden = at >= limit; });
  const shown = Math.min(limit, matches.length);
  count.textContent = fill(text.results, { count: matches.length, total: rows.length });
  empty.hidden = matches.length > 0;
  moreWrap.hidden = matches.length <= shown;
  if (!moreWrap.hidden) {
    progress.textContent = fill(text.shown, { shown, count: matches.length });
    bar.style.width = `${Math.round(shown / matches.length * 100)}%`;
    moreButton.textContent = fill(text.more, { n: Math.min(PAGE_SIZE, matches.length - shown) });
  }
}

function filter() {
  const terms = normalize(search.value).split(/\s+/).filter(Boolean);
  const uncategorized = category === '__uncategorized__';
  const hit = new Set();
  for (const row of rows) {
    const haystack = normalize(row.dataset.search);
    const textOk = terms.every(term => haystack.includes(term));
    const categoryOk = !category || (uncategorized ? !row.dataset.category : row.dataset.category === category);
    if (textOk && categoryOk) hit.add(row);
    else row.hidden = true;
  }
  matches = rows.filter(row => hit.has(row));
  limit = PAGE_SIZE;
  render();
}

function showMore() {
  if (limit >= matches.length) return;
  limit += PAGE_SIZE;
  render();
}

if (controls && search && chips.length && moreWrap) {
  controls.hidden = false;
  reset.hidden = false;
  search.addEventListener('input', filter);
  controls.addEventListener('submit', event => event.preventDefault());
  const select = value => {
    category = value;
    chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.chip === value)));
    filter();
  };
  chips.forEach(chip => chip.addEventListener('click', () => select(chip.dataset.chip)));
  reset.addEventListener('click', () => {
    search.value = '';
    select('');
    search.focus();
  });
  // The button comes first; after the first click, scrolling reveals further batches on its own.
  moreButton.addEventListener('click', () => { auto = true; showMore(); });
  // Reveal the next batch shortly before the end of the list.
  if ('IntersectionObserver' in window) {
    const watcher = new IntersectionObserver(entries => {
      if (auto && entries.some(entry => entry.isIntersecting)) {
        showMore();
        watcher.unobserve(sentinel);
        requestAnimationFrame(() => watcher.observe(sentinel));
      }
    }, { rootMargin: '0px 0px 240px 0px' });
    watcher.observe(sentinel);
  }
  select('');
}