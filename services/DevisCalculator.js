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
            case 14:
                prix = this.get_prix_tache_14(donnees_json);
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
          case 14:
              prix = this.get_prix_tache_14(donnees_json);
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
                this.get_tache_generale(5)
            ]);

            this.tache_retirer_carrelage = taches[0];
            this.tache_retirer_papier = taches[1];
            this.tache_retirer_peinture = taches[2];
            this.tache_retirer_enduit = taches[3];
            this.tache_retirer_lambris = taches[4];
            this.tache_retirer_tissus = taches[5];
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
    get_prix_tache_5(donnees_json){
        let prix=0
        let dimensions = donnees_json["dimensions-pose-murs"].murs;
        let gammes = donnees_json["gammes-produits-pose-murs"].murs;
        let etat_surfaces = donnees_json["etat-surfaces-pose-murs"].murs;
        let total=dimensions.length
        for(let i=0;i<total;i++){
          prix+=dimensions[i].surface*gammes[i].peinture
          prix+=dimensions[i].surface*gammes[i].carrelage
          prix+=dimensions[i].surface*gammes[i].papier
          prix+=dimensions[i].surface*gammes[i].enduit
        }
        return prix
      }
        getTarif(id){
          return id
        }
        get_prix_tache_10(donnees_json){
          let prix=0
          const portes = donnees_json.portes;
        
          // Parcourir chaque mur
          portes.forEach(porte => {
            if(porte.type1){
              prix+=this.getTarif(porte.type1.length)
            }
            if(porte.type2){
              prix+=this.getTarif(porte.type2.length)
            }
            if(porte.type3){
              prix+=this.getTarif(porte.type3.length)
            }
            if(porte.finition){
              prix+=this.getTarif(porte.finition.length)
            }
          });
          return prix
        }
      
        get_prix_tache_12(donnees_json){
          let prix=0
          prix+=donnees_json.creation_de_canalisations*this.getTarif("creation_de_canalisations".length)
          prix+=donnees_json.pose_de_radiateur_existant*this.getTarif("pose_de_radiateur_existant".length)
          
          return prix
        }
        get_prix_tache_8(donnees_json){
          let prix=0
          let surface=donnees_json["dimensions-pose-plafond"].surface
          let prix_carrelage=donnees_json["gammes-produits-pose-plafond"].carrelage;
          let prix_papier=donnees_json["gammes-produits-pose-plafond"].papier;
          let prix_enduit=donnees_json["gammes-produits-pose-plafond"].enduit;
          let prix_peinture=donnees_json["gammes-produits-pose-plafond"].peinture;
          prix+=prix_carrelage*surface
          prix+=prix_papier*surface
          prix+=prix_enduit*surface
          prix+=prix_peinture*surface
            
          return prix
        }
        get_prix_tache_9(donnees_json){
          let prix=0
          let surface=donnees_json["dimensions-pose-sol"].surface
          let prix_plinthes=donnees_json["gammes-produits-pose-sol"].plinthes;
          let has_pvc=(donnees_json["gammes-produits-pose-sol"].sol_pvc)?1:0;
          let has_moquette=(donnees_json["gammes-produits-pose-sol"].moquette)?1:0;
          let prix_pvc=donnees_json["gammes-produits-pose-sol"].sol_pvc_prix;
          let prix_moquette=donnees_json["gammes-produits-pose-sol"].moquette_prix;
          let prix_carrelage=donnees_json["gammes-produits-pose-sol"].carrelage;
          let prix_parquet_massif=donnees_json["gammes-produits-pose-sol"].parquet_massif;
          let prix_paquet_flottant_finition_bois=donnees_json["gammes-produits-pose-sol"].paquet_flottant_finition_bois;
          let prix_parquet_flottant_finition_stratifiee=donnees_json["gammes-produits-pose-sol"].parquet_flottant_finition_stratifiee;
          prix+=prix_plinthes*surface
          prix+=prix_carrelage*surface
          prix+=prix_parquet_massif*surface
          prix+=has_moquette*prix_moquette
          prix+=has_pvc*prix_pvc
          prix+=prix_paquet_flottant_finition_bois*surface
          prix+=prix_parquet_flottant_finition_stratifiee*surface
            
          return prix
        }
        
        get_prix_tache_14(donnees_json){
          
          let prix=0
          let dimensions = donnees_json["dimensions-depose-murs"].murs;
          let gammes = donnees_json["gammes-produits-depose-murs"].murs;
          let etat_surfaces = donnees_json["etat-surfaces-depose-murs"].murs;
          let total=dimensions.length
          for(let i=0;i<total;i++){
            let surface=dimensions[i].surface
            let has_carrelage=(gammes[i].carrelage)?1:0;
            let has_papier=(gammes[i].papier)?1:0;
            let has_enduit=(gammes[i].enduit)?1:0;
            let has_peinture=(gammes[i].peinture)?1:0;
            let has_lambris=(gammes[i].lambris)?1:0;
            let has_tissus=(gammes[i].tissus)?1:0;
      
            prix+=has_carrelage*surface*this.tache_retirer_carrelage.Prix
            prix+=has_papier*surface*this.tache_retirer_papier.Prix
            prix+=has_peinture*surface*this.tache_retirer_peinture.Prix
            prix+=has_enduit*surface*this.tache_retirer_enduit.Prix
            prix+=has_lambris*surface*this.tache_retirer_lambris.Prix
            prix+=has_tissus*surface*this.tache_retirer_tissus.Prix
          }
            
          return prix
        }
      

  }
  
  module.exports = DevisCalculator;