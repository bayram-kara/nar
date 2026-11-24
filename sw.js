const CACHE='nar-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==CACHE+'-fonts').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  // Uygulama dosyaları: önce önbellek, arkada güncelle (bir sonraki açılışta yeni sürüm)
  if(u.origin===location.origin){e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(r,{ignoreSearch:true});const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>null);return hit||(await net)||c.match('./index.html')}));return}
  // Google Fonts: ilk açılışta önbelleğe al, sonra internetsiz de kullan
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){e.respondWith(caches.open(CACHE+'-fonts').then(async c=>{const hit=await c.match(r);if(hit)return hit;try{const res=await fetch(r);c.put(r,res.clone());return res}catch(err){return new Response('',{status:504})}}))}});
