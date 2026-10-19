const test=require('node:test'),assert=require('node:assert/strict');
const Records=require('../dist/records.js');
const modules=Promise.all([import('../worker/garage.mjs'),import('../worker/auth.mjs'),import('jose')]);
const origin='https://garage.example.test';
const authEnv={ACCESS_TEAM_DOMAIN:'https://garage-test.cloudflareaccess.com',ACCESS_AUD:'garage-audience',OWNER_EMAIL:'owner@example.com'};
let keys;
async function signing(){
 if(!keys)keys=(async()=>{const {generateKeyPair,exportJWK,createLocalJWKSet}= (await modules)[2];const pair=await generateKeyPair('RS256');const jwk=await exportJWK(pair.publicKey);jwk.kid='test-key';return{...pair,keySet:createLocalJWKSet({keys:[jwk]})};})();
 return keys;
}
async function token(claims={}){
 const {SignJWT}=(await modules)[2],{privateKey}=await signing();
 return new SignJWT({email:'owner@example.com',...claims}).setProtectedHeader({alg:'RS256',kid:'test-key'}).setIssuer(claims.iss||authEnv.ACCESS_TEAM_DOMAIN).setAudience(claims.aud||authEnv.ACCESS_AUD).setSubject('owner-id').setIssuedAt().setExpirationTime(claims.exp||Math.floor(Date.now()/1000)+3600).sign(privateKey);
}
class Storage{
 constructor(){this.values=new Map();this.chain=Promise.resolve();}
 async transaction(callback){
  const run=async()=>{
   const next=structuredClone(this.values);
   const tx={get:async key=>Array.isArray(key)?new Map(key.map(k=>[k,structuredClone(next.get(k))])):structuredClone(next.get(key)),put:async rows=>{for(const [key,value]of Object.entries(rows)){if(value instanceof Uint8Array)assert(value.byteLength<=128*1024);next.set(key,structuredClone(value));}},delete:async keys=>{for(const key of keys)next.delete(key);}};
   const result=await callback(tx);this.values=next;return result;
  };
  const result=this.chain.then(run);this.chain=result.catch(()=>{});return result;
 }
}
async function fixture(){
 const [worker,auth]=await modules,{keySet}=await signing(),storage=new Storage(),store=new worker.GarageStore({storage});
 const env={...authEnv,GARAGE:{idFromName:name=>name,get:()=>({fetch:request=>store.fetch(request)})},ASSETS:{fetch:()=>new Response('<html>Public garage</html>')}};
 const handler=worker.createWorker((request,env)=>auth.ownerIdentity(request,env,keySet));
 const ownerToken=await token();
 return{worker,auth,storage,env,ownerToken,request:(path,options={})=>handler.fetch(new Request(origin+path,options),env)};
}
function put(state,jwt,revision=0,extra={}){return{method:'PUT',headers:{'Content-Type':'application/json','If-Match':`"${revision}"`,Origin:origin,Cookie:`CF_Authorization=${jwt}`,...extra},body:JSON.stringify(state)};}

test('public pages and garage reads require no login; every anonymous mutation is rejected',async()=>{
 const app=await fixture();assert.equal((await app.request('/')).status,200);
 assert.deepEqual(await(await app.request('/api/garage')).json(),{revision:0,state:null});
 assert.equal((await(await app.request('/api/session')).json()).canEdit,false);
 assert.equal((await app.request('/api/garage',put(Records.initialState(),''))).status,401);
 assert.equal((await app.request('/api/garage',{method:'DELETE'})).status,405);
 assert.equal((await app.request('/api/unknown')).status,404);
 assert.equal((await app.request('/app.js',{method:'POST'})).status,405);
});
test('only a signed, unexpired token for the configured issuer, audience and owner is accepted',async()=>{
 const app=await fixture();
 const forged=(await token({email:'visitor@example.com'})).split('.');const forgedClaims=JSON.parse(Buffer.from(forged[1],'base64url'));forgedClaims.email='owner@example.com';forged[1]=Buffer.from(JSON.stringify(forgedClaims)).toString('base64url');
 for(const jwt of ['forged.token.value',forged.join('.'),await token({email:'visitor@example.com'}),await token({aud:'wrong-app'}),await token({iss:'https://other.cloudflareaccess.com'}),await token({exp:1})]){
  const response=await app.request('/api/session',{headers:{Cookie:`CF_Authorization=${jwt}`,'Cf-Access-Authenticated-User-Email':'owner@example.com'}});
  assert.equal((await response.json()).canEdit,false);
 }
 const session=await(await app.request('/api/session',{headers:{Cookie:`CF_Authorization=${app.ownerToken}`}})).json();assert.equal(session.canEdit,true);
 assert.equal((await app.request('/api/session',{headers:{'Cf-Access-Authenticated-User-Email':'owner@example.com'}})).status,200);
 const missing={...app.env};delete missing.ACCESS_AUD;
 assert.equal(await app.auth.ownerIdentity(new Request(origin,{headers:{Cookie:`CF_Authorization=${app.ownerToken}`}}),missing),null);
});
test('owner login returns only to a garage view, never an external redirect',async()=>{
 const app=await fixture(),headers={'Cf-Access-Jwt-Assertion':app.ownerToken};
 const safe=await app.request('/admin/login?return='+encodeURIComponent('/#guide'),{headers});assert.equal(safe.status,303);assert.equal(safe.headers.get('Location'),origin+'/#guide');
 assert.match(safe.headers.get('Set-Cookie'),/__Host-garage-session=.*; Path=\/; Secure; HttpOnly; SameSite=Lax/);
 const ownCookie=safe.headers.get('Set-Cookie').split(';')[0];assert.equal((await(await app.request('/api/session',{headers:{Cookie:ownCookie}})).json()).canEdit,true);
 const logout=await app.request('/api/logout',{method:'POST',headers:{Origin:origin}});assert.equal(logout.status,200);assert.match(logout.headers.get('Set-Cookie'),/Max-Age=0/);
 assert.equal((await app.request('/api/logout',{method:'POST',headers:{Origin:'https://evil.example'}})).status,403);
 const unsafe=await app.request('/admin/login?return='+encodeURIComponent('https://evil.example'),{headers});assert.equal(unsafe.headers.get('Location'),origin+'/');
 assert.equal((await app.request('/admin/login')).status,401);
 delete app.env.OWNER_EMAIL;assert.equal((await app.request('/admin/login',{headers})).status,503);
});
test('signed-in writes still require same-origin JSON requests and a current revision',async()=>{
 const app=await fixture(),state=Records.initialState();
 assert.equal((await app.request('/api/garage',put(state,app.ownerToken,0,{Origin:'https://evil.example'}))).status,403);
 assert.equal((await app.request('/api/garage',put(state,app.ownerToken,0,{'Content-Type':'text/plain'}))).status,415);
 assert.equal((await app.request('/api/garage',put(state,app.ownerToken,0,{'If-Match':''}))).status,428);
 assert.equal((await app.request('/api/garage',put({schema:1},app.ownerToken))).status,400);
 assert.deepEqual(await(await app.request('/api/garage',put(state,app.ownerToken))).json(),{revision:1});
 state.logs[0].title='Stale change';assert.equal((await app.request('/api/garage',put(state,app.ownerToken))).status,409);
 const published=await(await app.request('/api/garage')).json();assert.notEqual(published.state.logs[0].title,'Stale change');assert.equal(published.revision,1);
 const next=await Promise.all([app.request('/api/garage',put(state,app.ownerToken,1)),app.request('/api/garage',put(state,app.ownerToken,1))]);assert.deepEqual(next.map(x=>x.status).sort(),[200,409]);
});
test('photos and unicode notes round-trip through durable chunks and obsolete chunks are removed',async()=>{
 const app=await fixture(),state=Records.initialState();state.logs[0].body='Ski-Doo measurements: été ❄';
 state.photos.push({id:'uploaded',sled:'early',title:'Chassis detail',src:'data:image/jpeg;base64,'+'A'.repeat(400000)});
 assert.equal((await app.request('/api/garage',put(state,app.ownerToken))).status,200);
 assert(app.storage.values.get('meta').chunks>1);
 const published=await(await app.request('/api/garage')).json();assert.equal(published.state.photos.at(-1).src,state.photos.at(-1).src);assert.equal(published.state.logs[0].body,state.logs[0].body);
 assert.equal((await app.request('/api/garage',put(Records.initialState(),app.ownerToken,1))).status,200);
 assert.equal(app.storage.values.get('meta').chunks,1);assert.equal(app.storage.values.has('state:1'),false);
});
test('new orders stay gated while explicitly imported historical purchases remain intact',async()=>{
 const app=await fixture(),state=Records.initialState();state.parts[0].status='Ordered';state.parts[0].cost=123.45;
 assert.equal((await app.request('/api/garage',put(state,app.ownerToken))).status,422);
 assert.equal((await app.request('/api/garage',put(state,app.ownerToken,0,{'X-Garage-Import':'1'}))).status,200);
 const saved=(await(await app.request('/api/garage')).json()).state;assert.equal(saved.parts[0].cost,123.45);assert.equal(saved.parts[0].status,'Ordered');assert.equal(saved.guides.sleds.early.steps.chassis,undefined);
 assert.equal((await app.request('/api/garage',put(state,'',1,{'X-Garage-Import':'1'}))).status,401);
});
test('oversized bodies and unsafe photo sources are rejected without replacing published data',async()=>{
 const app=await fixture(),state=Records.initialState();
 assert.equal((await app.request('/api/garage',put(state,app.ownerToken,0,{'Content-Length':String(app.worker.MAX_BYTES+1)}))).status,413);
 state.photos.push({id:'bad-photo',sled:'early',title:'Bad photo',src:'data:image/svg+xml;base64,PHN2Zz4='});
 assert.equal((await app.request('/api/garage',put(state,app.ownerToken))).status,400);
 assert.deepEqual(await(await app.request('/api/garage')).json(),{revision:0,state:null});
});
