const test=require('node:test'),assert=require('node:assert/strict');
const worker=async fetchPublic=>(await import('../worker/ui-preview.mjs')).createPreviewWorker(fetchPublic);
test('UI previews reject every write before reading production or serving assets',async()=>{
 let calls=0;const app=await worker(async()=>{calls++;return Response.json({});});
 for(const path of ['/api/garage','/api/session','/api/logout','/admin/login','/']){
  const r=await app.fetch(new Request('https://preview.test'+path,{method:'PUT',body:'{}'}),{});assert.equal(r.status,405);
 }
 assert.equal(calls,0);
});
test('UI preview reads use only the fixed public endpoint and never forward user credentials',async()=>{
 let outgoing;const snapshot={revision:4,state:{example:'published'}};
 const app=await worker(async(url,options)=>{outgoing={url,options};return Response.json(snapshot);});
 const r=await app.fetch(new Request('https://preview.test/api/garage?destination=https://other.test',{headers:{Cookie:'private-session',Authorization:'private-token','Cf-Access-Jwt-Assertion':'private-jwt'}}),{});
 assert.deepEqual(await r.json(),snapshot);assert.equal(outgoing.url,'https://vintage-sled-revival.joshuatobin.workers.dev/api/garage');assert.equal(outgoing.options.method,'GET');assert.deepEqual(outgoing.options.headers,{Accept:'application/json'});assert.equal(outgoing.options.redirect,'manual');assert.equal(r.headers.get('Cache-Control'),'no-store');
});
test('preview sessions stay read only and admin paths cannot invoke owner login',async()=>{
 const app=await worker(async()=>{throw Error('Must not fetch');});const session=await app.fetch(new Request('https://preview.test/api/session'),{});
 const info=await session.json();assert.equal(info.canEdit,false);assert.equal(info.preview,true);assert.equal(info.email,null);
 const login=await app.fetch(new Request('https://preview.test/admin/login'),{});assert.equal(login.status,404);
});
test('failed or malformed public records fail visibly without substituting a successful response',async()=>{
 for(const requestPublic of [async()=>{throw Error('Offline');},async()=>new Response('Failed',{status:500}),async()=>Response.json({state:null}),async()=>Response.redirect('https://other.test')]){
  const app=await worker(requestPublic),r=await app.fetch(new Request('https://preview.test/api/garage'),{});assert.equal(r.status,503);assert((await r.json()).error);
 }
});
