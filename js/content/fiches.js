// Fiches de révision intégrées (format markdown léger)
export const FICHES = [
{ id: 'f-constantes', theme: 'soins', title: 'Constantes vitales de l’adulte', body: `
## Normes
| Paramètre | Normale | Alerte |
|---|---|---|
| FC | 60–100 /min | < 50 ou > 120 |
| PA | 100–140 / 60–90 mmHg | PAS < 90 ou > 180 |
| FR | 12–20 /min | < 10 ou > 25 |
| SpO₂ | 95–100 % | < 92 % (BPCO < 88 %) |
| T° | 36,5–37,5 °C | ≥ 38,5 ou < 35 |
| Diurèse | 0,5–1 mL/kg/h | < 0,5 mL/kg/h |

## Bonnes pratiques
- Patient au **repos 5 min**, assis ou allongé pour la PA.
- Brassard adapté à la circonférence du bras.
- FR comptée **1 minute entière**, sans que le patient le sache.
- Toujours **comparer aux valeurs précédentes** et tracer.

## Score NEWS2
Agrège FR, SpO₂, PAS, FC, conscience, T° → score ≥ 5 : **alerte médicale urgente** ; ≥ 7 : urgence vitale.
`},
{ id: 'f-glasgow', theme: 'neuro', title: 'Score de Glasgow', body: `
## Ouverture des yeux (Y)
- 4 spontanée · 3 à la demande · 2 à la douleur · 1 aucune

## Réponse verbale (V)
- 5 orientée · 4 confuse · 3 inappropriée · 2 incompréhensible · 1 aucune

## Réponse motrice (M)
- 6 obéit · 5 orientée (localise) · 4 évitement · 3 flexion stéréotypée (décortication) · 2 extension (décérébration) · 1 aucune

## Interprétation
- **15** : conscience normale · **≤ 8** : coma grave → protéger les voies aériennes
- Total de **3 à 15**. Noter le détail : Y?V?M?
- Associer à l’examen des **pupilles** (taille, symétrie, réactivité).
`},
{ id: 'f-calculs', theme: 'calc', title: 'Formules de calcul de doses', body: `
## Débits
- **mL/h** = volume (mL) ÷ durée (h)
- **gouttes/min** = volume (mL) × 20 ÷ durée (min)  *(perfuseur standard : 1 mL = 20 gouttes)*
- Microgouttes : 1 mL = 60 gouttes → gouttes/min = mL/h

## Pousse-seringue électrique (PSE)
- Concentration = quantité ÷ volume total
- **Vitesse (mL/h)** = dose prescrite par heure ÷ concentration

## Pourcentages
- Une solution à **x %** contient **x g pour 100 mL**
- G5 % 500 mL = 25 g de glucose · NaCl 0,9 % 1 L = 9 g de NaCl · KCl 10 % 10 mL = 1 g

## Conversions
- 1 g = 1 000 mg = 1 000 000 µg
- 1 L = 1 000 mL · 1 mL = 1 cm³
- 1 h = 60 min

## Règle de trois
Dose voulue ÷ dose disponible × volume = volume à prélever.

> Toujours vérifier la cohérence du résultat et faire un double contrôle pour les médicaments à risque.
`},
{ id: 'f-diabete', theme: 'endoc', title: 'Diabète : hypo et hyperglycémie', body: `
## Hypoglycémie (< 0,70 g/L)
**Signes** : sueurs, tremblements, pâleur, palpitations, faim, troubles du comportement, confusion, convulsions, coma.

**Conduite** :
1. Patient conscient : **15 g de sucre rapide** (3 morceaux ou 150 mL de jus)
2. Contrôle à **15 min**, renouveler si besoin
3. Collation avec sucres lents
4. Inconscient : **glucagon IM/SC** ou **G30 % IV** sur prescription, PLS

## Hyperglycémie / acidocétose
**Signes** : polyurie, polydipsie, amaigrissement, déshydratation, haleine cétonique, dyspnée de Kussmaul, douleurs abdominales.
- Recherche de **cétonémie** si glycémie > 2,5 g/L
- Insuline IV, réhydratation, **surveillance kaliémie**

## Insulines
| Type | Début | Durée |
|---|---|---|
| Rapide (analogue) | 10–15 min | 3–5 h |
| Intermédiaire (NPH) | 1–2 h | 12–16 h |
| Lente (basale) | 1–2 h | ~24 h |

- Rotation des sites (abdomen, cuisses, bras) → éviter les **lipodystrophies**.
`},
{ id: 'f-avk', theme: 'pharma', title: 'Anticoagulants', body: `
## Héparines
- **HNF** : surveillance TCA ou anti-Xa ; antidote **protamine**
- **HBPM** (énoxaparine) : SC, anti-Xa si besoin, attention IR
- **Plaquettes** 2×/semaine : risque de **TIH**

## AVK (fluindione, warfarine)
- Surveillance **INR** : cible 2–3 (valve mécanique 2,5–3,5)
- Interactions nombreuses (antibiotiques, AINS, aliments riches en vitamine K)
- Antidote : **vitamine K** ± **PPSB**

## AOD (apixaban, rivaroxaban, dabigatran)
- Pas de surveillance biologique de routine, mais **fonction rénale**
- Antidotes spécifiques : idarucizumab (dabigatran), andexanet (anti-Xa)

## Éducation
- Carnet de suivi, signes de saignement (gencives, hématurie, selles noires)
- Pas d’AINS ni d’IM, rasoir électrique, signaler le traitement à tout soignant
`},
{ id: 'f-precautions', theme: 'hyg', title: 'Précautions standard et complémentaires', body: `
## Précautions standard (tous les patients)
- **Hygiène des mains** : FHA avant/après contact, avant geste aseptique, après exposition à un liquide biologique, après contact avec l’environnement
- **Gants** si risque de contact avec liquides biologiques ou peau lésée
- **Protection** de la tenue (tablier) et du visage (masque + lunettes) si projections
- Gestion des **excreta**, de l’environnement et des **AES**

## Complémentaires
| Type | Exemples | Mesures |
|---|---|---|
| Contact | BMR, gale, C. difficile | Chambre seule, tablier, gants, matériel dédié |
| Gouttelettes | Grippe, coqueluche, méningocoque | Masque chirurgical soignant |
| Air | Tuberculose, rougeole, varicelle | **FFP2**, porte fermée |

> C. difficile et gale : **lavage au savon doux** avant la FHA (spores, sarcoptes).
`},
{ id: 'f-acr', theme: 'urg', title: 'Arrêt cardio-respiratoire', body: `
## Reconnaître
Inconscient + ne respire pas ou respiration anormale (gasps).

## Agir
1. **Alerter** (15/112), demander un DAE
2. **Compressions** : 100–120/min, 5–6 cm, relâchement complet
3. **30 compressions / 2 insufflations**
4. **DAE** dès que disponible ; minimiser les interruptions
5. Relais toutes les 2 min

## En milieu hospitalier
- Adrénaline **1 mg IV** toutes les 3–5 min (rythme non choquable : dès que possible ; choquable : après le 3e choc)
- Amiodarone 300 mg après le 3e choc
- Rechercher les causes réversibles : **4H / 4T** (hypoxie, hypovolémie, hypo/hyperkaliémie, hypothermie ; thrombose, tamponnade, toxiques, pneumothorax suffocant)
`},
{ id: 'f-choc', theme: 'urg', title: 'États de choc', body: `
## Définition
Insuffisance circulatoire aiguë → hypoperfusion tissulaire.

## Signes
- Tachycardie, **hypotension** (PAS < 90), pouls filant
- **Marbrures**, extrémités froides, TRC > 3 s
- Oligurie, troubles de conscience, polypnée
- Lactates > 2 mmol/L

## Types
| Choc | Cause | Traitement clé |
|---|---|---|
| Hypovolémique | Hémorragie, déshydratation | Remplissage, transfusion |
| Septique | Infection | Antibiotiques précoces, remplissage, noradrénaline |
| Cardiogénique | IDM, IC | Inotropes (dobutamine) |
| Anaphylactique | Allergie | **Adrénaline** |

## Rôle infirmier
Position adaptée (jambes surélevées sauf cardiogénique), 2 VVP, O₂, scope, surveillance rapprochée, diurèse horaire.
`},
{ id: 'f-douleur', theme: 'douleur', title: 'Évaluation et traitement de la douleur', body: `
## Évaluer
- **Auto-évaluation** : EVA, EN (0–10), EVS
- **Hétéro-évaluation** : Algoplus (aigu, personne âgée), Doloplus, ECPA, EDIN (nouveau-né), EVENDOL (enfant)
- Caractériser : **PQRST** (provoqué, qualité, région/irradiation, sévérité, temps)

## Paliers OMS
1. Non opioïdes : paracétamol, AINS, néfopam
2. Opioïdes faibles : tramadol, codéine
3. Opioïdes forts : morphine, oxycodone, fentanyl

## Morphine : surveillance
- **FR** (< 10 = alerte), **score de sédation**, EVA, transit (laxatif systématique), diurèse
- Antidote : **naloxone** titrée

## Non médicamenteux
Installation, froid/chaud, relaxation, distraction, toucher-massage.
`},
{ id: 'f-transfusion', theme: 'soins', title: 'Transfusion sanguine', body: `
## Avant
- Prescription, 2 déterminations de groupe + RAI < 72 h
- Information et consentement, constantes de référence

## Au lit du patient
- **Contrôle ultime pré-transfusionnel** : concordance identité / documents / poche + **test de compatibilité ABO**
- Pose dans les **6 h** après réception du CGR

## Surveillance
- Rester **15 premières minutes** auprès du patient
- Constantes : début, 15 min, fin, et selon protocole
- Signes d’alerte : frissons, fièvre, douleurs lombaires, dyspnée, hypotension, urticaire
  → **arrêter**, garder la poche, appeler le médecin, déclarer (hémovigilance)
`},
{ id: 'f-escarre', theme: 'soins', title: 'Escarres : prévention et stades', body: `
## Facteurs de risque
Immobilité, dénutrition, incontinence, troubles neurologiques, âge, déshydratation.

## Évaluer
Échelles de **Braden** (≤ 18 : risque) ou Norton.

## Prévenir
- Changements de position **toutes les 2–3 h**, décubitus 30°
- Support adapté (matelas à air), **pas de massage ni friction**
- Hygiène et protection de la peau, nutrition et hydratation

## Stades (NPUAP)
1. Rougeur persistante ne blanchissant pas
2. Phlyctène ou abrasion superficielle
3. Perte cutanée totale, graisse visible
4. Atteinte musculaire ou osseuse
`},
{ id: 'f-ic', theme: 'cardio', title: 'Insuffisance cardiaque et OAP', body: `
## IC gauche
Dyspnée d’effort puis de repos, **orthopnée**, toux, crépitants → **OAP**.

## IC droite
**OMI**, turgescence jugulaire, hépatomégalie, reflux hépato-jugulaire, prise de poids.

## OAP : rôle infirmier
- Position **assise jambes pendantes**
- O₂, scope, VVP, ECG
- Diurétique (furosémide IV), dérivés nitrés sur prescription
- Surveillance : FR, SpO₂, PA, **diurèse**, kaliémie

## Éducation
Pesée quotidienne (alerte si **+2 kg en 3 j**), régime peu salé, observance, activité adaptée.
`},
{ id: 'f-avc', theme: 'neuro', title: 'AVC', body: `
## Reconnaître : VITE
**V**isage paralysé · **I**nertie d’un membre · **T**rouble de la parole · **E**n urgence : 15

## Prise en charge
- Noter l’**heure de début** des symptômes
- Imagerie cérébrale en urgence (IRM/scanner)
- Thrombolyse jusqu’à **4 h 30**, thrombectomie jusqu’à 6 h (voire 24 h)

## Surveillance infirmière
- Conscience (Glasgow), score NIHSS, pupilles
- PA (pas de baisse brutale), glycémie, T°
- **Test de déglutition** avant toute alimentation
- Prévention escarres, installation du membre plégique, mobilisation
`},
{ id: 'f-bpco', theme: 'pneumo', title: 'Asthme et BPCO', body: `
## Asthme
- Inflammation bronchique, obstruction **réversible**
- Crise : dyspnée expiratoire, sibilants, toux
- Gravité : difficulté à parler, DEP < 50 %, silence auscultatoire, cyanose
- Traitement : **salbutamol** inhalé, corticoïdes, O₂

## BPCO
- Obstruction **non réversible**, principalement due au **tabac**
- Exacerbation : majoration dyspnée, expectorations purulentes
- **SpO₂ cible 88–92 %** (risque d’hypercapnie)

## Éducation
Technique d’inhalation (chambre d’inhalation), sevrage tabagique, vaccination, activité physique, kinésithérapie respiratoire.
`},
{ id: 'f-perf', theme: 'soins', title: 'Perfusion périphérique (CVP)', body: `
## Pose
- Hygiène des mains, antisepsie en **4 temps** (détersion, rinçage, séchage, antiseptique alcoolique)
- Choisir la veine la plus distale, éviter les plis et le membre avec FAV/curage
- Pansement transparent stérile, date de pose tracée

## Surveillance
- Point de ponction : rougeur, douleur, induration, écoulement → **veinite**
- Débit, quantité passée, intégrité de la ligne
- Réévaluation **quotidienne** de la nécessité

## Complications
Veinite, extravasation, infection, obstruction, embolie gazeuse.
`},
{ id: 'f-legal', theme: 'legal', title: 'Cadre légal de l’exercice infirmier', body: `
## Textes clés
- **Code de la santé publique** : art. R.4311-1 à R.4311-15 (actes), R.4312 (déontologie)
- Loi **Kouchner** (2002) : droits des malades
- Loi **Claeys-Leonetti** (2016) : fin de vie
- Loi **HPST** (2009) : organisation hospitalière

## Rôle propre / prescrit
- **Rôle propre** (R.4311-5) : soins d’hygiène, surveillance, prévention, éducation…
- **Sur prescription** (R.4311-7) : injections, perfusions, prélèvements…
- **En présence d’un médecin** (R.4311-9) et **en collaboration**

## Responsabilités
Civile (réparation), pénale (sanction), disciplinaire (employeur / Ordre).

## Secret professionnel
Art. 226-13 du Code pénal ; partage possible au sein de l’équipe de soins, dans l’intérêt du patient.
`},
{ id: 'f-pediatrie', theme: 'pedia', title: 'Constantes pédiatriques', body: `
| Âge | FC (/min) | FR (/min) | PAS (mmHg) |
|---|---|---|---|
| Nouveau-né | 120–160 | 40–60 | 60–80 |
| Nourrisson | 100–150 | 30–40 | 70–100 |
| 2–5 ans | 90–130 | 25–30 | 80–110 |
| 6–12 ans | 70–110 | 20–25 | 90–115 |
| Adolescent | 60–100 | 12–20 | 100–130 |

## Signes de lutte respiratoire
Tirage, battement des ailes du nez, balancement thoraco-abdominal, entonnoir xiphoïdien, geignement.

## Déshydratation
Perte de poids, pli cutané, fontanelle déprimée, yeux creux, muqueuses sèches, oligurie.
`},
{ id: 'f-geria', theme: 'geria', title: 'Gériatrie : syndromes clés', body: `
## Chutes
Facteurs : médicaments, troubles visuels, sarcopénie, hypotension orthostatique, environnement. Test : **Timed Up and Go**.

## Dénutrition (HAS 2021)
- Perte de poids ≥ 5 % / 1 mois ou ≥ 10 % / 6 mois
- IMC < 22 (≥ 70 ans), sarcopénie
- Outil : **MNA**

## Confusion
Début **brutal**, fluctuant. Chercher : globe, fécalome, infection, déshydratation, médicament, douleur.

## Iatrogénie
Polymédication, insuffisance rénale : réévaluer régulièrement les traitements.
`},
{ id: 'f-psy', theme: 'psy', title: 'Soins sans consentement', body: `
## SDT — à la demande d’un tiers
- Troubles rendant impossible le consentement + état imposant des soins immédiats
- Demande du tiers + **2 certificats médicaux** (1 seul si péril imminent)

## SDRE — sur décision du représentant de l’État
- Troubles compromettant la **sûreté des personnes** ou l’ordre public
- Arrêté du **préfet** sur certificat médical

## Période d’observation
72 h, certificats à 24 h et 72 h ; contrôle du **juge des libertés** avant 12 jours.

## Évaluation du risque suicidaire : RUD
**R**isque (facteurs), **U**rgence (plan, scénario), **D**angerosité (létalité, accès aux moyens).
`},
{ id: 'f-pharma-base', theme: 'pharma', title: 'Pharmacocinétique', body: `
## ADME
- **Absorption** : passage dans la circulation (biodisponibilité, 1er passage hépatique)
- **Distribution** : fixation protéique (albumine), diffusion tissulaire
- **Métabolisme** : surtout hépatique (cytochromes)
- **Élimination** : rénale, biliaire

## Notions
- **Demi-vie** : temps pour que la concentration diminue de moitié ; ~5 demi-vies pour l’état d’équilibre
- **Marge thérapeutique étroite** : digoxine, lithium, AVK, aminosides, antiépileptiques
- Adapter chez l’insuffisant rénal / hépatique, la personne âgée, l’enfant, la femme enceinte
`},
{ id: 'f-sante-pub', theme: 'sp', title: 'Santé publique : notions', body: `
## Prévention (OMS)
- **Primaire** : éviter l’apparition (vaccination, hygiène de vie)
- **Secondaire** : dépister tôt (dépistages organisés)
- **Tertiaire** : limiter les complications et récidives

## Indicateurs
- **Incidence** : nouveaux cas sur une période
- **Prévalence** : total des cas à un instant
- **Mortalité / morbidité**

## Dépistages organisés
- Sein : femmes 50–74 ans, mammographie tous les 2 ans
- Côlon : 50–74 ans, test immunologique tous les 2 ans
- Col de l’utérus : 25–65 ans
`},
];
