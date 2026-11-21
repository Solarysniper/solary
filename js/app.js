// Révision IDE — application principale (vanilla JS, aucune boucle d'animation permanente)
import { db, uid } from './db.js';
import { md, esc } from './md.js';
import { THEMES, themeName } from './content/themes.js';
import { FICHES } from './content/fiches.js';
import { DRUGS } from './content/drugs.js';
import { NORMS, VOCAB } from './content/norms.js';
import { getTopics, searchTopics, matchTopic, norm } from './content/topics.js';
import { staticPool, buildSet, calcQuestion, prepare, checkNum, fmtNum, shuffle, CALC_TYPES } from './gen.js';
import { review, isDue, nextLabel } from './srs.js';
import { summarize, makeCards, makeQuiz, cleanText } from './summarize.js';
import { listScenarios, ACTIONS, VARIANTS_PER_SCENARIO, variantOf, fmtMin } from './sim/engine.js';
import { localLookup, wikiLookup } from './dict.js';

const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const LS = { get: (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
const settings = () => ({ chronoQuizTrain: false, chronoQuizEval: true, secsPerQ: 45, chronoSimTrain: false, chronoSimEval: true, evalCount: 20, ...LS.get('settings', {}) });
const saveSettings = (p) => LS.set('settings', { ...settings(), ...p });
let cleanup = []; // fonctions à appeler en quittant une vue (timers, 3D)
const onLeave = (fn) => cleanup.push(fn);

// ---------- Icônes (traits fins) ----------
const I = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><circle cx="12" cy="17.2" r=".6"/>',
  patient: '<circle cx="12" cy="7" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/><path d="M12 13v4M10 15h4"/>',
  fiche: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7M9 8h3"/>',
  cours: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h6"/>',
  cards: '<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
  dico: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  stats: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>', close: '<path d="M18 6L6 18M6 6l12 12"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="M5 12l5 5L20 7"/>', bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
  play: '<path d="M7 4l13 8-13 8z"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>', sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
};
const icon = (n, s = 20) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${I[n]}</svg>`;

// ---------- Thème ----------
function applyTheme() {
  const t = LS.get('theme', 'dark');
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  $('meta[name=theme-color]').content = dark ? '#0e1013' : '#f6f6f3';
}
const isDark = () => document.documentElement.dataset.theme === 'dark';

// ---------- Navigation ----------
const NAV = [['/', 'home', 'Accueil'], ['/quiz', 'quiz', 'QCM'], ['/patients', 'patient', 'Patients'], ['/fiches', 'fiche', 'Fiches'], ['/cours', 'cours', 'Cours'], ['/cartes', 'cards', 'Cartes'], ['/dico', 'dico', 'Dico'], ['/stats', 'stats', 'Stats'], ['/reglages', 'settings', 'Réglages']];
function nav(route) {
  const base = '/' + (route.split('/')[1] || '');
  $('#nav').innerHTML = `<div class="brand"><span class="logo">${icon('patient', 18)}</span><b>Révision IDE</b></div>` + NAV.map(([r, ic, l], i) => `${i === 5 ? '<div class="nav-sep">Outils</div>' : ''}<a href="#${r}" class="${base === r ? 'on' : ''} ${i > 4 ? 'more' : ''}">${icon(ic, 21)}<span>${l}</span></a>`).join('');
}
const go = (r) => { location.hash = '#' + r; };

const ROUTES = [];
const route = (re, fn) => ROUTES.push([re, fn]);
async function router() {
  cleanup.forEach((f) => { try { f(); } catch {} }); cleanup = [];
  const r = decodeURIComponent(location.hash.slice(1) || '/');
  nav(r);
  document.body.classList.toggle('immersive', r.startsWith('/sim') || r.startsWith('/quiz/run'));
  for (const [re, fn] of ROUTES) { const m = r.match(re); if (m) { app.scrollTop = 0; window.scrollTo(0, 0); await fn(...m.slice(1)); return; } }
  go('/');
}
window.addEventListener('hashchange', router);

// ---------- Helpers UI ----------
const page = (title, body, { back, actions = '', sub = '' } = {}) => `<header class="top">${back ? `<a class="iconbtn back" href="#${back}" aria-label="Retour">${icon('back')}<span>Retour</span></a>` : ''}<div class="grow"></div>${actions}</header><div class="content"><div class="title"><h1>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${body}</div>`;
const seg = (name, opts, val) => `<div class="seg" data-seg="${name}">${opts.map(([v, l]) => `<button data-v="${v}" class="${String(v) === String(val) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
const toggle = (name, on, label, sub = '') => `<label class="row toggle"><div><div>${label}</div>${sub ? `<small>${sub}</small>` : ''}</div><input type="checkbox" data-tg="${name}" ${on ? 'checked' : ''}><span class="sw"></span></label>`;
function bindSeg(root, cb) { root.querySelectorAll('[data-seg]').forEach((s) => s.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; s.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); cb(s.dataset.seg, b.dataset.v); })); }
function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }
function sheet(title, html, onBind) {
  const el = document.createElement('div'); el.className = 'sheet-wrap';
  el.innerHTML = `<div class="sheet"><div class="sheet-h"><h3>${esc(title)}</h3><button class="iconbtn" data-close>${icon('close')}</button></div><div class="sheet-b">${html}</div></div>`;
  el.addEventListener('click', (e) => { if (e.target === el || e.target.closest('[data-close]')) el.remove(); });
  document.body.appendChild(el); onBind?.(el); return el;
}
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (t) => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const noteClass = (n) => (n >= 14 ? 'good' : n >= 10 ? 'mid' : 'bad');

// ---------- Stats ----------
async function recordAnswer(q, ok) {
  const st = (await db.kv('stats')) || { themes: {}, days: {}, n: 0, ok: 0 };
  const th = q.theme || 'autre'; st.themes[th] = st.themes[th] || { n: 0, ok: 0 }; st.themes[th].n++; if (ok) st.themes[th].ok++;
  st.days[today()] = (st.days[today()] || 0) + 1; st.n++; if (ok) st.ok++;
  await db.kv('stats', st);
  let mis = (await db.kv('mistakes')) || [];
  if (!ok && !mis.some((m) => m.id === q.id)) mis.unshift(q);
  if (ok) mis = mis.filter((m) => m.id !== q.id);
  await db.kv('mistakes', mis.slice(0, 400));
}
function streak(days) { let n = 0; const d = new Date(); for (;;) { const k = d.toISOString().slice(0, 10); if (days[k]) { n++; d.setDate(d.getDate() - 1); } else if (n === 0 && k === today()) { d.setDate(d.getDate() - 1); } else break; } return n; }

// ---------- Contenu dérivé ----------
let _fiches;
function allFiches() {
  if (_fiches) return _fiches;
  const f = FICHES.map((x) => ({ ...x, src: 'Fiche' }));
  for (const d of DRUGS) {
    const short = d[0].split(' (')[0];
    f.push({ id: 'drug-' + norm(short).replace(/\W+/g, '-'), theme: 'pharma', title: d[0], src: 'Médicament', drug: d[0], cls: d[1], body: `**Classe** : ${d[1]}\n\n**Indication** : ${d[2]}\n\n## Effets indésirables\n${d[3].map((x) => '- ' + x).join('\n')}\n\n## Surveillance infirmière\n- ${d[4]}${d[5] ? `\n\n## Antidote\n- ${d[5]}` : ''}` });
  }
  for (const sc of listScenarios()) {
    f.push({ id: 'sit-' + sc.id, theme: sc.theme, title: 'Situation : ' + sc.title, src: 'Situation', body: `${sc.intro}\n\n## Actions attendues\n${sc.checklist.map((c) => `- ${c.crit ? '**' + c.label + '**' : c.label}${c.by ? ` (avant ${c.by} min)` : ''}`).join('\n')}\n\n## À retenir\n${sc.debrief}\n\n## Pièges\n${Object.entries(sc.harmful || {}).map(([k, v]) => `- ${typeof v === 'string' ? v : v.text}`).filter((x) => x.length > 3).join('\n') || '- —'}` });
  }
  f.push({ id: 'normes', theme: 'bio', title: 'Tableau des normes biologiques et cliniques', src: 'Tableau', body: '| Paramètre | Normale | Bas | Haut |\n|---|---|---|---|\n' + NORMS.map((n) => `| ${n[0]} | ${n[1]} – ${n[2]} ${n[3]} | ${n[4] || '—'} | ${n[5]} |`).join('\n') });
  f.push({ id: 'lexique', theme: 'vocab', title: 'Lexique médical', src: 'Tableau', body: VOCAB.map(([t, d]) => `- **${t}** : ${d}`).join('\n') });
  return (_fiches = f);
}
const scenarioMatches = (topic, sc) => !topic || (topic.themeOnly ? sc.theme === topic.id.slice(3) : sc.theme === topic.theme && topic.kind === 'Thème') || matchTopic(topic, { title: sc.title, body: sc.intro + ' ' + sc.debrief + ' ' + sc.patient.motif + ' ' + sc.checklist.map((c) => c.label).join(' ') });

// ---------- Recherche de catégorie (composant) ----------
function topicPicker(container, onPick, placeholder = 'Rechercher une catégorie : diabète, AVC, morphine, kaliémie…') {
  container.innerHTML = `<div class="search"><span>${icon('dico', 18)}</span><input type="search" placeholder="${placeholder}" autocomplete="off"></div><div class="chips themes">${THEMES.map((t) => `<button class="chip" data-t="th:${t.id}">${esc(t.name)}</button>`).join('')}</div><div class="results"></div>`;
  const input = $('input', container), res = $('.results', container);
  const show = () => {
    const q = input.value.trim();
    if (!q) { res.innerHTML = ''; return; }
    const list = searchTopics(q, 40);
    res.innerHTML = list.length ? list.map((t) => `<button class="item" data-t="${t.id}"><div><b>${esc(t.name)}</b><small>${t.kind} · ${esc(themeName(t.theme))}</small></div></button>`).join('') : '<p class="muted">Aucune catégorie. Essayez un autre mot.</p>';
  };
  input.addEventListener('input', show);
  container.addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (b) onPick(getTopics().find((t) => t.id === b.dataset.t)); });
}

// =====================================================================
// ACCUEIL
// =====================================================================
route(/^\/$/, async () => {
  const st = (await db.kv('stats')) || { days: {}, n: 0, ok: 0, themes: {} };
  const cards = await db.all('cards'); const due = cards.filter(isDue).length;
  const hist = (await db.all('history')).sort((a, b) => b.date - a.date).slice(0, 4);
  const h = new Date().getHours();
  const nTopics = getTopics().length; const nSit = listScenarios().length * VARIANTS_PER_SCENARIO;
  const dateTxt = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  app.innerHTML = page(h < 18 ? 'Bonjour' : 'Bonsoir', `
    <div id="gsearch"></div>
    <div class="grid stats3">
      <div class="stat"><b>${streak(st.days)}</b><small>jours d’affilée</small></div>
      <div class="stat"><b>${st.n ? Math.round((st.ok / st.n) * 100) : 0}%</b><small>réussite (${st.n} rép.)</small></div>
      <div class="stat"><b>${due}</b><small>cartes à revoir</small></div>
    </div>
    
    <div class="grid tiles">
      <a class="tile" href="#/patients"><span class="ico c-rose">${icon('patient', 22)}</span><b>Patients 3D</b><small>${nSit.toLocaleString('fr-FR')} situations · 30 patients réalistes</small></a>
      <a class="tile" href="#/quiz"><span class="ico c-teal">${icon('quiz', 22)}</span><b>QCM</b><small>Entraînement ou évaluation notée</small></a>
      <a class="tile" href="#/fiches"><span class="ico c-blue">${icon('fiche', 22)}</span><b>Fiches</b><small>${allFiches().length} fiches de révision</small></a>
      <a class="tile" href="#/cartes"><span class="ico c-violet">${icon('cards', 22)}</span><b>Cartes mémoire</b><small>Répétition espacée</small></a>
      <a class="tile" href="#/cours"><span class="ico c-amber">${icon('upload', 22)}</span><b>Mes cours</b><small>Importer, résumer, s’entraîner</small></a>
      <a class="tile" href="#/dico"><span class="ico c-green">${icon('dico', 22)}</span><b>Dictionnaire</b><small>Lexique + Wikipédia</small></a>
    </div>
    <div class="row-btns">
      <button class="btn tint" data-q="rand">${icon('play', 16)} Patient au hasard</button>
      <button class="btn tint" data-q="calc">${icon('play', 16)} 10 calculs de doses</button>
      <button class="btn tint" data-q="mist">${icon('play', 16)} Revoir mes erreurs</button>
    </div>
    ${hist.length ? `<h2>Dernières évaluations</h2><div class="list">${hist.map(histRow).join('')}</div>` : ''}
    <p class="muted small center foot">${nTopics} catégories · ${staticPool().length} questions + calculs infinis · ${allFiches().length} fiches</p>`, { sub: dateTxt.charAt(0).toUpperCase() + dateTxt.slice(1) });
  topicPicker($('#gsearch'), (t) => go('/cat/' + t.id), 'Rechercher : diabète, AVC, héparine, kaliémie, dyspnée…');
  app.addEventListener('click', onHomeClick);
  onLeave(() => app.removeEventListener('click', onHomeClick));
  function onHomeClick(e) {
    const b = e.target.closest('[data-q]'); if (!b) return;
    if (b.dataset.q === 'calc') startQuiz({ mode: 'train', source: 'calc', count: 10 });
    if (b.dataset.q === 'mist') startQuiz({ mode: 'train', source: 'mistakes', count: 20 });
    if (b.dataset.q === 'rand') { const all = listScenarios(); go(`/sim/${all[Math.floor(Math.random() * all.length)].id}/train/${randVariant()}`); }
  }
});
const histRow = (h) => `<div class="item"><div><b>${esc(h.title)}</b><small>${h.type === 'sim' ? 'Patient' : 'QCM'} · ${h.mode === 'eval' ? 'Évaluation' : 'Entraînement'} · ${fmtDate(h.date)}</small></div><span class="note ${noteClass(h.note)}">${String(h.note).replace('.', ',')}/20</span></div>`;

// =====================================================================
// CATÉGORIE (hub)
// =====================================================================
route(/^\/cat\/(.+)$/, async (id) => {
  const t = getTopics().find((x) => x.id === id); if (!t) return go('/');
  const filt = (q) => matchTopic(t, q);
  const nq = staticPool().filter(filt).length;
  const fiches = allFiches().filter((f) => matchTopic(t, f));
  const scs = listScenarios().filter((sc) => scenarioMatches(t, sc));
  const defs = localLookup(t.name).slice(0, 2);
  app.innerHTML = page(t.name, `
    <p class="muted">${t.kind} · ${esc(themeName(t.theme))}</p>
    ${defs.map((d) => `<div class="card"><small class="muted">${d.src}</small><p>${esc(d.text)}</p></div>`).join('')}
    <h2>QCM <span class="muted">${t.gen ? 'génération infinie' : nq + ' questions'}</span></h2>
    <div class="row-btns"><button class="btn primary" data-go="train">${icon('play', 16)} S’entraîner</button><button class="btn" data-go="eval">${icon('clock', 16)} Évaluation notée</button></div>
    <h2>Patients <span class="muted">${scs.length ? (scs.length * VARIANTS_PER_SCENARIO).toLocaleString('fr-FR') + ' situations' : 'aucune situation dédiée'}</span></h2>
    <div class="list">${scs.map((sc) => `<a class="item" href="#/patients/${sc.id}"><div><b>${esc(sc.title)}</b><small>${VARIANTS_PER_SCENARIO} variantes · ${esc(themeName(sc.theme))}</small></div>${icon('back', 16).replace('M15 18l-6-6 6-6', 'M9 6l6 6-6 6')}</a>`).join('') || '<p class="muted">Utilisez « Patient au hasard » ou un autre thème.</p>'}</div>
    <h2>Fiches <span class="muted">${fiches.length}</span></h2>
    <div class="list">${fiches.slice(0, 40).map(ficheRow).join('') || '<p class="muted">Aucune fiche.</p>'}</div>`, { back: '/' });
  app.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => startQuiz({ mode: b.dataset.go, source: 'topic', topic: t.id, count: b.dataset.go === 'eval' ? settings().evalCount : 15 })));
});

// =====================================================================
// QCM — configuration
// =====================================================================
route(/^\/quiz$/, async () => {
  const s = settings();
  const docs = await db.all('docs');
  const cfg = { mode: LS.get('qmode', 'train'), source: 'all', topic: null, count: 20, doc: null };
  const render = () => {
    const chronoOn = cfg.mode === 'eval' ? s.chronoQuizEval : s.chronoQuizTrain;
    app.innerHTML = page('QCM', `
      ${seg('mode', [['train', 'Entraînement'], ['eval', 'Évaluation notée']], cfg.mode)}
      <p class="muted small">${cfg.mode === 'train' ? 'Correction et explication après chaque question.' : 'Aucune correction pendant l’épreuve, note sur 20 et correction détaillée à la fin.'}</p>
      <div class="card">
        ${toggle('chrono', chronoOn, 'Chronomètre', `${s.secsPerQ} s par question`)}
        <div class="row"><span>Durée par question</span>${seg('secs', [[20, '20 s'], [30, '30 s'], [45, '45 s'], [60, '1 min'], [90, '1 min 30']], s.secsPerQ)}</div>
        <div class="row"><span>Nombre de questions</span>${seg('count', [[10, '10'], [20, '20'], [40, '40'], [60, '60']], cfg.count)}</div>
      </div>
      <h2>Sujet</h2>
      ${seg('source', [['all', 'Tout'], ['topic', 'Catégorie'], ['calc', 'Calculs'], ['mistakes', 'Mes erreurs'], ['docs', 'Mes cours']], cfg.source)}
      <div id="srcbox"></div>
      <button class="btn primary big" id="start">${icon('play', 18)} Commencer</button>`);
    bindSeg(app, (k, v) => {
      if (k === 'mode') { cfg.mode = v; LS.set('qmode', v); render(); }
      if (k === 'secs') { saveSettings({ secsPerQ: +v }); s.secsPerQ = +v; render(); }
      if (k === 'count') cfg.count = +v;
      if (k === 'source') { cfg.source = v; cfg.topic = null; renderSrc(); }
    });
    $('[data-tg=chrono]').addEventListener('change', (e) => { saveSettings(cfg.mode === 'eval' ? { chronoQuizEval: e.target.checked } : { chronoQuizTrain: e.target.checked }); Object.assign(s, settings()); });
    $('#start').addEventListener('click', () => {
      if (cfg.source === 'topic' && !cfg.topic) return toast('Choisissez une catégorie');
      if (cfg.source === 'docs' && !cfg.doc) return toast('Choisissez un cours');
      startQuiz(cfg);
    });
    renderSrc();
  };
  const renderSrc = () => {
    const box = $('#srcbox');
    if (cfg.source === 'topic') {
      if (cfg.topic) { const t = getTopics().find((x) => x.id === cfg.topic); box.innerHTML = `<div class="card picked"><div><b>${esc(t.name)}</b><small class="muted"> ${t.kind}</small></div><button class="btn small" id="chg">Changer</button></div>`; $('#chg').onclick = () => { cfg.topic = null; renderSrc(); }; }
      else topicPicker(box, (t) => { cfg.topic = t.id; renderSrc(); });
    } else if (cfg.source === 'calc') {
      box.innerHTML = `<div class="chips">${[['mix', 'Mélange'], ...CALC_TYPES.map((c) => [c, getTopics().find((t) => t.gen === c)?.name || c])].map(([v, l]) => `<button class="chip ${cfg.calc === v || (!cfg.calc && v === 'mix') ? 'on' : ''}" data-c="${v}">${esc(l)}</button>`).join('')}</div>`;
      box.onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) { cfg.calc = b.dataset.c; renderSrc(); } };
    } else if (cfg.source === 'docs') {
      box.innerHTML = docs.length ? `<div class="list">${docs.map((d) => `<button class="item ${cfg.doc === d.id ? 'on' : ''}" data-d="${d.id}"><div><b>${esc(d.title)}</b><small>${(d.quiz || []).length + (d.aiQuiz || []).length} questions</small></div></button>`).join('')}</div>` : '<p class="muted">Importez d’abord un cours dans l’onglet Cours.</p>';
      box.onclick = (e) => { const b = e.target.closest('[data-d]'); if (b) { cfg.doc = b.dataset.d; renderSrc(); } };
    } else box.innerHTML = '';
  };
  render();
});

// Démarre une série
let RUN = null;
async function startQuiz(cfg) {
  const s = settings(); let qs = [];
  const count = cfg.count || 20;
  if (cfg.source === 'calc') qs = Array.from({ length: count }, () => calcQuestion(cfg.calc && cfg.calc !== 'mix' ? cfg.calc : null)).map(prepare);
  else if (cfg.source === 'mistakes') { qs = shuffle((await db.kv('mistakes')) || []).slice(0, count).map(prepare); if (!qs.length) return toast('Aucune erreur enregistrée, bravo !'); }
  else if (cfg.source === 'docs') { const d = await db.get('docs', cfg.doc); qs = shuffle([...(d.aiQuiz || []), ...(d.quiz || [])]).slice(0, count).map(prepare); if (!qs.length) return toast('Ce cours ne contient pas assez de matière pour un QCM'); }
  else if (cfg.source === 'topic') {
    const t = getTopics().find((x) => x.id === cfg.topic);
    if (t.gen) qs = Array.from({ length: count }, () => prepare(calcQuestion(t.gen)));
    else { qs = buildSet({ filter: (q) => matchTopic(t, q), count, calc: t.theme === 'calc' ? 'mix' : 'none' }); if (!qs.length) return toast('Pas encore de questions pour cette catégorie'); }
  } else qs = buildSet({ count, calc: 'mix', filter: () => true }).map((q, i) => (i % 6 === 5 ? prepare(calcQuestion()) : q));
  const chrono = cfg.mode === 'eval' ? s.chronoQuizEval : s.chronoQuizTrain;
  RUN = { qs, i: 0, answers: [], mode: cfg.mode, chrono, secs: s.secsPerQ, title: cfg.topic ? getTopics().find((x) => x.id === cfg.topic)?.name : { calc: 'Calculs de doses', mistakes: 'Mes erreurs', docs: 'Mon cours', all: 'QCM mélangés' }[cfg.source] || 'QCM', started: Date.now() };
  go('/quiz/run');
}

// =====================================================================
// QCM — déroulé
// =====================================================================
route(/^\/quiz\/run$/, () => {
  if (!RUN) return go('/quiz');
  let timer = null; let left = 0; let answered = false;
  onLeave(() => clearInterval(timer));
  const show = () => {
    clearInterval(timer); answered = false;
    const R = RUN; const q = R.qs[R.i];
    if (!q) return finishQuiz();
    app.innerHTML = `<header class="top"><button class="iconbtn" id="quit">${icon('close')}</button><div class="progress"><i style="width:${(R.i / R.qs.length) * 100}%"></i></div><span class="muted small">${R.i + 1}/${R.qs.length}</span></header>
      <div class="content narrow quiz">
        ${R.chrono ? `<div class="timer"><i id="tbar"></i><span id="tleft"></span></div>` : ''}
        <p class="muted small">${esc(themeName(q.theme))}${R.mode === 'eval' ? ' · Évaluation' : ''}</p>
        <h2 class="q">${esc(q.q)}</h2>
        ${q.kind === 'num' ? `<div class="numin"><input id="num" inputmode="decimal" placeholder="Votre réponse" autocomplete="off"><span>${esc(q.unit || '')}</span></div><button class="btn primary big" id="valid">Valider</button>`
          : `<div class="opts">${q.options.map((o, i) => `<button class="opt" data-i="${i}"><span>${'ABCD'[i]}</span>${esc(o)}</button>`).join('')}</div>`}
        <div id="fb"></div>
      </div>`;
    $('#quit').onclick = () => { if (confirm('Quitter la série ?')) { RUN = null; go('/quiz'); } };
    if (q.kind === 'num') { const inp = $('#num'); inp.focus(); $('#valid').onclick = () => answer(inp.value); inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') answer(inp.value); }); }
    else app.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => answer(+b.dataset.i)));
    if (R.chrono) {
      left = R.secs; const tick = () => { $('#tleft').textContent = left + ' s'; $('#tbar').style.width = (left / R.secs) * 100 + '%'; $('#tbar').classList.toggle('low', left <= 5); };
      tick(); timer = setInterval(() => { if (document.hidden) return; left--; tick(); if (left <= 0) { clearInterval(timer); answer(null, true); } }, 1000);
    }
  };
  const answer = (val, timeout = false) => {
    if (answered) return; answered = true; clearInterval(timer);
    const R = RUN; const q = R.qs[R.i];
    const ok = !timeout && (q.kind === 'num' ? checkNum(q, val) : val === q.answer);
    R.answers.push({ q, val, ok, timeout });
    recordAnswer(q, ok);
    if (R.mode === 'eval') { R.i++; return show(); }
    // entraînement : correction immédiate
    if (q.kind === 'qcm') app.querySelectorAll('.opt').forEach((b) => { const i = +b.dataset.i; b.disabled = true; if (i === q.answer) b.classList.add('ok'); else if (i === val) b.classList.add('ko'); });
    else { $('#num').disabled = true; $('#valid').remove(); }
    $('#fb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'ko'}"><b>${timeout ? 'Temps écoulé' : ok ? 'Bonne réponse' : 'Mauvaise réponse'}</b>${q.kind === 'num' ? `<p>Réponse attendue : <b>${fmtNum(q.value)} ${esc(q.unit || '')}</b></p>` : ''}<p>${esc(q.explain || '')}</p></div><button class="btn primary big" id="next">Suivant</button>`;
    $('#next').onclick = () => { R.i++; show(); }; $('#next').focus();
  };
  show();
});
async function finishQuiz() {
  const R = RUN; const n = R.answers.length; const ok = R.answers.filter((a) => a.ok).length;
  const note = Math.round((ok / n) * 20 * 2) / 2;
  await db.put('history', { id: uid(), type: 'quiz', mode: R.mode, title: R.title, note, date: Date.now(), detail: { n, ok } });
  app.innerHTML = page('Résultat', `
    <div class="result"><div class="big-note ${noteClass(note)}">${String(note).replace('.', ',')}<small>/20</small></div><p>${ok} bonne(s) réponse(s) sur ${n} · ${Math.round((Date.now() - R.started) / 60000)} min</p></div>
    <div class="row-btns"><button class="btn primary" id="again">Recommencer</button><a class="btn" href="#/quiz">Autre série</a></div>
    <h2>Correction</h2>
    <div class="list review">${R.answers.map((a, i) => `<details class="rv ${a.ok ? 'ok' : 'ko'}"><summary><span>${a.ok ? icon('check', 16) : icon('close', 16)}</span>${i + 1}. ${esc(a.q.q)}</summary>
      <p>Votre réponse : <b>${a.timeout ? 'temps écoulé' : esc(a.q.kind === 'num' ? (a.val || '—') + ' ' + (a.q.unit || '') : a.q.options[a.val] ?? '—')}</b></p>
      <p>Bonne réponse : <b>${esc(a.q.kind === 'num' ? fmtNum(a.q.value) + ' ' + (a.q.unit || '') : a.q.options[a.q.answer])}</b></p><p class="muted">${esc(a.q.explain || '')}</p></details>`).join('')}</div>`, { back: '/quiz' });
  $('#again').onclick = () => { RUN = { ...R, i: 0, answers: [], qs: shuffle(R.qs.map((q) => (q.gen ? prepare(calcQuestion(q.gen)) : prepare({ ...q, options: [q.options[q.answer], ...q.options.filter((_, i) => i !== q.answer)], answer: 0 })))), started: Date.now() }; go('/quiz/run'); };
}

// =====================================================================
// PATIENTS — choix
// =====================================================================
route(/^\/patients$/, () => {
  const s = settings(); let mode = LS.get('smode', 'train'); let topic = null; let sex = LS.get('ssex', 'all');
  const render = () => {
    const scs = listScenarios().filter((sc) => scenarioMatches(topic, sc) && (sex === 'all' || !sc.sexFixed || sc.patient.sex === sex));
    const chronoOn = mode === 'eval' ? s.chronoSimEval : s.chronoSimTrain;
    app.innerHTML = page('Patients', `
      ${seg('mode', [['train', 'Entraînement'], ['eval', 'Évaluation notée']], mode)}
      <p class="muted small">${mode === 'train' ? 'Chaque action est commentée, l’app vous signale ce que vous oubliez et vous pouvez demander un indice.' : 'Aucune aide. Le patient évolue, les oublis et retards sont notés. Débriefing complet à la fin.'}</p>
      <div class="card">${toggle('chrono', chronoOn, 'Chrono en temps réel', 'Le temps s’écoule et le patient se dégrade si vous tardez')}</div>
      <button class="btn primary big" id="rand">${icon('play', 18)} Situation au hasard</button>
      <h2>Patient</h2>${seg('sex', [['all', 'Aléatoire'], ['F', 'Femmes'], ['M', 'Hommes']], sex)}
      <h2>Catégorie</h2><div id="tp"></div>
      ${topic ? `<div class="card picked"><b>${esc(topic.name)}</b><button class="btn small" id="clr">Toutes</button></div>` : ''}
      <h2>Situations <span class="muted">${scs.length} × ${VARIANTS_PER_SCENARIO} variantes</span></h2>
      <div class="list">${scs.map((sc) => `<a class="item" href="#/patients/${sc.id}"><span class="avatar ${sc.sexFixed ? (sc.patient.sex === 'F' ? 'f' : 'm') : 'x'}">${sc.sexFixed ? (sc.patient.sex === 'F' ? 'F' : 'H') : 'F/H'}</span><div class="grow"><b>${esc(sc.title)}</b><small>${esc(themeName(sc.theme))} · ${sc.sexFixed ? (sc.patient.sex === 'F' ? 'femme' : 'homme') : 'femme ou homme'}, ${sc.patient.age[0]}–${sc.patient.age[1]} ans · niveau ${'●'.repeat(sc.level)}${'○'.repeat(3 - sc.level)}</small></div>${chev}</a>`).join('') || '<p class="muted">Aucune situation pour cette catégorie : essayez le thème parent.</p>'}</div>`);
    bindSeg(app, (k, v) => { if (k === 'mode') { mode = v; LS.set('smode', v); render(); } if (k === 'sex') { sex = v; LS.set('ssex', v); render(); } });
    $('[data-tg=chrono]').addEventListener('change', (e) => { saveSettings(mode === 'eval' ? { chronoSimEval: e.target.checked } : { chronoSimTrain: e.target.checked }); Object.assign(s, settings()); });
    $('#rand').onclick = () => { const pool = scs.length ? scs : listScenarios(); const sc = pool[Math.floor(Math.random() * pool.length)]; go(`/sim/${sc.id}/${mode}/${randVariant(sex)}`); };
    if (!topic) topicPicker($('#tp'), (t) => { topic = t; render(); }); else $('#clr').onclick = () => { topic = null; render(); };
  };
  render();
});
// index de variante aléatoire ; le premier critère de variante est le sexe (pair = femme, impair = homme)
const randVariant = (sex = 'all') => { let i = Math.floor(Math.random() * VARIANTS_PER_SCENARIO); if (sex === 'F' && i % 2) i--; if (sex === 'M' && !(i % 2)) i = Math.min(i + 1, VARIANTS_PER_SCENARIO - 1); return i; };
route(/^\/patients\/([\w-]+)$/, (id) => {
  const sc = listScenarios().find((x) => x.id === id); if (!sc) return go('/patients');
  const mode = LS.get('smode', 'train'); let shown = 40; let filter = '';
  const render = () => {
    const sexF = LS.get('ssex', 'all');
    const all = Array.from({ length: VARIANTS_PER_SCENARIO }, (_, i) => variantOf(i)).filter((v) => (sc.sexFixed ? v.sex === sc.patient.sex : sexF === 'all' || v.sex === sexF) && (!filter || norm(v.label).includes(norm(filter))));
    app.innerHTML = page(sc.title, `
      <p class="muted">${esc(themeName(sc.theme))} · ${mode === 'eval' ? 'Évaluation notée' : 'Entraînement'}</p>
      <p>${esc(sc.intro)}</p>
      <button class="btn primary big" id="go">${icon('play', 18)} Variante au hasard</button>
      <div class="search"><span>${icon('dico', 18)}</span><input type="search" id="vf" placeholder="Filtrer : sévère, nuit, EHPAD, allergie…" value="${esc(filter)}"></div>
      <h2>${all.length} situations</h2>
      <div class="list">${all.slice(0, shown).map((v) => `<a class="item" href="#/sim/${sc.id}/${mode}/${v.index}"><span class="avatar ${v.sex === 'F' || sc.sexFixed && sc.patient.sex === 'F' ? 'f' : 'm'}">${(sc.sexFixed ? sc.patient.sex : v.sex) === 'F' ? 'F' : 'H'}</span><div class="grow"><b>Situation ${v.index + 1}</b><small>${esc(v.label)}</small></div>${chev}</a>`).join('')}</div>
      ${all.length > shown ? '<button class="btn" id="more">Afficher plus</button>' : ''}`, { back: '/patients' });
    $('#go').onclick = () => go(`/sim/${sc.id}/${mode}/${randVariant(sc.sexFixed ? sc.patient.sex : sexF)}`);
    $('#vf').addEventListener('change', (e) => { filter = e.target.value; shown = 40; render(); });
    $('#more')?.addEventListener('click', () => { shown += 60; render(); });
  };
  render();
});

// =====================================================================
// SIMULATION 3D
// =====================================================================
const PICK_ACTIONS = {
  patient: ['identito', 'interroger', 'observer', 'conscience', 'pupilles', 'eva', 'examen', 'heure', 'stimuler', 'rassurer', 'pos_demi', 'pos_assis', 'pos_plat', 'pos_trend', 'pos_pls', 'repos', 'ajeun', 'relever', 'massage_mollet', 'contention', 'mce'],
  monitor: ['scope'], sha: ['sha'], gants: ['gants'], tensio: ['pa'], thermo: ['temp'], gluco: ['glyc', 'cetone'], steth: ['ausculter'], oxy: ['spo2'], ecg: ['ecg'], bladder: ['bladder'],
  kit: ['vvp', 'bilan', 'hemoc', 'ecbu', 'compression', 'cupt', 'diurese'], o2: ['o2_lun', 'o2_mhc'], phone: ['appeler'], chariot: ['chariot', 'mce'], dossier: ['allergies', 'tracer'], iv: ['stop_perf'], pharma: [],
};
route(/^\/sim\/([\w-]+)\/(train|eval)(?:\/(\d+))?$/, async (id, mode, vi) => {
  const s = settings();
  const realtime = mode === 'eval' ? s.chronoSimEval : s.chronoSimTrain;
  app.innerHTML = `<div class="sim"><div class="sim-top"><button class="iconbtn" id="quit">${icon('close')}</button><div class="sim-title"><b id="ptitle"></b><small id="psub"></small></div><div class="grow"></div><span class="badge ${mode}">${mode === 'eval' ? 'Évaluation' : 'Entraînement'}</span><span class="clock ${realtime ? 'live' : ''}" id="clock">${icon('clock', 16)} 0:00</span>${mode === 'train' ? `<button class="iconbtn" id="hint" title="Indice">${icon('bulb')}</button>` : ''}<button class="btn small" id="end">Terminer</button></div>
    <div class="sim-body"><div class="stage" id="stage"><div class="loading">Chargement de la chambre…</div><div class="last" id="last"></div><div class="views" id="views"><button data-v="room">Chambre</button><button data-v="patient">Patient</button><button data-v="scope">Scope</button><button data-v="chariot">Chariot</button></div><div class="hint3d">Touchez un objet ou le patient · glissez pour tourner · pincez pour zoomer</div></div>
    <aside class="panel"><div class="tabs" id="tabs"><button data-tab="actions" class="on">Actions</button><button data-tab="vitals">Relevés</button><button data-tab="dossier">Dossier</button><button data-tab="journal">Journal</button></div><div class="panel-b" id="pb"></div></aside></div></div>`;
  const [{ Sim }, { Room, PICK_LABELS }] = await Promise.all([import('./sim/engine.js'), import('./sim/scene.js')]);
  const sim = new Sim(id, mode, vi != null ? +vi : null);
  let room = null; let tab = 'actions'; let filterTxt = '';
  $('#ptitle').textContent = `${sim.patient.name}, ${sim.patient.age} ans`;
  $('#psub').textContent = sim.sc.title + ' · ' + sim.variant.label;
  try {
    room = new Room($('#stage'), (pick) => openPick(pick), isDark(), settings().anim !== false);
    $('.loading', $('#stage'))?.remove(); room.update(sim.s); room.startMonitor();
    import('./sim/avatar.js').then(({ pickAvatar }) => room.loadPatient(pickAvatar(sim.patient.sex, sim.patient.age, sim.variant.index + sim.sc.id.length * 7))).catch((e) => console.warn('avatar', e));
  } catch (e) { $('.loading', $('#stage')).textContent = '3D indisponible sur cet appareil — utilisez la liste d’actions.'; }
  onLeave(() => { room?.dispose(); clearInterval(clockT); });
  $('#views').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) room?.view(b.dataset.v); });
  const avail = () => sim.available();
  const actBtn = (a) => `<button class="act ${a.med && !a.prescribed ? 'np' : ''}" data-a="${a.id}"><span>${esc(a.label)}</span><small>${a.dur < 1 ? Math.round(a.dur * 60) + ' s' : a.dur + ' min'}${a.med && !a.prescribed ? ' · non prescrit' : ''}</small></button>`;
  const renderPanel = () => {
    const pb = $('#pb');
    if (tab === 'actions') {
      const groups = {}; for (const a of avail()) { if (filterTxt && !norm(a.label).includes(norm(filterTxt))) continue; (groups[a.group] = groups[a.group] || []).push(a); }
      pb.innerHTML = `<div class="search small"><span>${icon('dico', 16)}</span><input type="search" id="af" placeholder="Chercher une action" value="${esc(filterTxt)}"></div>` + Object.entries(groups).map(([g, list]) => `<h4>${g}</h4><div class="acts">${list.map(actBtn).join('')}</div>`).join('');
      $('#af').addEventListener('input', (e) => { filterTxt = e.target.value; const pos = e.target.selectionStart; renderPanel(); const f = $('#af'); f.focus(); f.setSelectionRange(pos, pos); });
    } else if (tab === 'vitals') {
      const v = sim.s; const r = Math.round;
      pb.innerHTML = (v.scope ? `<div class="vitals"><div><small>FC</small><b>${sim.acr ? '—' : r(v.fc)}</b></div><div><small>SpO₂</small><b>${sim.acr ? '—' : r(v.spo2)}%</b></div><div><small>FR</small><b>${r(v.fr)}</b></div><div><small>PA</small><b>${sim.acr ? '—' : r(v.pas) + '/' + r(v.pad)}</b></div></div>` : '<p class="muted small">Scope non branché : les valeurs n’apparaissent qu’après mesure.</p>') +
        `<h4>Mesures réalisées</h4>${sim.measures.length ? sim.measures.slice().reverse().map((m) => `<div class="meas"><span>${fmtMin(m.t)}</span>${esc(m.text)}</div>`).join('') : '<p class="muted small">Aucune mesure.</p>'}`;
    } else if (tab === 'dossier') {
      const p = sim.patient;
      pb.innerHTML = `<div class="dos"><p><b>${esc(p.name)}</b>, ${p.age} ans</p><p><small>Motif</small>${esc(p.motif)}</p><p><small>Antécédents</small>${esc(p.atcd)}</p><p><small>Traitements</small>${esc(p.ttt)}</p><p><small>Situation</small>${esc(sim.sc.intro)}</p>
        <h4>Prescriptions disponibles</h4>${[...sim.prescribed].length ? [...sim.prescribed].map((k) => `<div class="meas">${esc(ACTIONS[k]?.label || k)}</div>`).join('') : '<p class="muted small">Aucune prescription pour l’instant. Appelez le médecin si nécessaire.</p>'}</div>`;
    } else {
      pb.innerHTML = sim.feed.slice().reverse().map((f) => `<div class="feed ${f.kind}"><span>${fmtMin(f.t)}</span>${md(f.text)}</div>`).join('');
    }
  };
  const doAction = (aid) => {
    if (sim.finished) return;
    const out = sim.do(aid) || [];
    const last = out.filter((o) => mode === 'train' || o.type === 'res');
    $('#last').innerHTML = last.map((o) => `<div class="feed ${o.type}">${md(o.text)}</div>`).join('');
    $('#last').classList.add('show'); clearTimeout(doAction.t); doAction.t = setTimeout(() => $('#last')?.classList.remove('show'), 7000);
    room?.update(sim.s); updateClock(); renderPanel();
    if (sim.finished) showResult();
  };
  const openPick = (pick) => {
    if (pick === 'dossier') { tab = 'dossier'; syncTabs(); }
    const av = avail(); let ids = PICK_ACTIONS[pick] || [];
    if (pick === 'pharma' || pick === 'iv') ids = ids.concat(av.filter((a) => a.med).map((a) => a.id));
    const list = av.filter((a) => ids.includes(a.id));
    if (!list.length) return toast(PICK_LABELS[pick] + ' : rien à faire ici');
    sheet(PICK_LABELS[pick] || 'Actions', `<div class="acts">${list.map(actBtn).join('')}</div>`, (el) => el.addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (b) { el.remove(); doAction(b.dataset.a); } }));
  };
  const syncTabs = () => { $('#tabs').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab)); renderPanel(); };
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; syncTabs(); } });
  $('#pb').addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (b) doAction(b.dataset.a); });
  $('#hint')?.addEventListener('click', () => { const m = sim.missingList(); sheet('Ce qui manque encore', `<p>${esc(sim.hint())}</p><ul>${m.map((c) => `<li>${c.crit ? '<b>' + esc(c.label) + '</b>' : esc(c.label)}</li>`).join('')}</ul>`); });
  $('#end').onclick = () => { if (sim.finished || confirm('Terminer la prise en charge et voir la note ?')) { sim.finish(); showResult(); } };
  $('#quit').onclick = () => { if (sim.finished || confirm('Quitter la simulation ?')) go('/patients'); };
  // Chrono
  let lastUpd = 0; let feedN = sim.feed.length;
  const updateClock = () => { const c = $('#clock'); if (c) c.innerHTML = `${icon('clock', 16)} ${fmtMin(sim.t)}`; };
  const clockT = realtime ? setInterval(() => {
    if (document.hidden || sim.finished) return;
    sim.advance(1 / 60); updateClock();
    if (++lastUpd % 3 === 0) { room?.update(sim.s); if (tab !== 'actions') renderPanel(); }
    if (sim.feed.length !== feedN) { feedN = sim.feed.length; const f = sim.feed[sim.feed.length - 1]; if (f && (f.kind === 'event' || f.kind === 'warn')) { $('#last').innerHTML = `<div class="feed ${f.kind}">${md(f.text)}</div>`; $('#last').classList.add('show'); } }
  }, 1000) : null;
  renderPanel();
  $('#last').innerHTML = `<div class="feed intro">${md(sim.sc.intro)}</div>`; $('#last').classList.add('show');
  async function showResult() {
    clearInterval(clockT);
    const r = sim.result;
    await db.put('history', { id: uid(), type: 'sim', mode, title: sim.sc.title, note: r.note, date: Date.now(), detail: { variant: sim.variant.label } });
    sheet(`Note : ${String(r.note).replace('.', ',')}/20`, `
      <div class="result"><div class="big-note ${noteClass(r.note)}">${String(r.note).replace('.', ',')}<small>/20</small></div><p>${r.acr ? '<b class="bad">Le patient a fait un arrêt cardio-respiratoire.</b><br>' : ''}Durée de prise en charge : ${fmtMin(r.time)}</p></div>
      <h4>Grille d’évaluation</h4>
      ${r.items.map((c) => `<div class="crit ${c.done ? (c.score < c.pts ? 'mid' : 'ok') : 'ko'}"><span>${c.done ? icon('check', 16) : icon('close', 16)}</span><div><b>${esc(c.label)}</b>${c.crit ? ' <em>critique</em>' : ''}<small>${esc(c.note)} · ${(Math.round(c.score * 10) / 10).toString().replace('.', ',')}/${c.pts}</small></div></div>`).join('')}
      ${r.penalties.length ? `<h4>Erreurs et pénalités</h4>${r.penalties.map((p) => `<div class="crit ko"><span>−${p.pts}</span><div>${esc(p.reason)}<small>à ${fmtMin(p.t)}</small></div></div>`).join('')}` : ''}
      <h4>À retenir</h4><div class="md">${md(r.debrief)}</div>
      <div class="row-btns"><button class="btn primary" id="replay">Rejouer cette situation</button><button class="btn" id="other">Autre variante</button><a class="btn" href="#/patients">Retour</a></div>`, (el) => {
      $('#replay', el).onclick = () => { el.remove(); router(); };
      $('#other', el).onclick = () => { el.remove(); go(`/sim/${sim.sc.id}/${mode}/${randVariant(LS.get('ssex', 'all'))}`); };
    });
  }
});

// =====================================================================
// FICHES
// =====================================================================
const chev = '<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>';
const ficheRow = (f) => `<a class="item" href="#/fiche/${encodeURIComponent(f.id)}"><div><b>${esc(f.title)}</b><small>${f.src} · ${esc(themeName(f.theme))}</small></div>${chev}</a>`;
route(/^\/fiches$/, async () => {
  const docs = (await db.all('docs')).filter((d) => d.summary || d.aiSummary);
  let topic = null; let q = '';
  const render = () => {
    let list = allFiches().concat(docs.map((d) => ({ id: 'doc:' + d.id, title: d.title, theme: 'doc', src: 'Mon cours', body: d.aiSummary || d.summary })));
    if (topic) list = list.filter((f) => matchTopic(topic, f));
    if (q) list = list.filter((f) => norm(f.title + ' ' + f.body).includes(norm(q)));
    app.innerHTML = page('Fiches', `<div class="search"><span>${icon('dico', 18)}</span><input type="search" id="fq" placeholder="Rechercher dans les fiches" value="${esc(q)}"></div>
      <div class="chips">${THEMES.map((t) => `<button class="chip ${topic?.id === 'th:' + t.id ? 'on' : ''}" data-t="th:${t.id}">${esc(t.name)}</button>`).join('')}</div>
      <h2>${list.length} fiches</h2><div class="list">${list.slice(0, 150).map(ficheRow).join('')}</div>`);
    $('#fq').addEventListener('change', (e) => { q = e.target.value; render(); });
    app.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => { topic = topic?.id === b.dataset.t ? null : getTopics().find((t) => t.id === b.dataset.t); render(); }));
  };
  render();
});
route(/^\/fiche\/(.+)$/, async (id) => {
  let f = allFiches().find((x) => x.id === id);
  if (!f && id.startsWith('doc:')) { const d = await db.get('docs', id.slice(4)); if (d) f = { title: d.title, theme: 'doc', src: 'Mon cours', body: d.aiSummary || d.summary }; }
  if (!f) return go('/fiches');
  app.innerHTML = page(f.title, `<p class="muted small">${f.src} · ${esc(themeName(f.theme))}</p><article class="md">${md(f.body)}</article>
    <div class="row-btns"><button class="btn" id="tocards">${icon('cards', 16)} Créer des cartes</button></div>`, { back: '/fiches' });
  $('#tocards').onclick = async () => {
    const cards = makeCards(f.body.replace(/\*\*/g, ''), 40); let n = 0;
    for (const c of cards) { await db.put('cards', { id: 'f-' + uid(), deck: f.title, ...c }); n++; }
    toast(n ? `${n} cartes ajoutées` : 'Pas assez de matière pour créer des cartes');
  };
});

// =====================================================================
// COURS (imports)
// =====================================================================
route(/^\/cours$/, async () => {
  const docs = (await db.all('docs')).sort((a, b) => b.date - a.date);
  app.innerHTML = page('Mes cours', `
    <label class="drop"><input type="file" id="file" multiple accept=".pdf,.docx,.txt,.md,image/*,application/pdf">${icon('upload', 28)}<b>Importer des cours</b><small>PDF, Word (.docx), texte, photos de cours</small></label>
    <div class="card"><textarea id="paste" rows="4" placeholder="…ou collez ici le texte d’un cours"></textarea><div class="row-btns"><input id="ptitle" placeholder="Titre"><button class="btn" id="addp">Ajouter</button></div></div>
    <div id="prog"></div>
    <h2>${docs.length} cours</h2>
    <div class="list">${docs.map((d) => `<a class="item" href="#/cours/${d.id}"><div><b>${esc(d.title)}</b><small>${d.type.toUpperCase()} · ${d.text ? Math.round(d.text.length / 1000) + ' k caractères' : 'image'} · ${fmtDate(d.date)}</small></div></a>`).join('') || '<p class="muted">Aucun cours importé. Tout reste stocké sur votre iPad.</p>'}</div>`);
  const save = async (d) => {
    const doc = { id: uid(), date: Date.now(), ...d, text: cleanText(d.text) };
    if (doc.text.length > 200) { doc.summary = summarize(doc.text); doc.quiz = makeQuiz(doc.text, doc.id); const cards = makeCards(doc.text, 50); for (const c of cards) await db.put('cards', { id: 'd-' + uid(), deck: doc.title, doc: doc.id, ...c }); }
    await db.put('docs', doc); return doc;
  };
  $('#file').addEventListener('change', async (e) => {
    const { importFile } = await import('./importer.js');
    const prog = $('#prog');
    for (const f of e.target.files) {
      prog.innerHTML = `<div class="card">Import de ${esc(f.name)}… <span id="pc"></span></div>`;
      try { await save(await importFile(f, (p) => { const pc = $('#pc'); if (pc) pc.textContent = Math.round(p * 100) + ' %'; })); }
      catch (err) { toast(err.message); }
    }
    router();
  });
  $('#addp').onclick = async () => { const t = $('#paste').value.trim(); if (t.length < 50) return toast('Texte trop court'); await save({ title: $('#ptitle').value || 'Cours collé', type: 'text', text: t }); router(); };
});
route(/^\/cours\/([\w]+)(?:\/(\w+))?$/, async (id, tab = 'resume') => {
  const d = await db.get('docs', id); if (!d) return go('/cours');
  const { hasAI } = await import('./ai.js');
  const tabs = [['resume', 'Résumé'], ['texte', 'Texte'], ['original', 'Original'], ['cartes', 'Cartes'], ['ia', 'IA']].filter(([k]) => k !== 'original' || d.blob);
  app.innerHTML = page(d.title, `<div class="tabs line">${tabs.map(([k, l]) => `<a href="#/cours/${id}/${k}" class="${k === tab ? 'on' : ''}">${l}</a>`).join('')}</div><div id="dv"></div>
    <div class="row-btns"><button class="btn" id="qz">${icon('quiz', 16)} QCM sur ce cours</button><button class="btn danger" id="del">${icon('trash', 16)} Supprimer</button></div>`, { back: '/cours' });
  const dv = $('#dv');
  $('#del').onclick = async () => { if (!confirm('Supprimer ce cours ?')) return; await db.del('docs', id); for (const c of await db.all('cards')) if (c.doc === id) await db.del('cards', c.id); go('/cours'); };
  $('#qz').onclick = () => startQuiz({ mode: 'train', source: 'docs', doc: id, count: 20 });
  if (tab === 'resume') {
    dv.innerHTML = d.aiSummary ? `<p class="muted small">Fiche générée par IA</p><article class="md">${md(d.aiSummary)}</article><details><summary>Résumé automatique local</summary><article class="md">${md(d.summary || '')}</article></details>`
      : d.summary ? `<p class="muted small">Résumé automatique (hors ligne). Pour une fiche rédigée, utilisez l’onglet IA.</p><article class="md">${md(d.summary)}</article>` : `<p class="muted">Pas de texte exploitable${d.type === 'image' ? ' : c’est une photo. Utilisez l’onglet IA pour la transcrire.' : '.'}</p>`;
  } else if (tab === 'texte') {
    dv.innerHTML = `<textarea id="tx" rows="18">${esc(d.text || '')}</textarea><button class="btn" id="sv">Enregistrer et régénérer</button>`;
    $('#sv').onclick = async () => { d.text = cleanText($('#tx').value); d.summary = summarize(d.text); d.quiz = makeQuiz(d.text, d.id); await db.put('docs', d); toast('Enregistré'); };
  } else if (tab === 'original') {
    if (d.type === 'image') { const u = URL.createObjectURL(d.blob); onLeave(() => URL.revokeObjectURL(u)); dv.innerHTML = `<img class="orig" src="${u}" alt="">`; }
    else {
      let n = 1; dv.innerHTML = `<div class="pdfnav"><button class="btn small" id="pv">‹</button><span id="pn"></span><button class="btn small" id="nx">›</button></div><canvas id="cv"></canvas>`;
      const { renderPdfPage } = await import('./importer.js');
      const draw = async () => { const total = await renderPdfPage(d.blob, n, $('#cv'), dv.clientWidth); $('#pn').textContent = `${n} / ${total}`; d.pages = total; };
      $('#pv').onclick = () => { if (n > 1) { n--; draw(); } }; $('#nx').onclick = () => { if (n < (d.pages || 1)) { n++; draw(); } }; draw();
    }
  } else if (tab === 'cartes') {
    const cards = (await db.all('cards')).filter((c) => c.doc === id);
    dv.innerHTML = `<p class="muted">${cards.length} cartes générées.</p><a class="btn primary" href="#/cartes/doc:${id}">Réviser ces cartes</a><div class="list">${cards.slice(0, 80).map((c) => `<div class="item col"><b>${esc(c.front)}</b><small>${esc(c.back)}</small></div>`).join('')}</div>`;
  } else if (tab === 'ia') {
    if (!hasAI()) { dv.innerHTML = `<div class="card"><p>L’IA (Claude) permet de rédiger une fiche de révision, transcrire une photo de cours, générer des QCM de qualité et répondre à vos questions.</p><p class="muted small">Elle nécessite votre propre clé API Anthropic (payante à l’usage) et une connexion. Tout le reste de l’app fonctionne hors ligne sans clé.</p><a class="btn" href="#/reglages">Ajouter une clé</a></div>`; return; }
    dv.innerHTML = `<div class="row-btns"><button class="btn" data-ai="fiche">${icon('sparkle', 16)} Fiche de révision</button><button class="btn" data-ai="quiz">${icon('sparkle', 16)} 15 QCM</button>${d.type !== 'text' ? `<button class="btn" data-ai="ocr">${icon('sparkle', 16)} Transcrire le texte</button>` : ''}</div>
      <div class="search"><input id="askq" placeholder="Poser une question sur ce cours…"><button class="btn small" data-ai="ask">Demander</button></div><div id="aiout" class="md"></div>`;
    dv.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-ai]'); if (!b) return;
      const ai = await import('./ai.js'); const out = $('#aiout'); out.innerHTML = '<p class="muted">Rédaction en cours…</p>';
      const live = (t) => { out.innerHTML = md(t); };
      try {
        if (b.dataset.ai === 'fiche') { d.aiSummary = await ai.aiSummary(d, live); await db.put('docs', d); live(d.aiSummary); toast('Fiche enregistrée'); }
        if (b.dataset.ai === 'ocr') { const t = await ai.aiTranscribe(d, live); d.text = cleanText(t); d.summary = summarize(d.text); d.quiz = makeQuiz(d.text, d.id); await db.put('docs', d); toast('Texte enregistré'); }
        if (b.dataset.ai === 'ask') { const q = $('#askq').value.trim(); if (!q) { out.innerHTML = ''; return; } await ai.aiAsk(d, q, live); }
        if (b.dataset.ai === 'quiz') { const qs = await ai.aiQuiz(d, 15); d.aiQuiz = [...(d.aiQuiz || []), ...qs.map((q, i) => ({ id: `ai-${d.id}-${Date.now()}-${i}`, theme: 'doc', kind: 'qcm', q: q.q, options: [q.correct, ...q.wrong.slice(0, 3)], answer: 0, explain: q.explain }))]; await db.put('docs', d); out.innerHTML = `<p>${qs.length} questions ajoutées au cours.</p>`; }
      } catch (err) { out.innerHTML = `<p class="bad">${esc(err.message || String(err))}</p>`; }
    });
  }
});

// =====================================================================
// CARTES MÉMOIRE (répétition espacée)
// =====================================================================
const BUILTIN_DECKS = {
  vocab: { name: 'Vocabulaire médical', make: () => VOCAB.map(([t, d], i) => ({ id: 'b-v' + i, front: t, back: d })) },
  drugs: { name: 'Médicaments', make: () => DRUGS.map((d, i) => ({ id: 'b-d' + i, front: d[0], back: `${d[1]}\n${d[2]}\nSurveillance : ${d[4]}${d[5] ? '\nAntidote : ' + d[5] : ''}` })) },
  norms: { name: 'Normes', make: () => NORMS.map((n, i) => ({ id: 'b-n' + i, front: n[0], back: `${n[1]} – ${n[2]} ${n[3]}` })) },
  antidotes: { name: 'Antidotes', make: () => DRUGS.filter((d) => d[5]).map((d, i) => ({ id: 'b-a' + i, front: 'Antidote : ' + d[0], back: d[5] })) },
};
route(/^\/cartes$/, async () => {
  const cards = await db.all('cards'); const byDeck = {};
  for (const c of cards) { const k = c.doc ? 'doc:' + c.doc : c.builtin ? c.builtin : 'deck:' + c.deck; (byDeck[k] = byDeck[k] || { name: c.builtin ? BUILTIN_DECKS[c.builtin]?.name : c.deck, n: 0, due: 0 }); byDeck[k].n++; if (isDue(c)) byDeck[k].due++; }
  const due = cards.filter(isDue).length;
  app.innerHTML = page('Cartes mémoire', `
    <button class="btn primary big" id="all" ${due ? '' : 'disabled'}>${icon('play', 18)} Réviser tout (${due} à revoir)</button>
    <h2>Paquets intégrés</h2>
    <div class="list">${Object.entries(BUILTIN_DECKS).map(([k, d]) => `<a class="item" href="#/cartes/${k}"><div><b>${d.name}</b><small>${byDeck[k] ? `${byDeck[k].due} à revoir / ${byDeck[k].n}` : d.make().length + ' cartes'}</small></div></a>`).join('')}</div>
    <h2>Mes paquets</h2>
    <div class="list">${Object.entries(byDeck).filter(([k]) => !BUILTIN_DECKS[k]).map(([k, d]) => `<a class="item" href="#/cartes/${encodeURIComponent(k)}"><div><b>${esc(d.name)}</b><small>${d.due} à revoir / ${d.n}</small></div></a>`).join('') || '<p class="muted">Les cours importés et les fiches créent automatiquement des paquets.</p>'}</div>
    <h2>Nouvelle carte</h2>
    <div class="card"><input id="cf" placeholder="Recto (question)"><textarea id="cb" rows="2" placeholder="Verso (réponse)"></textarea><button class="btn" id="add">${icon('plus', 16)} Ajouter</button></div>`);
  $('#all').onclick = () => go('/cartes/all');
  $('#add').onclick = async () => { const f = $('#cf').value.trim(), b = $('#cb').value.trim(); if (!f || !b) return; await db.put('cards', { id: 'u-' + uid(), deck: 'Mes cartes', front: f, back: b }); toast('Carte ajoutée'); router(); };
});
route(/^\/cartes\/(.+)$/, async (deck) => {
  let cards = await db.all('cards');
  if (BUILTIN_DECKS[deck]) {
    const have = new Set(cards.map((c) => c.id));
    for (const c of BUILTIN_DECKS[deck].make()) if (!have.has(c.id)) { const nc = { ...c, builtin: deck }; await db.put('cards', nc); cards.push(nc); }
    cards = cards.filter((c) => c.builtin === deck);
  } else if (deck.startsWith('doc:')) cards = cards.filter((c) => c.doc === deck.slice(4));
  else if (deck.startsWith('deck:')) cards = cards.filter((c) => c.deck === deck.slice(5) && !c.doc);
  let queue = shuffle(cards.filter(isDue)).slice(0, 50);
  if (!queue.length && deck !== 'all') queue = shuffle(cards).slice(0, 20);
  let i = 0; let done = 0;
  const show = () => {
    const c = queue[i];
    if (!c) { app.innerHTML = page('Terminé', `<div class="result"><div class="big-note good">${done}</div><p>cartes révisées. Revenez demain pour la suite.</p></div><a class="btn" href="#/cartes">Retour</a>`, { back: '/cartes' }); return; }
    app.innerHTML = `<header class="top"><a class="iconbtn" href="#/cartes">${icon('close')}</a><div class="progress"><i style="width:${(i / queue.length) * 100}%"></i></div><span class="muted small">${i + 1}/${queue.length}</span></header>
      <div class="content narrow"><div class="flash" id="fc"><div class="front">${esc(c.front)}</div><div class="back hidden">${esc(c.back).replace(/\n/g, '<br>')}</div></div>
      <button class="btn primary big" id="flip">Afficher la réponse</button><div class="grades hidden" id="gr">${['À revoir', 'Difficile', 'Bien', 'Facile'].map((l, q) => `<button class="btn g${q}" data-q="${q}">${l}<small>${nextLabel(c, q)}</small></button>`).join('')}</div></div>`;
    const flip = () => { $('.back').classList.remove('hidden'); $('#flip').remove(); $('#gr').classList.remove('hidden'); };
    $('#flip').onclick = flip; $('#fc').onclick = () => $('#flip') && flip();
    $('#gr').onclick = async (e) => { const b = e.target.closest('[data-q]'); if (!b) return; const q = +b.dataset.q; await db.put('cards', review(c, q)); if (q === 0) queue.push(c); done++; i++; show(); };
  };
  show();
});

// =====================================================================
// DICTIONNAIRE
// =====================================================================
route(/^\/dico(?:\/(.+))?$/, async (q0 = '') => {
  app.innerHTML = page('Dictionnaire', `<form class="search" id="df"><span>${icon('dico', 18)}</span><input type="search" id="dq" placeholder="Tapez un mot : dyspnée, héparine, ictère…" value="${esc(q0)}" autocomplete="off"><button class="btn small">Chercher</button></form><div id="dres"></div>`);
  const run = async (q) => {
    const res = $('#dres'); if (!q.trim()) { res.innerHTML = '<p class="muted">Lexique intégré hors ligne + Wikipédia quand vous êtes connecté(e).</p>'; return; }
    const loc = localLookup(q);
    res.innerHTML = `${loc.map((r) => `<div class="card"><small class="muted">${r.src}</small><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></div>`).join('')}<div id="wk"><p class="muted small">Recherche sur Wikipédia…</p></div>`;
    try {
      const w = navigator.onLine ? await wikiLookup(q) : [];
      $('#wk').innerHTML = w.length ? w.map((r) => `<div class="card"><small class="muted">Wikipédia</small><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p>${r.url ? `<a class="small" href="${esc(r.url)}" target="_blank" rel="noopener">Lire l’article</a>` : ''}</div>`).join('') : `<p class="muted small">${navigator.onLine ? 'Rien trouvé sur Wikipédia.' : 'Hors ligne : seul le lexique intégré est disponible.'}</p>`;
    } catch { $('#wk').innerHTML = '<p class="muted small">Wikipédia indisponible.</p>'; }
    const topics = searchTopics(q, 6).filter((t) => !t.themeOnly);
    if (topics.length) res.insertAdjacentHTML('beforeend', `<h2>Catégories liées</h2><div class="chips">${topics.map((t) => `<a class="chip" href="#/cat/${t.id}">${esc(t.name)}</a>`).join('')}</div>`);
  };
  $('#df').addEventListener('submit', (e) => { e.preventDefault(); run($('#dq').value); });
  run(q0);
});

// =====================================================================
// STATS
// =====================================================================
route(/^\/stats$/, async () => {
  const st = (await db.kv('stats')) || { themes: {}, days: {}, n: 0, ok: 0 };
  const hist = (await db.all('history')).sort((a, b) => b.date - a.date);
  const evalQ = hist.filter((h) => h.mode === 'eval'); const avg = evalQ.length ? evalQ.reduce((a, h) => a + h.note, 0) / evalQ.length : 0;
  const days = []; for (let k = 13; k >= 0; k--) { const d = new Date(); d.setDate(d.getDate() - k); const key = d.toISOString().slice(0, 10); days.push([key, st.days[key] || 0]); }
  const max = Math.max(1, ...days.map((d) => d[1]));
  app.innerHTML = page('Statistiques', `
    <div class="grid stats3"><div class="stat"><b>${st.n}</b><small>réponses</small></div><div class="stat"><b>${st.n ? Math.round((st.ok / st.n) * 100) : 0}%</b><small>réussite</small></div><div class="stat"><b>${avg ? avg.toFixed(1).replace('.', ',') : '—'}</b><small>moyenne aux évaluations</small></div></div>
    <h2>14 derniers jours</h2><div class="bars">${days.map(([k, v]) => `<div title="${k} : ${v}"><i style="height:${(v / max) * 100}%"></i><small>${k.slice(8)}</small></div>`).join('')}</div>
    <h2>Par thème</h2><div class="list">${Object.entries(st.themes).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).map(([t, v]) => `<div class="item"><div class="grow"><b>${esc(themeName(t))}</b><div class="meter"><i style="width:${(v.ok / v.n) * 100}%"></i></div></div><span class="muted small">${Math.round((v.ok / v.n) * 100)}% · ${v.n}</span></div>`).join('') || '<p class="muted">Répondez à quelques QCM pour voir vos points faibles.</p>'}</div>
    <h2>Historique</h2><div class="list">${hist.slice(0, 50).map(histRow).join('') || '<p class="muted">Aucune série terminée.</p>'}</div>`);
});

// =====================================================================
// RÉGLAGES
// =====================================================================
route(/^\/reglages$/, () => {
  const s = settings();
  app.innerHTML = page('Réglages', `
    <h2>Apparence</h2>${seg('theme', [['dark', 'Sombre'], ['light', 'Clair'], ['auto', 'Système']], LS.get('theme', 'dark'))}
    <h2>Chronomètres par défaut</h2><div class="card">
      ${toggle('chronoQuizTrain', s.chronoQuizTrain, 'QCM — entraînement')}<div class="row"><span>Questions par évaluation</span>${seg('evalCount', [[10, '10'], [20, '20'], [30, '30'], [50, '50']], s.evalCount)}</div>${toggle('chronoQuizEval', s.chronoQuizEval, 'QCM — évaluation')}
      ${toggle('chronoSimTrain', s.chronoSimTrain, 'Patients — entraînement', 'Temps réel')}${toggle('chronoSimEval', s.chronoSimEval, 'Patients — évaluation', 'Temps réel')}</div>
    <h2>Simulation 3D</h2><div class="card">${toggle('anim', s.anim !== false, 'Animations (respiration, scope)', 'Désactivez pour économiser encore plus la batterie')}
</div>
    <h2>IA (optionnel)</h2><div class="card"><p class="small">Clé API Anthropic (Claude) pour les fiches rédigées, la transcription de photos et les QCM générés depuis vos cours. Elle reste sur cet appareil et n’est envoyée qu’à l’API d’Anthropic.</p>
      <input id="key" type="password" placeholder="sk-ant-…" value="${esc(localStorage.getItem('apiKey') || '')}" autocomplete="off"><div class="row-btns"><button class="btn" id="savekey">Enregistrer</button><button class="btn" id="delkey">Effacer</button></div></div>
    <h2>Hors ligne</h2><div class="card"><p class="small" id="offst">Vérification…</p><button class="btn small" id="offdl">Tout télécharger maintenant</button></div>
    <h2>Données</h2><div class="row-btns"><button class="btn" id="exp">Exporter une sauvegarde</button><label class="btn">Importer<input type="file" id="imp" accept=".json" hidden></label><button class="btn danger" id="reset">Tout effacer</button></div>
    <p class="muted small">Toutes vos données (cours, cartes, statistiques) restent sur votre iPad. L’application fonctionne hors ligne.</p>`);
  bindSeg(app, (k, v) => { if (k === 'theme') { LS.set('theme', v); applyTheme(); } if (k === 'evalCount') saveSettings({ evalCount: +v }); });
  app.querySelectorAll('[data-tg]').forEach((t) => t.addEventListener('change', () => saveSettings({ [t.dataset.tg]: t.checked })));
  const showOff = (d) => { const el = $('#offst'); if (el && d) el.textContent = `Application disponible hors ligne. Patients 3D hors ligne : ${d.done}/${d.total}${d.done < d.total ? ' (téléchargement en cours ou à lancer)' : ' ✓'}`; };
  if (!swAsk('patients-status', showOff)) $('#offst').textContent = 'Le mode hors ligne s’active après la première ouverture depuis l’adresse web (https).';
  $('#offdl').onclick = () => swAsk('cache-patients', showOff);
  $('#savekey').onclick = () => { const k = $('#key').value.trim(); if (k) localStorage.setItem('apiKey', k); toast('Clé enregistrée'); };
  $('#delkey').onclick = () => { localStorage.removeItem('apiKey'); $('#key').value = ''; toast('Clé effacée'); };
  $('#exp').onclick = async () => {
    const data = { v: 1, date: Date.now(), cards: await db.all('cards'), history: await db.all('history'), kv: await db.all('kv'), docs: (await db.all('docs')).map(({ blob, ...d }) => d) };
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' })); a.download = `revision-ide-${today()}.json`; a.click();
  };
  $('#imp').onchange = async (e) => {
    try { const data = JSON.parse(await e.target.files[0].text()); for (const s2 of ['cards', 'history', 'kv', 'docs']) for (const x of data[s2] || []) await db.put(s2, x); toast('Sauvegarde importée'); } catch { toast('Fichier invalide'); }
  };
  $('#reset').onclick = async () => { if (!confirm('Effacer toutes vos données (cours, cartes, statistiques) ?')) return; for (const s2 of ['cards', 'history', 'kv', 'docs', 'cache']) await db.clear(s2); toast('Données effacées'); };
});

// ---------- Démarrage ----------
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
router();
// Hors ligne : enregistre le service worker puis télécharge les patients 3D en arrière-plan (une seule fois)
function swAsk(msg, onMsg) {
  const sw = navigator.serviceWorker?.controller; if (!sw) return false;
  const ch = new MessageChannel(); ch.port1.onmessage = (e) => onMsg?.(e.data); sw.postMessage(msg, [ch.port2]); return true;
}
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
  navigator.serviceWorker.ready.then(() => setTimeout(() => swAsk('cache-patients'), 4000));
  navigator.storage?.persist?.().catch(() => {});
}
