#!/bin/bash
# Régénère sw.js avec la liste des fichiers de l'application (à lancer après chaque modification)
cd "$(dirname "$0")/.."
VERSION=$(date +%Y%m%d%H%M)
FILES=$(find index.html manifest.webmanifest css js vendor icons -type f | sort | sed "s|^|  './|; s|$|',|")
PATIENTS=$(find patients -name '*.glb' | sort | sed "s|^|  './|; s|$|',|")
cat > sw.js <<JS
// Service worker : fonctionnement 100 % hors ligne. Généré par tools/gen-sw.sh
const VERSION = '$VERSION';
const CORE = 'ide-core-' + VERSION;
const PATIENTS = 'ide-patients-v1';
const CORE_FILES = [
  './',
$FILES
];
const PATIENT_FILES = [
$PATIENTS
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CORE).then((c) => c.addAll(CORE_FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('ide-core-') && k !== CORE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Téléchargement des patients 3D en arrière-plan (demandé par la page)
async function cachePatients(port) {
  const c = await caches.open(PATIENTS); let done = 0;
  for (const f of PATIENT_FILES) {
    if (!(await c.match(f))) { try { const r = await fetch(f); if (r.ok) await c.put(f, r); } catch (err) { /* hors ligne : on réessaiera */ } }
    done++; port?.postMessage({ done, total: PATIENT_FILES.length });
  }
}
self.addEventListener('message', (e) => {
  if (e.data === 'cache-patients') e.waitUntil(cachePatients(e.ports[0]));
  if (e.data === 'patients-status') e.waitUntil(caches.open(PATIENTS).then(async (c) => { let n = 0; for (const f of PATIENT_FILES) if (await c.match(f)) n++; e.ports[0]?.postMessage({ done: n, total: PATIENT_FILES.length }); }));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // Wikipédia / IA : réseau direct
  if (u.pathname.includes('/patients/')) { // modèles 3D : cache d'abord
    e.respondWith(caches.open(PATIENTS).then(async (c) => (await c.match(e.request)) || fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; })));
    return;
  }
  // application : réponse immédiate depuis le cache, mise à jour en arrière-plan
  e.respondWith(caches.open(CORE).then(async (c) => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || (e.request.mode === 'navigate' ? c.match('./index.html') : Response.error());
  }));
});
JS
echo "sw.js régénéré ($VERSION)"
