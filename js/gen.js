// Génération des questions : banque rédigée + générateurs (médicaments, normes, vocabulaire, calculs)
import { QUESTIONS } from './content/questions.js';
import { DRUGS } from './content/drugs.js';
import { NORMS, VOCAB } from './content/norms.js';

const R = Math.random;
export const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a) => a[Math.floor(R() * a.length)];
const pickN = (a, n, excl = []) => shuffle(a.filter((x) => !excl.includes(x))).slice(0, n);
const uniq = (a) => [...new Set(a)];
const fr = (n, d = 1) => Number(n).toLocaleString('fr-FR', { maximumFractionDigits: d });
const ri = (a, b) => a + Math.floor(R() * (b - a + 1));

function qcm(id, theme, q, correct, wrongs, explain, extra = {}) {
  return { id, theme, kind: 'qcm', q, options: [correct, ...wrongs.slice(0, 3)], answer: 0, explain, ...extra };
}

let _pool = null;
export function staticPool() {
  if (_pool) return _pool;
  const out = [];
  QUESTIONS.forEach(([theme, q, c, w, e], i) => out.push(qcm('c' + i, theme, q, c, w, e)));
  // Médicaments
  const classes = uniq(DRUGS.map((d) => d[1]));
  const indications = uniq(DRUGS.map((d) => d[2]));
  const surv = uniq(DRUGS.map((d) => d[4]));
  const antidotes = uniq(DRUGS.map((d) => d[5]).filter(Boolean));
  DRUGS.forEach((d, i) => {
    const [name, cls, ind, ei, sv, anti] = d; const ex = { drug: name, cls };
    const fiche = `${name} — ${cls}. Indication : ${ind}. EI : ${ei.join(', ')}. Surveillance : ${sv}.${anti ? ' Antidote : ' + anti + '.' : ''}`;
    out.push(qcm(`d${i}a`, 'pharma', `À quelle classe appartient ${name} ?`, cls, pickN(classes, 3, [cls]), fiche, ex));
    out.push(qcm(`d${i}b`, 'pharma', `Quelle est l’indication principale de ${name} ?`, ind, pickN(indications.filter((x) => !DRUGS.some((o) => o[1] === cls && o[2] === x)), 3, [ind]), fiche, ex));
    const otherEI = uniq(DRUGS.filter((o) => o[1] !== cls).flatMap((o) => o[3])).filter((x) => !ei.includes(x));
    out.push(qcm(`d${i}c`, 'pharma', `Quel effet indésirable est typique de ${name} ?`, pick(ei), pickN(otherEI, 3), fiche, ex));
    out.push(qcm(`d${i}d`, 'pharma', `Quelle surveillance est prioritaire sous ${name} ?`, sv, pickN(surv.filter((x) => !DRUGS.some((o) => o[1] === cls && o[4] === x)), 3, [sv]), fiche, ex));
    if (anti) out.push(qcm(`d${i}e`, 'pharma', `Quel est l’antidote de ${name} ?`, anti, pickN(antidotes, 3, [anti]), fiche, ex));
    const others = DRUGS.filter((o) => o[1] !== cls).map((o) => o[0]);
    out.push(qcm(`d${i}f`, 'pharma', `Quel médicament est un(e) ${cls.toLowerCase()} ?`, name, pickN(others, 3), fiche, ex));
  });
  // Normes
  NORMS.forEach((n, i) => {
    const [p, lo, hi, u, tLo, tHi, dec, theme, note] = n;
    const f = (x) => fr(x, dec); const rng = (a, b) => `${f(a)} – ${f(b)}${u ? ' ' + u : ''}`;
    const wr = [rng(lo * 0.5, hi * 0.5), rng(lo * 1.6, hi * 1.6), rng(lo * 2.5 || 1, hi * 2.5)];
    out.push(qcm(`n${i}a`, theme, `Quelle est la valeur normale : ${p} ?`, rng(lo, hi), wr, `${p} : ${rng(lo, hi)}. ${note}`));
    const interp = (v, correct, tag) => {
      const opts = uniq([correct, tLo || 'Valeur basse', tHi, 'Valeur normale', 'Valeur ininterprétable']).filter(Boolean);
      out.push(qcm(`n${i}${tag}`, theme, `${p} à ${f(v)}${u ? ' ' + u : ''} : comment l’interpréter ?`, correct, opts.filter((x) => x !== correct), `Normale : ${rng(lo, hi)}. ${note}`));
    };
    if (tLo && lo > 0) interp(lo * 0.82, tLo, 'b');
    interp((lo + hi) / 2, 'Valeur normale', 'c');
    interp(hi * 1.25 + (hi === 0 ? 10 : 0), tHi, 'd');
  });
  // Vocabulaire
  const defs = VOCAB.map((v) => v[1]); const terms = VOCAB.map((v) => v[0]);
  VOCAB.forEach(([t, d], i) => {
    out.push(qcm(`v${i}a`, 'vocab', `Que signifie « ${t} » ?`, d, pickN(defs, 3, [d]), `${t} : ${d}.`));
    out.push(qcm(`v${i}b`, 'vocab', `Quel terme correspond à : ${d.charAt(0).toLowerCase() + d.slice(1)} ?`, t, pickN(terms, 3, [t]), `${t} : ${d}.`));
  });
  return (_pool = out);
}

// ===== Calculs (générés à l'infini) =====
const CALC_GEN = {
  debit_mlh() {
    const v = pick([250, 500, 1000, 1500, 2000]); const h = pick([2, 4, 6, 8, 12, 24]);
    return { q: `Perfusion de ${v} mL à passer en ${h} h. Quel débit en mL/h ?`, value: v / h, unit: 'mL/h', tol: 0.6, explain: `${v} ÷ ${h} = ${fr(v / h)} mL/h.` };
  },
  gouttes() {
    const v = pick([250, 500, 1000, 1500, 2000]); const h = pick([1, 2, 4, 6, 8, 12, 24]); const g = (v * 20) / (h * 60);
    return { q: `${v} mL à passer en ${h} h avec un perfuseur standard (20 gouttes = 1 mL). Débit en gouttes/min ?`, value: g, unit: 'gouttes/min', tol: 1, explain: `${v} × 20 ÷ (${h} × 60) = ${fr(g)} → ${Math.round(g)} gouttes/min.` };
  },
  pse() {
    const drug = pick([['morphine', 50, 'mg'], ['furosémide', 250, 'mg'], ['insuline', 50, 'UI'], ['nicardipine', 10, 'mg'], ['midazolam', 50, 'mg']]);
    const vol = pick([48, 50]); const conc = drug[1] / vol; const dose = +(conc * pick([1, 2, 3, 4, 5, 6, 8, 10])).toFixed(2);
    const r = dose / conc;
    return { q: `PSE : ${drug[1]} ${drug[2]} de ${drug[0]} dilués dans ${vol} mL. Prescription : ${fr(dose, 2)} ${drug[2]}/h. Vitesse en mL/h ?`, value: r, unit: 'mL/h', tol: 0.1, explain: `Concentration = ${drug[1]} ÷ ${vol} = ${fr(conc, 3)} ${drug[2]}/mL. Vitesse = ${fr(dose, 2)} ÷ ${fr(conc, 3)} = ${fr(r, 2)} mL/h.` };
  },
  mgkg() {
    const p = ri(8, 90); const d = pick([10, 15, 20, 25, 30, 50, 60, 100]); const n = pick([2, 3, 4]);
    const per = (p * d) / n;
    return { q: `Patient de ${p} kg. Prescription : ${d} mg/kg/j en ${n} prises. Dose par prise (mg) ?`, value: per, unit: 'mg', tol: Math.max(0.6, per * 0.01), explain: `${p} × ${d} = ${p * d} mg/j ; ÷ ${n} = ${fr(per)} mg par prise.` };
  },
  ampoule() {
    const amp = pick([[100, 2], [40, 2], [500, 5], [1000, 10], [20, 1], [50, 5], [10, 1], [250, 5]]);
    const want = +(amp[0] * pick([0.25, 0.5, 0.75, 1.5, 2])).toFixed(1); const v = (want / amp[0]) * amp[1];
    return { q: `Ampoule de ${amp[0]} mg / ${amp[1]} mL. Prescription : ${fr(want)} mg. Volume à prélever (mL) ?`, value: v, unit: 'mL', tol: 0.06, explain: `${fr(want)} ÷ ${amp[0]} × ${amp[1]} = ${fr(v, 2)} mL.` };
  },
  pourcent() {
    const s = pick([['G5 %', 5, 'glucose'], ['G10 %', 10, 'glucose'], ['G30 %', 30, 'glucose'], ['NaCl 0,9 %', 0.9, 'NaCl'], ['KCl 10 %', 10, 'KCl'], ['NaCl 20 %', 20, 'NaCl']]);
    const v = pick(s[1] >= 10 && s[2] !== 'glucose' ? [10, 20] : [10, 20, 100, 250, 500, 1000]); const g = (s[1] * v) / 100;
    return { q: `Combien de grammes de ${s[2]} dans ${v} mL de ${s[0]} ?`, value: g, unit: 'g', tol: 0.02, explain: `${s[0]} = ${fr(s[1])} g pour 100 mL → ${fr(s[1])} × ${v} ÷ 100 = ${fr(g, 2)} g.` };
  },
  conversion() {
    const c = pick([[() => ri(1, 9) / 10, 'g', 'mg', 1000], [() => ri(1, 900), 'µg', 'mg', 0.001], [() => ri(1, 30) / 10, 'L', 'mL', 1000], [() => ri(50, 2000), 'mg', 'g', 0.001], [() => ri(1, 5) / 10, 'mg', 'µg', 1000], [() => ri(1, 48) * 5, 'min', 'h', 1 / 60]]);
    const x = c[0](); const v = x * c[3];
    return { q: `Convertir ${fr(x, 3)} ${c[1]} en ${c[2]}.`, value: v, unit: c[2], tol: Math.abs(v) * 0.005 + 0.001, explain: `${fr(x, 3)} ${c[1]} = ${fr(v, 3)} ${c[2]}.` };
  },
  heparine() {
    const ui = pick([20000, 25000, 30000, 35000, 40000]);
    return { q: `Héparine : 25 000 UI dans une seringue complétée à 50 mL. Prescription ${fr(ui, 0)} UI/24 h. Vitesse du PSE (mL/h) ?`, value: (ui / 500) / 24, unit: 'mL/h', tol: 0.05, explain: `Concentration = 500 UI/mL. ${fr(ui, 0)} ÷ 500 = ${fr(ui / 500)} mL/24 h ; ÷ 24 = ${fr(ui / 500 / 24, 2)} mL/h.` };
  },
  temps() {
    const rest = pick([100, 150, 200, 250, 300, 400, 500]); const d = pick([25, 50, 75, 100, 125]); const h = rest / d;
    return { q: `Il reste ${rest} mL dans la poche, débit ${d} mL/h. Dans combien d’heures la perfusion sera-t-elle terminée ?`, value: h, unit: 'h', tol: 0.05, explain: `${rest} ÷ ${d} = ${fr(h, 2)} h (${Math.floor(h)} h ${Math.round((h % 1) * 60)} min).` };
  },
  imc() {
    const p = ri(40, 130); const t = ri(150, 195) / 100; const v = p / (t * t);
    const cl = v < 18.5 ? 'maigreur' : v < 25 ? 'corpulence normale' : v < 30 ? 'surpoids' : 'obésité';
    return { q: `Patient de ${p} kg pour ${fr(t, 2)} m. Calculer l’IMC (kg/m²).`, value: v, unit: 'kg/m²', tol: 0.3, explain: `${p} ÷ (${fr(t, 2)} × ${fr(t, 2)}) = ${fr(v)} kg/m² : ${cl}.` };
  },
  glasgow() {
    const Y = [[4, 'ouvre les yeux spontanément'], [3, 'ouvre les yeux à la demande'], [2, 'ouvre les yeux à la douleur'], [1, 'n’ouvre pas les yeux']];
    const V = [[5, 'est orienté'], [4, 'est confus'], [3, 'prononce des mots inappropriés'], [2, 'émet des sons incompréhensibles'], [1, 'n’a aucune réponse verbale']];
    const M = [[6, 'obéit aux ordres'], [5, 'localise la douleur'], [4, 'a un mouvement d’évitement'], [3, 'présente une flexion stéréotypée'], [2, 'présente une extension stéréotypée'], [1, 'n’a aucune réponse motrice']];
    const y = pick(Y), v = pick(V), m = pick(M); const s = y[0] + v[0] + m[0];
    return { q: `Le patient ${y[1]}, ${v[1]} et ${m[1]}. Score de Glasgow ?`, value: s, unit: '/15', tol: 0, explain: `Y${y[0]} + V${v[0]} + M${m[0]} = ${s}/15.${s <= 8 ? ' Coma grave (≤ 8).' : ''}`, theme: 'neuro' };
  },
  constantes() {
    const cases = [
      () => { const v = ri(101, 150); return [`FC à ${v}/min chez un adulte au repos`, 'Tachycardie', ['Bradycardie', 'Normale', 'Bradypnée']]; },
      () => { const v = ri(35, 55); return [`FC à ${v}/min chez un adulte`, 'Bradycardie', ['Tachycardie', 'Normale', 'Tachypnée']]; },
      () => { const v = ri(24, 40); return [`FR à ${v}/min chez un adulte`, 'Tachypnée', ['Bradypnée', 'Normale', 'Tachycardie']]; },
      () => { const v = ri(5, 10); return [`FR à ${v}/min chez un adulte`, 'Bradypnée', ['Tachypnée', 'Normale', 'Apnée']]; },
      () => { const v = (ri(381, 410) / 10); return [`Température à ${fr(v)} °C`, 'Hyperthermie (fièvre)', ['Hypothermie', 'Normale', 'Apyrexie']]; },
      () => { const v = (ri(330, 349) / 10); return [`Température à ${fr(v)} °C`, 'Hypothermie', ['Hyperthermie', 'Normale', 'Fièvre']]; },
      () => { const v = ri(150, 200); return [`PA à ${v}/${ri(90, 115)} mmHg`, 'Hypertension artérielle', ['Hypotension', 'Normale', 'Choc']]; },
      () => { const v = ri(70, 88); return [`PA à ${v}/${ri(40, 55)} mmHg`, 'Hypotension artérielle', ['Hypertension', 'Normale', 'HTA maligne']]; },
      () => { const v = ri(80, 91); return [`SpO₂ à ${v} % chez un adulte sans BPCO`, 'Désaturation (hypoxémie)', ['Normale', 'Hyperoxie', 'Hypercapnie certaine']]; },
      () => { const v = ri(64, 90); return [`FC à ${v}/min, FR ${ri(13, 19)}/min chez un adulte`, 'Valeurs normales', ['Tachycardie', 'Bradypnée', 'Bradycardie']]; },
    ];
    const [q, c, w] = pick(cases)();
    return { kind: 'qcm', q: `${q} : comment l’interpréter ?`, options: [c, ...w], answer: 0, explain: 'Adulte : FC 60–100, FR 12–20, T° 36,5–37,5, PAS 90–140, SpO₂ ≥ 95 %.', theme: 'soins' };
  },
};
export const CALC_TYPES = Object.keys(CALC_GEN);
let calcId = 0;
export function calcQuestion(type) {
  const t = type || pick(CALC_TYPES);
  const o = CALC_GEN[t]();
  return { id: `g-${t}-${++calcId}-${Date.now() % 100000}`, theme: 'calc', kind: 'num', gen: t, ...o };
}

// Construit une série de questions selon filtres
export function buildSet({ filter, count = 10, calc = 'mix', extra = [] }) {
  let pool = staticPool().concat(extra);
  if (filter) pool = pool.filter(filter);
  const out = shuffle(pool).slice(0, count);
  // complète avec des calculs si demandé ou si le pool est petit
  const calcTypes = typeof calc === 'string' && calc !== 'mix' && calc !== 'none' ? [calc] : calc === 'mix' ? CALC_TYPES : [];
  while (out.length < count && calcTypes.length) out.push(calcQuestion(pick(calcTypes)));
  return out.map(prepare);
}

// mélange les options et garde l'indice de la bonne réponse
export function prepare(q) {
  if (q.kind !== 'qcm') return { ...q };
  const idx = shuffle(q.options.map((_, i) => i));
  return { ...q, options: idx.map((i) => q.options[i]), answer: idx.indexOf(q.answer) };
}

export function checkNum(q, input) {
  const v = parseFloat(String(input).replace(',', '.').replace(/\s/g, ''));
  if (isNaN(v)) return false;
  return Math.abs(v - q.value) <= (q.tol ?? 0.01) + 1e-9;
}
export const fmtNum = (v) => fr(v, 2);
