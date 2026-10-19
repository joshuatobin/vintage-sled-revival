const test=require('node:test');
const assert=require('node:assert/strict');
const Guide=require('../dist/guide.js');
function state(){return{schema:1,parts:[],logs:[],photos:[{id:'evidence',sled:'early',title:'Test evidence',src:'data:image/jpeg;base64,YQ=='}],guides:Guide.empty()};}
function data(step){return Object.fromEntries(step.fields.map(f=>[f.id,f.type==='check'?true:f.type==='photo'?'evidence':f.type==='number'?'1963':f.type==='date'?'2026-10-19':f.type==='select'?(step.checks?.find(c=>c[0]===f.id)?.[1]||f.options[0]):'Documented finding / applicable factory reference']));}
function finishDiscovery(s){for(const step of Guide.steps.filter(s=>s.phase==='discovery'))assert.equal(Guide.save(s,'early',step.id,data(step),'complete').ok,true,step.id);}
test('a file without supplied photos starts at intake and locks later stages',()=>{const s=state();assert.equal(Guide.summary(s,'early').next.id,'intake');assert(Guide.blockers(Guide.steps.find(s=>s.id==='engine-inspection'),s,'early').length>0);assert.equal(Guide.save(s,'early','engine-inspection',{},'complete').ok,false);});
test('empty findings and unresolved identity cannot be completed',()=>{const s=state();assert.equal(Guide.save(s,'early','evidence',{},'complete').ok,false);for(const id of ['intake','evidence']){const step=Guide.steps.find(s=>s.id===id);assert(Guide.save(s,'early',id,data(step),'complete').ok);}const step=Guide.steps.find(s=>s.id==='chassis'),d=data(step);d.conclusion='Unresolved — more research needed';const result=Guide.save(s,'early',step.id,d,'complete');assert.equal(result.ok,false);assert(result.errors.some(e=>e.field==='conclusion'));assert.equal(Guide.isDone(step,s,'early'),false);});
test('drafts and blocked notes persist without falsely completing discovery',()=>{const s=state();assert.equal(Guide.save(s,'early','engine',{type:'Unknown'},'draft').ok,true);assert.equal(Guide.save(s,'early','engine',{},'blocked','').ok,false);assert.equal(Guide.save(s,'early','engine',{type:'Unknown'},'blocked','Need a readable engine type tag').ok,true);const reloaded=Guide.migrate(JSON.parse(JSON.stringify(s.guides)));assert.equal(reloaded.sleds.early.steps.engine.blocker,'Need a readable engine type tag');assert.equal(Guide.summary(s,'early').done,0);});
test('matching photo evidence is required, absent plate can be documented',()=>{const s=state(),step=Guide.steps.find(s=>s.id==='evidence'),d=data(step);assert(Guide.save(s,'early','intake',data(Guide.steps[0]),'complete').ok);d.plateDisposition='No plate or markings found';d.platePhoto='';d.plateSearch='Searched both tunnel sides, dashboard and under seat';assert.equal(Guide.save(s,'early',step.id,d,'complete').ok,true);d.overall='foreign-photo';assert.equal(Guide.save(s,'early',step.id,d,'complete').ok,false);});
test('completing discovery unlocks inspection; reopening a prior finding relocks downstream steps',()=>{const s=state();finishDiscovery(s);const inspect=Guide.steps.find(x=>x.id==='engine-inspection');assert.deepEqual(Guide.blockers(inspect,s,'early'),[]);assert.equal(Guide.save(s,'early',inspect.id,data(inspect),'complete').ok,true);assert.equal(Guide.isDone(inspect,s,'early'),true);Guide.save(s,'early','chassis',{conclusion:'Unresolved — more research needed'},'draft');assert.equal(Guide.isDone(inspect,s,'early'),false);assert.equal(Guide.summary(s,'early').next.id,'chassis');});
test('inspection requires a disposition for every linked part',()=>{const s=state();finishDiscovery(s);const step=Guide.steps.find(x=>x.id==='engine-inspection');s.parts.push({id:'seal',sled:'early',category:'Engine & ignition',name:'Crankshaft seal',status:'Inspect'});assert.equal(Guide.save(s,'early',step.id,data(step),'complete').ok,false);s.parts[0].status='Needed';assert.equal(Guide.save(s,'early',step.id,data(step),'complete').ok,true);});
test('purchasing plan rejects missing specification and unsafe supplier URLs',()=>{const s=state(),step=Guide.steps.find(x=>x.id==='parts-plan'),rec={data:data(step)};s.parts.push({id:'belt',sled:'early',category:'Chaincase & drive',name:'Belt',status:'Needed',number:'',url:'javascript:alert(1)'});assert.equal(Guide.issues(step,rec,s,'early').length,2);s.parts[0].number='Verified belt specification';s.parts[0].url='https://example.com/part';assert.equal(Guide.issues(step,rec,s,'early').length,0);});
test('repairs require installed work, and reopening a part invalidates completion',()=>{const s=state(),step=Guide.steps.find(x=>x.id==='repairs'),rec={data:data(step)};s.parts.push({id:'belt',sled:'early',category:'Chaincase & drive',name:'Belt',status:'On hand',notes:'Receipt only'});assert.equal(Guide.issues(step,rec,s,'early').length,1);s.parts[0].status='Installed';assert.equal(Guide.issues(step,rec,s,'early').length,0);s.parts[0].status='Needed';assert.equal(Guide.issues(step,rec,s,'early').length,1);});
test('failed pre-start and run results stay open',()=>{const s=state();for(const id of ['prestart','first-run']){const step=Guide.steps.find(x=>x.id===id),d=data(step);d[step.checks[0][0]]='Not passed';assert(Guide.issues(step,{data:d},s,'early').length>0);}});
test('guide state migrates without touching existing photos, notes or parts',()=>{const s=state();delete s.guides;s.parts.push({id:'existing',status:'Ordered',cost:123});s.logs.push({title:'Keep this note'});const before=JSON.stringify({parts:s.parts,logs:s.logs,photos:s.photos});s.guides=Guide.migrate(s.guides);assert.equal(JSON.stringify({parts:s.parts,logs:s.logs,photos:s.photos}),before);assert.equal(Guide.summary(s,'early').next.id,'intake');});
test('deleting evidence reopens a completed step',()=>{const s=state();finishDiscovery(s);s.photos=[];assert.equal(Guide.isDone(Guide.steps.find(s=>s.id==='evidence'),s,'early'),false);assert.equal(Guide.summary(s,'early').next.id,'intake');});
test('migrate only retains known steps and safe typed fields',()=>{const s=Guide.empty();s.sleds.early.steps.chassis={status:'complete',data:{year:{bad:true},model:'Test',unknown:'skip'}};s.sleds.early.steps.unknown={status:'complete'};const result=Guide.migrate(s);assert.equal(result.sleds.early.steps.chassis.data.model,'Test');assert.equal(result.sleds.early.steps.chassis.data.year,undefined);assert.equal(result.sleds.early.steps.unknown,undefined);});

test('the supplied starting estimate never confirms a chassis or permits ordering',()=>{
 const s=state();s.photos.push({id:'provided',sled:'early',title:'Starting view',src:'assets/IMG_6641.jpg'});
 const before=JSON.stringify({parts:s.parts,logs:s.logs,photos:s.photos});
 s.guides=Guide.migrate(s.guides,s);
 assert.equal(Guide.isDone(Guide.steps[0],s,'early'),true);
 assert.equal(Guide.summary(s,'early').next.id,'evidence');
 assert.equal(s.guides.sleds.early.steps.chassis,undefined);
 assert.match(Guide.purchaseIssues(s,{sled:'early',number:'Known specification',url:'https://example.com/part'},'Ordered')[0],/Verify the chassis year and model/);
 assert.equal(JSON.stringify({parts:s.parts,logs:s.logs,photos:s.photos}),before);
});
test('chassis completion needs the earlier photo evidence and a documented verification method',()=>{
 const s=state(),chassis=Guide.steps.find(s=>s.id==='chassis'),evidence=Guide.steps.find(s=>s.id==='evidence');
 assert.equal(Guide.save(s,'early','chassis',data(chassis),'complete').ok,false);
 assert(Guide.save(s,'early','intake',data(Guide.steps[0]),'complete').ok);
 assert(Guide.save(s,'early','evidence',data(evidence),'complete').ok);
 const findings=data(chassis);delete findings.method;delete findings.photo;
 assert.equal(Guide.save(s,'early','chassis',findings,'complete').ok,false);
 assert(Guide.save(s,'early','chassis',data(chassis),'complete').ok);
 assert.equal(Guide.isDone(chassis,s,'early'),true);
 Guide.save(s,'early','evidence',data(evidence),'draft');
 assert.equal(Guide.isDone(chassis,s,'early'),false);
});
test('ordering requires verified discovery plus per-part fitment, and relocks if evidence is lost',()=>{
 const s=state(),part={sled:'early',number:'Verified specification',url:'https://example.com/part'};
 finishDiscovery(s);
 assert.deepEqual(Guide.purchaseIssues(s,part,'Ordered'),[]);
 assert(Guide.purchaseIssues(s,{...part,number:''},'Ordered').length>0);
 assert(Guide.purchaseIssues(s,{...part,url:'javascript:alert(1)'},'Ordered').length>0);
 assert(Guide.purchaseIssues(s,{...part,sled:'eight'},'Ordered').length>0);
 s.photos=[];
 assert.match(Guide.purchaseIssues(s,part,'Ordered')[0],/Verify the chassis year and model/);
 assert.deepEqual(Guide.purchaseIssues(s,part,'On hand'),[]);
});
