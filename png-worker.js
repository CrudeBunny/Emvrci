importScripts('vendor/fflate.js');
onmessage=({data})=>{try{const png=new Uint8Array(data),view=new DataView(data),parts=[],ids=[];let length=0;
for(let p=8;p<png.length;){const n=view.getUint32(p),type=String.fromCharCode(...png.subarray(p+4,p+8));if(p+12+n>png.length)throw Error('Invalid PNG chunk');if(type==='IDAT'){ids.push(png.subarray(p+8,p+8+n));length+=n;}else parts.push({type,bytes:png.subarray(p,p+n+12)});p+=n+12;}
const packed=new Uint8Array(length);let offset=0;for(const id of ids){packed.set(id,offset);offset+=id.length;}const raw=fflate.unzlibSync(packed);if(raw.length>110*1024*1024)throw Error('PNG workspace too large');const compressed=fflate.zlibSync(raw,{level:9});
if(compressed.length>=packed.length){postMessage({buffer:data},[data]);return;}
const chunk=new Uint8Array(compressed.length+12),v=new DataView(chunk.buffer);v.setUint32(0,compressed.length);chunk.set([73,68,65,84],4);chunk.set(compressed,8);let crc=-1;for(const byte of chunk.subarray(4,chunk.length-4)){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}v.setUint32(chunk.length-4,(crc^-1)>>>0);
const result=new Uint8Array(8+parts.reduce((n,p)=>n+p.bytes.length,0)+chunk.length);result.set(png.subarray(0,8));offset=8;for(const p of parts){if(p.type==='IEND'){result.set(chunk,offset);offset+=chunk.length;}result.set(p.bytes,offset);offset+=p.bytes.length;}postMessage({buffer:result.buffer},[result.buffer]);
}catch(e){postMessage({error:e.message});}};
