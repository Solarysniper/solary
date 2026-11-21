// Service worker : fonctionnement 100 % hors ligne. Généré par tools/gen-sw.sh
const VERSION = '202611212119';
const CORE = 'ide-core-' + VERSION;
const PATIENTS = 'ide-patients-v1';
const CORE_FILES = [
  './',
  './css/app.css',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './index.html',
  './js/ai.js',
  './js/app.js',
  './js/content/drugs.js',
  './js/content/fiches.js',
  './js/content/norms.js',
  './js/content/questions.js',
  './js/content/themes.js',
  './js/content/topics.js',
  './js/db.js',
  './js/dict.js',
  './js/gen.js',
  './js/importer.js',
  './js/md.js',
  './js/sim/avatar.js',
  './js/sim/engine.js',
  './js/sim/scenarios.js',
  './js/sim/scenarios2.js',
  './js/sim/scene.js',
  './js/srs.js',
  './js/summarize.js',
  './manifest.webmanifest',
  './vendor/OrbitControls.js',
  './vendor/anthropic.mjs',
  './vendor/environments/RoomEnvironment.js',
  './vendor/geometries/RoundedBoxGeometry.js',
  './vendor/loaders/GLTFLoader.js',
  './vendor/pdf.min.mjs',
  './vendor/pdf.worker.min.mjs',
  './vendor/three.module.min.js',
  './vendor/utils/BufferGeometryUtils.js',
];
const PATIENT_FILES = [
  './patients/Female_Adult_01.glb',
  './patients/Female_Adult_02.glb',
  './patients/Female_Adult_03.glb',
  './patients/Female_Adult_04.glb',
  './patients/Female_Adult_05.glb',
  './patients/Female_Adult_07.glb',
  './patients/Female_Adult_08.glb',
  './patients/Female_Adult_09.glb',
  './patients/Female_Adult_11.glb',
  './patients/Female_Adult_12.glb',
  './patients/Female_Adult_13.glb',
  './patients/Female_Adult_14.glb',
  './patients/Female_Adult_15.glb',
  './patients/Female_Adult_17.glb',
  './patients/Male_Adult_01.glb',
  './patients/Male_Adult_02.glb',
  './patients/Male_Adult_03.glb',
  './patients/Male_Adult_04.glb',
  './patients/Male_Adult_05.glb',
  './patients/Male_Adult_06.glb',
  './patients/Male_Adult_07.glb',
  './patients/Male_Adult_08.glb',
  './patients/Male_Adult_09.glb',
  './patients/Male_Adult_10.glb',
  './patients/Male_Adult_11.glb',
  './patients/Male_Adult_12.glb',
  './patients/Male_Adult_13.glb',
  './patients/Male_Adult_14.glb',
  './patients/Male_Adult_16.glb',
  './patients/Male_Adult_20.glb',
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
