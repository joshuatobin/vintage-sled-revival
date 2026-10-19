const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function boot(saved,hash=''){
 const elements=new Map(),handlers={};let storage=saved?JSON.stringify(saved):null;
 function el(k){if(!elements.has(k))elements.set(k,{innerHTML:'',textContent:'',value:'',open:false,dataset:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},removeAttribute(){},addEventListener(e,f){(handlers[k+':'+e]??=[]).push(f)},showModal(){this.open=true},close(){this.open=false},focus(){},querySelector(q){return el(k+' '+q)}});return elements.get(k)}
 const context={console,Intl,Date,Math,JSON,Number,String,Array,Object,Error,Set,URL,Blob,setTimeout:()=>0,clearTimeout(){},localStorage:{getItem:()=>storage,setItem:(k,v)=>storage=v},location:{hash},window:{addEventListener(){},scrollTo(){}},document:{querySelector:el,querySelectorAll:()=>[],addEventListener(e,f){(handlers['doc:'+e]??=[]).push(f)},createElement:()=>({click(){}})},FormData:class extends Map{constructor(form){super(Object.entries(form.values||{}))}},crypto:{randomUUID:()=>Math.random().toString(36)},confirm:()=>true};vm.createContext(context);
 for(const name of ['guide.js','guide-ui.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..','dist',name),'utf8'),context,{filename:name});
 return{run:s=>vm.runInContext(s,context),el,storage:()=>JSON.parse(storage),async fire(key,event){for(const handler of handlers[key]||[])await handler(event)}};
}

test('all six pages render, including guide deep link and required discovery prompts',()=>{const app=boot(null,'#guide');assert(app.el('#main').innerHTML.includes('Fill the gaps in the photo evidence'));for(const view of ['overview','sleds','parts','journal','archive','guide']){app.run(`render('${view}')`);const html=app.el('#main').innerHTML;assert(html.length>500,view);assert(!html.includes('undefined'),view);}app.run("render('overview')");assert(app.el('#main').innerHTML.includes('Pick up where you left off.'));assert(app.el('#main').innerHTML.includes('data-guide-sled="eight"'));});
test('locked stage explains its blockers and disables completion form',()=>{const app=boot();app.run("guideStepId='first-run';render('guide')");assert(app.el('#main').innerHTML.includes('This step is waiting on earlier findings.'));assert(app.el('#main').innerHTML.includes('<fieldset disabled>'));});
test('existing saved parts, notes, user photos and guide drafts survive reload',()=>{const one=boot();const saved=JSON.parse(one.run('JSON.stringify(state)'));saved.parts[0].status='Ordered';saved.parts[0].cost=123.45;saved.logs.push({id:'keep-note',sled:'early',date:'2026-10-19',title:'Keep',body:'Saved measurements'});saved.photos.push({id:'keep-photo',sled:'eight',title:'User upload',src:'data:image/jpeg;base64,YQ=='});saved.guides.sleds.early.steps.engine={status:'blocked',data:{type:'Unknown'},blocker:'Need model stamp',updated:'2026-10-19T16:40:00Z'};const two=boot(saved);assert.equal(two.run('state.parts[0].cost'),123.45);assert.equal(two.run('state.parts[0].status'),'Ordered');assert.equal(two.run("state.logs.find(x=>x.id==='keep-note').body"),'Saved measurements');assert.equal(two.run("state.photos.filter(x=>x.sled==='eight').length"),4);assert.equal(two.run("guideRecord('early','engine').blocker"),'Need model stamp');assert.equal(two.run('validState(state)'),true);});
test('new orders are blocked until discovery and fitment are recorded; old purchases remain recorded',()=>{const app=boot();assert(app.run("guidePurchaseErrors(state.parts[0],'Ordered').length")>0);assert.equal(app.run("guidePurchaseErrors(state.parts[0],'Needed').length"),0);app.run("state.parts[0].status='Ordered';persist()");assert.equal(app.storage().parts[0].status,'Ordered');});
test('gallery, filtered tracker and both profile photos remain available',()=>{const app=boot();app.run("partSled='eight';partCategory='Electrical';partSearch='battery';render('parts')");assert.equal(app.run('filteredParts().length'),1);assert(app.el('#part-rows').innerHTML.includes('Battery, starter'));app.run("photoSled='eight';render('archive')");assert(app.el('#main').innerHTML.includes('IMG_4523.jpg'));app.run("selectedSled='eight';render('sleds')");assert(app.el('#main').innerHTML.includes('IMG_1299.jpg'));assert(app.el('#main').innerHTML.includes('Continue walkthrough'));});

test('supplied starting files are ready while both chassis identities and ordering remain unresolved',()=>{
 const app=boot(null,'#guide');
 for(const sled of ['early','eight']){
  assert.equal(app.run(`Guide.isDone(Guide.steps.find(s=>s.id==='intake'),state,'${sled}')`),true);
  assert.equal(app.run(`recordedChassis('${sled}')`),null);
  assert.equal(app.run(`Guide.summary(state,'${sled}').done`),1);
  assert.equal(app.run(`Guide.summary(state,'${sled}').next.id`),'evidence');
 }
 const html=app.el('#main').innerHTML;
 assert(html.includes('1963?'));assert(html.includes('3 photos already in this file'));assert(html.includes('Ordering locked'));assert(html.includes('Dashboard / controls view'));
 app.run("render('parts')");assert(app.el('#main').innerHTML.includes('Verify the chassis year and model before ordering.'));
});
test('upgrading a saved file adds only its starting record and preserves user corrections on reload',()=>{
 const one=boot(),saved=JSON.parse(one.run('JSON.stringify(state)'));
 delete saved.guides.sleds.early.steps.intake;delete saved.guides.sleds.eight.steps.intake;
 saved.guides.sleds.early.steps.chassis={status:'draft',data:{year:'1964',model:'Research in progress'},blocker:'Need a full side photo',updated:'2026-10-19T16:40:00Z'};
 const two=boot(saved);
 assert.equal(two.run("guideRecord('early','intake').data.year"),'1963?');
 assert.equal(two.run("guideRecord('early','chassis').data.year"),'1964');
 assert.equal(two.run("recordedChassis('early')"),null);
 two.run("state.guides.sleds.early.steps.intake.data.year='Unknown';persist()");
 const three=boot(two.storage());assert.equal(three.run("guideRecord('early','intake').data.year"),'Unknown');
});
test('an attempted order returns to the walkthrough with the identity blocker visible',async()=>{
 const app=boot(),target={dataset:{partStatus:'early-0'},value:'Ordered'};await app.fire('doc:change',{target});assert.equal(target.value,'Inspect');
 assert(app.el('#main').innerHTML.includes('Verify the chassis year and model from documented evidence before ordering.'));
 assert.equal(app.run("state.parts[0].status"),'Inspect');
});

test('old purchases stay editable while moving an ordered item to an unverified sled is blocked',async()=>{
 const app=boot();app.run("state.parts[0].status='Ordered';persist();editing={type:'part',id:state.parts[0].id}");
 const original=JSON.parse(app.run('JSON.stringify(state.parts[0])')),form=app.el('#editor-form');
 form.values={...original,sled:'eight',notes:'Receipt preserved'};
 await app.fire('#editor-form:submit',{preventDefault(){},currentTarget:form});
 assert.equal(app.run('state.parts[0].sled'),'early');assert.equal(app.storage().parts[0].sled,'early');
 form.values={...original,notes:'Receipt preserved'};
 await app.fire('#editor-form:submit',{preventDefault(){},currentTarget:form});
 assert.equal(app.storage().parts[0].status,'Ordered');assert.equal(app.storage().parts[0].notes,'Receipt preserved');
});
