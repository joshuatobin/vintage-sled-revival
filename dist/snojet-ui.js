'use strict';

let snoJetFilter = 'all';
let snoJetQuery = '';
let snoJetStatusFilter = 'all';

function snoJetEdition() {
 const edition = document.documentElement.dataset.snojetEdition;
 return ['plan', 'catalog', 'checklist', 'board'].includes(edition) ? edition : '';
}

function snoJetLink(link) {
 return `<a href="${esc(link.url)}" target="_blank" rel="noopener">${esc(link.label)} <span aria-hidden="true">↗</span><small>${link.type}</small></a>`;
}

function snoJetPartsList(systems, heading = 'h3') {
 return systems.map(system => `
  <section class="sno-system" aria-labelledby="sno-${system.id}">
   <${heading} id="sno-${system.id}">${esc(system.name)}</${heading}>
   <ul class="sno-parts">
    ${system.parts.map(part => `<li>
     <div><strong>${esc(part.name)}</strong><p>${esc(part.match)}</p></div>
     <div class="sno-links">${part.links.map(snoJetLink).join('')}</div>
    </li>`).join('')}
   </ul>
  </section>`).join('');
}

function snoJetMatchingSystems() {
 const normalize = text => text.toLowerCase().replace(/[^a-z0-9]/g, '');
 const terms = snoJetQuery.trim().split(/\s+/).map(normalize).filter(Boolean);
 return SnoJetParts.systems
  .filter(system => snoJetFilter === 'all' || system.id === snoJetFilter)
  .map(system => ({
   ...system,
   parts: system.parts.filter(part => {
    const text = normalize([system.name, part.name, part.match, ...part.links.map(link => link.label)].join(' '));
    return terms.every(term => text.includes(term));
   }),
  }))
  .filter(system => system.parts.length);
}

function snoJetPartsResults() {
 const systems = snoJetMatchingSystems();
 if (!systems.length) {
  return '<p class="sno-count" role="status">No matching parts. Try another name or number, or choose All systems.</p>';
 }
 const count = systems.reduce((sum, system) => sum + system.parts.length, 0);
 const results = snoJetEdition() === 'catalog' ? snoJetPartsList(systems) :
  ['First start', 'Before riding'].map(phase => {
   const inPhase = systems.filter(system => system.phase === phase);
   if (!inPhase.length) return '';
   return `<section class="sno-phase"><h3>${phase}</h3>
    <div>${snoJetPartsList(inPhase, 'h4')}</div>
   </section>`;
  }).join('');
 return `<p class="sno-count" role="status">${count} ${count === 1 ? 'match' : 'matches'}</p>${results}`;
}

function snoJetView() {
 const edition = snoJetEdition();
 if (edition === 'checklist' || edition === 'board') return snoJetChecklistView(edition);
 const isCatalog = edition === 'catalog';
 const systems = SnoJetParts.systems;
 const list = `
  <div class="sno-catalog-filter">
   <h2 id="sno-parts-title" tabindex="-1">${isCatalog ? 'Parts catalog' : 'Parts plan'}</h2>
   <div class="sno-filter-fields" role="search" aria-label="Search Sno-Jet parts">
    <label for="sno-parts-query">Part name or number
     <input type="search" id="sno-parts-query" value="${esc(snoJetQuery)}" placeholder="e.g. HD-14A, HP3009, points">
    </label>
    <label for="sno-system-filter">Filter by system
     <select id="sno-system-filter">
      <option value="all">All systems</option>
      ${systems.map(system => `<option value="${system.id}" ${system.id === snoJetFilter ? 'selected' : ''}>${esc(system.name)}</option>`).join('')}
     </select>
    </label>
   </div>
  </div>
  <div id="sno-parts-results">${snoJetPartsResults()}</div>`;
 return `
  ${isDesignPreview() ? `<div class="design-review"><div><span class="design-review-dot" aria-hidden="true"></span>
   <b>${isCatalog ? 'Parts Catalog' : 'Workshop Plan'}</b><span>Sno-Jet preview · read only</span></div>
   <a href="${LIVE_GARAGE}" target="_blank" rel="noopener">Open live garage ↗</a></div>` : ''}
  <div class="sno-jet sno-jet--${edition}">
   <header class="sno-intro">
    <div><h1>1974 Sno-Jet <span>Astro Jet 340</span></h1><p>Yamaha twin · factory-original restoration</p></div>
    <div class="sno-intro-actions">
     <button class="button" data-home-section="sno-parts-title">Browse parts</button>
     <button class="button secondary" data-home-section="sno-references-title">Open manuals list</button>
    </div>
   </header>
   <section class="sno-identify" aria-labelledby="sno-identify-title">
    <h2 id="sno-identify-title">Match the parts to this sled</h2>
    <p>Start with the Astro Jet 340 parts manual. Compare the installed components with the manual and confirm fit with the supplier before ordering. Keep the originals as patterns.</p>
    <dl>
     <div><dt>Chassis</dt><dd>The tunnel plate shows a 1973 build date. Read the faint model code to verify the 1974 model year.</dd></div>
     <div><dt>Engine & ignition</dt><dd>Engine tag and ignition or stator markings</dd></div>
     <div><dt>Carburetor</dt><dd>Tillotson HD-14A confirmed. Rebuild the installed carb with the DIY kit below.</dd></div>
     <div><dt>Drive</dt><dd>Old belt number and both clutch markings</dd></div>
    </dl>
   </section>
   <section class="sno-breakdown" aria-labelledby="sno-parts-title">${list}</section>
   <section class="sno-references" aria-labelledby="sno-references-title">
    <h2 id="sno-references-title" tabindex="-1">Manuals and application charts</h2>
    <div class="sno-links">${SnoJetParts.references.map(snoJetLink).join('')}</div>
   </section>
  </div>`;
}

function snoJetUpdateResults() {
 if (['checklist', 'board'].includes(snoJetEdition())) snoJetRenderChecklistResults();
 else {
  const results = document.querySelector('#sno-parts-results');
  if (results) results.innerHTML = snoJetPartsResults();
 }
}

document.addEventListener('input', event => {
 if (event.target.id !== 'sno-parts-query') return;
 snoJetQuery = event.target.value;
 snoJetUpdateResults();
});

document.addEventListener('change', event => {
 if (event.target.id !== 'sno-system-filter') return;
 snoJetFilter = event.target.value;
 snoJetUpdateResults();
});

const snoJetStatuses = GarageRecords.SNOJET_STATUSES;

function snoJetPartStatus(id) {
 return state.snoJetChecklist?.[id] || snoJetStatuses[0];
}

function snoJetStatusClass(status) {
 return status.toLowerCase().replaceAll(' ', '-');
}

function snoJetSummary() {
 const counts = Object.fromEntries(snoJetStatuses.map(status => [status, 0]));
 for (const system of SnoJetParts.systems) {
  for (const part of system.parts) counts[snoJetPartStatus(part.id)]++;
 }
 return snoJetStatuses.map(status => `
  <div class="sno-stat sno-status--${snoJetStatusClass(status)}">
   <dt>${status}</dt><dd>${counts[status]}</dd>
  </div>`).join('');
}

function snoJetChecklistRow(part, system, showSystem) {
 const status = snoJetPartStatus(part.id);
 const statusClass = `sno-status sno-status--${snoJetStatusClass(status)}`;
 const statusControl = canEdit() && !isDesignPreview() ? `
  <select class="${statusClass}" data-sno-status="${part.id}" aria-label="Status for ${esc(part.name)}">
   ${snoJetStatuses.map(value => option(value, value, status)).join('')}
  </select>` : showSystem ? '' : `<span class="${statusClass}">${status}</span>`;
 return `
  <li class="sno-check-row">
   <div class="sno-check-top">
    <div class="sno-check-name">
     <strong>${esc(part.name)}</strong>
     ${showSystem ? `<span>${esc(system.name)}</span>` : ''}
    </div>
    ${statusControl}
   </div>
   <details class="sno-part-detail" data-sno-detail="${part.id}">
    <summary>Fitment &amp; links<span class="visually-hidden"> for ${esc(part.name)}</span></summary>
    <p>${esc(part.match)}</p>
    <div class="sno-links">${part.links.map(snoJetLink).join('')}</div>
   </details>
  </li>`;
}

function snoJetChecklistResults() {
 const systems = snoJetMatchingSystems().map(system => ({
  ...system,
  parts: system.parts.filter(part => snoJetStatusFilter === 'all' || snoJetPartStatus(part.id) === snoJetStatusFilter),
 }));
 const matches = systems.flatMap(system => system.parts.map(part => ({part, system})));
 if (!matches.length) return '<p class="sno-empty">No matching parts. Try a different search or filter.</p>';
 if (snoJetEdition() === 'board') {
  const boardOrder = ['Needed', 'Ordered', 'Installed', 'To assess', 'Not needed'];
  const columns = boardOrder.filter(status => snoJetStatusFilter === 'all' || status === snoJetStatusFilter);
  return `<div class="sno-board${columns.length === 1 ? ' sno-board--single' : ''}">${
   columns.map(status => {
    const cards = matches.filter(({part}) => snoJetPartStatus(part.id) === status);
    const slug = snoJetStatusClass(status);
    return `
     <section class="sno-lane sno-lane--${slug}" aria-labelledby="sno-lane-${slug}">
      <h3 id="sno-lane-${slug}">${status} <span>${cards.length}</span></h3>
      ${cards.length ? `<ul>${cards.map(({part, system}) => snoJetChecklistRow(part, system, true)).join('')}</ul>`
       : '<p class="sno-empty">No parts here yet.</p>'}
     </section>`;
   }).join('')
  }</div>`;
 }
 return systems.filter(system => system.parts.length).map(system => `
  <section class="sno-check-system" aria-labelledby="sno-system-${system.id}">
   <h3 id="sno-system-${system.id}">${esc(system.name)} <span>${esc(system.phase)}</span></h3>
   <ul>${system.parts.map(part => snoJetChecklistRow(part, system, false)).join('')}</ul>
  </section>`).join('');
}

function snoJetChecklistView(edition) {
 const name = edition === 'board' ? 'Status Board' : 'System Checklist';
 return `
  <div class="sno-jet sno-tracker sno-tracker--${edition}">
   <header class="sno-check-header">
    <div>
     <p>1974 Sno-Jet Astro Jet 340</p>
     <h1>${name}</h1>
    </div>
    <button class="button secondary" data-home-section="sno-references-title">Manuals &amp; charts</button>
   </header>
   <dl class="sno-check-summary" id="sno-check-summary">${snoJetSummary()}</dl>
   <p class="sno-save-state" id="sno-save-state" role="status"></p>
   <div class="sno-check-filters" role="search" aria-label="Filter Sno-Jet parts">
    <label>Find a part
     <input type="search" id="sno-parts-query" value="${esc(snoJetQuery)}" placeholder="e.g. carb kit or HP3009">
    </label>
    <label>System
     <select id="sno-system-filter">
      ${option('all', 'All systems', snoJetFilter)}
      ${SnoJetParts.systems.map(system => option(system.id, system.name, snoJetFilter)).join('')}
     </select>
    </label>
    <label>Status
     <select id="sno-status-filter">
      ${option('all', 'All statuses', snoJetStatusFilter)}
      ${snoJetStatuses.map(status => option(status, status, snoJetStatusFilter)).join('')}
     </select>
    </label>
   </div>
   <div id="sno-check-results">${snoJetChecklistResults()}</div>
   <section class="sno-references" aria-labelledby="sno-references-title">
    <h2 id="sno-references-title" tabindex="-1">Manuals and application charts</h2>
    <details class="sno-identification"><summary>Sled identification and fitment checks</summary>
     <p>Working identification is a 1974 Astro Jet 340 with a Yamaha twin. The tunnel plate shows a 1973 build date. Read the faint model code to verify the model year.</p>
     <p>The installed Tillotson HD-14A is confirmed. Record the engine tag, stator markings, old belt number and both clutch markings when matching the remaining parts.</p>
    </details>
    <div class="sno-links">${SnoJetParts.references.map(snoJetLink).join('')}</div>
   </section>
  </div>`;
}

function refreshSnoJetSaveState() {
 const node = document.querySelector('#sno-save-state');
 if (!node) return;
 if (isDesignPreview()) {
  node.textContent = 'Read-only design preview. You can search, filter and open part details.';
  return;
 }
 if (viewingBrowserRecord) {
  node.textContent = 'Viewing a browser backup.';
  return;
 }
 const messages = {
  loading: 'Loading published checklist…',
  public: 'Sign in as owner to update statuses.',
  saving: 'Publishing checklist changes…',
  published: 'Checklist changes save to the garage.',
  error: 'Checklist publishing needs attention. See the garage notice.',
  conflict: 'A newer garage record is available. See the garage notice for recovery.',
  expired: 'Owner sign-in expired. See the garage notice for recovery.',
 };
 node.textContent = messages[garageSync.status] || messages.public;
}

function snoJetRenderChecklistResults(focusId) {
 const results = document.querySelector('#sno-check-results');
 if (!results) return;
 const opened = new Set([...results.querySelectorAll('details[open]')].map(detail => detail.dataset.snoDetail));
 results.innerHTML = snoJetChecklistResults();
 for (const detail of results.querySelectorAll('details')) {
  if (opened.has(detail.dataset.snoDetail)) detail.open = true;
 }
 if (focusId) {
  const control = results.querySelector(`[data-sno-status="${focusId}"]`) || document.querySelector('#sno-status-filter');
  control?.focus();
 }
}

document.addEventListener('change', event => {
 const control = event.target;
 if (control.id === 'sno-status-filter') {
  snoJetStatusFilter = control.value;
  snoJetRenderChecklistResults();
  return;
 }
 const id = control.dataset?.snoStatus;
 if (!id) return;
 if (isDesignPreview() || !canEdit() || !snoJetStatuses.includes(control.value) ||
     !SnoJetParts.systems.some(system => system.parts.some(part => part.id === id))) {
  control.value = snoJetPartStatus(id);
  return;
 }
 const previous = state.snoJetChecklist;
 const next = {...previous, [id]: control.value};
 if (control.value === snoJetStatuses[0]) delete next[id];
 state.snoJetChecklist = next;
 if (!persist()) {
  if (previous) state.snoJetChecklist = previous;
  else delete state.snoJetChecklist;
  control.value = snoJetPartStatus(id);
  return;
 }
 document.querySelector('#sno-check-summary').innerHTML = snoJetSummary();
 snoJetRenderChecklistResults(id);
});
