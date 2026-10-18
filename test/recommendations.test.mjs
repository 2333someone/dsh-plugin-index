import test from 'node:test';
import assert from 'node:assert/strict';
import {recommendIndex} from '../scripts/recommendations.mjs';

const now = Date.parse('2026-10-18T12:00:00Z');
const plugin = (name, developer, category = 'tools') => ({name, repository:{url:`https://github.com/${developer}/${name}`}, metadata:{category}, versions:[{version:'1.0.0',publishTimestamp:(now-86400000)/1000,source:{type:'npm'}}]});

test('default recommendations spread exposure across developers and retain every entry',()=>{
  const plugins=[...Array.from({length:8},(_,i)=>plugin('popular-'+i,'one')),plugin('new-memory','two','memory'),plugin('new-skill','three','skills')];
  const github={repositories:Object.fromEntries(plugins.map(p=>[p.repository.url.replace('https://github.com/',''),{status:'ok',stars:p.name.startsWith('popular')?100000:0,pushedAt:new Date(now-86400000).toISOString()}]))};
  const result=recommendIndex({plugins},{github,now});
  assert.equal(new Set(result.plugins.slice(0,3).map(p=>p.repository.url.split('/')[3])).size,3);
  assert.deepEqual(result.plugins.map(p=>p.name).sort(),plugins.map(p=>p.name).sort());
  assert.equal(result.plugins[0].metadata.sortKeys.recommended,10);
  assert.equal(result.metadata.sortKeys.recommended.order,'desc');
});
test('recommendations are reproducible within a week and independent of input order',()=>{
  const plugins=['one','two','three'].map(name=>plugin(name,name));
  const names=value=>value.plugins.map(p=>p.name);
  assert.deepEqual(names(recommendIndex({plugins},{now})),names(recommendIndex({plugins:[...plugins].reverse()},{now})));
  assert.deepEqual(names(recommendIndex({plugins},{now})),names(recommendIndex({plugins},{now:now+60000})));
});
test('recently maintained projects can precede an archived high-star repository',()=>{
  const fresh=plugin('fresh','new'),old=plugin('old','big');
  const github={repositories:{'big/old':{status:'ok',stars:1000000,archived:true,pushedAt:new Date(now).toISOString()}}};
  assert.equal(recommendIndex({plugins:[old,fresh]},{github,now}).plugins[0].name,'fresh');
});
