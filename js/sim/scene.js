// Chambre d'hôpital 3D (Three.js). Rendu à la demande ; animation légère (≈10 i/s) seulement si activée et visible.
import * as THREE from 'three';
import { OrbitControls } from '../../vendor/OrbitControls.js';
import { RoundedBoxGeometry } from '../../vendor/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from '../../vendor/environments/RoomEnvironment.js';

const SKIN = { normal: 0xe2b394, pale: 0xeedfd4, cyan: 0xb9bfd0, red: 0xeea08a, grey: 0xcfc8c0, yellow: 0xe6d08a };
const LIPS = { normal: 0xb86a62, pale: 0xcfa39b, cyan: 0x6f7fae, red: 0xc0564d, grey: 0xa08a88, yellow: 0xb88a6a };
const URINE = { clair: 0xf2dc6b, trouble: 0xd9c79a, foncee: 0xb5762a, sang: 0xa8322b };

export const PICK_LABELS = {
  patient: 'Patient', monitor: 'Scope', sha: 'Solution hydro-alcoolique', gants: 'Boîte de gants', tensio: 'Tensiomètre', thermo: 'Thermomètre',
  gluco: 'Lecteur de glycémie', steth: 'Stéthoscope', oxy: 'Oxymètre de pouls', ecg: 'Électrocardiographe', bladder: 'Bladder scan', kit: 'Plateau de soins',
  o2: 'Prise d’oxygène murale', phone: 'Téléphone', chariot: 'Chariot d’urgence', dossier: 'Dossier patient', iv: 'Pied à perfusion', pharma: 'Plateau médicaments',
};

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}

export class Room {
  constructor(container, onPick, dark = true, animate = true) {
    this.container = container; this.onPick = onPick; this.dark = dark; this.animate = animate;
    this.pickables = []; this.disposed = false; this.state = {};
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' }));
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 0.82;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.shadowMap.autoUpdate = false; // ombres recalculées seulement si la scène change
    container.appendChild(r.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(46, 1, 0.05, 50);
    this.camera.position.set(2.5, 1.75, 3.0);
    this.controls = new OrbitControls(this.camera, r.domElement);
    this.controls.target.set(-0.35, 0.85, -0.25);
    Object.assign(this.controls, { enableDamping: false, minDistance: 0.6, maxDistance: 4.6, maxPolarAngle: Math.PI * 0.49, minPolarAngle: 0.2, enablePan: true });
    this.controls.addEventListener('change', () => this.render());
    this.build();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.bindPick();
    this.resize();
  }
  m(color, opts = {}) { return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0, ...opts }); }
  mesh(geo, mat, x = 0, y = 0, z = 0, parent = this.scene, pick) {
    const o = new THREE.Mesh(geo, typeof mat === 'number' ? this.m(mat) : mat); o.position.set(x, y, z); parent.add(o); if (pick) this.tag(o, pick); return o;
  }
  box(w, h, d, c, x, y, z, p, pick) { return this.mesh(new THREE.BoxGeometry(w, h, d), c, x, y, z, p, pick); }
  cyl(rt, rb, h, c, x, y, z, p, pick, seg = 18) { return this.mesh(new THREE.CylinderGeometry(rt, rb, h, seg), c, x, y, z, p, pick); }
  sph(r, c, x, y, z, p, pick, s = [24, 16]) { return this.mesh(new THREE.SphereGeometry(r, s[0], s[1]), c, x, y, z, p, pick); }
  cap(r, len, c, x, y, z, p, pick) { return this.mesh(new THREE.CapsuleGeometry(r, len, 6, 16), c, x, y, z, p, pick); }
  tag(obj, pick) { obj.traverse((o) => { if (o.isMesh) { o.userData.pick = pick; this.pickables.push(o); } }); }
  shadow(w, d, x, z, op = 0.35) {
    const tex = canvasTex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 4, 32, 32, 32); g.addColorStop(0, `rgba(0,0,0,${op})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
    const o = this.mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }), x, 0.003, z); o.rotation.x = -Math.PI / 2;
  }

  build() {
    const S = this.scene;
    // Lumière : environnement « pièce » (calculé une seule fois) + lumière de fenêtre avec ombres douces
    const pm = new THREE.PMREMGenerator(this.renderer);
    S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    S.environmentIntensity = 0.32;
    S.background = new THREE.Color(0xcfd3d0);
    S.add(new THREE.HemisphereLight(0xfffaf2, 0x9aa39c, 0.55));
    const sun = (this.sun = new THREE.DirectionalLight(0xfff3e2, 1.6));
    sun.position.set(0.8, 3.2, -1.2); sun.target.position.set(0, 0.4, 0.6); S.add(sun, sun.target);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.radius = 4; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
    Object.assign(sun.shadow.camera, { left: -2.4, right: 2.6, top: 2.4, bottom: -2.2, near: 0.5, far: 7 });
    const ceil = new THREE.PointLight(0xfff1de, 3.5, 6, 1.6); ceil.position.set(0.2, 2.6, 0.4); S.add(ceil);

    // ---- Textures procédurales (générées une fois, légères)
    const noise = (c, w, h, base, amp, n = 9000, size = 1.4) => { c.fillStyle = base; c.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) { const v = (Math.random() - 0.5) * amp; c.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; c.fillRect(Math.random() * w, Math.random() * h, size, size); } };
    const floorTex = canvasTex(512, 512, (c, w, h) => { noise(c, w, h, '#b9b5ab', 0.2, 26000, 1.6); for (let i = 0; i < 600; i++) { c.fillStyle = ['#9c978c', '#ebe8e1', '#b3aea3', '#7d786e'][i % 4]; c.fillRect(Math.random() * w, Math.random() * h, 2.5, 2); } }, [5, 5]);
    const wallTex = canvasTex(512, 512, (c, w, h) => noise(c, w, h, '#ebe7de', 0.05, 14000, 2), [4, 2]);
    const lowWallTex = canvasTex(256, 256, (c, w, h) => noise(c, w, h, '#bfd3cc', 0.05, 5000, 2), [6, 1]);
    const ceilTex = canvasTex(256, 256, (c, w, h) => { noise(c, w, h, '#f4f5f2', 0.05, 4000, 1); c.strokeStyle = '#d9dbd6'; c.lineWidth = 3; c.strokeRect(0, 0, w, h); }, [10, 10]);
    const woodTex = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#c9a77c'; c.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { c.strokeStyle = `rgba(${90 + Math.random() * 40},${60 + Math.random() * 30},30,${0.08 + Math.random() * 0.12})`; c.lineWidth = 1 + Math.random() * 2; c.beginPath(); const y = Math.random() * h; c.moveTo(0, y); for (let x = 0; x <= w; x += 32) c.lineTo(x, y + Math.sin(x * 0.02 + i) * 3); c.stroke(); } });
    this.sheetTex = canvasTex(256, 256, (c, w, h) => { noise(c, w, h, '#f6f7f8', 0.04, 3000, 1); c.strokeStyle = 'rgba(0,0,0,.035)'; for (let i = 0; i < w; i += 3) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); } }, [3, 3]);
    const curtainTex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#b9d6d6'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.35)'; for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) c.fillRect(x + ((y / 32) % 2) * 16, y, 10, 10); }, [3, 4]);

    const M = (color, rough = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });
    const metal = new THREE.MeshStandardMaterial({ color: 0xc9ced4, roughness: 0.32, metalness: 0.85 });
    const plastic = M(0xf1f2ef, 0.45); const grey = M(0x8d949b, 0.5); const dark = M(0x2c3036, 0.5);
    const RB = (w, h, d, r, mat, x, y, z, p = S, pick) => this.mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat, x, y, z, p, pick);

    // ---- Pièce
    const floor = this.mesh(new THREE.PlaneGeometry(5, 6), M(0xffffff, 0.42, { map: floorTex }), 0.55, 0, 0.6); floor.rotation.x = -Math.PI / 2;
    const ceilM = this.mesh(new THREE.PlaneGeometry(5, 6), M(0xffffff, 0.9, { map: ceilTex }), 0.5, 2.7, 0.6); ceilM.rotation.x = Math.PI / 2;
    for (const [x, z] of [[0.2, 0.4], [0.2, -0.9]]) this.box(0.6, 0.02, 0.6, M(0xffffff, 0.3, { emissive: 0xfff8ec, emissiveIntensity: 1.2 }), x, 2.69, z);
    const wallM = M(0xffffff, 0.85, { map: wallTex }); const lowM = M(0xffffff, 0.7, { map: lowWallTex });
    this.box(4.75, 1.75, 0.06, wallM, 0.55, 1.825, -1.5); this.box(4.75, 0.95, 0.06, lowM, 0.55, 0.475, -1.5);
    this.box(0.06, 1.75, 6, wallM, -1.8, 1.825, 0.6); this.box(0.06, 0.95, 6, lowM, -1.8, 0.475, 0.6);
    this.box(4.7, 0.1, 0.04, M(0xb8c4bf, 0.5), 0.55, 0.95, -1.46); this.box(0.04, 0.1, 6, M(0xb8c4bf, 0.5), -1.76, 0.95, 0.6); // main courante
    this.box(6, 0.1, 0.015, grey, 0.5, 0.05, -1.465); this.box(0.015, 0.1, 6, grey, -1.79, 0.05, 0.6); // plinthes
    // fenêtre + stores
    const sky = canvasTex(512, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8fbde6'); g.addColorStop(0.6, '#d7e8f4'); g.addColorStop(1, '#eef3f5'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 9; i++) { const bw = 40 + Math.random() * 70, bh = 120 + Math.random() * 200, x = i * 60 - 20; c.fillStyle = `hsl(210,10%,${68 + Math.random() * 14}%)`; c.fillRect(x, h - bh, bw, bh); c.fillStyle = 'rgba(255,255,255,.35)'; for (let yy = h - bh + 10; yy < h - 10; yy += 18) for (let xx = x + 6; xx < x + bw - 8; xx += 14) c.fillRect(xx, yy, 7, 9); }
      for (let i = 0; i < 14; i++) { c.fillStyle = `hsl(${100 + Math.random() * 30},30%,${32 + Math.random() * 12}%)`; c.beginPath(); c.arc(Math.random() * w, h - 20 - Math.random() * 40, 30 + Math.random() * 30, 0, 7); c.fill(); } });
    this.box(1.3, 1.1, 0.02, new THREE.MeshBasicMaterial({ map: sky }), 0.6, 1.65, -1.48);
    for (const [w, h, x, y] of [[1.42, 0.06, 0.6, 2.23], [1.42, 0.06, 0.6, 1.07], [0.06, 1.2, -0.08, 1.65], [0.06, 1.2, 1.28, 1.65], [0.04, 1.1, 0.6, 1.65]]) this.box(w, h, 0.07, plastic, x, y, -1.45);
    this.box(1.5, 0.05, 0.22, plastic, 0.6, 1.05, -1.38); // rebord
    for (let i = 0; i < 9; i++) this.box(1.28, 0.012, 0.05, M(0xf4f4f0, 0.5), 0.6, 2.15 - i * 0.025, -1.41); // store relevé
    // porte vitrée
    // mur de droite : porte de salle de bain, armoire, télévision
    this.box(0.06, 1.75, 6, wallM, 2.9, 1.825, 0.6); this.box(0.06, 0.95, 6, lowM, 2.9, 0.475, 0.6); this.box(0.04, 0.1, 6, M(0xb8c4bf, 0.5), 2.86, 0.95, 0.6);
    const door = RB(0.05, 2.1, 0.9, 0.01, M(0xffffff, 0.5, { map: woodTex }), 2.86, 1.05, 1.75); this.box(0.06, 2.2, 0.06, plastic, 2.86, 1.1, 1.27); this.box(0.06, 2.2, 0.06, plastic, 2.86, 1.1, 2.23); this.box(0.06, 0.06, 1.02, plastic, 2.86, 2.2, 1.75);
    this.cyl(0.012, 0.012, 0.16, metal, 2.8, 1.02, 1.4).rotation.x = Math.PI / 2;
    const ward = new THREE.Group(); ward.position.set(2.6, 0, -0.95); S.add(ward);
    RB(0.55, 2.0, 0.9, 0.02, M(0xffffff, 0.5, { map: woodTex }), 0, 1.0, 0, ward); this.box(0.005, 1.9, 0.005, M(0x6b5a45, 0.6), -0.278, 1.0, 0, ward);
    for (const z of [-0.06, 0.06]) this.box(0.02, 0.3, 0.02, metal, -0.285, 1.1, z, ward);
    const tvArm = this.box(0.35, 0.04, 0.04, metal, -1.55, 2.05, 0.95); const tv = RB(0.04, 0.4, 0.68, 0.01, M(0x15171a, 0.25), -1.36, 2.05, 0.95); tv.rotation.z = 0.15;
    // table adaptable au-dessus du lit
    const ot = new THREE.Group(); ot.position.set(0.55, 0, 0.62); S.add(ot);
    RB(0.5, 0.04, 0.6, 0.01, metal, 0, 0.04, -0.15, ot); this.cyl(0.025, 0.025, 0.9, metal, 0, 0.5, 0, ot);
    RB(0.42, 0.03, 0.75, 0.012, M(0xffffff, 0.5, { map: woodTex }), 0, 0.95, -0.5, ot); this.cyl(0.035, 0.03, 0.11, M(0xffffff, 0.2, { transparent: true, opacity: 0.6 }), 0.08, 1.02, -0.4, ot);
    // panneau bois derrière le lit
    RB(0.03, 1.1, 2.0, 0.01, M(0xffffff, 0.55, { map: woodTex }), -1.765, 1.5, -0.05);
    // lavabo, distributeur SHA, collecteur d'aiguilles, boîte à gants, horloge, tableau
    RB(0.1, 0.22, 0.09, 0.02, plastic, 2.83, 1.25, -0.2); this.box(0.03, 0.03, 0.04, M(0x2f80ed, 0.4), 2.78, 1.17, -0.2);
    const sharps = RB(0.18, 0.2, 0.14, 0.02, M(0xf2c230, 0.5), -1.69, 1.1, 1.55); this.box(0.19, 0.04, 0.15, M(0xd8392b, 0.5), -1.69, 1.22, 1.55);
    RB(0.06, 0.14, 0.26, 0.01, plastic, -1.74, 1.45, 1.55);
    const clockTex = canvasTex(128, 128, (c) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(64, 64, 62, 0, 7); c.fill(); c.strokeStyle = '#333'; c.lineWidth = 4; c.stroke(); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; c.fillStyle = '#333'; c.fillRect(64 + Math.cos(a) * 50 - 2, 64 + Math.sin(a) * 50 - 2, 4, 4); } const d = new Date(); const hA = ((d.getHours() % 12) / 12 + d.getMinutes() / 720) * Math.PI * 2 - Math.PI / 2; const mA = (d.getMinutes() / 60) * Math.PI * 2 - Math.PI / 2; c.lineWidth = 5; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + Math.cos(hA) * 30, 64 + Math.sin(hA) * 30); c.stroke(); c.lineWidth = 3; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + Math.cos(mA) * 44, 64 + Math.sin(mA) * 44); c.stroke(); });
    this.mesh(new THREE.CircleGeometry(0.14, 32), M(0xffffff, 0.4, { map: clockTex }), -0.6, 2.25, -1.465);
    const board = canvasTex(512, 320, (c, w, h) => { c.fillStyle = '#fbfbfb'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d5fa8'; c.font = '700 34px sans-serif'; c.fillText('Chambre 12', 24, 52); c.fillStyle = '#333'; c.font = '26px sans-serif'; c.fillText('IDE : vous', 24, 110); c.fillText('Médecin : Dr Bernard', 24, 150); c.fillStyle = '#c0392b'; c.fillText('Risque de chute', 24, 200); c.fillStyle = '#2e7d32'; c.fillText('Douleur : réévaluer', 24, 240); });
    this.box(0.62, 0.4, 0.02, M(0xffffff, 0.35, { map: board }), -0.6, 1.62, -1.46);
    // bandeau tête de lit (fluides, prises, éclairage)
    RB(0.1, 0.26, 2.2, 0.03, plastic, -1.74, 1.48, -0.05);
    this.box(0.02, 0.04, 2.0, M(0xffffff, 0.3, { emissive: 0xfff4dc, emissiveIntensity: 1.3 }), -1.685, 1.6, -0.05);
    for (const z of [0.42, 0.56, 0.7]) this.box(0.02, 0.07, 0.09, plastic, -1.68, 1.42, z);
    const vac = new THREE.Group(); vac.position.set(-1.67, 1.42, -0.62); S.add(vac); this.box(0.04, 0.08, 0.08, plastic, 0, 0, 0, vac); this.cyl(0.035, 0.035, 0.15, M(0xdfe7ee, 0.2, { transparent: true, opacity: 0.8 }), 0.06, -0.13, 0, vac);
    const o2 = new THREE.Group(); o2.position.set(-1.67, 1.42, -0.32); S.add(o2);
    this.box(0.04, 0.08, 0.08, plastic, 0, 0, 0, o2); this.cyl(0.026, 0.026, 0.15, M(0xffffff, 0.1, { transparent: true, opacity: 0.7 }), 0.06, -0.06, 0, o2); this.sph(0.012, M(0xffffff, 0.3), 0.06, -0.06, 0, o2); this.cyl(0.03, 0.03, 0.03, M(0x2fae5a, 0.4), 0.06, 0.03, 0, o2);
    this.tag(o2, 'o2');
    const ph = new THREE.Group(); ph.position.set(-1.74, 1.25, 1.1); S.add(ph);
    RB(0.05, 0.22, 0.12, 0.015, plastic, 0, 0, 0, ph); RB(0.05, 0.2, 0.05, 0.02, dark, 0.035, 0, -0.025, ph); this.tag(ph, 'phone');
    // rideau de séparation sur rail
    this.box(0.03, 0.03, 2.4, metal, 1.25, 2.55, -0.25);
    const cg = new THREE.PlaneGeometry(0.45, 1.95, 30, 1); const cp = cg.attributes.position; for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getX(i) * 60) * 0.04); cg.computeVertexNormals();
    const curtain = this.mesh(cg, M(0xffffff, 0.9, { map: curtainTex, side: THREE.DoubleSide }), 1.25, 1.55, -1.2); curtain.rotation.y = Math.PI / 2;
    // fauteuil visiteur
    const chair = new THREE.Group(); chair.position.set(2.2, 0, -0.55); chair.rotation.y = -1.1; S.add(chair);
    RB(0.55, 0.12, 0.55, 0.05, M(0x5d7f8a, 0.8), 0, 0.45, 0, chair); RB(0.55, 0.6, 0.1, 0.05, M(0x5d7f8a, 0.8), 0, 0.78, -0.24, chair);
    for (const x of [-0.27, 0.27]) { RB(0.06, 0.25, 0.5, 0.02, M(0xc9a77c, 0.6, { map: woodTex }), x, 0.6, 0, chair); for (const z of [-0.22, 0.22]) this.cyl(0.02, 0.02, 0.4, metal, x, 0.2, z, chair); }

    // ---- Lit médicalisé
    const frame = M(0xe9ebe8, 0.45); const panel = M(0xd9c39f, 0.55, { map: woodTex });
    this.box(2.0, 0.1, 0.9, frame, 0, 0.4, 0);
    this.box(1.6, 0.1, 0.12, grey, 0, 0.22, 0);
    for (const [x, z] of [[-0.9, -0.38], [-0.9, 0.38], [0.9, -0.38], [0.9, 0.38]]) { this.cyl(0.03, 0.03, 0.3, metal, x, 0.22, z); this.cyl(0.05, 0.05, 0.035, dark, x, 0.05, z).rotation.x = Math.PI / 2; }
    RB(0.06, 0.55, 1.0, 0.03, panel, 1.06, 0.68, 0);
    const mattM = M(0xffffff, 0.95, { map: this.sheetTex });
    RB(1.25, 0.15, 0.92, 0.05, mattM, 0.4, 0.53, 0);
    this.head = new THREE.Group(); this.head.position.set(-0.22, 0.6, 0); S.add(this.head);
    RB(0.86, 0.15, 0.92, 0.05, mattM, -0.43, -0.07, 0, this.head);
    RB(0.06, 0.6, 1.0, 0.03, panel, -0.89, 0.16, 0, this.head);
    const pillow = (this.pillow = this.mesh(new RoundedBoxGeometry(0.42, 0.13, 0.65, 4, 0.06), M(0xffffff, 0.95, { map: this.sheetTex }), -0.66, 0.05, 0, this.head));
    // barrières latérales
    for (const z of [-0.5, 0.5]) { RB(0.95, 0.06, 0.03, 0.015, plastic, 0.05, 0.84, z); RB(0.95, 0.06, 0.03, 0.015, plastic, 0.05, 0.72, z); for (const x of [-0.38, 0.46]) this.cyl(0.013, 0.013, 0.22, metal, x, 0.72, z); }
    // télécommande du lit accrochée
    RB(0.06, 0.14, 0.03, 0.012, plastic, 0.3, 0.68, 0.53); this.cyl(0.003, 0.003, 0.2, dark, 0.3, 0.8, 0.52);

    // ---- Patient (mannequin de secours tant que l'humain réaliste n'est pas chargé)
    this.buildPatient();

    // ---- Oxygène (sur le visage)
    const F = this.face;
    this.lunettes = new THREE.Group(); F.add(this.lunettes);
    const tubeM = M(0xeef8ff, 0.2, { transparent: true, opacity: 0.85 });
    const lt = this.mesh(new THREE.TorusGeometry(0.088, 0.004, 6, 28, Math.PI * 1.3), tubeM, 0.02, 0.04, 0, this.lunettes); lt.rotation.set(Math.PI / 2, 0, -Math.PI * 0.15);
    for (const z of [-0.008, 0.008]) this.cyl(0.004, 0.004, 0.02, tubeM, 0.03, 0.115, z, this.lunettes);
    this.masque = new THREE.Group(); F.add(this.masque);
    const maskM = M(0xc6f3d8, 0.15, { transparent: true, opacity: 0.5 });
    const mk = this.mesh(new THREE.SphereGeometry(0.045, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), maskM, 0.025, 0.098, 0, this.masque); mk.scale.set(1.3, 0.85, 1.05);
    const bag = this.sph(0.04, M(0xc6f3d8, 0.2, { transparent: true, opacity: 0.55 }), 0.16, 0.035, 0, this.masque, null, [14, 10]); bag.scale.set(1.3, 0.5, 0.85);
    this.cyl(0.008, 0.008, 0.06, maskM, 0.1, 0.07, 0, this.masque).rotation.z = Math.PI / 2;
    const strap = this.mesh(new THREE.TorusGeometry(0.1, 0.0025, 4, 28), grey, 0.02, 0.0, 0, this.masque); strap.rotation.y = Math.PI / 2;

    // ---- Scope sur bras articulé
    const mon = new THREE.Group(); mon.position.set(-1.0, 0, -0.95); S.add(mon);
    this.cyl(0.025, 0.025, 1.2, metal, 0, 0.6, 0, mon); for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; RB(0.26, 0.03, 0.04, 0.01, dark, Math.cos(a) * 0.12, 0.04, Math.sin(a) * 0.12, mon).rotation.y = -a; }
    RB(0.64, 0.46, 0.1, 0.03, M(0x2a2e34, 0.4), 0.05, 1.32, 0.02, mon); RB(0.66, 0.06, 0.11, 0.02, M(0x3d434b, 0.4), 0.05, 1.57, 0.02, mon);
    this.monCanvas = document.createElement('canvas'); this.monCanvas.width = 512; this.monCanvas.height = 336;
    this.monTex = new THREE.CanvasTexture(this.monCanvas); this.monTex.colorSpace = THREE.SRGBColorSpace;
    this.mesh(new THREE.PlaneGeometry(0.57, 0.375), new THREE.MeshBasicMaterial({ map: this.monTex, toneMapped: false }), 0.05, 1.32, 0.072, mon);
    mon.rotation.y = 0.8; this.tag(mon, 'monitor');
    this.scopeWire = this.tube([[-0.95, 1.1, -0.85], [-0.8, 0.9, -0.45], [-0.62, 0.82, -0.12]], 0x2a2a2a);
    this.oxyClip = this.box(0.035, 0.028, 0.045, M(0x2f80ed, 0.4), -0.075, 0.075, 0.27, this.head);

    // ---- Perfusion
    const iv = new THREE.Group(); iv.position.set(-0.85, 0, 0.78); S.add(iv);
    this.cyl(0.013, 0.013, 1.9, metal, 0, 0.95, 0, iv);
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; RB(0.24, 0.025, 0.03, 0.01, dark, Math.cos(a) * 0.11, 0.035, Math.sin(a) * 0.11, iv).rotation.y = -a; }
    this.box(0.3, 0.012, 0.012, metal, 0, 1.88, 0, iv);
    this.ivBag = this.cap(0.055, 0.12, M(0xeaf4ff, 0.1, { transparent: true, opacity: 0.7 }), 0.12, 1.7, 0, iv); this.ivBag.scale.z = 0.45;
    this.cyl(0.012, 0.012, 0.06, plastic, 0, -0.13, 0, this.ivBag);
    RB(0.1, 0.16, 0.09, 0.02, M(0xf2f2f0, 0.4), 0, 1.15, 0.06, iv); this.box(0.06, 0.03, 0.005, M(0x111111, 0.2, { emissive: 0x1aa36b, emissiveIntensity: 0.6 }), 0, 1.19, 0.106, iv); // pompe
    this.tag(iv, 'iv');
    this.ivLine = this.tube([[-0.73, 1.55, 0.78], [-0.55, 1.0, 0.65], [-0.35, 0.72, 0.36], [-0.3, 0.68, 0.27]], 0xdcefff);
    this.urineBag = this.box(0.16, 0.22, 0.025, M(URINE.clair, 0.2, { transparent: true, opacity: 0.85 }), 0.55, 0.3, 0.5);
    // table de chevet + dossier
    RB(0.46, 0.64, 0.42, 0.02, M(0xffffff, 0.5, { map: woodTex }), 0.2, 0.32, -1.1); this.box(0.42, 0.008, 0.01, dark, 0.2, 0.46, -0.885);
    RB(0.24, 0.025, 0.32, 0.008, M(0x3d6fb5, 0.5), 0.2, 0.655, -1.1, S, 'dossier');
    this.cyl(0.035, 0.03, 0.1, M(0xffffff, 0.1, { transparent: true, opacity: 0.6 }), 0.36, 0.69, -1.0); this.cyl(0.03, 0.03, 0.2, M(0xbfe3ff, 0.1, { transparent: true, opacity: 0.6 }), 0.05, 0.74, -1.0);
    // chariot d'urgence
    const ch = new THREE.Group(); ch.position.set(2.45, 0, 0.55); ch.rotation.y = -Math.PI / 2; S.add(ch);
    RB(0.62, 0.92, 0.52, 0.03, M(0xc0392b, 0.4), 0, 0.54, 0, ch); for (let i = 0; i < 4; i++) RB(0.5, 0.025, 0.02, 0.008, M(0x7d1d14, 0.4), 0, 0.28 + i * 0.2, 0.265, ch);
    RB(0.32, 0.14, 0.26, 0.02, M(0xf1c40f, 0.4), 0, 1.07, 0, ch); this.box(0.2, 0.01, 0.15, M(0x1f2a35, 0.2), 0, 1.145, 0, ch);
    for (const [x, z] of [[-0.26, -0.2], [-0.26, 0.2], [0.26, -0.2], [0.26, 0.2]]) this.cyl(0.04, 0.04, 0.03, dark, x, 0.04, z, ch).rotation.x = Math.PI / 2;
    this.tag(ch, 'chariot');
    // chariot de soins
    const tr = new THREE.Group(); tr.position.set(0.95, 0, -1.08); S.add(tr);
    RB(1.0, 0.04, 0.56, 0.015, plastic, 0, 0.86, 0, tr); RB(1.0, 0.035, 0.56, 0.015, plastic, 0, 0.36, 0, tr);
    for (const [x, z] of [[-0.47, -0.25], [-0.47, 0.25], [0.47, -0.25], [0.47, 0.25]]) { this.cyl(0.013, 0.013, 0.86, metal, x, 0.43, z, tr); this.cyl(0.035, 0.035, 0.025, dark, x, 0.035, z, tr).rotation.x = Math.PI / 2; }
    const g = (pick, x, z, fn, y = 0.88) => { const o = new THREE.Group(); o.position.set(x, y, z); tr.add(o); fn(o); this.tag(o, pick); };
    g('sha', -0.4, -0.15, (o) => { this.cyl(0.035, 0.035, 0.18, M(0xdff2ff, 0.1, { transparent: true, opacity: 0.85 }), 0, 0.09, 0, o); this.cyl(0.02, 0.02, 0.04, M(0x2f80ed, 0.4), 0, 0.2, 0, o); this.box(0.04, 0.01, 0.01, M(0x2f80ed, 0.4), 0.025, 0.22, 0, o); });
    g('gants', -0.2, -0.15, (o) => { RB(0.2, 0.09, 0.11, 0.01, plastic, 0, 0.045, 0, o); this.box(0.08, 0.02, 0.06, M(0x7ab8ff, 0.6), 0, 0.095, 0, o); });
    g('tensio', 0.02, -0.13, (o) => { RB(0.13, 0.045, 0.1, 0.01, M(0x3a3f47, 0.4), 0, 0.022, 0, o); this.box(0.08, 0.005, 0.05, M(0x9ad7c8, 0.2), 0, 0.047, -0.01, o); RB(0.22, 0.02, 0.1, 0.008, M(0x2c4f7c, 0.8), 0.0, 0.01, 0.1, o); });
    g('thermo', 0.22, -0.15, (o) => { this.cap(0.018, 0.1, M(0xf5f5f5, 0.3), 0, 0.02, 0, o).rotation.x = Math.PI / 2; this.box(0.02, 0.005, 0.03, M(0x3fa7d6, 0.2), 0, 0.04, 0.01, o); });
    g('gluco', 0.38, -0.15, (o) => { RB(0.06, 0.02, 0.1, 0.006, M(0x4b4f58, 0.4), 0, 0.01, 0, o); this.box(0.045, 0.005, 0.045, M(0x9ad7c8, 0.2), 0, 0.022, -0.015, o); });
    g('steth', -0.37, 0.13, (o) => { const t = this.mesh(new THREE.TorusGeometry(0.07, 0.007, 6, 24), M(0x2b2b2b, 0.5), 0, 0.008, 0, o); t.rotation.x = Math.PI / 2; this.cyl(0.026, 0.026, 0.014, metal, 0.09, 0.008, 0.03, o); });
    g('oxy', -0.17, 0.13, (o) => { RB(0.05, 0.035, 0.07, 0.01, M(0x2f80ed, 0.4), 0, 0.018, 0, o); });
    g('kit', 0.06, 0.12, (o) => { RB(0.3, 0.02, 0.2, 0.006, M(0xcfd6dd, 0.4), 0, 0.01, 0, o); for (let i = 0; i < 3; i++) this.cyl(0.008, 0.008, 0.12, M(0xffffff, 0.2, { transparent: true, opacity: 0.8 }), -0.09 + i * 0.05, 0.03, 0, o).rotation.x = Math.PI / 2; this.box(0.07, 0.012, 0.07, M(0xffffff, 0.9), 0.09, 0.026, 0.03, o); this.cyl(0.02, 0.02, 0.012, M(0xffa62b, 0.4), 0.09, 0.03, -0.05, o); });
    g('pharma', 0.34, 0.12, (o) => { RB(0.22, 0.02, 0.16, 0.006, M(0xf0e6d2, 0.6), 0, 0.01, 0, o); [0xffffff, 0xe74c3c, 0xf1c40f, 0x7fdbca].forEach((c, i) => this.cyl(0.012, 0.012, 0.05, M(c, 0.3), -0.07 + i * 0.045, 0.045, 0, o)); });
    g('ecg', -0.22, 0, (o) => { RB(0.34, 0.1, 0.26, 0.015, M(0xe8e8e8, 0.4), 0, 0.05, 0, o); this.box(0.18, 0.005, 0.12, M(0x264653, 0.2), -0.04, 0.102, 0, o); }, 0.375);
    g('bladder', 0.22, 0, (o) => { RB(0.24, 0.12, 0.18, 0.015, M(0xf4f4f4, 0.4), 0, 0.06, 0, o); this.box(0.13, 0.005, 0.09, M(0x1e3a5f, 0.2), 0, 0.122, 0, o); this.cyl(0.02, 0.03, 0.12, grey, 0.16, 0.06, 0, o); }, 0.375);

    // ombres : tout projette/reçoit, sauf les objets transparents
    S.traverse((o) => { if (o.isMesh && !o.material.transparent && o !== floor) { o.castShadow = true; o.receiveShadow = true; } });
    floor.receiveShadow = true;
  }

  buildPatient() {
    const H = this.head; // repère du dossier du lit : x vers les pieds, y vers le haut (visage)
    this.skinMat = this.m(SKIN.normal);
    const gownTex = canvasTex(64, 64, (c) => { c.fillStyle = '#86aecf'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#6f97ba'; for (let y = 0; y < 64; y += 16) for (let x = 0; x < 64; x += 16) { c.beginPath(); c.arc(x + ((y / 16) % 2) * 8 + 4, y + 4, 2.2, 0, 7); c.fill(); } }, [4, 4]);
    this.gownMat = new THREE.MeshLambertMaterial({ map: gownTex });
    const P = (this.patient = new THREE.Group()); H.add(P);
    // tronc et épaules
    this.chest = this.cap(0.15, 0.36, this.gownMat, -0.36, 0.1, 0, P); this.chest.rotation.z = Math.PI / 2; this.chest.scale.set(0.68, 1, 1.22);
    for (const z of [-0.2, 0.2]) this.sph(0.075, this.gownMat, -0.6, 0.1, z, P).scale.set(1, 0.85, 1);
    this.cyl(0.048, 0.052, 0.1, this.skinMat, -0.7, 0.115, 0, P).rotation.z = Math.PI / 2;
    // bras le long du corps
    for (const sgn of [-1, 1]) {
      const z = sgn * 0.255;
      this.cap(0.047, 0.17, this.gownMat, -0.47, 0.075, z, P).rotation.z = Math.PI / 2;
      this.cap(0.04, 0.18, this.skinMat, -0.25, 0.06, z * 1.02, P).rotation.z = Math.PI / 2;
      this.sph(0.045, this.skinMat, -0.1, 0.05, z * 1.03, P).scale.set(1.5, 0.55, 0.95);
    }
    // tête
    const F = (this.face = new THREE.Group()); F.position.set(-0.835, 0.125, 0); P.add(F);
    this.sph(0.1, this.skinMat, 0, 0, 0, F, null, [32, 24]).scale.set(1.18, 1, 0.92);
    this.sph(0.06, this.skinMat, 0.06, -0.015, 0, F).scale.set(1, 0.9, 1.2); // mâchoire
    this.sph(0.103, 0x4a3a2e, -0.014, -0.017, 0, F, null, [32, 24]).scale.set(1.2, 1, 0.95); // cheveux (arrière du crâne)
    for (const z of [-0.093, 0.093]) this.sph(0.024, this.skinMat, 0.0, 0.0, z, F).scale.set(1.25, 1, 0.45); // oreilles
    this.eyeOpen = new THREE.Group(); this.eyeClosed = new THREE.Group(); F.add(this.eyeOpen, this.eyeClosed);
    this.brows = [];
    for (const z of [-0.036, 0.036]) {
      this.sph(0.017, 0xf7f4ef, -0.02, 0.09, z, this.eyeOpen, null, [14, 10]);
      this.sph(0.009, 0x4a3426, -0.02, 0.1, z, this.eyeOpen, null, [10, 8]);
      this.sph(0.0045, 0x0b0b0b, -0.02, 0.1075, z, this.eyeOpen, null, [8, 6]);
      this.sph(0.0182, this.skinMat, -0.02, 0.09, z, this.eyeClosed, null, [14, 10]);
      this.box(0.003, 0.003, 0.03, 0x3a2a22, -0.016, 0.107, z, this.eyeClosed);
      const b = this.box(0.009, 0.007, 0.038, 0x3a2a22, -0.05, 0.1, z, F); b.userData.z = z; this.brows.push(b);
    }
    this.mesh(new THREE.ConeGeometry(0.018, 0.05, 12), this.skinMat, 0.015, 0.115, 0, F).rotation.z = -0.25;
    this.lipMat = this.m(LIPS.normal);
    this.mouth = this.cap(0.008, 0.026, this.lipMat, 0.06, 0.087, 0, F); this.mouth.rotation.x = Math.PI / 2;
    this.sweat = new THREE.Group(); F.add(this.sweat);
    const dropM = this.m(0xd6efff, { transparent: true, opacity: 0.85, emissive: 0x223344 });
    for (const [x, z] of [[-0.075, -0.045], [-0.07, 0.03], [-0.09, -0.005], [-0.06, 0.06], [-0.065, -0.07]]) this.sph(0.007, dropM, x, 0.083, z, this.sweat, null, [8, 6]);
    this.tag(P, 'patient');
    this.blanket = this.buildBlanket(); this.tag(this.blanket, 'patient');
    this.bloodStain = this.box(0.26, 0.004, 0.2, 0x8e1b1b, -0.02, 0.765, 0.2);
  }

  // Drap qui épouse la forme des jambes (géométrie déformée puis lissée)
  buildBlanket(opt = {}) {
    const footX = opt.footX ?? 0.88; const legZ = opt.legZ ?? 0.1; const lift = opt.lift ?? 0;
    const L = 1.3, W = 1.06, nx = 60, nz = 40, cx = 0.39;
    const geo = new THREE.PlaneGeometry(L, W, nx, nz); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position; const hg = new Float32Array(pos.count);
    const leg = (wx, z, zc) => {
      const t = Math.min(1, Math.max(0, (wx + 0.25) / (footX + 0.25))); const r = 0.115 - 0.06 * t; const dz = z - zc;
      let h = wx < footX + 0.04 && dz * dz < r * r ? r + Math.sqrt(r * r - dz * dz) : 0;
      const fx = (wx - (footX - 0.1)) / 0.2; const fr = 0.075;
      if (fx > 0 && fx < 1 && Math.abs(dz) < fr) h = Math.max(h, 0.1 * Math.sqrt(1 - (dz / fr) ** 2) * Math.sin(fx * Math.PI) + 0.05);
      return h;
    };
    for (let i = 0; i < pos.count; i++) {
      const wx = pos.getX(i) + cx, z = pos.getZ(i);
      let h = Math.max(leg(wx, z, -legZ), leg(wx, z, legZ));
      if (wx < 0.05) { const w = 0.21; if (Math.abs(z) < w) h = Math.max(h, 0.2 * Math.sqrt(1 - (z / w) ** 2)); }
      hg[i] = h + lift;
    }
    const idx = (ix, iz) => iz * (nx + 1) + ix;
    for (let pass = 0; pass < 5; pass++) {
      const cp = hg.slice();
      for (let iz = 1; iz < nz; iz++) for (let ix = 1; ix < nx; ix++) hg[idx(ix, iz)] = Math.max(cp[idx(ix, iz)] * 0.7, (cp[idx(ix - 1, iz)] + cp[idx(ix + 1, iz)] + cp[idx(ix, iz - 1)] + cp[idx(ix, iz + 1)] + cp[idx(ix, iz)] * 2) / 6);
    }
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i), x = pos.getX(i); let y = hg[i] + 0.012;
      const edge = Math.abs(z) - 0.47; if (edge > 0) y -= edge * 3.2;
      if (x > L / 2 - 0.05) y -= (x - (L / 2 - 0.05)) * 3;
      y += Math.sin(x * 23 + z * 7) * 0.003;
      pos.setY(i, y);
    }
    geo.computeVertexNormals();
    const tex = canvasTex(128, 128, (c) => { c.fillStyle = '#6d8db0'; c.fillRect(0, 0, 128, 128); c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 2; for (let i = 0; i < 128; i += 8) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 128); c.stroke(); } }, [6, 4]);
    const blTex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#8fb0c9'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1; for (let i = 0; i < w; i += 4) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }, [8, 6]);
    const mesh = this.mesh(geo, new THREE.MeshStandardMaterial({ map: blTex, roughness: 0.95, side: THREE.DoubleSide }), cx, 0.6, 0);
    mesh.castShadow = mesh.receiveShadow = true;
    // revers du drap blanc au bord supérieur
    const fold = this.mesh(new THREE.CapsuleGeometry(0.03, 0.3, 4, 8), 0xf4f5f6, cx - L / 2 + 0.03, 0.6 + (hg[idx(1, nz / 2)] || 0.15) + 0.01, 0, mesh.parent);
    fold.rotation.x = Math.PI / 2; fold.scale.set(1, 2.6, 0.5); mesh.userData.fold = fold;
    return mesh;
  }

  tube(points, color) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return this.mesh(new THREE.TubeGeometry(curve, 32, 0.0055, 6), color);
  }
  bindPick() {
    const el = this.renderer.domElement; let down = null;
    el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    el.addEventListener('pointerup', (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;
      const rect = el.getBoundingClientRect();
      const v = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      const ray = new THREE.Raycaster(); ray.setFromCamera(v, this.camera);
      const visible = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
      const hit = ray.intersectObjects(this.pickables.filter(visible), false)[0];
      if (hit) { this.flash(hit.object.userData.pick); this.onPick(hit.object.userData.pick); }
    });
  }
  flash(pick) {
    const meshes = this.pickables.filter((o) => o.userData.pick === pick && o.material.emissive);
    const prev = meshes.map((o) => o.material.emissive.getHex());
    meshes.forEach((o) => o.material.emissive.setHex(0x2f5f58)); this.render();
    setTimeout(() => { meshes.forEach((o, i) => o.material.emissive.setHex(prev[i])); this.render(); }, 220);
  }
  // Remplace le mannequin simplifié par un humain réaliste (chargé à la demande)
  async loadPatient(id) {
    const { Avatar } = await import('./avatar.js');
    const av = await Avatar.load(id);
    if (this.disposed) { av.dispose(); return; }
    this.avatar = av; this.scene.add(av.root);
    this.patient.visible = false;
    av.root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    av.root.traverse((o) => { if (o.isMesh) { o.userData.pick = 'patient'; this.pickables.push(o); } });
    // oxygène : repère visage (x vers le menton, y sortant du visage)
    const f = new THREE.Group(); av.anchor.add(f);
    f.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(-1, 0, 0)));
    f.position.set(0, 0.068, 0.012);
    f.add(this.lunettes, this.masque); this.lunettes.scale.setScalar(0.95); this.masque.scale.setScalar(0.85);
    this._posed = null; this.update(this.state);
    // drap ajusté à la morphologie (position des pieds et des jambes)
    const B = av.bones; const fp = (B['L Foot'] || B['R Foot'])?.getWorldPosition(new THREE.Vector3());
    const lz = B['L Thigh'] && B['R Thigh'] ? Math.abs(B['L Thigh'].getWorldPosition(new THREE.Vector3()).z - B['R Thigh'].getWorldPosition(new THREE.Vector3()).z) / 2 + 0.02 : 0.1;
    const old = this.blanket; this.scene.remove(old); if (old.userData.fold) this.scene.remove(old.userData.fold);
    this.pickables = this.pickables.filter((o) => o !== old);
    this.blanket = this.buildBlanket({ footX: fp ? fp.x : 0.88, legZ: lz, lift: 0.03 }); this.tag(this.blanket, 'patient');
    this.render();
  }
  update(s) {
    this.state = s;
    const ang = { plat: 0.08, demi: 0.62, assis: 1.0 }[s.position] ?? 0.08;
    this.head.rotation.z = -ang;
    if (this.avatar) {
      if (this._posed !== ang) { this.avatar.pose(ang, { hipX: -0.2, top: 0.6 }); this.keepHeadOffBoard(); this._posed = ang; this.fitPillow(); }
      this.avatar.express(s);
    }
    this.renderer.shadowMap.needsUpdate = true;
    let skin = s.skin || 'normal'; if ((s.spo2 < 85 || s.acr) && skin !== 'yellow') skin = 'cyan';
    this.skinMat.color.setHex(SKIN[skin] || SKIN.normal);
    this.lipMat.color.setHex(s.spo2 < 88 || s.acr ? LIPS.cyan : LIPS[skin] || LIPS.normal);
    const closed = s.eyes === 'closed' || s.gcs <= 8 || s.acr;
    this.eyeOpen.visible = !closed; this.eyeClosed.visible = closed;
    const pain = !closed && (s.eva >= 6 || s.fr >= 28);
    this.brows.forEach((b) => { b.rotation.y = pain ? Math.sign(b.userData.z) * 0.35 : 0; b.position.x = pain ? -0.046 : -0.05; });
    this.mouth.scale.set(1, pain || s.fr > 26 ? 1.9 : 1, 1);
    this.sweat.visible = !!s.sweat;
    this.lunettes.visible = s.o2 === 'lunettes'; this.masque.visible = s.o2 === 'masque';
    this.ivBag.visible = this.ivLine.visible = !!s.iv;
    this.scopeWire.visible = this.oxyClip.visible = !!s.scope;
    this.urineBag.visible = !!s.sonde; this.urineBag.material.color.setHex(URINE[s.urine] || URINE.clair);
    this.bloodStain.visible = !!s.blood;
    this.drawMonitor(this.phase || 0); this.render();
  }
  // empêche le crâne de traverser la tête de lit (patients de grande taille)
  keepHeadOffBoard() {
    const av = this.avatar; av.root.updateWorldMatrix(true, true); this.head.updateWorldMatrix(true, true);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(av.anchor.getWorldQuaternion(new THREE.Quaternion())).normalize();
    const crown = av.bones.Head.getWorldPosition(new THREE.Vector3()).addScaledVector(up, 0.24);
    const loc = this.head.worldToLocal(crown.clone());
    const limit = -0.8; // face intérieure de la tête de lit = -0.86
    if (loc.x < limit) {
      const dirX = new THREE.Vector3(1, 0, 0).transformDirection(this.head.matrixWorld);
      av.root.position.addScaledVector(dirX, limit - loc.x); av.root.position.y = Math.max(av.root.position.y, av.root.position.y);
      av.root.updateWorldMatrix(true, true);
    }
  }
  // place l'oreiller exactement sous l'arrière du crâne du personnage
  fitPillow() {
    const av = this.avatar; if (!av) return;
    this.head.updateWorldMatrix(true, true); av.root.updateWorldMatrix(true, true);
    const hp = av.bones.Head.getWorldPosition(new THREE.Vector3());
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(av.anchor.getWorldQuaternion(new THREE.Quaternion())).normalize();
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(av.anchor.getWorldQuaternion(new THREE.Quaternion())).normalize();
    const back = hp.clone().addScaledVector(up, 0.07).addScaledVector(fwd, -0.085);
    const c = back.clone().addScaledVector(fwd, -0.06);
    this.pillow.position.copy(this.head.worldToLocal(c));
  }
  drawMonitor(phase = 0) {
    const s = this.state || {}; const c = this.monCanvas.getContext('2d'); const W = 512, H = 336;
    c.fillStyle = '#04070a'; c.fillRect(0, 0, W, H);
    if (!s.scope) { c.fillStyle = '#39414b'; c.font = '600 24px -apple-system, system-ui, sans-serif'; c.fillText('Scope non connecté', 140, 175); this.monTex.needsUpdate = true; return; }
    const r = Math.round; const fc = r(s.fc);
    c.strokeStyle = 'rgba(255,255,255,.05)'; c.lineWidth = 1; for (let y = 110; y < 300; y += 95) { c.beginPath(); c.moveTo(0, y); c.lineTo(340, y); c.stroke(); }
    const period = fc > 0 ? Math.max(26, (60 / fc) * 120) : 1e9;
    const sweep = (col, w, fy) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); for (let x = 0; x < 330; x++) { const y = fy(x); x ? c.lineTo(x + 10, y) : c.moveTo(10, y); } c.stroke(); };
    sweep('#3ef08a', 3, (x) => {
      if (s.acr) return 70 + Math.sin((x + phase) * 0.35) * 14 * Math.sin((x + phase) * 0.05);
      const p = ((x + phase) % period) / period; let y = 70;
      if (p > 0.1 && p < 0.16) y -= Math.sin(((p - 0.1) / 0.06) * Math.PI) * 8;
      else if (p > 0.22 && p < 0.25) y += 8; else if (p >= 0.25 && p < 0.29) y -= 55; else if (p >= 0.29 && p < 0.32) y += 14;
      else if (p > 0.45 && p < 0.58) y -= Math.sin(((p - 0.45) / 0.13) * Math.PI) * 12;
      return y;
    });
    sweep('#41c7ff', 2.5, (x) => { const p = ((x + phase + 20) % period) / period; return 180 - (s.acr ? 0 : Math.max(0, Math.sin(p * Math.PI * 2)) * 26 + Math.max(0, Math.sin(p * Math.PI * 4 - 1)) * 6); });
    const fr = Math.max(1, s.fr || 1); sweep('#ffd34d', 2, (x) => 270 - (s.acr ? 0 : Math.sin(((x + phase) / 330) * Math.PI * 2 * (fr / 6)) * 16));
    const val = (txt, x, y, col, size = 54) => { c.fillStyle = col; c.font = `700 ${size}px -apple-system, system-ui, sans-serif`; c.fillText(txt, x, y); };
    const lab = (txt, x, y, col) => { c.fillStyle = col; c.font = '600 16px -apple-system, system-ui, sans-serif'; c.fillText(txt, x, y); };
    const alarm = (v, lo, hi) => (v < lo || v > hi ? '#ff5a5a' : null);
    lab('FC', 360, 30, '#3ef08a'); val(s.acr ? '---' : String(fc), 360, 84, alarm(fc, 50, 120) || '#3ef08a');
    lab('SpO₂ %', 360, 120, '#41c7ff'); val(s.acr ? '---' : String(r(s.spo2)), 360, 172, alarm(s.spo2, 90, 101) || '#41c7ff');
    lab('FR', 360, 212, '#ffd34d'); val(s.acr ? '0' : String(r(s.fr)), 360, 262, alarm(s.fr, 10, 25) || '#ffd34d', 44);
    lab('PNI', 20, 318, '#e8e8e8'); val(s.acr ? '---/---' : `${r(s.pas)}/${r(s.pad)}`, 70, 322, alarm(s.pas, 90, 180) || '#e8e8e8', 30);
    this.monTex.needsUpdate = true;
  }
  // Respiration + scope ≈10 i/s si animations activées (sinon scope à 1 i/s). Pause si l'app est masquée.
  startMonitor() {
    this.stopMonitor(); this.phase = 0; let tick = 0; const t0 = performance.now();
    const fps = this.animate ? 10 : 1;
    this.timer = setInterval(() => {
      if (document.hidden || this.disposed) return;
      tick++; const s = this.state;
      if (this.animate && this.avatar) { const t = (performance.now() - t0) / 1000; this.avatar.tick(1 / fps, t, s); }
      else if (this.animate && !s.acr) {
        const t = (performance.now() - t0) / 1000; const fr = Math.max(4, s.fr || 16);
        const b = Math.sin(t * Math.PI * 2 * (fr / 60));
        this.chest.scale.x = 0.68 + b * 0.03; this.chest.position.y = 0.1 + b * 0.005;
      }
      if (s.scope && (!this.animate || tick % 2 === 0)) { this.phase += this.animate ? 18 : 37; this.drawMonitor(this.phase); }
      if (this.animate || s.scope) this.render();
    }, 1000 / fps);
  }
  stopMonitor() { clearInterval(this.timer); }
  view(name) {
    if (name === 'patient') {
      const ref = this.avatar ? this.avatar.anchor.children[0] : this.face;
      const p = new THREE.Vector3(); ref.getWorldPosition(p);
      const n = new THREE.Vector3(0.35, 1, 0.55).applyQuaternion(ref.getWorldQuaternion(new THREE.Quaternion())).normalize();
      this.camera.position.copy(p).addScaledVector(n, 0.55); this.controls.target.copy(p); this.controls.update(); this.render(); return;
    }
    const V = { room: [[2.5, 1.75, 3.0], [-0.35, 0.85, -0.25]], patient: [[-0.35, 1.45, 0.9], [-0.85, 0.82, 0]], scope: [[-0.2, 1.4, 0.4], [-1.05, 1.25, -0.95]], chariot: [[1.0, 1.55, -0.1], [0.95, 0.85, -1.08]] }[name];
    if (!V) return; this.camera.position.set(...V[0]); this.controls.target.set(...V[1]); this.controls.update(); this.render();
  }
  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight; if (!w || !h) return;
    this.renderer.setSize(w, h, false); this.renderer.domElement.style.width = '100%'; this.renderer.domElement.style.height = '100%';
    this.camera.aspect = w / h; this.camera.fov = w / h < 1 ? 64 : 52; this.camera.updateProjectionMatrix(); this.render();
  }
  render() { if (!this.disposed) this.renderer.render(this.scene, this.camera); }
  dispose() {
    this.avatar?.dispose();
    this.disposed = true; this.stopMonitor(); this.ro.disconnect(); this.controls.dispose();
    this.scene.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.map?.dispose(); o.material.dispose(); } });
    this.renderer.dispose(); this.renderer.domElement.remove();
  }
}
