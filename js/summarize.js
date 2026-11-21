// Traitement local (hors ligne) des cours importés : résumé extractif, mots-clés, fiches et QCM.
import { norm } from './content/topics.js';

const STOP = new Set(('a au aux avec ce ces dans de des du elle en et eux il je la le les leur lui ma mais me meme mes moi mon ne nos notre nous on ou par pas pour qu que qui sa se ses son sur ta te tes toi ton tu un une vos votre vous c d j l m n s t y ete etre avoir est sont ont fait faire plus moins tres peut peuvent doit doivent entre sans sous lors ainsi donc alors aussi comme si tout tous toute toutes autre autres cela cet cette celui celle ceux elles ils leurs quand dont ou deux trois chez apres avant selon pendant car soit afin non oui etc lorsque chaque certains certaines parfois souvent toujours jamais encore deja bien fois cas lors type niveau partie permet permettent')
  .split(' '));

export function cleanText(t) {
  return String(t || '').replace(/\r/g, '').replace(/-\n(?=[a-zà-ÿ])/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}
function sentences(text) {
  return text.replace(/\n+/g, ' \n ').split(/(?<=[.!?;])\s+|\s\n\s/).map((s) => s.trim()).filter((s) => s.length > 25 && s.length < 400);
}
const tokens = (s) => norm(s).split(/[^a-z0-9µ]+/).filter((w) => w.length > 2 && !STOP.has(w));

export function keywords(text, n = 20) {
  const tf = new Map();
  for (const w of tokens(text)) tf.set(w, (tf.get(w) || 0) + 1);
  return [...tf.entries()].filter(([w, c]) => c > 1 && !/^\d+$/.test(w)).sort((a, b) => b[1] * Math.log(b[0].length) - a[1] * Math.log(a[0].length)).slice(0, n).map(([w]) => w);
}

// découpe en sections selon les titres probables
function sections(text) {
  const lines = text.split('\n'); const secs = []; let cur = { title: 'Introduction', body: [] };
  for (const l of lines) {
    const t = l.trim(); if (!t) continue;
    const isTitle = t.length < 70 && !/[.;,]$/.test(t) && (/^(#+|\d+[.)]|[IVX]+[.)-]|[A-Z][.)])\s/.test(t) || (t === t.toUpperCase() && /[A-Z]/.test(t) && t.length > 3) || (t.split(' ').length <= 6 && /^[A-ZÉÈÀ]/.test(t) && !/[a-z]{2,}\s[a-z]{2,}\s[a-z]{2,}\s[a-z]{2,}/.test(t)));
    if (isTitle) { if (cur.body.length) secs.push(cur); cur = { title: t.replace(/^#+\s*/, ''), body: [] }; } else cur.body.push(t);
  }
  if (cur.body.length) secs.push(cur);
  return secs.map((s) => ({ title: s.title, text: s.body.join('\n') }));
}

export function summarize(raw, ratio = 0.25) {
  const text = cleanText(raw);
  if (!text) return '';
  const kw = keywords(text, 30); const kwSet = new Set(kw);
  const all = sentences(text);
  const df = new Map(); all.forEach((s) => new Set(tokens(s)).forEach((w) => df.set(w, (df.get(w) || 0) + 1)));
  const score = (s, i, n) => {
    const tk = tokens(s); if (!tk.length) return 0;
    let sc = tk.reduce((a, w) => a + (kwSet.has(w) ? 2 : 0) + Math.log((all.length + 1) / (df.get(w) || 1)), 0) / Math.sqrt(tk.length);
    if (/\b(est|sont|correspond|se d[ée]finit|on appelle|d[ée]signe|signifie)\b/i.test(s)) sc *= 1.4;
    if (/\d/.test(s)) sc *= 1.2;
    if (/\b(signes?|sympt[oô]mes?|traitement|surveillance|risque|complications?|cause|r[oô]le infirmier|objectif|important|attention)\b/i.test(s)) sc *= 1.3;
    if (i === 0) sc *= 1.2;
    return sc;
  };
  const secs = sections(text);
  const out = [];
  for (const sec of secs.length > 1 ? secs : [{ title: '', text }]) {
    const ss = sentences(sec.text); if (!ss.length) continue;
    const k = Math.max(1, Math.round(ss.length * ratio));
    const ranked = ss.map((s, i) => ({ s, i, v: score(s, i, ss.length) })).sort((a, b) => b.v - a.v).slice(0, Math.min(k, 6)).sort((a, b) => a.i - b.i);
    if (sec.title) out.push(`## ${sec.title}`);
    ranked.forEach((r) => out.push(`- ${r.s}`));
    out.push('');
  }
  out.push('## Mots-clés', kw.slice(0, 15).join(' · '));
  return out.join('\n');
}

// Flashcards : définitions « X est/sont… », « X : … », et cartes à trous sur les chiffres
export function makeCards(raw, max = 60) {
  const text = cleanText(raw); const cards = []; const seen = new Set();
  const add = (front, back) => { const k = norm(front); if (seen.has(k) || front.length < 3 || back.length < 8) return; seen.add(k); cards.push({ front, back }); };
  for (const line of text.split('\n')) {
    const m = /^\s*[-•*]?\s*([A-ZÀ-Ýa-zà-ÿ0-9’' ()/-]{3,50})\s*[:=–]\s+(.{8,250})$/.exec(line);
    if (m) add(`Définir : ${m[1].trim()}`, m[2].trim());
  }
  for (const s of sentences(text)) {
    let m = /^(L[ea]s?|L’|Une?|Les)?\s*([^,.;]{3,60}?)\s+(est|sont|se définit par|se définissent par|correspond à|désigne|signifie)\s+(.{10,250})$/i.exec(s);
    if (m && m[2].split(' ').length <= 7) add(`${m[1] ? m[1] + ' ' : ''}${m[2]} ${m[3]}…`, m[4].replace(/[.]$/, ''));
    m = /(.{15,}?)(\b\d+(?:[.,]\d+)?\s?(?:%|mg|g|mL|ml|L|mmol\/L|g\/L|mmHg|°C|\/min|UI|h|heures|jours|ans|kg)\b)(.*)/.exec(s);
    if (m && cards.length < max * 2) add(`Complétez : ${m[1]}____${m[3]}`, m[2]);
    if (cards.length >= max) break;
  }
  return cards.slice(0, max);
}

// QCM à partir des cartes (distracteurs = autres réponses)
export function makeQuiz(raw, docId, max = 30) {
  const cards = makeCards(raw, max * 2); const backs = cards.map((c) => c.back);
  const qs = [];
  for (const [i, c] of cards.entries()) {
    const wrong = backs.filter((b) => b !== c.back && Math.abs(b.length - c.back.length) < c.back.length + 30).sort(() => Math.random() - 0.5).slice(0, 3);
    if (wrong.length < 2) continue;
    qs.push({ id: `doc-${docId}-${i}`, theme: 'doc', doc: docId, kind: 'qcm', q: c.front, options: [c.back, ...wrong], answer: 0, explain: 'Issu de votre cours importé.' });
    if (qs.length >= max) break;
  }
  return qs;
}
