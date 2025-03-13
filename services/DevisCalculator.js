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
            case 11:
                prix = this.get_prix_tache_11(donnees_json);
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
          case 11:
              prix = this.get_prix_tache_11(donnees_json);
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
               
                this.get_tache_generale(21),
                this.get_tache_generale(22),
                this.get_tache_generale(23),
                this.get_tache_generale(24),
                this.get_tache_generale(25),
                this.get_tache_generale(26),
                this.get_tache_generale(27),
                this.get_tache_generale(28),
                this.get_tache_generale(29),
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
         
           
            this.tache_depose_element_salle_de_bain = taches[11];
            this.tache_depose_element_haut_cuisine = taches[12];
            this.tache_depose_element_bas_cuisine = taches[13];
            this.tache_depose_element_plomberie = taches[14];
            this.tache_creation_de_murs_non_porteurs = taches[15];
            this.tache_mise_en_securité = taches[16];
            this.tache_renovation_electrique_de_chauffage = taches[17];
            this.tache_creation_appareils_electrique = taches[18];
            this.tache_remplacement_appareils_electrique = taches[19];
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
          let surface = mur.hauteur * mur.longueur/10000;
  
          // Récupération du prix de la gamme pour ce mur
          const gammePrix = parseFloat(gammesProduits[index].gamme.split(':')[2]);
          const gammeTitre = (gammesProduits[index].gamme.split(':')[1]);
          let sousTotalGamme = surface * gammePrix;
          prix += sousTotalGamme;
          formule += `<u>Prix de pose du mur ${index + 1}</u>\n surface (${surface} m²) * prix de la gamme choisie "${gammeTitre}" (${gammePrix} €) = ${sousTotalGamme} €\n`;
  
          // Vérification de l'état de la surface pour inclure les coûts de dépose
          const etat = etatSurfaces[index].etat;
          const typedepose = mur.depose;
          const prixDepose = parseFloat(typedepose.split(':')[2]);
          const titreDepose = (typedepose.split(':')[1]);
          let sousTotalDepose = surface * prixDepose;
          prix += sousTotalDepose;
          formule += `<u>Prix de dépose du mur ${index + 1}</u>\n surface (${surface} m²) * prix du revêtement à déposer "${titreDepose}" (${prixDepose} €) = ${sousTotalDepose} €\n`;
          
      });
  
      // Multiplier le prix total par 1.25
      let total = (prix * 1.25).toFixed(2);
      formule += `<u>Prix TTC </u>\n prix total (${prix} €) * Facteur global (1.25) = ${total} €\n`;
    
      // Retourner le prix total et la formule descriptive
      return {
        prix: total, // Formatage du prix en 2 décimales
        formule: formule
      };
    }
  
    get_prix_tache_2(donnees_json) {
      let prix = 0;
      let formule = "";
    
      // Extraire les données nécessaires
      const appareils_cuisine = donnees_json["gammes-produits-pose-elementcuisines"].appareils_cuisine;
      const gammes_depose_form = donnees_json["gammes-produits-pose-elementcuisines"].gammes_depose_form;
    
      // Prix des éléments a deposer
      gammes_depose_form.forEach(element => {
        let qte=(element.longueur<1)?element.quantite:1;
        let prixLocal = qte * element.prix;
        prix += prixLocal;
        formule += `<u>Prix de dépose de l'élement "${element.titre}"</u>\n quantité (${qte}) * prix de dépose (${element.prix} €) = ${prixLocal} €\n`;
      });
    
      // Calculer le prix pour " pose appareils_cuisine"
      
        appareils_cuisine.forEach(element => {
          if(element.active){
            let prixLocal = parseFloat(element.modele.split(':')[2]);
            let titre = (element.modele.split(':')[1]);
            prix += prixLocal;
            formule += `<u>Prix de pose de l'élement "${titre}"</u>\n quantité (1) * prix (${prixLocal} €) = ${prixLocal} €\n`;
          }
          
        });
      
    
      // Multiplier le prix total par 1.25
      let total = (prix * 1.25).toFixed(2);
      formule += `<u>Prix TTC </u>\n prix total (${prix} €) * Facteur global (1.25) = ${total} €\n`;
    
      // Retourner le prix total et la formule descriptive
      return {
        prix: total, // Formatage du prix en 2 décimales
        formule: formule
      };
    }
      

       get_prix_tache_3(donnees_json) {
        let prix = 0;
        let formule = ""; // Initialisation de la chaîne de formule
      
        let gammes = donnees_json["gammes-produits-murs-non-porteurs"];
        let mursnonporteurs = gammes.mursNonporteurs;
        let ouvertures = gammes.ouverturePartielle;
        
        let has_partie_murs = gammes.tp1;
        let has_partie_ouvertures = gammes.tp3;
      
        
    
      
        // Calcul des murs non porteurs
        if (has_partie_murs) {
          let total_murs = mursnonporteurs.length;
          for (let i = 0; i < total_murs; i++) {
            let prix_unit_mur = parseFloat(mursnonporteurs[i].cloison.split(':')[0]);
           // let volume_mur = mursnonporteurs[i].longueur*mursnonporteurs[i].hauteur*mursnonporteurs[i].epaisseur/1000000;
           let surface_mur = mursnonporteurs[i].longueur*mursnonporteurs[i].hauteur*mursnonporteurs[i].epaisseur/1000000;
            let prix_final_mur =  (surface_mur * prix_unit_mur);
            prix += prix_final_mur;
      
            formule += `<u>Prix du mur ${i+1}</u>\n surface (${surface_mur} m²) * prix unitaire (${prix_unit_mur} €) = ${prix_final_mur} €\n`;
          }
        }
      
        // Calcul des ouvertures partielles
        if (has_partie_ouvertures) {
          let total_ouvertures = ouvertures.length;
          for (let j = 0; j < total_ouvertures; j++) {
            let prix_unit_cloison = parseFloat(ouvertures[j].cloison.split(':')[0]);
            let surface_ouverture = ouvertures[j].epaisseur*((ouvertures[j].longueur*ouvertures[j].hauteur)-(ouvertures[j].longueur_ouverture*ouvertures[j].hauteur_ouverture))/1000000;
            let prix_final_ouverture =  (surface_ouverture * prix_unit_cloison);
            prix += prix_final_ouverture;
      
            formule += `<u>Prix de l'ouverture ${j+1}</u>\n surface (${surface_ouverture} m²) * prix unitaire (${prix_unit_cloison} €) = ${prix_final_ouverture} €\n`;
          }
        }
      
        // Multiplier le prix total par 1.25
        let total = (prix * 1.25).toFixed(2);
        formule += `<u>Prix TTC </u>\n prix total (${prix} €) * Facteur global (1.25) = ${total} €\n`;
      
        // Retourner le prix total et la formule descriptive
        return {
          prix: total, // Formatage du prix en 2 décimales
          formule: formule
        };
      }
      
      
        getTarif(id){
          return id
        }


         get_prix_tache_4(donnees_json) {
          let prix = 0;
          let formule = ""; // Initialisation de la chaîne de formule
        
          let murs = donnees_json["gammes-produits-creation-murs-non-porteurs--portes"].murs_non_porteurs;
          let has_portes = donnees_json["gammes-produits-creation-murs-non-porteurs--portes"].has_portes;
          let portes = donnees_json["gammes-produits-creation-murs-non-porteurs--portes"].portes;
          let prix_creation = this.tache_creation_de_murs_non_porteurs.Prix;
          // Calcul du prix pour les murs non porteurs
          let total_murs = murs.length;
          for (let i = 0; i < total_murs; i++) {
            let surface = murs[i].longueur*murs[i].hauteur/10000;
            let prix_unit_cloison = prix_creation; // Le prix est en position 1 du split
            let prix_final_mur = surface * prix_unit_cloison * 1;
            prix += prix_final_mur;
        
            formule += `<u>Prix du mur ${i+1}</u>\n  surface ${surface} m² * prix unitaire ${prix_unit_cloison} € = ${prix_final_mur} €\n`;
          }

          if(has_portes){
            // Calcul du prix pour les portes
            let total_portes = portes.length;
            for (let j = 0; j < total_portes; j++) {
              let gamme_porte = portes[j].gamme;
              let prix_unit_porte = parseFloat(gamme_porte.split(":")[1]); // Le prix est en position 1 du split
              let prix_final_porte = 1 * prix_unit_porte * 1;
              prix += prix_final_porte;

              formule += `<u>Prix porte ${j+1}</u>\n 1 * prix unitaire ${prix_unit_porte} € = ${prix_final_porte} €\n`;
            }
          }
          
          // Multiplier le prix total par 1.25
          let total = (prix * 1.25).toFixed(2);
          formule += `<u>Prix TTC </u>\n prix total (${prix} €) * Facteur global (1.25) = ${total} €\n`;
        
          // Retourner le prix total et la formule descriptive
          return {
            prix: total, // Formatage du prix en 2 décimales
            formule: formule
          };
        }
        


         get_prix_tache_10(donnees_json) {
          let prix = 0;
          let formule = ""; // Chaîne pour construire la formule
        
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
           });
        
          // Multiplier le prix total par 1.25
          let total = (prix * 1.25).toFixed(2);
          formule += `<u>Prix TTC </u>\n prix total (${prix} €) * Facteur global (1.25) = ${total} €\n`;
        
          // Retourner le prix total et la formule descriptive
          return {
            prix: total, // Formatage du prix en 2 décimales
            formule: formule
          };
        }
        


        get_prix_tache_11(donnees_json) {
          let prix = 0;
          let formule = ""; // Chaîne pour documenter les calculs
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
      
          // Multiplier le prix total par 1.25
          let total = (prix * 1.25).toFixed(2);
          formule += `<u>Prix TTC</u>\n prix total (${prix} €) * Facteur global (1.25) = ${total} €\n`;
        
          // Retourner le prix total et la formule descriptive
          return {
            prix: total, // Formatage du prix en 2 décimales
            formule: formule
          };
      }
      
        
      
         get_prix_tache_12(donnees_json) {
          let formule = ""; // Stocke la formule explicative
          let prix = 0;
      
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
            
          });
      
          // Multiplier le prix total par 1.25
          let total = (prix * 1.25).toFixed(2);
          formule += `<u>Prix TTC </u>\n prix total (${prix} €) * Facteur global (1.25) = ${total} €\n`;
        
          // Retourner le prix total et la formule descriptive
          return {
            prix: total, // Formatage du prix en 2 décimales
            formule: formule
          };
      }
      
         get_prix_tache_8(donnees_json) {
          let formule = ""; // Stocke la formule explicative
          let prix = 0;
      
          // Données principales
          const surface = donnees_json["dimensions-pose-plafond"].longueur * donnees_json["dimensions-pose-plafond"].largeur/10000;
          const id_prix_gamme = donnees_json["gammes-produits-pose-plafond"].gamme;
          const prix_depose = parseFloat(donnees_json["dimensions-pose-plafond"].depose.split(':')[2]);
          const titre_depose = (donnees_json["dimensions-pose-plafond"].depose.split(':')[1]);
          const etat_surface = donnees_json["etat-surfaces-pose-plafond"].etat;
      
          // Calcul du prix de la gamme
          const gammeParts = id_prix_gamme.split(':'); // Sépare la chaîne en parties
          const prix_gamme = parseFloat(gammeParts[2]); // Dernier élément
          const nom_gamme = (gammeParts[1]); // Dernier élément
          let sousTotalGamme = prix_gamme * surface;
          prix += sousTotalGamme;
          formule += `<u>Prix de la pose</u>\n  Surface (${surface} m²) * Prix de la gamme choisie "${nom_gamme}" (${prix_gamme} €) = ${sousTotalGamme} €\n`;

          let sousTotalDeposeGamme = prix_depose * surface;
          prix += sousTotalDeposeGamme;
          formule += `<u>Prix de la dépose</u>\n Surface (${surface} m²) * Prix de la gamme du revêtement à déposer "${titre_depose}" (${prix_depose} €) = ${sousTotalDeposeGamme} €\n`;
          
      
          // Multiplier le prix total par 1.25
          let total = (prix * 1.25).toFixed(2);
          formule += `<u>Prix TTC</u>\n prix total (${prix} €) * Facteur global (1.25) = ${total} €\n`;
        
          // Retourner le prix total et la formule descriptive
          return {
            prix: total, // Formatage du prix en 2 décimales
            formule: formule
          };
      }
      
       get_prix_tache_9(donnees_json) {
        let formule = ""; // Stocke la formule explicative
        let prix = 0;
    
        // Données principales
        const surface = donnees_json["dimensions-pose-sol"].longueur * donnees_json["dimensions-pose-sol"].largeur/10000;
        const prix_depose = parseFloat(donnees_json["dimensions-pose-sol"].depose.split(":")[2]);
        const nom_depose = (donnees_json["dimensions-pose-sol"].depose.split(":")[1]);
        const etat_surface = donnees_json["etat-surfaces-pose-sol"].etat;
        const gammes = donnees_json["gammes-produits-pose-sol"];
    
        // Vérification des gammes
        if (gammes.gamme) {
            const gammeParts = gammes.gamme.split(":");
            const prixGamme = parseFloat(gammeParts[gammeParts.length - 1]); // Dernier élément
            const nomGamme = (gammeParts[1]); // Dernier élément
            const sousTotalGamme = prixGamme * surface;
            prix += sousTotalGamme;
            formule += `<u>Prix de pose</u>\n  Surface (${surface} m²) * Prix de la gamme choisie "${nomGamme}" (${prixGamme} €) = ${sousTotalGamme} €\n`;
        }

        if (prix_depose>0) {
          
          const sousTotaldepose = prix_depose * surface;
          prix += sousTotaldepose;
          formule += `<u>Prix de dépose</u>\n  Surface (${surface} m²) * Prix du revêtement à déposer "${nom_depose}" (${prix_depose} €) = ${sousTotaldepose} €\n`;
      }
    
        // Vérification des plinthes
        if (gammes.plinthes) {
            const plintheParts = gammes.plinthes.split(":");
            const prixPlinthes = parseFloat(plintheParts[plintheParts.length - 1]); // Dernier élément
            const nomPlinthes = (plintheParts[1]); // Dernier élément
            const sousTotalPlinthes = prixPlinthes * surface;
            prix += sousTotalPlinthes;
            formule += `<u>Prix de la pose de plinthes</u>\n  Surface (${surface} m²) * Prix des plinthes "${nomPlinthes}" (${prixPlinthes} €) = ${sousTotalPlinthes} €\n`;
        }
    
       
    
        // Multiplier le prix total par 1.25
        let total = (prix * 1.25).toFixed(2);
        formule += `<u>Prix TTC</u>\n  prix total (${prix} €) * Facteur global (1.25) = ${total} €\n`;
      
        // Retourner le prix total et la formule descriptive
        return {
          prix: total, // Formatage du prix en 2 décimales
          formule: formule
        };
    }
    
        

         get_prix_tache_13(donnees_json) {
          let prix = 0;
          let formule = ""; // Pour construire la formule explicative
        
          const appareils = donnees_json["gammes-produits-pose-electricite"].appareils_electrique_a_remplacer;
          const gamme = donnees_json["gammes-produits-pose-electricite"].gamme
          let prix_tache_creation = this.tache_creation_appareils_electrique.Prix;
          let prix_tache_remplacement = this.tache_remplacement_appareils_electrique.Prix;

          // Calcul pour chaque appareil électrique
          appareils.forEach((appareil, index) => {
            if (appareil.active) {

              if (appareil.nombre_a_creer>0) {
                // création
                let nombre_a_creer = appareil.nombre_a_creer;
                let prix_creation = nombre_a_creer * prix_tache_creation;
                prix += prix_creation;
                formule += `<u>Prix de la création de l'appareil "${appareil.titre}"</u>\n nombre à créer (${nombre_a_creer}) * ${prix_tache_creation} € = ${prix_creation} € \n`;
              }
              if (appareil.nombre_a_remplacer>0) {
                // remplacement
                let nombre_a_remplacer = appareil.nombre_a_remplacer;
                let prix_remplacement = nombre_a_remplacer * prix_tache_remplacement;
                prix += prix_remplacement;
                formule += `<u>Prix du remplacement de l'appareil "${appareil.titre}"</u>\n nombre à remplacer (${nombre_a_remplacer}) * ${prix_tache_remplacement} € = ${prix_remplacement} € \n`;
              }
            }
          });
        
              let nom_gamme =  (gamme.split(":")[2]);;
              let prix_gamme = parseFloat(gamme.split(":")[1]);;
              let prix_final_gamme = 1 * prix_gamme;
              prix += prix_final_gamme;
              formule += `<u>Prix de la gamme "${nom_gamme}" </u>\n 1 * ${prix_gamme} € = ${prix_final_gamme} € \n`;
            
         
          // Multiplier le prix total par 1.25
          let total = (prix * 1.25).toFixed(2);
          formule += `<u>Prix TTC</u>\n prix total (${prix} €) * Facteur global (1.25) = ${total} €\n`;
        
          // Retourner le prix total et la formule descriptive
          return {
            prix: total, // Formatage du prix en 2 décimales
            formule: formule
          };
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
       
          const prix_mise_en_securite = this.tache_mise_en_securité.Prix;
          const prix_renovation_chauffage = this.tache_renovation_electrique_de_chauffage.Prix;
          let surface = donnees_json["gammes-produits-renovation-electrique"].surface;
          let chauffage_exist = donnees_json["gammes-produits-renovation-electrique"].chauffage_exist;
          let quantite_chauffage = donnees_json["gammes-produits-renovation-electrique"].quantite_chauffage;
          let renovation_conforme = donnees_json["gammes-produits-renovation-electrique"].renovation_conforme;
          let mise_en_securite = donnees_json["gammes-produits-renovation-electrique"].mise_en_securite;
          
          if(chauffage_exist){
            let sousTotal = quantite_chauffage * prix_renovation_chauffage; // Calcul du sous-total pour cet appareil
            prix += sousTotal; // Ajoute le sous-total au prix total
            formule += `<u>Prix renovation de chauffage</u>\n ${quantite_chauffage} * ${prix_renovation_chauffage} € = ${sousTotal} €\n`;
          }

         

          if(mise_en_securite){
            let sousTotal = 1 * prix_mise_en_securite; // Calcul du sous-total pour cet appareil
            prix += sousTotal; // Ajoute le sous-total au prix total
            formule += `<u>Prix mise en sécurité</u>\n 1 * ${prix_mise_en_securite} € = ${sousTotal} €\n`;
          }

         
          // Multiplier le prix total par 1.25
          let total = (prix * 1.25).toFixed(2);
          formule += `<u>Prix TTC</u>\n prix total (${prix} €) * Facteur global (1.25) = ${total} €\n`;
        
          // Retourner le prix total et la formule descriptive
          return {
            prix: total, // Formatage du prix en 2 décimales
            formule: formule
          };
        }
      
      

  


         get_prix_tache_16(donnees_json) {
          let formule = ""; // Stocke la formule explicative
          let prix = 0;
      
          // Données principales
          const appareils_pose = donnees_json["gammes-produits-pose-app-san"]["appareils_salle_de_bain"];
          const appareils_depose = donnees_json["gammes-produits-pose-app-san"]["gammes_depose_form"];
          // Prix fixe pour la dépose d'un appareil
          const prixDepose = this.tache_depose_element_salle_de_bain.Prix; // À personnaliser selon vos besoins
      
          // Itération sur les appareils
          appareils_pose.forEach((appareil, index) => {
              if (appareil.active) {
                  // Récupérer le prix du modèle (dernier élément après le dernier ':')
                  let modeleParts = appareil.modele.split(":");
                  let prixModele = parseFloat(modeleParts[2]); // Prix du modèle
                  let titreModele = (modeleParts[1]); // Prix du modèle
                  prix += prixModele;
                  formule += `<u>Prix de pose</u>\n ${titreModele}: 1 * prix de pose (${prixModele} €) = ${prixModele} €\n`;
      
                 
              }
          });

          appareils_depose.forEach((appareil, index) => {
            if (appareil.quantite>0) {
                // Récupérer le prix du modèle (dernier élément après le dernier ':')
                let titreModele = appareil.titre; // Prix du modèle
                let prixModele = appareil.prix; // Prix du modèle
                prix += prixModele;
                formule += `<u>Prix de dépose</u>\n ${titreModele} : 1 * prix de dépose (${prixModele} €) = ${prixModele} €\n`;
            }
                
            
        });
          
        
        // Multiplier le prix total par 1.25
        let total = (prix * 1.25).toFixed(2);
        formule += `<u>Prix TTC</u>\n prix total (${prix} €) * Facteur global (1.25) = ${total} €\n`;
      
        // Retourner le prix total et la formule descriptive
        return {
          prix: total, // Formatage du prix en 2 décimales
          formule: formule
        };
      }
      



}
  
  module.exports = DevisCalculator;