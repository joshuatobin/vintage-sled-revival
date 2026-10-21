const test=require('node:test'),assert=require('node:assert/strict');
const yearbook=require('../dist/yearbook-data.js');
test('the yearbook covers every year from 1959 through 1979 with qualified, sourced color studies',()=>{
 assert.deepEqual(yearbook.entries.map(e=>e.year),Array.from({length:21},(_,i)=>1959+i));
 for(const e of yearbook.entries){assert(e.model&&e.modelCode&&e.note);assert.match(e.paint.hex,/^#[0-9a-f]{6}$/i);assert(e.sources.length>=2);for(const s of e.sources)assert.equal(new URL(s.url).protocol,'https:');}
 assert.equal(yearbook.get('1968').modelCode,'SE8');assert.equal(yearbook.get(1992),null);assert.equal(yearbook.get('not a year'),null);
 assert.equal(yearbook.get(1964).documentedHood,false);assert(yearbook.get(1964).note.includes('disputes'));
 for(let year=1971;year<=1979;year++){assert.equal(yearbook.get(year).documentedHood,false);assert(yearbook.get(year).note.includes('does not establish'));}
});
test('the 1980s and 1990s are outside the supported year range',()=>{
 for(let year=1980;year<=1999;year++)assert.equal(yearbook.get(year),null);
 assert.equal(yearbook.get(1958),null);assert.equal(yearbook.get(1959).year,1959);assert.equal(yearbook.get(1979).year,1979);
});
