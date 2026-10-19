(function(root){
 'use strict';
 const LEGACY_KEY='tobin-skidoo-garage-v1',DRAFT_KEY='tobin-skidoo-garage-draft-v2';
 class GarageSync {
  constructor({fetch:request=(...args)=>fetch(...args),storage=localStorage,onStatus=()=>{}}={}){
   this.request=request;this.storage=storage;this.onStatus=onStatus;this.canEdit=false;this.ready=false;this.blocked=false;this.revision=0;this.pending=null;this.flight=null;this.status='loading';try{this.hasLegacy=Boolean(storage.getItem(LEGACY_KEY));this.hasDraft=Boolean(storage.getItem(DRAFT_KEY));}catch{this.hasLegacy=false;this.hasDraft=false;}
  }
  notify(status,message=''){this.status=status;this.message=message;this.onStatus(status,message);}
  get writable(){return this.ready&&this.canEdit&&!this.blocked;}
  async load(){
   this.canEdit=false;this.ready=false;this.notify('loading');
   const results=await Promise.allSettled([this.request('/api/session',{cache:'no-store',credentials:'same-origin'}),this.request('/api/garage',{cache:'no-store',credentials:'same-origin'})]);
   const sessionResult=results[0],recordResult=results[1];
   if(recordResult.status!=='fulfilled'||!recordResult.value.ok)throw Error('Published progress could not be loaded. Editing is paused; existing browser records are preserved.');
   const record=await recordResult.value.json();
   if(!Number.isSafeInteger(record.revision)||record.revision<0||!Object.hasOwn(record,'state'))throw Error('The shared garage returned an invalid record.');
   this.session=sessionResult.status==='fulfilled'&&sessionResult.value.ok?await sessionResult.value.json():{canEdit:false,configured:false};
   this.revision=record.revision;this.canEdit=this.session.canEdit===true;this.ready=true;this.blocked=false;this.pending=null;
   this.notify(this.canEdit?'published':'public');
   return record;
  }
  readBrowserRecord(kind='legacy'){
   try{return JSON.parse(this.storage.getItem(kind==='draft'?DRAFT_KEY:LEGACY_KEY)||'null');}catch{return null;}
  }
  writeDraft(pending){
   try{this.storage.setItem(DRAFT_KEY,JSON.stringify({revision:this.revision,state:JSON.parse(pending.text),importing:pending.importing}));this.hasDraft=true;return true;}
   catch{return false;}
  }
  queue(state,{importing=false}={}){
   if(!this.writable)return false;
   let text;try{text=JSON.stringify(state);}catch{return false;}
   if(new TextEncoder().encode(text).byteLength>12*1024*1024){this.notify('error','This archive exceeds 12 MB. Export a backup before removing photos.');return false;}
   this.pending={text,importing:importing||Boolean(this.pending?.importing)};
   const recovered=this.writeDraft(this.pending);
   this.notify('saving',recovered?'':'Browser backup storage is full. Keep this page open until publishing finishes, or export a backup.');
   clearTimeout(this.timer);this.timer=setTimeout(()=>{void this.flush();},600);
   return true;
  }
  async flush(){
   clearTimeout(this.timer);
   if(this.flight){await this.flight;return this.pending&&this.writable?this.flush():!this.blocked;}
   if(!this.pending)return !this.blocked;
   if(!this.writable)return false;
   const pending=this.pending;this.pending=null;
   this.flight=(async()=>{
    try{
     const response=await this.request('/api/garage',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json','If-Match':`"${this.revision}"`,...(pending.importing?{'X-Garage-Import':'1'}:{})},body:pending.text});
     let result;try{result=await response.json();}catch{result={};}
     if(!response.ok){
      this.blocked=true;if(response.status===401)this.canEdit=false;
      this.pending=this.pending||pending;this.writeDraft(this.pending);
      this.notify(response.status===409?'conflict':response.status===401?'expired':'error',result.error||'Publishing failed. Your draft is preserved; export it before leaving this page.');
      return false;
     }
     if(!Number.isSafeInteger(result.revision)||result.revision!==this.revision+1)throw Error('Publishing could not be verified. Reload the published garage before saving again.');
     this.revision=result.revision;
     if(this.pending){this.writeDraft(this.pending);this.notify('saving');}
     else{try{this.storage.removeItem(DRAFT_KEY);this.hasDraft=false;}catch{}this.notify('published');}
     return true;
    }catch(error){
     this.pending=this.pending||pending;this.writeDraft(this.pending);this.blocked=true;
     this.notify('error',error.message||'Publishing failed. Your draft is preserved.');return false;
    }
   })();
   const success=await this.flight;this.flight=null;
   return success&&this.pending?this.flush():success;
  }
  async retry(){if(!this.canEdit||this.status==='conflict')return false;this.blocked=false;return this.flush();}
 }
 root.GarageSync=GarageSync;if(typeof module!=='undefined'&&module.exports)module.exports=GarageSync;
})(typeof globalThis!=='undefined'?globalThis:this);
