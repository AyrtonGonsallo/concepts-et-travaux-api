# concepts-et-travaux-api

API Node.js / Express pour la gestion des projets, devis, tâches, paiements et éléments de rénovation. Le projet est centré sur le calcul des devis de travaux, la gestion des pièces, des travaux, des visites, des paiements et des rôles/utilisateurs.

## 1. Vue d'ensemble

Cette API sert à :

- gérer les utilisateurs, rôles et autorisations ;
- gérer les projets, visites et paiements ;
- gérer les pièces, catégories, galeries, réalisations ;
- créer et recalculer des devis et tâches de travaux ;
- calculer des prix HT / TTC avec remises et TVA ;
- envoyer des emails, générer des liens de paiement et traiter les webhooks Stripe.

Le point d'entrée principal est `app.js`, qui monte les routes depuis `routes/index.js`.

## 2. Stack technique

- Node.js
- Express
- Sequelize
- MySQL / MariaDB
- Stripe
- Nodemailer
- EJS pour les templates e-mails
- Multer pour les uploads de fichiers

## 3. Structure du projet

```
concepts-et-travaux-api/
├── app.js
├── README.md
├── routes/
│   ├── index.js
│   ├── partie1.js
│   ├── partie2.js
│   ├── partie3.js
│   ├── ...
│   └── partie21.js
├── services/
│   ├── DevisCalculator.js
│   ├── DevisRecapitulator.js
│   ├── DevisArtisansFournisseurs.js
│   ├── pdf-generator.js
│   └── stripe.service.js
├── config/
│   └── database.js
├── files/
├── form-templates/
├── mails-templates/
├── images/
├── uploads/
├── *.js
├── package.json
├── .env
└── package-lock.json
```

### Fichiers clés

- `app.js` : boot de l'application et montage des routes.
- `routes/index.js` : agrège les fichiers `partieX.js`.
- `services/DevisCalculator.js` : moteur de calcul des prix de devis/tâches.
- `services/DevisRecapitulator.js` : variante de calcul/récapitulatif pour devis et marges.
- `DevisPiece.js` : modèle principal d'un devis de pièce.
- `DevisTache.js` : modèle des tâches incluses dans un devis.
- `Parametre.js` : paramètres globaux (TVA, coefficient).
- `Projet.js`, `Visite.js`, `Paiement.js` : gestion des projets, visites et paiements.

## 4. Installation

1. Cloner le repository.
2. Installer les dépendances :

```bash
npm install
```

3. Créer un fichier `.env` avec les variables nécessaires (base de données, SMTP, Stripe, etc.).

Exemple minimal :

```env
DB_HOST=localhost
DB_NAME=concepts_travaux
DB_USER=root
DB_PASSWORD=password
MAILS_HOST=smtp.example.com
MAILS_PORT=465
MAILS_USER=mail@example.com
MAILS_PASSWORD=secret
MAILS_TITLE=HomeRen
STRIPE_SECRET_KEY=...
```

4. Démarrer le serveur :

```bash
node app.js
```

Le serveur écoute sur le port `3000` par défaut.

## 5. Points d'entrée HTTP

L'application monte toutes les routes avec :

```js
app.use('/', routes);
```

et une route Stripe spécifique est exposée avec :

```js
app.post('/api-concepts-et-travaux/api/stripe/webhook', ...)
```

### 5.1 Route racine

- `GET /` : page HTML décrivant les endpoints principaux de l'API.

### 5.2 Groupes de routes (`/routes`)

Les endpoints sont séparés dans plusieurs fichiers :

- `routes/partie1.js` : utilisateurs, login, uploads, emails, devis et paiements initiaux.
- `routes/partie2.js` : gestion des projets, tâches et pièces.
- `routes/partie3.js` : gestion des travaux et devis.
- `routes/partie4.js` : sujets liés aux références et tissus d'éléments métiers.
- `routes/partie5.js` : gestion des contenus produits et contenus de projet.
- `routes/partie6.js` : éléments de navigation et références.
- `routes/partie7.js` : pièces, catégories, galeries, réalisations, étapes, besoins, FAQ.
- `routes/partie8.js` à `partie21.js` : extensions fonctionnelles (projets, devis, artisanat, paiements, visites et mises à jour de données).

La liste complète est montée via `routes/index.js` :

```js
router.use('/', require('./partie1'));
router.use('/', require('./partie2'));
router.use('/', require('./partie3'));
router.use('/', require('./partie4'));
router.use('/', require('./partie5'));
router.use('/', require('./partie6'));
router.use('/', require('./partie7'));
router.use('/', require('./partie8'));
router.use('/', require('./partie9'));
router.use('/', require('./partie10'));
router.use('/', require('./partie11'));
router.use('/', require('./partie12'));
router.use('/', require('./partie13'));
router.use('/', require('./partie14'));
router.use('/', require('./partie15'));
router.use('/', require('./partie16'));
router.use('/', require('./partie17'));
router.use('/', require('./partie18'));
router.use('/', require('./partie19'));
router.use('/', require('./partie20'));
router.use('/', require('./partie21'));
```

### 5.3 Exemples de endpoints principaux

Les fichiers `routes/partie1.js` et `routes/partie21.js` exposent les endpoints suivants :

- `GET /open-file/:fileName`
- `GET /get_utilisateur_by_email/:email`
- `GET /get_utilisateur_by_id/:id`
- `GET /get_all_user_data_by_id/:id`
- `GET /get_utilisateurs`
- `POST /login_user`
- `POST /upload`
- `POST /send-email`
- `GET /send-liste-devis-email/:deviceID`
- `GET /send_payed_devis_liste_to_user/:user_id/:device_id/:total`
- `GET /send_visited_devis_liste_to_user/:user_id/:device_id/:projet_id`
- `POST /add_visite`
- `PUT /update_visite/:id`
- `POST /add_paiement`
- `POST /add_demande_paiement`
- `PUT /update_demande_paiement/:id`
- `GET /ressend_demande_paiement/:id`
- `PUT /update_status_demande_paiement/:id`

Les endpoints de `routes/partie7.js` couvrent surtout :

- `GET /get_realisations`
- `GET /get_realisation/:id`
- `GET /get_pieces`
- `GET /get_piece/:id`
- `GET /get_etapes_projet`
- `GET /get_etape_projet/:id`
- `GET /get_besoins_projet`
- `GET /get_besoin_projet/:id`
- `GET /get_realisations_by_piece/:p_id`
- `GET /get_nbr_realisations/:count`
- `GET /get_nbr_pieces/:count`

Autrement dit, la logique métier est répartie sur de nombreux fichiers de routes, ce qui correspond à une architecture “split by feature area” plutôt qu’à un routeur unique monolithique.

## 6. Modèle des devis : `DevisTache.js`

Le fichier `DevisTache.js` décrit la table `DevisTache`.

### Champs importants

```js
ID
TravailID
DevisPieceID
TravailSlug
Commentaires
Prix
PrixDeVenteRemiseHT
PrixCoutant
PrixDebourseHT
PrixDeVenteHT
PrixDeVenteRemiseTTC
Donnees
```

### Rôle métier

- `TravailID` : identifie le travail demandé.
- `DevisPieceID` : rattache la tâche à un devis de pièce.
- `TravailSlug` : libellé/slug du type de travail.
- `Prix` : prix de vente remis HT ou prix global de la tâche.
- `PrixDebourseHT` : montant déboursé HT.
- `PrixCoutant` : coût réel de production / coûtant HT.
- `PrixDeVenteHT` : prix de vente HT.
- `PrixDeVenteRemiseHT` : prix de vente remisé HT.
- `PrixDeVenteRemiseTTC` : prix TTC après remise et TVA.
- `Donnees` : payload JSON du formulaire métier, très utilisé dans les tâches de calcul.

Le modèle est associé à `Travail` et à `DevisPiece`.

## 7. Les calculs de prix dans les services

Les calculs sont centralisés dans les services de pricing :

- `services/DevisCalculator.js`
- `services/DevisRecapitulator.js`

### 7.1 Paramètres globaux

Le projet récupère les valeurs dans `Parametre` :

- `Nom = 'TVA'`
- `Nom = 'coefficient'`

Cela donne deux variables importantes :

```js
const tva = 1 + (tvaValue / 100);
const coefficient = this.parametre_coef.Valeur;
```

Exemple :

- TVA = 20 % => `tva = 1.20`
- coefficient = 1.25 => application du facteur de marge/vente

### 7.2 Formule de calcul de base

La logique de base observée dans les services est la suivante :

1. Calcul du prix brut de la tâche selon le type de travail.
2. Application des remises du devis.
3. Multiplication par le coefficient.
4. Application de la TVA.

Formule simplifiée :

```text
prix_base = somme des éléments inclus dans la tâche

total_remise = somme des remises en % + remises fixes
total_remise = min(total_remise, prix_base)

prix_apres_remise = prix_base - total_remise
prix_ht = prix_apres_remise * coefficient
prix_tva = prix_ht * (TVA / 100)
prix_ttc = prix_ht + prix_tva
```

ou, de façon plus synthétique :

```text
prix_ttc = (prix_base - total_remise) * coefficient * (1 + TVA/100)
```

### 7.3 Remises

Dans `appliquerRemisesEtTaxes(...)`, les remises sont parcourues dans `Remise.findAll({ where: { DevisID: devis_id } })`.

- si `Type === 'pourcentage'` :

```text
montant = prix_base * (Pourcentage / 100)
```

- si `Type === 'fixe'` :

```text
total_remise += Valeur
```

Puis :

```text
total_remise = Math.min(total_remise, prix_base)
prix_apres_remise = prix_base - total_remise
```

### 7.4 Prix de vente et marge

Dans le code, la logique pousse plusieurs niveaux de calcul :

- prix déboursé : coût réel de réalisation ;
- prix HT après remise ;
- prix de vente HT : `prix_apres_remise * coefficient` ;
- prix TTC : `prix_vent_HT * (1 + TVA/100)`.

## 8. Rôle de `DevisCalculator.js`

`services/DevisCalculator.js` contient la logique la plus “métier” pour calculer un prix de tâche selon son identifiant.

### Ce qu’il fait

- charge des paramètres globaux (`TVA`, `coefficient`) ;
- charge les tâches générales (`TacheGenerale`) ;
- sélectionne la bonne méthode selon `tacheid` ;
- applique les remises et la TVA ;
- renvoie un objet avec :
  - `prix`
  - `prix_ht`
  - `prix_debourse_ht`
  - `prix_vente_remise_ht`
  - `PrixDeVenteHT`
  - `PrixDeVenteRemiseTTC`
  - `formule`
  - `formule_marge` (dans certaines implémentations)

### Les tâches couvertes

La méthode `calculer_prix(...)` / `calculer_prix_tache(...)` supporte des cas selon l’ID de tâche :

- `2`, `3`, `4`, `5`, `8`, `9`, `10`, `11`, `12`, `13`, `14`, `15`, `16`

Selon le service, chaque ID correspond à un type de travail (pose de cuisine, murs non porteurs, portes, radiateurs, plomberie, rénovation électrique, sanitaires, etc.).

### Exemple de logique métier

Par exemple, pour la pose d’un revêtement mural :

```text
surface = hauteur * longueur / 10000
sous_total = surface * prix_unitaire_gamme
```

Si un état de surface ou une dépose est nécessaire :

```text
prix += surface * prix_etat_surface
ou
prix += surface * prix_depose
```

Puis le calcul final applique les remises et la TVA.

## 9. Rôle de `DevisRecapitulator.js`

`services/DevisRecapitulator.js` est un recapitulateur / calculateur de synthèse. Il reprend la même logique de calcul par tâches avec plus de simplification et de “résumé” final.

### Ce qu’il fait

- initialise les tâches générales ;
- lit les paramètres de devis ;
- calcule le prix d’une tâche selon son ID ;
- construit `elements_recap` : éléments détaillés calculés ;
- applique les remises et taxes ;
- renvoie le résultat consolidé sous la forme :
  - `prix`
  - `formule`
  - `elements_recap`
  - `tva`
  - `coefficient`
  - `total_tva`

### Formule utilisée

```text
prix_base = somme des sous-totaux de chaque élément

total_remise = somme des remises du devis
if total_remise > prix_base => total_remise = prix_base

prix_apres_remise = prix_base - total_remise
prix_ht = prix_apres_remise * coefficient
prix_tva = prix_ht * (tva - 1)
prix_ttc = prix_ht * tva
```

Le code principal est présent dans :

```js
async appliquerRemisesEtTaxes({ prix_base, devis_id, coefficient, tva, formule })
```


1) Les deux services de calcul

Les services `services/DevisCalculator.js` et `services/DevisRecapitulator.js` sont le cœur du moteur de tarification du projet.

Ils ont la même logique générale :

- ils récupèrent les paramètres globaux du système :
  - `TVA` (ex. 20)
  - `coefficient` (ex. 1.25)
- ils lisent les données de formulaire de la tâche :
  - `donnees_json`
  - `formulaire`
- ils calculent un prix brut selon le type de tâche ;
- ils appliquent les remises du devis ;
- ils multiplient par le coefficient de vente ;
- ils ajoutent la TVA ;
- ils renvoient le montant final TTC ainsi qu’une formule explicative.

Le principe général est :

- Prix brut = somme des éléments calculés
- Remises = somme des remises du devis
- Prix après remises = prix brut - remises
- Prix HT = prix après remises × coefficient
- TVA = prix HT × (TVA / 100)
- Prix TTC = prix HT + TVA

Formule simplifiée :

PrixTTC = (PrixBase - TotalRemises) × coefficient × (1 + TVA/100)

2) Les règles métiers de base

Dans les deux services, les calculs de prix passent par :

- le prix déboursé : chiffre de coût réel ;
- le prix de vente : montant commercial, après coefficient ;
- le prix coûtant : parfois calculé via les données artisan / fournisseur et les postes de marge, surtout dans le moteur `DevisCalculator.js` ;
- le prix TTC final : montant rendu au client.

Le comportement général de `DevisRecapitulator.js` est plus simple :
- il retourne `prix`, `formule`, `elements_recap`, `tva`, `coefficient`, `total_tva`.

Le comportement de `DevisCalculator.js` est plus complet :
- il retourne aussi `prix_ht`, `prix_debourse_ht`, `prix_vente_remise_ht`, `PrixDeVenteHT`, `PrixDeVenteRemiseTTC`, `prix_marge`, `prix_marge_ht`, etc.

3) Formule globale de calcul des remises et taxes

Les remises sont récupérées via la table `Remise` avec :
- `DevisID`
- `Type`
- `Pourcentage`
- `Valeur`

Le service applique :

- si remise en pourcentage :
  montant = prix_base × (Pourcentage / 100)

- si remise fixe :
  total_remise += Valeur

Puis :

- total_remise = min(total_remise, prix_base)
- total_apres_remise = prix_base - total_remise
- total_ht = total_apres_remise × coefficient
- total_tva = (TVA / 100) × total_ht
- total_ttc = total_ht + total_tva

Autrement dit :

PrixTTC = (PrixBase - Remises) × coefficient × (1 + TVA/100)

4) Analyse par tâche

4.1 Tâche 2 – Pose de nouveaux équipements de cuisine

Dans `DevisCalculator.js` et `DevisRecapitulator.js`, cette tâche prend en compte :

- les éléments à déposer :
  - `gammes_depose_form`
  - chaque élément a un prix unitaire et une quantité
- les appareils à poser :
  - `appareils_cuisine`
  - si `active == true`, on prend le prix du modèle

Formule :

Pour chaque élément déposé :
- prix_local = quantité × prix_unitaire

Pour chaque appareil posé :
- prix_local = prix_modele

Total :
- PrixBase = somme des déposes + somme des poses

Puis application :
- remise
- coefficient
- TVA

Le prix de vente est donc :
- PrixVenteHT = PrixBaseAfterRemise × coefficient
- PrixTTC = PrixVenteHT × (1 + TVA/100)

4.2 Tâche 3 – Démolition / ouverture de murs non porteurs

Cette tâche calcule la surface de murs ou ouvertures :

- surface_mur = longueur × hauteur / 10000
- surface_ouverture = (longueur × hauteur) - (longueur_ouverture × hauteur_ouverture)
- conversion en m² selon les unités

Ensuite :

- prix_mur = surface_mur × prix_unitaire_cloison
- prix_ouverture = surface_ouverture × prix_unitaire_cloison

Si une ouverture impose un linteau :
- prix_linteau = longueur_ouverture / 100 × prix_linteau_unitaire

Donc :

- PrixBase = somme(murs) + somme(ouvertures) + éventuel linteau

Puis remises + coefficient + TVA.

4.3 Tâche 4 – Création de murs non porteurs + portes

Pour les murs :

- surface = longueur × hauteur / 10000
- prix_mur = surface × prix_unitaire_épaisseur

Pour les portes :

- prix_porte = 1 × prix_unitaire_porte

Donc :
- PrixBase = somme surfaces murs + somme portes

Puis application du coefficient et de la TVA.

4.4 Tâche 5 – Pose de revêtement mural

C’est une logique de surface + gamme + état de surface / dépose.

Pour chaque mur :

- surface = hauteur × longueur / 10000
- prix_gamme = surface × prix_gamme_unitaire
- prix_etat = surface × prix_etat_unitaire si l’état impose une préparation
- prix_depose = surface × prix_depose_unitaire si un revêtement doit être retiré

Donc :

PrixBase = Σ(surface × prix_gamme) + Σ(surface × prix_etat ou prix_depose)

Puis :
- remise
- coefficient
- TVA

4.5 Tâche 8 – Pose de revêtement sur plafond

Formule :

- surface = longueur × largeur / 10000
- prix_gamme = surface × prix_gamme
- si dépose nécessaire :
  - prix_depose = surface × prix_depose
- si pas de dépose :
  - prix_etat = surface × prix_etat_surface

Donc :

PrixBase = prix_depose ou prix_etat + prix_gamme

Puis coefficient + TVA.

4.6 Tâche 9 – Pose de revêtement de sol

Formule :

- surface = longueur × largeur / 10000
- prix_pose = surface × prix_gamme
- si dépose :
  - prix_depose = surface × prix_depose
- si pas de dépose :
  - prix_etat = surface × prix_etat_surface
- si plinthes :
  - prix_plinthes = surface × prix_plinthe_unitaire

Donc :

PrixBase = prix_pose + dépose/état + plinthes

Puis coefficient + TVA.

4.7 Tâche 10 – Remplacement de portes

Le service lit pour chaque porte :

- gamme
- nature
- type

Les prix unitaires sont extraits dans une chaine de type :

- `gamme:label:prix`
- `nature_porte:label:prix`
- `type_porte:label:prix`

Formule :

prix_porte = prix_gamme + prix_nature_porte + prix_type_porte

Puis :

PrixBase = somme(prix_porte)

4.8 Tâche 11 – Pose de plomberie

Cette tâche teste si des appareils sont fournis dans :
- `gammes-produits-pose-plomberie-cuisine`
ou
- `gammes-produits-pose-plomberie-salle-de-bain`

Ensuite :
- si appareil actif, on ajoute son prix ;
- si dépose demandée, on rajoute le prix fixe de dépose de plomberie.

Formule :

prix_appareil = prix_modele
si dépose :
  prix_total += prix_depose_standard

PrixBase = somme(prix_appareil + dépose)

Puis :
- remise
- coefficient
- TVA

4.9 Tâche 12 – Pose de radiateurs

Pour chaque radiateur :

- prix du type = `TypeParts[1]`
- prix de la gamme = `gammeParts[1]`

Formule :

prix_radiateur = prix_gamme

Le code additionne le prix de la gamme choisie, et le coût éventuel du type.

PrixBase = somme(prix_radiateur)

Puis :
- remise
- coefficient
- TVA

4.10 Tâche 13 – Rénovation électrique partielle

Cette tâche prend les éléments :

- `appareils_electrique_a_remplacer`
- `gamme` choisie
- `prix_tache_creation`
- `prix_tache_remplacement`

Les prix sont calculés par type d’appareil :

- nombre à créer = `nombre_a_creer`
- prix_creation = nombre_a_creer × prix_appareil × prix_tache_creation
- nombre à remplacer = `nombre_a_remplacer`
- prix_remplacement = nombre_a_remplacer × prix_appareil × prix_tache_remplacement

Formule :

PrixBase = Σ(nombre_a_creer × prix_appareil × prix_tache_creation)
         + Σ(nombre_a_remplacer × prix_appareil × prix_tache_remplacement)

Puis application :
- remise
- coefficient
- TVA

4.11 Tâche 14 – Dépose de revêtements muraux

Cette tâche se base sur la gamme du revêtement :

- Peinture
- Enduit décoratif
- Papier peint
- Carrelage mural
- Tissus
- Lambris mural
- Autre

Formule :

si gamme == "Peinture" :
  prix += surface × prix_retirer_peinture

si gamme == "Enduit decoratif" :
  prix += surface × prix_retirer_enduit

etc.

Donc :
- PrixBase = somme(surface × tarif de dépose par type)

4.12 Tâche 15 – Rénovation électrique complète

Cette tâche calcule :

- chauffage existant :
  - sousTotal = quantite_chauffage × prix_renovation_chauffage
- rénovation électrique : `surface × prix_renovation_electrique_complete`
- mise en sécurité :
  - sousTotal = 1 × prix_mise_en_securite

Donc :

PrixBase =
  (chauffage_exist ? quantite_chauffage × prix_renovation_chauffage : 0)
  + surface × prix_renovation_electrique_complete
  + (mise_en_securite ? 1 × prix_mise_en_securite : 0)

Puis coefficient + TVA.

4.13 Tâche 16 – Installation de nouveaux équipements sanitaires

Cette tâche calcule :

- appareils à poser :
  - prixModele = prix de l’appareil
- dépose d’éléments :
  - prixModele = quantite × prix_unitaire

Formule :

PrixBase =
  Σ(appareil_pose)
  + Σ(qte × prix_unitaire_depose)

Puis coefficient + TVA.

5) Prix coûtant vs prix de vente

Le point important est que le projet distingue clairement entre :

- prix déboursé / coût réel ;
- prix coûtant (coût de revient interne / marge issue du coût de production) ;
- prix de vente (après coefficient, remises et TVA).

Dans `DevisCalculator.js`, on a des éléments comme :

- `prix_marge`
- `prix_marge_ht`
- `formule_marge`

Cela montre que le code calcule deux familles de montants :

- un prix “déboursé” / client
- un prix “coûtant” / marge

Le principe de calcul est :

PrixCoutant = somme des coûts artisan/fournisseur liés aux éléments
PrixDeVenteHT = (PrixBaseAfterRemise × coefficient)
PrixTTC = PrixDeVenteHT × (1 + TVA/100)

En pratique, la logique est :

- le montant déboursé est la somme des coûts de matériaux / pose / dépose;
- le coûtant est le montant des coûts artisan/fournisseur sur les mêmes éléments;
- le prix de vente est le prix commercial du devis.

6) Conclusion

Les deux services se comportent comme un moteur de calcul de devis multi-tâches.

Le calcul suit toujours le même schéma :

- déterminer le type de tâche ;
- extraire les bons paramètres depuis le formulaire ;
- sommer les éléments unitaires ;
- appliquer les remises ;
- multiplier par le coefficient de vente ;
- appliquer la TVA.

Les tâches ne sont pas identiques, mais elles partagent toutes la même logique :

- `PrixBase`
- `PrixCoutant`
- `PrixDeVenteHT`
- `PrixTTC`

La différence essentielle entre les deux services est que :

- `DevisCalculator.js` est le moteur le plus complet et le plus détaillé ;
- `DevisRecapitulator.js` est le moteur plus synthétique, orienté récapitulatif.

C’est cette logique qui permet au projet d’obtenir des devis cohérents, avec une séparation nette entre :
- coût réel,
- marge,
- prix de vente,
- prix TTC final.





## 10. Dans quelles routes les services interviennent

Les services ne sont pas branchés dans un unique fichier de route dédié ; ils sont déclenchés depuis les endpoints qui manipulent `DevisPiece`, `DevisTache`, `Projet`, `Travail`, `Tva`, `Piece` et `Paiement`.

Les zones les plus importantes sont :

- `routes/partie1.js` : logique de devis, listes, emails, paiements, visites.
- `routes/partie7.js` : pièces, galeries, réalisations, étapes, besoins.
- `routes/partie21.js` : paiements, visites, artisan/fournisseur projet, mise à jour de demandes de paiement.

En pratique, le flux de devis suit généralement :

1. création / consultation d’un `Projet` ;
2. création d’un `DevisPiece` ;
3. ajout de `DevisTache` ;
4. calcul du prix de chaque tâche via `DevisCalculator` / `DevisRecapitulator` ;
5. stockage des résultats dans les champs `Prix*` de `DevisTache` ;
6. récupération pour l’affichage / export / paiement.

## 11. Différence entre les prix

Les champs du modèle permettent de distinguer clairement :

- `Prix` : prix global ou prix de vente remisé selon le contexte.
- `PrixCoutant` : coût réel / coûtant HT.
- `PrixDebourseHT` : montant déboursé HT.
- `PrixDeVenteHT` : prix de vente HT.
- `PrixDeVenteRemiseHT` : prix de vente fixé après réduction.
- `PrixDeVenteRemiseTTC` : prix final TTC.

En résumé, le flux est :

```text
prix brut de tâche
→ remise éventuelle
→ multiplicateur de vente (coefficient)
→ montant HT
→ TVA
→ montant TTC final
```

## 12. Synthèse

Ce projet est une API de gestion de travaux et de devis. Son cœur métier est la logique de calcul des tâches qui se base sur :

- `DevisTache` pour la structure de la tâche ;
- `DevisPiece` pour le devis de pièce ;
- `Parametre` pour la TVA et le coefficient ;
- `Remise` pour les réductions ;
- `services/DevisCalculator.js` et `services/DevisRecapitulator.js` pour le moteur de calcul.

## 13. Prochaine étape recommandée

Pour un développement propre, il serait utile de :

- centraliser les routes de devis dans un fichier dédié (ex: `routes/devis.js`) ;
- standardiser les noms de colonnes et de variables (`PrixDebourseHT`, `PrixDeVenteHT`, etc.) ;
- documenter chaque endpoint `partieX.js` individuellement ;
- ajouter des tests automatisés sur les formules de calcul et les remises.

## 14. Licence

Aucune licence explicite n’a été trouvée dans le repository à l’état actuel.

---

Ce README est une documentation technique du projet, orientée sur les points suivants :
- architecture globale ;
- routes principales ;
- logique des devis ;
- formules de calcul de prix ;
- rôle de `DevisCalculator` et `DevisRecapitulator`.


