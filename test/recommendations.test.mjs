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

test('random resources use a complete independent shuffle without changing default recommendations',()=>{
  const plugins=['a','b','c','d'].map(name=>plugin(name,name));
  const bounds=[];
  const first=recommendIndex({plugins},{now,randomIntImpl:bound=>{bounds.push(bound);return 0;}});
  const second=recommendIndex({plugins},{now,randomIntImpl:bound=>bound-1});
  assert.deepEqual(bounds,[4,3,2]);
  assert.deepEqual(first.plugins.map(p=>p.name),second.plugins.map(p=>p.name));
  const ranks=result=>result.plugins.map(p=>p.metadata.sortKeys['random-resources']);
  assert.deepEqual([...ranks(first)].sort((a,b)=>a-b),[1,2,3,4]);
  assert.notDeepEqual(ranks(first),ranks(second));
  assert.equal(first.metadata.sortKeys['random-resources'].title.zh,'随机资源');
});
test('growing, frequently released projects outrank a quiet high-star one',()=>{
  const quiet=plugin('quiet','big'),rising=plugin('rising','small');
  const github={repositories:{'big/quiet':{status:'ok',stars:50000,pushedAt:new Date(now-200*86400000).toISOString()},'small/rising':{status:'ok',stars:3,pushedAt:new Date(now-86400000).toISOString()}}};
  quiet.versions[0].publishTimestamp=(now-200*86400000)/1000;
  const signals={rising:{growth:4,releases30:5,ageDays:20}};
  assert.equal(recommendIndex({plugins:[quiet,rising]},{github,signals,now}).plugins[0].name,'rising');
});
test('verification, reach and star growth lift an otherwise equal plugin',()=>{
  const a=plugin('plain','one'),b=plugin('trusted','two');
  const signals={trusted:{verifiedBy:['awesome-dsh'],downloads:20000,starsWeek:30}};
  assert.equal(recommendIndex({plugins:[a,b]},{signals,now}).plugins[0].name,'trusted');
});
