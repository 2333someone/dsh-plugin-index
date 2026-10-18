import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {parseMarketIndex} from '@deepseek-ai/dsh-plugin-market-index';
const read = async path => JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));
const release = await read('enhancement-release.json');
const manifest = await read('packages/market-listing-ui/package.json');
const index = {
  format:1,
  title:{en:'Open Plugin Market · Enhancements',zh:'开放插件市场 · 显示增强'},
  description:{en:'Optional listing display plugin. The main index works without it.',zh:'可选的列表显示插件。普通索引可独立使用。'},
  plugins:[{
    name:manifest.name,title:{en:'Market listing metric tags',zh:'市场列表彩色指标'},
    description:{en:'Move stars, downloads and update age below descriptions as colored tags. Keep versions in details. Disable to restore the original list.',zh:'将 star、下载量和带 ◷ 的更新天数放在描述下方，以彩色标签显示。版本保留在详情，停用恢复原列表。'},
    icon:'assets/logo-256.png',author:'polang233',repository:{url:'https://github.com/polang233/dsh-plugin-index',directory:'packages/market-listing-ui'},
    versions:[{version:manifest.version,publishTimestamp:release.publishTimestamp,source:{type:'git',url:'https://github.com/polang233/dsh-plugin-index',commit:release.commit,path:'packages/market-listing-ui'},engines:{dsh:manifest.engines.dsh}}]
  }]
};
parseMarketIndex(index,'https://polang233.github.io/dsh-plugin-index/enhancements.json');
await mkdir(new URL('../public/',import.meta.url),{recursive:true});
await writeFile(new URL('../public/enhancements.json',import.meta.url),JSON.stringify(index,null,2)+'\n');
