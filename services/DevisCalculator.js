const express = require('express');
const app = express();
const TacheGenerale=require('../TacheGenerale')
const Parametre=require('../Parametre')
const Remise = require('../Remise'); 
class DevisCalculator {


    constructor() {
      // Vous pouvez ajouter des propriétés initiales ici si nécessaire
      this.initTaches();
    }
  
    // Fonction pour calculer le prix en fonction de devispiece et index
    async calculer_prix(tacheid,donnees,devis_id,tvaValue) {
        let donnees_json=donnees["formulaire"]
        let titre=donnees["nomtache"]
        console.log("calcul du prix de la tache ",titre," d'id ",tacheid," du devis ",devis_id)
        
        let prix=0
        switch (tacheid) {
            case 2:
                prix = await this.get_prix_tache_2(donnees_json, devis_id, tvaValue);
                break;
            case 3:
                prix = await this.get_prix_tache_3(donnees_json, devis_id, tvaValue);
                break;
            case 4:
                prix = await this.get_prix_tache_4(donnees_json, devis_id, tvaValue);
                break;
            case 5:
                prix = await this.get_prix_tache_5(donnees_json, devis_id, tvaValue);
                break;
            case 10:
                prix = await this.get_prix_tache_10(donnees_json, devis_id, tvaValue);
                break;
            case 11:
                prix = await this.get_prix_tache_11(donnees_json, devis_id, tvaValue);
                break;
            case 12:
                prix = await this.get_prix_tache_12(donnees_json, devis_id, tvaValue);
                break;
            case 9:
                prix = await this.get_prix_tache_9(donnees_json, devis_id, tvaValue);
                break;
            case 8:
                prix = await this.get_prix_tache_8(donnees_json, devis_id, tvaValue);
                break;
            case 13:
                prix = await this.get_prix_tache_13(donnees_json, devis_id, tvaValue);
                break;
            case 14:
                prix = await this.get_prix_tache_14(donnees_json, devis_id, tvaValue);
                break;
            case 15:
                prix = await this.get_prix_tache_15(donnees_json, devis_id, tvaValue);
                break;
            case 16:
                prix = await this.get_prix_tache_16(donnees_json, devis_id, tvaValue);
                break;                
            default:
                throw new Error(`Tâche inconnue avec l'ID ${tacheid}`);
        }
        
        return prix
    }

    async calculer_prix_tache(tache, devis_id,tvaValue) {

      let donnees_json=tache["formulaire"]
      let titre=tache["nomtache"]
      let idtache=tache["idtache"]
      console.log("calcul du prix de la tache ",titre," d'id ",idtache," du devis ez ",devis_id)
      
      let prix=0
      switch (idtache) {
          case 2:
              prix = await this.get_prix_tache_2(donnees_json, devis_id, tvaValue);
              break;
          case 3:
              prix = await this.get_prix_tache_3(donnees_json, devis_id, tvaValue);
              break;
          case 4:
              prix = await this.get_prix_tache_4(donnees_json, devis_id, tvaValue);
              break;
          case 5:
              prix = await this.get_prix_tache_5(donnees_json, devis_id, tvaValue);
              break;
          case 10:
              prix = await this.get_prix_tache_10(donnees_json, devis_id, tvaValue);
              break;
          case 11:
              prix = await this.get_prix_tache_11(donnees_json, devis_id, tvaValue);
              break;
          case 12:
              prix = await this.get_prix_tache_12(donnees_json, devis_id, tvaValue);
              break;
          case 9:
              prix = await this.get_prix_tache_9(donnees_json, devis_id, tvaValue);
              break;
          case 8:
              prix = await this.get_prix_tache_8(donnees_json, devis_id, tvaValue);
              break;
          case 13:
              prix = await this.get_prix_tache_13(donnees_json, devis_id, tvaValue);
              break;
          case 14:
              prix = await this.get_prix_tache_14(donnees_json, devis_id, tvaValue);
              break;
          case 15:
              prix = await this.get_prix_tache_15(donnees_json, devis_id, tvaValue);
              break;
          case 16:
              prix = await this.get_prix_tache_16(donnees_json, devis_id, tvaValue);
              break;
          default:
              throw new Error(`Tâche inconnue avec l'ID ${idtache}`);
      }
      
      return prix
  }

  async init() {
    await this.initTaches();
    return this;
  }
    async initTaches() {
        try {
            const taches = await Promise.all([
            
                this.get_tache_generale(24),
                this.get_tache_generale(25),
                this.get_tache_generale(26),
                this.get_tache_generale(27),
                this.get_tache_generale(30),
                this.get_tache_generale(31),
                this.get_tache_generale(28),
                this.get_tache_generale(29),
            ]);

            const parametres = await Promise.all([
            
                this.get_parametre(6,"TVA"),
                this.get_parametre(1,"coefficient"),
            ]);

            

            this.parametre_tva = parametres[0];
            this.parametre_coef = parametres[1];

           
        
            this.tache_depose_element_plomberie = taches[0];
            this.tache_creation_de_murs_non_porteurs = taches[1];
            this.tache_renovation_electrique_de_chauffage = taches[2];
            this.tache_mise_en_securité = taches[3];
            this.tache_renovation_electrique_complete = taches[4];
            this.tache_linteau = taches[5];
            this.tache_remplacement_appareils_electrique = taches[6];
            this.tache_creation_appareils_electrique = taches[7];
          
          
        } catch (error) {
            console.error("Erreur lors de l'initialisation des tâches:", error.message);
        }
    }

    async get_parametre(id = null, nom = null) {
        try {
            // Vérifier qu'au moins un critère est fourni
            if (id === null && nom === null) {
                console.error("Au moins un critère (ID ou nom) doit être fourni");
                return null;
            }

            // Construire la condition WHERE dynamiquement
            const whereClause = {};
            
            if (id !== null) {
                whereClause.ID = id;
            }
            
            if (nom !== null) {
                whereClause.Nom = nom;
            }

            // Rechercher avec les critères spécifiés
            const parametre = await Parametre.findOne({
                where: whereClause
            });

            if (parametre) {
                console.log("Paramètre trouvé:", parametre.dataValues);
                return parametre.dataValues;
            } else {
                console.log("Aucun paramètre trouvé avec les critères:", whereClause);
                return null;
            }
        } catch (error) {
            console.error("Erreur lors de la recherche du paramètre:", error.message);
            return null;
        }
    }

    async get_remise_by_devis(devis_id) {
      try {
        const remises = await Remise.findAll({
          where: { DevisID: devis_id },
          order: [['ID', 'ASC']]
        });

        return remises; // tableau (vide ou non)
      } catch (error) {
        console.error("Erreur lors de la recherche des remises:", error.message);
        return [];
      }
    }


    async get_tache_generale(id){
        try {
            const tache_generale = await TacheGenerale.findByPk(id);
            if (tache_generale) {
                console.error(tache_generale.dataValues);
                return tache_generale.dataValues;
            } else {
                return null;
            }
          } catch (error) {
            console.error(error.message);
            return null;
          }
    }


    async get_prix_tache_5(donnees_json, devis_id, tvaValue) {
      let formule = ""; // Stocke la formule explicative
      let prix = 0; // Prix total initialisé à 0
      let formule_marge='';
      let prix_marge = 0;

      const tva = 1+(tvaValue/100); // 20
        const coefficient = this.parametre_coef.Valeur; // 1.25
        console.log("tva ",tva)
        console.log("coefficient ",coefficient)
  
      const murs = donnees_json["dimensions-pose-murs"].murs;
      const etatSurfaces = donnees_json["etat-surfaces-pose-murs"].murs;
      const gammesProduits = donnees_json["gammes-produits-pose-murs"].murs;
  
      murs.forEach((mur, index) => {
          let surface = mur.hauteur * mur.longueur/10000;
  
          // Récupération du prix de la gamme pour ce mur
          const gammePrix = parseFloat(gammesProduits[index].gamme.split(':')[2]);
          const gammeTitre = (gammesProduits[index].gamme.split(':')[1]);
          let sousTotalGamme = surface * gammePrix;
          prix += sousTotalGamme;
          formule += `<u>Prix de pose du mur ${index + 1}</u>\n Surface (${surface} m²) * prix de la gamme choisie "${gammeTitre}" (${gammePrix} €) = ${sousTotalGamme.toFixed(2)} €\n`;
  
          // Vérification de l'état de la surface pour inclure les coûts de dépose
          const etat = etatSurfaces[index].etat;
          const typedepose = mur.depose;
          const prixDepose = parseFloat(typedepose.split(':')[2]);
          const titreDepose = (typedepose.split(':')[1]);
          if(prixDepose<1){
            let prixEtat = parseFloat(etat.split('-')[2]);
            let sousTotalEtat = surface * prixEtat;
            let titreEtat = (etat.split('-')[1]);
            prix += sousTotalEtat;
            formule += `Aucun revetement à déposer.\n`;

            formule += `<u>Prix de l'état du mur ${index + 1}</u>\n Surface (${surface} m²) * prix de l'état de surface "${titreEtat}" (${prixEtat} €) = ${sousTotalEtat.toFixed(2)} €\n`;
            
          }else{
            let sousTotalDepose = surface * prixDepose;
            prix += sousTotalDepose;
            formule += `<u>Prix de dépose du mur ${index + 1}</u>\n Surface (${surface} m²) * prix du revêtement à déposer "${titreDepose}" (${prixDepose} €) = ${sousTotalDepose.toFixed(2)} €\n`;
            
          }

          //donnees prix coutant
          if(gammesProduits[index].artisan_pose){

            const prix_artisan_pose_marge = parseFloat(gammesProduits[index].artisan_pose.split(':')[2]);
            const prix_fournisseur_pose_marge = parseFloat(gammesProduits[index].fournisseur_pose.split(':')[2]);
            let sousTotalGamme_marge = surface * (prix_artisan_pose_marge+prix_fournisseur_pose_marge);
            prix_marge += sousTotalGamme_marge;
            formule_marge += `<u>Prix de pose du mur ${index + 1} "${gammeTitre}"</u>\n Surface (${surface} m²) * prix artisan (${prix_artisan_pose_marge} €) + prix fournisseur (${prix_fournisseur_pose_marge} €) = ${sousTotalGamme_marge.toFixed(2)} €\n`;
    
            // Vérification de l'état de la surface pour inclure les coûts de dépose
            const etat_artisan = gammesProduits[index].artisan_surfaces;
            const typedeposeArtisan = gammesProduits[index].artisan_depose;
            const prixDeposeArtisan = parseFloat(typedepose.split(':')[2]);
            if(prixDepose<1){
              let prixEtatArtisan = parseFloat(etat_artisan.split('-')[2]);
              let sousTotalEtat_marge = surface * prixEtatArtisan;
              let titreEtatArtisan = (etat_artisan.split('-')[1]);
              prix_marge += sousTotalEtat_marge;
              formule_marge += `Aucun revetement à déposer.\n`;

              formule_marge += `<u>Prix de l'état du mur ${index + 1} "${titreEtatArtisan}"</u>\n Surface (${surface} m²) * prix de l'artisan (${prixEtatArtisan} €) = ${sousTotalEtat_marge.toFixed(2)} €\n`;
              
            }else{
              let sousTotalDepose_marge = surface * prixDeposeArtisan;
              prix_marge += sousTotalDepose_marge;
              formule_marge += `<u>Prix de dépose du mur ${index + 1} "${titreDepose}"</u>\n Surface (${surface} m²) * prix de l'artisan (${prixDeposeArtisan} €) = ${sousTotalDepose_marge.toFixed(2)} €\n`;
              
            }

          }
          
          
          
      });
  
        const resultatFinal = await this.appliquerRemisesEtTaxes({
          prix_base: prix,
          devis_id,
          coefficient,
          tva,
          formule
        });

         const resultatFinalMarge = await this.appliquerRemisesEtTaxes({
          prix_base: prix_marge,
          devis_id,
          coefficient,
          tva,
          formule:formule_marge,
        });

      
        // Retourner le prix total et la formule descriptive
        return {
          prix_ht: resultatFinal.total_apres_remise,
          prix: resultatFinal.total_ttc,
          formule: resultatFinal.formule,
           prix_marge: resultatFinalMarge.total_ttc,
           prix_marge_ht: resultatFinalMarge.total_ht,
          formule_marge: resultatFinalMarge.formule,
        };
    }
  
    async get_prix_tache_2(donnees_json, devis_id, tvaValue) {
      let prix = 0;
      let formule = "";
      let formule_marge='';
      let prix_marge = 0;
      const tva = 1+(tvaValue/100); // 20
      const coefficient = this.parametre_coef.Valeur; // 1.25
      console.log("tva ",tva)
      console.log("coefficient ",coefficient)
    
      // Extraire les données nécessaires
      const appareils_cuisine = donnees_json["gammes-produits-pose-elementcuisines"].appareils_cuisine;
      const gammes_depose_form = donnees_json["dimensions-pose-elementcuisines"].gammes_depose_form;
    
      // Prix des éléments a deposer
      gammes_depose_form.forEach(element => {
        
        let qte=element.quantite;
        let prixLocal = qte * element.prix;
        prix += prixLocal;
        formule += `<u>Prix de dépose de l'élement "${element.titre}"</u>\n Quantité (${qte}) * prix de dépose (${element.prix} €) = ${prixLocal} €\n`;
        
        
        
        if(element.artisan_depose ){
          let aParts = element.artisan_depose.split(":");
          let prixdepose = parseFloat(aParts[2]);
          let prix_total = prixdepose*qte;
          prix_marge += prix_total;
          formule_marge += `<u>Prix de dépose de l'élement "${element.titre}"</u>\n 1 * prix artisan (${prixdepose} €) x quantité (${qte} ) = ${prix_total} €\n`;
        }
      
      });
    
      // Calculer le prix pour " pose appareils_cuisine"
      
        appareils_cuisine.forEach(element => {
          if(element.active){
            let prixLocal = parseFloat(element.modele.split(':')[2]);
            let titre = (element.modele.split(':')[1]);
            prix += prixLocal;
            formule += `<u>Prix de pose de l'élement "${titre}"</u>\n Quantité (1) * prix (${prixLocal} €) = ${prixLocal} €\n`;
          
            if(element.artisan_pose && element.fournisseur_pose){
                let aParts = element.artisan_pose.split(":");
                let fParts = element.fournisseur_pose.split(":");
                let prixArtisan = parseFloat(aParts[2]);
                let prixFournisseur = parseFloat(fParts[2]);
                let prix_total = prixArtisan+prixFournisseur;
                prix_marge += prix_total;
                formule_marge += `<u>Prix de pose de l'élement "${titre}"</u>\n 1 * prix artisan (${prixArtisan} €) + prix fournisseur (${prixFournisseur} €) = ${prix_total} €\n`;
  
            }
          
          
          }
          
        });
      

        const resultatFinalMarge = await this.appliquerRemisesEtTaxes({
          prix_base: prix_marge,
          devis_id,
          coefficient,
          tva,
          formule:formule_marge,
        });
          
    
        const resultatFinal = await this.appliquerRemisesEtTaxes({
          prix_base: prix,
          devis_id,
          coefficient,
          tva,
          formule
        });

      
        // Retourner le prix total et la formule descriptive
        return {
          prix_ht: resultatFinal.total_apres_remise,
          prix: resultatFinal.total_ttc,
          formule: resultatFinal.formule,
          prix_marge: resultatFinalMarge.total_ttc,
          prix_marge_ht: resultatFinalMarge.total_ht,
          formule_marge: resultatFinalMarge.formule,
        };
    }
      

      async get_prix_tache_3(donnees_json, devis_id, tvaValue) {
        let prix = 0;
        let formule = ""; // Initialisation de la chaîne de formule
        let formule_marge='';
        let prix_marge = 0;
        const tva = 1+(tvaValue/100); // 20
        const coefficient = this.parametre_coef.Valeur; // 1.25
        console.log("tva ",tva)
        console.log("coefficient ",coefficient)
      
        let gammes = donnees_json["gammes-produits-murs-non-porteurs"];
        let mursnonporteurs = gammes.mursNonporteurs;
        let ouvertures = gammes.ouverturePartielle;
        
        let has_partie_murs = gammes.tp1;
        let has_partie_ouvertures = gammes.tp3;
        let prix_linteau = this.tache_linteau.Prix;
        
    
      
        // Calcul des murs non porteurs
        if (has_partie_murs) {
          let total_murs = mursnonporteurs.length;
          for (let i = 0; i < total_murs; i++) {
            let prix_unit_mur = parseFloat(mursnonporteurs[i].cloison.split(':')[2]);
            let titre_cloison_mur = (mursnonporteurs[i].cloison.split(':')[1]);
            let surface_mur = mursnonporteurs[i].longueur*mursnonporteurs[i].hauteur/10000;
            let prix_final_mur =  (surface_mur * prix_unit_mur);
            prix += prix_final_mur;
            formule += `<u>Prix du mur ${i+1}</u>\n Surface (${surface_mur} m²) * prix unitaire cloison '${titre_cloison_mur}' (${prix_unit_mur} €) = ${prix_final_mur.toFixed(2)} €\n`;
          
          
            let artisan_pose = mursnonporteurs[i].artisan_pose
            let fournisseur_pose = mursnonporteurs[i].fournisseur_pose
            if(artisan_pose ){
              let prix_artisan_pose_marge = parseFloat(artisan_pose.split(':')[2]);
            
              let prix_marge =  prix_artisan_pose_marge;
              let prix_final_mur_marge = surface_mur * prix_marge * 1;
              prix_marge += prix_final_mur_marge;
              formule_marge += `<u>Prix du mur ${i+1} cloison ${titre_cloison_mur} cm</u>\n  Surface ${surface_mur} m² * prix de l'artisan ${prix_artisan_pose_marge} €  = ${prix_final_mur_marge.toFixed(2)} €\n`;
          

            }
          
          }
        }
      
        // Calcul des ouvertures partielles
        if (has_partie_ouvertures) {
          let total_ouvertures = ouvertures.length;
          for (let j = 0; j < total_ouvertures; j++) {
            let hdp=ouvertures[j].hauteur_depuis_le_plafond
            let louv=ouvertures[j].longueur_ouverture/100
            let prix_unit_cloison = parseFloat(ouvertures[j].cloison.split(':')[2]);
            let titre_cloison_mur = (ouvertures[j].cloison.split(':')[1]);
            let surface_ouverture = ((ouvertures[j].longueur*ouvertures[j].hauteur)-(ouvertures[j].longueur_ouverture*ouvertures[j].hauteur_ouverture))/1000000;
            let prix_final_ouverture =  (surface_ouverture * prix_unit_cloison);
            prix += prix_final_ouverture;
            formule += `<u>Prix de l'ouverture ${j+1}</u>\n Surface de l'ouverture (${surface_ouverture} m²) * prix unitaire cloison '${titre_cloison_mur}' (${prix_unit_cloison} €) = ${prix_final_ouverture.toFixed(2)} €\n`;
            if(hdp>0){
              let prix_final_linteau =  (louv * prix_linteau);
              prix += prix_final_linteau;
              formule += `<u>Prix du linteau sur l'ouverture ${j+1} (car la hauteur depuis le plafond est ${hdp} cm >0)</u>\n Longueur de l'ouverture (${louv} m) * prix du linteau au metre (${prix_linteau} €) = ${prix_final_linteau.toFixed(2)} €\n`;

            }

            let artisan_pose = ouvertures[j].artisan_pose
            let fournisseur_pose = ouvertures[j].fournisseur_pose
            if(artisan_pose ){
              let prix_artisan_pose_ouverture_marge = parseFloat(artisan_pose.split(':')[2]);
            
              let prix_ouverture_marge = prix_artisan_pose_ouverture_marge ;
              let prix_final_ouverture =  (surface_ouverture * prix_ouverture_marge);
               prix_marge += prix_final_ouverture;
              formule_marge += `<u>Prix de l'ouverture ${j+1} cloison '${titre_cloison_mur}'</u>\n Surface de l'ouverture (${surface_ouverture} m²) * prix artisan (${prix_artisan_pose_ouverture_marge} €)  = ${prix_final_ouverture.toFixed(2)} €\n`;
              if(hdp>0){
                let prix_final_linteau =  (louv * prix_linteau);
                prix_marge += prix_final_linteau;
                formule_marge += `<u>Prix du linteau sur l'ouverture ${j+1} (car la hauteur depuis le plafond est ${hdp} cm >0)</u>\n Longueur de l'ouverture (${louv} m) * prix du linteau au metre (${prix_linteau} €) = ${prix_final_linteau.toFixed(2)} €\n`;

              }

            }
        
          }
        }
      
        const resultatFinal = await this.appliquerRemisesEtTaxes({
          prix_base: prix,
          devis_id,
          coefficient,
          tva,
          formule
        });

        const resultatFinalMarge = await this.appliquerRemisesEtTaxes({
          prix_base: prix_marge,
          devis_id,
          coefficient,
          tva,
          formule:formule_marge,
        });

      
        // Retourner le prix total et la formule descriptive
        return {
          prix_ht: resultatFinal.total_apres_remise,
          prix: resultatFinal.total_ttc,
          formule: resultatFinal.formule,           
          prix_marge: resultatFinalMarge.total_ttc,
          prix_marge_ht: resultatFinalMarge.total_ht,
          formule_marge: resultatFinalMarge.formule,
        };
      }
      
      
        getTarif(id){
          return id
        }


        async get_prix_tache_4(donnees_json, devis_id, tvaValue) {
          let prix = 0;
          let formule = ""; // Initialisation de la chaîne de formule
          let formule_marge='';
          let prix_marge = 0;

          const tva = 1+(tvaValue/100); // 20
          const coefficient = this.parametre_coef.Valeur; // 1.25
          console.log("tva ",tva)
          console.log("coefficient ",coefficient)
        
          let murs = donnees_json["gammes-produits-creation-murs-non-porteurs--portes"].murs_non_porteurs;
          let has_portes = donnees_json["gammes-produits-creation-murs-non-porteurs--portes"].has_portes;
          let portes = donnees_json["gammes-produits-creation-murs-non-porteurs--portes"].portes;
          // Calcul du prix pour les murs non porteurs
          let total_murs = murs.length;
          for (let i = 0; i < total_murs; i++) {

            let prix_unit_epaisseur = parseFloat(murs[i].epaisseur.split(":")[1]);
            let titre_epaisseur = (murs[i].epaisseur.split(":")[2]);
            let surface = murs[i].longueur*murs[i].hauteur/10000;
            let prix_final_mur = surface * prix_unit_epaisseur * 1;
            prix += prix_final_mur;
            formule += `<u>Prix du mur ${i+1}</u>\n  Surface ${surface} m² * prix unitaire 'épaisseur ${titre_epaisseur} cm' ${prix_unit_epaisseur} € = ${prix_final_mur.toFixed(2)} €\n`;
          

            //donnees prix coutant
            let artisan_pose = murs[i].artisan_pose
            if(artisan_pose){
              const prix_artisan_pose_marge = parseFloat(artisan_pose.split(':')[2]);
              let prix_final_mur_marge = surface * prix_artisan_pose_marge * 1;
              prix_marge += prix_final_mur_marge;
              formule_marge += `<u>Prix du mur ${i+1}</u>\n  Surface ${surface} m² * prix de l'artisan 'épaisseur ${titre_epaisseur} cm' ${prix_artisan_pose_marge} € = ${prix_final_mur_marge.toFixed(2)} €\n`;
          

            }

          
          
          }

          if(has_portes){
            // Calcul du prix pour les portes
            let total_portes = portes.length;
            for (let j = 0; j < total_portes; j++) {
              let gamme_porte = portes[j].gamme;
              let prix_unit_porte = parseFloat(gamme_porte.split(":")[1]); // Le prix est en position 1 du split
              let titre_gamme = (gamme_porte.split(":")[2]);
              let prix_final_porte = 1 * prix_unit_porte * 1;
              prix += prix_final_porte;

              formule += `<u>Prix porte ${j+1}</u>\n 1 * Prix unitaire de la gamme '${titre_gamme}' ${prix_unit_porte} € = ${prix_final_porte.toFixed(2)} €\n`;
            }
          }


         const resultatFinalMarge = await this.appliquerRemisesEtTaxes({
          prix_base: prix_marge,
          devis_id,
          coefficient,
          tva,
          formule:formule_marge,
        });
          
          const resultatFinal = await this.appliquerRemisesEtTaxes({
            prix_base: prix,
            devis_id,
            coefficient,
            tva,
            formule
          });

      
        // Retourner le prix total et la formule descriptive
        return {
          prix_ht: resultatFinal.total_apres_remise,
          prix: resultatFinal.total_ttc,
          formule: resultatFinal.formule,
           prix_marge: resultatFinalMarge.total_ttc,
           prix_marge_ht: resultatFinalMarge.total_ht,
          formule_marge: resultatFinalMarge.formule,
        };
        }
        

      async get_prix_tache_10(donnees_json, devis_id, tvaValue) {
        let prix = 0;
        let formule = ""; // Chaîne pour construire la formule
        let formule_marge='';
        let prix_marge = 0;

        const tva = 1+(tvaValue/100); // 20
        const coefficient = this.parametre_coef.Valeur; // 1.25
        console.log("tva ",tva)
        console.log("coefficient ",coefficient)
        
        const portes = donnees_json["gammes-produits-pose-portes"].portes;
        
        // Parcourir chaque porte
        portes.forEach((porte, index) => {
          let prix_gamme= parseFloat(porte.gamme.split(":")[1]);
          let prix_nature_porte= parseFloat(porte.nature_porte.split(":")[1]);
          let prix_type_porte= parseFloat(porte.type_porte.split(":")[1]);
          let titre_gamme= (porte.gamme.split(":")[2]);
          let titre_nature_porte= (porte.nature_porte.split(":")[2]);
          let titre_type_porte= (porte.type_porte.split(":")[2]);
          
          prix += prix_gamme + prix_nature_porte + prix_type_porte ;
          // Ajouter les calculs à la formule
          formule += `<u>Prix de la porte ${index+1} </u>\n Prix de la gamme de porte "${titre_gamme}" (${prix_gamme} €) + Prix de la nature de la porte "${titre_nature_porte}" (${prix_nature_porte} €) + Prix du type de porte "${titre_type_porte}" (${prix_type_porte} €) = ${prix_gamme + prix_nature_porte + prix_type_porte} €\n`;
          
          if(porte.artisan_pose && porte.fournisseur_pose && porte.artisan_nature && porte.fournisseur_nature && porte.artisan_type && porte.fournisseur_type){
            let prix_artisan_pose = parseFloat(porte.artisan_pose.split(":")[1]);
            let prix_fournisseur_pose = parseFloat(porte.fournisseur_pose.split(":")[1]);

            let prix_artisan_nature = parseFloat(porte.artisan_nature.split(":")[1]);
            let prix_fournisseur_nature = parseFloat(porte.fournisseur_nature.split(":")[1]);

            let prix_artisan_type = parseFloat(porte.artisan_type.split(":")[1]);
            let prix_fournisseur_type = parseFloat(porte.fournisseur_type.split(":")[1]);

            let prix_total_porte = prix_artisan_pose + prix_fournisseur_pose + prix_artisan_nature + prix_fournisseur_nature + prix_artisan_type + prix_fournisseur_type;
            prix_marge += prix_total_porte ;
            formule_marge += `<u>Prix de la porte ${index+1} </u>\n 
            Pose :
            - Artisan : ${prix_artisan_pose} €
            - Fournisseur : ${prix_fournisseur_pose} €
            => Total pose : ${prix_artisan_pose + prix_fournisseur_pose} €

            Gamme "${titre_gamme}" :
            - Artisan : ${prix_artisan_nature} €
            - Fournisseur : ${prix_fournisseur_nature} €
            => Total gamme : ${prix_artisan_nature + prix_fournisseur_nature} €

            type "${titre_type_porte}" :
            - Artisan : ${prix_artisan_type} €
            - Fournisseur : ${prix_fournisseur_type} €
            => Total type : ${prix_artisan_type + prix_fournisseur_type} €
            
            = ${prix_total_porte} €\n`;

          }

        
        });
      
        
          const resultatFinal = await this.appliquerRemisesEtTaxes({
          prix_base: prix,
          devis_id,
          coefficient,
          tva,
          formule
        });

         const resultatFinalMarge = await this.appliquerRemisesEtTaxes({
          prix_base: prix_marge,
          devis_id,
          coefficient,
          tva,
          formule:formule_marge,
        });

        return {
          prix_ht: resultatFinal.total_apres_remise,
          prix: resultatFinal.total_ttc,
          formule: resultatFinal.formule,
           prix_marge: resultatFinalMarge.total_ttc,
           prix_marge_ht: resultatFinalMarge.total_ht,
          formule_marge: resultatFinalMarge.formule,
        };

      }
        


       async get_prix_tache_11(donnees_json, devis_id, tvaValue) {
          let prix = 0;
          let formule = ""; // Chaîne pour documenter les calculs
          const tva = 1+(tvaValue/100); // 20
        const coefficient = this.parametre_coef.Valeur; // 1.25
        console.log("tva ",tva)
        console.log("coefficient ",coefficient)
          const prix_depose = this.tache_depose_element_plomberie.Prix; // Prix fixe pour la dépose (modifiable)
      
          // Identifier quelle clé est présente
          let appareils = [];
          if (donnees_json["gammes-produits-pose-plomberie-cuisine"]?.appareils_cuisine) {
              appareils = donnees_json["gammes-produits-pose-plomberie-cuisine"].appareils_cuisine;
          } else if (donnees_json["gammes-produits-pose-plomberie-salle-de-bain"]?.appareils_salle_de_bain) {
              appareils = donnees_json["gammes-produits-pose-plomberie-salle-de-bain"].appareils_salle_de_bain;
          } else {
              // Si aucune des gammes n'est présente, retourner un prix de 0
              return { prix: 0, formule: "Aucune donnée valide trouvée pour les appareils." };
          }
      
          // Parcourir chaque appareil
          appareils.forEach((appareil) => {
              if (appareil.active) {
                  // Extraire le prix à partir de la fin du champ "modele"
                  const prix_appareil = parseFloat(appareil.modele.split(":")[2]);
                  prix += prix_appareil;
      
                  // Documenter le prix de l'appareil dans la formule
                  formule += `${prix_appareil} (prix de l'appareil "${appareil.modele.split(":")[1]}")\n`;
      
                  // Ajouter le prix de dépose si applicable
                  if (appareil.depose) {
                      prix += prix_depose;
                      formule += `${prix_depose} (prix de dépose pour "${appareil.modele.split(":")[1]}")\n`;
                  }
              }
          });
      
           const resultatFinal = await this.appliquerRemisesEtTaxes({
          prix_base: prix,
          devis_id,
          coefficient,
          tva,
          formule
        });

      
        // Retourner le prix total et la formule descriptive
        return {
          prix_ht: resultatFinal.total_apres_remise,
          prix: resultatFinal.total_ttc,
          formule: resultatFinal.formule
        };
      }
      
        
      
       async get_prix_tache_12(donnees_json, devis_id, tvaValue) {
        let formule = ""; // Stocke la formule explicative
        let prix = 0;
        let formule_marge='';
        let prix_marge = 0;
        const tva = 1+(tvaValue/100); // 20
        const coefficient = this.parametre_coef.Valeur; // 1.25
        console.log("tva ",tva)
        console.log("coefficient ",coefficient)
      
        // Données principales
        const surface = donnees_json["dimensions-pose-chauffage"].surface;
        const radiateursTypes = donnees_json["etat-surfaces-pose-chauffage"].radiateurs;
        const radiateursGammes = donnees_json["gammes-produits-pose-chauffage"].radiateurs;
    
      
        // Itération sur chaque radiateur
        radiateursTypes.forEach((radiateur, index) => {
          const type = radiateur.type;
          const gamme = radiateursGammes[index].gamme;
    
            
          // Si le radiateur est à poser et que la gamme est visible
          const TypeParts = type.split(":");
          const gammeParts = gamme.split(":");
          const prixType = parseFloat(TypeParts[1]); // Prix du Type
          const prixGamme = parseFloat(gammeParts[1]); // Prix de la gamme
          const nomGamme = (gammeParts[2]); // nom de la gamme
          const nomType = (TypeParts[2]); // nom du Type
          prix += prixGamme;
          formule += `<u>Prix du radiateur ${index + 1}</u>\n Prix de la gamme choisie (${nomGamme}) = ${prixGamme} €\n`;
          

          
          const artisan_type = radiateur.artisan_type;
          const fournisseur_type = radiateur.fournisseur_type;
          const artisan_pose = radiateursGammes[index].artisan_pose;
          const fournisseur_pose = radiateursGammes[index].fournisseur_pose;
          if(fournisseur_pose && artisan_pose && artisan_type && fournisseur_type){
            let prix_artisan_type = parseFloat(artisan_type.split(":")[1]); // Prix du Type
            let prix_fournisseur_type = parseFloat(fournisseur_type.split(":")[1]); // Prix du Type
            let prix_artisan_pose = parseFloat(artisan_pose.split(":")[1]); // Prix du Type
            let prix_fournisseur_pose = parseFloat(fournisseur_pose.split(":")[1]); // Prix du Type

            let total = prix_artisan_type+prix_fournisseur_type+prix_artisan_pose+prix_fournisseur_pose

            prix_marge += total;
            formule_marge += `<u>Prix du radiateur ${index + 1}</u>
            Prix de la gamme choisie (${nomGamme}) : ${prix_artisan_type} € (artisan type) + ${prix_fournisseur_type} € (fournisseur type)  + ${prix_artisan_pose} € (artisan gamme) + ${prix_fournisseur_pose} € (fournisseur gamme) = ${total} €\n`;
          }
        });
      
        const resultatFinal = await this.appliquerRemisesEtTaxes({
          prix_base: prix,
          devis_id,
          coefficient,
          tva,
          formule
        });

         const resultatFinalMarge = await this.appliquerRemisesEtTaxes({
          prix_base: prix_marge,
          devis_id,
          coefficient,
          tva,
          formule:formule_marge,
        });


      
        // Retourner le prix total et la formule descriptive
        return {
          prix_ht: resultatFinal.total_apres_remise,
          prix: resultatFinal.total_ttc,
          formule: resultatFinal.formule,
           prix_marge: resultatFinalMarge.total_ttc,
           prix_marge_ht: resultatFinalMarge.total_ht,
          formule_marge: resultatFinalMarge.formule,
        };
      }

      
      
      async get_prix_tache_8(donnees_json, devis_id, tvaValue) {
          let formule = ""; // Stocke la formule explicative
          let prix = 0;
          let formule_marge = ""; // Stocke la formule explicative
          let prix_marge = 0;
          const tva = 1+(tvaValue/100); // 20
          const coefficient = this.parametre_coef.Valeur; // 1.25
          console.log("tva ",tva)
          console.log("coefficient ",coefficient)
      
          // Données principales
           const gammes = donnees_json["gammes-produits-pose-plafond"];
          const surface = donnees_json["dimensions-pose-plafond"].longueur * donnees_json["dimensions-pose-plafond"].largeur/10000;
          const id_prix_gamme = gammes.gamme;
          const prix_depose = parseFloat(donnees_json["dimensions-pose-plafond"].depose.split(':')[2]);
          const titre_depose = (donnees_json["dimensions-pose-plafond"].depose.split(':')[1]);
          const etat_surface = donnees_json["etat-surfaces-pose-plafond"].etat;
          const prix_etat_surface = parseFloat(etat_surface.split('-')[2]);
          const titre_etat_surface = (etat_surface.split('-')[1]);
          // Calcul du prix de la gamme
          const gammeParts = id_prix_gamme.split(':'); // Sépare la chaîne en parties
          const prix_gamme = parseFloat(gammeParts[2]); // Dernier élément
          const nom_gamme = (gammeParts[1]); // Dernier élément
          if(prix_depose<1){
            let sousTotalEtat = prix_etat_surface * surface;
            prix += sousTotalEtat;
            formule += `Pas de revêtement à déposer.\n `;
            formule += `<u>Prix de l'état de surface</u>\n Surface (${surface} m²) * Prix de l'état de surface "${titre_etat_surface}" (${prix_etat_surface} €) = ${sousTotalEtat.toFixed(2)} €\n`;
          }else{
            let sousTotalDeposeGamme = prix_depose * surface;
            prix += sousTotalDeposeGamme;
            formule += `<u>Prix de la dépose</u>\n Surface (${surface} m²) * Prix de la gamme du revêtement à déposer "${titre_depose}" (${prix_depose} €) = ${sousTotalDeposeGamme.toFixed(2)} €\n`;  
          }
          let sousTotalGamme = prix_gamme * surface;
          prix += sousTotalGamme;
          formule += `<u>Prix de la pose</u>\n  Surface (${surface} m²) * Prix de la gamme choisie "${nom_gamme}" (${prix_gamme} €) = ${sousTotalGamme.toFixed(2)} €\n`;


           //donnees prix coutant
          const prix_fournisseur_pose = this.getLastPrice(gammes.fournisseur_pose);
          const prix_artisan_pose = this.getLastPrice(gammes.artisan_pose);
          const prix_artisan_surfaces = this.getLastPrice(gammes.artisan_surfaces);
          const prix_artisan_depose = this.getLastPrice(gammes.artisan_depose);

          if(prix_artisan_pose){
            const prix_pose_marge = prix_fournisseur_pose + prix_artisan_pose;

            if(prix_artisan_depose<1){
              let sousTotalEtat_marge = prix_artisan_surfaces * surface;
              prix_marge += sousTotalEtat_marge;
              formule_marge += `Pas de revêtement à déposer.\n `;
              formule_marge += `<u>Prix de l'état de surface "${titre_etat_surface}"</u>\n Surface (${surface} m²) * Prix de l'artisan  (${prix_artisan_surfaces} €) = ${sousTotalEtat_marge.toFixed(2)} €\n`;
            }else{
              let sousTotalDeposeGamme_marge = prix_artisan_depose * surface;
              prix_marge += sousTotalDeposeGamme_marge;
              formule_marge += `<u>Prix de la dépose "${titre_depose}"</u>\n Surface (${surface} m²) * Prix de l'artisan (${prix_artisan_depose} €) = ${sousTotalDeposeGamme_marge.toFixed(2)} €\n`;  
            }
            let sousTotalGamme_marge = prix_pose_marge * surface;
            prix_marge += sousTotalGamme_marge;
            formule_marge += `<u>Prix de la pose "${nom_gamme}" </u>\n  Surface (${surface} m²) * Prix artisan (${prix_artisan_pose} €) + Prix fournisseur (${prix_fournisseur_pose} €) = ${sousTotalGamme_marge.toFixed(2)} €\n`;

          }
         
      
        const resultatFinal = await this.appliquerRemisesEtTaxes({
          prix_base: prix,
          devis_id,
          coefficient,
          tva,
          formule
        });

        const resultatFinalMarge = await this.appliquerRemisesEtTaxes({
          prix_base: prix_marge,
          devis_id,
          coefficient,
          tva,
          formule:formule_marge,
        });


      
        // Retourner le prix total et la formule descriptive
        return {
          prix_ht: resultatFinal.total_apres_remise,
          prix: resultatFinal.total_ttc,
          formule: resultatFinal.formule,
          prix_marge: resultatFinalMarge.total_ttc,
          prix_marge_ht: resultatFinalMarge.total_ht,
          formule_marge: resultatFinalMarge.formule,
        };
      }

      getLastPrice = (value) => {
        const parts = value?.split(':');
        return parts?.length > 1 ? parseFloat(parts[parts.length - 1]) : 0;
      };
      
       async get_prix_tache_9(donnees_json, devis_id, tvaValue) {
        let formule = ""; // Stocke la formule explicative
        let formule_marge='';
        let prix = 0;
        let prix_marge = 0;
        const tva = 1+(tvaValue/100); // 20
        const coefficient = this.parametre_coef.Valeur; // 1.25
        console.log("tva ",tva)
        console.log("coefficient ",coefficient)
        console.log("devis_id ",devis_id)
    
        // Données principales
        const surface = donnees_json["dimensions-pose-sol"].longueur * donnees_json["dimensions-pose-sol"].largeur/10000;
        const prix_depose = parseFloat(donnees_json["dimensions-pose-sol"].depose.split(":")[2]);
        const nom_depose = (donnees_json["dimensions-pose-sol"].depose.split(":")[1]);
        const etat_surface = donnees_json["etat-surfaces-pose-sol"].etat;
        const gammes = donnees_json["gammes-produits-pose-sol"];
        const prix_etat_surface = parseFloat(etat_surface.split('-')[2]);
        const titre_etat_surface = (etat_surface.split('-')[1]);


        //donnees prix coutant
        const prix_fournisseur_pose = this.getLastPrice(gammes.fournisseur_pose);
        const prix_artisan_pose = this.getLastPrice(gammes.artisan_pose);
        const prix_fournisseur_pose_plinthes = this.getLastPrice(gammes.fournisseur_pose_plinthes);
        const prix_artisan_pose_plinthes = this.getLastPrice(gammes.artisan_pose_plinthes);
        const prix_artisan_surfaces = this.getLastPrice(gammes.artisan_surfaces);
        const prix_artisan_depose = this.getLastPrice(gammes.artisan_depose);
       


        // Vérification des gammes
        if (gammes.gamme) {
            const gammeParts = gammes.gamme.split(":");
            const prixGamme = parseFloat(gammeParts[gammeParts.length - 1]); // Dernier élément
            const nomGamme = (gammeParts[1]); // Dernier élément
            const sousTotalGamme = prixGamme * surface;
            prix += sousTotalGamme;
            formule += `<u>Prix de pose</u>\n  Surface (${surface} m²) * Prix de la gamme choisie "${nomGamme}" (${prixGamme} €) = ${sousTotalGamme.toFixed(2)} €\n`;
            if(gammes.artisan_depose){
              let prix_gamme_marge = prix_fournisseur_pose + prix_artisan_pose
              const sousTotalGamme_marge = prix_gamme_marge * surface;
              prix_marge += sousTotalGamme_marge;
              formule_marge+= `<u>Prix de pose "${nomGamme}"</u>\n  Surface (${surface} m²) * Prix artisan (${prix_artisan_pose} €) + Prix fournisseur (${prix_fournisseur_pose} €) = ${sousTotalGamme_marge.toFixed(2)} €\n`;
                
            }
        }

        if (prix_depose>0) {
          
          const sousTotaldepose = prix_depose * surface;
          const sousTotaldepose_marge = prix_artisan_depose * surface;
          prix += sousTotaldepose;
          formule += `<u>Prix de dépose</u>\n  Surface (${surface} m²) * Prix du revêtement à déposer "${nom_depose}" (${prix_depose} €) = ${sousTotaldepose.toFixed(2)} €\n`;
          
          if(gammes.artisan_depose){
              prix_marge += sousTotaldepose_marge;
              formule_marge += `<u>Prix de dépose</u>\n  Surface (${surface} m²) * Prix artisan du revêtement à déposer "${nom_depose}" (${prix_artisan_depose} €) = ${sousTotaldepose_marge.toFixed(2)} €\n`;
          }

        }else{

          const sousTotalEtat = prix_etat_surface * surface;
          prix += sousTotalEtat;
          formule += `Pas de revêtements à déposer\n`;
          formule += `<u>Prix de l'état de surface</u>\n  Surface (${surface} m²) * Prix de l'état de surface "${titre_etat_surface}" (${prix_etat_surface} €) = ${sousTotalEtat.toFixed(2)} €\n`;
        
          if(gammes.artisan_depose){
            const sousTotalEtat_marge = prix_artisan_surfaces * surface;
            prix_marge += sousTotalEtat_marge;
            formule_marge+= `Pas de revêtements à déposer\n`;
            formule_marge += `<u>Prix de l'état de surface</u>\n  Surface (${surface} m²) * Prix de l'état de surface "${titre_etat_surface}" (${prix_artisan_surfaces} €) = ${sousTotalEtat_marge.toFixed(2)} €\n`;
          }
      }
    
        // Vérification des plinthes
        if (gammes.plinthes) {
            const plintheParts = gammes.plinthes.split(":");
            const prixPlinthes = parseFloat(plintheParts[plintheParts.length - 1]); // Dernier élément
            const nomPlinthes = (plintheParts[1]); // Dernier élément
            const sousTotalPlinthes = prixPlinthes * surface;
            prix += sousTotalPlinthes;
            formule += `<u>Prix de la pose de plinthes</u>\n  Surface (${surface} m²) * Prix des plinthes "${nomPlinthes}" (${prixPlinthes} €) = ${sousTotalPlinthes.toFixed(2)} €\n`;
        
            if(gammes.artisan_depose){
              let prix_unit_marge = prix_artisan_pose_plinthes + prix_fournisseur_pose_plinthes;
              const sousTotalPlinthes_marge = prix_unit_marge * surface;
              prix_marge += sousTotalPlinthes_marge;
              formule_marge += `<u>Prix de la pose de plinthes "${nomPlinthes}"</u>\n  Surface (${surface} m²) * Prix artisans des plinthes (${prix_artisan_pose_plinthes} €) + Prix fournisseur des plinthes (${prix_fournisseur_pose_plinthes} €) = ${sousTotalPlinthes_marge.toFixed(2)} €\n`;
            }
        }


        const resultatFinal = await this.appliquerRemisesEtTaxes({
          prix_base: prix,
          devis_id,
          coefficient,
          tva,
          formule,
        });

        const resultatFinalMarge = await this.appliquerRemisesEtTaxes({
          prix_base: prix_marge,
          devis_id,
          coefficient,
          tva,
          formule:formule_marge,
        });

      
        // Retourner le prix total et la formule descriptive
        return {
          prix_ht: resultatFinal.total_apres_remise,
          prix: resultatFinal.total_ttc,
          formule: resultatFinal.formule,
          prix_marge: resultatFinalMarge.total_ttc,
          prix_marge_ht: resultatFinalMarge.total_ht,
          formule_marge: resultatFinalMarge.formule,
        };
    }
    
        

      async get_prix_tache_13(donnees_json, devis_id, tvaValue) {
          let prix = 0;
          let formule = ""; // Pour construire la formule explicative
          let formule_marge = ""; // Stocke la formule explicative
          let prix_marge = 0;

          const tva = 1+(tvaValue/100); // 20
          const coefficient = this.parametre_coef.Valeur; // 1.25
          console.log("tva ",tva)
          console.log("coefficient ",coefficient)
        
          const appareils = donnees_json["gammes-produits-pose-electricite"].appareils_electrique_a_remplacer;
          const gammes = donnees_json["gammes-produits-pose-electricite"]
          const gamme = gammes.gamme
          let prix_tache_creation = this.tache_creation_appareils_electrique.Prix;
          let prix_tache_remplacement = this.tache_remplacement_appareils_electrique.Prix;
          let nom_gamme =  (gamme.split("-")[2]);;
          let prix_gamme = JSON.parse(gamme.split("-")[1]);

          // Calcul pour chaque appareil électrique
          appareils.forEach((appareil, index) => {
            if (appareil.active) {
              let appareil_gamme = prix_gamme.find(a => a.nom.toLowerCase() === appareil.titre.toLowerCase());

              if (appareil.nombre_a_creer>0) {
                // création
                let nombre_a_creer = appareil.nombre_a_creer;
                let prix_creation = nombre_a_creer * appareil_gamme.prix * prix_tache_creation;
                prix += prix_creation;
                formule += `<u>Prix de la création de l'appareil "${appareil.titre}"</u>\n Nombre à créer (${nombre_a_creer}) * ${prix_tache_creation} € * ${appareil_gamme.prix} € = ${prix_creation.toFixed(2)} € \n`;
              }
              if (appareil.nombre_a_remplacer>0) {
                // remplacement
                let nombre_a_remplacer = appareil.nombre_a_remplacer;
                let prix_remplacement = nombre_a_remplacer * appareil_gamme.prix * prix_tache_remplacement;
                prix += prix_remplacement;
                formule += `<u>Prix du remplacement de l'appareil "${appareil.titre}"</u>\n Nombre à remplacer (${nombre_a_remplacer}) * ${prix_tache_remplacement} € * ${appareil_gamme.prix} € = ${prix_remplacement.toFixed(2)} € \n`;
              }
            }
          });


          //donnees prix coutant
          if(gammes.artisan_gamme){
            

            let prix_gamme_artisan = JSON.parse(gammes.artisan_gamme.split("-")[1]);
            let prix_gamme_fournisseur = JSON.parse(gammes.fournisseur_gamme.split("-")[1]);

            appareils.forEach((appareil, index) => {
              if (appareil.active) {
                let appareil_gamme_artisan = prix_gamme_artisan.find(a => a.nom.toLowerCase() === appareil.titre.toLowerCase());
                let appareil_gamme_fournisseur = prix_gamme_fournisseur.find(a => a.nom.toLowerCase() === appareil.titre.toLowerCase());

                if (appareil.nombre_a_creer>0) {
                  // création
                  let nombre_a_creer = appareil.nombre_a_creer;
                  let prix_creation_artisan = nombre_a_creer * appareil_gamme_artisan.prix * prix_tache_creation;
                  let prix_creation_fournisseur = nombre_a_creer * appareil_gamme_fournisseur.prix * prix_tache_creation;
                  let prix_creation = prix_creation_artisan+prix_creation_fournisseur;
                  prix_marge += prix_creation;
                  formule_marge += `<u>Prix de la création de l'appareil "${appareil.titre}"</u>\n Nombre à créer (${nombre_a_creer}) * ${prix_tache_creation} € * prix artisan ${appareil_gamme_artisan.prix} € + prix fournisseur ${appareil_gamme_fournisseur.prix} € = ${prix_creation.toFixed(2)} € \n`;
                }
                if (appareil.nombre_a_remplacer>0) {
                  // remplacement
                  let nombre_a_remplacer = appareil.nombre_a_remplacer;
                  let prix_remplacement_artisan = nombre_a_remplacer * appareil_gamme_artisan.prix * prix_tache_remplacement;
                  let prix_remplacement_fournisseur = nombre_a_remplacer * appareil_gamme_fournisseur.prix * prix_tache_remplacement;
                  let prix_remplacement = prix_remplacement_artisan+prix_remplacement_fournisseur;
                  prix_marge += prix_remplacement;
                  formule_marge += `<u>Prix du remplacement de l'appareil "${appareil.titre}"</u>\n Nombre à remplacer (${nombre_a_remplacer}) * ${prix_tache_remplacement} € * prix artisan ${appareil_gamme_artisan.prix} € + prix fournisseur ${appareil_gamme_fournisseur.prix} € = ${prix_remplacement.toFixed(2)} € \n`;
                }
              }
            });

          }
          
        
           
            
            
         
          const resultatFinal = await this.appliquerRemisesEtTaxes({
            prix_base: prix,
            devis_id,
            coefficient,
            tva,
            formule
          });

          const resultatFinalMarge = await this.appliquerRemisesEtTaxes({
          prix_base: prix_marge,
          devis_id,
          coefficient,
          tva,
          formule:formule_marge,
        });

        
          // Retourner le prix total et la formule descriptive
          return {
            prix_ht: resultatFinal.total_apres_remise,
            prix: resultatFinal.total_ttc,
            formule: resultatFinal.formule,
            prix_marge: resultatFinalMarge.total_ttc,
            prix_marge_ht: resultatFinalMarge.total_ht,
          formule_marge: resultatFinalMarge.formule,
          };
        }
        


      async get_prix_tache_14(donnees_json, devis_id, tvaValue) {
          
          let prix=0
          const tva = 1+(tvaValue/100); // 20
        const coefficient = this.parametre_coef.Valeur; // 1.25
        console.log("tva ",tva)
        console.log("coefficient ",coefficient)
          let dimensions = donnees_json["dimensions-depose-murs"].murs;
          let gammes = donnees_json["gammes-produits-depose-murs"].murs;
          let etat_surfaces = donnees_json["etat-surfaces-depose-murs"].murs;
          let total=dimensions.length
          for(let i=0;i<total;i++){
            let surface=dimensions[i].surface
            /* let has_carrelage=(gammes[i].carrelage)?1:0;
            let has_papier=(gammes[i].papier)?1:0;
            let has_enduit=(gammes[i].enduit)?1:0;
            let has_peinture=(gammes[i].peinture)?1:0;
            let has_lambris=(gammes[i].lambris)?1:0;
            let has_tissus=(gammes[i].tissus)?1:0; */
            let gamme=gammes[i].gamme;

            if(gamme=="Peinture"){
              prix+=surface*this.tache_retirer_peinture.Prix
            }else if(gamme=="Enduit decoratif"){
              prix+=surface*this.tache_retirer_enduit.Prix
            }else if(gamme=="Papier peint"){
              prix+=surface*this.tache_retirer_papier.Prix
            }else if(gamme=="Carrelage mural"){
              prix+=surface*this.tache_retirer_carrelage.Prix
            }else if(gamme=="tissus"){
              prix+=surface*this.tache_retirer_tissus.Prix
            }else if(gamme=="lambris mural"){
              prix+=surface*this.tache_retirer_lambris.Prix
            }
            else if(gamme=="autre"){
              prix+=surface*20
            }
            
            
            
            
            
            
          }
            
          return prix
        }


     async get_prix_tache_15(donnees_json, devis_id, tvaValue) {
          let formule = ""; // Pour construire la formule explicative
          let prix = 0; // Prix total initialisé à 0
          let formule_marge='';
          let prix_marge = 0;

        const tva = 1+(tvaValue/100); // 20
          const coefficient = this.parametre_coef.Valeur; // 1.25
          console.log("tva ",tva)
          console.log("coefficient ",coefficient)

          const prix_mise_en_securite = this.tache_mise_en_securité.Prix;
          const prix_renovation_chauffage = this.tache_renovation_electrique_de_chauffage.Prix;
          const prix_renovation_electrique_complete = this.tache_renovation_electrique_complete.Prix;
          let surface = donnees_json["gammes-produits-renovation-electrique"].surface;
          let chauffage_exist = donnees_json["gammes-produits-renovation-electrique"].chauffage_exist;
          let quantite_chauffage = donnees_json["gammes-produits-renovation-electrique"].quantite_chauffage;
          let renovation_conforme = donnees_json["gammes-produits-renovation-electrique"].renovation_conforme;
          let mise_en_securite = donnees_json["gammes-produits-renovation-electrique"].mise_en_securite;
          
          if(chauffage_exist){
            let sousTotal = quantite_chauffage * prix_renovation_chauffage; // Calcul du sous-total pour cet appareil
            prix += sousTotal; // Ajoute le sous-total au prix total
            formule += `<u>Prix renovation de chauffage</u>\n ${quantite_chauffage} * prix unitaire de la tâche de rénovation de chauffage (${prix_renovation_chauffage} €) = ${sousTotal} €\n`;
          }
          let sousTotal_renovation_electrique_complete = surface * prix_renovation_electrique_complete; 
          prix += sousTotal_renovation_electrique_complete;
          formule += `<u>Prix rénovation</u>\n surface (${surface} m²) * prix unitaire de la tâche de rénovation électrique (${prix_renovation_electrique_complete} €) = ${sousTotal_renovation_electrique_complete} €\n`;

          if(mise_en_securite){
            let sousTotal = 1 * prix_mise_en_securite; // Calcul du sous-total pour cet appareil
            prix += sousTotal; // Ajoute le sous-total au prix total
            formule += `<u>Prix mise en sécurité</u>\n 1 * prix unitaire de la tâche de mise en sécurité (${prix_mise_en_securite} €) = ${sousTotal} €\n`;
          }

          const artisan_chauffage = donnees_json["gammes-produits-renovation-electrique"].artisan_chauffage
          const artisan_mise_aux_normes = donnees_json["gammes-produits-renovation-electrique"].artisan_mise_aux_normes
          const artisan_mise_en_securite = donnees_json["gammes-produits-renovation-electrique"].artisan_mise_en_securite

          if(artisan_chauffage){
            const prix_artisan_chauffage = parseFloat(artisan_chauffage.split(":")[2]);
            if(chauffage_exist){
              let sousTotal_marge = quantite_chauffage * prix_artisan_chauffage; // Calcul du sous-total pour cet appareil
              prix_marge += sousTotal_marge; // Ajoute le sous-total au prix total
              formule_marge += `<u>Prix renovation de chauffage</u>\n ${quantite_chauffage} * prix artisan de la tâche de rénovation de chauffage (${prix_renovation_chauffage} €) = ${sousTotal_marge} €\n`;
            }
          }

          if(artisan_mise_aux_normes){
            const prix_artisan_mise_aux_normes = parseFloat(artisan_mise_aux_normes.split(":")[2]);
            let sousTotal_marge = surface * prix_artisan_mise_aux_normes; 
            prix_marge += sousTotal_marge;
            formule_marge += `<u>Prix rénovation</u>\n surface (${surface} m²) * prix artisan de la tâche de rénovation électrique (${prix_renovation_electrique_complete} €) = ${sousTotal_marge} €\n`;

          }

          if(artisan_mise_en_securite){
            const prix_artisan_mise_en_securite = parseFloat(artisan_mise_en_securite.split(":")[2]);
            if(mise_en_securite){
              let sousTotal_marge = 1 * prix_artisan_mise_en_securite; // Calcul du sous-total pour cet appareil
              prix_marge += sousTotal_marge; // Ajoute le sous-total au prix total
              formule_marge += `<u>Prix mise en sécurité</u>\n 1 * prix artisan de la tâche de mise en sécurité (${prix_artisan_mise_en_securite} €) = ${sousTotal_marge} €\n`;
            }
          }


          
         
          

    

         
          // Multiplier le prix total par 1.25
          const resultatFinal = await this.appliquerRemisesEtTaxes({
            prix_base: prix,
            devis_id,
            coefficient,
            tva,
            formule
          });

      
          const resultatFinalMarge = await this.appliquerRemisesEtTaxes({
          prix_base: prix_marge,
          devis_id,
          coefficient,
          tva,
          formule:formule_marge,
        });

        
          // Retourner le prix total et la formule descriptive
          return {
            prix_ht: resultatFinal.total_apres_remise,
            prix: resultatFinal.total_ttc,
            formule: resultatFinal.formule,
            prix_marge: resultatFinalMarge.total_ttc,
            prix_marge_ht: resultatFinalMarge.total_ht,
            formule_marge: resultatFinalMarge.formule,
          };


        }
      
      

  


      async get_prix_tache_16(donnees_json, devis_id, tvaValue) {
        let formule = ""; // Stocke la formule explicative
        let prix = 0;
        let formule_marge='';
        let prix_marge = 0;
        const tva = 1+(tvaValue/100); // 20
        const coefficient = this.parametre_coef.Valeur; // 1.25
        console.log("tva ",tva)
        console.log("coefficient ",coefficient)
      
        // Données principales
        const appareils_pose = donnees_json["gammes-produits-pose-app-san"]["appareils_salle_de_bain"];
        const appareils_depose = donnees_json["dimensions-pose-app-san"]["gammes_depose_form"];
        // Prix fixe pour la dépose d'un appareil
        //const prixDepose = this.tache_depose_element_salle_de_bain.Prix; // À personnaliser selon vos besoins
    
        // Itération sur les appareils
        appareils_pose.forEach((appareil, index) => {
          if (appareil.active) {
              // Récupérer le prix du modèle (dernier élément après le dernier ':')
              let modeleParts = appareil.modele.split(":");
              let prixModele = parseFloat(modeleParts[2]); // Prix du modèle
                let titreAppareil = appareil.titre; // 
                let titreModele = (modeleParts[1]); // 
              prix += prixModele;
              formule += `<u>Prix de pose</u>\n  ${titreAppareil} (${titreModele}) : 1 * prix de pose (${prixModele} €) = ${prixModele} €\n`;
  

              if(appareil.artisan_pose && appareil.fournisseur_pose){
                let aParts = appareil.artisan_pose.split(":");
                let fParts = appareil.fournisseur_pose.split(":");
                let prixArtisan = parseFloat(aParts[2]);
                let prixFournisseur = parseFloat(fParts[2]);
                let prix_total = prixArtisan+prixFournisseur;
                prix_marge += prix_total;
                formule_marge += `<u>Prix ${titreAppareil} (${titreModele})</u>\n 1 * prix artisan (${prixArtisan} €) + prix fournisseur (${prixFournisseur} €) = ${prix_total} €\n`;
  

              }
              
          }
        });

        appareils_depose.forEach((appareil, index) => {
          let qte=appareil.quantite
          if (qte>0) {
              let titreModele = appareil.titre; // Prix du modèle
              let prixModele = appareil.prix *qte; // Prix du modèle
              prix += prixModele;
              formule += `<u>Prix de dépose</u>\n ${titreModele} : ${qte} * prix de dépose (${appareil.prix} €) = ${prixModele} €\n`;
          

               if(appareil.artisan_depose ){
                let aParts = appareil.artisan_depose.split(":");
                let prixdepose = parseFloat(aParts[2]);
                let prix_total = prixdepose*qte;
                prix_marge += prix_total;
                formule_marge += `<u>Prix depose ${titreModele}</u>\n 1 * prix artisan (${prixdepose} €) x quantité (${qte} ) = ${prix_total} €\n`;
  

              }
          
            }
                
            
        });


         const resultatFinalMarge = await this.appliquerRemisesEtTaxes({
          prix_base: prix_marge,
          devis_id,
          coefficient,
          tva,
          formule:formule_marge,
        });
          
        
      
        // Multiplier le prix total par 1.25
        const resultatFinal = await this.appliquerRemisesEtTaxes({
          prix_base: prix,
          devis_id,
          coefficient,
          tva,
          formule
        });

      
        // Retourner le prix total et la formule descriptive
        return {
          prix_ht: resultatFinal.total_apres_remise,
          prix: resultatFinal.total_ttc,
          formule: resultatFinal.formule,
          prix_marge: resultatFinalMarge.total_ttc,
          prix_marge_ht: resultatFinalMarge.total_ht,
          formule_marge: resultatFinalMarge.formule,
        };
      }

      
      async appliquerRemisesEtTaxes({
        prix_base,
        devis_id,
        coefficient,
        tva,
        formule
      }) {
        formule += `<u>Prix total </u>\n ${prix_base.toFixed(2)} €\n`;
        formule += `<u>Remises </u>\n`;

        const remises = await this.get_remise_by_devis(devis_id);

        let total_remise = 0;

        for (const remise of remises) {
          if (remise.Type === 'pourcentage' && remise.Pourcentage) {
            const montant = prix_base * (remise.Pourcentage / 100);
            total_remise += montant;

            formule += `Remise "${remise.Titre}" (${remise.Pourcentage} %) : -${montant.toFixed(2)} €\n`;
          }

          if (remise.Type === 'fixe' && remise.Valeur) {
            total_remise += remise.Valeur;

            formule += `Remise "${remise.Titre}" (${remise.Valeur} €) : -${remise.Valeur.toFixed(2)} €\n`;
          }
        }

        // Sécurité
        total_remise = Math.min(total_remise, prix_base);

        const total_apres_remise = prix_base - total_remise;

        formule += `<u>Prix après remises</u>\n ${prix_base.toFixed(2)} € - ${total_remise.toFixed(2)} € = ${total_apres_remise.toFixed(2)} €\n`;

        // Coefficient
        const total_ht = total_apres_remise * coefficient;
        formule += `<u>Prix HT </u>\n Prix (${total_apres_remise.toFixed(2)} €) * Facteur (${coefficient}) = ${total_ht.toFixed(2)} €\n`;

        // TVA
        const total_ttc = (total_ht * tva).toFixed(2);
        formule += `<u>Prix TTC </u>\n Prix HT (${total_ht.toFixed(2)} €) * TVA (${tva}) = ${total_ttc} €\n`;

        return {
          total_ht,
          total_ttc,
          formule,
          total_apres_remise
        };
      }

      




}
  
  module.exports = DevisCalculator;