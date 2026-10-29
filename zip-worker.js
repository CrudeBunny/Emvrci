importScripts('vendor/fflate.js');
onmessage=({data})=>{try{
 const files={};const names=new Set();
 for(const item of data){let base=item.name.replace(/[\\/\x00-\x1f:]/g,'_');if(!base||base==='.'||base==='..')base='file';let name=base,n=2;while(names.has(name.toLowerCase())){const dot=base.lastIndexOf('.');name=dot>0?base.slice(0,dot)+'-'+n+base.slice(dot):base+'-'+n;n++;}names.add(name.toLowerCase());Object.defineProperty(files,name,{value:new Uint8Array(item.buffer),enumerable:true});}
 const zip=fflate.zipSync(files,{level:6});const restored=fflate.unzipSync(zip);
 for(const name of Object.keys(files)){const a=files[name],b=restored[name];if(!b||a.length!==b.length)throw Error('ZIP verification failed');for(let i=0;i<a.length;i++)if(a[i]!==b[i])throw Error('ZIP verification failed');}
 postMessage({buffer:zip.buffer,names:Object.keys(files)},[zip.buffer]);
}catch(e){postMessage({error:e.message});}};
