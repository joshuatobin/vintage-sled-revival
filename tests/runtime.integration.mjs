import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import Records from '../dist/records.js';

// The test certificate server is intercepted in this isolated runtime. There is
// no development auth bypass in the deployed Worker and no production writes.
const pair=await generateKeyPair('RS256');
const key=await exportJWK(pair.publicKey);key.kid='runtime-test';
const issuer='https://garage-runtime-test.cloudflareaccess.com',audience='runtime-test';
const token=await new SignJWT({email:'owner@example.com'}).setProtectedHeader({alg:'RS256',kid:key.kid}).setSubject('runtime-owner').setIssuer(issuer).setAudience(audience).setIssuedAt().setExpirationTime('1h').sign(pair.privateKey);
const bundle=await build({entryPoints:['worker/index.mjs'],bundle:true,write:false,format:'esm',platform:'browser',target:'es2022',external:['cloudflare:workers']});
const runtime=new Miniflare(convertV4MiniflareOptions({workers:[{
  name:'garage-runtime-test',modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-10-19',
  durableObjects:{GARAGE:{className:'GarageStore',useSQLite:true}},
  bindings:{ACCESS_TEAM_DOMAIN:issuer,ACCESS_AUD:audience,OWNER_EMAIL:'owner@example.com'},
  outboundService:async request=>{
    assert.equal(request.url,issuer+'/cdn-cgi/access/certs');
    return Response.json({keys:[key]});
  },
}]}));
try{
 const origin='https://garage.example.test';
 const read=await runtime.dispatchFetch(origin+'/api/garage');assert.equal(read.status,200);assert.deepEqual(await read.json(),{revision:0,state:null});
 const state=Records.initialState();state.logs[0].body='Runtime persistence test ❄';state.photos.push({id:'runtime-photo',sled:'early',title:'Detail',src:'data:image/jpeg;base64,'+'A'.repeat(300000)});
 const options={method:'PUT',headers:{Origin:origin,'Content-Type':'application/json','If-Match':'"0"',Cookie:`__Host-garage-session=${token}`},body:JSON.stringify(state)};
 const denied=await runtime.dispatchFetch(origin+'/api/garage',{...options,headers:{...options.headers,Cookie:''}});assert.equal(denied.status,401);
 const save=await runtime.dispatchFetch(origin+'/api/garage',options);assert.equal(save.status,200,await save.clone().text());assert.deepEqual(await save.json(),{revision:1});
 const record=await(await runtime.dispatchFetch(origin+'/api/garage')).json();assert.equal(record.state.logs[0].body,state.logs[0].body);assert.equal(record.state.photos.at(-1).src,state.photos.at(-1).src);
 const conflict=await runtime.dispatchFetch(origin+'/api/garage',options);assert.equal(conflict.status,409);
 const session=await(await runtime.dispatchFetch(origin+'/api/session',{headers:{Cookie:options.headers.Cookie}})).json();assert.equal(session.canEdit,true);assert.equal(Object.hasOwn(session,'token'),false);
 console.log('Worker runtime passed: public reads, signed owner writes, SQLite photo chunks, revision conflicts, and no token disclosure.');
}finally{await runtime.dispose();}
