'use strict';
let yearbookYear=1968,yearbookDecade='all';
function yearbookEdition(){const edition=document.documentElement?.dataset.yearbookEdition;return ['sheets','gallery'].includes(edition)?edition:'';}
function yearbookActive(){return SledYearbook.get(yearbookYear)||SledYearbook.get(1968);}
function yearbookBadge(e){return e.year===1964?'Year-range conflict':'Model paint assignment unchecked';}
function yearbookSheet(){
 const e=yearbookActive();
 return `<article class="yearbook-sheet" aria-labelledby="yearbook-model-title"><div class="yearbook-swatch-panel"><div class="yearbook-art-title"><span>${e.year}</span><small>Paint reference</small></div><div class="yearbook-color-sample" style="background:${e.paint.hex}" aria-label="Illustrative yellow swatch"></div><p>Illustrative swatch · not a measured paint match</p></div><div class="yearbook-sheet-info"><div class="yearbook-model-heading"><p>Representative model reference</p><h3 id="yearbook-model-title" tabindex="-1">${esc(e.model)}</h3><span>Model reference ${esc(e.modelCode)}</span></div><div class="yearbook-paint-label"><div><p>Historical color reference</p><h4>${esc(e.paint.name)}</h4><b>${esc(e.paint.code)}</b></div></div><span class="yearbook-evidence">${yearbookBadge(e)}</span><p class="yearbook-source-note">${esc(e.note)}</p><div class="yearbook-sheet-sources">${e.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join('')}</div></div><p class="yearbook-illustration-note">Screen color is illustrative. Check original paint, the correct model and the supplier’s formula before choosing a finish.</p></article>`;
}
function yearbookGallery(){return SledYearbook.entries.filter(e=>yearbookDecade==='all'||Math.floor(e.year/10)*10===Number(yearbookDecade)).map(e=>`<button class="yearbook-year-card" data-yearbook-year="${e.year}" aria-label="Open ${e.year} ${esc(e.model)} paint reference"><div class="yearbook-card-swatch" style="background:${e.paint.hex}" aria-hidden="true"></div><span class="yearbook-card-year">${e.year}</span><h3>${esc(e.model)}</h3><p>${esc(e.paint.code)}</p><small>${e.year===1964?'Disputed year range':'Model paint assignment unchecked'}</small></button>`).join('');}
function yearbookDialogContent(){return `<button class="yearbook-close" data-yearbook-close aria-label="Close year reference">×</button>${yearbookSheet()}`;}
function paintYearbook(){
 if(!yearbookEdition())return '';
 const gallery=yearbookEdition()==='gallery';
 const controls=`<div class="yearbook-controls"><div><button data-yearbook-shift="-1" aria-label="Previous year"${yearbookYear===1959?' disabled':''}>←</button><label>Choose a year<select id="yearbook-year">${SledYearbook.entries.map(e=>`<option value="${e.year}"${e.year===yearbookYear?' selected':''}>${e.year}</option>`).join('')}</select></label><button data-yearbook-shift="1" aria-label="Next year"${yearbookYear===1979?' disabled':''}>→</button></div><p>A year can include several models and finishes.</p></div>`;
 const wall=`<div class="yearbook-gallery-heading"><h3>Browse the early years</h3><div role="group" aria-label="Filter year references by decade">${[['all','All years'],['1950','1950s'],['1960','1960s'],['1970','1970s']].map(([value,label])=>`<button data-yearbook-decade="${value}" aria-pressed="${yearbookDecade===value}">${label}</button>`).join('')}</div></div><div id="yearbook-gallery" class="yearbook-gallery">${yearbookGallery()}</div><dialog id="yearbook-dialog" class="yearbook-dialog" aria-label="Year paint reference"></dialog>`;
 return `<section class="paint-yearbook ${gallery?'yearbook-wall':'yearbook-sheets'}" aria-labelledby="yearbook-title"><header class="yearbook-heading"><div><p>1959–1979 · the early years</p><h2 id="yearbook-title">Paint references by year.</h2></div><span>Browse the historical recipes and model references.<br>Keep the source and its open questions together.</span></header>${gallery?wall:controls+`<div id="yearbook-stage">${yearbookSheet()}</div>`}</section>`;
}
let yearbookPreviewFocused=false;
function focusYearbookPreview(){if(!yearbookPreviewFocused&&yearbookEdition()&&isDesignPreview()&&currentView==='paint'){yearbookPreviewFocused=true;document.querySelector('#yearbook-title')?.scrollIntoView?.({block:'start',behavior:'instant'});}}
function changeYearbook(year){
 if(!SledYearbook.get(year))return;yearbookYear=Number(year);const dialog=document.querySelector('#yearbook-dialog');if(yearbookEdition()==='gallery'&&dialog?.open)dialog.innerHTML=yearbookDialogContent();else render('paint');
}
document.addEventListener('change',event=>{if(event.target.id==='yearbook-year'){changeYearbook(event.target.value);document.querySelector('#yearbook-year')?.focus({preventScroll:true});}});
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.dataset.yearbookShift){const next=yearbookYear+Number(button.dataset.yearbookShift);if(SledYearbook.get(next)){changeYearbook(next);document.querySelector(`[data-yearbook-shift="${button.dataset.yearbookShift}"]`)?.focus({preventScroll:true});}}
 if(button.dataset.yearbookYear&&SledYearbook.get(button.dataset.yearbookYear)){yearbookYear=Number(button.dataset.yearbookYear);const dialog=document.querySelector('#yearbook-dialog');dialog.innerHTML=yearbookDialogContent();dialog.showModal();}
 if(button.hasAttribute('data-yearbook-close'))document.querySelector('#yearbook-dialog')?.close();
 if(button.dataset.yearbookDecade&&['all','1950','1960','1970'].includes(button.dataset.yearbookDecade)){yearbookDecade=button.dataset.yearbookDecade;render('paint');document.querySelector(`[data-yearbook-decade="${yearbookDecade}"]`)?.focus({preventScroll:true});}
});
