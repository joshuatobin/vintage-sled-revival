(function(root){
'use strict';
const CATEGORIES=['Engine & ignition','Fuel system','Chaincase & drive','Track & suspension','Electrical','Body & cosmetics','Cables & brakes','Research & setup'];
const STATUSES=['Inspect','Needed','Ordered','On hand','Installed','Not required'];
const NAMES={early:'Early Ski-Doo',eight:'1968 Olympique 300 E'};
const source68='https://www.vintagesnow.com/Ski-Doo_files/1968%20Ski-doo%20Parts%20List%20.pdf';
const sourceEarly='https://vintagesnow.com/Ski-Doo_files/1960-1965%20Ski-doo%20Parts%20List.pdf';
const sourceCodes='https://www.trailz.net/pub/Snowmobiles/SKIDOO/1996-1997/1997/MSPE_A97.PDF';
const baseParts=[
 ['Crankshaft seals & engine leak test','Engine & ignition','High','Identify installed engine. Pressure/vacuum test using the correct service procedure before deciding on seals.'],
 ['Piston, rings & cylinder inspection','Engine & ignition','High','Measure bore, wear and clearances before selecting standard or oversize parts.'],
 ['Wrist pin & small-end bearing','Engine & ignition','Normal','Inspect during engine assessment; match to measured piston and installed engine.'],
 ['Engine gasket set','Engine & ignition','High','Select by installed engine and planned disassembly.'],
 ['Spark plug & ignition lead','Engine & ignition','High','Confirm specified plug and gap from the applicable manual.'],
 ['Points, condenser & ignition coil','Engine & ignition','High','Inspect and test ignition; replace failed or worn components.'],
 ['Recoil rope, spring & pawls','Engine & ignition','Normal','Inspect recoil action and engagement before ordering.'],
 ['Carburetor service kit','Fuel system','High','Read carburetor model stamping first. Select the correct diaphragm/gasket kit; do not assume a float carburetor.'],
 ['Fuel lines, filter & fittings','Fuel system','High','Inspect all lines and connections; confirm compatible material, diameter and routing.'],
 ['Fuel tank, cap & gasket','Fuel system','High','Inspect for corrosion and leaks; clean tank. Decide on repair or replacement after inspection.'],
 ['Drive belt','Chaincase & drive','High','Confirm exact belt specification for installed drive components.'],
 ['Drive & driven clutch service','Chaincase & drive','Normal','Inspect sheaves, bushings and springs; identify actual clutch assemblies.'],
 ['Chaincase seals & cover gasket','Chaincase & drive','High','Inspect leaks, bearings and oil condition. Confirm lubricant and quantity in applicable manual.'],
 ['Drive chain, sprockets & bearings','Chaincase & drive','Normal','Inspect condition and tension; match sprocket and chain dimensions before ordering.'],
 ['Bogie wheels, bearings & axles','Track & suspension','High','Count installed wheels and inspect each wheel, bearing and axle. Record actual replacement quantity.'],
 ['Suspension springs & hardware','Track & suspension','Normal','Inspect spring condition, alignment and fasteners.'],
 ['Track & drive sprockets','Track & suspension','High','Inspect rubber, drive engagement and damage; measure dimensions before ordering.'],
 ['Skis, wear bars & pivot hardware','Track & suspension','High','Inspect ski steel, wear bars and pivots; confirm mounting pattern.'],
 ['Steering linkage & bushings','Track & suspension','High','Inspect play, tie rods and fasteners.'],
 ['Wiring, switches & grounds','Electrical','High','Inspect brittle wiring and grounds. Measure lighting voltage and identify installed charging components.'],
 ['Headlight assembly & mounting hardware','Electrical','High','Confirm lamp voltage, mounting hole, base and all fasteners. Early pedestal replacement lead is in the supplier directory.'],
 ['Taillight & lens','Electrical','Normal','Confirm lamp style and operating voltage.'],
 ['Hood assessment / fiberglass repair','Body & cosmetics','Normal','Match the existing hood before buying. Inspect cracks and mounting points.'],
 ['Seat cover, foam & base','Body & cosmetics','Normal','Inspect seat base and measure before selecting a cover.'],
 ['Windshield, trim & hardware','Body & cosmetics','Normal','Match hood, hole pattern, dimensions and trim.'],
 ['Decals, paint & body fasteners','Body & cosmetics','Cosmetic','Confirm chassis model/year before selecting model-specific decals.'],
 ['Throttle and brake cables','Cables & brakes','High','Inspect for fraying, corrosion and free movement; verify ends and lengths.'],
 ['Brake friction parts & return hardware','Cables & brakes','High','Identify installed brake assembly and inspect wear and reliable return.'],
 ['Fuel mixture & service-fluid specification','Research & setup','High','Verify premix ratio and chaincase fluid from the applicable operator manual and installed engine. No ratio assumed.']
];
const BUILT_IN_PHOTOS=[
 {id:'photo-front',sled:'early',title:'Front hood & windshield',src:'assets/IMG_6641.jpg'},
 {id:'photo-motor',sled:'early',title:'Rotax engine & serial plate',src:'assets/IMG_6642.jpg'},
 {id:'photo-chart',sled:'early',title:'Owner-supplied engine comparison chart',src:'assets/IMG_6644.jpg'},
 {id:'photo-eight-porch',sled:'eight',title:'1968 Ski-Doo on the porch',src:'assets/IMG_1299.jpg'},
 {id:'photo-eight-badge',sled:'eight',title:'Super Olympique E seat badge',src:'assets/IMG_4522.jpg'},
 {id:'photo-eight-plate',sled:'eight',title:'Chassis serial plate — as photographed',src:'assets/IMG_4523.jpg'}
];
function mergeBuiltInPhotos(saved){for(const p of BUILT_IN_PHOTOS)if(!saved.photos.some(x=>x.id===p.id||x.src===p.src))saved.photos.push({...p});return saved;}
function initialState(){const parts=[];for(const sled of ['early','eight'])baseParts.forEach((p,i)=>parts.push({id:`${sled}-${i}`,sled,name:p[0],category:p[1],priority:p[2],notes:p[3],status:'Inspect',qty:1,cost:0,number:'',url:''}));parts.push({id:'early-year',sled:'early',name:'Confirm chassis year & model',category:'Research & setup',priority:'High',notes:'Photograph full side, dashboard, chassis markings and carburetor tag. Engine serial alone does not date chassis.',status:'Needed',qty:1,cost:0,number:'',url:''},{id:'eight-plate',sled:'eight',name:'Review SE8 data plate & engine tag',category:'Research & setup',priority:'High',notes:'Plate photo is in the archive; supplied text says 3E8-131356; SE8 maps to a 1968 Olympique 300 E.',status:'Needed',qty:1,cost:0,number:'',url:''},{id:'eight-battery',sled:'eight',name:'Battery, starter & charging circuit',category:'Electrical',priority:'High',notes:'300 E is the electric-start model. Identify and test installed hardware; verify battery voltage before ordering.',status:'Inspect',qty:1,cost:0,number:'',url:''});return{schema:1,parts,logs:[{id:'log-early',sled:'early',date:'2026-10-18',title:'The identification puzzle',body:'Front and engine photos added. Early body style previously estimated as 1963–1965, but chassis year remains unconfirmed. Engine number appears to be 1308696. The supplied comparison chart suggests a 1967 engine; this is a lead, not proof of an engine swap.'},{id:'log-eight',sled:'eight',date:'2026-10-19',title:'1968 restoration file opened',body:'Imported the restoration brief. Model code SE8 is documented as the 1968 Olympique 300 E. The plate is currently a text transcription (3E8-131356), so identification remains provisional. Parts list converted into inspection and purchasing tasks; sizes and fluids are not assumed.'}],photos:BUILT_IN_PHOTOS.map(p=>({...p}))};}
function validState(s){return s&&s.schema===1&&Array.isArray(s.parts)&&Array.isArray(s.logs)&&Array.isArray(s.photos)&&s.parts.every(p=>p&&typeof p.id==='string'&&['early','eight'].includes(p.sled)&&typeof p.name==='string'&&CATEGORIES.includes(p.category)&&STATUSES.includes(p.status)&&Number.isFinite(Number(p.cost))&&Number(p.cost)>=0&&Number.isFinite(Number(p.qty))&&Number(p.qty)>0)&&s.logs.every(x=>x&&typeof x.id==='string'&&['early','eight'].includes(x.sled)&&typeof x.title==='string'&&typeof x.body==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.date))&&s.photos.every(x=>x&&typeof x.id==='string'&&['early','eight'].includes(x.sled)&&typeof x.title==='string'&&typeof x.src==='string'&&(BUILT_IN_PHOTOS.some(p=>p.src===x.src)||/^data:image\/(jpeg|png|webp);base64,/.test(x.src)));}
const api={CATEGORIES,STATUSES,NAMES,source68,sourceEarly,sourceCodes,BUILT_IN_PHOTOS,mergeBuiltInPhotos,initialState,validState};root.GarageRecords=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
