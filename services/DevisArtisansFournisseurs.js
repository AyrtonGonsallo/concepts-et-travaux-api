const express = require('express');
const app = express();
const Utilisateur=require('../Utilisateur')
const Projet=require('../Projet')
const ArtisanFournisseurProjet = require('../ArtisanFournisseurProjet'); 
const Gamme = require('../Gamme'); 
const ModeleEquipement = require('../ModeleEquipement'); 


class DevisArtisansFournisseurs {


    constructor() {
      
    }
  
    // Fonction pour calculer le prix en fonction de devispiece et index
    async add_artisan_fournisseur_datas(tacheid,donnees,devis_id,projet_id) {
        let donnees_json=donnees["formulaire"]
        let titre=donnees["nomtache"]
        console.log("calcul du prix de la tache ",titre," d'id ",tacheid," du devis ",devis_id)
        
        let prix=0
        switch (tacheid) {
            case 2:
                prix = await this.add_datas_tache_2(donnees_json, devis_id, projet_id);
                break;
            case 3:
                prix = await this.add_datas_tache_3(donnees_json, devis_id, projet_id);
                break;
            case 4:
                prix = await this.add_datas_tache_4(donnees_json, devis_id, projet_id);
                break;
            case 5:
                prix = await this.add_datas_tache_5(donnees_json, devis_id, projet_id);
                break;
            case 10:
                prix = await this.add_datas_tache_10(donnees_json, devis_id, projet_id);
                break;
            case 11:
                prix = await this.add_datas_tache_11(donnees_json, devis_id, projet_id);
                break;
            case 12:
                prix = await this.add_datas_tache_12(donnees_json, devis_id, projet_id);
                break;
            case 9:
                prix = await this.add_datas_tache_9(donnees_json, devis_id, projet_id);
                break;
            case 8:
                prix = await this.add_datas_tache_8(donnees_json, devis_id, projet_id);
                break;
            case 13:
                prix = await this.add_datas_tache_13(donnees_json, devis_id, projet_id);
                break;
            case 14:
                prix = await this.add_datas_tache_14(donnees_json, devis_id, projet_id);
                break;
            case 15:
                prix = await this.add_datas_tache_15(donnees_json, devis_id, projet_id);
                break;
            case 16:
                prix = await this.add_datas_tache_16(donnees_json, devis_id, projet_id);
                break;                
            default:
                throw new Error(`Tâche inconnue avec l'ID ${tacheid}`);
        }
        
        return prix
    }


    async add_datas_tache_5(donnees_json, devis_id, projet_id) {
    // --- Garde-fous sur les données d'entrée ---
    const murs = donnees_json?.["dimensions-pose-murs"]?.murs;
    const gammesProduits = donnees_json?.["gammes-produits-pose-murs"]?.murs;
    // etatSurfaces n'était pas utilisé dans l'original : conservé en commentaire
    // const etatSurfaces = donnees_json?.["etat-surfaces-pose-murs"]?.murs;

    if (!Array.isArray(murs) || murs.length === 0) {
        console.warn("[add_datas_tache_5] Aucun mur à traiter.");
        return true;
    }
    if (!Array.isArray(gammesProduits)) {
        console.warn("[add_datas_tache_5] 'gammes-produits-pose-murs'.murs invalide ou absent.");
        return true;
    }

    // --- Helper : parse "id<sep>Nature<sep>Montant" ---
    const parseEntree = (valeurBrute, separateur, label) => {
        if (typeof valeurBrute !== "string" || valeurBrute.trim() === "") {
            return null;
        }
        const parts = valeurBrute.split(separateur);
        if (parts.length < 3) {
            console.warn(
                `[add_datas_tache_5] ${label} format invalide (attendu 3 parties, reçu ${parts.length}) :`,
                valeurBrute
            );
            return null;
        }
        const id = parseInt(parts[0], 10);
        const nature = parts[1];
        const montant = parseFloat(parts[2]);

        if (!Number.isFinite(id)) {
            console.warn(`[add_datas_tache_5] ${label} id invalide :`, parts[0]);
            return null;
        }
        if (!Number.isFinite(montant)) {
            console.warn(`[add_datas_tache_5] ${label} montant invalide :`, parts[2]);
            return null;
        }
        if (!nature || nature.trim() === "") {
            console.warn(`[add_datas_tache_5] ${label} nature vide.`);
            return null;
        }
        return { id, nature, montant };
    };

    // --- Helper : enregistre une ligne via son entrée parsée ---
    const traiterLigne = async (entree, role, label) => {
        if (!entree) return;

        const gamme = await Gamme.findByPk(entree.id);
        if (!gamme) {
            console.warn(`[add_datas_tache_5] Gamme introuvable (id=${entree.id}, ${label})`);
            return;
        }

        const utilisateurID = role === "fournisseur" ? gamme.FournisseurID : gamme.ArtisanID;
        if (!utilisateurID) {
            console.warn(`[add_datas_tache_5] ${role} absent pour la gamme ${entree.id} (${label})`);
            return;
        }

        await this.ajouterArtisanFournisseurProjet({
            NatureDesTravaux: entree.nature,
            Montant: entree.montant,
            ProjetID: projet_id,
            DevistacheID: devis_id,
            UtilisateurID: utilisateurID
        });
    };

    // --- Boucle séquentielle sur les murs (au lieu de forEach async) ---
    const total = Math.min(murs.length, gammesProduits.length);
    if (murs.length !== gammesProduits.length) {
        console.warn(
            `[add_datas_tache_5] Incohérence de taille : murs=${murs.length}, ` +
            `gammesProduits=${gammesProduits.length}. Traitement limité à ${total}.`
        );
    }

    for (let index = 0; index < total; index++) {
        const gammeData = gammesProduits[index];
        if (!gammeData) {
            console.warn(`[add_datas_tache_5] Gamme manquante pour le mur ${index}, ignoré.`);
            continue;
        }

        // On ne traite que si artisan_pose est renseigné (comportement d'origine)
        if (!gammeData.artisan_pose) {
            continue;
        }

        // Les 4 entrées attendues pour ce mur
        const taches = [
            { valeur: gammeData.artisan_pose,     sep: ":", role: "artisan",     label: `artisan_pose (mur ${index})` },
            { valeur: gammeData.fournisseur_pose, sep: ":", role: "fournisseur", label: `fournisseur_pose (mur ${index})` },
            { valeur: gammeData.artisan_depose,   sep: ":", role: "artisan",     label: `artisan_depose (mur ${index})` },
            { valeur: gammeData.artisan_surfaces, sep: "-", role: "artisan",     label: `artisan_surfaces (mur ${index})` }
        ];

        for (const { valeur, sep, role, label } of taches) {
            const entree = parseEntree(valeur, sep, label);
            if (!entree) continue;

            try {
                await traiterLigne(entree, role, label);
            } catch (err) {
                // Une erreur sur une ligne ne bloque pas les suivantes
                console.error(`[add_datas_tache_5] Erreur sur ${label} :`, err);
            }
        }
    }

    return true;
}



  

async add_datas_tache_2(donnees_json, devis_id, projet_id) {
    // --- Garde-fous sur les données d'entrée ---
    const appareils_cuisine = donnees_json?.["gammes-produits-pose-elementcuisines"]?.appareils_cuisine;
    // gammes_depose_form n'était pas utilisé dans l'original : conservé en commentaire
    // const gammes_depose_form = donnees_json?.["dimensions-pose-elementcuisines"]?.gammes_depose_form;

    if (!Array.isArray(appareils_cuisine) || appareils_cuisine.length === 0) {
        console.warn("[add_datas_tache_2] Aucun appareil cuisine à traiter.");
        return true;
    }

    // --- Helper : parse "id:Nature:Montant" ---
    const parseEntree = (valeurBrute, label) => {
        if (typeof valeurBrute !== "string" || valeurBrute.trim() === "") {
            return null;
        }
        const parts = valeurBrute.split(":");
        if (parts.length < 3) {
            console.warn(
                `[add_datas_tache_2] ${label} format invalide (attendu 3 parties, reçu ${parts.length}) :`,
                valeurBrute
            );
            return null;
        }
        const id = parseInt(parts[0], 10);
        const nature = parts[1];
        const montant = parseFloat(parts[2]);

        if (!Number.isFinite(id)) {
            console.warn(`[add_datas_tache_2] ${label} id invalide :`, parts[0]);
            return null;
        }
        if (!Number.isFinite(montant)) {
            console.warn(`[add_datas_tache_2] ${label} montant invalide :`, parts[2]);
            return null;
        }
        if (!nature || nature.trim() === "") {
            console.warn(`[add_datas_tache_2] ${label} nature vide.`);
            return null;
        }
        return { id, nature, montant };
    };

    // --- Helper : enregistre une ligne via son entrée parsée ---
    const traiterLigne = async (entree, role, label) => {
        if (!entree) return;

        const gamme = await Gamme.findByPk(entree.id);
        if (!gamme) {
            console.warn(`[add_datas_tache_2] Gamme introuvable (id=${entree.id}, ${label})`);
            return;
        }

        const utilisateurID = role === "fournisseur" ? gamme.FournisseurID : gamme.ArtisanID;
        if (!utilisateurID) {
            console.warn(`[add_datas_tache_2] ${role} absent pour la gamme ${entree.id} (${label})`);
            return;
        }

        await this.ajouterArtisanFournisseurProjet({
            NatureDesTravaux: entree.nature,
            Montant: entree.montant,
            ProjetID: projet_id,
            DevistacheID: devis_id,
            UtilisateurID: utilisateurID
        });
    };

    // --- Boucle séquentielle (au lieu de forEach async) ---
    for (let index = 0; index < appareils_cuisine.length; index++) {
        const element = appareils_cuisine[index];
        if (!element?.active) continue;

        const label = `appareil cuisine ${index}`;

        // Chaque champ est parsé indépendamment, quel que soit l'autre
        const taches = [
            { valeur: element.artisan_pose,     role: "artisan",     label: `artisan_pose (${label})` },
            { valeur: element.fournisseur_pose, role: "fournisseur", label: `fournisseur_pose (${label})` }
        ];

        for (const { valeur, role, label: lbl } of taches) {
            const entree = parseEntree(valeur, lbl);
            if (!entree) continue;

            try {
                await traiterLigne(entree, role, lbl);
            } catch (err) {
                // Une erreur sur une ligne ne bloque pas les autres
                console.error(`[add_datas_tache_2] Erreur sur ${lbl} :`, err);
            }
        }
    }

    return true;
}
   



      async add_datas_tache_3(donnees_json, devis_id, projet_id) {
    let prix = 0;
    let formule = "";
    let formule_marge = "";
    let prix_marge = 0;

    // --- Garde-fous sur les données d'entrée ---
    const gammes = donnees_json?.["gammes-produits-murs-non-porteurs"];
    if (!gammes) {
        console.warn("[add_datas_tache_3] 'gammes-produits-murs-non-porteurs' manquant, on ignore.");
        return true;
    }

    const mursnonporteurs = gammes.mursNonporteurs;
    const ouvertures = gammes.ouverturePartielle;
    const has_partie_murs = gammes.tp1;
    const has_partie_ouvertures = gammes.tp3;

    // --- Helper : parse "id:Nature:Montant" ---
    const parseEntree = (valeurBrute, label) => {
        if (typeof valeurBrute !== "string" || valeurBrute.trim() === "") {
            return null;
        }
        const parts = valeurBrute.split(":");
        if (parts.length < 3) {
            console.warn(
                `[add_datas_tache_3] ${label} format invalide (attendu 3 parties, reçu ${parts.length}) :`,
                valeurBrute
            );
            return null;
        }
        const id = parseInt(parts[0], 10);
        const nature = parts[1];
        const montant = parseFloat(parts[2]);

        if (!Number.isFinite(id)) {
            console.warn(`[add_datas_tache_3] ${label} id invalide :`, parts[0]);
            return null;
        }
        if (!Number.isFinite(montant)) {
            console.warn(`[add_datas_tache_3] ${label} montant invalide :`, parts[2]);
            return null;
        }
        if (!nature || nature.trim() === "") {
            console.warn(`[add_datas_tache_3] ${label} nature vide.`);
            return null;
        }
        return { id, nature, montant };
    };

    // --- Helper : enregistre une ligne via son entrée parsée ---
    const traiterLigne = async (entree, role, label) => {
        if (!entree) return;

        const gamme = await Gamme.findByPk(entree.id);
        if (!gamme) {
            console.warn(`[add_datas_tache_3] Gamme introuvable (id=${entree.id}, ${label})`);
            return;
        }

        const utilisateurID = role === "fournisseur" ? gamme.FournisseurID : gamme.ArtisanID;
        if (!utilisateurID) {
            console.warn(`[add_datas_tache_3] ${role} absent pour la gamme ${entree.id} (${label})`);
            return;
        }

        await this.ajouterArtisanFournisseurProjet({
            NatureDesTravaux: entree.nature,
            Montant: entree.montant,
            ProjetID: projet_id,
            DevistacheID: devis_id,
            UtilisateurID: utilisateurID
        });
    };

    // ============================================================
    // 1) Murs non porteurs
    // ============================================================
    if (has_partie_murs) {
        if (!Array.isArray(mursnonporteurs)) {
            console.warn("[add_datas_tache_3] 'mursNonporteurs' invalide ou absent.");
        } else {
            for (let i = 0; i < mursnonporteurs.length; i++) {
                const mur = mursnonporteurs[i];
                if (!mur) {
                    console.warn(`[add_datas_tache_3] Mur non porteur manquant à l'index ${i}, ignoré.`);
                    continue;
                }

                const label = `mur non porteur ${i}`;
                // L'original ne traitait que artisan_pose (fournisseur_pose déclaré mais inutilisé)
                const entree = parseEntree(mur.artisan_pose, `artisan_pose (${label})`);
                if (!entree) continue;

                try {
                    await traiterLigne(entree, "artisan", `artisan_pose (${label})`);
                } catch (err) {
                    console.error(`[add_datas_tache_3] Erreur sur ${label} :`, err);
                }

                // ⚠️ fournisseur_pose était déclaré mais jamais traité dans l'original.
                // Voir point d'attention n°3 ci-dessous.
            }
        }
    }

    // ============================================================
    // 2) Ouvertures partielles
    // ============================================================
    if (has_partie_ouvertures) {
        if (!Array.isArray(ouvertures)) {
            console.warn("[add_datas_tache_3] 'ouverturePartielle' invalide ou absent.");
        } else {
            for (let j = 0; j < ouvertures.length; j++) {
                const ouverture = ouvertures[j];
                if (!ouverture) {
                    console.warn(`[add_datas_tache_3] Ouverture manquante à l'index ${j}, ignorée.`);
                    continue;
                }

                const label = `ouverture ${j}`;
                // L'original calculait une valeur jamais utilisée (code mort).
                // On parse quand même pour logguer si le format est invalide.
                const entree = parseEntree(ouverture.artisan_pose, `artisan_pose (${label})`);
                if (!entree) continue;

                // ⚠️ L'original n'enregistrait RIEN pour les ouvertures (prix calculé mais jeté).
                // On conserve ce comportement pour ne pas changer le contrat.
                // Voir point d'attention n°4 ci-dessous.

                // Si tu veux activer l'enregistrement, décommente :
                // try {
                //     await traiterLigne(entree, "artisan", `artisan_pose (${label})`);
                // } catch (err) {
                //     console.error(`[add_datas_tache_3] Erreur sur ${label} :`, err);
                // }
            }
        }
    }

    // ⚠️ prix, formule, prix_marge, formule_marge ne sont jamais alimentés
    // dans l'original. Si l'appelant les attend, voir variante ci-dessous.
    return true;
}

      
      
      
        getTarif(id){
          return id
        }


        
        

        async add_datas_tache_4(donnees_json, devis_id, projet_id) {
    // --- Garde-fous sur les données d'entrée ---
    const gammes = donnees_json?.["gammes-produits-creation-murs-non-porteurs--portes"];
    if (!gammes) {
        console.warn(
            "[add_datas_tache_4] 'gammes-produits-creation-murs-non-porteurs--portes' manquant, on ignore."
        );
        return true;
    }

    const murs = gammes.murs_non_porteurs;
    // has_portes et portes ne sont pas utilisés dans l'original : conservés en commentaire
    // const has_portes = gammes.has_portes;
    // const portes = gammes.portes;

    if (!Array.isArray(murs) || murs.length === 0) {
        console.warn("[add_datas_tache_4] Aucun mur non porteur à traiter.");
        return true;
    }

    // --- Helper : parse "id:Montant:Nature" (⚠️ format spécifique à cette tâche) ---
    const parseEntree = (valeurBrute, label) => {
        if (typeof valeurBrute !== "string" || valeurBrute.trim() === "") {
            return null;
        }
        const parts = valeurBrute.split(":");
        if (parts.length < 3) {
            console.warn(
                `[add_datas_tache_4] ${label} format invalide (attendu 3 parties, reçu ${parts.length}) :`,
                valeurBrute
            );
            return null;
        }
        const id = parseInt(parts[0], 10);
        // ⚠️ Inversion volontairement conservée pour préserver le comportement d'origine :
        // ici Montant = parts[1] et Nature = parts[2].
        const montant = parseFloat(parts[1]);
        const nature = parts[2];

        if (!Number.isFinite(id)) {
            console.warn(`[add_datas_tache_4] ${label} id invalide :`, parts[0]);
            return null;
        }
        if (!Number.isFinite(montant)) {
            console.warn(`[add_datas_tache_4] ${label} montant invalide :`, parts[1]);
            return null;
        }
        if (!nature || nature.trim() === "") {
            console.warn(`[add_datas_tache_4] ${label} nature vide.`);
            return null;
        }
        return { id, nature, montant };
    };

    // --- Helper : enregistre une ligne via son entrée parsée ---
    const traiterLigne = async (entree, role, label) => {
        if (!entree) return;

        const gamme = await Gamme.findByPk(entree.id);
        if (!gamme) {
            console.warn(`[add_datas_tache_4] Gamme introuvable (id=${entree.id}, ${label})`);
            return;
        }

        const utilisateurID = role === "fournisseur" ? gamme.FournisseurID : gamme.ArtisanID;
        if (!utilisateurID) {
            console.warn(`[add_datas_tache_4] ${role} absent pour la gamme ${entree.id} (${label})`);
            return;
        }

        await this.ajouterArtisanFournisseurProjet({
            NatureDesTravaux: entree.nature,
            Montant: entree.montant,
            ProjetID: projet_id,
            DevistacheID: devis_id,
            UtilisateurID: utilisateurID
        });
    };

    // --- Boucle sur les murs non porteurs ---
    for (let i = 0; i < murs.length; i++) {
        const mur = murs[i];
        if (!mur) {
            console.warn(`[add_datas_tache_4] Mur non porteur manquant à l'index ${i}, ignoré.`);
            continue;
        }

        const label = `artisan_pose (mur ${i})`;
        const entree = parseEntree(mur.artisan_pose, label);
        if (!entree) continue;

        try {
            await traiterLigne(entree, "artisan", label);
        } catch (err) {
            console.error(`[add_datas_tache_4] Erreur sur ${label} :`, err);
        }
    }

    return true;
}



        

      async add_datas_tache_10(donnees_json, devis_id, projet_id) {
    // --- Garde-fous sur les données d'entrée ---
    const portes = donnees_json?.["gammes-produits-pose-portes"]?.portes;

    if (!Array.isArray(portes) || portes.length === 0) {
        console.warn("[add_datas_tache_10] Aucune porte à traiter.");
        return true;
    }

    // --- Helper : parse "id:Montant:Nature" (⚠️ format spécifique, voir point d'attention) ---
    const parseEntree = (valeurBrute, label) => {
        if (typeof valeurBrute !== "string" || valeurBrute.trim() === "") {
            return null;
        }
        const parts = valeurBrute.split(":");
        if (parts.length < 3) {
            console.warn(
                `[add_datas_tache_10] ${label} format invalide (attendu 3 parties, reçu ${parts.length}) :`,
                valeurBrute
            );
            return null;
        }
        const id = parseInt(parts[0], 10);
        // ⚠️ Inversion conservée pour préserver le comportement d'origine :
        // ici Montant = parts[1] et Nature = parts[2].
        const montant = parseFloat(parts[1]);
        const nature = parts[2];

        if (!Number.isFinite(id)) {
            console.warn(`[add_datas_tache_10] ${label} id invalide :`, parts[0]);
            return null;
        }
        if (!Number.isFinite(montant)) {
            console.warn(`[add_datas_tache_10] ${label} montant invalide :`, parts[1]);
            return null;
        }
        if (!nature || nature.trim() === "") {
            console.warn(`[add_datas_tache_10] ${label} nature vide.`);
            return null;
        }
        return { id, nature, montant };
    };

    // --- Helper : enregistre une ligne via son entrée parsée ---
    const traiterLigne = async (entree, role, label) => {
        if (!entree) return;

        const gamme = await Gamme.findByPk(entree.id);
        if (!gamme) {
            console.warn(`[add_datas_tache_10] Gamme introuvable (id=${entree.id}, ${label})`);
            return;
        }

        const utilisateurID = role === "fournisseur" ? gamme.FournisseurID : gamme.ArtisanID;
        if (!utilisateurID) {
            console.warn(`[add_datas_tache_10] ${role} absent pour la gamme ${entree.id} (${label})`);
            return;
        }

        await this.ajouterArtisanFournisseurProjet({
            NatureDesTravaux: entree.nature,
            Montant: entree.montant,
            ProjetID: projet_id,
            DevistacheID: devis_id,
            UtilisateurID: utilisateurID
        });
    };

    // --- Boucle séquentielle sur les portes (au lieu de forEach async) ---
    for (let index = 0; index < portes.length; index++) {
        const porte = portes[index];
        if (!porte) {
            console.warn(`[add_datas_tache_10] Porte manquante à l'index ${index}, ignorée.`);
            continue;
        }

        const label = `porte ${index}`;

        // Les 6 champs attendus pour chaque porte
        const taches = [
            { valeur: porte.artisan_pose,       role: "artisan",     label: `artisan_pose (${label})` },
            { valeur: porte.fournisseur_pose,   role: "fournisseur", label: `fournisseur_pose (${label})` },
            { valeur: porte.artisan_nature,     role: "artisan",     label: `artisan_nature (${label})` },
            { valeur: porte.fournisseur_nature, role: "fournisseur", label: `fournisseur_nature (${label})` },
            { valeur: porte.artisan_type,       role: "artisan",     label: `artisan_type (${label})` },
            { valeur: porte.fournisseur_type,   role: "fournisseur", label: `fournisseur_type (${label})` }
        ];

        for (const { valeur, role, label: lbl } of taches) {
            const entree = parseEntree(valeur, lbl);
            if (!entree) continue;

            try {
                await traiterLigne(entree, role, lbl);
            } catch (err) {
                // Une erreur sur une ligne ne bloque pas les autres
                console.error(`[add_datas_tache_10] Erreur sur ${lbl} :`, err);
            }
        }
    }

    return true;
}





async add_datas_tache_12(donnees_json, devis_id, projet_id) {
    // --- Garde-fous sur les données d'entrée ---
    // const surface = donnees_json?.["dimensions-pose-chauffage"]?.surface; // non utilisée
    const radiateursTypes = donnees_json?.["etat-surfaces-pose-chauffage"]?.radiateurs;
    const radiateursGammes = donnees_json?.["gammes-produits-pose-chauffage"]?.radiateurs;

    if (!Array.isArray(radiateursTypes) || radiateursTypes.length === 0) {
        console.warn("[add_datas_tache_12] Aucun radiateur à traiter.");
        return true;
    }
    if (!Array.isArray(radiateursGammes)) {
        console.warn("[add_datas_tache_12] 'gammes-produits-pose-chauffage'.radiateurs invalide ou absent.");
        return true;
    }

    // --- Helper : parse "id:Montant:Nature" (⚠️ format spécifique, voir point d'attention) ---
    const parseEntree = (valeurBrute, label) => {
        if (typeof valeurBrute !== "string" || valeurBrute.trim() === "") {
            return null;
        }
        const parts = valeurBrute.split(":");
        if (parts.length < 3) {
            console.warn(
                `[add_datas_tache_12] ${label} format invalide (attendu 3 parties, reçu ${parts.length}) :`,
                valeurBrute
            );
            return null;
        }
        const id = parseInt(parts[0], 10);
        const montant = parseFloat(parts[1]);
        const nature = parts[2];

        if (!Number.isFinite(id)) {
            console.warn(`[add_datas_tache_12] ${label} id invalide :`, parts[0]);
            return null;
        }
        if (!Number.isFinite(montant)) {
            console.warn(`[add_datas_tache_12] ${label} montant invalide :`, parts[1]);
            return null;
        }
        if (!nature || nature.trim() === "") {
            console.warn(`[add_datas_tache_12] ${label} nature vide.`);
            return null;
        }
        return { id, nature, montant };
    };

    // --- Helper générique : récupère une entité (Gamme ou ModeleEquipement) ---
    const traiterLigne = async (entree, role, modele, label) => {
        if (!entree) return;

        const entite = await modele.findByPk(entree.id);
        if (!entite) {
            console.warn(
                `[add_datas_tache_12] ${modele.name} introuvable (id=${entree.id}, ${label})`
            );
            return;
        }

        const utilisateurID = role === "fournisseur" ? entite.FournisseurID : entite.ArtisanID;
        if (!utilisateurID) {
            console.warn(`[add_datas_tache_12] ${role} absent pour ${modele.name} ${entree.id} (${label})`);
            return;
        }

        await this.ajouterArtisanFournisseurProjet({
            NatureDesTravaux: entree.nature,
            Montant: entree.montant,
            ProjetID: projet_id,
            DevistacheID: devis_id,
            UtilisateurID: utilisateurID
        });
    };

    // --- Boucle séquentielle (au lieu de forEach async) ---
    const total = Math.min(radiateursTypes.length, radiateursGammes.length);
    if (radiateursTypes.length !== radiateursGammes.length) {
        console.warn(
            `[add_datas_tache_12] Incohérence de taille : radiateursTypes=${radiateursTypes.length}, ` +
            `radiateursGammes=${radiateursGammes.length}. Traitement limité à ${total}.`
        );
    }

    for (let index = 0; index < total; index++) {
        const radiateur = radiateursTypes[index];
        const gammeRadiateur = radiateursGammes[index];

        if (!radiateur) {
            console.warn(`[add_datas_tache_12] Radiateur manquant à l'index ${index}, ignoré.`);
            continue;
        }

        const label = `radiateur ${index}`;

        // --- Bloc "type" : utilise Gamme ---
        // ⚠️ L'original forçait fournisseur_type = null (bug). On restaure le champ source.
        const tachesType = [
            { valeur: radiateur.artisan_type,     role: "artisan",     label: `artisan_type (${label})` },
            { valeur: radiateur.fournisseur_type, role: "fournisseur", label: `fournisseur_type (${label})` }
        ];

        for (const { valeur, role, label: lbl } of tachesType) {
            const entree = parseEntree(valeur, lbl);
            if (!entree) continue;
            try {
                await traiterLigne(entree, role, Gamme, lbl);
            } catch (err) {
                console.error(`[add_datas_tache_12] Erreur sur ${lbl} :`, err);
            }
        }

        // --- Bloc "pose" : utilise ModeleEquipement ---
        if (!gammeRadiateur) {
            console.warn(`[add_datas_tache_12] Gamme radiateur manquante à l'index ${index}.`);
            continue;
        }

        const tachesPose = [
            { valeur: gammeRadiateur.artisan_pose,     role: "artisan",     label: `artisan_pose (${label})` },
            { valeur: gammeRadiateur.fournisseur_pose, role: "fournisseur", label: `fournisseur_pose (${label})` }
        ];

        for (const { valeur, role, label: lbl } of tachesPose) {
            const entree = parseEntree(valeur, lbl);
            if (!entree) continue;
            try {
                await traiterLigne(entree, role, ModeleEquipement, lbl);
            } catch (err) {
                console.error(`[add_datas_tache_12] Erreur sur ${lbl} :`, err);
            }
        }
    }

    return true;
}
    
      
       




      
      
    async add_datas_tache_8(donnees_json, devis_id, projet_id) {
        // --- Garde-fous sur les données d'entrée ---
        const gammes = donnees_json?.["gammes-produits-pose-plafond"];
        const dimensions = donnees_json?.["dimensions-pose-plafond"];

        if (!gammes) {
            console.warn("[add_datas_tache_8] 'gammes-produits-pose-plafond' manquant, on ignore.");
            return true;
        }
        if (!dimensions) {
            console.warn("[add_datas_tache_8] 'dimensions-pose-plafond' manquant, on ignore.");
            return true;
        }

        // La surface n'est pas utilisée dans la fonction, mais on la calcule de façon sûre
        const longueur = Number(dimensions.longueur) || 0;
        const largeur = Number(dimensions.largeur) || 0;
        const surface = (longueur * largeur) / 10000;

        // --- Helper : parse une chaîne "id:Nature:Montant" (ou "id:Nature:Montant-...") ---
        const parseEntree = (valeurBrute, separateur) => {
            if (typeof valeurBrute !== "string" || valeurBrute.trim() === "") {
                return null;
            }
            const parts = valeurBrute.split(separateur);
            if (parts.length < 3) {
                console.warn(`[add_datas_tache_8] Format invalide (attendu 3 parties, reçu ${parts.length}) :`, valeurBrute);
                return null;
            }
            const id = parseInt(parts[0], 10);
            const nature = parts[1];
            const montant = parseFloat(parts[2]);

            if (!Number.isFinite(id) || !Number.isFinite(montant) || !nature) {
                console.warn(`[add_datas_tache_8] Valeurs invalides (id=${parts[0]}, nature=${parts[1]}, montant=${parts[2]})`);
                return null;
            }
            return { id, nature, montant };
        };

        // --- Helper : récupère la gamme et l'utilisateur associé ---
        const traiterLigne = async (entree, role) => {
            if (!entree) return; // rien à traiter

            const gamme = await Gamme.findByPk(entree.id);
            if (!gamme) {
                console.warn(`[add_datas_tache_8] Gamme introuvable (id=${entree.id}, role=${role})`);
                return;
            }

            const utilisateurID = role === "fournisseur" ? gamme.FournisseurID : gamme.ArtisanID;
            if (!utilisateurID) {
                console.warn(`[add_datas_tache_8] ${role} absent pour la gamme ${entree.id}`);
                return;
            }

            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux: entree.nature,
                Montant: entree.montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: utilisateurID
            });
        };

        // --- Traitement des 4 entrées possibles ---
        const taches = [
            { key: "fournisseur_pose", sep: ":", role: "fournisseur" },
            { key: "artisan_pose",     sep: ":", role: "artisan" },
            { key: "artisan_surfaces", sep: "-", role: "artisan" },
            { key: "artisan_depose",   sep: ":", role: "artisan" }
        ];

        for (const { key, sep, role } of taches) {
            const entree = parseEntree(gammes[key], sep);
            if (entree) {
                await traiterLigne(entree, role);
            }
        }

        return true;
    }

 
      
    async add_datas_tache_9(donnees_json, devis_id, projet_id) {
    // --- Garde-fous sur les données d'entrée ---
    const gammes = donnees_json?.["gammes-produits-pose-sol"];

    if (!gammes) {
        console.warn("[add_datas_tache_9] 'gammes-produits-pose-sol' manquant, on ignore.");
        return true;
    }

    // --- Helper : parse une chaîne "id<sep>Nature<sep>Montant" ---
    const parseEntree = (valeurBrute, separateur) => {
        if (typeof valeurBrute !== "string" || valeurBrute.trim() === "") {
            return null;
        }
        const parts = valeurBrute.split(separateur);
        if (parts.length < 3) {
            console.warn(
                `[add_datas_tache_9] Format invalide (attendu 3 parties, reçu ${parts.length}) :`,
                valeurBrute
            );
            return null;
        }
        const id = parseInt(parts[0], 10);
        const nature = parts[1];
        const montant = parseFloat(parts[2]);

        if (!Number.isFinite(id) || !Number.isFinite(montant) || !nature) {
            console.warn(
                `[add_datas_tache_9] Valeurs invalides (id=${parts[0]}, nature=${parts[1]}, montant=${parts[2]})`
            );
            return null;
        }
        return { id, nature, montant };
    };

    // --- Helper : récupère la gamme + l'utilisateur et enregistre ---
    const traiterLigne = async (entree, role) => {
        if (!entree) return;

        const gamme = await Gamme.findByPk(entree.id);
        if (!gamme) {
            console.warn(`[add_datas_tache_9] Gamme introuvable (id=${entree.id}, role=${role})`);
            return;
        }

        const utilisateurID = role === "fournisseur" ? gamme.FournisseurID : gamme.ArtisanID;
        if (!utilisateurID) {
            console.warn(`[add_datas_tache_9] ${role} absent pour la gamme ${entree.id}`);
            return;
        }

        await this.ajouterArtisanFournisseurProjet({
            NatureDesTravaux: entree.nature,
            Montant: entree.montant,
            ProjetID: projet_id,
            DevistacheID: devis_id,
            UtilisateurID: utilisateurID
        });
    };

    // --- Traitement des 6 entrées possibles ---
    const taches = [
        { key: "artisan_pose",              sep: ":", role: "artisan" },
        { key: "fournisseur_pose",          sep: ":", role: "fournisseur" },
        { key: "fournisseur_pose_plinthes", sep: ":", role: "fournisseur" },
        { key: "artisan_pose_plinthes",     sep: ":", role: "artisan" },
        { key: "artisan_surfaces",          sep: "-", role: "artisan" },
        { key: "artisan_depose",            sep: ":", role: "artisan" }
    ];

    for (const { key, sep, role } of taches) {
        // Ici on teste bien la valeur SOURCE (string non vide), pas le résultat du split
        const entree = parseEntree(gammes[key], sep);
        if (entree) {
            await traiterLigne(entree, role);
        }
    }

    return true;
}
    
        

      async add_datas_tache_13(donnees_json, devis_id, projet_id) {
    // --- Garde-fous sur les données d'entrée ---
    const gammes = donnees_json?.["gammes-produits-pose-electricite"];
    if (!gammes) {
        console.warn("[add_datas_tache_13] 'gammes-produits-pose-electricite' manquant, on ignore.");
        return true;
    }

    const appareils = gammes.appareils_electrique_a_remplacer;
    if (!Array.isArray(appareils) || appareils.length === 0) {
        console.warn("[add_datas_tache_13] Aucun appareil à traiter, on ignore.");
        return true;
    }

    // Si aucune gamme artisan, rien à faire (comportement d'origine)
    if (!gammes.artisan_gamme) {
        return true;
    }
    if (!gammes.fournisseur_gamme) {
        console.warn("[add_datas_tache_13] 'fournisseur_gamme' manquant, on ignore.");
        return true;
    }

    // --- Helper : parse "id-Nature-<json>" (ou "id-Nature" selon tes données) ---
    const parseGamme = (valeurBrute, label) => {
        if (typeof valeurBrute !== "string" || valeurBrute.trim() === "") {
            console.warn(`[add_datas_tache_13] ${label} vide ou invalide.`);
            return null;
        }
        const parts = valeurBrute.split("-");
        if (parts.length < 2) {
            console.warn(`[add_datas_tache_13] ${label} format invalide :`, valeurBrute);
            return null;
        }
        const id = parseInt(parts[0], 10);
        if (!Number.isFinite(id)) {
            console.warn(`[add_datas_tache_13] ${label} id invalide :`, parts[0]);
            return null;
        }
        const nature = parts[2] ?? parts[1] ?? null; // on garde l'index 2 comme l'original
        const jsonPart = parts[1];

        let prixMap = [];
        try {
            const parsed = JSON.parse(jsonPart);
            if (Array.isArray(parsed)) {
                prixMap = parsed;
            } else {
                console.warn(`[add_datas_tache_13] ${label} JSON non-tableau.`);
                return null;
            }
        } catch (err) {
            console.warn(`[add_datas_tache_13] ${label} JSON invalide :`, jsonPart, err.message);
            return null;
        }

        return { id, nature, prixMap };
    };

    // --- Helper : enregistre une ligne pour une gamme donnée et un rôle ---
    const enregistrer = async ({ id, nature, prixMap }, prixAttendu, role) => {
        const gamme = await Gamme.findByPk(id);
        if (!gamme) {
            console.warn(`[add_datas_tache_13] Gamme introuvable (id=${id}, role=${role})`);
            return;
        }

        const utilisateurID = role === "fournisseur" ? gamme.FournisseurID : gamme.ArtisanID;
        if (!utilisateurID) {
            console.warn(`[add_datas_tache_13] ${role} absent pour la gamme ${id}`);
            return;
        }

        const montant = parseFloat(prixAttendu);
        if (!Number.isFinite(montant)) {
            console.warn(
                `[add_datas_tache_13] Prix ${role} invalide pour gamme ${id} :`,
                prixAttendu
            );
            return;
        }

        await this.ajouterArtisanFournisseurProjet({
            NatureDesTravaux: nature,
            Montant: montant,
            ProjetID: projet_id,
            DevistacheID: devis_id,
            UtilisateurID: utilisateurID
        });
    };

    // --- Parse des deux gammes une seule fois ---
    const gammeArtisan = parseGamme(gammes.artisan_gamme, "artisan_gamme");
    const gammeFournisseur = parseGamme(gammes.fournisseur_gamme, "fournisseur_gamme");

    if (!gammeArtisan || !gammeFournisseur) {
        return true;
    }

    // --- Boucle séquentielle (au lieu de forEach async) ---
    for (const appareil of appareils) {
        if (!appareil?.active) continue;
        if (!(appareil.nombre_a_creer > 0)) continue;

        const titre = (appareil.titre || "").toLowerCase();

        const appareilArtisan = gammeArtisan.prixMap.find(
            a => (a?.nom || "").toLowerCase() === titre
        );
        const appareilFournisseur = gammeFournisseur.prixMap.find(
            a => (a?.nom || "").toLowerCase() === titre
        );

        if (!appareilArtisan || !appareilFournisseur) {
            console.warn(
                `[add_datas_tache_13] Prix introuvable pour l'appareil "${appareil.titre}" ` +
                `(artisan=${!!appareilArtisan}, fournisseur=${!!appareilFournisseur})`
            );
            continue;
        }

        try {
            await enregistrer(gammeArtisan, appareilArtisan.prix, "artisan");
            await enregistrer(gammeFournisseur, appareilFournisseur.prix, "fournisseur");
        } catch (err) {
            // Une erreur sur un appareil ne bloque pas les autres
            console.error(
                `[add_datas_tache_13] Erreur sur l'appareil "${appareil.titre}" :`,
                err
            );
        }
    }

    return true;
}
        


      async add_datas_tache_14(donnees_json, devis_id, projet_id) {
    // --- Garde-fous sur les données d'entrée ---
    const dimensions = donnees_json?.["dimensions-depose-murs"]?.murs;
    const gammes = donnees_json?.["gammes-produits-depose-murs"]?.murs;
    // etat_surfaces n'était pas utilisé dans l'original : conservé pour compat mais non exploité
    // const etat_surfaces = donnees_json?.["etat-surfaces-depose-murs"]?.murs;

    if (!Array.isArray(dimensions) || dimensions.length === 0) {
        console.warn("[add_datas_tache_14] Aucune dimension de mur, prix = 0.");
        return 0;
    }
    if (!Array.isArray(gammes)) {
        console.warn("[add_datas_tache_14] 'gammes-produits-depose-murs'.murs invalide, prix = 0.");
        return 0;
    }

    // --- Mapping gamme → prix unitaire depuis la config (avec garde-fous) ---
    const prixUnitaires = {
        "peinture":          this.tache_retirer_peinture?.Prix,
        "enduit decoratif":  this.tache_retirer_enduit?.Prix,
        "papier peint":      this.tache_retirer_papier?.Prix,
        "carrelage mural":   this.tache_retirer_carrelage?.Prix,
        "tissus":            this.tache_retirer_tissus?.Prix,
        "lambris mural":     this.tache_retirer_lambris?.Prix,
        "autre":             20
    };

    let prix = 0;

    // On itère sur le plus petit des deux tableaux pour éviter les index hors bornes
    const total = Math.min(dimensions.length, gammes.length);
    if (dimensions.length !== gammes.length) {
        console.warn(
            `[add_datas_tache_14] Incohérence de taille : dimensions=${dimensions.length}, ` +
            `gammes=${gammes.length}. Traitement limité à ${total}.`
        );
    }

    for (let i = 0; i < total; i++) {
        const dimension = dimensions[i];
        const gammeObj = gammes[i];

        if (!dimension || !gammeObj) {
            console.warn(`[add_datas_tache_14] Entrée manquante à l'index ${i}, ignorée.`);
            continue;
        }

        const surface = parseFloat(dimension.surface);
        if (!Number.isFinite(surface) || surface <= 0) {
            console.warn(`[add_datas_tache_14] Surface invalide à l'index ${i} :`, dimension.surface);
            continue;
        }

        // Normalisation : trim + lowercase pour éviter les faux négatifs
        const gamme = (gammeObj.gamme || "").toString().trim().toLowerCase();
        if (!gamme) {
            console.warn(`[add_datas_tache_14] Gamme vide à l'index ${i}, ignorée.`);
            continue;
        }

        const prixUnitaire = prixUnitaires[gamme];
        if (!Number.isFinite(prixUnitaire)) {
            console.warn(
                `[add_datas_tache_14] Gamme inconnue "${gammeObj.gamme}" (index ${i}) ` +
                `ou prix unitaire non configuré. Mur ignoré.`
            );
            continue;
        }

        prix += surface * prixUnitaire;
    }

    return prix;
}


     async add_datas_tache_15(donnees_json, devis_id, projet_id) {
    // --- Garde-fous sur les données d'entrée ---
    const gammes = donnees_json?.["gammes-produits-renovation-electrique"];
    if (!gammes) {
        console.warn("[add_datas_tache_15] 'gammes-produits-renovation-electrique' manquant, on ignore.");
        return true;
    }

    // --- Helper : parse "id:Nature:Montant" en un objet sûr ---
    const parseEntree = (valeurBrute, label) => {
        if (typeof valeurBrute !== "string" || valeurBrute.trim() === "") {
            return null; // rien à traiter (absent, vide, espaces)
        }
        const parts = valeurBrute.split(":");
        if (parts.length < 3) {
            console.warn(
                `[add_datas_tache_15] ${label} format invalide (attendu 3 parties, reçu ${parts.length}) :`,
                valeurBrute
            );
            return null;
        }
        const id = parseInt(parts[0], 10);
        const nature = parts[1];
        const montant = parseFloat(parts[2]);

        if (!Number.isFinite(id)) {
            console.warn(`[add_datas_tache_15] ${label} id invalide :`, parts[0]);
            return null;
        }
        if (!Number.isFinite(montant)) {
            console.warn(`[add_datas_tache_15] ${label} montant invalide :`, parts[2]);
            return null;
        }
        if (!nature || nature.trim() === "") {
            console.warn(`[add_datas_tache_15] ${label} nature vide.`);
            return null;
        }
        return { id, nature, montant };
    };

    // --- Helper : récupère la gamme + l'artisan et enregistre ---
    const traiterLigne = async (entree, label) => {
        if (!entree) return;

        const gamme = await Gamme.findByPk(entree.id);
        if (!gamme) {
            console.warn(`[add_datas_tache_15] Gamme introuvable (id=${entree.id}, label=${label})`);
            return;
        }

        const id_artisan = gamme.ArtisanID;
        if (!id_artisan) {
            console.warn(`[add_datas_tache_15] Artisan absent pour la gamme ${entree.id} (${label})`);
            return;
        }

        await this.ajouterArtisanFournisseurProjet({
            NatureDesTravaux: entree.nature,
            Montant: entree.montant,
            ProjetID: projet_id,
            DevistacheID: devis_id,
            UtilisateurID: id_artisan
        });
    };

    // --- Traitement des 3 entrées possibles ---
    const taches = [
        { key: "artisan_chauffage",         label: "artisan_chauffage" },
        { key: "artisan_mise_aux_normes",   label: "artisan_mise_aux_normes" },
        { key: "artisan_mise_en_securite",  label: "artisan_mise_en_securite" }
    ];

    for (const { key, label } of taches) {
        const entree = parseEntree(gammes[key], label);
        if (!entree) continue;

        try {
            await traiterLigne(entree, label);
        } catch (err) {
            // Une erreur sur une ligne ne bloque pas les autres
            console.error(`[add_datas_tache_15] Erreur sur "${label}" :`, err);
        }
    }

    return true;
}
      
      

  


      

async add_datas_tache_16(donnees_json, devis_id, projet_id) {
    let formule = "";        // Formule explicative
    let prix = 0;
    let formule_marge = "";
    let prix_marge = 0;

    // --- Garde-fous sur les données d'entrée ---
    const appareils_pose = donnees_json?.["gammes-produits-pose-app-san"]?.appareils_salle_de_bain;
    const appareils_depose = donnees_json?.["dimensions-pose-app-san"]?.gammes_depose_form;

    if (!Array.isArray(appareils_pose)) {
        console.warn("[add_datas_tache_16] 'appareils_salle_de_bain' invalide ou absent.");
    }
    if (!Array.isArray(appareils_depose)) {
        console.warn("[add_datas_tache_16] 'gammes_depose_form' invalide ou absent.");
    }

    // --- Helper : parse "xxx:Modele:Prix" en objet sûr ---
    const parseModele = (valeurBrute, label) => {
        if (typeof valeurBrute !== "string" || valeurBrute.trim() === "") {
            return null;
        }
        const parts = valeurBrute.split(":");
        if (parts.length < 3) {
            console.warn(
                `[add_datas_tache_16] ${label} format invalide (attendu ≥3 parties, reçu ${parts.length}) :`,
                valeurBrute
            );
            return null;
        }
        const modele = parts[1];
        const prix = parseFloat(parts[2]);
        if (!Number.isFinite(prix)) {
            console.warn(`[add_datas_tache_16] ${label} prix invalide :`, parts[2]);
            return null;
        }
        return { modele, prix };
    };

    // ============================================================
    // 1) Appareils POSÉS
    // ============================================================
    if (Array.isArray(appareils_pose)) {
        for (const appareil of appareils_pose) {
            if (!appareil?.active) continue;

            const titreAppareil = appareil.titre || "(sans titre)";
            const modeleInfo = parseModele(appareil.modele, `modele de "${titreAppareil}"`);
            if (!modeleInfo) continue;

            const { modele: titreModele, prix: prixModele } = modeleInfo;
            prix += prixModele;
            formule +=
                `<u>Prix de pose</u>\n  ${titreAppareil} (${titreModele}) : ` +
                `1 * prix de pose (${prixModele} €) = ${prixModele} €\n`;

            // Marge artisan + fournisseur (les deux doivent être valides)
            if (appareil.artisan_pose && appareil.fournisseur_pose) {
                const artisanInfo = parseModele(appareil.artisan_pose, `artisan_pose de "${titreAppareil}"`);
                const fournisseurInfo = parseModele(appareil.fournisseur_pose, `fournisseur_pose de "${titreAppareil}"`);

                if (artisanInfo && fournisseurInfo) {
                    const prixArtisan = artisanInfo.prix;
                    const prixFournisseur = fournisseurInfo.prix;
                    const prix_total = prixArtisan + prixFournisseur;
                    prix_marge += prix_total;
                    formule_marge +=
                        `<u>Prix ${titreAppareil} (${titreModele})</u>\n ` +
                        `1 * prix artisan (${prixArtisan} €) + prix fournisseur (${prixFournisseur} €) = ${prix_total} €\n`;
                } else {
                    console.warn(
                        `[add_datas_tache_16] Marge incomplète pour "${titreAppareil}" ` +
                        `(artisan=${!!artisanInfo}, fournisseur=${!!fournisseurInfo}).`
                    );
                }
            }
        }
    }

    // ============================================================
    // 2) Appareils DÉPOSÉS
    // ============================================================
    if (Array.isArray(appareils_depose)) {
        for (const appareil of appareils_depose) {
            const qte = parseFloat(appareil?.quantite);
            if (!Number.isFinite(qte) || qte <= 0) continue;

            const titreModele = appareil.titre || "(sans titre)";
            const prixUnitaire = parseFloat(appareil.prix);
            if (!Number.isFinite(prixUnitaire) || prixUnitaire < 0) {
                console.warn(
                    `[add_datas_tache_16] Prix de dépose invalide pour "${titreModele}" :`,
                    appareil.prix
                );
                continue;
            }

            const prixModele = prixUnitaire * qte;
            prix += prixModele;
            formule +=
                `<u>Prix de dépose</u>\n ${titreModele} : ` +
                `${qte} * prix de dépose (${prixUnitaire} €) = ${prixModele} €\n`;

            // Marge dépose artisan
            if (appareil.artisan_depose) {
                const artisanInfo = parseModele(appareil.artisan_depose, `artisan_depose de "${titreModele}"`);
                if (artisanInfo) {
                    const prixdepose = artisanInfo.prix;
                    const prix_total = prixdepose * qte;
                    prix_marge += prix_total;
                    formule_marge +=
                        `<u>Prix depose ${titreModele}</u>\n ` +
                        `1 * prix artisan (${prixdepose} €) x quantité (${qte} ) = ${prix_total} €\n`;
                }
            }
        }
    }

    // ⚠️ L'original retournait `true` sans exposer prix/formule.
    // Comportement conservé pour ne pas casser l'appelant.
    // Si tu veux exposer les valeurs, voir la variante ci-dessous.
    return true;
}

      
      async  ajouterArtisanFournisseurProjet({
          NatureDesTravaux,
          Montant,
          ProjetID,
          DevistacheID,
          UtilisateurID,
      }) {
        console.log('NatureDesTravaux',NatureDesTravaux)
        console.log('Montant',Montant)
        console.log('ProjetID',ProjetID)
        console.log('DevistacheID',DevistacheID)
        console.log('UtilisateurID',UtilisateurID)

        //generer 01-10-2026-11 j-m-y-h pout token
        const now = new Date();

        const jour = String(now.getDate()).padStart(2, '0');
        const mois = String(now.getMonth() + 1).padStart(2, '0');
        const annee = now.getFullYear();
        const heure = String(now.getHours()).padStart(2, '0');

        const token = `${jour}-${mois}-${annee}-${heure}`;



          const artisanFournisseurProjet =
              await ArtisanFournisseurProjet.findOne({
                  where: {
                      UtilisateurID,
                      ProjetID,
                      DevistacheID,
                  }
              });

          

          if (artisanFournisseurProjet) {

            //comparer le champ Token et token si different supprimer et recreer avec token 

            if(artisanFournisseurProjet.Token != token){
              await artisanFournisseurProjet.destroy();
            }

              artisanFournisseurProjet.Montant =
                  (parseFloat(artisanFournisseurProjet.Montant) || 0) + Montant;

              // Si plusieurs gammes/travaux doivent être conservés
              if (artisanFournisseurProjet.NatureDesTravaux) {
                  artisanFournisseurProjet.NatureDesTravaux += `, ${NatureDesTravaux}`;
              } else {
                  artisanFournisseurProjet.NatureDesTravaux = NatureDesTravaux;
              }

              await artisanFournisseurProjet.save();

          } else {

              await ArtisanFournisseurProjet.create({
                  NatureDesTravaux: NatureDesTravaux,
                  Montant: Montant,
                  ProjetID,
                  DevistacheID,
                  UtilisateurID,
                  Token:token
              });
          }
      }
      




}
  
  module.exports = DevisArtisansFournisseurs;