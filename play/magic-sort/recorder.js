// Optional QA only. Actual canvas frames are posted to this local research server.
if(new URLSearchParams(location.search).has('capture')){
 const panel=document.createElement('div');panel.style='position:fixed;right:0;bottom:0;z-index:20;background:#fff4e5;color:#514334;font:12px system-ui;padding:3px';
 const button=document.createElement('button');button.textContent='Record next pour';panel.append(button);document.body.append(panel);
 let recorder,chunks=[],stream,armed=false,started=false,start=0,events=[],last='';
 button.onclick=()=>{if(armed)return;stream=document.querySelector('#GameCanvas').captureStream(30);chunks=[];events=[];started=false;armed=true;start=performance.now();recorder=new MediaRecorder(stream,{mimeType:'video/webm',videoBitsPerSecond:2800000});
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
 recorder.onstop=async()=>{const blob=new Blob(chunks,{type:'video/webm'});const name='pour-'+Date.now();await fetch('/__capture/'+name+'.webm',{method:'POST',body:blob});await fetch('/__capture/'+name+'.json',{method:'POST',body:JSON.stringify({start,events,mimeType:blob.type,size:blob.size})});button.textContent='Saved '+name;button.disabled=false;armed=false;stream.getTracks().forEach(t=>t.stop());};
 recorder.start(100);button.textContent='Recording — choose two bottles';button.disabled=true;};
 setInterval(()=>{if(!armed)return;const el=document.querySelector('#garden-state');if(!el)return;let state;try{state=JSON.parse(el.textContent)}catch{return}const k=JSON.stringify([state.motion,state.screen,state.moves,state.selected]);if(k!==last){events.push({videoMs:performance.now()-start,state});last=k;}
 if(state.motion?.kind==='pour')started=true;
 if(started&&!state.motion&&recorder?.state==='recording'){started=false;button.textContent='Saving recording…';setTimeout(()=>{if(recorder?.state==='recording')recorder.stop();},500);}},16);
}
