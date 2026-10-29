import {Input,ALL_FORMATS,BlobSource,Output,Mp4OutputFormat,BufferTarget,Conversion,Quality} from './vendor/mediabunny.js';
onmessage=async({data})=>{let input,check;
try{
 const {file,resolution,preset}=data;
 if(file.size>50*1024*1024)throw Error('Choose a clip no larger than 50 MB.');
 if(![720,1080].includes(resolution)||!['small','balanced','high'].includes(preset))throw Error('Invalid export settings.');
 if(typeof VideoEncoder==='undefined'||typeof VideoDecoder==='undefined')throw Error('Video conversion is unavailable in this browser. Try current iPhone Safari.');
 postMessage({status:'Checking video and device support…'});
 input=new Input({source:new BlobSource(file),formats:ALL_FORMATS});
 const video=await input.getPrimaryVideoTrack(),audio=await input.getPrimaryAudioTrack();
 if(!video)throw Error('No video track was found. Choose an MP4 or MOV clip.');
 const duration=await input.computeDuration();
 if(!Number.isFinite(duration)||duration<=0||duration>60.1)throw Error('Choose a clip lasting 60 seconds or less.');
 const color=await video.getColorSpace();
 if(['pq','hlg','smpte2084','arib-std-b67'].includes(color.transfer)||color.primaries==='bt2020')throw Error('HDR/wide-color video is not supported in this test. Use an SDR clip to avoid incorrect colors.');
 const sourceW=await video.getDisplayWidth(),sourceH=await video.getDisplayHeight();
 if(sourceW*sourceH>3840*2160||sourceW<2||sourceH<2)throw Error('Input dimensions exceed this test limit (up to 4K).');
 if(!await video.canDecode())throw Error('This device cannot decode this video codec. Try an H.264 MP4 clip.');
 const scale=Math.min(1,(resolution===720?1280:1920)/Math.max(sourceW,sourceH),resolution/Math.min(sourceW,sourceH));
 const width=Math.max(2,Math.floor(sourceW*scale/2)*2),height=Math.max(2,Math.floor(sourceH*scale/2)*2);
 const bitrate=({small:1200000,balanced:2500000,high:4500000}[preset])*(resolution===1080?1.7:1);
 const target=new BufferTarget();const output=new Output({format:new Mp4OutputFormat({fastStart:'in-memory'}),target});
 const conversion=await Conversion.init({input,output,tracks:'primary',showWarnings:false,
  video:{codec:'avc',width,height,fit:'contain',frameRate:30,quality:new Quality({bitrate}),forceTranscode:true,allowTransformationMetadata:false},
  audio:{codec:'aac'}
 });
 if(!conversion.isValid||conversion.discardedTracks.length){throw Error('This device cannot convert all required video/audio tracks. No output was saved. '+conversion.discardedTracks.map(t=>t.reason).join(', '));}
 conversion.onProgress=p=>postMessage({progress:Math.min(95,Math.round(p*95)),status:'Compressing video… Keep this app open.'});
 await conversion.execute();
 if(!target.buffer||!target.buffer.byteLength)throw Error('The encoder produced no output.');
 postMessage({progress:97,status:'Checking output tracks, duration and dimensions…'});
 const blob=new Blob([target.buffer],{type:'video/mp4'});check=new Input({source:new BlobSource(blob),formats:ALL_FORMATS});
 const outV=await check.getPrimaryVideoTrack(),outA=await check.getPrimaryAudioTrack();
 const outDuration=await check.computeDuration();
 if(!outV||await outV.getCodec()!=='avc'||!!outA!==!!audio||Math.abs(outDuration-duration)>Math.max(.5,duration*.02))throw Error('Output verification failed; no download offered.');
 if(await outV.getDisplayWidth()!==width||await outV.getDisplayHeight()!==height)throw Error('Output dimensions failed verification.');
 postMessage({buffer:target.buffer,info:{width,height,duration:outDuration,audio:!!outA,sourceW,sourceH}},[target.buffer]);
}catch(e){postMessage({error:e.message||'Video conversion failed.'});}finally{check?.dispose();input?.dispose();}};
