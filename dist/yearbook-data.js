'use strict';
const SledYearbook=(()=>{
 const chart='https://www.teshio.com/oldski-doosleds/pdf_files/SKI-DOO%20paint%20codes%201959%20to%201991.pdf';
 const specifications='https://www.trailz.net/pub/Snowmobiles/SKIDOO/1996-1997/1997/MSPE_A97.PDF';
 const museum='https://museebombardier.com/services/';
 const colors={early:{name:'Early Ski-Doo yellow',hex:'#dfb12f',code:'1960–1963 R.M. TE-series recipe',page:4},later:{name:'Ski-Doo yellow',hex:'#e5b52f',code:'1964–1970 R.M. TE-series recipe',page:4},seventies:{name:'Ski-Doo yellow',hex:'#e6bb32',code:'1971–1979 R.M. TE-series recipe',page:4}};
 const rows=[
  [1959,'Ski-Doo','First production years','tin','early',''],
  [1960,'K60','K60','tin','early',''],[1961,'K61','K61','tin','early',''],[1962,'K62','K62','tin','early',''],
  [1963,'R6','R6 / AR6','early','early',''],[1964,'Olympique 250','BR64','early','later',''],
  [1965,'Olympique 250','BB5','olympique','later',''],[1966,'Olympique 250','BB6','olympique','later',''],
  [1967,'Olympique 300 E','SE7','olympique','later',''],[1968,'Olympique 300 E','SE8','olympique','later',''],
  [1969,'Olympique 320','6912','olympique','later',''],[1970,'Olympique 335','7012','olympique','later',''],
  [1971,'Olympique 335','7112','poly','seventies',''],[1972,'Olympique 335 · bogie','2102','poly','seventies',''],
  [1973,'Olympique 340','3107','poly','seventies',''],[1974,'Olympique 340','3109','late-oly','seventies',''],
  [1975,'Olympique 340','3119','late-oly','seventies',''],[1976,'Olympique 340','3125','late-oly','seventies',''],
  [1977,'Olympique 340','3133','late-oly','seventies',''],[1978,'Olympique 340','3140','late-oly','seventies',''],[1979,'Olympique 340','3147','late-oly','seventies',''],

 ];
 const entries=rows.map(([year,model,modelCode,family,colorKey,assignmentPage])=>{
  const paint=year===1959?{name:'Ski-Doo yellow',hex:'#dfb12f',code:'1959 R.M. Miracryl recipe',page:4}:colors[colorKey];
  return {year,model,modelCode,family,paint,assignmentPage:assignmentPage||null,documentedHood:!!assignmentPage,
   note:assignmentPage?'The chart assigns this hood code to the named model. The drawing and screen shade remain illustrative.':year===1964?'The chart groups 1964–1970; community evidence disputes the 1964 shade. Paint assignment to this model needs checking.':year>=1971?'The general 1971–1979 yellow recipe does not establish the hood finish of this Olympique model.':'A historical year-range recipe accompanies this representative model. Exact component fitment remains unchecked.',
   sources:[{label:year===1959?'Museum · first Ski-Doo sales register':'Bombardier model identification',url:year===1959?'https://museebombardier.com/en/artefacts/ski-doo-sales-register/':specifications+'#page='+(year<=1969?18:year<=1971?17:year===1972?16:year<=1976?15:year<=1979?14:year<=1983?13:year<=1987?12:11)},
    {label:assignmentPage?'Model → hood-code chart':'Historical color recipe',url:chart+'#page='+(assignmentPage||4)},
    ...(assignmentPage?[{label:'Paint-code color name',url:chart+'#page='+paint.page}]:[]),...(year===1964?[{label:'1964 shade disagreement',url:'https://www.facebook.com/groups/778144523424225/posts/1783561909549143/?comment_id=1783640022874665'}]:[])]};
 });
 function get(year){return entries.find(e=>e.year===Number(year))||null;}

 return {entries,get,chart,specifications,museum};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=SledYearbook;
