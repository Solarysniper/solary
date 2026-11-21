// Moteur de simulation patient (sans dépendance au rendu)
import { SCENARIOS as S1, MEDS } from './scenarios.js';
import { SCENARIOS2, MEDS2 } from './scenarios2.js';
const SCENARIOS = [...S1, ...SCENARIOS2];

// Catalogue d'actions : durée (minutes de jeu), contact = nécessite l'hygiène des mains, group
export const ACTIONS = {
  sha: { label: 'Friction hydro-alcoolique', group: 'Hygiène', dur: 0.5 },
  gants: { label: 'Mettre des gants', group: 'Hygiène', dur: 0.3 },
  identito: { label: 'Vérifier l’identité (bracelet)', group: 'Hygiène', dur: 0.3 },
  interroger: { label: 'Interroger le patient', group: 'Évaluer', dur: 1 },
  observer: { label: 'Observer (coloration, respiration, FR)', group: 'Évaluer', dur: 0.5 },
  conscience: { label: 'Évaluer la conscience (Glasgow)', group: 'Évaluer', dur: 0.5, contact: true },
  pupilles: { label: 'Examiner les pupilles', group: 'Évaluer', dur: 0.3, contact: true },
  eva: { label: 'Évaluer la douleur (EVA)', group: 'Évaluer', dur: 0.5 },
  ausculter: { label: 'Ausculter (stéthoscope)', group: 'Évaluer', dur: 1, contact: true },
  examen: { label: 'Examen clinique / palpation', group: 'Évaluer', dur: 1, contact: true },
  heure: { label: 'Noter l’heure de début des symptômes', group: 'Évaluer', dur: 0.3 },
  stimuler: { label: 'Stimuler le patient', group: 'Évaluer', dur: 0.3, contact: true },
  scope: { label: 'Brancher le scope', group: 'Mesurer', dur: 1, contact: true },
  pa: { label: 'Prendre la pression artérielle', group: 'Mesurer', dur: 1, contact: true },
  spo2: { label: 'Oxymètre de pouls (SpO₂, FC)', group: 'Mesurer', dur: 0.5, contact: true },
  temp: { label: 'Prendre la température', group: 'Mesurer', dur: 0.5, contact: true },
  glyc: { label: 'Glycémie capillaire', group: 'Mesurer', dur: 1, contact: true },
  ecg: { label: 'ECG 12 dérivations', group: 'Mesurer', dur: 4, contact: true },
  bladder: { label: 'Bladder scan', group: 'Mesurer', dur: 2, contact: true },
  pos_demi: { label: 'Position demi-assise', group: 'Installer', dur: 0.5, contact: true },
  pos_assis: { label: 'Assis, jambes pendantes', group: 'Installer', dur: 0.5, contact: true },
  pos_plat: { label: 'Allonger à plat', group: 'Installer', dur: 0.5, contact: true },
  pos_trend: { label: 'Allonger, jambes surélevées', group: 'Installer', dur: 0.5, contact: true },
  pos_pls: { label: 'Position latérale de sécurité', group: 'Installer', dur: 0.5, contact: true },
  repos: { label: 'Repos strict au lit', group: 'Installer', dur: 0.2 },
  ajeun: { label: 'Laisser à jeun (rien per os)', group: 'Installer', dur: 0.2 },
  o2_lun: { label: 'O₂ lunettes (1–3 L/min)', group: 'Oxygène', dur: 0.5, contact: true },
  o2_mhc: { label: 'O₂ masque haute concentration (15 L/min)', group: 'Oxygène', dur: 0.5, contact: true },
  vvp: { label: 'Poser une voie veineuse', group: 'Gestes', dur: 4, contact: true },
  bilan: { label: 'Prélever un bilan sanguin', group: 'Gestes', dur: 3, contact: true },
  hemoc: { label: 'Hémocultures', group: 'Gestes', dur: 3, contact: true },
  ecbu: { label: 'ECBU', group: 'Gestes', dur: 2, contact: true },
  compression: { label: 'Compression / pansement compressif', group: 'Gestes', dur: 2, contact: true },
  stop_perf: { label: 'Arrêter la perfusion / PCA en cours', group: 'Gestes', dur: 0.3, contact: true },
  cupt: { label: 'Contrôle ultime pré-transfusionnel', group: 'Gestes', dur: 3, contact: true },
  diurese: { label: 'Mettre en place la surveillance de la diurèse', group: 'Gestes', dur: 1 },
  appeler: { label: 'Appeler le médecin (SAED)', group: 'Communiquer', dur: 2 },
  chariot: { label: 'Appeler l’équipe + chariot d’urgence', group: 'Communiquer', dur: 0.5 },
  rassurer: { label: 'Rassurer, informer le patient', group: 'Communiquer', dur: 0.5 },
  attendre: { label: 'Réévaluer dans 5 minutes', group: 'Communiquer', dur: 5 },
  mce: { label: 'Massage cardiaque + DAE', group: 'Urgence', dur: 2, contact: false },
  tracer: { label: 'Transmissions écrites (terminer)', group: 'Communiquer', dur: 1 },
  cetone: { label: 'Cétonémie capillaire', group: 'Mesurer', dur: 1, contact: true },
  allergies: { label: 'Vérifier les allergies dans le dossier', group: 'Hygiène', dur: 0.3 },
};
for (const [k, v] of Object.entries({ ...MEDS, ...MEDS2 })) ACTIONS[k] = { label: v, group: 'Thérapeutiques', dur: 1, contact: true, med: true };
for (const k of ['relever', 'massage_mollet', 'contention', 'massage_uterin', 'tamiser']) Object.assign(ACTIONS[k], { group: 'Gestes', med: false, scoped: true });

// ===== Variantes : chaque scénario de base décliné en centaines de situations =====
const MEDS_ALL = Object.keys({ ...MEDS, ...MEDS2 });
export const DIMS = {
  sex: ['F', 'M'],
  severity: [{ label: 'forme modérée', drift: 0.7, by: 1.25 }, { label: 'forme sévère', drift: 1.5, by: 0.85, worsen: true }],
  context: ['Service de médecine', 'Service de chirurgie', 'Urgences', 'Soins de suite (SSR)', 'EHPAD', 'Service de cardiologie', 'Service de pneumologie', 'Court séjour gériatrique'],
  moment: [{ label: 'de jour' }, { label: 'de nuit', note: 'Vous êtes seul(e) infirmier(e) cette nuit, le médecin de garde est joignable par téléphone.', callDur: 4 }],
  profile: [
    { label: 'sans particularité' },
    { label: 'allergie à la pénicilline', atcd: 'ALLERGIE : pénicillines', check: { act: 'allergies', label: 'Vérification des allergies avant toute administration', pts: 2, before: MEDS_ALL } },
    { label: 'isolement contact (BMR)', atcd: 'Portage de BMR : précautions contact', check: { act: 'gants', label: 'Précautions complémentaires contact (gants, tablier)', pts: 2 } },
    { label: 'famille présente et inquiète', note: 'La fille du patient est dans la chambre, très inquiète.', check: { act: 'rassurer', label: 'Informer et rassurer le patient et sa famille', pts: 1 } },
    { label: 'patient diabétique', atcd: 'Diabète de type 2', check: { act: 'glyc', label: 'Glycémie capillaire (terrain diabétique)', pts: 1 } },
    { label: 'patient sous anticoagulant', atcd: 'Traitement anticoagulant au long cours', driftMul: 1.15 },
    { label: 'patient ne parlant pas français', note: 'Le patient ne parle pas français.', interroger: 'Communication difficile : vous faites appel à un interprète téléphonique. ', check: { act: 'rassurer', label: 'Adapter la communication (interprète, gestes)', pts: 1 } },
    { label: 'patient malentendant', note: 'Le patient est malentendant, appareils auditifs non portés.', interroger: 'Vous remettez ses appareils auditifs et parlez face à lui. ', check: { act: 'rassurer', label: 'Adapter la communication', pts: 1 } },
    { label: 'homonyme dans le service', note: 'Un patient du même nom est hospitalisé dans le service.', check: { act: 'identito', label: 'Vérification rigoureuse de l’identité (homonyme)', pts: 2, crit: true } },
  ],
};
export const VARIANTS_PER_SCENARIO = DIMS.sex.length * DIMS.severity.length * DIMS.context.length * DIMS.moment.length * DIMS.profile.length;
export function variantOf(i) {
  let n = i; const out = {};
  for (const k of ['sex', 'profile', 'moment', 'context', 'severity']) { const a = DIMS[k]; out[k] = a[n % a.length]; n = Math.floor(n / a.length); }
  out.index = i; out.label = `${out.sex === 'F' ? 'femme' : 'homme'} · ${out.severity.label} · ${out.context} · ${out.moment.label} · ${out.profile.label}`;
  return out;
}
// Accord du texte au sexe du patient
const GENDER = [['le patient', 'la patiente'], ['Le patient', 'La patiente'], ['du patient', 'de la patiente'], ['au patient', 'à la patiente'], ['un patient', 'une patiente'],
  ['il', 'elle'], ['Il', 'Elle'], ['assis', 'assise'], ['allongé', 'allongée'], ['hospitalisé', 'hospitalisée'], ['Hospitalisé', 'Hospitalisée'], ['confus', 'confuse'], ['agité', 'agitée'],
  ['somnolent', 'somnolente'], ['retrouvé', 'retrouvée'], ['inquiet', 'inquiète'], ['essoufflé', 'essoufflée'], ['opéré', 'opérée'], ['dialysé', 'dialysée'], ['Admis', 'Admise'], ['admis', 'admise'],
  ['désorienté', 'désorientée'], ['orienté', 'orientée'], ['angoissé', 'angoissée'], ['anxieux', 'anxieuse'], ['alité', 'alitée'], ['asthénique', 'asthénique'], ['habitué', 'habituée'], ['stimulé', 'stimulée'],
  ['installé', 'installée'], ['endormi', 'endormie'], ['réveillé', 'réveillée'], ['calmé', 'calmée'], ['sevré', 'sevrée'], ['malentendant', 'malentendante'], ['diabétique', 'diabétique']];
function genderize(text, to) {
  if (!text || typeof text !== 'string') return text;
  let out = text;
  const pairs = GENDER.map(([m, f]) => (to === 'F' ? [m, f] : [f, m])).sort((a, b) => b[0].length - a[0].length);
  const marks = [];
  for (const [from, dest] of pairs) {
    const re = new RegExp(`(^|[^\\p{L}])${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^\\p{L}])`, 'gu');
    out = out.replace(re, (m0, pre) => { marks.push(dest); return `${pre}\u0000${marks.length - 1}\u0000`; });
  }
  return out.replace(/\u0000(\d+)\u0000/g, (m0, i) => marks[+i]);
}
function applyVariant(base, v) {
  const sc = { ...base, state: { ...base.state }, drift: { ...base.drift }, checklist: base.checklist.map((c) => ({ ...c })), patient: { ...base.patient }, findings: { ...base.findings } };
  const mul = v.severity.drift * (v.profile.driftMul || 1);
  for (const k in sc.drift) sc.drift[k] *= mul;
  sc.checklist.forEach((c) => { if (c.by) c.by = Math.round(c.by * v.severity.by * 10) / 10; });
  if (v.severity.worsen) {
    const s = sc.state;
    if (s.spo2 < 95) s.spo2 -= 3; if (s.pas < 100) s.pas -= 8; if (s.fc > 100) s.fc += 8; if (s.fr > 20) s.fr += 3; if (s.gcs < 15 && s.gcs > 4) s.gcs -= 1;
  }
  const sex = base.sexFixed ? base.patient.sex : v.sex;
  if (sex !== base.patient.sex) {
    sc.patient.sex = sex; sc.patient.motif = genderize(sc.patient.motif, sex); if (base.patient.atcdM && sex === 'M') sc.patient.atcd = base.patient.atcdM;
    sc.title = genderize(base.title, sex); sc.doctorText = genderize(base.doctorText, sex); sc.debrief = genderize(base.debrief, sex);
    for (const k in sc.findings) sc.findings[k] = genderize(sc.findings[k], sex);
  }
  const intro0 = sex !== base.patient.sex ? genderize(base.intro, sex) : base.intro;
  sc.intro = `${v.context}, ${v.moment.label}. ${intro0}${v.moment.note ? ' ' + v.moment.note : ''}${v.profile.note ? ' ' + v.profile.note : ''}`;
  if (v.profile.note && sex !== base.patient.sex) sc.intro = genderize(sc.intro, sex);
  if (v.profile.atcd) sc.patient.atcd = `${sc.patient.atcd}. ${v.profile.atcd}`;
  if (v.profile.interroger) sc.findings.interroger = v.profile.interroger + (sc.findings.interroger || '');
  const ch = v.profile.check;
  if (ch && !sc.checklist.some((c) => [].concat(c.act).includes(ch.act) && !c.after)) sc.checklist.unshift({ ...ch });
  else if (ch && ch.crit) sc.checklist.forEach((c) => { if ([].concat(c.act).includes(ch.act)) Object.assign(c, { crit: true, pts: Math.max(c.pts, ch.pts) }); });
  sc.callDur = v.moment.callDur || 2;
  sc.variant = v;
  return sc;
}
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const NAMES = { F: ['Mme Martin', 'Mme Bernard', 'Mme Dubois', 'Mme Laurent', 'Mme Moreau', 'Mme Petit', 'Mme Garcia', 'Mme Roux', 'Mme Fournier', 'Mme Lambert'], M: ['M. Durand', 'M. Leroy', 'M. Simon', 'M. Michel', 'M. Lefebvre', 'M. Girard', 'M. Bonnet', 'M. Mercier', 'M. Blanc', 'M. Faure'] };
let RNG = Math.random;
const rnd = (a, b) => a + RNG() * (b - a);
const pick = (a) => a[Math.floor(RNG() * a.length)];
const asArr = (x) => (Array.isArray(x) ? x : [x]);

export function listScenarios() { return SCENARIOS; }

export class Sim {
  constructor(scenarioId, mode = 'train', variantIndex = null) {
    RNG = Math.random;
    const base = scenarioId === 'random' ? pick(SCENARIOS) : SCENARIOS.find((s) => s.id === scenarioId);
    const vi = variantIndex ?? Math.floor(Math.random() * VARIANTS_PER_SCENARIO);
    RNG = mulberry(vi * 7919 + base.id.length * 104729);
    const sc = applyVariant(base, variantOf(vi));
    this.variant = sc.variant;
    this.sc = sc; this.mode = mode; this.t = 0; this.log = []; this.feed = []; this.flags = new Set();
    this.measures = []; this.prescribed = new Set(sc.protocol || []); this.penalties = [];
    this.calledOk = false; this.finished = false; this.acr = false; this.firedEvents = new Set();
    this.firstContactDone = false; this.listeners = []; this.rulesDone = new Set();
    const s = { position: 'plat', o2: null, iv: false, eyes: 'open', ...sc.state };
    // variabilité légère
    for (const k of ['fc', 'pas', 'pad', 'fr']) s[k] = Math.round(s[k] * rnd(0.95, 1.05));
    if (s.glyc) s.glyc = +(s.glyc * rnd(0.94, 1.06)).toFixed(2);
    this.s = s;
    this.patient = { ...sc.patient, name: pick(NAMES[sc.patient.sex]), age: Math.round(rnd(...sc.patient.age)) };
    this.say('intro', sc.intro);
  }
  on(fn) { this.listeners.push(fn); }
  emit() { this.listeners.forEach((f) => f(this)); }
  say(kind, text) { this.feed.push({ t: this.t, kind, text }); }
  available() {
    const sc = this.sc; const meds = new Set([...(sc.protocol || []), ...(sc.orders || []), ...(sc.traps || [])]);
    return Object.entries(ACTIONS).filter(([id, a]) => (!a.med && !a.scoped) || meds.has(id)).map(([id, a]) => ({ id, ...a, prescribed: !a.med || this.prescribed.has(id) }));
  }
  // avance le temps (minutes) en appliquant la dérive
  advance(min) {
    if (this.finished || min <= 0) return;
    const steps = Math.max(1, Math.round(min * 4));
    const dt = min / steps;
    const stable = (this.sc.stableWhen || []).length && this.sc.stableWhen.every((f) => this.flags.has(f));
    for (let i = 0; i < steps; i++) {
      this.t += dt;
      if (!stable && !this.acr) for (const [k, v] of Object.entries(this.sc.drift || {})) this.s[k] += v * dt;
      for (const [ri, r] of (this.sc.rules || []).entries()) {
        if (r.if(this.s)) {
          if (r.set && !this.rulesDone.has(ri)) { Object.assign(this.s, r.set); if (r.msg) this.say('event', r.msg); this.rulesDone.add(ri); }
          if (r.d) for (const [k, v] of Object.entries(r.d)) this.s[k] += v * dt;
        }
      }
      for (const [i2, ev] of (this.sc.events || []).entries()) {
        if (this.firedEvents.has(i2) || this.t < ev.at) continue;
        if (ev.unless?.length && ev.unless.every((f) => this.flags.has(f) || this.log.some((l) => l.id === f))) { this.firedEvents.add(i2); continue; }
        this.firedEvents.add(i2);
        if (ev.d) for (const [k, v] of Object.entries(ev.d)) this.s[k] += v;
        if (ev.set) Object.assign(this.s, ev.set);
        if (ev.d && ev.d.gcs > 0 && this.s.gcs > 8) this.s.eyes = 'open';
        if (ev.msg) this.say('event', ev.msg);
        if (ev.acr) this.triggerACR(ev.msg ? null : 'Arrêt cardio-respiratoire !');
      }
      this.clamp();
      this.checkCritical();
    }
  }
  clamp() {
    const s = this.s;
    s.spo2 = Math.min(100, Math.max(40, s.spo2)); s.fr = Math.max(0, s.fr); s.gcs = Math.min(15, Math.max(3, s.gcs));
    s.eva = Math.min(10, Math.max(0, s.eva)); s.glyc = Math.max(0.1, s.glyc); s.fc = Math.max(0, s.fc); s.pas = Math.max(0, s.pas);
    if (s.gcs <= 8) s.eyes = 'closed';
  }
  checkCritical() {
    const s = this.s; if (this.acr) return;
    if (s.spo2 < 68 || s.pas < 52 || s.fr < 4 || s.glyc < 0.18 || s.gcs <= 4) this.triggerACR('Le patient fait un arrêt cardio-respiratoire.');
    else if (this.mode === 'train') {
      const w = [];
      if (s.spo2 < 85) w.push('SpO₂ très basse'); if (s.pas < 75) w.push('hypotension sévère'); if (s.fr < 8) w.push('bradypnée'); if (s.gcs <= 9) w.push('troubles de conscience');
      const key = w.join(',');
      if (key && key !== this._lastWarn) { this.say('warn', '⚠ Attention : ' + w.join(', ') + '. Le patient se dégrade.'); }
      this._lastWarn = key;
    }
  }
  triggerACR(msg) {
    this.acr = true; Object.assign(this.s, { fc: 0, pas: 0, pad: 0, fr: 0, spo2: 40, gcs: 3, eyes: 'closed', skin: 'cyan' });
    if (msg) this.say('event', msg);
    this.say('event', 'Il faut débuter immédiatement le massage cardiaque et appeler l’équipe.');
  }
  vitalsText(kind) {
    const s = this.s; const r = Math.round;
    switch (kind) {
      case 'pa': return this.acr ? 'PA imprenable' : `PA ${r(s.pas)}/${r(s.pad)} mmHg, FC ${r(s.fc)}/min`;
      case 'spo2': return this.acr ? 'Pas de signal' : `SpO₂ ${r(s.spo2)} %, FC ${r(s.fc)}/min`;
      case 'temp': return `Température ${s.t.toFixed(1)} °C`;
      case 'glyc': return `Glycémie capillaire ${s.glyc.toFixed(2)} g/L`;
      case 'eva': return s.gcs < 13 ? 'Le patient ne peut pas s’auto-évaluer' : `EVA ${r(s.eva)}/10`;
      case 'conscience': { const y = s.eyes === 'closed' ? (s.gcs <= 8 ? 1 : 2) : s.gcs >= 14 ? 4 : 3; return `Glasgow ${r(s.gcs)} (Y${y})`; }
      case 'fr': return `FR ${r(s.fr)}/min`;
      default: return '';
    }
  }
  measure(kind, label) { this.measures.push({ t: this.t, kind, text: label }); }
  // exécute une action
  do(id) {
    if (this.finished) return;
    const a = ACTIONS[id]; const sc = this.sc; const s = this.s;
    if (!a) return;
    const out = [];
    const doneBefore = sc.checklist.map((c) => this.itemDone(c));
    let fb = null; // {type: good|bad|info, text}
    // hygiène des mains
    if (a.contact && !this.firstContactDone) {
      this.firstContactDone = true;
      if (!this.log.some((l) => l.id === 'sha')) { this.penalize(1, 'Premier contact avec le patient sans hygiène des mains'); fb = { type: 'bad', text: 'Hygiène des mains oubliée avant le premier contact.' }; }
    }
    // médicament non prescrit
    if (a.med && !this.prescribed.has(id)) {
      this.penalize(2, `${a.label} administré sans prescription`);
      out.push({ type: 'bad', text: 'Aucune prescription pour ce traitement : vous agissez hors de votre champ de compétence.' });
    }
    this.log.push({ id, t: this.t });
    this.advance(id === 'appeler' ? sc.callDur || a.dur : a.dur);
    // ACR : seules certaines actions comptent
    if (this.acr && !['mce', 'chariot', 'appeler', 'tracer'].includes(id)) out.push({ type: 'bad', text: 'Le patient est en arrêt : la priorité est le massage cardiaque.' });
    // résultats
    const F = sc.findings || {};
    switch (id) {
      case 'pa': this.measure('pa', this.vitalsText('pa')); out.push({ type: 'res', text: this.vitalsText('pa') }); break;
      case 'spo2': this.measure('spo2', this.vitalsText('spo2')); out.push({ type: 'res', text: this.vitalsText('spo2') }); break;
      case 'temp': this.measure('temp', this.vitalsText('temp')); out.push({ type: 'res', text: this.vitalsText('temp') }); break;
      case 'glyc': this.measure('glyc', this.vitalsText('glyc')); out.push({ type: 'res', text: this.vitalsText('glyc') }); break;
      case 'cetone': { const c = sc.id === 'acido' ? 'Cétonémie 4,8 mmol/L (très élevée)' : 'Cétonémie 0,1 mmol/L (normale)'; this.measure('cetone', c); out.push({ type: 'res', text: c }); break; }
      case 'allergies': out.push({ type: 'res', text: 'Allergies : ' + (/ALLERGIE[^.]*/.exec(this.patient.atcd)?.[0] || 'aucune allergie connue') + '.' }); break;
      case 'gants': out.push({ type: 'res', text: 'Gants (et tablier) mis.' }); break;
      case 'identito': out.push({ type: 'res', text: `Identité vérifiée : ${this.patient.name}, ${this.patient.age} ans (bracelet concordant).` }); break;
      case 'rassurer': out.push({ type: 'res', text: 'Vous expliquez calmement ce que vous faites.' }); break;
      case 'eva': this.measure('eva', this.vitalsText('eva')); out.push({ type: 'res', text: this.vitalsText('eva') }); break;
      case 'conscience': this.measure('gcs', this.vitalsText('conscience')); out.push({ type: 'res', text: this.vitalsText('conscience') }); break;
      case 'scope': this.s.scope = true; out.push({ type: 'res', text: 'Scope branché : FC, SpO₂, FR et PA affichées en continu.' }); break;
      case 'observer': this.measure('fr', this.vitalsText('fr')); out.push({ type: 'res', text: (this.acr ? 'Aucun mouvement respiratoire. ' : (F.observer || 'Pas d’anomalie visible.') + ' ') + this.vitalsText('fr') }); break;
      case 'interroger': out.push({ type: 'res', text: s.gcs < 11 ? 'Le patient ne répond pas de façon cohérente.' : (F.interroger || 'Le patient n’a pas de plainte particulière.') }); break;
      case 'heure': out.push({ type: 'res', text: F.interroger && sc.id === 'avc' ? 'Heure de début des symptômes notée précisément (il y a 30 min).' : 'Heure notée dans le dossier.' }); break;
      case 'ausculter': case 'examen': case 'pupilles': case 'ecg': case 'bladder':
        out.push({ type: 'res', text: F[id] || 'Examen sans particularité.' }); this.measure(id, (ACTIONS[id].label) + ' : ' + (F[id] || 'normal')); break;
      case 'vvp': s.iv = true; out.push({ type: 'res', text: 'Voie veineuse périphérique posée (18 G).' }); break;
      case 'appeler': this.callDoctor(out); break;
      case 'chariot': out.push({ type: 'res', text: 'L’équipe arrive avec le chariot d’urgence et le défibrillateur.' }); break;
      case 'mce': if (this.acr) { out.push({ type: 'res', text: 'Massage cardiaque débuté, DAE posé. L’équipe de réanimation prend le relais.' }); } else { this.penalize(3, 'Massage cardiaque chez un patient non en arrêt'); out.push({ type: 'bad', text: 'Le patient n’est pas en arrêt cardiaque !' }); } break;
      case 'diurese': s.sonde = s.sonde || false; out.push({ type: 'res', text: 'Surveillance de la diurèse mise en place.' }); break;
      case 'tracer': out.push({ type: 'res', text: 'Transmissions réalisées.' }); break;
      case 'attendre': out.push({ type: 'res', text: '5 minutes passent…' }); break;
    }
    // effets
    const eff = sc.effects?.[id];
    if (eff && !this.acr && (!eff.cond || eff.cond(s))) {
      for (const [k, v] of Object.entries(eff.d || {})) s[k] += v;
      Object.assign(s, eff.set || {});
      if (eff.flag) this.flags.add(eff.flag);
      if (eff.msg) out.push({ type: 'res', text: eff.msg });
    } else if (!eff) {
      if (id === 'o2_lun') { s.o2 = 'lunettes'; s.spo2 += 2; this.flags.add('o2'); }
      if (id === 'o2_mhc') { s.o2 = 'masque'; s.spo2 += 4; this.flags.add('o2'); }
      if (id.startsWith('pos_')) s.position = { pos_demi: 'demi', pos_assis: 'assis', pos_plat: 'plat', pos_trend: 'plat', pos_pls: 'plat' }[id];
    }
    if (id === 'o2_lun' || id === 'o2_mhc') out.push({ type: 'res', text: `Oxygène posé (${id === 'o2_lun' ? 'lunettes' : 'masque haute concentration'}).` });
    if (id === 'stop_perf' && !eff) out.push({ type: 'res', text: 'Rien à arrêter.' });
    this.flags.add(id);
    this.clamp();
    // dangerosité
    const h = sc.harmful?.[id];
    if (h) {
      const isFn = typeof h === 'object';
      if (!isFn || h.when(s, this.log.slice(0, -1))) { const txt = isFn ? h.text : h; this.penalize(3, txt); out.push({ type: 'bad', text: txt }); }
    }
    // feedback pédagogique (mode entraînement)
    if (this.mode === 'train') {
      const item = sc.checklist.find((c, i) => !doneBefore[i] && this.itemDone(c));
      if (fb) out.push(fb);
      if (!out.some((o) => o.type === 'bad')) {
        if (item) out.push({ type: 'good', text: '✓ ' + item.label });
        else if (!['tracer', 'attendre'].includes(id) && !sc.checklist.some((c) => asArr(c.act).includes(id))) out.push({ type: 'info', text: 'Action sans intérêt majeur dans cette situation.' });
      }
    }
    for (const o of out) this.say(o.type, o.text);
    this.clamp(); this.checkCritical();
    if (id === 'tracer') this.finish();
    this.emit();
    return out;
  }
  callDoctor(out) {
    const needs = this.sc.callNeeds || [];
    const done = (k) => this.log.some((l) => l.id === k || (k === 'spo2' && l.id === 'scope') || (k === 'pa' && l.id === 'scope') || (k === 'fr' && (l.id === 'scope' || l.id === 'observer')));
    const missing = needs.filter((k) => !done(k));
    const labels = { glyc: 'la glycémie', pa: 'la pression artérielle', spo2: 'la saturation', fr: 'la fréquence respiratoire', temp: 'la température', ecg: 'l’ECG', bladder: 'le bladder scan', conscience: 'l’état de conscience', heure: 'l’heure de début des symptômes' };
    if (missing.length) {
      this.penalize(1, 'Appel du médecin incomplet (SAED) : il manquait ' + missing.map((m) => labels[m] || m).join(', '));
      out.push({ type: this.mode === 'train' ? 'bad' : 'res', text: `Le médecin demande : « Et ${missing.map((m) => labels[m] || m).join(', ')} ? » Il vient voir le patient.` });
    }
    this.calledOk = !missing.length;
    (this.sc.orders || []).forEach((o) => this.prescribed.add(o));
    out.push({ type: 'res', text: this.sc.doctorText || 'Le médecin arrive.' });
  }
  penalize(pts, reason) { this.penalties.push({ pts, reason, t: this.t }); }
  firstTime(acts, from = 0) { const l = this.log.find((x) => asArr(acts).includes(x.id) && x.t >= from); return l ? l.t : null; }
  itemDone(c) { return this.evalItem(c).done; }
  evalItem(c) {
    const acts = asArr(c.act);
    let entries = this.log.filter((l) => acts.includes(l.id));
    if (c.after) {
      const ref = this.firstTime(c.after.act);
      if (ref == null) return { done: false, score: 0, note: 'non réalisé' };
      entries = entries.filter((l) => l.t >= ref + c.after.gap - 0.01 && this.log.indexOf(l) > this.log.findIndex((x) => asArr(c.after.act).includes(x.id)));
    }
    if (!entries.length) return { done: false, score: 0, note: 'oublié' };
    const t = entries[0].t; let score = c.pts; let note = `fait à ${fmtMin(t)}`;
    if (c.before) {
      const ref = this.firstTime(c.before);
      if (ref != null && ref < t) { score = c.pts * 0.25; note += ' — mais trop tard (après ' + asArr(c.before).map((b) => ACTIONS[b]?.label.toLowerCase()).join(' / ') + ')'; }
    }
    if (c.by && t > c.by) { score *= 0.5; note += ` — en retard (attendu avant ${c.by} min)`; }
    return { done: true, score, note, t };
  }
  hint() {
    const missing = this.sc.checklist.filter((c) => !this.itemDone(c));
    const next = missing.find((c) => c.crit) || missing[0];
    return next ? 'Pensez à : ' + next.label.toLowerCase() + '.' : 'Tout l’essentiel a été fait : terminez par les transmissions.';
  }
  missingList() { return this.sc.checklist.filter((c) => !this.itemDone(c)); }
  finish() {
    if (this.finished) return this.result;
    this.finished = true;
    const items = this.sc.checklist.map((c) => ({ ...c, ...this.evalItem(c) }));
    const total = items.reduce((a, c) => a + c.pts, 0);
    const got = items.reduce((a, c) => a + c.score, 0);
    const pen = this.penalties.reduce((a, p) => a + p.pts, 0);
    let note = (got / total) * 20 - pen;
    const missedCrit = items.filter((c) => c.crit && !c.done);
    if (missedCrit.length) note = Math.min(note, 12 - 2 * (missedCrit.length - 1));
    if (this.acr) note = Math.min(note, 5);
    note = Math.max(0, Math.min(20, note));
    this.result = { note: Math.round(note * 2) / 2, items, penalties: this.penalties, acr: this.acr, time: this.t, missedCrit, debrief: this.sc.debrief };
    this.emit();
    return this.result;
  }
}

export function fmtMin(m) { const mm = Math.floor(m); const ss = Math.round((m - mm) * 60); return `${mm}:${String(ss === 60 ? 59 : ss).padStart(2, '0')}`; }
