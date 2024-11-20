const express = require('express');
const app = express();
const TacheGenerale=require('../TacheGenerale')

class DevisCalculator {


    constructor() {
      // Vous pouvez ajouter des propriétés initiales ici si nécessaire
      this.initTaches();
    }
  
    // Fonction pour calculer le prix en fonction de devispiece et index
    calculer_prix(tacheid,donnees) {
        let donnees_json=donnees["formulaire"]
        let titre=donnees["nomtache"]
        console.log("calcul du prix de la tache ",titre," d'id ",tacheid)
        
        let prix=0
        switch (tacheid) {
            case 2:
                prix = this.get_prix_tache_2(donnees_json);
                break;
            case 3:
                prix = this.get_prix_tache_3(donnees_json);
                break;
            case 4:
                prix = this.get_prix_tache_4(donnees_json);
                break;
            case 5:
                prix = this.get_prix_tache_5(donnees_json);
                break;
            case 10:
                prix = this.get_prix_tache_10(donnees_json);
                break;
            case 12:
                prix = this.get_prix_tache_12(donnees_json);
                break;
            case 9:
                prix = this.get_prix_tache_9(donnees_json);
                break;
            case 8:
                prix = this.get_prix_tache_8(donnees_json);
                break;
            case 13:
                prix = this.get_prix_tache_13(donnees_json);
                break;
            case 14:
                prix = this.get_prix_tache_14(donnees_json);
                break;
            case 15:
                prix = this.get_prix_tache_15(donnees_json);
                break;
            case 16:
                prix = this.get_prix_tache_16(donnees_json);
                break;                
            default:
                throw new Error(`Tâche inconnue avec l'ID ${tacheid}`);
        }
        
        return prix
    }

    calculer_prix_tache(tache) {
      let donnees_json=tache["formulaire"]
      let titre=tache["nomtache"]
      let idtache=tache["idtache"]
      console.log("calcul du prix de la tache ",titre," d'id ",idtache)
      
      let prix=0
      switch (idtache) {
          case 2:
              prix = this.get_prix_tache_2(donnees_json);
              break;
          case 3:
              prix = this.get_prix_tache_3(donnees_json);
              break;
          case 4:
              prix = this.get_prix_tache_4(donnees_json);
              break;
          case 5:
              prix = this.get_prix_tache_5(donnees_json);
              break;
          case 10:
              prix = this.get_prix_tache_10(donnees_json);
              break;
          case 12:
              prix = this.get_prix_tache_12(donnees_json);
              break;
          case 9:
              prix = this.get_prix_tache_9(donnees_json);
              break;
          case 8:
              prix = this.get_prix_tache_8(donnees_json);
              break;
          case 13:
              prix = this.get_prix_tache_13(donnees_json);
              break;
          case 14:
              prix = this.get_prix_tache_14(donnees_json);
              break;
          case 15:
              prix = this.get_prix_tache_15(donnees_json);
              break;
          case 16:
              prix = this.get_prix_tache_16(donnees_json);
              break;
          default:
              throw new Error(`Tâche inconnue avec l'ID ${idtache}`);
      }
      
      return prix
  }
    async initTaches() {
        try {
            const taches = await Promise.all([
                this.get_tache_generale(2),
                this.get_tache_generale(4),
                this.get_tache_generale(1),
                this.get_tache_generale(3),
                this.get_tache_generale(6),
                this.get_tache_generale(5),
                this.get_tache_generale(7),
                this.get_tache_generale(8),
                this.get_tache_generale(9),
                this.get_tache_generale(10),
                this.get_tache_generale(11),
                this.get_tache_generale(12),
                this.get_tache_generale(13),
                this.get_tache_generale(14),
                this.get_tache_generale(15),
                this.get_tache_generale(16),
                this.get_tache_generale(17),
                this.get_tache_generale(18),
                this.get_tache_generale(19),
                this.get_tache_generale(20),
                this.get_tache_generale(21),
                this.get_tache_generale(22),
                this.get_tache_generale(23)
            ]);

            this.tache_retirer_carrelage = taches[0];
            this.tache_retirer_papier = taches[1];
            this.tache_retirer_peinture = taches[2];
            this.tache_retirer_enduit = taches[3];
            this.tache_retirer_lambris = taches[4];
            this.tache_retirer_tissus = taches[5];
            this.tache_depose_revet_muraux = taches[6];
            this.tache_demolition_porte_simple_creuse = taches[7];
            this.tache_demolition_porte_double_creuse = taches[8];
            this.tache_demolition_porte_simple_pleine = taches[9];
            this.tache_demolition_porte_double_pleine = taches[10];
            this.tache_creation_de_porte = taches[11];
            this.tache_remplacement_de_porte = taches[12];
            this.tache_passage_fils_electrique = taches[13];
            this.tache_remplacement_prise = taches[14];
            this.tache_remplacement_eclairage_profond = taches[15];
            this.tache_remplacement_eclairage_applique = taches[16];
            this.tache_remplacement_convecteur_electrique = taches[17];
            this.tache_remplacement_radiateur = taches[18];
            this.tache_deplacement_radiateur = taches[19];
            this.tache_depose_element_salle_de_bain = taches[20];
            this.tache_depose_element_haut_cuisine = taches[21];
            this.tache_depose_element_bas_cuisine = taches[22];
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
    get_prix_tache_5(donnees_json) {
      let formule = ""; // Stocke la formule explicative
      let prix = 0; // Prix total initialisé à 0
  
      const murs = donnees_json["dimensions-pose-murs"].murs;
      const etatSurfaces = donnees_json["etat-surfaces-pose-murs"].murs;
      const gammesProduits = donnees_json["gammes-produits-pose-murs"].murs;
  
      murs.forEach((mur, index) => {
          let surface = mur.surface;
  
          // Récupération du prix de la gamme pour ce mur
          const gammePrix = parseFloat(gammesProduits[index].gamme.split(':').pop());
          let sousTotalGamme = surface * gammePrix;
          prix += sousTotalGamme;
          formule += `Mur ${index + 1}: ${surface} * ${gammePrix} (prix de la gamme) = ${sousTotalGamme}\n`;
  
          // Vérification de l'état de la surface pour inclure les coûts de dépose
          const etat = etatSurfaces[index].etat;
          const typedepose = etatSurfaces[index].typedepose;
  
          if (etat === "depose" && typedepose) {
              const prixDepose = parseFloat(typedepose.split(':').pop());
              let sousTotalDepose = surface * prixDepose;
              prix += sousTotalDepose;
              formule += `Mur ${index + 1} (dépose): ${surface} * ${prixDepose} (prix de la dépose) = ${sousTotalDepose}\n`;
          }
      });
  
      // Application du facteur de 1.25
      prix *= 1.25;
      formule += `Facteur global (1.25): prix total * 1.25 = ${prix}\n`;
  
      return { prix, formule };
    }
  
    get_prix_tache_2(donnees_json) {
      let prix = 0;
      let formule = "";
    
      // Extraire les données nécessaires
      const dimensions = donnees_json["dimensions-depose-elementcuisines"];
      const gammesProduits = donnees_json["gammes-produits-depose-elementcuisines"].gammes;
    
      // Prix des éléments haut et bas
      const prixElementCuisine = {
        haut: this.tache_depose_element_haut_cuisine.Prix, // Remplacez par le prix réel pour "elementcuisines_haut"
        bas: this.tache_depose_element_bas_cuisine.Prix  // Remplacez par le prix réel pour "elementcuisines_bas"
      };
    
      // Calculer le prix pour "elementcuisines_haut"
      if (dimensions.elementcuisines_haut && dimensions.is_active_Ech) {
        dimensions.elementcuisines_haut.forEach(element => {
          const prixLocal = element.quantite * prixElementCuisine.haut;
          prix += prixLocal;
          formule += `(${element.quantite} * ${prixElementCuisine.haut}) + `;
        });
      }
    
      // Calculer le prix pour "elementcuisines_bas"
      if (dimensions.elementcuisines_bas && dimensions.is_active_Ecb) {
        dimensions.elementcuisines_bas.forEach(element => {
          const prixLocal = element.quantite * prixElementCuisine.bas;
          prix += prixLocal;
          formule += `(${element.quantite} * ${prixElementCuisine.bas}) + `;
        });
      }
    
      // Calculer le prix pour "gammes-produits-depose-elementcuisines"
      gammesProduits.forEach(gamme => {
        if (gamme.active) {
          const prixLocal = gamme.quantite * gamme.prix;
          prix += prixLocal;
          formule += `(${gamme.quantite} * ${gamme.prix}) + `;
        }
      });
    
      // Multiplier le prix total par 1.25
      prix *= 1.25;
      formule = formule.slice(0, -3); // Retirer le dernier "+ " de la formule
      formule = `(${formule}) * 1.25`;
    
      // Retourner le prix total et la formule descriptive
      return {
        prix: prix.toFixed(2), // Formatage du prix en 2 décimales
        formule: formule
      };
    }
      

       get_prix_tache_3(donnees_json) {
        let prix = 0;
        let formule = ""; // Initialisation de la chaîne de formule
      
        let dimensions = donnees_json["dimensions-murs-non-porteurs"];
        let mursnonporteurs = dimensions.mursNonporteurs;
        let ouvertures = dimensions.ouverturePartielle;
        let quantite_psc = dimensions.quantite_portes_simples_creuse;
        let quantite_pdc = dimensions.quantite_portes_doubles_creuses;
        let quantite_psp = dimensions.quantite_porte_simple_plein;
        let quantite_pdp = dimensions.quantite_porte_double_pleine;
        let has_partie_murs = dimensions.tp1;
        let has_partie_demolition_portes = dimensions.tp2;
        let has_partie_ouvertures = dimensions.tp3;
      
        let gammes = donnees_json["gammes-produits-murs-non-porteurs"];
        let gammes_murs = gammes.mursnonporteurs;
        let gammes_ouvertures = gammes.ouverturepartielles;
      
        // Calcul des murs non porteurs
        if (has_partie_murs) {
          let total_murs = mursnonporteurs.length;
          for (let i = 0; i < total_murs; i++) {
            let prix_unit_mur = parseFloat(gammes_murs[i].materiaux.split(':')[0]);
            let volume_mur = mursnonporteurs[i].volume;
            let prix_final_mur = 1.25 * (volume_mur * prix_unit_mur);
            prix += prix_final_mur;
      
            formule += `1.25 * (${volume_mur} * ${prix_unit_mur}) = ${prix_final_mur}\n`;
          }
        }
      
        // Calcul de la démolition des portes
        if (has_partie_demolition_portes) {
          let prix_dem_psc = 1.25 * (quantite_psc * this.tache_demolition_porte_simple_creuse.Prix);
          let prix_dem_psp = 1.25 * (quantite_psp * this.tache_demolition_porte_simple_pleine.Prix);
          let prix_dem_pdc = 1.25 * (quantite_pdc * this.tache_demolition_porte_double_creuse.Prix);
          let prix_dem_pdp = 1.25 * (quantite_pdp * this.tache_demolition_porte_double_pleine.Prix);
      
          prix += prix_dem_psc;
          prix += prix_dem_psp;
          prix += prix_dem_pdc;
          prix += prix_dem_pdp;
      
          formule += `1.25 * (${quantite_psc} * PrixPSC) = ${prix_dem_psc}\n`;
          formule += `1.25 * (${quantite_psp} * PrixPSP) = ${prix_dem_psp}\n`;
          formule += `1.25 * (${quantite_pdc} * PrixPDC) = ${prix_dem_pdc}\n`;
          formule += `1.25 * (${quantite_pdp} * PrixPDP) = ${prix_dem_pdp}\n`;
        }
      
        // Calcul des ouvertures partielles
        if (has_partie_ouvertures) {
          let total_ouvertures = ouvertures.length;
          for (let j = 0; j < total_ouvertures; j++) {
            let prix_unit_cloison = parseFloat(gammes_ouvertures[j].cloison.split(':')[0]);
            let volume_ouverture = ouvertures[j].volume;
            let prix_final_ouverture = 1.25 * (volume_ouverture * prix_unit_cloison);
            prix += prix_final_ouverture;
      
            formule += `1.25 * (${volume_ouverture} * ${prix_unit_cloison}) = ${prix_final_ouverture}\n`;
          }
        }
      
        // Retourner le prix total et les formules
        return {
          prix: prix,
          formule: formule
        };
      }
      
      
        getTarif(id){
          return id
        }


         get_prix_tache_4(donnees_json) {
          let prix = 0;
          let formule = ""; // Initialisation de la chaîne de formule
        
          let murs = donnees_json["dimensions-creation-murs-non-porteurs--murs"].murs_non_porteurs;
          let types_cloison = donnees_json["etat-surfaces-creation-murs-non-porteurs--murs"].murs_non_porteurs;
          let portes = donnees_json["gammes-produits-creation-murs-non-porteurs--portes"].portes;
        
          // Calcul du prix pour les murs non porteurs
          let total_murs = murs.length;
          for (let i = 0; i < total_murs; i++) {
            let surface = murs[i].surface;
            let type_cloison = types_cloison[i].type_cloison;
            let prix_unit_cloison = parseFloat(type_cloison.split(":")[1]); // Le prix est en position 1 du split
            let prix_final_mur = surface * prix_unit_cloison * 1.25;
            prix += prix_final_mur;
        
            formule += `${surface} * ${prix_unit_cloison} = ${prix_final_mur}\n`;
          }
        
          // Calcul du prix pour les portes
          let total_portes = portes.length;
          for (let j = 0; j < total_portes; j++) {
            let type_porte = portes[j].type;
            let prix_unit_porte = parseFloat(type_porte.split(":")[1]); // Le prix est en position 1 du split
            let prix_final_porte = 1 * prix_unit_porte * 1.25;
            prix += prix_final_porte;
        
            formule += `1 * ${prix_unit_porte} = ${prix_final_porte}\n`;
          }
        
          // Retourner le prix total et les formules
          return {
            prix: prix,
            formule: formule
          };
        }
        


         get_prix_tache_10(donnees_json) {
          let prix = 0;
          let formule = ""; // Chaîne pour construire la formule
        
          const portes = donnees_json["gammes-produits-pose-portes"].portes;
        
          // Parcourir chaque porte
          portes.forEach((porte, index) => {
            if (porte.creation_ou_remplacement === "remplacement") {
              prix += 1.25 * this.tache_remplacement_de_porte.Prix;
              formule += `1.25 * ${this.tache_remplacement_de_porte.Prix} (remplacement de porte)\n`;
            } else {
              prix += 1.25 * this.tache_creation_de_porte.Prix;
              formule += `1.25 * ${this.tache_creation_de_porte.Prix} (création de porte)\n`;
            }
        
            let prix_type = 1.25 * parseFloat(porte.type.split(":")[1]);
            let prix_type3 = 1.25 * parseFloat(porte.type3.split(":")[1]);
            let prix_type2 = 1.25 * parseFloat(porte.type2.split(":")[1]);
            let prix_finition = 1.25 * parseFloat(porte.finition.split(":")[1]);
        
            prix += prix_type + prix_type3 + prix_type2 + prix_finition;
        
            // Ajouter les calculs à la formule
            formule += `1.25 * ${porte.type.split(":")[1]} = ${prix_type}\n`;
            formule += `1.25 * ${porte.type3.split(":")[1]} = ${prix_type3}\n`;
            formule += `1.25 * ${porte.type2.split(":")[1]} = ${prix_type2}\n`;
            formule += `1.25 * ${porte.finition.split(":")[1]} = ${prix_finition}\n`;
          });
        
          return { prix, formule };
        }
        
      
         get_prix_tache_12(donnees_json) {
          let formule = ""; // Stocke la formule explicative
          let prix = 0;
      
          // Données principales
          const surface = donnees_json["dimensions-pose-chauffage"].surface;
          const radiateursEtat = donnees_json["etat-surfaces-pose-chauffage"].radiateurs;
          const radiateursGammes = donnees_json["gammes-produits-pose-chauffage"].radiateurs;
      
          // Variables pour les prix des états spécifiques
          const prixRemplacement = this.tache_remplacement_radiateur.Prix; // Prix par radiateur à remplacer (modifiable)
          const prixDeplacement = this.tache_deplacement_radiateur.Prix;  // Prix par radiateur à déplacer (modifiable)
      
          // Itération sur chaque radiateur
          radiateursEtat.forEach((radiateur, index) => {
              const etat = radiateur.etat;
              const gamme = radiateursGammes[index];
      
              if (etat === "radiateur à poser" && gamme.visible && gamme.gamme) {
                  // Si le radiateur est à poser et que la gamme est visible
                  const gammeParts = gamme.gamme.split(":");
                  const prixGamme = parseFloat(gammeParts[1]); // Prix de la gamme
                  prix += prixGamme;
                  formule += `Radiateur ${index + 1} à poser: Prix gamme (${prixGamme}) = ${prixGamme}\n`;
              } else if (etat === "radiateur à remplacer") {
                  // Si le radiateur est à remplacer
                  prix += prixRemplacement;
                  formule += `Radiateur ${index + 1} à remplacer: Prix fixe (${prixRemplacement}) = ${prixRemplacement}\n`;
              } else if (etat === "radiateur à déplacer") {
                  // Si le radiateur est à déplacer
                  prix += prixDeplacement;
                  formule += `Radiateur ${index + 1} à déplacer: Prix fixe (${prixDeplacement}) = ${prixDeplacement}\n`;
              }
          });
      
          // Application d'un facteur global (1.25)
          prix *= 1.25;
          formule += `Facteur global (1.25): prix total * 1.25 = ${prix}\n`;
      
          return { prix, formule };
      }
      
         get_prix_tache_8(donnees_json) {
          let formule = ""; // Stocke la formule explicative
          let prix = 0;
      
          // Données principales
          const surface = donnees_json["dimensions-pose-plafond"].surface;
          const id_prix_gamme = donnees_json["gammes-produits-pose-plafond"].gamme;
          const etat_surface = donnees_json["etat-surfaces-pose-plafond"].etat;
      
          // Calcul du prix de la gamme
          const gammeParts = id_prix_gamme.split(':'); // Sépare la chaîne en parties
          const prix_gamme = parseFloat(gammeParts[gammeParts.length - 1]); // Dernier élément
          let sousTotalGamme = prix_gamme * surface;
          prix += sousTotalGamme;
          formule += `Surface (${surface}) * Prix de la gamme (${prix_gamme}) = ${sousTotalGamme}\n`;
      
          
      
          // Application d'un facteur global (1.25)
          prix *= 1.25;
          formule += `Facteur global (1.25): prix total * 1.25 = ${prix}\n`;
      
          return { prix, formule };
      }
      
       get_prix_tache_9(donnees_json) {
        let formule = ""; // Stocke la formule explicative
        let prix = 0;
    
        // Données principales
        const surface = donnees_json["dimensions-pose-sol"].surface;
        const etat_surface = donnees_json["etat-surfaces-pose-sol"].etat;
        const gammes = donnees_json["gammes-produits-pose-sol"];
    
        // Vérification des gammes
        if (gammes.gamme) {
            const gammeParts = gammes.gamme.split(":");
            const prixGamme = parseFloat(gammeParts[gammeParts.length - 1]); // Dernier élément
            const sousTotalGamme = prixGamme * surface;
            prix += sousTotalGamme;
            formule += `Surface (${surface}) * Prix de la gamme principale (${prixGamme}) = ${sousTotalGamme}\n`;
        }
    
        // Vérification des plinthes
        if (gammes.plinthes) {
            const plintheParts = gammes.plinthes.split(":");
            const prixPlinthes = parseFloat(plintheParts[plintheParts.length - 1]); // Dernier élément
            const sousTotalPlinthes = prixPlinthes * surface;
            prix += sousTotalPlinthes;
            formule += `Surface (${surface}) * Prix des plinthes (${prixPlinthes}) = ${sousTotalPlinthes}\n`;
        }
    
        // Vérification des sols spécifiques
        if (gammes.sol_pvc) {
            const sousTotalPvc = gammes.sol_pvc_prix * surface;
            prix += sousTotalPvc;
            formule += `Surface (${surface}) * Prix sol PVC (${gammes.sol_pvc_prix}) = ${sousTotalPvc}\n`;
        }
    
        if (gammes.moquette) {
            const sousTotalMoquette = gammes.moquette_prix * surface;
            prix += sousTotalMoquette;
            formule += `Surface (${surface}) * Prix moquette (${gammes.moquette_prix}) = ${sousTotalMoquette}\n`;
        }
    
        // Application d'un facteur global (1.25)
        prix *= 1.25;
        formule += `Facteur global (1.25): prix total * 1.25 = ${prix}\n`;
    
        return { prix, formule };
    }
    
        

         get_prix_tache_13(donnees_json) {
          let prix = 0;
          let formule = ""; // Pour construire la formule explicative
        
          const appareils = donnees_json["gammes-produits-pose-electricite"].appareils_electrique;
        
          // Calcul pour chaque appareil électrique
          appareils.forEach((appareil, index) => {
            if (appareil.active) {
              // Extraire le prix d'achat à partir de la chaîne "modele"
              let prix_achat = parseFloat(appareil.modele.split(":")[2]);
              let nombre = appareil.nombre;
              let prix_appareil = nombre * prix_achat;
        
              prix += prix_appareil;
              formule += `${nombre} * ${prix_achat} = ${prix_appareil} (Appareil ${index + 1})\n`;
            }
          });
        
          // Quantités pour les équipements électriques
          let qte_prises = donnees_json["gammes-produits-pose-electricite"].qte_prises;
          let qte_eclairage_profond = donnees_json["gammes-produits-pose-electricite"].qte_eclairage_profond;
          let qte_eclairage_applique = donnees_json["gammes-produits-pose-electricite"].qte_eclairage_applique;
          let qte_convecteur_electrique = donnees_json["gammes-produits-pose-electricite"].qte_convecteur_electrique;
        
          // Calcul des coûts pour chaque tâche de remplacement, multiplié par les quantités
          let prix_rem_conv_ele = qte_convecteur_electrique * this.tache_remplacement_convecteur_electrique.Prix;
          let prix_rem_ecl_app = qte_eclairage_applique * this.tache_remplacement_eclairage_applique.Prix;
          let prix_rem_ecl_prof = qte_eclairage_profond * this.tache_remplacement_eclairage_profond.Prix;
          let prix_rem_prise = qte_prises * this.tache_remplacement_prise.Prix;
          let prix_passage_fils = 1 * this.tache_passage_fils_electrique.Prix; // Multiplié par 1 pour le passage de fils
        
          prix += prix_rem_conv_ele + prix_rem_ecl_app + prix_rem_ecl_prof + prix_rem_prise + prix_passage_fils;
          formule += `${qte_convecteur_electrique} * ${this.tache_remplacement_convecteur_electrique.Prix} = ${prix_rem_conv_ele} (Remplacement convecteur électrique)\n`;
          formule += `${qte_eclairage_applique} * ${this.tache_remplacement_eclairage_applique.Prix} = ${prix_rem_ecl_app} (Remplacement éclairage appliqué)\n`;
          formule += `${qte_eclairage_profond} * ${this.tache_remplacement_eclairage_profond.Prix} = ${prix_rem_ecl_prof} (Remplacement éclairage profond)\n`;
          formule += `${qte_prises} * ${this.tache_remplacement_prise.Prix} = ${prix_rem_prise} (Remplacement prise)\n`;
          formule += `1 * ${this.tache_passage_fils_electrique.Prix} = ${prix_passage_fils} (Passage de fils électrique)\n`;
        
          // Multiplier le prix total par 1.25
          prix *= 1.25;
          formule += `Total * 1.25 = ${prix}`;
        
          return { prix, formule };
        }
        


        get_prix_tache_14(donnees_json){
          
          let prix=0
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


        get_prix_tache_15(donnees_json) {
          let formule = ""; // Pour construire la formule explicative
          let prix = 0; // Prix total initialisé à 0
          let gammes = donnees_json["gammes-produits-renovation-electrique"].appareils_electrique;
          let chauffage_exist = donnees_json["gammes-produits-renovation-electrique"].chauffage_exist === "true";
      
          gammes.forEach((appareil, index) => {
              if (appareil.active && appareil.modele) {
                  let prixUnitaire = parseFloat(appareil.modele.split(':').pop()); // Récupère le dernier nombre du champ 'modele'
                  let sousTotal = appareil.nombre * prixUnitaire; // Calcul du sous-total pour cet appareil
                  prix += sousTotal; // Ajoute le sous-total au prix total
                  formule += `Appareil ${index + 1}: ${appareil.nombre} * ${prixUnitaire} = ${sousTotal}\n`;
              }
          });
          prix *= 1.25; 
          formule += `prix total * 1.25 = ${prix}\n`;
          
      
          return { prix, formule };
        }
      
      

  


         get_prix_tache_16(donnees_json) {
          let formule = ""; // Stocke la formule explicative
          let prix = 0;
      
          // Données principales
          const appareils = donnees_json["gammes-produits-pose-app-san"]["appareils_salle_de_bain"];
      
          // Prix fixe pour la dépose d'un appareil
          const prixDepose = this.tache_depose_element_salle_de_bain.Prix; // À personnaliser selon vos besoins
      
          // Itération sur les appareils
          appareils.forEach((appareil, index) => {
              if (appareil.active) {
                  // Récupérer le prix du modèle (dernier élément après le dernier ':')
                  const modeleParts = appareil.modele.split(":");
                  const prixModele = parseFloat(modeleParts[2]); // Prix du modèle
                  prix += prixModele;
                  formule += `Appareil ${index + 1} (modèle actif): Prix modèle (${prixModele}) = ${prixModele}\n`;
      
                  // Ajouter le prix de la dépose si applicable
                  if (appareil.depose) {
                      prix += prixDepose;
                      formule += `Appareil ${index + 1} (dépose): Prix fixe pour dépose (${prixDepose}) = ${prixDepose}\n`;
                  }
              }
          });
          prix *= 1.25; 
          formule += `prix total * 1.25 = ${prix}\n`;
          // Retourner le prix total et la formule explicative
          return { prix, formule };
      }
      



}
  
  module.exports = DevisCalculator;