import {openDisk} from './disk-store.js';
onmessage=async({data})=>{let disk;
try{const {file,job}=data;if(file.size>3*1024**3)throw Error('The single-file test limit is 3 GB.');if(typeof CompressionStream==='undefined')throw Error('This browser does not support streaming GZIP.');
 disk=await openDisk(job,file.size*1.05+64*1024**2);let read=0,position=0;
 const source=file.stream().pipeThrough(new TransformStream({transform(chunk,controller){read+=chunk.length;postMessage({progress:Math.round(read/Math.max(1,file.size)*75),status:'Compressing to temporary storage…'});controller.enqueue(chunk);}}));
 await source.pipeThrough(new CompressionStream('gzip')).pipeTo(new WritableStream({write(chunk){disk.write(chunk,position);position+=chunk.length;}}));
 const output=await disk.finish();
 postMessage({progress:76,status:'Verifying exact original bytes…'});
 const a=file.stream().getReader(),b=output.stream().pipeThrough(new DecompressionStream('gzip')).getReader();let left=new Uint8Array(),right=new Uint8Array(),i=0,j=0,total=0,ad=false,bd=false;
 try{while(true){if(i===left.length&&!ad){const r=await a.read();ad=r.done;left=r.value||new Uint8Array();i=0;}if(j===right.length&&!bd){const r=await b.read();bd=r.done;right=r.value||new Uint8Array();j=0;}if(ad||bd){if(ad&&bd)break;throw Error('Restored size verification failed.');}const n=Math.min(left.length-i,right.length-j);for(let k=0;k<n;k++)if(left[i+k]!==right[j+k])throw Error('Restored content verification failed.');i+=n;j+=n;total+=n;postMessage({progress:76+Math.round(total/Math.max(1,file.size)*23),status:'Verifying exact original bytes…'});}if(total!==file.size)throw Error('Restored size mismatch.');}finally{await a.cancel();await b.cancel();}
 postMessage({file:output});
}catch(e){postMessage({error:e.name==='QuotaExceededError'?'Device storage is full. Clear temporary files and free space.':e.message});}finally{disk?.close();}};
