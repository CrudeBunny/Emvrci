export async function openDisk(job,required){
 if(!/^emvrci-job-[a-f0-9-]+$/.test(job))throw Error('Invalid temporary file name.');
 if(!navigator.storage?.getDirectory)throw Error('This browser lacks temporary-file storage. Update Safari or use a desktop browser.');
 const estimate=await navigator.storage.estimate();
 if(estimate.quota&&estimate.quota-(estimate.usage||0)<required)throw Error('Not enough browser storage. Save results, clear temporary files, and free device space.');
 const root=await navigator.storage.getDirectory();const handle=await root.getFileHandle(job,{create:true});
 if(!handle.createSyncAccessHandle)throw Error('This browser cannot stream output to storage. Update Safari or use a desktop browser.');
 const access=await handle.createSyncAccessHandle();access.truncate(0);let closed=false;
 return {write(bytes,position){if(access.write(bytes,{at:position})!==bytes.byteLength)throw Error('Incomplete write: storage may be full.');},async finish(){access.flush();access.close();closed=true;return handle.getFile();},close(){if(!closed){access.close();closed=true;}}};
}
