import {readFile,writeFile} from 'node:fs/promises';
const root = new URL('../packages/market-listing-ui/', import.meta.url);
const source = await readFile(new URL('src/client.mjs',root),'utf8');
const compiled = source.replace(/^export /gm,'');
await writeFile(new URL('client.js',root),'window.__ModuleLoader__.load({id:"@polang233/dsh-market-listing-ui",factory:()=>{\n'+compiled+'\nreturn {apply};\n}});\n');
await import('./build-enhancement-index.mjs');
