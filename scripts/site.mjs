import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { githubRepository } from './github.mjs';

const ORIGIN = 'https://polang233.github.io/dsh-plugin-index/';
const INDEX_URL = `${ORIGIN}index.json`;
const REPOSITORY = 'https://github.com/polang233/dsh-plugin-index';
const DOCS = `${REPOSITORY}#readme`;
const SUBMIT = `${REPOSITORY}/issues/new?template=plugin.yml`;
const source = new URL('../site/', import.meta.url);
const output = new URL('../public/', import.meta.url);

const COPY = {
  en: {
    lang: 'en', locale: 'en_US', title: 'DSH Plugin Index — Add one URL to DSH',
    description: 'A community plugin index for DeepSeek Harness. Copy one URL into DSH, browse the directory, and choose the plugins you need.',
    skip: 'Skip to content', plugins: 'Plugins', docs: 'Docs', language: 'Language',
    headline: 'Add one URL<br>to DSH.', intro: 'Browse community plugins in DeepSeek Harness. Add this index to the built-in plugin market.',
    address: 'Index URL', copy: 'Copy URL', copyHint: 'Add this address in Plugins → Discover → Add index source.',
    copied: 'Copied', copySuccess: 'URL copied. Open DSH and add it as an index source.', copyFailure: 'The address is selected. Press Ctrl+C or ⌘C, or use the selection menu to copy it.',
    setup: 'Connect the index', steps: [
      ['Open Plugins', 'In DeepSeek Harness, open Plugins and choose Discover.'],
      ['Add an index source', 'Choose Add index source, or open Manage index sources.'],
      ['Paste the URL', 'Add the address above, then browse and choose a plugin.']
    ], setupNote: 'No Discover tab? Enable the Custom plugin markets bundle first.',
    directory: 'Plugin directory', search: 'Search plugins', searchPlaceholder: 'Name, package or description', category: 'Category', all: 'All categories', other: 'Other',
    results: '{count} of {total} plugins', initialCount: count => `${count} ${count === 1 ? 'plugin' : 'plugins'}`,
    noResults: 'No matching plugins', noResultsHelp: 'Try another search or choose all categories.', reset: 'Clear filters',
    noJs: 'All plugins are listed below. Use your browser’s Find command to search this page.',
    noDescription: 'No description provided by the package author.', version: 'Version', source: 'Source', npm: 'npm package', website: 'Website', compatibility: 'DSH version requirement', noVersion: 'Version not listed',
    contributeTitle: 'Add a plugin to the index', contributeText: 'Have a useful DSH plugin? Send its package or repository link.', submit: 'Submit a plugin', readDocs: 'Read the docs',
    independent: 'An independent community project.', updated: 'Index updated', unknownDate: 'Update time unavailable',
    scope: 'Published-package checks do not replace an installation test or a code audit. DSH checks version compatibility when you install.',
    raw: 'JSON index', status: 'Build details',
  },
  zh: {
    lang: 'zh-CN', locale: 'zh_CN', title: 'DSH Plugin Index — 把插件索引加进 DSH',
    description: '为 DeepSeek Harness 提供的社区插件索引。复制一个地址，添加到 DSH，在内置市场中查找和选择插件。',
    skip: '跳到正文', plugins: '插件目录', docs: '文档', language: '语言',
    headline: '把插件索引<br>加进 DSH。', intro: '在 DeepSeek Harness 里浏览社区插件。复制这个地址，添加到内置插件市场。',
    address: '索引地址', copy: '复制地址', copyHint: '添加到「插件 → 发现 → 添加索引源」。',
    copied: '已复制', copySuccess: '地址已复制。打开 DSH，把它添加为索引源。', copyFailure: '地址已选中。按 Ctrl+C 或 ⌘C，或使用选中文字的菜单复制。',
    setup: '三步接入', steps: [
      ['打开插件页', '在 DeepSeek Harness 中打开「插件」，切换到「发现」。'],
      ['添加索引源', '点击「添加索引源」，或打开「管理索引源」。'],
      ['粘贴地址', '填入上方地址，添加后即可浏览并选择插件。']
    ], setupNote: '没有「发现」标签页？先启用「自定义插件市场」组合包。',
    directory: '插件目录', search: '搜索插件', searchPlaceholder: '名称、包名或描述', category: '分类', all: '全部分类', other: '其他',
    results: '显示 {count} / {total} 个插件', initialCount: count => `${count} 个插件`,
    noResults: '没有匹配的插件', noResultsHelp: '换个关键词，或选择全部分类。', reset: '清除筛选',
    noJs: '下方显示全部插件。可使用浏览器的查找功能搜索本页。',
    noDescription: '作者尚未提供插件描述。', version: '版本', source: '源码', npm: 'npm 包', website: '网站', compatibility: 'DSH 版本要求', noVersion: '未提供版本',
    contributeTitle: '让更多人找到你的插件', contributeText: '提交插件的包名或仓库地址，申请收录。', submit: '提交收录', readDocs: '阅读文档',
    independent: '独立社区项目。', updated: '索引更新于', unknownDate: '暂无更新时间',
    scope: '发布包检查不等于安装测试或代码审计。安装时，DSH 会检查版本兼容性。',
    raw: 'JSON 索引', status: '构建详情',
  }
};

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const localize = (value, language, fallback = '') => typeof value === 'string' ? value : value && typeof value === 'object' ? String(value[language] ?? (language === 'zh' ? value['zh-cn'] : undefined) ?? value.en ?? Object.values(value).find(item => typeof item === 'string') ?? fallback) : fallback;
function safeUrl(value) {
  if (typeof value !== 'string') return undefined;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined; } catch { return undefined; }
}
function dateLabel(value, language) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date) : undefined;
}
function plainDescription(value) { return value.replace(/\s+/g, ' ').trim(); }
function newestVersion(versions = []) {
  // Officially parsed indexes are sorted by SemVer. Preserve that declared order.
  return versions[0];
}
export function renderStars(plugin, snapshot, language) {
  const repository = githubRepository(plugin.repository?.url);
  if (!repository) return '';
  const repo = snapshot?.repositories?.[repository.key];
  const zh = language === 'zh';
  const measured = repo && ['ok', 'stale'].includes(repo.status) && Number.isSafeInteger(repo.stars) && repo.stars >= 0 && Number.isFinite(Date.parse(repo.fetchedAt));
  if (!measured) return `<span class="stars-unavailable" data-stars-unavailable>${zh ? 'GitHub star 暂不可用' : 'GitHub stars unavailable'}</span>`;
  const count = new Intl.NumberFormat(zh ? 'zh-CN' : 'en').format(repo.stars);
  const date = new Date(repo.fetchedAt).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  const tooltip = `${repo.stars} GitHub stars · ${zh ? '获取于' : 'Fetched'} ${date}${repo.status === 'stale' ? (zh ? '（缓存，最新请求失败）' : ' (cached; latest request failed)') : ''}`;
  return `<span class="stars-group"><a class="github-stars" data-stars="${repo.stars}" href="${esc(repository.url)}/stargazers" title="${esc(tooltip)}" aria-label="${esc(tooltip)}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/></svg>${count}<span class="stars-label">GitHub</span></a>${repo.status === 'stale' ? `<small class="stars-cache">${zh ? '缓存于' : 'Cached'} ${esc(repo.fetchedAt.slice(0, 10))}</small>` : ''}</span>`;
}
function pluginRow(plugin, language, categories, text, snapshot) {
  const name = localize(plugin.name, language);
  const packageName = localize(plugin.name, 'en', name);
  const title = localize(plugin.title, language, name);
  const description = plainDescription(localize(plugin.description, language, text.noDescription));
  const version = newestVersion(plugin.versions);
  const categoryId = plugin.metadata?.category ?? '';
  const categoryTitle = localize(categories[categoryId]?.title, language, text.other);
  const sourceUrl = safeUrl(plugin.repository?.url) ?? safeUrl(version?.source?.type === 'git' ? version.source.url : undefined);
  const homepage = safeUrl(plugin.homepage);
  const npmUrl = version?.source?.type === 'npm' ? `https://www.npmjs.com/package/${packageName.split('/').map(encodeURIComponent).join('/')}` : undefined;
  const links = [];
  if (sourceUrl) links.push(`<a href="${esc(sourceUrl)}" rel="noopener noreferrer">${esc(text.source)}</a>`);
  if (npmUrl) links.push(`<a href="${esc(npmUrl)}" rel="noopener noreferrer">${esc(text.npm)}</a>`);
  if (!sourceUrl && homepage) links.push(`<a href="${esc(homepage)}" rel="noopener noreferrer">${esc(text.website)}</a>`);
  const search = [name, packageName, title, description, ...(plugin.metadata?.keywords ?? [])].join(' ');
  const date = version?.publishTimestamp != null ? dateLabel(version.publishTimestamp * 1000, language) : undefined;
  const namedTitle = title && title !== name;
  return `<li class="plugin" data-plugin data-category="${esc(categoryId)}" data-search="${esc(search)}">
    <article class="plugin-main" aria-label="${esc(title || name)}">
      ${namedTitle ? `<h3 class="plugin-title">${esc(title)}</h3><p class="package-name">${esc(packageName)}</p>` : `<h3 class="package-name is-title">${esc(packageName)}</h3>`}
      <p class="plugin-description">${esc(description)}</p>
      <div class="plugin-links">${links.join('')}</div>
    </article>
    <div class="plugin-detail">
      ${renderStars(plugin, snapshot, language)}
      <span class="version">${version ? `${esc(text.version)} ${esc(version.version)}` : esc(text.noVersion)}</span>
      ${categoryId ? `<span>${esc(categoryTitle)}</span>` : ''}
      ${date ? `<time datetime="${esc(new Date(version.publishTimestamp * 1000).toISOString())}">${esc(date)}</time>` : ''}
      ${version?.engines?.dsh ? `<details class="compatibility"><summary>${esc(text.compatibility)}</summary><p>${esc(version.engines.dsh)}</p></details>` : ''}
    </div>
  </li>`;
}
function page(index, evidence, language, snapshot) {
  const text = COPY[language];
  const docsUrl = language === 'zh' ? `${REPOSITORY}/blob/main/README.zh-CN.md` : DOCS;
  const root = language === 'zh' ? '../' : './';
  const canonical = language === 'zh' ? `${ORIGIN}zh/` : ORIGIN;
  const plugins = Array.isArray(index.plugins) ? index.plugins : [];
  const categories = index.metadata?.categories ?? {};
  const usedCategories = [...new Set(plugins.map(plugin => plugin.metadata?.category).filter(Boolean))];
  const hasUncategorized = plugins.some(plugin => !plugin.metadata?.category);
  const categoriesHtml = usedCategories.map(id => `<option value="${esc(id)}">${esc(localize(categories[id]?.title, language, id))}</option>`).join('');
  const updated = evidence?.generatedAt ? dateLabel(evidence.generatedAt, language) : undefined;
  const messages = JSON.stringify({ copy: text.copy, copied: text.copied, copySuccess: text.copySuccess, copyFailure: text.copyFailure, results: text.results }).replace(/</g, '\\u003c');
  const structured = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'DSH Plugin Index', url: ORIGIN, inLanguage: ['en', 'zh-CN'], description: text.description }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="${text.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="theme-color" content="#eef3f8">
  <title>${esc(text.title)}</title>
  <meta name="description" content="${esc(text.description)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${ORIGIN}">
  <link rel="alternate" hreflang="zh-CN" href="${ORIGIN}zh/">
  <link rel="alternate" hreflang="x-default" href="${ORIGIN}">
  <link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${root}assets/site.css">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="DSH Plugin Index">
  <meta property="og:locale" content="${text.locale}">
  <meta property="og:locale:alternate" content="${language === 'zh' ? 'en_US' : 'zh_CN'}">
  <meta property="og:title" content="${esc(text.title)}">
  <meta property="og:description" content="${esc(text.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ORIGIN}assets/social.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="DSH Plugin Index. Add one URL to DSH.">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${structured}</script>
  <script src="${root}assets/site.js" defer></script>
</head>
<body>
  <a class="skip" href="#main">${esc(text.skip)}</a>
  <header class="site-header shell">
    <a class="brand" href="${root}index.html"><img src="${root}assets/favicon.svg" alt="" width="34" height="34"><span>DSH Plugin Index</span></a>
    <nav class="header-links" aria-label="${language === 'zh' ? '主导航' : 'Main navigation'}">
      <a href="#plugins">${esc(text.plugins)}</a><a class="header-docs" href="${docsUrl}">${esc(text.docs)}</a><a href="${REPOSITORY}">GitHub</a>
      <div class="languages" aria-label="${esc(text.language)}">${language === 'en' ? '<span lang="en" aria-current="page">EN</span><a href="./zh/index.html" lang="zh-CN" hreflang="zh-CN">中文</a>' : '<a href="../index.html" lang="en" hreflang="en">EN</a><span lang="zh-CN" aria-current="page">中文</span>'}</div>
    </nav>
  </header>
  <main id="main">
    <section class="hero shell" aria-labelledby="page-title">
      <div class="hero-intro"><h1 id="page-title">${text.headline}</h1><p>${esc(text.intro)}</p></div>
      <label class="address-label" for="index-url">${esc(text.address)}</label>
      <div class="address-bar">
        <textarea id="index-url" rows="2" readonly spellcheck="false" aria-describedby="copy-status">${INDEX_URL}</textarea>
        <button class="copy-button" type="button" data-copy hidden><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 8h12v13H8zM16 8V3H3v13h5"/></svg><span>${esc(text.copy)}</span></button>
      </div>
      <p class="copy-status" id="copy-status" role="status" aria-live="polite">${esc(text.copyHint)}</p>
    </section>
    <section class="setup shell" aria-labelledby="setup-title">
      <h2 id="setup-title">${esc(text.setup)}</h2>
      <ol class="steps">${text.steps.map(([title, detail]) => `<li><div><h3>${esc(title)}</h3><p>${esc(detail)}</p></div></li>`).join('')}</ol>
      <p class="setup-note">${esc(text.setupNote)}</p>
    </section>
    <section class="directory-surface" id="plugins" aria-labelledby="directory-title"><div class="directory shell">
      <div class="directory-heading"><h2 id="directory-title">${esc(text.directory)}</h2><p class="result-count" id="result-count" role="status" aria-live="polite">${esc(text.initialCount(plugins.length))}</p></div>
      <p class="stars-note">${language === 'zh' ? 'Star 来自 GitHub 仓库，随索引更新。关注度不等于质量。' : 'Stars come from GitHub repositories and refresh with the index. Popularity is not a quality rating.'} <a href="${root}github.json">${language === 'zh' ? '查看快照' : 'View snapshot'}</a></p>
      <form class="filters" data-filters hidden role="search" aria-label="${esc(text.search)}">
        <div class="field"><label for="plugin-search">${esc(text.search)}</label><input type="search" id="plugin-search" placeholder="${esc(text.searchPlaceholder)}" autocomplete="off"></div>
        <div class="field"><label for="plugin-category">${esc(text.category)}</label><select id="plugin-category"><option value="">${esc(text.all)}</option>${categoriesHtml}${hasUncategorized ? `<option value="__uncategorized__" data-uncategorized>${esc(text.other)}</option>` : ''}</select></div>
      </form>
      <noscript><p class="no-js">${esc(text.noJs)}</p></noscript>
      <ul class="plugin-list">${plugins.map(plugin => pluginRow(plugin, language, categories, text, snapshot)).join('\n')}</ul>
      <div class="empty" id="empty-results" ${plugins.length ? 'hidden' : ''}><h3>${esc(text.noResults)}</h3><p>${esc(text.noResultsHelp)}</p><button type="button" class="text-button" data-reset hidden>${esc(text.reset)}</button></div>
    </div></section>
    <section class="contribute shell" aria-labelledby="contribute-title">
      <div><h2 id="contribute-title">${esc(text.contributeTitle)}</h2><p>${esc(text.contributeText)}</p></div>
      <div class="contribute-links"><a class="submit-link" href="${esc(SUBMIT)}">${esc(text.submit)}</a><a href="${docsUrl}">${esc(text.readDocs)}</a></div>
    </section>
  </main>
  <footer class="footer shell">
    <div class="footer-top"><p>${esc(text.independent)} <a href="${REPOSITORY}">GitHub</a></p><p>${updated ? `${esc(text.updated)} <time datetime="${esc(evidence.generatedAt)}">${esc(updated)}</time>` : esc(text.unknownDate)}</p></div>
    <p class="scope">${esc(text.scope)}</p>
    <p><a href="${root}index.json">${esc(text.raw)}</a> &nbsp; / &nbsp; <a href="${root}status.json">${esc(text.status)}</a></p>
  </footer>
  <script id="site-messages" type="application/json">${messages}</script>
</body>
</html>\n`;
}

function sitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${[ORIGIN, `${ORIGIN}zh/`].map(url => `  <url><loc>${url}</loc><xhtml:link rel="alternate" hreflang="en" href="${ORIGIN}"/><xhtml:link rel="alternate" hreflang="zh-CN" href="${ORIGIN}zh/"/><xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}"/></url>`).join('\n')}\n</urlset>\n`;
}

function notFound(css) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found — DSH Plugin Index</title><style>${css}</style></head><body><header class="site-header shell"><a class="brand" href="${ORIGIN}">DSH Plugin Index</a></header><main class="shell hero"><h1>Page not found.</h1><p lang="zh-CN">页面不存在。</p><p>Open the plugin directory to continue.</p><p lang="zh-CN">返回插件目录，继续查找插件。</p><div class="contribute-links"><a class="submit-link" href="${ORIGIN}">English directory</a><a class="submit-link" href="${ORIGIN}zh/" lang="zh-CN">中文目录</a></div></main></body></html>\n`;
}

/** Write the bilingual static site alongside the canonical format-1 index. */
export async function writeSite(index, evidence, snapshot = {}) {
  if (index?.format !== 1 || !Array.isArray(index.plugins)) throw new Error('writeSite expects a format-1 plugin index');
  await mkdir(new URL('assets/', output), { recursive: true });
  await mkdir(new URL('zh/', output), { recursive: true });
  for (const asset of ['site.css', 'site.js', 'favicon.svg', 'social.svg', 'social.png']) {
    await copyFile(new URL(asset, source), new URL(`assets/${asset}`, output));
  }
  await writeFile(new URL('index.html', output), page(index, evidence, 'en', snapshot).replace(/[\t ]+$/gm, ''), 'utf8');
  await writeFile(new URL('zh/index.html', output), page(index, evidence, 'zh', snapshot).replace(/[\t ]+$/gm, ''), 'utf8');
  await writeFile(new URL('sitemap.xml', output), sitemap(), 'utf8');
  await writeFile(new URL('404.html', output), notFound(await readFile(new URL('site.css', source), 'utf8')), 'utf8');
}
