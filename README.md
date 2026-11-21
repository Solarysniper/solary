# Révision IDE — application de révision infirmière pour iPad

Application web installable (PWA) : elle s'installe sur l'écran d'accueil de l'iPad, s'ouvre en plein écran comme une app et **fonctionne entièrement hors ligne**. Interface minimaliste, mode sombre par défaut (clair ou automatique dans Réglages).

## Contenu

- **Patients 3D** : 23 situations cliniques déclinées en 576 variantes chacune (sexe, gravité, service, jour/nuit, terrain : allergie, BMR, anticoagulant, barrière de la langue, homonyme…), soit 13 248 situations. 30 humains réalistes (hommes et femmes de tous âges) dans une chambre d'hôpital complète.
  - Vue de dessus, corps entier : on fait défiler le plateau d'instruments et on **glisse chaque instrument sur la bonne zone du corps** (brassard sur le bras, oxymètre au doigt, électrodes sur le thorax, masque sur le visage, cathéter à l'avant-bras…). Gestes animés, sons, expressions du patient (douleur, somnolence, dyspnée, grimace à la piqûre, parole).
  - **Entraînement** : chaque geste est commenté, indices sur ce qui manque.
  - **Évaluation** : aucune aide, chrono en temps réel optionnel (le patient se dégrade si on tarde), note /20 avec grille critère par critère, retards, erreurs et pièges.
- **QCM** : ~880 questions rédigées ou générées (pharmacologie, normes, vocabulaire…) + calculs de doses générés à l'infini (débits, PSE, mg/kg, dilutions, héparine, Glasgow…). Entraînement ou évaluation notée, chrono réglable, 400+ catégories avec recherche.
- **Fiches** : 126 fiches (cours, médicaments, situations, tableaux de normes, lexique) + vos propres résumés.
- **Cours** : import PDF, Word (.docx), texte, photos ; résumé automatique, cartes et QCM générés hors ligne. Option IA (Claude) avec votre propre clé API pour fiches rédigées, transcription de photos, QCM et questions.
- **Cartes mémoire** à répétition espacée, **dictionnaire** (lexique intégré + Wikipédia en ligne), **statistiques**, sauvegarde/export.

## Installer sur l'iPad

1. Publier le site (une seule fois) : dans GitHub → *Settings* → *Pages* → *Source* : **GitHub Actions**, puis fusionner cette branche dans `main`. L'adresse sera `https://<votre-compte>.github.io/<dépôt>/`.
2. Sur l'iPad, ouvrir cette adresse dans **Safari** → bouton **Partager** → **Sur l'écran d'accueil**.
3. Ouvrir l'app une première fois connecté(e) : tout est mis en cache (les 30 patients 3D, environ 70 Mo, se téléchargent en arrière-plan ; état visible dans Réglages → Hors ligne). Ensuite, plus besoin de connexion.

> Un fichier `.ipa` (App Store / sideloading) nécessite un Mac avec Xcode et un compte Apple Developer. Ce code peut être empaqueté tel quel avec Capacitor (`npx cap add ios`) si vous en avez besoin plus tard ; la PWA offre la même expérience sans ces contraintes.

## Développement

- Aucune étape de compilation : HTML, CSS et JavaScript (modules ES) servis tels quels. `python3 -m http.server` suffit pour tester.
- Après modification des fichiers, régénérer la liste de cache hors ligne : `tools/gen-sw.sh`.
- Batterie : aucune boucle d'animation permanente ; la 3D est rendue à la demande (animations courtes pendant les gestes, respiration/scope à ~10 i/s désactivables dans Réglages), ombres recalculées seulement quand la scène change.

## Crédits

- Personnages 3D : [Microsoft Rocketbox Avatar Library](https://github.com/microsoft/Microsoft-Rocketbox), licence MIT (voir `patients/LICENSE-Rocketbox.md`), convertis et allégés pour le web.
- [three.js](https://threejs.org) (MIT), [pdf.js](https://mozilla.github.io/pdf.js/) (Apache 2.0), SDK Anthropic (MIT).
- Contenu pédagogique fourni à titre de révision : vérifiez toujours avec vos cours, les protocoles de votre établissement et les recommandations officielles.
