// Delivery cache for two immutable TERRACE videos only. No game state or analytics.
const CACHE='terrace-c-v9-media-v1';
const MEDIA=['assets/resources/native/81/81a8844d-fa0c-439a-8ad1-a1595b9ca723.mp4','assets/resources/native/8a/8a05b894-028c-44cb-b545-a3c598194bea.mp4'].map(p=>new URL(p,self.registration.scope).href);
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||!MEDIA.includes(event.request.url))return;
 event.respondWith((async()=>{
  const cached=await(await caches.open(CACHE)).match(event.request.url);
  if(!cached)return fetch(event.request);
  const range=event.request.headers.get('range');
  if(!range)return cached;
  const bytes=await cached.arrayBuffer(),match=/^bytes=(\d*)-(\d*)$/.exec(range);
  if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
  const start=match[1]?Number(match[1]):Math.max(0,bytes.byteLength-Number(match[2]));
  const end=match[1]&&match[2]?Math.min(Number(match[2]),bytes.byteLength-1):bytes.byteLength-1;
  if(start>end||start>=bytes.byteLength)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
  return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':'video/mp4','Accept-Ranges':'bytes','Content-Length':String(end-start+1),'Content-Range':`bytes ${start}-${end}/${bytes.byteLength}`}});
 })());
});
