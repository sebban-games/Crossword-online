// Prosty service worker: najpierw sieć, a gdy jej brak, kopia z pamięci.
// Przy każdej nowej wersji gry podbij numer w nazwie CACHE.
const CACHE = 'krzyzowka-duel-v3';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
// Czcionki Google są zapisywane w pamięci, żeby gra wyglądała tak samo bez internetu.
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith('krzyzowka-duel-') && n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });const save = (req, r) => { if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; };
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (FONT_HOSTS.includes(u.hostname)) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => save(e.request, r))));
    return;
  }
  if (u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => save(e.request, r)).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
