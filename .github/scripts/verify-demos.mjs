import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const [manifestPath,outputPath]=process.argv.slice(2);
if(!manifestPath||!outputPath)throw new Error('Usage: verify-approved-cars.mjs MANIFEST OUTPUT');
const manifest=JSON.parse(await readFile(manifestPath,'utf8')),results=[];
const tasks=manifest.flatMap(site=>site.files.map(file=>({...file,site:site.url,url:site.url+file.path})));
let next=0;
await Promise.all(Array.from({length:4},async()=>{
 while(next<tasks.length){
  const task=tasks[next++];let result;
  for(let attempt=0;attempt<3;attempt++){
   try{
    const response=await fetch(task.url,{redirect:'error',signal:AbortSignal.timeout(30000)});
    const bytes=Buffer.from(await response.arrayBuffer());
    const sha256=createHash('sha256').update(bytes).digest('hex');
    if(response.status!==200||sha256!==task.sha256)throw new Error(`HTTP ${response.status}, content ${sha256}`);
    result={site:task.site,url:task.url,ok:true,sha256,bytes:bytes.length};break;
   }catch(error){
    result={site:task.site,url:task.url,ok:false,error:error.message};
    if(attempt<2)await new Promise(resolve=>setTimeout(resolve,2000*(attempt+1)));
   }
  }
  results.push(result);
 }
}));
const report={sites:manifest.length,checked:results.length,passed:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok),results};
await writeFile(outputPath,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sites:report.sites,checked:report.checked,passed:report.passed,failed:report.failed.length}));
if(report.failed.length)process.exitCode=1;
