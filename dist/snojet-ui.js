'use strict';

let snoJetFilter = 'all';
let snoJetQuery = '';

function snoJetEdition() {
 const edition = document.documentElement.dataset.snojetEdition;
 return ['plan', 'catalog'].includes(edition) ? edition : '';
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

function snoJetPartsResults() {
 const normalize = text => text.toLowerCase().replace(/[^a-z0-9]/g, '');
 const terms = snoJetQuery.trim().split(/\s+/).map(normalize).filter(Boolean);
 const systems = SnoJetParts.systems
  .filter(system => snoJetFilter === 'all' || system.id === snoJetFilter)
  .map(system => ({
   ...system,
   parts: system.parts.filter(part => {
    const text = normalize([system.name, part.name, part.match, ...part.links.map(link => link.label)].join(' '));
    return terms.every(term => text.includes(term));
   }),
  }))
  .filter(system => system.parts.length);
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
 const results = document.querySelector('#sno-parts-results');
 if (results) results.innerHTML = snoJetPartsResults();
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
