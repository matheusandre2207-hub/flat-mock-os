// Service worker: rede primeiro para páginas (sempre pega a versão nova),
// cache como reserva offline e stale-while-revalidate para o resto.
const CACHE_NAME = 'mock-os-v4';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (!req.url.startsWith('http')) return;

  // Pacotes de pasta (jogos) guardados no IndexedDB. Jogos checam arquivos com HEAD,
  // então GET e HEAD são atendidos aqui, antes de qualquer cache.
  const folderPrefix = new URL('aeroapps/', self.registration.scope).pathname;
  const reqUrl = new URL(req.url);
  if ((req.method === 'GET' || req.method === 'HEAD') && reqUrl.pathname.startsWith(folderPrefix)) {
    e.respondWith(serveFolderFile(reqUrl.pathname.slice(folderPrefix.length), req.method === 'HEAD'));
    return;
  }

  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/')) return;

  // Pacotes de pasta instalados (jogos): servidos do IndexedDB, nunca em cache

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});


// ---------- Pacotes de pasta (jogos) guardados no IndexedDB do AeroOS ----------
const AERO_DB = 'aeroos';
const AERO_DB_VERSION = 2;
const AERO_FILES = 'files';

function openAeroDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(AERO_DB, AERO_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('apps')) db.createObjectStore('apps', { keyPath: 'id' });
      if (!db.objectStoreNames.contains(AERO_FILES)) db.createObjectStore(AERO_FILES, { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readFolderRecord(key) {
  const db = await openAeroDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(AERO_FILES).objectStore(AERO_FILES).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function serveFolderFile(rest, head) {
  const slash = rest.indexOf('/');
  if (slash < 0) return new Response('Pacote inválido', { status: 400 });
  const appId = decodeURIComponent(rest.slice(0, slash));
  // Ping de verificação: responde 200 só quando esta versão do Service Worker está ativa
  if (appId === '__ping__') return new Response('aeroos-sw', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  let path = decodeURIComponent(rest.slice(slash + 1)).split('?')[0];
  if (!path || path.endsWith('/')) path += 'index.html';
  try {
    const rec = await readFolderRecord(appId + '|' + path);
    if (!rec) return new Response('Arquivo não encontrado no pacote', { status: 404 });
    return new Response(head ? null : rec.blob, {
      headers: {
        'Content-Type': rec.type || 'application/octet-stream',
        'Content-Length': String(rec.blob.size),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    return new Response('Erro ao ler o pacote', { status: 500 });
  }
}
