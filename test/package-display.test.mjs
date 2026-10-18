import test from 'node:test';
import assert from 'node:assert/strict';
import {displayFiles, packageDisplay} from '../scripts/package-display.mjs';

test('packages without an icon keep an absent status', () => {
  const manifest = {name: 'example'};
  const result = packageDisplay(manifest, displayFiles(manifest, new Set()), new Map());
  assert.equal(result.icon, undefined);
  assert.equal(result.evidence.icon.status, 'absent');
  assert.deepEqual(result.evidence.warnings, []);
});
test('locale exports stay inside the English locale directory', () => {
  const files = new Set(['package/lang/en.json', 'package/lang/zh-CN.json', 'package/locale/zh.json']);
  const result = displayFiles({exports: {'./locale/*': {node: './lang/*'}}}, files);
  assert.deepEqual(result.locales, {en: 'package/lang/en.json', zh: 'package/lang/zh-CN.json'});
});
test('a claimed raster extension must match the image signature', () => {
  const manifest = {name: 'example', icon: './icon.png'};
  const result = packageDisplay(manifest, displayFiles(manifest, new Set(['package/icon.png'])), new Map([['package/icon.png', Buffer.from('<svg/>')]]));
  assert.equal(result.icon, undefined);
  assert.match(result.evidence.warnings[0].reason, /PNG signature/);
});
test('inactive SVG comments and visible text do not hide author artwork', () => {
  const manifest = {name: 'example', icon: './icon.svg'};
  const bytes = Buffer.from('<!-- Used in <img>; contact author@example.org --><svg xmlns="http://www.w3.org/2000/svg"><text x="0" y="12">DSH</text></svg>');
  const result = packageDisplay(manifest, displayFiles(manifest, new Set(['package/icon.svg'])), new Map([['package/icon.svg', bytes]]));
  assert.equal(result.evidence.icon.status, 'included');
  assert.equal(result.asset.bytes, bytes);
});
