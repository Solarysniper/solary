// Petit wrapper IndexedDB (stockage local, hors ligne)
const DB = 'revision-ide'; const VER = 1;
let dbp;
function open() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB, VER);
    r.onupgradeneeded = () => {
      const d = r.result;
      for (const s of ['docs', 'cards', 'kv', 'history', 'cache']) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: s === 'kv' || s === 'cache' ? 'k' : 'id' });
    };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function tx(store, mode, fn) {
  const d = await open();
  return new Promise((res, rej) => {
    const t = d.transaction(store, mode); const s = t.objectStore(store); let out;
    Promise.resolve(fn(s)).then((v) => { out = v; });
    t.oncomplete = () => res(out); t.onerror = () => rej(t.error);
  });
}
const req = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
export const db = {
  all: (store) => tx(store, 'readonly', (s) => req(s.getAll())),
  get: (store, id) => tx(store, 'readonly', (s) => req(s.get(id))),
  put: (store, v) => tx(store, 'readwrite', (s) => req(s.put(v))),
  del: (store, id) => tx(store, 'readwrite', (s) => req(s.delete(id))),
  clear: (store) => tx(store, 'readwrite', (s) => req(s.clear())),
  async kv(k, v) { if (v === undefined) return (await db.get('kv', k))?.v; return db.put('kv', { k, v }); },
};
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
