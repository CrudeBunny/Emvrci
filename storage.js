async function removeTemporary(job){if(!job)return;try{const root=await navigator.storage.getDirectory();await root.removeEntry(job);}catch(e){if(e.name!=='NotFoundError')console.warn('Temporary file retained; use Clear temporary files.',e.name);}}
document.getElementById('clear-temporary').onclick=async()=>{
 const status=document.getElementById('storage-status');
 if((typeof videoWorker!=='undefined'&&videoWorker)||(typeof largeWorker!=='undefined'&&largeWorker)){status.textContent='Cancel or finish processing first.';return;}
 try{if(typeof clearVideo==='function')clearVideo();if(typeof clearLarge==='function')clearLarge();const root=await navigator.storage.getDirectory();let count=0;for await(const [name] of root.entries()){if(/^emvrci-job-[a-f0-9-]+$/.test(name)){try{await root.removeEntry(name);count++;}catch(e){if(e.name!=='NotFoundError')throw e;}}}status.textContent='Temporary results cleared. Original files were not touched.';}catch(e){status.textContent='Could not clear temporary storage: '+e.message;}
};
