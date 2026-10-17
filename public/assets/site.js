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

const controls = document.querySelector('[data-filters]');
const search = document.querySelector('#plugin-search');
const category = document.querySelector('#plugin-category');
const rows = [...document.querySelectorAll('[data-plugin]')];
const count = document.querySelector('#result-count');
const empty = document.querySelector('#empty-results');
const reset = document.querySelector('[data-reset]');
const normalize = value => value.normalize('NFKC').toLocaleLowerCase().trim();

function filter() {
  const terms = normalize(search.value).split(/\s+/).filter(Boolean);
  let visible = 0;
  for (const row of rows) {
    const haystack = normalize(row.dataset.search);
    const matchesText = terms.every(term => haystack.includes(term));
    const matchesCategory = !category.value || (category.selectedOptions[0]?.hasAttribute('data-uncategorized') ? !row.dataset.category : row.dataset.category === category.value);
    row.hidden = !(matchesText && matchesCategory);
    if (!row.hidden) visible += 1;
  }
  count.textContent = text.results.replace('{count}', visible).replace('{total}', rows.length);
  empty.hidden = visible > 0;
}

if (controls && search && category) {
  controls.hidden = false;
  reset.hidden = false;
  search.addEventListener('input', filter);
  category.addEventListener('change', filter);
  controls.addEventListener('submit', event => event.preventDefault());
  reset.addEventListener('click', () => {
    search.value = '';
    category.value = '';
    filter();
    search.focus();
  });
  filter();
}
