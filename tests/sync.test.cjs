const test=require('node:test'),assert=require('node:assert/strict');
const GarageSync=require('../dist/sync.js');
function storage(){const values=new Map();return{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key),values};}
function fixture({owner=true,save,offline=false}={}){
 const local=storage(),calls=[];let revision=0,published=null;
 const sync=new GarageSync({storage:local,fetch:async(url,options={})=>{
  calls.push({url,options});
  if(url==='/api/session')return Response.json({canEdit:owner,configured:true});
  if(options.method==='PUT'){
   if(save)return save(options);
   assert.equal(options.headers['If-Match'],`"${revision}"`);
   published=JSON.parse(options.body);return Response.json({revision:++revision});
  }
  if(offline)throw Error('Offline');
  return Response.json({revision,state:published});
 }});
 return{sync,local,calls,published:()=>published};
}
test('anonymous sessions cannot enqueue writes or overwrite a legacy browser record',async()=>{
 const app=fixture({owner:false});app.local.setItem('tobin-skidoo-garage-v1','{"keep":"original"}');
 await app.sync.load();assert.equal(app.sync.queue({logs:[]}),false);assert.equal(app.calls.filter(x=>x.options.method==='PUT').length,0);
 assert.equal(app.local.getItem('tobin-skidoo-garage-v1'),' {"keep":"original"}'.trim());
});
test('writes publish serially and keep edits made during an in-flight save',async()=>{
 let release,started;const firstStarted=new Promise(resolve=>started=resolve),gate=new Promise(resolve=>release=resolve);let saves=0;
 const app=fixture({save:async options=>{const number=++saves;if(number===1){started();await gate;}assert.equal(options.headers['If-Match'],`"${number-1}"`);return Response.json({revision:number});}});
 await app.sync.load();assert(app.sync.queue({title:'First'}));const saving=app.sync.flush();await firstStarted;
 assert(app.sync.queue({title:'Second'}));release();assert.equal(await saving,true);
 assert.equal(saves,2);assert.equal(app.sync.revision,2);assert.equal(app.local.getItem('tobin-skidoo-garage-draft-v2'),null);
 assert.equal(app.sync.status,'published');
});
test('conflicts preserve the newest draft, stop retries and never overwrite the shared revision',async()=>{
 const app=fixture({save:async()=>Response.json({error:'Newer progress is available.'},{status:409})});await app.sync.load();
 assert(app.sync.queue({title:'Keep my finding'}));assert.equal(await app.sync.flush(),false);
 assert.equal(app.sync.status,'conflict');assert.equal(app.sync.writable,false);assert.equal(app.sync.readBrowserRecord('draft').state.title,'Keep my finding');
 assert.equal(await app.sync.retry(),false);assert.equal(app.calls.filter(x=>x.options.method==='PUT').length,1);
});
test('an expired session stops editing, while network failures can be retried with the draft intact',async()=>{
 const expired=fixture({save:async()=>Response.json({error:'Sign in again.'},{status:401})});await expired.sync.load();expired.sync.queue({title:'Unsaved'});
 assert.equal(await expired.sync.flush(),false);assert.equal(expired.sync.canEdit,false);assert.equal(expired.sync.status,'expired');assert.equal(expired.sync.readBrowserRecord('draft').state.title,'Unsaved');
 let attempts=0;const network=fixture({save:async()=>{if(++attempts===1)throw Error('Connection lost');return Response.json({revision:1});}});await network.sync.load();network.sync.queue({title:'Retry me'});
 assert.equal(await network.sync.flush(),false);assert.equal(network.sync.readBrowserRecord('draft').state.title,'Retry me');assert.equal(await network.sync.retry(),true);
 assert.equal(network.sync.status,'published');
});
test('shared-read failure never enables editing and never changes local backups',async()=>{
 const app=fixture({offline:true});app.local.setItem('tobin-skidoo-garage-v1','{"keep":true}');
 await assert.rejects(()=>app.sync.load(),/could not be loaded/);assert.equal(app.sync.writable,false);assert.equal(app.local.getItem('tobin-skidoo-garage-v1'),'{"keep":true}');
});
test('full browser backup storage does not silently prevent publishing',async()=>{
 const app=fixture();await app.sync.load();app.local.setItem=()=>{throw Error('Quota exceeded');};
 assert(app.sync.queue({title:'Shared record'}));assert.match(app.sync.message,/storage is full/);assert.equal(await app.sync.flush(),true);assert.equal(app.published().title,'Shared record');
});
test('explicit imports carry their intent without changing the original browser records',async()=>{
 const app=fixture();app.local.setItem('tobin-skidoo-garage-v1','{"legacy":true}');await app.sync.load();
 app.sync.queue({title:'Imported'},{importing:true});await app.sync.flush();
 assert.equal(app.calls.find(x=>x.options.method==='PUT').options.headers['X-Garage-Import'],'1');assert.equal(app.local.getItem('tobin-skidoo-garage-v1'),'{"legacy":true}');
});
