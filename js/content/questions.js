// Banque de QCM rédigés. Format : [thème, question, bonne réponse, [distracteurs], explication]
export const QUESTIONS = [
  // Anatomie & physiologie
  ['anat', 'Quelle cavité cardiaque éjecte le sang dans l’aorte ?', 'Le ventricule gauche', ['Le ventricule droit', 'L’oreillette gauche', 'L’oreillette droite'], 'Le VG propulse le sang oxygéné dans la circulation systémique via l’aorte.'],
  ['anat', 'Quelle valve sépare l’oreillette gauche du ventricule gauche ?', 'La valve mitrale', ['La valve tricuspide', 'La valve aortique', 'La valve pulmonaire'], 'Mitrale à gauche (2 valvules), tricuspide à droite.'],
  ['anat', 'Où se font les échanges gazeux pulmonaires ?', 'Dans les alvéoles', ['Dans les bronches souches', 'Dans la trachée', 'Dans la plèvre'], 'La membrane alvéolo-capillaire permet la diffusion de l’O₂ et du CO₂.'],
  ['anat', 'Quelle est l’unité fonctionnelle du rein ?', 'Le néphron', ['Le glomérule seul', 'L’uretère', 'Le calice'], 'Environ 1 million de néphrons par rein : glomérule + tubules.'],
  ['anat', 'Quelle hormone est sécrétée par les cellules β des îlots de Langerhans ?', 'L’insuline', ['Le glucagon', 'Le cortisol', 'La somatostatine'], 'Cellules α : glucagon ; cellules β : insuline (hypoglycémiante).'],
  ['anat', 'Quel nerf crânien est le nerf vague ?', 'Le X', ['Le VII', 'Le V', 'Le XII'], 'Le nerf vague (X) assure l’innervation parasympathique des viscères.'],
  ['anat', 'Quel est le rôle principal des plaquettes ?', 'L’hémostase primaire', ['Le transport de l’O₂', 'La défense immunitaire spécifique', 'La production d’anticorps'], 'Les plaquettes adhèrent et s’agrègent pour former le clou plaquettaire.'],
  ['anat', 'Où est produite la bile ?', 'Dans le foie', ['Dans la vésicule biliaire', 'Dans le pancréas', 'Dans le duodénum'], 'Produite par le foie, stockée et concentrée dans la vésicule.'],
  ['anat', 'Quelle est la durée de vie moyenne d’un globule rouge ?', '120 jours', ['30 jours', '7 jours', '1 an'], 'Les hématies sont ensuite détruites principalement dans la rate.'],
  ['anat', 'Quel système est activé lors d’un stress aigu (« fight or flight ») ?', 'Le système sympathique', ['Le système parasympathique', 'Le système limbique seul', 'Le système lymphatique'], 'Tachycardie, mydriase, bronchodilatation, hyperglycémie.'],
  ['anat', 'Quelle hormone antidiurétique est sécrétée par la post-hypophyse ?', 'L’ADH (vasopressine)', ['L’aldostérone', 'La rénine', 'La TSH'], 'L’ADH augmente la réabsorption d’eau au niveau du tube collecteur.'],
  ['anat', 'Quel est le pacemaker physiologique du cœur ?', 'Le nœud sinusal', ['Le nœud auriculo-ventriculaire', 'Le faisceau de His', 'Les fibres de Purkinje'], 'Situé dans l’oreillette droite, il impose un rythme de 60 à 100/min.'],

  // Pharmacologie
  ['pharma', 'Quel est l’antidote du paracétamol ?', 'La N-acétylcystéine', ['La naloxone', 'Le flumazénil', 'La vitamine K'], 'La NAC restaure le glutathion hépatique ; à débuter précocement.'],
  ['pharma', 'Quel est l’antidote des morphiniques ?', 'La naloxone (Narcan®)', ['Le flumazénil', 'La protamine', 'L’atropine'], 'Antagoniste opioïde ; demi-vie courte → surveiller la re-sédation.'],
  ['pharma', 'Quel est l’antidote des benzodiazépines ?', 'Le flumazénil (Anexate®)', ['La naloxone', 'Le glucagon', 'La N-acétylcystéine'], 'Risque de convulsions chez les patients dépendants.'],
  ['pharma', 'Quel est l’antidote de l’héparine non fractionnée ?', 'Le sulfate de protamine', ['La vitamine K', 'Le PPSB', 'L’acide tranexamique'], 'La protamine neutralise l’HNF (partiellement les HBPM).'],
  ['pharma', 'Quel est l’antidote des AVK en cas d’hémorragie grave ?', 'Vitamine K + PPSB (CCP)', ['Protamine', 'Naloxone', 'Atropine'], 'Le PPSB apporte les facteurs II, VII, IX, X immédiatement.'],
  ['pharma', 'Quelle surveillance biologique pour un traitement par AVK ?', 'L’INR', ['Le TCA', 'L’anti-Xa', 'La plaquettémie seule'], 'INR cible habituel 2–3 (2,5–3,5 pour valve mécanique).'],
  ['pharma', 'Quel risque majeur impose la surveillance des plaquettes sous héparine ?', 'La thrombopénie induite (TIH)', ['L’hyperkaliémie isolée', 'L’hypoglycémie', 'L’ototoxicité'], 'TIH type 2 : paradoxalement thrombosante, survient vers J5–J21.'],
  ['pharma', 'Quel effet indésirable est typique des IEC ?', 'La toux sèche', ['La bradycardie', 'L’hypokaliémie', 'La constipation'], 'Due à l’accumulation de bradykinine ; risque aussi d’hyperkaliémie et d’angio-œdème.'],
  ['pharma', 'Quel trouble ionique surveiller sous furosémide ?', 'L’hypokaliémie', ['L’hyperkaliémie', 'L’hypercalcémie', 'L’hypernatrémie'], 'Diurétique de l’anse, fuite potassique → surveiller ionogramme.'],
  ['pharma', 'Quel diurétique est épargneur de potassium ?', 'La spironolactone', ['Le furosémide', 'L’hydrochlorothiazide', 'Le bumétanide'], 'Anti-aldostérone : risque d’hyperkaliémie.'],
  ['pharma', 'Quel signe de surdosage digitalique faut-il rechercher ?', 'Troubles digestifs et visuels (dyschromatopsie)', ['Hypertension artérielle', 'Hyperthermie', 'Polyurie'], 'Nausées, vomissements, vision jaune-verte, bradycardie, troubles du rythme.'],
  ['pharma', 'Quelle est la principale contre-indication des bêtabloquants ?', 'L’asthme sévère', ['L’hypertension artérielle', 'L’angor stable', 'La tachycardie sinusale'], 'Risque de bronchospasme ; aussi BAV de haut degré, bradycardie sévère.'],
  ['pharma', 'Quel est le délai d’action d’une insuline rapide (analogue) en SC ?', '10 à 15 minutes', ['1 à 2 heures', '4 heures', '30 secondes'], 'Pic vers 1 h, durée 3–5 h : à injecter juste avant le repas.'],
  ['pharma', 'Quelle voie est privilégiée pour l’adrénaline dans l’anaphylaxie (hors réanimation) ?', 'Intramusculaire (face antéro-latérale de cuisse)', ['Sous-cutanée', 'Per os', 'Inhalée'], 'Adulte : 0,5 mg IM, renouvelable après 5 min.'],
  ['pharma', 'Que signifie « marge thérapeutique étroite » ?', 'Faible écart entre dose efficace et dose toxique', ['Le médicament agit très vite', 'Le médicament est peu cher', 'Le médicament n’a aucun effet indésirable'], 'Ex : digoxine, lithium, AVK, aminosides → dosages fréquents.'],
  ['pharma', 'Quel antibiotique impose une surveillance de la fonction rénale et auditive ?', 'La gentamicine (aminoside)', ['L’amoxicilline', 'La ceftriaxone', 'L’azithromycine'], 'Aminosides : néphrotoxicité et ototoxicité ; dosages résiduels.'],
  ['pharma', 'Le lithium nécessite la surveillance de :', 'La lithiémie, la fonction rénale et thyroïdienne', ['La glycémie uniquement', 'L’INR', 'La CRP'], 'Marge étroite : tremblements, troubles digestifs, confusion = signes de surdosage.'],
  ['pharma', 'Qu’est-ce que l’effet de premier passage hépatique ?', 'La dégradation d’une partie du médicament par le foie avant la circulation générale', ['L’élimination rénale rapide', 'L’absorption cutanée', 'La fixation aux protéines'], 'Concerne la voie orale ; évité par les voies sublinguale, IV, transdermique.'],
  ['pharma', 'Quel médicament ne doit jamais être injecté en IV directe non diluée ?', 'Le chlorure de potassium (KCl)', ['Le sérum physiologique', 'Le paracétamol IV', 'Le glucose 5 %'], 'Risque d’arrêt cardiaque : toujours dilué, débit contrôlé (≤ 1 g/h en général).'],

  // Biologie
  ['bio', 'Quelle est la valeur normale de la kaliémie ?', '3,5 à 5 mmol/L', ['1,5 à 2,5 mmol/L', '135 à 145 mmol/L', '7 à 9 mmol/L'], 'Hypokaliémie < 3,5 ; hyperkaliémie > 5 (danger cardiaque).'],
  ['bio', 'Quelle est la valeur normale de la natrémie ?', '135 à 145 mmol/L', ['3,5 à 5 mmol/L', '95 à 105 mmol/L', '150 à 170 mmol/L'], 'Hyponatrémie < 135 : confusion, convulsions si sévère.'],
  ['bio', 'Une glycémie capillaire à 0,50 g/L chez un diabétique correspond à :', 'Une hypoglycémie', ['Une valeur normale', 'Une hyperglycémie', 'Une acidocétose'], 'Hypoglycémie < 0,70 g/L chez le diabétique traité.'],
  ['bio', 'Quel paramètre reflète l’équilibre glycémique des 3 derniers mois ?', 'L’HbA1c', ['La glycémie à jeun', 'La cétonémie', 'Le peptide C'], 'Durée de vie des hématies ≈ 120 jours.'],
  ['bio', 'Quel marqueur biologique est utilisé pour le diagnostic d’infarctus du myocarde ?', 'La troponine', ['La CRP', 'La lipase', 'Les D-dimères'], 'Élévation et cinétique de troponine Hs.'],
  ['bio', 'Des D-dimères négatifs permettent surtout de :', 'Écarter une thrombose (si probabilité faible)', ['Confirmer une embolie pulmonaire', 'Diagnostiquer un infarctus', 'Évaluer la fonction rénale'], 'Excellente valeur prédictive négative, faible spécificité.'],
  ['bio', 'Un tube citraté (bleu) est utilisé pour :', 'Le bilan d’hémostase (TP, TCA)', ['La NFS', 'L’ionogramme', 'La glycémie'], 'Remplir jusqu’au trait (rapport sang/citrate).'],
  ['bio', 'Quel tube pour une NFS ?', 'Tube EDTA (violet)', ['Tube citraté (bleu)', 'Tube sec (rouge)', 'Tube fluoré (gris)'], 'L’EDTA chélate le calcium et préserve les cellules.'],
  ['bio', 'Quel est l’ordre de prélèvement recommandé des tubes ?', 'Hémoculture – citrate – sec – héparine – EDTA – fluorure', ['EDTA – sec – citrate – hémoculture', 'Sec – EDTA – citrate – hémoculture', 'Fluorure – EDTA – citrate – sec'], 'Évite la contamination par les additifs.'],
  ['bio', 'Une CRP élevée évoque :', 'Un syndrome inflammatoire', ['Une anémie', 'Une insuffisance hépatique', 'Une déshydratation'], 'Marqueur non spécifique, rapide (6–8 h).'],

  // Soins & techniques
  ['soins', 'Quel est l’angle d’injection d’une injection intramusculaire ?', '90°', ['15°', '45°', '5°'], 'IM : 90° ; SC : 45° (ou 90° avec pli selon aiguille) ; ID : 10–15°.'],
  ['soins', 'Quel site est recommandé pour une IM chez l’adulte (fessier) ?', 'Le quadrant supéro-externe ou site ventro-glutéal', ['Le quadrant inféro-interne', 'Le quadrant inféro-externe', 'Le centre de la fesse'], 'Évite le nerf sciatique.'],
  ['soins', 'Quelle est la règle des 5 B ?', 'Bon patient, bon médicament, bonne dose, bonne voie, bon moment', ['Bon lit, bon box, bon bilan, bon bracelet, bon badge', 'Bonne heure, bonne humeur, bon dossier, bon lit, bon box', 'Aucune des propositions'], 'Sécurisation de l’administration médicamenteuse (HAS).'],
  ['soins', 'Pour une sonde nasogastrique, comment vérifier le bon positionnement de référence ?', 'Radiographie (ou mesure du pH de l’aspiration)', ['Insufflation d’air seule', 'Demander au patient de parler', 'Observer la coloration du visage'], 'L’auscultation après insufflation n’est plus une méthode fiable seule.'],
  ['soins', 'Quelle position pour un patient dyspnéique ?', 'Position demi-assise (Fowler)', ['Décubitus dorsal strict', 'Trendelenburg', 'Décubitus ventral'], 'Facilite l’ampliation thoracique.'],
  ['soins', 'Quelle est la fréquence de changement d’un cathéter veineux périphérique ?', 'Pas de changement systématique avant 96 h si bonne tolérance (selon protocole)', ['Toutes les 12 h', 'Tous les 15 jours', 'Jamais'], 'Recommandations SF2H : réévaluation quotidienne de la nécessité.'],
  ['soins', 'Que faut-il vérifier avant une transfusion au lit du patient ?', 'Le contrôle ultime pré-transfusionnel (concordance + test ABO)', ['Uniquement la température', 'La glycémie', 'L’ECG'], 'Contrôle de concordance documentaire et compatibilité biologique.'],
  ['soins', 'Quel signe impose l’arrêt immédiat d’une transfusion ?', 'Frissons, hyperthermie, douleur lombaire, hypotension', ['Une légère faim', 'Une envie d’uriner', 'Une diurèse normale'], 'Évoque un accident hémolytique : arrêter, garder la poche, appeler le médecin.'],
  ['soins', 'Quel score évalue le risque d’escarre ?', 'Le score de Braden (ou Norton)', ['Le score de Glasgow', 'Le score d’Apgar', 'L’échelle EVA'], 'Braden : 6 items, risque si ≤ 18.'],
  ['soins', 'Quel est le premier geste de prévention d’escarre ?', 'Les changements de position réguliers', ['Le massage des zones rougies', 'La friction à l’alcool', 'Le séchage au sèche-cheveux'], 'Les massages et frictions sont proscrits.'],
  ['soins', 'Pour une glycémie capillaire, quel doigt et zone privilégier ?', 'Face latérale de la pulpe du doigt (3e/4e doigt)', ['Le centre de la pulpe du pouce', 'Le lobe de l’oreille systématiquement', 'L’ongle'], 'Moins douloureux, alterner les sites.'],
  ['soins', 'Quelle aiguille est classiquement utilisée pour une injection SC ?', 'Aiguille courte de petit calibre (25–26 G)', ['Aiguille 18 G longue', 'Trocart', 'Aiguille de Huber'], 'Huber : chambre implantable ; 18 G : remplissage/prélèvement.'],

  // Hygiène
  ['hyg', 'Quel est le geste le plus efficace contre les infections associées aux soins ?', 'L’hygiène des mains (friction hydro-alcoolique)', ['Le port de gants systématique', 'Le lavage au savon antiseptique', 'Le port de surblouse'], 'La FHA est la technique de référence sur mains visiblement propres.'],
  ['hyg', 'Quelle est la durée minimale d’une friction hydro-alcoolique ?', '20 à 30 secondes, jusqu’à séchage complet', ['5 secondes', '2 minutes', '10 minutes'], 'Mains sèches, sans bijoux, ongles courts.'],
  ['hyg', 'Quelles précautions pour un patient atteint de Clostridioides difficile ?', 'Précautions contact + lavage au savon puis FHA', ['Précautions air uniquement', 'Aucune précaution', 'Précautions gouttelettes uniquement'], 'Les spores résistent aux solutions hydro-alcooliques.'],
  ['hyg', 'La tuberculose pulmonaire bacillifère relève des précautions :', '« Air » (masque FFP2 pour le soignant)', ['« Gouttelettes » (masque chirurgical pour le soignant)', '« Contact » uniquement', 'Standard uniquement'], 'Chambre individuelle porte fermée, masque chirurgical pour le patient s’il sort.'],
  ['hyg', 'La grippe relève des précautions :', '« Gouttelettes »', ['« Air »', 'Aucune', '« Contact » strictes uniquement'], 'Masque chirurgical, chambre individuelle si possible.'],
  ['hyg', 'Que faire en cas d’AES (piqûre) ?', 'Ne pas faire saigner, nettoyer, antiseptiser ≥ 5 min, consulter un référent', ['Faire saigner abondamment', 'Mettre de l’alcool et ignorer', 'Attendre la fin du poste'], 'Évaluation du risque et éventuel TPE dans les 4 h (au plus tard 48 h).'],
  ['hyg', 'Quelle filière pour une aiguille souillée ?', 'Collecteur OPCT (piquants-coupants)', ['DASRI mou (sac jaune)', 'DAOM (sac noir)', 'Poubelle de tri papier'], 'Ne jamais recapuchonner une aiguille.'],
  ['hyg', 'Une BMR est :', 'Une bactérie multirésistante aux antibiotiques', ['Une bactérie très mobile', 'Un virus résistant', 'Un champignon'], 'Ex : SARM, entérobactéries BLSE.'],
  ['hyg', 'Que signifie IAS ?', 'Infection associée aux soins', ['Infection aiguë sévère', 'Insuffisance artérielle sévère', 'Indice d’activité sanitaire'], 'Survient au cours ou au décours d’une prise en charge (≥ 48 h).'],

  // Urgences
  ['urg', 'Quelle est la fréquence des compressions thoraciques chez l’adulte ?', '100 à 120 par minute', ['60 par minute', '150 à 180 par minute', '30 par minute'], 'Profondeur 5–6 cm, relâchement complet.'],
  ['urg', 'Quel est le ratio compressions/insufflations chez l’adulte ?', '30/2', ['15/2', '5/1', '30/5'], 'Chez l’enfant, en milieu professionnel : 15/2.'],
  ['urg', 'Quel numéro européen d’urgence ?', '112', ['15', '17', '115'], '15 SAMU, 18 pompiers, 17 police, 114 sourds/malentendants.'],
  ['urg', 'Première action face à une victime inconsciente qui respire ?', 'Position latérale de sécurité et alerte', ['Massage cardiaque', 'Lui donner à boire', 'La laisser sur le dos'], 'Surveiller la respiration en continu.'],
  ['urg', 'Quels signes évoquent un choc ?', 'Tachycardie, hypotension, marbrures, oligurie', ['Bradycardie, hypertension, polyurie', 'Hyperthermie isolée', 'Toux sèche'], 'Index de choc = FC/PAS > 1 évocateur.'],
  ['urg', 'Quel est le traitement de première intention de l’anaphylaxie ?', 'L’adrénaline IM', ['Les antihistaminiques seuls', 'Les corticoïdes seuls', 'Le paracétamol'], 'Antihistaminiques et corticoïdes ne sont que des traitements adjuvants.'],
  ['urg', 'Que signifie l’acronyme ABCDE ?', 'Airway, Breathing, Circulation, Disability, Exposure', ['Alerte, Bilan, Choc, Défibrillation, Évacuation', 'Antalgie, Bilan, Cathéter, Diurèse, ECG', 'Aucune des propositions'], 'Évaluation systématique et priorisée du patient grave.'],
  ['urg', 'Quel rythme est choquable ?', 'Fibrillation ventriculaire', ['Asystolie', 'Activité électrique sans pouls', 'Bradycardie sinusale'], 'FV et TV sans pouls sont choquables.'],

  // Cardio
  ['cardio', 'Quel est le signe principal d’un infarctus du myocarde ?', 'Douleur thoracique constrictive irradiant au bras gauche/mâchoire', ['Douleur abdominale isolée calmée par le repas', 'Céphalée en casque', 'Toux productive'], 'Douleur prolongée > 20 min, résistante à la trinitrine.'],
  ['cardio', 'Quel examen réaliser en priorité devant une douleur thoracique ?', 'ECG 12 dérivations dans les 10 minutes', ['Radiographie du bassin', 'Échographie abdominale', 'EEG'], 'Recherche d’un sus-décalage du segment ST.'],
  ['cardio', 'Quels signes évoquent une insuffisance cardiaque gauche ?', 'Dyspnée, orthopnée, crépitants', ['Œdèmes des membres inférieurs isolés', 'Turgescence jugulaire isolée', 'Ictère'], 'L’IC droite : OMI, hépatomégalie, turgescence jugulaire.'],
  ['cardio', 'Quelle surveillance pour un patient en OAP ?', 'FR, SpO₂, PA, diurèse, poids', ['Uniquement la température', 'Uniquement la glycémie', 'L’EVA seule'], 'Position assise jambes pendantes, O₂, diurétiques sur prescription.'],
  ['cardio', 'Quel est le seuil de l’HTA en mesure clinique ?', '≥ 140/90 mmHg', ['≥ 120/80 mmHg', '≥ 160/100 mmHg', '≥ 180/110 mmHg'], 'En automesure : ≥ 135/85 mmHg.'],
  ['cardio', 'La trinitrine sublinguale peut provoquer :', 'Céphalées et hypotension', ['Hypertension', 'Bradypnée', 'Hypoglycémie'], 'Vasodilatateur : faire asseoir le patient.'],
  ['cardio', 'La fibrillation atriale expose surtout au risque de :', 'AVC ischémique (embolie)', ['Hypoglycémie', 'Pneumothorax', 'Insuffisance hépatique'], 'Évaluation du score CHA₂DS₂-VASc pour l’anticoagulation.'],
  ['cardio', 'Quel signe clinique évoque une phlébite ?', 'Mollet douloureux, chaud, perte du ballant', ['Pied froid et pâle', 'Ongles bleus isolés', 'Prurit généralisé'], 'Signe de Homans peu fiable ; écho-doppler pour confirmer.'],

  // Pneumo
  ['pneumo', 'Quel débit d’O₂ maximum aux lunettes nasales ?', 'Environ 6 L/min', ['15 L/min', '1 L/h', '30 L/min'], 'Au-delà : masque simple ou masque haute concentration.'],
  ['pneumo', 'Quelle SpO₂ cible chez un patient BPCO hypercapnique ?', '88 à 92 %', ['100 %', '70 à 80 %', '95 à 100 %'], 'Risque d’hypercapnie si oxygénation excessive.'],
  ['pneumo', 'Quel est le signe de gravité d’une crise d’asthme ?', 'Difficulté à parler, silence auscultatoire', ['Toux isolée', 'Rhume', 'Sibilants légers'], 'Aussi : DEP < 50 %, tirage, cyanose, troubles de conscience.'],
  ['pneumo', 'Quelle est la fréquence respiratoire normale de l’adulte ?', '12 à 20 cycles/min', ['30 à 40 cycles/min', '4 à 8 cycles/min', '60 cycles/min'], 'Tachypnée > 20 ; bradypnée < 12.'],
  ['pneumo', 'Qu’est-ce qu’une hémoptysie ?', 'Rejet de sang provenant des voies respiratoires lors d’un effort de toux', ['Un vomissement de sang', 'Du sang dans les urines', 'Un saignement de nez'], 'Hématémèse = vomissement de sang.'],
  ['pneumo', 'Quel est le facteur de risque principal de la BPCO ?', 'Le tabagisme', ['L’alcool', 'L’obésité', 'Le diabète'], 'Le sevrage tabagique est la mesure la plus efficace.'],
  ['pneumo', 'Quel est le masque permettant la FiO₂ la plus élevée ?', 'Le masque haute concentration (à réserve)', ['Les lunettes nasales', 'Le masque simple', 'L’air ambiant'], 'Débit 12–15 L/min, réserve gonflée.'],

  // Neuro
  ['neuro', 'Quel est le score de Glasgow minimum ?', '3', ['0', '1', '5'], 'Score de 3 à 15 (Yeux 4, Verbal 5, Moteur 6).'],
  ['neuro', 'Un Glasgow ≤ 8 signifie :', 'Un coma grave nécessitant une protection des voies aériennes', ['Une conscience normale', 'Une confusion légère', 'Un patient agité'], 'Indication d’intubation en général.'],
  ['neuro', 'Que signifie l’acronyme VITE pour l’AVC ?', 'Visage, Inertie (bras), Trouble de la parole, En urgence 15', ['Vomissement, Ictère, Toux, Épistaxis', 'Vertige, Insomnie, Tremblement, Énurésie', 'Aucune'], 'Délai : thrombolyse jusqu’à 4 h 30 après le début des symptômes.'],
  ['neuro', 'Une mydriase unilatérale aréactive évoque :', 'Un engagement cérébral', ['Une intoxication aux opiacés', 'Une simple fatigue', 'Une hypoglycémie modérée'], 'Urgence neurochirurgicale.'],
  ['neuro', 'Un myosis bilatéral serré évoque une intoxication :', 'Aux opiacés', ['À l’atropine', 'À la cocaïne', 'Aux amphétamines'], 'Associé à une bradypnée et à des troubles de conscience.'],
  ['neuro', 'Que faire pendant une crise convulsive tonico-clonique ?', 'Protéger la tête, ne rien mettre en bouche, chronométrer, PLS après', ['Maintenir fermement les membres', 'Mettre un objet entre les dents', 'Donner à boire'], 'État de mal si crise > 5 min : traitement médical.'],
  ['neuro', 'Qu’est-ce qu’une aphasie ?', 'Un trouble du langage', ['Une paralysie d’un hémicorps', 'Un trouble de la déglutition', 'Une perte de la vue'], 'Dysphagie = trouble de la déglutition ; hémiplégie = paralysie.'],

  // Endoc
  ['endoc', 'Quels sont les signes d’une hypoglycémie ?', 'Sueurs, tremblements, pâleur, faim, confusion', ['Polyurie, soif intense, peau sèche', 'Bradycardie, hyperthermie', 'Ictère, prurit'], 'Resucrage : 15 g de sucre si conscient, contrôle à 15 min.'],
  ['endoc', 'Conduite à tenir devant une hypoglycémie chez un patient inconscient ?', 'Glucagon IM/SC ou G30 % IV sur prescription', ['Resucrage per os', 'Injection d’insuline', 'Attendre le réveil'], 'Ne jamais faire boire un patient inconscient.'],
  ['endoc', 'Quels signes évoquent une acidocétose diabétique ?', 'Polyurie, polydipsie, haleine cétonique, dyspnée de Kussmaul', ['Sueurs froides et tremblements', 'Bradycardie isolée', 'Hypertension isolée'], 'Glycémie élevée + cétonémie positive.'],
  ['endoc', 'Où injecter l’insuline et pourquoi alterner les sites ?', 'Abdomen, cuisses, bras ; pour éviter les lipodystrophies', ['Uniquement en IM', 'Dans la veine', 'Toujours au même endroit'], 'Les lipodystrophies perturbent la résorption de l’insuline.'],
  ['endoc', 'Le pied diabétique impose :', 'Une inspection quotidienne et un chaussage adapté', ['Des bains de pieds chauds prolongés', 'La marche pieds nus', 'L’usage de coricides'], 'Neuropathie : plaies indolores qui passent inaperçues.'],
  ['endoc', 'Quelle est la glycémie à jeun définissant le diabète ?', '≥ 1,26 g/L à deux reprises', ['≥ 0,80 g/L', '≥ 2,50 g/L uniquement', '≥ 1,00 g/L'], 'Ou ≥ 2 g/L à tout moment avec symptômes.'],
  ['endoc', 'Quels signes évoquent une hypothyroïdie ?', 'Frilosité, prise de poids, bradycardie, constipation', ['Thermophobie, amaigrissement, tachycardie', 'Diarrhée et nervosité', 'Exophtalmie isolée'], 'L’hyperthyroïdie donne le tableau inverse.'],

  // Néphro
  ['nephro', 'Qu’est-ce qu’une oligurie chez l’adulte ?', 'Diurèse < 500 mL/24 h', ['Diurèse > 3 L/24 h', 'Absence totale de diurèse', 'Brûlures mictionnelles'], 'Anurie < 100 mL/24 h ; polyurie > 3 L/24 h.'],
  ['nephro', 'Quels signes évoquent un globe vésical ?', 'Douleur sus-pubienne, envie pressante sans miction, masse hypogastrique', ['Diarrhée', 'Hématémèse', 'Toux'], 'Confirmation par bladder scan ; sondage sur prescription.'],
  ['nephro', 'Lors d’un globe vésical important, comment vider la vessie ?', 'Par vidange fractionnée selon protocole', ['Le plus vite possible en une fois sans surveillance', 'Par compression abdominale forte', 'Par diurétique'], 'Risque d’hématurie a vacuo et de malaise vagal.'],
  ['nephro', 'Une fistule artério-veineuse pour hémodialyse impose :', 'De ne pas prendre la PA ni piquer sur ce bras', ['De comprimer le bras la nuit', 'De porter des bracelets serrés', 'D’éviter de vérifier le thrill'], 'Vérifier le thrill (frémissement) quotidiennement.'],
  ['nephro', 'Quels signes évoquent une pyélonéphrite ?', 'Fièvre, frissons, douleur lombaire unilatérale', ['Toux et expectorations', 'Céphalée en casque', 'Douleur thoracique'], 'ECBU avant antibiothérapie.'],

  // Digestif
  ['dig', 'Qu’est-ce qu’un méléna ?', 'Des selles noires, goudronneuses (sang digéré)', ['Du sang rouge dans les selles', 'Un vomissement de sang', 'Des selles décolorées'], 'Évoque une hémorragie digestive haute.'],
  ['dig', 'Qu’est-ce qu’une rectorragie ?', 'L’émission de sang rouge par l’anus', ['Des selles noires', 'Une constipation', 'Une diarrhée aqueuse'], 'Le plus souvent origine basse (côlon, rectum, anus).'],
  ['dig', 'Quels signes évoquent une occlusion intestinale ?', 'Arrêt des matières et des gaz, vomissements, douleurs, météorisme', ['Diarrhée abondante', 'Polyurie', 'Hyperthermie isolée'], 'Pose d’une SNG en aspiration sur prescription.'],
  ['dig', 'Quel signe évoque une appendicite ?', 'Douleur en fosse iliaque droite + fièvre', ['Douleur épigastrique calmée par le repas', 'Douleur de l’hypocondre gauche', 'Ictère'], 'Point de McBurney.'],
  ['dig', 'Quel bilan biologique en cas de suspicion de pancréatite ?', 'La lipasémie', ['La troponine', 'La TSH', 'Le BNP'], 'Lipase > 3 fois la normale.'],
  ['dig', 'Une stomie normale doit être :', 'Rouge vif, humide, légèrement saillante', ['Noire', 'Blanche et sèche', 'Violacée'], 'Une stomie noire évoque une nécrose : alerter.'],

  // Pédiatrie
  ['pedia', 'Quelle est la FC normale d’un nouveau-né ?', '120 à 160 /min', ['60 à 80 /min', '40 à 60 /min', '200 à 250 /min'], 'Elle diminue progressivement avec l’âge.'],
  ['pedia', 'Que mesure le score d’Apgar ?', 'L’adaptation du nouveau-né à la vie extra-utérine', ['La douleur de l’enfant', 'Le développement psychomoteur', 'Le risque d’escarre'], 'Évalué à 1, 5 et 10 min (FC, respiration, tonus, réactivité, coloration).'],
  ['pedia', 'Quel est le principal risque de la bronchiolite chez le nourrisson ?', 'La détresse respiratoire et la déshydratation', ['L’hypertension', 'L’ictère', 'La fracture'], 'DRP, fractionnement des repas, surveillance des signes de lutte.'],
  ['pedia', 'Quels signes évoquent une déshydratation chez le nourrisson ?', 'Fontanelle déprimée, pli cutané, perte de poids, yeux creux', ['Fontanelle bombée', 'Prise de poids rapide', 'Polyurie claire'], 'Perte de poids > 10 % = déshydratation sévère.'],
  ['pedia', 'Quelle position de couchage recommandée pour un nourrisson ?', 'Sur le dos, dans un lit sans tour de lit ni couverture', ['Sur le ventre', 'Sur le côté avec coussins', 'Dans le lit des parents'], 'Prévention de la mort inattendue du nourrisson.'],

  // Gériatrie
  ['geria', 'Quel outil évalue le risque de dénutrition chez la personne âgée ?', 'Le MNA (Mini Nutritional Assessment)', ['Le MMSE', 'L’échelle de Braden', 'Le score de Glasgow'], 'Le MMSE évalue les fonctions cognitives.'],
  ['geria', 'Quel critère définit la dénutrition chez la personne âgée (HAS 2021) ?', 'Perte de poids ≥ 5 % en 1 mois ou ≥ 10 % en 6 mois', ['IMC à 25', 'Prise de poids de 2 kg', 'Albumine à 40 g/L'], 'Plus IMC < 22 chez les ≥ 70 ans (critère phénotypique).'],
  ['geria', 'Quel test évalue le risque de chute ?', 'Le Timed Up and Go', ['Le test de Schirmer', 'Le test de Allen', 'Le MNA'], 'Anormal si > 20 secondes (selon référentiels).'],
  ['geria', 'Le syndrome confusionnel se caractérise par :', 'Un début brutal et une fluctuation de la vigilance', ['Une installation progressive sur des années', 'Une absence de cause', 'Une amélioration le soir'], 'Rechercher une cause : globe, fécalome, infection, médicament, déshydratation.'],
  ['geria', 'Quelle est la principale cause de iatrogénie chez la personne âgée ?', 'La polymédication', ['L’activité physique', 'L’alimentation équilibrée', 'La vaccination'], 'Réévaluer régulièrement les prescriptions.'],

  // Psy
  ['psy', 'Quelle mesure permet une hospitalisation sans consentement à la demande d’un tiers ?', 'SDT (soins à la demande d’un tiers)', ['SDRE', 'Soins libres', 'Sauvegarde de justice'], 'SDRE : sur décision du représentant de l’État (préfet).'],
  ['psy', 'Quels signes évoquent un risque suicidaire élevé ?', 'Plan précis, moyens disponibles, isolement, antécédents de TS', ['Projets d’avenir structurés', 'Bonne insertion sociale isolée', 'Absence d’idées noires'], 'Toujours évaluer : risque, urgence, dangerosité (RUD).'],
  ['psy', 'Qu’est-ce que le syndrome de sevrage alcoolique sévère ?', 'Le delirium tremens', ['La maladie de Parkinson', 'Le syndrome de Korsakoff uniquement', 'La schizophrénie'], 'Hallucinations, agitation, sueurs, fièvre : urgence vitale.'],
  ['psy', 'Quelle vitamine prévenir chez le patient alcoolo-dépendant ?', 'La vitamine B1 (thiamine)', ['La vitamine C', 'La vitamine D', 'La vitamine K'], 'Prévention de l’encéphalopathie de Gayet-Wernicke.'],
  ['psy', 'Qu’est-ce qu’une hallucination ?', 'Une perception sans objet', ['Une croyance fausse inébranlable', 'Une perte de mémoire', 'Une angoisse intense'], 'Le délire est une conviction erronée.'],
  ['psy', 'Un neuroleptique peut donner un syndrome malin se manifestant par :', 'Hyperthermie, rigidité, troubles de conscience', ['Hypothermie et hypotonie', 'Hypoglycémie isolée', 'Toux sèche'], 'Urgence : arrêt du neuroleptique, prise en charge médicale.'],

  // Onco / palliatif
  ['onco', 'Une neutropénie fébrile impose :', 'Une prise en charge urgente (hémocultures, antibiothérapie)', ['Une simple surveillance à domicile', 'Une transfusion de plaquettes', 'Un régime riche en fibres'], 'PNN < 0,5 G/L + fièvre ≥ 38,3 °C : urgence infectieuse.'],
  ['onco', 'Quel est l’objectif principal des soins palliatifs ?', 'Soulager les symptômes et préserver la qualité de vie', ['Guérir la maladie à tout prix', 'Accélérer le décès', 'Réaliser des examens invasifs'], 'Approche globale : physique, psychologique, sociale, spirituelle.'],
  ['onco', 'Quelle loi encadre la fin de vie et la sédation profonde et continue ?', 'La loi Claeys-Leonetti (2016)', ['La loi Kouchner (2002)', 'La loi Évin (1991)', 'La loi HPST (2009)'], 'Directives anticipées contraignantes, personne de confiance.'],
  ['onco', 'Une mucite buccale après chimiothérapie se prévient par :', 'Des bains de bouche et une hygiène buccale rigoureuse', ['Des aliments très acides', 'L’arrêt de l’hydratation', 'Le brossage avec brosse dure'], 'Brosse souple, bains de bouche au bicarbonate selon protocole.'],
  ['onco', 'Une extravasation de chimiothérapie nécessite :', 'L’arrêt immédiat de la perfusion et l’application du protocole', ['D’augmenter le débit', 'De masser la zone', 'D’attendre la fin de la poche'], 'Aspirer si possible, ne pas retirer le cathéter immédiatement selon protocole.'],

  // Douleur
  ['douleur', 'Quelle échelle d’auto-évaluation de la douleur va de 0 à 10 ?', 'L’EVA / EN', ['Algoplus', 'Doloplus', 'EDIN'], 'Algoplus/Doloplus : hétéro-évaluation chez la personne âgée non communicante.'],
  ['douleur', 'Les antalgiques de palier 2 OMS sont :', 'Les opioïdes faibles (tramadol, codéine)', ['Le paracétamol seul', 'La morphine', 'Les AINS seuls'], 'Palier 1 : non opioïdes ; palier 3 : opioïdes forts.'],
  ['douleur', 'Quel effet indésirable de la morphine prévenir systématiquement ?', 'La constipation', ['La diarrhée', 'L’hypertension', 'L’hyperglycémie'], 'Laxatif associé dès l’introduction.'],
  ['douleur', 'Quel signe de surdosage morphinique surveiller ?', 'Somnolence puis bradypnée (FR < 10)', ['Tachypnée', 'Mydriase', 'Hyperthermie'], 'Score de sédation + FR ; naloxone si dépression respiratoire.'],
  ['douleur', 'Quelle échelle pour la douleur du nouveau-né ?', 'EDIN ou DAN', ['EVA', 'Algoplus', 'MMSE'], 'EVENDOL pour l’enfant de moins de 7 ans aux urgences.'],
  ['douleur', 'Une PCA de morphine permet :', 'Au patient de s’administrer des bolus avec période réfractaire', ['Une administration sans limite', 'De remplacer la surveillance', 'D’injecter en IM'], 'Seul le patient appuie sur le bouton.'],

  // Législation
  ['legal', 'Quel texte définit les actes professionnels infirmiers ?', 'Le Code de la santé publique (R.4311-1 et s.)', ['Le Code de la route', 'Le Code civil uniquement', 'La Constitution'], 'Décret d’actes : rôle propre, sur prescription, en collaboration.'],
  ['legal', 'Le secret professionnel s’applique-t-il entre soignants ?', 'Le partage est possible entre professionnels de l’équipe de soins, dans l’intérêt du patient', ['Jamais, en aucun cas', 'Oui, à toute personne qui le demande', 'Seulement avec la famille'], 'Secret partagé encadré (art. L.1110-4 CSP).'],
  ['legal', 'Qui désigne la personne de confiance ?', 'Le patient majeur, par écrit', ['Le médecin', 'La famille', 'Le directeur de l’hôpital'], 'Révocable à tout moment.'],
  ['legal', 'La loi du 4 mars 2002 (loi Kouchner) concerne :', 'Les droits des malades (accès au dossier, consentement)', ['La lutte contre le tabagisme', 'La fin de vie uniquement', 'L’organisation des urgences'], 'Accès direct au dossier médical.'],
  ['legal', 'Une prescription médicale doit comporter :', 'Identification du patient et du prescripteur, date, signature, médicament, dose, voie, durée', ['Uniquement le nom du médicament', 'La seule signature', 'Le nom de l’infirmier'], 'Prescription écrite, qualitative et quantitative.'],
  ['legal', 'Les transmissions ciblées utilisent la méthode :', 'DAR (Données, Actions, Résultats)', ['SOAP uniquement', 'ABCDE', 'RUD'], 'Cible = préoccupation du patient.'],
  ['legal', 'Que signifie SBAR (SAED) ?', 'Situation, Background (antécédents), Assessment (évaluation), Recommendation (demande)', ['Soins, Bilan, Analyse, Rapport', 'Surveillance, Bilan, Alerte, Réanimation', 'Aucune'], 'Outil HAS de communication structurée.'],

  // Santé publique
  ['sp', 'Quelle est la première cause de mortalité évitable en France ?', 'Le tabac', ['L’alcool', 'Les accidents de la route', 'La pollution'], 'Environ 75 000 décès par an.'],
  ['sp', 'La prévention primaire vise à :', 'Éviter l’apparition de la maladie', ['Dépister précocement la maladie', 'Limiter les complications', 'Réinsérer le patient'], 'Secondaire : dépistage ; tertiaire : limiter séquelles/récidives.'],
  ['sp', 'Le dépistage organisé du cancer du sein concerne les femmes de :', '50 à 74 ans, tous les 2 ans', ['20 à 30 ans, chaque année', '80 ans et plus', 'Toutes les femmes dès 18 ans, tous les 6 mois'], 'Mammographie + examen clinique.'],
  ['sp', 'Qu’est-ce que l’incidence ?', 'Le nombre de nouveaux cas sur une période', ['Le nombre total de cas à un instant', 'Le nombre de décès', 'Le coût d’une maladie'], 'La prévalence = nombre total de cas à un instant donné.'],
  ['sp', 'Qu’est-ce que l’éducation thérapeutique du patient ?', 'Aider le patient à acquérir des compétences pour gérer sa maladie chronique', ['Donner un dépliant', 'Imposer un traitement', 'Un cours magistral à l’hôpital'], 'Diagnostic éducatif, objectifs, séances, évaluation.'],
];
