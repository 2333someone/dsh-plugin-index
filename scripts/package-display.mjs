import { createHash } from 'node:crypto';
import { posix } from 'node:path';

export const MAX_DISPLAY_FILE_BYTES = 1024 * 1024;
export const MAX_ICON_BYTES = 256 * 1024;
const IMAGE_TYPES = {'.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'};

function target(value, depth = 0) {
  if (depth > 8) return undefined;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(item => target(item, depth + 1)).find(Boolean);
  if (value && typeof value === 'object') {
    for (const condition of ['import', 'node', 'default']) {
      const found = target(value[condition], depth + 1);
      if (found) return found;
    }
  }
}
function exported(manifest, key) {
  if (!manifest.exports) return key;
  const exact = target(manifest.exports[key]);
  if (exact) return exact;
  for (const pattern of Object.keys(manifest.exports).filter(value => value.includes('*')).sort((a, b) => b.length - a.length)) {
    const [before, after] = pattern.split('*');
    if (key.startsWith(before) && key.endsWith(after)) {
      const value = target(manifest.exports[pattern]);
      if (value) return value.replace('*', key.slice(before.length, after ? -after.length : undefined));
    }
  }
}
function packagePath(value) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const path = value.replace(/^\.\//, '');
  if (path.startsWith('/') || path.includes('\\') || path.split('/').some(part => !part || part === '.' || part === '..') || /[?#:]/.test(path)) return undefined;
  return 'package/' + path;
}

/** Resolve package-owned regular files; never fetch a remote icon or locale. */
export function displayFiles(manifest, files) {
  const exportedIcon = manifest.exports ? exported(manifest, './icon') : undefined;
  const icon = packagePath(manifest.icon ?? exportedIcon);
  const english = packagePath(exported(manifest, './locale/en.json'));
  const directory = english && posix.dirname(english);
  const locales = {};
  if (english && files.has(english)) locales.en = english;
  if (directory) {
    for (const language of ['zh', 'zh-CN', 'zh-cn', 'zh-Hans']) {
      const path = directory + '/' + language + '.json';
      if (files.has(path)) { locales.zh = path; break; }
    }
  }
  return {icon, iconDeclared: manifest.icon !== undefined || exportedIcon !== undefined, locales};
}

function imageType(path, bytes) {
  const extension = posix.extname(path).toLowerCase();
  if (!IMAGE_TYPES[extension]) throw new Error('Unsupported icon format');
  if (extension === '.png' && !bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error('Invalid PNG signature');
  if (['.jpg', '.jpeg'].includes(extension) && !(bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)) throw new Error('Invalid JPEG signature');
  if (extension === '.webp' && !(bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP')) throw new Error('Invalid WebP signature');
  if (extension === '.svg') {
    const svg = bytes.toString('utf8').replace(/<!--[\s\S]*?-->/g, '');
    const tags = [...svg.matchAll(/<\/?([A-Za-z][\w:.-]*)\b/g)].map(match => match[1]);
    const allowed = /^(?:svg|g|path|rect|circle|ellipse|line|polyline|polygon|defs|linearGradient|radialGradient|stop|clipPath|mask|title|desc|text|tspan|use|style|symbol|filter|fe[A-Za-z]+)$/;
    if (!/<svg\b/i.test(svg) || tags.some(tag => !allowed.test(tag)) || /<!DOCTYPE|<!ENTITY|&#|\son[\w:-]*\s*=|@|\\|<\?(?!xml\s)/i.test(svg)) throw new Error('SVG contains unsupported active content');
    for (const match of svg.matchAll(/(?:href|xlink:href)\s*=\s*(['"])(.*?)\1/gi)) {
      if (!/^#[A-Za-z_][\w:.-]*$/.test(match[2])) throw new Error('SVG references an external resource');
    }
    for (const match of svg.matchAll(/url\s*\(\s*([^)]*)\)/gi)) {
      if (!/^['"]?#[A-Za-z_][\w:.-]*['"]?$/.test(match[1].trim())) throw new Error('SVG references an external resource');
    }
  }
  return {extension: extension === '.jpeg' ? '.jpg' : extension, mime: IMAGE_TYPES[extension]};
}

/** Preserve author artwork and publish it under a content-addressed URL. */
export function packageDisplay(manifest, resolved, contents) {
  const warnings = [], localized = {};
  for (const [language, path] of Object.entries(resolved.locales)) {
    try {
      const bytes = contents.get(path);
      if (!bytes) throw new Error('Locale file exceeds the display limit');
      const meta = JSON.parse(bytes.toString('utf8')).meta;
      localized[language] = {};
      for (const field of ['title', 'description']) if (typeof meta?.[field] === 'string' && meta[field].trim()) localized[language][field] = meta[field].trim();
    } catch (error) { warnings.push({path, reason: error.message}); }
  }
  const fields = {};
  for (const field of ['title', 'description']) {
    const english = localized.en?.[field] ?? (field === 'description' ? manifest.description : manifest.name);
    if (typeof english === 'string' && english.trim() && Object.values(localized).some(value => value[field])) {
      fields[field] = {en: english, ...(localized.zh?.[field] ? {zh: localized.zh[field]} : {})};
    }
  }
  let icon, asset, iconEvidence = {status: resolved.iconDeclared ? 'omitted' : 'absent'};
  if (resolved.icon) {
    try {
      const bytes = contents.get(resolved.icon);
      if (!bytes) throw new Error('Icon is missing or exceeds the display-file limit');
      if (!bytes.length || bytes.length > MAX_ICON_BYTES) throw new Error('Icon must be between 1 byte and 256 KiB');
      const {extension, mime} = imageType(resolved.icon, bytes);
      const sha256 = createHash('sha256').update(bytes).digest('hex');
      icon = 'icons/' + sha256 + extension;
      asset = {path: icon, bytes};
      iconEvidence = {status: 'included', source: 'published-package', path: resolved.icon.slice('package/'.length), url: icon, mime, bytes: bytes.length, sha256};
    } catch (error) { warnings.push({path: resolved.icon, reason: error.message}); }
  } else if (resolved.iconDeclared) warnings.push({reason: 'Icon must resolve to a file inside the published package'});
  return {...fields, ...(icon ? {icon, asset} : {}), evidence: {icon: iconEvidence, localized: Object.keys(localized), warnings}};
}
