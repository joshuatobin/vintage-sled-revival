'use strict';
let designActiveSled='early';
const LIVE_GARAGE='https://vintage-sled-revival.joshuatobin.workers.dev';
const homeEditionNames={classic:'Current layout',showroom:'Showroom',workbench:'Workbench','garage-doors':'Garage Doors','project-index':'Project Index','trail-map':'Trail Map','roll-up-bays':'Roll-Up Bays','sliding-workshop':'Sliding Workshop','open-bays':'Open Bays'};
function uiEdition(){const edition=document.documentElement?.dataset.uiEdition;return Object.hasOwn(homeEditionNames,edition)?edition:'classic';}
function isDesignPreview(){return document.documentElement?.dataset.uiPreview==='true'||garageSync.session?.preview===true;}
function designReviewBar(edition=uiEdition()){return isDesignPreview()?`<div class="design-review"><div><span class="design-review-dot" aria-hidden="true"></span><b>${homeEditionNames[edition]}</b><span>Design preview · read only</span></div><a href="${LIVE_GARAGE}" target="_blank" rel="noopener">Compare with the live site ↗</a></div>`:'';}
function designProject(sled){
 const info=Guide.summary(state,sled),intake=guideRecord(sled,'intake').data,chassis=recordedChassis(sled),photos=state.photos.filter(p=>p.sled===sled);
 return {sled,info,intake,chassis,photos,title:sled==='early'?'The early Ski-Doo':'The Olympique',photo:photos.find(p=>p.id===intake.overall)||photos[0],identity:chassis?chassis.year+' '+chassis.model:(intake.year||'Year unknown')+' '+(intake.model||'Ski-Doo'),badge:chassis?'Identity recorded':sled==='early'?'Chassis year unconfirmed':'Identity under review'};
}
function designPhoto(project,className=''){return project.photo?`<img class="${className}" src="${esc(project.photo.src)}" alt="${esc(project.photo.title)}">`:'<div class="design-photo-missing">Your project photos will appear here.</div>';}
function designActions(project){return `<div class="design-project-actions"><button class="design-primary" data-guide-sled="${project.sled}">${garageSync.canEdit?'Continue restoration':'Open walkthrough'} <span aria-hidden="true">→</span></button><button class="design-text" data-profile="${project.sled}">View project</button></div>`;}
function designResources(){return `<section class="design-resources" aria-labelledby="design-resources-title"><div><h2 id="design-resources-title">Everything behind the restoration.</h2><p>The evidence, the plan, and the notes from the bench.</p></div><div class="design-resource-links"><button data-nav="archive"><span aria-hidden="true">▧</span><b>Photos & manuals</b><small>Original photos and factory references</small></button><button data-nav="parts"><span aria-hidden="true">⊞</span><b>Parts & purchases</b><small>Inspection, fitment and actual costs</small></button><button data-nav="journal"><span aria-hidden="true">≡</span><b>Workshop journal</b><small>Measurements, discoveries and work</small></button></div></section>`;}
function designFootnote(){return `<p class="design-footnote">${isDesignPreview()?'This design preview shows the published garage. To add photos or save findings, open the live site.':'Joshua’s personal restoration log. Everyone can read published progress; only the owner can add photos and update findings.'}</p>`;}
function designProgressRing(project){const circumference=163.36;return `<div class="design-progress-ring" aria-label="${project.info.done} of ${project.info.total} guide steps complete"><svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="26"/><circle class="design-ring-fill" cx="30" cy="30" r="26" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference*(1-project.info.percent/100)}"/></svg><span>${project.info.done}<small>of ${project.info.total}</small></span></div>`;}
function showroomProject(project){const next=project.info.next,record=next?guideRecord(project.sled,next.id):null;return `<article class="showroom-project" aria-labelledby="showroom-${project.sled}"><div class="showroom-project-top"><div><p class="design-caption">${esc(project.identity)}</p><h3 id="showroom-${project.sled}">${project.title}</h3></div>${designProgressRing(project)}</div><div class="showroom-stage"><span>${esc(project.info.phase?.title||'Record complete')}</span><span>${project.photos.length} photos in the file</span></div><div class="showroom-next"><span class="design-caption">${record?.status==='blocked'?'Open question':'Next in the walkthrough'}</span><h4>${esc(next?next.title:'Restoration record complete')}</h4><p>${esc(record?.status==='blocked'?record.blocker:next?.summary||'Review the record or reopen a finding when evidence changes.')}</p></div>${designActions(project)}</article>`;}
function showroomHome(){
 const projects=['early','eight'].map(designProject);
 return `${designReviewBar('showroom')}<div class="ui-showroom"><header class="showroom-hero"><div class="showroom-intro"><p class="design-caption">Joshua’s Ski-Doo garage</p><h1>Vintage<br>Sled Revival</h1><p class="showroom-lead">Two vintage Ski-Doos.<br>From discovery to first ride.</p><p class="showroom-description">A personal restoration log, built around the actual machines. Follow the photos, the findings, and the work that brings them back.</p><button class="design-primary" data-home-section="design-projects-title" aria-controls="design-projects">Explore the projects <span aria-hidden="true">↓</span></button><span class="showroom-public-note">Open to everyone. A work in progress.</span></div><div class="showroom-photos">${projects.map(project=>`<button class="showroom-photo" data-profile="${project.sled}" aria-label="View ${project.title.toLowerCase()} project">${designPhoto(project)}<span class="showroom-photo-caption"><b>${project.title}</b><small>${esc(project.badge)}</small><i aria-hidden="true">↗</i></span></button>`).join('')}</div></header><section class="showroom-projects" id="design-projects" aria-labelledby="design-projects-title"><div class="design-section-heading"><div><p class="design-caption">In the garage</p><h2 id="design-projects-title" tabindex="-1">Two sleds. Their own stories.</h2></div><p>See where each project stands,<br>and what comes next.</p></div><div class="showroom-project-grid">${projects.map(showroomProject).join('')}</div></section>${designResources()}${designFootnote()}</div>`;
}
function workbenchHome(){
 const project=designProject(designActiveSled),next=project.info.next,record=next?guideRecord(project.sled,next.id):null,log=state.logs.filter(l=>l.sled===project.sled).slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
 return `${designReviewBar('workbench')}<div class="ui-workbench"><header class="workbench-intro"><div><p class="design-caption">Joshua’s personal restoration log</p><h1>Vintage Sled Revival</h1><p>Two Ski-Doo projects. Every photo, finding and next step in one place.</p></div><button class="design-text" data-nav="guide">About the walkthrough <span aria-hidden="true">↗</span></button></header><div class="workbench-project-switch" role="group" aria-label="Choose a project">${['early','eight'].map(sled=>{const item=designProject(sled);return `<button data-design-sled="${sled}" aria-pressed="${sled===designActiveSled}">${designPhoto(item)}<span><b>${item.title}</b><small>${esc(item.identity)}</small></span><span class="workbench-switch-status">${sled===designActiveSled?'Viewing':'View project'}</span></button>`;}).join('')}</div><section class="workbench-focus" aria-label="${project.title}"><div class="workbench-photo">${designPhoto(project)}<span class="workbench-photo-label">${esc(project.badge)}</span>${project.photo?`<button class="workbench-expand" data-photo="${esc(project.photo.id)}" aria-label="View full project photo">⤢</button>`:''}</div><div class="workbench-project"><div class="workbench-project-heading"><p class="design-caption">${esc(project.identity)}</p><h2>${project.title}</h2><div class="workbench-phase"><span aria-hidden="true"></span>${esc(project.info.phase?.title||'Record complete')}<small>${project.info.done} / ${project.info.total} steps complete</small></div></div><div class="workbench-next"><span class="design-caption">${record?.status==='blocked'?'Your open question':'Pick up from here'}</span><h3>${esc(next?.title||'Restoration record complete')}</h3><p>${esc(record?.status==='blocked'?record.blocker:next?.summary||'Review or reopen a finding as your evidence changes.')}</p>${designActions(project)}</div><p class="workbench-identity-note">${project.chassis?'The chassis finding is recorded. Each part still needs its own verified fitment.':'The working year is an estimate. Chassis verification comes before ordering parts.'}</p></div></section><div class="workbench-secondary"><section class="workbench-evidence"><div class="design-section-heading"><div><p class="design-caption">The evidence so far</p><h2>A closer look.</h2></div><button class="design-text" data-nav="archive">All photos</button></div><div class="workbench-photo-strip">${project.photos.slice(0,3).map(photo=>`<button data-photo="${esc(photo.id)}" aria-label="View ${esc(photo.title)}"><img src="${esc(photo.src)}" alt="${esc(photo.title)}" loading="lazy"><span>${esc(photo.title)}</span></button>`).join('')||'<p>Your evidence photos will appear here.</p>'}</div></section><section class="workbench-journal"><p class="design-caption">From the workshop journal</p><h2>${esc(log?.title||'A fresh page.')}</h2>${log?`<time datetime="${esc(log.date)}">${dateLabel(log.date)}</time><p>${esc(log.body.length>230?log.body.slice(0,230)+'…':log.body)}</p>`:'<p>Workshop findings will appear here as they’re recorded.</p>'}<button class="design-text" data-nav="journal">Read the journal <span aria-hidden="true">↗</span></button></section></div>${designResources()}${designFootnote()}</div>`;
}
function garageProjectLinks(project) {
 return `<div class="garage-path-links">
  <button type="button" data-guide-sled="${project.sled}" aria-label="Open ${project.title.toLowerCase()} walkthrough">Walkthrough</button>
  <button type="button" data-profile="${project.sled}" aria-label="View ${project.title.toLowerCase()} project file">Project file</button>
 </div>`;
}

function garageSkiDooProject(project, withPhoto=false) {
 return `<article class="garage-branch-project">
  ${withPhoto ? designPhoto(project, 'garage-project-thumb') : ''}
  <div>
   <h3>${project.title}</h3>
   <p>${esc(project.badge)}${project.chassis ? ` · ${esc(project.identity)}` : ''}</p>
   ${garageProjectLinks(project)}
  </div>
 </article>`;
}

function garageWorkshopLinks() {
 return `<div class="garage-path-links garage-workshop-links">
  <a href="#parts" data-nav="parts">Ski-Doo parts</a>
  <a href="#archive" data-nav="archive">Ski-Doo photos &amp; manuals</a>
 </div>`;
}

function garageSnoJetAction() {
 return '<a class="garage-route-button" href="#snojet" data-nav="snojet">Open parts checklist</a>';
}

function garageDoorsHome(projects) {
 return `<div class="garage-doors">
  <section class="garage-door garage-door--skidoo" aria-labelledby="garage-doors-skidoo">
   <div class="garage-door-picture">
    ${designPhoto(projects[0])}
    <h2 id="garage-doors-skidoo" tabindex="-1">Ski-Doo</h2>
   </div>
   <div class="garage-door-body">
    ${projects.map(project => garageSkiDooProject(project)).join('')}
    ${garageWorkshopLinks()}
   </div>
  </section>
  <section class="garage-door garage-door--snojet" aria-labelledby="garage-doors-snojet">
   <div class="garage-door-title">
    <h2 id="garage-doors-snojet" tabindex="-1">Sno-Jet</h2>
    <p>1974 Astro Jet 340</p>
   </div>
   <div class="garage-door-body">
    <h3>Getting the Astro Jet running</h3>
    <p>Track which parts are needed, ordered, and installed. Open any part for fitment notes and supplier links.</p>
    ${garageSnoJetAction()}
   </div>
  </section>
 </div>`;
}

function garageProjectIndexHome(projects) {
 return `<div class="garage-project-index">
  <section aria-labelledby="garage-project-index-skidoo">
   <header class="garage-index-brand">
    <h2 id="garage-project-index-skidoo" tabindex="-1">Ski-Doo</h2>
    <p>Restoration projects</p>
   </header>
   <div class="garage-index-entries">${projects.map(project => garageSkiDooProject(project, true)).join('')}${garageWorkshopLinks()}</div>
  </section>
  <section aria-labelledby="garage-project-index-snojet">
   <header class="garage-index-brand garage-index-brand--snojet">
    <h2 id="garage-project-index-snojet" tabindex="-1">Sno-Jet</h2>
    <p>Parts checklist</p>
   </header>
   <div class="garage-index-entries garage-index-snojet">
    <h3>1974 Astro Jet 340</h3>
    <p>Look up the carb kit, belts, ignition parts, and what’s left to source or install.</p>
    ${garageSnoJetAction()}
   </div>
  </section>
 </div>`;
}

function garageTrailHome(projects) {
 return `<div class="garage-trails">
  <details class="garage-trail garage-trail--skidoo" name="garage-trails">
   <summary><span><b>Ski-Doo</b><small>Pick a sled and follow its restoration</small></span><span class="garage-trail-toggle" aria-hidden="true"></span></summary>
   <div class="garage-trail-body">${projects.map(project => garageSkiDooProject(project, true)).join('')}${garageWorkshopLinks()}</div>
  </details>
  <details class="garage-trail garage-trail--snojet" name="garage-trails">
   <summary><span><b>Sno-Jet</b><small>Find parts for the 1974 Astro Jet 340</small></span><span class="garage-trail-toggle" aria-hidden="true"></span></summary>
   <div class="garage-trail-body garage-trail-snojet">
    <p>See what’s needed, check fitment and supplier links, or follow parts through installation.</p>
    ${garageSnoJetAction()}
   </div>
  </details>
 </div>`;
}

const openGarageBays = new Set();
const astroJetSource = 'https://sledmagazine.com/former-snowmobile-manufacturers-sno-jet/#sno-jet-star-jet-and-astro-jet-snowmobiling-for-everyone';
const astroJetBrochure = 'https://motoneiges.ca/wp-content/uploads/2025/12/1974-Sno-Jet-AstroJet.jpg';

function garageBayPhotos(projects) {
 return projects.map(project => `<figure class="garage-bay-photo">
  ${designPhoto(project)}
  <figcaption id="bay-project-${project.sled}">${project.title}</figcaption>
 </figure>`).join('');
}

function garageBay(id, brand, description, photos, actions, hasDoors) {
 const open = !hasDoors || openGarageBays.has(id);
 const verb = open ? 'Close' : 'Open';
 return `<section class="garage-bay garage-bay--${id}" aria-labelledby="bay-${id}-name"${hasDoors ? ` data-garage-bay${open ? ' data-open' : ''}` : ''}>
  <header class="garage-bay-header">
   <div><h2 id="bay-${id}-name">${brand}</h2><p>${description}</p></div>
   ${hasDoors ? `<button class="garage-bay-toggle" type="button" data-bay-toggle="${id}" aria-expanded="${open}" aria-controls="bay-${id}-room bay-${id}-actions" aria-label="${verb} ${brand} door">
    <span>${verb} door</span><i aria-hidden="true"></i>
   </button>` : ''}
  </header>
  <div class="garage-bay-opening">
   <div class="garage-bay-room" id="bay-${id}-room" ${open ? '' : 'inert'}>${photos}</div>
   ${hasDoors ? '<div class="garage-door-panels" aria-hidden="true"><span></span><span></span></div>' : ''}
  </div>
  <div class="garage-bay-actions" id="bay-${id}-actions" ${open ? '' : 'hidden'}>${actions}</div>
 </section>`;
}

function openingGarageHome(projects, edition) {
 const hasDoors = edition !== 'open-bays';
 const skiDooActions = projects.map(project => `<div class="garage-bay-project-actions" role="group" aria-labelledby="bay-project-${project.sled}">
  <p>${esc(project.badge)}</p>
  ${garageProjectLinks(project)}
 </div>`).join('');
 const snoJetPhoto = `<figure class="garage-bay-photo garage-bay-photo--brochure">
  <img src="${astroJetBrochure}" alt="A blue Astro Jet in the snow in the original 1974 Sno-Jet brochure" referrerpolicy="no-referrer">
  <figcaption>1974 factory brochure</figcaption>
 </figure>`;
 const snoJetActions = `<div class="garage-bay-snojet-info">
  ${garageSnoJetAction()}
  <a href="${astroJetSource}" target="_blank" rel="noopener noreferrer">Brochure source · Sled Magazine</a>
 </div>`;
 return `<div class="garage-bays garage-bays--${edition}">
  ${garageBay('skidoo', 'Ski-Doo', 'Two restoration projects', garageBayPhotos(projects), skiDooActions, hasDoors)}
  ${garageBay('snojet', 'Sno-Jet', '1974 Astro Jet 340', snoJetPhoto, snoJetActions, hasDoors)}
 </div>`;
}

const garageHomeLayouts={
 'garage-doors':garageDoorsHome,'project-index':garageProjectIndexHome,'trail-map':garageTrailHome,
 'roll-up-bays':openingGarageHome,'sliding-workshop':openingGarageHome,'open-bays':openingGarageHome,
};
function renderDesignHome(edition){
 guideState();
 if (!Object.hasOwn(garageHomeLayouts, edition)) return edition==='workbench'?workbenchHome():showroomHome();
 const projects=['early','eight'].map(designProject);
 return `${designReviewBar(edition)}
  <div class="garage-branch-home garage-branch-home--${edition}">
   <header class="garage-branch-intro">
    <h1>Vintage Sled Revival</h1>
    <p>Follow two Ski-Doo restorations and the search for parts to get a 1974 Sno-Jet running.</p>
    ${['garage-doors','project-index'].includes(edition) ? `<div class="garage-brand-shortcuts" role="group" aria-label="Jump to a brand">
      <button type="button" data-home-section="${edition}-skidoo">Ski-Doo projects</button>
      <button type="button" data-home-section="${edition}-snojet">Sno-Jet parts</button>
     </div>` : ''}
   </header>
   ${garageHomeLayouts[edition](projects, edition)}
   <section class="garage-branch-archive" aria-labelledby="garage-archive-title">
    <div><h2 id="garage-archive-title">Paint codes &amp; colors</h2><p>Browse the Ski-Doo swatchbook and 1959–1979 year sheets.</p></div>
    <a class="garage-route-button" href="#paint" data-nav="paint">Browse paint archive</a>
   </section>
  </div>`;
}
document.addEventListener('click',event=>{const button=event.target.closest('button[data-design-sled]');if(!button)return;const sled=button.dataset.designSled;if(!['early','eight'].includes(sled))return;designActiveSled=sled;render('overview');document.querySelector(`[data-design-sled="${sled}"]`)?.focus({preventScroll:true});});
document.addEventListener('click', event => {
 const button = event.target.closest('button[data-bay-toggle]');
 const id = button?.dataset?.bayToggle;
 if (!id) return;
 const bay = button.closest('[data-garage-bay]');
 const open = !openGarageBays.has(id);
 if (open) openGarageBays.add(id);
 else openGarageBays.delete(id);
 const verb = open ? 'Close' : 'Open';
 bay.toggleAttribute('data-open', open);
 bay.querySelector('.garage-bay-room').inert = !open;
 bay.querySelector('.garage-bay-actions').hidden = !open;
 button.setAttribute('aria-expanded', String(open));
 button.setAttribute('aria-label', `${verb} ${bay.querySelector('h2').textContent} door`);
 button.firstElementChild.textContent = `${verb} door`;
});
