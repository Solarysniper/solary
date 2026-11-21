// Dictionnaire : lexique intégré (hors ligne) + Wikipédia FR (en ligne, à la demande, mis en cache)
import { VOCAB, NORMS } from './content/norms.js';
import { DRUGS } from './content/drugs.js';
import { norm } from './content/topics.js';
import { db } from './db.js';

export function localLookup(q) {
  const n = norm(q).trim(); if (!n) return [];
  const out = [];
  for (const [t, d] of VOCAB) if (norm(t).includes(n)) out.push({ title: t, text: d, src: 'Lexique' });
  for (const d of DRUGS) if (norm(d[0]).includes(n) || norm(d[1]).includes(n)) out.push({ title: d[0], text: `${d[1]}. Indication : ${d[2]}. Effets indésirables : ${d[3].join(', ')}. Surveillance : ${d[4]}.${d[5] ? ' Antidote : ' + d[5] + '.' : ''}`, src: 'Médicaments' });
  for (const x of NORMS) if (norm(x[0]).includes(n)) out.push({ title: x[0], text: `Normale : ${x[1]} – ${x[2]} ${x[3]}. ${x[4] ? 'Bas : ' + x[4] + '. ' : ''}Haut : ${x[5]}. ${x[8]}`, src: 'Normes' });
  return out.slice(0, 20);
}

export async function wikiLookup(q) {
  const key = 'wiki:' + norm(q);
  const cached = await db.get('cache', key).catch(() => null);
  if (cached) return cached.v;
  const s = await fetch(`https://fr.wikipedia.org/w/api.php?action=opensearch&format=json&limit=5&namespace=0&origin=*&search=${encodeURIComponent(q)}`).then((r) => r.json());
  const titles = s[1] || [];
  const results = [];
  for (const t of titles.slice(0, 3)) {
    try {
      const r = await fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.replace(/ /g, '_'))}`).then((x) => x.json());
      if (r.extract) results.push({ title: r.title, text: r.extract, url: r.content_urls?.desktop?.page, src: 'Wikipédia' });
    } catch { /* ignore */ }
  }
  await db.put('cache', { k: key, v: results }).catch(() => {});
  return results;
}
