const test=require('node:test'),assert=require('node:assert/strict');
const library=require('../dist/paint-data.js');
test('paint filters intersect claimed year, color, evidence and code without changing references',()=>{
 const before=JSON.stringify(library.entries);
 assert.deepEqual(library.filter({year:'1963',kind:'document'}).map(e=>e.id),['rm-1960-63']);
 assert.deepEqual(library.filter({year:'1968',kind:'document'}).map(e=>e.id),['rm-1964-70']);
 assert.deepEqual(library.filter({query:'RH-CG498',year:'1968',color:'yellow'}).map(e=>e.id),['imron-1968']);
 assert.equal(library.filter({query:'RH-CG498',year:'1964'}).length,0);
 assert.deepEqual(library.filter({color:'red'}).map(e=>e.id),['red-79668']);
 assert.equal(library.filter({query:'no such code'}).length,0);
 assert.equal(JSON.stringify(library.entries),before);
});
test('every paint claim retains qualifications, source links and access labels',()=>{
 assert.equal(new Set(library.entries.map(e=>e.id)).size,library.entries.length);
 for(const e of library.entries){
  assert(e.caveat&&e.next&&e.sources.length);assert(e.from<=e.to);assert(['document','community'].includes(e.kind));
  for(const s of e.sources){assert.equal(new URL(s.url).protocol,'https:');assert(s.label&&s.access);assert(!s.url.includes('__cft__'));}
 }
 assert(library.entries.find(e=>e.id==='rm-1964-70').caveat.includes('disputed'));
 assert(library.entries.find(e=>e.id==='motobase-1964').sources.every(s=>s.access.includes('Private group')));
});
