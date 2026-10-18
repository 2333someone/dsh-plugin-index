import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const fixture = await readFile(new URL('../fixtures/dsh-market-row.html',import.meta.url),'utf8');
const bundle = await readFile(new URL('../../packages/market-listing-ui/client.js',import.meta.url),'utf8');
async function setup(page) {
  await page.setContent('<div data-plugin-tab="discover">'+fixture+'</div><div data-market-detail="example">Version 1.2.3</div>');
  await page.evaluate(() => { window.__ModuleLoader__ = {load: ({factory}) => factory().apply({effect: mount => {window.stopEnhancement=mount();}})}; });
  await page.addScriptTag({content:bundle});
}
test('DSH row metrics move below the description and restore on disable',async({page},info)=>{
  await setup(page);
  const row = page.locator('[data-market-entry]');
  await expect(row.locator('.opm-metric')).toHaveCount(3);
  await expect(row.locator('.opm-description')).toContainText('DSH');
  await expect(row.locator('.opm-metric').nth(0)).toContainText('★');
  await expect(row.locator('.opm-metric').nth(1)).not.toContainText('/30');
  await expect(row.locator('.opm-age')).toContainText('◷');
  await expect(row.locator('[data-opm-original]').first()).toBeHidden();
  await expect(row.locator('[data-opm-original]').nth(1)).toBeHidden();
  await expect(page.locator('[data-market-detail]')).toContainText('1.2.3');
  await expect(row.locator('button').last()).toBeVisible();
  const metricsBox=await row.locator('.opm-metrics').boundingBox(), descriptionBox=await row.locator('.opm-description').boundingBox();
  expect(metricsBox.y).toBeGreaterThanOrEqual(descriptionBox.y+descriptionBox.height);
  await page.screenshot({path:info.outputPath('dsh-metric-tags.png')});
  await page.evaluate(()=>window.stopEnhancement());
  await expect(row.locator('.opm-metrics')).toHaveCount(0);
  await expect(row.locator('[data-opm-original]')).toHaveCount(0);
  await expect(row).toContainText('★');
});
test('DSH redraw and language changes do not duplicate badges or change unrelated text',async({page})=>{
  await setup(page);
  await page.evaluate(()=>{
    const original=document.querySelector('[data-opm-original]');
    original.textContent='★ 0 · ↓ 42 · ◷ 今天更新 — 新的插件介绍';
  });
  await expect(page.locator('.opm-star')).toHaveText('★ 0');
  await expect(page.locator('.opm-download')).toHaveText('↓ 42');
  await expect(page.locator('.opm-description')).toHaveText('新的插件介绍');
  await expect(page.locator('.opm-metrics')).toHaveCount(1);
  await page.evaluate(()=>document.querySelector('[data-opm-original]').textContent='普通插件的介绍');
  await expect(page.locator('.opm-metrics')).toHaveCount(0);
  await expect(page.locator('[data-market-entry]')).toContainText('普通插件的介绍');
});
