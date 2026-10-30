// Print density only; these helpers never resample pixels.
const ImageDPI=(()=>{
 const text=(b,p,n)=>String.fromCharCode(...b.subarray(p,p+n));
 const valid=d=>d&&Number.isFinite(d.x)&&Number.isFinite(d.y)&&d.x>0&&d.y>0&&d.x<=65535&&d.y<=65535;
 function exif(b){try{const v=new DataView(b.buffer,b.byteOffset,b.byteLength),le=text(b,0,2)==='II';if(!le&&text(b,0,2)!=='MM')return null;const u16=p=>v.getUint16(p,le),u32=p=>v.getUint32(p,le);if(u16(2)!==42)return null;let p=u32(4),n=u16(p),x,y,unit=2,orientation=1;if(n>4096)return null;for(let i=0;i<n;i++){const q=p+2+i*12,tag=u16(q),type=u16(q+2);if(u32(q+4)!==1)continue;if((tag===282||tag===283)&&type===5){const r=u32(q+8),value=u32(r)/u32(r+4);if(tag===282)x=value;else y=value;}if(tag===296&&type===3)unit=u16(q+8);if(tag===274&&type===3)orientation=u16(q+8);}if(unit!==2&&unit!==3)return null;const factor=unit===3?2.54:1;let d={x:x*factor,y:y*factor};if(orientation>=5&&orientation<=8)d={x:d.y,y:d.x};return valid(d)?d:null;}catch{return null;}}
 function read(bytes){const b=new Uint8Array(bytes),v=new DataView(b.buffer,b.byteOffset,b.byteLength);try{
  if(text(b,1,3)==='PNG'){for(let p=8;p+12<=b.length;){const n=v.getUint32(p),t=text(b,p+4,4);if(p+n+12>b.length)return null;if(t==='pHYs'&&n===9&&b[p+16]===1){const d={x:v.getUint32(p+8)*.0254,y:v.getUint32(p+12)*.0254};return valid(d)?d:null;}p+=n+12;}return null;}
  if(b[0]!==255||b[1]!==216)return null;let jfif=null;
  for(let p=2;p+4<=b.length;){if(b[p]!==255)break;const marker=b[p+1];if(marker===218||marker===217)break;const n=v.getUint16(p+2);if(n<2||p+2+n>b.length)break;if(marker===225&&text(b,p+4,6)==='Exif\0\0'){const d=exif(b.subarray(p+10,p+2+n));if(d)return d;}if(marker===224&&n>=16&&text(b,p+4,5)==='JFIF\0'){const unit=b[p+11],factor=unit===1?1:unit===2?2.54:0;const d={x:v.getUint16(p+12)*factor,y:v.getUint16(p+14)*factor};if(valid(d))jfif=d;}p+=2+n;}return jfif;
 }catch{return null;}}
 function crc(b){let c=0xffffffff;for(const byte of b){c^=byte;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
 function stamp(bytes,kind,d){if(!valid(d))throw Error('DPI must be between 1 and 65535.');const b=new Uint8Array(bytes),v=new DataView(b.buffer,b.byteOffset,b.byteLength);
  if(kind==='png'){const chunk=new Uint8Array(21),cv=new DataView(chunk.buffer);cv.setUint32(0,9);chunk.set([112,72,89,115],4);cv.setUint32(8,Math.round(d.x/.0254));cv.setUint32(12,Math.round(d.y/.0254));chunk[16]=1;cv.setUint32(17,crc(chunk.subarray(4,17)));const parts=[b.subarray(0,8)];let inserted=false;for(let p=8;p+12<=b.length;){const n=v.getUint32(p),t=text(b,p+4,4);if(p+n+12>b.length)throw Error('Invalid PNG output.');if(t!=='pHYs')parts.push(b.subarray(p,p+n+12));if(t==='IHDR'){parts.push(chunk);inserted=true;}p+=n+12;}if(!inserted)throw Error('Invalid PNG output.');return new Blob(parts,{type:'image/png'});}
  // JFIF for common viewers, plus EXIF rational values for fractional densities.
  const jf=new Uint8Array([255,224,0,16,74,70,73,70,0,1,2,1,0,0,0,0,0,0]),jv=new DataView(jf.buffer);jv.setUint16(12,Math.round(d.x));jv.setUint16(14,Math.round(d.y));
  const e=new Uint8Array(76),ev=new DataView(e.buffer);e.set([255,225,0,74,69,120,105,102,0,0,73,73,42,0,8,0,0,0]);ev.setUint16(18,3,true);
  for(let i=0;i<3;i++){const q=20+i*12;ev.setUint16(q,[282,283,296][i],true);ev.setUint16(q+2,i<2?5:3,true);ev.setUint32(q+4,1,true);ev.setUint32(q+8,i<2?50+i*8:2,true);}ev.setUint32(60,Math.round(d.x*1000),true);ev.setUint32(64,1000,true);ev.setUint32(68,Math.round(d.y*1000),true);ev.setUint32(72,1000,true);
  const parts=[b.subarray(0,2),jf,e];let p=2;while(p+4<=b.length){const marker=b[p+1];if(b[p]!==255||marker===218||marker===217)break;const n=v.getUint16(p+2);if(n<2||p+n+2>b.length)throw Error('Invalid JPEG output.');if(!((marker===224&&text(b,p+4,5)==='JFIF\0')||(marker===225&&text(b,p+4,6)==='Exif\0\0')))parts.push(b.subarray(p,p+n+2));p+=n+2;}parts.push(b.subarray(p));return new Blob(parts,{type:'image/jpeg'});
 }
 return {read,stamp};
})();
