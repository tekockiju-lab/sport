const CACHE='sport-v5-december-2026';
const CORE=['./','./index.html','./manifest.webmanifest'];
const ICONS=['./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(CORE);
    await Promise.allSettled(ICONS.map(file=>cache.add(file)));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith('sport-v')&&name!==CACHE).map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE).catch(()=>null);
    try{
      const response=await fetch(request);
      if(response.ok&&cache)await cache.put(request,response.clone()).catch(()=>{});
      return response;
    }catch(error){
      const cached=cache&&await cache.match(request,{ignoreSearch:true});
      if(cached)return cached;
      if(request.mode==='navigate'&&cache){
        const page=await cache.match('./index.html');
        if(page)return page;
      }
      return Response.error();
    }
  })());
});
