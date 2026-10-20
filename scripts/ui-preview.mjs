import {cp,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const [edition='showroom',mode='check',...extra]=process.argv.slice(2);
if(!['classic','showroom','workbench','paint-swatches','paint-ledger'].includes(edition)||!['publish','initialize','dev','check'].includes(mode))throw Error('Use: node scripts/ui-preview.mjs <classic|showroom|workbench|paint-swatches|paint-ledger> <publish|initialize|dev|check>');
if(mode==='initialize'&&edition!=='classic')throw Error('Initialize the design Worker with the classic baseline before uploading variants.');
const stage=await mkdtemp(join(tmpdir(),'vintage-ui-'+edition+'-'));
try{
 await cp(join(root,'dist'),join(stage,'dist'),{recursive:true});
 const entry=join(stage,'dist','index.html');
 const paintStudy=edition.startsWith('paint-'),homeEdition=paintStudy?'showroom':edition,paintEdition=edition==='paint-ledger'?'ledger':'swatches';
 await writeFile(entry,(await readFile(entry,'utf8')).replace(/<html\b[^>]*>/,tag=>tag.replace(/ data-(?:ui-(?:edition|preview)|paint-edition)="[^"]*"/g,'').replace(/>$/,` data-ui-edition="${homeEdition}" data-ui-preview="true" data-paint-edition="${paintEdition}">`)));
 const headersPath=join(stage,'dist','_headers');await writeFile(headersPath,(await readFile(headersPath,'utf8')).trimEnd()+'\n  X-Robots-Tag: noindex, nofollow\n');
 const config={name:'vintage-sled-revival-designs',main:join(root,'worker','ui-preview.mjs'),compatibility_date:'2026-10-19',compatibility_flags:['global_fetch_strictly_public'],preview_urls:true,workers_dev:true,assets:{directory:join(stage,'dist'),binding:'ASSETS',run_worker_first:['/api/*','/admin/*']}};
 const configPath=join(stage,'wrangler.json');await writeFile(configPath,JSON.stringify(config,null,2));
 const args=mode==='publish'?['versions','upload','--config',configPath,'--preview-alias',edition,'--tag','ui-'+edition,'--message',edition+' interface design review']:mode==='initialize'?['deploy','--config',configPath]:mode==='check'?['deploy','--config',configPath,'--dry-run']:['dev','--config',configPath,'--ip','127.0.0.1',...extra];
 const command=process.env.UI_WRANGLER_WRAPPER||join(root,'node_modules','wrangler','bin','wrangler.js');
 console.log(`${edition} UI · ${mode} · production is unchanged`);
 const child=spawn(process.execPath,[command,...args],{cwd:root,stdio:'inherit',env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
 process.on('SIGINT',()=>child.kill('SIGINT'));process.on('SIGTERM',()=>child.kill('SIGTERM'));
 const code=await new Promise((resolve,reject)=>{child.on('exit',resolve);child.on('error',reject);});
 process.exitCode=code??1;
}finally{await rm(stage,{recursive:true,force:true});}
