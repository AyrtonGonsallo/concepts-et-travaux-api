const express = require('express');
const app = express();
const TacheGenerale=require('../TacheGenerale');
const Parametre=require('../Parametre')
const Remise = require('../Remise'); 
const { Json } = require('sequelize/lib/utils');

class DevisRecapitulator {


    constructor() {
      // Vous pouvez ajouter des propriétés initiales ici si nécessaire
      this.initTaches();
    }

    async init() {
      await this.initTaches();
      return this;
    }
  
    // Fonction pour calculer le prix en fonction de devispiece et index
    async calculer_prix(tacheid,donnees, devis_id,tvaValue) {
        let donnees_json=donnees["formulaire"]
        let titre=donnees["nomtache"]
        console.log("calcul du prix de la tache ",titre," d'id ",tacheid)
        
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
      console.log("calcul du prix de la tache ",titre," d'id ",idtache)
      
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

    async get_prix_tache_5(donnees_json, devis_id, tvaValue) {
      let formule = ""; // Stocke la formule explicative
      let prix = 0; // Prix total initialisé à 0
      let elements_recap = [];
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
          formule += `Pose du mur ${index + 1}\n Surface : ${surface} m²\n Revêtement : ${gammeTitre}\n`;  
          // Vérification de l'état de la surface pour inclure les coûts de dépose
          const etat = etatSurfaces[index].etat;
          const typedepose = mur.depose;
          const prixDepose = parseFloat(typedepose.split(':')[2]);
          const titreDepose = (typedepose.split(':')[1]);
          elements_recap.push({
                designation: `Pose de revêtements muraux - Mur ${index + 1}`,
                unite: 'm²',
                quantite: surface.toFixed(2),
                prix_unitaire: gammePrix.toFixed(2),
                total: sousTotalGamme.toFixed(2)
            });
          if(prixDepose<1){
            let prixEtat = parseFloat(etat.split('-')[2]);
            let sousTotalEtat = surface * prixEtat;
            let titreEtat = (etat.split('-')[1]);
            prix += sousTotalEtat;
            elements_recap.push({
                designation: `Pose de revêtements muraux - État du Mur ${index + 1} ${titreEtat}`,
                unite: 'm²',
                quantite: surface.toFixed(2),
                prix_unitaire: prixEtat.toFixed(2),
                total: sousTotalEtat.toFixed(2)
            });
          }else{
            let sousTotalDepose = surface * prixDepose;
            prix += sousTotalDepose;  
            elements_recap.push({
                designation: `Pose de revêtements muraux - Depose du Mur ${index + 1}`,
                unite: 'm²',
                quantite: surface.toFixed(2),
                prix_unitaire: prixDepose.toFixed(2),
                total: sousTotalDepose.toFixed(2)
            });          
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
        prix: resultatFinal.total_ttc, // Formatage du prix en 2 décimales
        formule: resultatFinal.formule,
        elements_recap:elements_recap,
        tva:resultatFinal.tva,
        coefficient:resultatFinal.coefficient,
      total_tva:resultatFinal.total_tva
      };
    }
  
    async get_prix_tache_2(donnees_json, devis_id, tvaValue) {
      let prix = 0;
      let formule = "";
      let elements_recap = [];
      const tva = 1+(tvaValue/100); // 20
      const coefficient = this.parametre_coef.Valeur; // 1.25
      console.log("tva ",tva)
      console.log("coefficient ",coefficient)
      // Extraire les données nécessaires
      const appareils_cuisine = donnees_json["gammes-produits-pose-elementcuisines"].appareils_cuisine;
      const gammes_depose_form = donnees_json["dimensions-pose-elementcuisines"].gammes_depose_form;
    
      // Prix des éléments a deposer
      gammes_depose_form.forEach(element => {
        let qte=(element.longueur<1)?element.quantite:1;
        let prixLocal = qte * element.prix;
        prix += prixLocal;
        if(qte){
          formule += `Dépose de ${element.titre}\n Quantité : ${qte}\n`;
          elements_recap.push({
              designation: `Pose de nouveaux équipements de cuisine - Dépose de ${element.titre}`,
              unite: 'ens',
              quantite: qte,
              prix_unitaire: element.prix.toFixed(2),
              total: prixLocal.toFixed(2)
            });
        }
      });
    
      // Calculer le prix pour " pose appareils_cuisine"
      
        appareils_cuisine.forEach(element => {
          if(element.active){
            let prixLocal = parseFloat(element.modele.split(':')[2]);
            let titre = (element.modele.split(':')[1]);
            prix += prixLocal;
            formule += `Pose de ${titre}\n Quantité : 1 \n`;
            elements_recap.push({
              designation: `Pose de nouveaux équipements de cuisine - Pose de ${titre}`,
              unite: 'ens',
              quantite: 1,
              prix_unitaire: prixLocal.toFixed(2),
              total: prixLocal.toFixed(2)
            });
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
        prix: resultatFinal.total_ttc, // Formatage du prix en 2 décimales
        formule: resultatFinal.formule,
        elements_recap:elements_recap,
        tva:resultatFinal.tva,
        coefficient:resultatFinal.coefficient,
        total_tva:resultatFinal.total_tva
      };
    }
      

       async get_prix_tache_3(donnees_json, devis_id, tvaValue) {
        let prix = 0;
        let formule = ""; // Initialisation de la chaîne de formule
        const tva = 1+(tvaValue/100); // 20
          const coefficient = this.parametre_coef.Valeur; // 1.25
          console.log("tva ",tva)
          console.log("coefficient ",coefficient)
        let elements_recap = [];
        let gammes = donnees_json["gammes-produits-murs-non-porteurs"];
        let mursnonporteurs = gammes.mursNonporteurs;
        let ouvertures = gammes.ouverturePartielle;
         let prix_linteau = this.tache_linteau.Prix;
        let has_partie_murs = gammes.tp1;
        let has_partie_ouvertures = gammes.tp3;
      
        
    
      
        // Calcul des murs non porteurs
        if (has_partie_murs) {
          let total_murs = mursnonporteurs.length;
          for (let i = 0; i < total_murs; i++) {
            let prix_unit_mur = parseFloat(mursnonporteurs[i].cloison.split(':')[2]);
           // let volume_mur = mursnonporteurs[i].longueur*mursnonporteurs[i].hauteur*mursnonporteurs[i].epaisseur/1000000;
           let surface_mur = mursnonporteurs[i].longueur*mursnonporteurs[i].hauteur/10000;
            let prix_final_mur =  (surface_mur * prix_unit_mur);
            prix += prix_final_mur;
            elements_recap.push({
                designation: `Démolition de cloisons ou ouverture partielle sur des murs non porteurs - Mur ${i+1}`,
                unite: 'm²',
                quantite: surface_mur.toFixed(2),
                prix_unitaire: prix_unit_mur.toFixed(2),
                total: prix_final_mur.toFixed(2)
            });
            formule += `Mur ${i+1} - surface : ${surface_mur} m²\n`;
          }
        }
      
        // Calcul des ouvertures partielles
        if (has_partie_ouvertures) {
          let total_ouvertures = ouvertures.length;
          for (let j = 0; j < total_ouvertures; j++) {
            let prix_unit_cloison = parseFloat(ouvertures[j].cloison.split(':')[2]);
            let surface_ouverture = ((ouvertures[j].longueur*ouvertures[j].hauteur)-(ouvertures[j].longueur_ouverture*ouvertures[j].hauteur_ouverture))/1000000;
            let prix_final_ouverture =  (surface_ouverture * prix_unit_cloison);
            let hdp=ouvertures[j].hauteur_depuis_le_plafond
            let louv=ouvertures[j].longueur_ouverture/100
            prix += prix_final_ouverture;
            elements_recap.push({
                designation: `Démolition de cloisons ou ouverture partielle sur des murs non porteurs - Ouverture ${j+1}`,
                unite: 'm²',
                quantite: surface_ouverture.toFixed(2),
                prix_unitaire: prix_unit_cloison.toFixed(2),
                total: prix_final_ouverture.toFixed(2)
            });
            formule += `Ouverture ${j+1} - surface de l'ouverture :${surface_ouverture} m² \n`;
            if(hdp>0){
              let prix_final_linteau =  (louv * prix_linteau);
              prix += prix_final_linteau;
              formule += `Prix du linteau sur l'ouverture ${j+1} (car la hauteur depuis le plafond est ${hdp} cm >0)\n`;

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
     
        // Retourner le prix total et la formule descriptive
        return {
          prix: resultatFinal.total_ttc, // Formatage du prix en 2 décimales
          formule: resultatFinal.formule,
          elements_recap:elements_recap,
          tva:resultatFinal.tva,
          coefficient:resultatFinal.coefficient,
      total_tva:resultatFinal.total_tva
        };
      }
      
      
        getTarif(id){
          return id
        }


         async get_prix_tache_4(donnees_json, devis_id, tvaValue) {
          let prix = 0;
          let formule = ""; // Initialisation de la chaîne de formule
          let elements_recap = [];
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
            let surface = murs[i].longueur*murs[i].hauteur/10000;
            let prix_unit_epaisseur = parseFloat(murs[i].epaisseur.split(":")[1]);
            let titre_epaisseur = (murs[i].epaisseur.split(":")[2]);
            let prix_final_mur = surface * prix_unit_epaisseur * 1;
            prix += prix_final_mur;
            formule += `Mur ${i+1} - surface : ${surface} m²\n`;
            elements_recap.push({
                designation: `Création de murs non porteurs - Mur ${i+1}`,
                unite: 'm²',
                quantite: surface.toFixed(2),
                prix_unitaire: prix_unit_epaisseur.toFixed(2),
                total: prix_final_mur.toFixed(2)
            });
          }

          if(has_portes){
            // Calcul du prix pour les portes
            let total_portes = portes.length;
            for (let j = 0; j < total_portes; j++) {
              let gamme_porte = portes[j].gamme;
              let prix_unit_porte = parseFloat(gamme_porte.split(":")[1]); // Le prix est en position 1 du split
              let prix_final_porte = 1 * prix_unit_porte * 1;
              prix += prix_final_porte;
              elements_recap.push({
                designation: `Création de murs non porteurs - Porte ${j+1}`,
                unite: 'ens',
                quantite: 1,
                prix_unitaire: prix_unit_porte.toFixed(2),
                total: prix_final_porte.toFixed(2)
            });
              
            }
            formule += `Nombre de portes : ${total_portes} \n`;
            total_portes
          }
          
            const resultatFinal = await this.appliquerRemisesEtTaxes({
              prix_base: prix,
              devis_id,
              coefficient,
              tva,
              formule
            });
        
          // Retourner le prix total et la formule descriptive
          return {
            prix: resultatFinal.total_ttc, // Formatage du prix en 2 décimales
            formule: resultatFinal.formule,
            elements_recap:elements_recap,
          tva:resultatFinal.tva,
          coefficient:resultatFinal.coefficient,
      total_tva:resultatFinal.total_tva
          };
        }
        


         async get_prix_tache_10(donnees_json, devis_id, tvaValue) {
          let prix = 0;
          let formule = ""; // Chaîne pour construire la formule
          let elements_recap = [];
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
            elements_recap.push({
                      designation: `Remplacement de portes - Porte nº${index+1}`,
                      unite: 'ens',
                      quantite: 1,
                      prix_unitaire: prix.toFixed(2),
                      total: prix.toFixed(2)
                  });
            // Ajouter les calculs à la formule
            formule += `Porte ${index+1} \n Gamme : ${titre_gamme} \n Nature : ${titre_nature_porte} \n Type : ${titre_type_porte}\n`;
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
            prix: resultatFinal.total_ttc, // Formatage du prix en 2 décimales
            formule: resultatFinal.formule,
            elements_recap:elements_recap,
          tva:resultatFinal.tva,
          coefficient:resultatFinal.coefficient,
      total_tva:resultatFinal.total_tva
          };
        }
        


        async get_prix_tache_11(donnees_json, devis_id, tvaValue) {
          let prix = 0;
          let formule = ""; // Chaîne pour documenter les calculs
          const prix_depose = this.tache_depose_element_plomberie.Prix; // Prix fixe pour la dépose (modifiable)
          const tva = 1+(tvaValue/100); // 20
          const coefficient = this.parametre_coef.Valeur; // 1.25
          console.log("tva ",tva)
          console.log("coefficient ",coefficient)
      
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
                  formule += `Ajout de l'appareil "${appareil.modele.split(":")[1]}"\n`;
      
                  // Ajouter le prix de dépose si applicable
                  if (appareil.depose) {
                      prix += prix_depose;
                      formule += `Dépose pour "${appareil.modele.split(":")[1]}"\n`;
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
          prix: resultatFinal.total_ttc, // Formatage du prix en 2 décimales
          formule: resultatFinal.formule,
          elements_recap:elements_recap,
          tva:resultatFinal.tva,
          coefficient:resultatFinal.coefficient,
      total_tva:resultatFinal.total_tva
        };
      }
      
        
      
         async get_prix_tache_12(donnees_json, devis_id, tvaValue) {
          let formule = ""; // Stocke la formule explicative
          let prix = 0;
          let elements_recap = [];
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
              formule += `Radiateur ${index + 1}: ${nomType} - ${nomGamme}\n`;
              elements_recap.push({
                designation: `Remplacement de radiateur - Radiateur ${index + 1} ${nomType} ${nomGamme}`,
                unite: 'ens',
                quantite: 1,
                prix_unitaire: prixGamme.toFixed(2),
                total: prixGamme.toFixed(2)
            });
            
          });
      
          // Multiplier le prix total par 1.25
          let total = (prix * 1.25).toFixed(2);
         formule += `Prix TTC : ${total} €\n`;
        
          // Retourner le prix total et la formule descriptive
          const resultatFinal = await this.appliquerRemisesEtTaxes({
          prix_base: prix,
          devis_id,
          coefficient,
          tva,
          formule
        });
      
        // Retourner le prix total et la formule descriptive
        return {
          prix: resultatFinal.total_ttc, // Formatage du prix en 2 décimales
          formule: resultatFinal.formule,
          elements_recap:elements_recap,
          tva:resultatFinal.tva,
          coefficient:resultatFinal.coefficient,
      total_tva:resultatFinal.total_tva
        };
      }
      
         async get_prix_tache_8(donnees_json, devis_id, tvaValue) {
          let formule = ""; // Stocke la formule explicative
          let prix = 0;
          let elements_recap = [];
          const tva = 1+(tvaValue/100); // 20
          const coefficient = this.parametre_coef.Valeur; // 1.25
          console.log("tva ",tva)
          console.log("coefficient ",coefficient)
      
          // Données principales
          const surface = donnees_json["dimensions-pose-plafond"].longueur * donnees_json["dimensions-pose-plafond"].largeur/10000;
          const id_prix_gamme = donnees_json["gammes-produits-pose-plafond"].gamme;
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
            formule += `Pas de revêtement à déposer.\n`;

            formule += `État de surface : "${titre_etat_surface}"\n`;
            elements_recap.push({
                designation: ` Pose de revêtement sur plafond - Préparation surface : ${titre_etat_surface}`,
                unite: 'm²',
                quantite: surface.toFixed(2),
                prix_unitaire: prix_etat_surface.toFixed(2),
                total: sousTotalEtat.toFixed(2)
            });
            
          }else{
            let sousTotalDeposeGamme = prix_depose * surface;
            prix += sousTotalDeposeGamme;
            formule += `Revêtement à déposer : "${titre_depose}"\n`;
            elements_recap.push({
                designation: `Pose de revêtement sur plafond - Dépose : ${titre_depose}`,
                unite: 'm²',
                quantite: surface.toFixed(2),
                prix_unitaire: prix_depose.toFixed(2),
                total: sousTotalDeposeGamme.toFixed(2)
            });
          }
          let sousTotalGamme = prix_gamme * surface;
          prix += sousTotalGamme;
          formule += `Gamme choisie "${nom_gamme}"\n`;
          elements_recap.push({
              designation: ` Pose de revêtement sur plafond - Fourniture & Pose : ${nom_gamme}`,
              unite: 'm²',
              quantite: surface.toFixed(2),
              prix_unitaire: prix_gamme.toFixed(2),
              total: sousTotalGamme.toFixed(2)
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
          prix: resultatFinal.total_ttc, // Formatage du prix en 2 décimales
          formule: resultatFinal.formule,
          elements_recap:elements_recap,
          tva:resultatFinal.tva,
          coefficient:resultatFinal.coefficient,
      total_tva:resultatFinal.total_tva
        };
      }
      
       async get_prix_tache_9(donnees_json, devis_id, tvaValue) {
        let formule = ""; // Stocke la formule explicative
        let prix = 0;
        let elements_recap = [];
        const tva = 1+(tvaValue/100); // 20
          const coefficient = this.parametre_coef.Valeur; // 1.25
          console.log("tva ",tva)
          console.log("coefficient ",coefficient)
        // Données principales
        const surface = donnees_json["dimensions-pose-sol"].longueur * donnees_json["dimensions-pose-sol"].largeur/10000;
        const prix_depose = parseFloat(donnees_json["dimensions-pose-sol"].depose.split(":")[2]);
        const nom_depose = (donnees_json["dimensions-pose-sol"].depose.split(":")[1]);
        const etat_surface = donnees_json["etat-surfaces-pose-sol"].etat;
        const gammes = donnees_json["gammes-produits-pose-sol"];
        const prix_etat_surface = parseFloat(etat_surface.split('-')[2]);
        const titre_etat_surface = (etat_surface.split('-')[1]);
        formule += `Surface : ${surface} m²\n`;
        formule += `État des surface : "${titre_etat_surface}"\n`;
        // Vérification des gammes
        if (gammes.gamme) {
            const gammeParts = gammes.gamme.split(":");
            const prixGamme = parseFloat(gammeParts[gammeParts.length - 1]); // Dernier élément
            const nomGamme = (gammeParts[1]); // Dernier élément
            const sousTotalGamme = prixGamme * surface;
            prix += sousTotalGamme;
            formule += `Gamme choisie : "${nomGamme}"\n`;
            elements_recap.push({
                designation: `Pose de revêtement de sol - Gamme choisie : "${nomGamme}"`,
                unite: 'm²',
                quantite: surface.toFixed(2),
                prix_unitaire: prixGamme.toFixed(2),
                total: sousTotalGamme.toFixed(2)
            });
        }

        if (prix_depose>0) {
          
          const sousTotaldepose = prix_depose * surface;
          prix += sousTotaldepose;
          formule += `Revêtement à déposer : "${nom_depose}"\n`;
          elements_recap.push({
                designation: `Pose de revêtement de sol - Revêtement à déposer : "${nom_depose}"`,
                unite: 'm²',
                quantite: surface.toFixed(2),
                prix_unitaire: prix_depose.toFixed(2),
                total: sousTotaldepose.toFixed(2)
            });
      }else{
        const sousTotalEtat = prix_etat_surface * surface;
        prix += sousTotalEtat;
        formule += `Pas de revêtements à déposer\n`;
        formule += `État de surface "${titre_etat_surface}"\n`;
        elements_recap.push({
                designation: `Pose de revêtement de sol - État de surface "${titre_etat_surface}"`,
                unite: 'm²',
                quantite: surface.toFixed(2),
                prix_unitaire: prix_etat_surface.toFixed(2),
                total: sousTotalEtat.toFixed(2)
            });
    
      }
    
        // Vérification des plinthes
        if (gammes.plinthes) {
            const plintheParts = gammes.plinthes.split(":");
            const prixPlinthes = parseFloat(plintheParts[plintheParts.length - 1]); // Dernier élément
            const nomPlinthes = (plintheParts[1]); // Dernier élément
            const sousTotalPlinthes = prixPlinthes * surface;
            prix += sousTotalPlinthes;
            formule += `Plinthes "${nomPlinthes}"\n`;
            elements_recap.push({
                designation: `Pose de revêtement de sol - Plinthes "${nomPlinthes}"`,
                unite: 'm²',
                quantite: surface.toFixed(2),
                prix_unitaire: prixPlinthes.toFixed(2),
                total: sousTotalPlinthes.toFixed(2)
            });
        }
    
       
    
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
          prix: resultatFinal.total_ttc, // Formatage du prix en 2 décimales
          formule: resultatFinal.formule,
          elements_recap:elements_recap,
          tva:resultatFinal.tva,
          coefficient:resultatFinal.coefficient,
      total_tva:resultatFinal.total_tva
        };
    }
    
   

        async get_prix_tache_13(donnees_json, devis_id, tvaValue) {
          let prix = 0;
          let formule = ""; // Pour construire la formule explicative
          
          const tva = 1+(tvaValue/100); // 20
          const coefficient = this.parametre_coef.Valeur; // 1.25
          console.log("tva ",tva)
          console.log("coefficient ",coefficient)
          let elements_recap = [];
          const appareils = donnees_json["gammes-produits-pose-electricite"].appareils_electrique_a_remplacer;
          const gamme = donnees_json["gammes-produits-pose-electricite"].gamme
          let prix_tache_creation = this.tache_creation_appareils_electrique.Prix;
          let prix_tache_remplacement = this.tache_remplacement_appareils_electrique.Prix;


          let nom_gamme =  (gamme.split("-")[2]);;
              let prix_gamme = JSON.parse(gamme.split("-")[1]);
              
              formule += `Gamme sélectionnée : ${nom_gamme}\n`;

          // Calcul pour chaque appareil électrique
          appareils.forEach((appareil, index) => {
            if (appareil.active) {
              let appareil_gamme = prix_gamme.find(a => a.nom.toLowerCase() === appareil.titre.toLowerCase());

              if (appareil.nombre_a_creer>0) {
                // création
                let nombre_a_creer = appareil.nombre_a_creer;
                let prix_creation = nombre_a_creer * appareil_gamme.prix * prix_tache_creation;
                prix += prix_creation;
                formule += `${appareil.titre} - nombre à créer : ${nombre_a_creer}\n`;
                elements_recap.push({
                      designation: ` Rénovation électrique partielle - création de ${appareil.titre}`,
                      unite: 'ens',
                      quantite: nombre_a_creer,
                      prix_unitaire: (appareil_gamme.prix*prix_tache_creation).toFixed(2),
                      total: prix_creation.toFixed(2)
                  });
              }
              if (appareil.nombre_a_remplacer>0) {
                // remplacement
                let nombre_a_remplacer = appareil.nombre_a_remplacer;
                let prix_remplacement = nombre_a_remplacer * appareil_gamme.prix * prix_tache_remplacement;
                prix += prix_remplacement;
                formule += `${appareil.titre} - nombre à remplacer : ${nombre_a_remplacer}\n`;
                elements_recap.push({
                      designation: ` Rénovation électrique partielle - remplacement de ${appareil.titre}`,
                      unite: 'ens',
                      quantite: nombre_a_remplacer,
                      prix_unitaire: (appareil_gamme.prix*prix_tache_remplacement).toFixed(2),
                      total: prix_remplacement.toFixed(2)
                  });
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
            prix: resultatFinal.total_ttc, // Formatage du prix en 2 décimales
            formule: resultatFinal.formule,
            elements_recap:elements_recap,
          tva:resultatFinal.tva,
          coefficient:resultatFinal.coefficient,
      total_tva:resultatFinal.total_tva
          };
        }
        


        get_prix_tache_14(donnees_json, devis_id, tvaValue) {
          
          let prix=0
          let dimensions = donnees_json["dimensions-depose-murs"].murs;
          let gammes = donnees_json["gammes-produits-depose-murs"].murs;
          let etat_surfaces = donnees_json["etat-surfaces-depose-murs"].murs;
          let total=dimensions.length
          const tva = 1+(tvaValue/100); // 20
          const coefficient = this.parametre_coef.Valeur; // 1.25
          console.log("tva ",tva)
          console.log("coefficient ",coefficient)
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
          let elements_recap = [];
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
          
          formule += `Surface : ${surface} m²\n`;
          if(chauffage_exist){
            let sousTotal = quantite_chauffage * prix_renovation_chauffage; // Calcul du sous-total pour cet appareil
            prix += sousTotal; // Ajoute le sous-total au prix total
            formule += `Rénovation de chauffage : ${quantite_chauffage}\n`;
            elements_recap.push({
              designation: `Rénovation électrique complète - Rénovation de chauffage`,
              unite: 'ens',
              quantite: quantite_chauffage,
              prix_unitaire: prix_renovation_chauffage.toFixed(2),
              total: sousTotal.toFixed(2)
            });
          }else{
            formule += `Rénovation de chauffage : Non\n`;
          }
          let sousTotal_renovation_electrique_complete = surface * prix_renovation_electrique_complete; 
          prix += sousTotal_renovation_electrique_complete;
          elements_recap.push({
              designation: `Rénovation électrique complète`,
              unite: 'm²',
              quantite: surface,
              prix_unitaire: prix_renovation_electrique_complete.toFixed(2),
              total: sousTotal_renovation_electrique_complete.toFixed(2)
            });

          if(mise_en_securite){
            let sousTotal = 1 * prix_mise_en_securite; // Calcul du sous-total pour cet appareil
            prix += sousTotal; // Ajoute le sous-total au prix total
            formule += `Mise en sécurité : Oui\n`;
            elements_recap.push({
              designation: `Rénovation électrique complète - Mise en sécurité`,
              unite: 'ens',
              quantite: 1,
              prix_unitaire: prix_mise_en_securite.toFixed(2),
              total: sousTotal.toFixed(2)
            });
          }else{
            formule += `Mise en sécurité : Non\n`;
          }
          

         
          const resultatFinal = await this.appliquerRemisesEtTaxes({
              prix_base: prix,
              devis_id,
              coefficient,
              tva,
              formule
            });
        
          // Retourner le prix total et la formule descriptive
          return {
            prix: resultatFinal.total_ttc, // Formatage du prix en 2 décimales
            formule: resultatFinal.formule,
            elements_recap:elements_recap,
          tva:resultatFinal.tva,
          coefficient:resultatFinal.coefficient,
      total_tva:resultatFinal.total_tva
          };
        }
      
      

  


         async get_prix_tache_16(donnees_json, devis_id, tvaValue) {
          let formule = ""; // Stocke la formule explicative
          let prix = 0;
          let elements_recap = [];
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
                  let titreModele = (modeleParts[1]); // Prix du modèle
                  prix += prixModele;
                  formule += `Pose de ${titreModele} : 1 \n`;
                  elements_recap.push({
                      designation: ` Installation de nouveaux équipements sanitaires - Pose de "${titreModele}"`,
                      unite: 'ens',
                      quantite: 1,
                      prix_unitaire: prixModele.toFixed(2),
                      total: prixModele.toFixed(2)
                  });
                 
              }
          });

          appareils_depose.forEach((appareil, index) => {
            let qte=appareil.quantite
            if (qte>0) {
                // Récupérer le prix du modèle (dernier élément après le dernier ':')
                let titreModele = appareil.titre; // Prix du modèle
                let prixModele = appareil.prix *qte; // Prix du modèle
                prix += prixModele;
                formule += `Dépose de ${titreModele} : ${qte} \n`;
                elements_recap.push({
                      designation: ` Installation de nouveaux équipements sanitaires - Depose de "${titreModele}"`,
                      unite: 'ens',
                      quantite: qte,
                      prix_unitaire: appareil.prix.toFixed(2),
                      total: prixModele.toFixed(2)
                  });
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
          prix: resultatFinal.total_ttc, // Formatage du prix en 2 décimales
          formule: resultatFinal.formule,
          elements_recap:elements_recap,
          tva:resultatFinal.tva,
          coefficient:resultatFinal.coefficient,
      total_tva:resultatFinal.total_tva
        };
      }
      

      async appliquerRemisesEtTaxes({
        prix_base,
        devis_id,
        coefficient,
        tva,
        formule
      }) {
        
        //formule += `<u>Prix total </u>\n ${prix_base.toFixed(2)} €\n`;
        //formule += `<u>Remises </u>\n`;

        const remises = await this.get_remise_by_devis(devis_id);

        let total_remise = 0;

        for (const remise of remises) {
          if (remise.Type === 'pourcentage' && remise.Pourcentage) {
            const montant = prix_base * (remise.Pourcentage / 100);
            total_remise += montant;

            //formule += `Remise "${remise.Titre}" (${remise.Pourcentage} %) : -${montant.toFixed(2)} €\n`;
          }

          if (remise.Type === 'fixe' && remise.Valeur) {
            total_remise += remise.Valeur;

            //formule += `Remise "${remise.Titre}" (${remise.Valeur} €) : -${remise.Valeur.toFixed(2)} €\n`;
          }
        }

        // Sécurité
        total_remise = Math.min(total_remise, prix_base);

        const total_apres_remise = prix_base - total_remise;

        //formule += `<u>Prix après remises</u>\n ${prix_base.toFixed(2)} € - ${total_remise.toFixed(2)} € = ${total_apres_remise.toFixed(2)} €\n`;

        // Coefficient
        const total_ht = total_apres_remise * coefficient;
        //formule += `<u>Prix HT </u>\n Prix (${total_apres_remise.toFixed(2)} €) * Facteur (${coefficient}) = ${total_ht.toFixed(2)} €\n`;

        let percent_tva = tva-1
        let total_tva = percent_tva * total_ht

        // TVA
        const total_ttc = (total_ht * tva).toFixed(2);
        //formule += `<u>Prix TTC </u>\n Prix HT (${total_ht.toFixed(2)} €) * TVA (${tva}) = ${total_ttc} €\n`;

        return {
          total_ht,
          total_ttc,
          formule,
          total_apres_remise,
          tva,
          total_tva,
          coefficient,
        };
      }


}
  
  module.exports = DevisRecapitulator;