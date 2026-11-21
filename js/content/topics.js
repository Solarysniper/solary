// Index des catégories (sujets) recherchables. Les mots-clés servent au filtrage plein texte.
import { THEMES } from './themes.js';
import { DRUGS } from './drugs.js';
import { NORMS, VOCAB } from './norms.js';

export const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ');

// [nom, thème, mots-clés]
const PATHO = [
  ['Diabète', 'endoc', 'diabet glycemi insulin hba1c hypoglyc hyperglyc acidocetose metformine'],
  ['Hypoglycémie', 'endoc', 'hypoglyc resucrage glucagon g30'],
  ['Acidocétose diabétique', 'endoc', 'acidocetose cetonemi kussmaul'],
  ['Pied diabétique', 'endoc', 'pied diabet mal perforant neuropathie'],
  ['Insulinothérapie', 'endoc', 'insulin lipodystroph stylo'],
  ['Thyroïde', 'endoc', 'thyro tsh levothyrox hypothyro hyperthyro'],
  ['Corticothérapie', 'endoc', 'cortico prednisol solumedrol'],
  ['Infarctus du myocarde / SCA', 'cardio', 'infarctus sca troponine sus-decalage coronar angor douleur thoracique'],
  ['Angor', 'cardio', 'angor trinitrine'],
  ['Insuffisance cardiaque', 'cardio', 'insuffisance cardiaque oap orthopnee bnp oedeme'],
  ['Œdème aigu du poumon', 'cardio', 'oap crepitants orthopnee furosemide'],
  ['Hypertension artérielle', 'cardio', 'hypertension hta pression arterielle antihypertenseur iec sartan'],
  ['Fibrillation atriale', 'cardio', 'fibrillation atriale fa cha2ds2'],
  ['Troubles du rythme', 'cardio', 'rythme arythmie fibrillation tachycardie bradycardie amiodarone digoxine'],
  ['Phlébite / thrombose veineuse', 'cardio', 'phlebite thrombose tvp d-dimeres'],
  ['Embolie pulmonaire', 'pneumo', 'embolie pulmonaire d-dimeres'],
  ['Anticoagulants', 'pharma', 'anticoagul heparine hbpm avk inr aod tih protamine'],
  ['Antiagrégants', 'pharma', 'antiagreg aspirine kardegic clopidogrel'],
  ['Choc (états de choc)', 'urg', 'choc hypotension marbrures lactates'],
  ['Choc anaphylactique', 'urg', 'anaphyla adrenaline urticaire allergi'],
  ['Choc septique / sepsis', 'urg', 'sepsis septique hemoculture qsofa'],
  ['Choc hémorragique', 'urg', 'hemorrag saignement transfusion choc hypovolem'],
  ['Arrêt cardio-respiratoire', 'urg', 'arret cardi acr massage compression defibrill dae'],
  ['Premiers secours', 'urg', 'pls alerte 112 15 secours'],
  ['Intoxications', 'urg', 'intoxication antidote surdosage naloxone flumazenil acetylcysteine'],
  ['Asthme', 'pneumo', 'asthme salbutamol sibilants dep'],
  ['BPCO', 'pneumo', 'bpco hypercapn tabagisme 88'],
  ['Oxygénothérapie', 'pneumo', 'oxygen o2 lunettes masque haute concentration spo2'],
  ['Pneumopathie', 'pneumo', 'pneumopathie pneumonie expectoration'],
  ['Gaz du sang', 'pneumo', 'gaz du sang pao2 paco2 ph acidose alcalose bicarbonate'],
  ['Tuberculose', 'hyg', 'tuberculose ffp2 bk'],
  ['AVC', 'neuro', 'avc vite hemiplegi aphasie thrombolyse'],
  ['Score de Glasgow / coma', 'neuro', 'glasgow coma conscience'],
  ['Épilepsie / convulsions', 'neuro', 'epilep convuls crise etat de mal'],
  ['Traumatisme crânien', 'neuro', 'traumatisme cranien mydriase engagement'],
  ['Maladie de Parkinson', 'neuro', 'parkinson levodopa'],
  ['Maladie d’Alzheimer / démences', 'geria', 'alzheimer demence mmse cogniti'],
  ['Insuffisance rénale', 'nephro', 'insuffisance renale creatinine dialyse fav hyperkali'],
  ['Infection urinaire / pyélonéphrite', 'nephro', 'urinaire pyelonephrite ecbu cystite'],
  ['Globe vésical / rétention', 'nephro', 'globe vesical retention bladder sondage'],
  ['Sondage urinaire', 'nephro', 'sondage sonde urinaire'],
  ['Troubles ioniques', 'bio', 'kaliemie natremie calcemie hypokali hyperkali hyponatr ionogramme'],
  ['Hémostase / coagulation', 'bio', 'hemostase tp tca inr fibrinogene plaquettes'],
  ['NFS / hématologie', 'bio', 'nfs hemoglobine anemie leucocytes plaquettes neutrop'],
  ['Prélèvements sanguins', 'bio', 'prelevement tube edta citrate hemoculture'],
  ['Hémorragie digestive', 'dig', 'hematemese melena rectorragie hemorragie digestive'],
  ['Occlusion intestinale', 'dig', 'occlusion arret des matieres sng'],
  ['Appendicite / abdomen aigu', 'dig', 'appendic fosse iliaque mcburney'],
  ['Pancréatite', 'dig', 'pancreatite lipase'],
  ['Stomies', 'dig', 'stomie colostomie ileostomie'],
  ['Cirrhose / hépatologie', 'dig', 'cirrhose ascite ictere bilirubine hepat'],
  ['Nutrition / dénutrition', 'geria', 'denutrition mna albumin nutrition imc'],
  ['Chutes de la personne âgée', 'geria', 'chute timed up and go'],
  ['Confusion du sujet âgé', 'geria', 'confusion syndrome confusionnel'],
  ['Iatrogénie', 'geria', 'iatrogen polymedication'],
  ['Pédiatrie : constantes', 'pedia', 'nouveau-ne nourrisson enfant pediatr'],
  ['Bronchiolite', 'pedia', 'bronchiolite drp'],
  ['Déshydratation de l’enfant', 'pedia', 'deshydratation fontanelle pli cutane'],
  ['Score d’Apgar / naissance', 'pedia', 'apgar naissance nouveau-ne'],
  ['Mort inattendue du nourrisson', 'pedia', 'couchage nourrisson'],
  ['Soins sans consentement', 'psy', 'sdt sdre consentement tiers prefet'],
  ['Risque suicidaire', 'psy', 'suicid rud'],
  ['Alcool / sevrage', 'psy', 'alcool sevrage delirium tremens thiamine wernicke'],
  ['Psychoses / neuroleptiques', 'psy', 'neurolept antipsychot schizophr hallucin delire syndrome malin'],
  ['Dépression / antidépresseurs', 'psy', 'depression antidepress isrs'],
  ['Trouble bipolaire / lithium', 'psy', 'bipolaire lithium thymoregul'],
  ['Anxiété / benzodiazépines', 'psy', 'anxi benzodiazep anxiolyt'],
  ['Chimiothérapie', 'onco', 'chimiotherap mucite extravasation neutropenie'],
  ['Neutropénie fébrile', 'onco', 'neutropenie febrile aplasie'],
  ['Soins palliatifs / fin de vie', 'onco', 'palliati fin de vie claeys leonetti sedation directives anticipees'],
  ['Douleur : évaluation', 'douleur', 'eva en echelle algoplus doloplus edin evendol douleur'],
  ['Antalgiques / paliers OMS', 'douleur', 'palier antalgique paracetamol tramadol codeine'],
  ['Morphiniques', 'douleur', 'morphin opioide pca naloxone oxycodone fentanyl'],
  ['Hygiène des mains', 'hyg', 'hygiene des mains friction hydro-alcoolique fha sha'],
  ['Précautions complémentaires', 'hyg', 'precautions contact gouttelettes air bmr'],
  ['AES (accident d’exposition au sang)', 'hyg', 'aes exposition au sang piqure'],
  ['Déchets (DASRI)', 'hyg', 'dasri opct dechets'],
  ['Infections associées aux soins', 'hyg', 'ias nosocomial bmr clostridi'],
  ['Antibiotiques', 'pharma', 'antibiot amoxicilline ceftriaxone gentamicine vancomycine'],
  ['Pharmacocinétique', 'pharma', 'pharmacocinetique demi-vie premier passage marge therapeutique'],
  ['Diurétiques', 'pharma', 'diuret furosemide spironolactone thiazid'],
  ['Antidotes', 'pharma', 'antidote'],
  ['Injections (IM, SC, IV, ID)', 'soins', 'injection intramusculaire sous-cutanee im sc angle'],
  ['Perfusion / voie veineuse', 'soins', 'perfusion catheter vvp veinite debit'],
  ['Transfusion sanguine', 'soins', 'transfusion cgr controle ultime rai abo'],
  ['Escarres', 'soins', 'escarre braden norton'],
  ['Sonde nasogastrique', 'soins', 'nasogastrique sng'],
  ['Glycémie capillaire', 'soins', 'glycemie capillaire'],
  ['Constantes vitales', 'soins', 'constantes frequence cardiaque frequence respiratoire temperature spo2 pression'],
  ['Administration des médicaments', 'soins', '5 b administration medicament prescription'],
  ['Pansements / plaies', 'soins', 'pansement plaie cicatrisation'],
  ['Législation infirmière', 'legal', 'code de la sante publique decret actes role propre'],
  ['Secret professionnel', 'legal', 'secret professionnel partage'],
  ['Droits des patients', 'legal', 'kouchner personne de confiance droits consentement dossier'],
  ['Transmissions', 'legal', 'transmissions ciblees dar saed sbar'],
  ['Responsabilité', 'legal', 'responsabilite civile penale disciplinaire'],
  ['Prévention', 'sp', 'prevention primaire secondaire tertiaire'],
  ['Dépistages', 'sp', 'depistage mammographie'],
  ['Épidémiologie', 'sp', 'incidence prevalence mortalite'],
  ['Tabac / addictions', 'sp', 'tabac tabagisme addiction'],
  ['Éducation thérapeutique', 'sp', 'education therapeutique etp'],
  ['Vaccination', 'sp', 'vaccin'],
  ['Cœur : anatomie', 'anat', 'ventricule oreillette valve mitrale tricuspide noeud sinusal aorte'],
  ['Poumon : anatomie', 'anat', 'alveole bronche plevre trachee'],
  ['Rein : anatomie', 'anat', 'nephron glomerule'],
  ['Système nerveux', 'anat', 'nerf sympathique parasympathique vague'],
  ['Sang : physiologie', 'anat', 'globule rouge hematie plaquette'],
  ['Hormones', 'anat', 'hormone insuline glucagon adh hypophyse'],
];

const CALC = [
  ['Débit de perfusion (mL/h)', 'debit_mlh'], ['Débit en gouttes/min', 'gouttes'], ['Pousse-seringue électrique', 'pse'],
  ['Dose en mg/kg', 'mgkg'], ['Volume à prélever (ampoules)', 'ampoule'], ['Solutions en pourcentage', 'pourcent'],
  ['Conversions d’unités', 'conversion'], ['Héparine au PSE', 'heparine'], ['Durée de perfusion', 'temps'], ['IMC', 'imc'],
  ['Calcul du score de Glasgow', 'glasgow'], ['Interprétation des constantes', 'constantes'],
];

let _topics = null;
export function getTopics() {
  if (_topics) return _topics;
  const t = [];
  for (const th of THEMES) t.push({ id: 'th:' + th.id, name: th.name, theme: th.id, kind: 'Thème', themeOnly: true });
  for (const [name, theme, kw] of PATHO) t.push({ id: 'p:' + norm(name).replace(/\W+/g, '-'), name, theme, kind: 'Sujet', kw: kw.split(' ') });
  for (const [name, gen] of CALC) t.push({ id: 'calc:' + gen, name, theme: gen === 'glasgow' ? 'neuro' : gen === 'constantes' ? 'soins' : 'calc', kind: 'Calcul', gen });
  const classes = new Set();
  for (const d of DRUGS) {
    const short = d[0].split(' (')[0];
    t.push({ id: 'drug:' + norm(short).replace(/\W+/g, '-'), name: short, theme: 'pharma', kind: 'Médicament', kw: [norm(short)], drug: d[0] });
    classes.add(d[1]);
  }
  for (const c of classes) t.push({ id: 'cls:' + norm(c).replace(/\W+/g, '-'), name: c, theme: 'pharma', kind: 'Classe', kw: [norm(c)], cls: c });
  for (const n of NORMS) t.push({ id: 'norm:' + norm(n[0]).replace(/\W+/g, '-'), name: n[0], theme: n[7], kind: 'Norme', kw: [norm(n[0]).split(' (')[0]] });
  for (const v of VOCAB) t.push({ id: 'voc:' + norm(v[0]).replace(/\W+/g, '-'), name: v[0], theme: 'vocab', kind: 'Vocabulaire', kw: [norm(v[0])] });
  for (const x of t) x._n = norm(x.name + ' ' + (x.kw || []).join(' ') + ' ' + x.kind);
  return (_topics = t);
}

export function searchTopics(q, limit = 60) {
  const n = norm(q).trim();
  const all = getTopics();
  if (!n) return all;
  const words = n.split(/\s+/);
  return all.filter((t) => words.every((w) => t._n.includes(w))).slice(0, limit);
}

// Un élément (question/fiche) correspond-il à un sujet ?
export function matchTopic(topic, item) {
  if (!topic) return true;
  if (topic.themeOnly) return item.theme === topic.id.slice(3);
  if (topic.gen) return item.gen === topic.gen;
  if (topic.drug && item.drug) return item.drug === topic.drug;
  if (topic.cls && item.cls) return item.cls === topic.cls;
  const txt = item._n || (item._n = norm([item.q, item.title, item.body, ...(item.options || []), item.explain].join(' ')));
  return (topic.kw || []).some((k) => txt.includes(k));
}
