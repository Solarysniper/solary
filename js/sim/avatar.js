// Patient humain réaliste (avatars Microsoft Rocketbox, licence MIT) : chargement, pose couchée, expressions.
import * as THREE from 'three';
import { GLTFLoader } from '../../vendor/loaders/GLTFLoader.js';

// Catalogue : identifiant de fichier, sexe, tranche d'âge apparente
export const AVATARS = [
  ['Female_Adult_01', 'F', 'jeune'],
  ['Female_Adult_02', 'F', 'âgé'],
  ['Female_Adult_03', 'F', 'jeune'],
  ['Female_Adult_04', 'F', 'jeune'],
  ['Female_Adult_05', 'F', 'jeune'],
  ['Female_Adult_07', 'F', 'adulte'],
  ['Female_Adult_08', 'F', 'jeune'],
  ['Female_Adult_09', 'F', 'adulte'],
  ['Female_Adult_11', 'F', 'adulte'],
  ['Female_Adult_12', 'F', 'jeune'],
  ['Female_Adult_13', 'F', 'jeune'],
  ['Female_Adult_14', 'F', 'adulte'],
  ['Female_Adult_15', 'F', 'adulte'],
  ['Female_Adult_17', 'F', 'jeune'],
  ['Male_Adult_01', 'M', 'jeune'],
  ['Male_Adult_02', 'M', 'jeune'],
  ['Male_Adult_03', 'M', 'âgé'],
  ['Male_Adult_04', 'M', 'jeune'],
  ['Male_Adult_05', 'M', 'âgé'],
  ['Male_Adult_06', 'M', 'jeune'],
  ['Male_Adult_07', 'M', 'adulte'],
  ['Male_Adult_08', 'M', 'adulte'],
  ['Male_Adult_09', 'M', 'adulte'],
  ['Male_Adult_10', 'M', 'jeune'],
  ['Male_Adult_11', 'M', 'jeune'],
  ['Male_Adult_12', 'M', 'adulte'],
  ['Male_Adult_13', 'M', 'adulte'],
  ['Male_Adult_14', 'M', 'âgé'],
  ['Male_Adult_16', 'M', 'jeune'],
  ['Male_Adult_20', 'M', 'adulte'],
];
export const avatarUrl = (id) => new URL(`../../patients/${id}.glb`, import.meta.url).href;

// Choix déterministe d'un avatar selon le sexe et l'âge du patient
export function pickAvatar(sex, age, seed = 0) {
  const band = age >= 70 ? 'âgé' : age >= 40 ? 'adulte' : 'jeune';
  const pool = AVATARS.filter((a) => a[1] === sex);
  const best = pool.filter((a) => a[2] === band);
  const near = pool.filter((a) => (band === 'âgé' ? a[2] !== 'jeune' : band === 'jeune' ? a[2] !== 'âgé' : true));
  const list = best.length >= 2 ? best : near.length ? near : pool;
  return list[Math.abs(seed) % list.length][0];
}

const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), q1 = new THREE.Quaternion(), q2 = new THREE.Quaternion(), q3 = new THREE.Quaternion();
// Oriente un os pour que le segment os → enfant pointe dans la direction monde demandée
function aim(bone, child, dir) {
  bone.updateWorldMatrix(true, true);
  bone.getWorldPosition(v1); child.getWorldPosition(v2);
  const cur = v2.sub(v1).normalize();
  q1.setFromUnitVectors(cur, dir.clone().normalize());
  bone.getWorldQuaternion(q2); bone.parent.getWorldQuaternion(q3);
  bone.quaternion.copy(q3.invert().multiply(q1.multiply(q2)));
  bone.updateWorldMatrix(false, true);
}

export class Avatar {
  static async load(id) {
    const gltf = await new GLTFLoader().loadAsync(avatarUrl(id));
    return new Avatar(gltf.scene);
  }
  constructor(root) {
    this.root = new THREE.Group(); this.model = root; this.root.add(root);
    this.bones = {}; this.meshes = []; this.morph = [];
    root.traverse((o) => {
      if (o.isBone) this.bones[o.name.replace(/^Bip01[ _]?/, '').replace(/_/g, ' ')] = o;
      if (o.isSkinnedMesh || o.isMesh) {
        o.frustumCulled = false; this.meshes.push(o);
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => { if (/head/i.test(m.name)) this.headMat = m; if (/body/i.test(m.name)) this.bodyMat = m; m.roughness = 0.78; m.metalness = 0; });
        if (o.morphTargetDictionary) this.morph.push(o);
      }
    });
    // échelle : modèle en centimètres → mètres
    root.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(root); const h = box.max.y - box.min.y;
    this.height = h > 10 ? h / 100 : h; root.scale.multiplyScalar(h > 10 ? 0.01 : 1);
    // repère du visage dans l'os de la tête (au repos : debout, visage vers +z)
    root.updateWorldMatrix(true, true);
    const head = this.bones.Head;
    const hq = head.getWorldQuaternion(new THREE.Quaternion()).invert();
    this.faceFwd = new THREE.Vector3(0, 0, 1).applyQuaternion(hq);
    this.faceUp = new THREE.Vector3(0, 1, 0).applyQuaternion(hq);
    this.anchor = new THREE.Group(); head.add(this.anchor);
    const m = new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(this.faceUp, this.faceFwd), this.faceUp, this.faceFwd);
    this.anchor.quaternion.setFromRotationMatrix(m);
    const ws = head.getWorldScale(new THREE.Vector3()).x; this.anchor.scale.setScalar(1 / ws);
    this.expr = {}; this.blinkT = 0; this.nextBlink = 2 + Math.random() * 3;
  }
  // Pose couchée dans le lit ; angle = inclinaison du dossier (radians)
  pose(angle, bed) {
    const B = this.bones; const R = this.root;
    // allongé : tête vers -x, visage vers +y
    const mb = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -1), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0));
    R.quaternion.setFromRotationMatrix(mb); R.position.set(0, 0, 0); R.updateWorldMatrix(true, true);
    const up = new THREE.Vector3(-Math.cos(angle), Math.sin(angle), 0);
    const feet = new THREE.Vector3(1, -0.02, 0);
    // tronc : dossier relevé
    if (B.Spine && B.Neck) aim(B.Spine, B['Spine2'] || B.Neck, up);
    if (B['Spine2'] && B.Neck) aim(B['Spine2'], B.Neck, up);
    if (B.Neck && B.Head) aim(B.Neck, B.Head, up.clone().add(new THREE.Vector3(0.15, 0.05, 0)));
    // jambes tendues
    for (const s of ['L', 'R']) {
      const th = B[`${s} Thigh`], ca = B[`${s} Calf`], fo = B[`${s} Foot`], toe = B[`${s} Toe0`];
      const out = s === 'L' ? 0.06 : -0.06;
      if (th && ca) aim(th, ca, new THREE.Vector3(1, -0.03, out));
      if (ca && fo) aim(ca, fo, new THREE.Vector3(1, -0.02, out * 0.5));
      if (fo && toe) aim(fo, toe, new THREE.Vector3(1.3, 1, 0));
      if (fo) fo.scale.setScalar(0.02); // pieds cachés sous le drap (évite que les chaussures le traversent)
    }
    // bras le long du corps, mains posées sur le ventre / le drap
    const torsoDown = new THREE.Vector3(Math.cos(angle), -Math.sin(angle), 0);
    for (const s of ['L', 'R']) {
      const ua = B[`${s} UpperArm`], fa = B[`${s} Forearm`], ha = B[`${s} Hand`];
      const side = (s === 'L' ? 1 : -1) * this._sideSign();
      if (ua && fa) aim(ua, fa, torsoDown.clone().add(new THREE.Vector3(0, -0.12, 0.2 * side)));
      if (fa && ha) aim(fa, ha, new THREE.Vector3(1, 0.12, 0.05 * side));
    }
    // placement : bassin sur le matelas, tête sur l'oreiller
    R.updateWorldMatrix(true, true);
    const pelvis = (B.Pelvis || B.Spine).getWorldPosition(new THREE.Vector3());
    R.position.set(bed.hipX - pelvis.x, bed.top + 0.085 - pelvis.y, -pelvis.z);
    R.updateWorldMatrix(true, true);
    this.baseSpine = B['Spine1']?.quaternion.clone();
  }
  _sideSign() {
    // détermine quel côté est « gauche » une fois couché (z monde)
    if (this._side) return this._side;
    const l = this.bones['L UpperArm'], r = this.bones['R UpperArm'];
    if (!l || !r) return (this._side = 1);
    this.root.updateWorldMatrix(true, true);
    return (this._side = l.getWorldPosition(new THREE.Vector3()).z > r.getWorldPosition(new THREE.Vector3()).z ? 1 : -1);
  }
  setMorph(name, v) { for (const m of this.morph) { const i = m.morphTargetDictionary[name]; if (i !== undefined) m.morphTargetInfluences[i] = v; } }
  // Expressions selon l'état clinique
  express(s) {
    this._lastState = s;
    const closed = s.eyes === 'closed' || s.gcs <= 8 || s.acr;
    const drowsy = !closed && s.gcs <= 12;
    const pain = !closed && (s.eva >= 6);
    const dysp = !closed && s.fr >= 26;
    const anx = !closed && (s.fc >= 115 || s.skin === 'red');
    this.expr = { closed, drowsy, pain, dysp, anx };
    const e = { AK_09_EyeBlinkLeft: closed ? 1 : 0, AK_10_EyeBlinkRight: closed ? 1 : 0, AU_41_LidDroop: drowsy ? 0.7 : 0,
      AK_01_BrowDownLeft: pain ? 0.7 : 0, AK_02_BrowDownRight: pain ? 0.7 : 0, AK_03_BrowInnerUp: pain || anx ? 0.6 : 0,
      AK_19_EyeSquintLeft: pain ? 0.5 : 0, AK_20_EyeSquintRight: pain ? 0.5 : 0, AK_46_MouthStretchLeft: pain ? 0.35 : 0, AK_47_MouthStretchRight: pain ? 0.35 : 0,
      AK_30_MouthFrownLeft: pain || anx ? 0.4 : 0, AK_31_MouthFrownRight: pain || anx ? 0.4 : 0, AK_21_EyeWideLeft: anx && !pain ? 0.35 : 0, AK_22_EyeWideRight: anx && !pain ? 0.35 : 0,
      AK_25_JawOpen: closed && s.fr < 10 ? 0.15 : dysp ? 0.22 : 0, AU_25_LipsPart: dysp || closed ? 0.5 : 0 };
    for (const [k, v] of Object.entries(e)) this.setMorph(k, v);
    // teint
    const tint = { normal: 0xffffff, pale: 0xfff4f0, cyan: 0xd2dcff, red: 0xffd8d0, grey: 0xe6e3e0, yellow: 0xfff0b8 };
    let skin = s.skin || 'normal'; if ((s.spo2 < 85 || s.acr) && skin !== 'yellow') skin = 'cyan';
    if (this.headMat) { this.headMat.color.setHex(tint[skin] || 0xffffff); this.headMat.emissive?.setHex(skin === 'pale' ? 0x1a1a1a : 0); this.headMat.roughness = s.sweat ? 0.32 : 0.78; }
  }
  // Animation légère : respiration (rotation discrète du thorax) et clignements
  tick(dt, t, s) {
    const B = this.bones; this.react(t);
    if (this.baseSpine && B['Spine1'] && !s.acr) {
      const fr = Math.max(4, s.fr || 16); const b = Math.sin(t * Math.PI * 2 * (fr / 60)) * (s.fr > 25 ? 0.035 : 0.02);
      B['Spine1'].quaternion.copy(this.baseSpine).multiply(q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), b));
    }
    if (!this.expr.closed) {
      this.blinkT += dt;
      const lid = this.expr.drowsy ? 0.7 : 0;
      if (this.blinkT > this.nextBlink) { const k = this.blinkT - this.nextBlink; const v = k < 0.08 ? k / 0.08 : k < 0.16 ? 1 - (k - 0.08) / 0.08 : 0; this.setMorph('AK_09_EyeBlinkLeft', Math.max(v, 0)); this.setMorph('AK_10_EyeBlinkRight', Math.max(v, 0)); if (k > 0.2) { this.blinkT = 0; this.nextBlink = 2.5 + Math.random() * 4; } }
      else this.setMorph('AU_41_LidDroop', lid);
      if (this.expr.dysp) { const j = 0.15 + (Math.sin(t * Math.PI * 2 * ((s.fr || 20) / 60)) + 1) * 0.08; this.setMorph('AK_25_JawOpen', j); }
    }
  }
  // Réactions : grimace brève (piqûre), parole (mouvements de bouche, tête vers le soignant)
  flinch() { this._flinch = performance.now(); }
  talk(ms = 1500) { this._talk = performance.now() + ms; }
  react(t) {
    const now = performance.now();
    if (this._flinch && now - this._flinch < 900) { const k = 1 - (now - this._flinch) / 900; this.setMorph('AK_01_BrowDownLeft', 0.9 * k); this.setMorph('AK_02_BrowDownRight', 0.9 * k); this.setMorph('AK_19_EyeSquintLeft', k); this.setMorph('AK_20_EyeSquintRight', k); this.setMorph('AK_46_MouthStretchLeft', 0.6 * k); this.setMorph('AK_47_MouthStretchRight', 0.6 * k); }
    else if (this._flinch) { this._flinch = 0; this.express(this._lastState || {}); }
    if (this._talk && now < this._talk && !this.expr.closed) { this.setMorph('AK_25_JawOpen', 0.12 + Math.abs(Math.sin(t * 13)) * 0.18); this.setMorph('AU_25_LipsPart', 0.6); }
    else if (this._talk) { this._talk = 0; this.express(this._lastState || {}); }
  }
  dispose() { this.root.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.map?.dispose(); m.dispose(); }); } }); }
}
