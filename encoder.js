importScripts('vendor/lame.min.js');
onmessage=({data})=>{try{const channels=data.channels.map(x=>new Float32Array(x));const encoder=new lamejs.Mp3Encoder(channels.length,data.rate,192),chunks=[];const size=1152,total=channels[0].length;
function pcm(a,start){const out=new Int16Array(Math.min(size,a.length-start));for(let i=0;i<out.length;i++){const n=Math.max(-1,Math.min(1,a[start+i]));out[i]=n<0?n*32768:n*32767;}return out;}
for(let i=0;i<total;i+=size){const left=pcm(channels[0],i),right=channels[1]?pcm(channels[1],i):undefined;const part=encoder.encodeBuffer(left,right);if(part.length)chunks.push(new Uint8Array(part));if(i%(size*80)===0)postMessage({progress:Math.round(i/total*100)});}
const tail=encoder.flush();if(tail.length)chunks.push(new Uint8Array(tail));postMessage({blob:new Blob(chunks,{type:'audio/mpeg'})});}catch(e){postMessage({error:e.message});}};
