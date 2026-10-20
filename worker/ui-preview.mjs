// UI reviews read published data through the public API, with no storage or auth bindings.
const PUBLIC_GARAGE = 'https://vintage-sled-revival.joshuatobin.workers.dev';
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'}});
export function createPreviewWorker(requestPublic=fetch){
 return {async fetch(request,env){
  const url=new URL(request.url);
  if(!['GET','HEAD'].includes(request.method))return json({error:'Design previews are read only. Open the live garage to make changes.'},405);
  if(url.pathname==='/api/session')return json({canEdit:false,email:null,configured:false,preview:true,liveUrl:PUBLIC_GARAGE});
  if(url.pathname==='/api/garage'){
   try{
    const response=await requestPublic(PUBLIC_GARAGE+'/api/garage',{method:'GET',headers:{Accept:'application/json'},redirect:'manual',cf:{cacheTtl:0}});
    if(!response.ok)return json({error:'Published progress could not be loaded. Open the live garage to view it.'},503);
    const result=await response.json();
    if(!Number.isSafeInteger(result.revision)||result.revision<0||!Object.hasOwn(result,'state'))return json({error:'The published garage returned an invalid record.'},503);
    return json(result);
   }catch{return json({error:'Published progress could not be loaded. Your records remain on the live garage.'},503);}
  }
  if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/admin/'))return json({error:'Design previews are read only. Open the live garage to sign in.'},404);
  const response=await env.ASSETS.fetch(request),headers=new Headers(response.headers);headers.set('X-Robots-Tag','noindex, nofollow');
  return new Response(response.body,{status:response.status,headers});
 }};
}
export default createPreviewWorker();
