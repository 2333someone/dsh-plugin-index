import { test, expect } from '@playwright/test';
import {githubRepository} from '../../scripts/github.mjs';

const INDEX_URL = 'https://polang233.github.io/dsh-plugin-index/index.json';
for (const language of ['en', 'zh']) {
  const route = language === 'en' ? './' : './zh/';
  test(`${language}: directory filters, language navigation and layout`, async ({ page }, info) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`); });
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', language === 'en' ? 'en' : 'zh-CN');
    await expect(page.locator('#index-url')).toHaveValue(INDEX_URL);
    const rows = page.locator('[data-plugin]');
    expect(await rows.count()).toBeGreaterThan(20);
    const all = await rows.count();
    const firstPackage = await rows.first().locator('.package-name').textContent();
    await page.locator('#plugin-search').fill(firstPackage.trim());
    await expect(page.locator('[data-plugin]:visible')).toHaveCount(1);
    await page.locator('#plugin-search').fill('no-match-783491');
    await expect(page.locator('#empty-results')).toBeVisible();
    await page.locator('[data-reset]').click();
    await expect(page.locator('[data-plugin]:visible')).toHaveCount(all);
    const category = await page.locator('#plugin-category option').nth(1).getAttribute('value');
    await page.locator('#plugin-category').selectOption(category);
    const expectedCount = await page.locator('[data-plugin]').evaluateAll((nodes, category) => nodes.filter(node => node.dataset.category === category).length, category);
    await expect(page.locator('[data-plugin]:visible')).toHaveCount(expectedCount);
    await page.locator('#plugin-category').selectOption('');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const snapshot = await (await page.request.get('./github.json')).json();
    const index = await (await page.request.get('./index.json')).json();
    const starLinks = page.locator('[data-stars]');
    const expectedStars = index.plugins.flatMap(plugin => {
      const key = githubRepository(plugin.repository?.url)?.key;
      const repo = key && snapshot.repositories[key];
      return repo && ['ok', 'stale'].includes(repo.status) ? [repo] : [];
    });
    await expect(starLinks).toHaveCount(expectedStars.length);
    const actualStars = await starLinks.evaluateAll(links => links.map(link => ({href: link.href, stars: Number(link.dataset.stars), title: link.title})));
    expect(actualStars.map(link => link.href + ':' + link.stars).sort()).toEqual(expectedStars.map(repo => repo.url + '/stargazers:' + repo.stars).sort());
    expect(actualStars.every(link => link.title.includes('UTC'))).toBe(true);
    const icons = page.locator('.plugin-avatar img');
    await expect(icons).toHaveCount(index.plugins.filter(plugin => plugin.icon).length);
    if (await icons.count()) {
      await icons.first().scrollIntoViewIfNeeded();
      await expect.poll(() => icons.first().evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    }
    if (language === 'en' && info.project.name === 'desktop') {
      const broken = await page.evaluate(async paths => {
        let next = 0;
        const failures = [];
        await Promise.all(Array.from({length: Math.min(8, paths.length)}, async () => {
          while (next < paths.length) {
            const path = paths[next++];
            const image = new Image();
            image.src = new URL(path, location.href).href;
            try { await image.decode(); } catch { failures.push(path); }
          }
        }));
        return failures;
      }, [...new Set(index.plugins.map(plugin => plugin.icon).filter(Boolean))]);
      expect(broken).toEqual([]);
    }
    await page.locator('#plugins').scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`${language}-directory.png`) });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: info.outputPath(`${language}-page.png`) });
    await page.locator('.languages a').click();
    await expect(page.locator('html')).toHaveAttribute('lang', language === 'en' ? 'zh-CN' : 'en');
    expect(errors).toEqual([]);
  });
  test(`${language}: copy and clipboard failure recovery`, async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(route);
    await page.locator('[data-copy]').click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(INDEX_URL);
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } }));
    await page.locator('[data-copy]').click();
    await expect(page.locator('#index-url')).toBeFocused();
    expect(await page.locator('#index-url').evaluate(node => node.selectionEnd - node.selectionStart)).toBe(INDEX_URL.length);
    await expect(page.locator('#copy-status')).toContainText(language === 'en' ? 'selected' : '选中');
  });
}

test('content and the index URL remain available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL);
  await expect(page.locator('#index-url')).toHaveValue(INDEX_URL);
  expect(await page.locator('[data-plugin]').count()).toBeGreaterThan(20);
  await expect(page.locator('[data-copy]')).toBeHidden();
  await expect(page.locator('[data-filters]')).toBeHidden();
  await context.close();
});
