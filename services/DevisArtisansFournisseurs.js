const express = require('express');
const app = express();
const Utilisateur=require('../Utilisateur')
const Projet=require('../Projet')
const ArtisanFournisseurProjet = require('../ArtisanFournisseurProjet'); 
const Gamme = require('../Gamme'); 

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
     

      
  
      const murs = donnees_json["dimensions-pose-murs"].murs;
      const etatSurfaces = donnees_json["etat-surfaces-pose-murs"].murs;
      const gammesProduits = donnees_json["gammes-produits-pose-murs"].murs;
  
      murs.forEach(async (mur, index) => {
          

          //donnees prix coutant
          if(gammesProduits[index].artisan_pose){

            const artisan_pose_marge = (gammesProduits[index].artisan_pose.split(':'));
            const fournisseur_pose_marge = (gammesProduits[index].fournisseur_pose.split(':'));
         
            const etat_artisan = gammesProduits[index].artisan_surfaces.split('-');
            const typedeposeArtisan = gammesProduits[index].artisan_depose.split(':');


            let id_gamme = parseInt(artisan_pose_marge[0]);
            let NatureDesTravaux = (artisan_pose_marge[1]);
            let Montant = parseFloat(artisan_pose_marge[2]);
            let gamme = await Gamme.findByPk(id_gamme);
            let id_artisan = gamme.ArtisanID
             //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });

            id_gamme = parseInt(fournisseur_pose_marge[0]);
            NatureDesTravaux = (fournisseur_pose_marge[1]);
            Montant = parseFloat(fournisseur_pose_marge[2]);
            gamme = await Gamme.findByPk(id_gamme);
            let id_fournisseur = gamme.FournisseurID
             //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_fournisseur
            });


             id_gamme = parseInt(typedeposeArtisan[0]);
             NatureDesTravaux = (typedeposeArtisan[1]);
             Montant = parseFloat(typedeposeArtisan[2]);
             gamme = await Gamme.findByPk(id_gamme);
             id_artisan = gamme.ArtisanID
             //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });

             id_gamme = parseInt(etat_artisan[0]);
             NatureDesTravaux = (etat_artisan[1]);
             Montant = parseFloat(etat_artisan[2]);
             gamme = await Gamme.findByPk(id_gamme);
             id_artisan = gamme.ArtisanID
             //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });
            

          }
          
          
          
      });
  
    

        

      
        // Retourner le prix total et la formule descriptive
        return true
    }
  
    async add_datas_tache_2(donnees_json, devis_id, projet_id) {
     
      // Extraire les données nécessaires
      const appareils_cuisine = donnees_json["gammes-produits-pose-elementcuisines"].appareils_cuisine;
      const gammes_depose_form = donnees_json["dimensions-pose-elementcuisines"].gammes_depose_form;
    
      
    
      // Calculer le prix pour " pose appareils_cuisine"
      
        appareils_cuisine.forEach(async element => {
          if(element.active){
        
            if( element.fournisseur_pose){
                let aParts = element.artisan_pose.split(":");

                let id_gamme = parseInt(aParts[0]);
                let NatureDesTravaux = (aParts[1]);
                let Montant = parseFloat(aParts[2]);

                const gamme = await Gamme.findByPk(id_gamme);

                let id_artisan = gamme.ArtisanID

                //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
                await this.ajouterArtisanFournisseurProjet({
                    NatureDesTravaux,
                    Montant,
                    ProjetID: projet_id,
                    DevistacheID: devis_id,
                    UtilisateurID: id_artisan
                });
              
                
            }

             if(element.artisan_pose){
                let fParts = element.fournisseur_pose.split(":");

                  let id_gamme = parseInt(fParts[0]);
                let NatureDesTravaux = (fParts[1]);
                let Montant = parseFloat(fParts[2]);

                const gamme = await Gamme.findByPk(id_gamme);

                let id_fournisseur = gamme.FournisseurID

                //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
                await this.ajouterArtisanFournisseurProjet({
                    NatureDesTravaux,
                    Montant,
                    ProjetID: projet_id,
                    DevistacheID: devis_id,
                    UtilisateurID: id_fournisseur
                });
              
                
            }
          
          
          }
          
        });
      

       

      
        // Retourner le prix total et la formule descriptive
        return true;
    }
      

      async add_datas_tache_3(donnees_json, devis_id, projet_id) {
        let prix = 0;
        let formule = ""; // Initialisation de la chaîne de formule
        let formule_marge='';
        let prix_marge = 0;
        
      
        let gammes = donnees_json["gammes-produits-murs-non-porteurs"];
        let mursnonporteurs = gammes.mursNonporteurs;
        let ouvertures = gammes.ouverturePartielle;
        
        let has_partie_murs = gammes.tp1;
        let has_partie_ouvertures = gammes.tp3;
        
    
      
        // Calcul des murs non porteurs
        if (has_partie_murs) {
          let total_murs = mursnonporteurs.length;
          for (let i = 0; i < total_murs; i++) {
           
            let artisan_pose = mursnonporteurs[i].artisan_pose
            let fournisseur_pose = mursnonporteurs[i].fournisseur_pose
            if(artisan_pose ){
              let artisan_pose_marge = (artisan_pose.split(':'));

          

              let id_gamme = parseInt(artisan_pose_marge[0]);
              let NatureDesTravaux = (artisan_pose_marge[1]);
              let Montant = parseFloat(artisan_pose_marge[2]);
              let gamme = await Gamme.findByPk(id_gamme);
              let id_artisan = gamme.ArtisanID
              //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
              await this.ajouterArtisanFournisseurProjet({
                  NatureDesTravaux,
                  Montant,
                  ProjetID: projet_id,
                  DevistacheID: devis_id,
                  UtilisateurID: id_artisan
              });



            }
          
          }
        }
      
        // Calcul des ouvertures partielles
        if (has_partie_ouvertures) {
          let total_ouvertures = ouvertures.length;
          for (let j = 0; j < total_ouvertures; j++) {
           

            let artisan_pose = ouvertures[j].artisan_pose
            let fournisseur_pose = ouvertures[j].fournisseur_pose
            if(artisan_pose ){
              let prix_artisan_pose_ouverture_marge = parseFloat(artisan_pose.split(':'));


            
            }
        
          }
        }
      
       
      
        // Retourner le prix total et la formule descriptive
        return true;
      }
      
      
        getTarif(id){
          return id
        }


        async add_datas_tache_4(donnees_json, devis_id, projet_id) {
       
        
          let murs = donnees_json["gammes-produits-creation-murs-non-porteurs--portes"].murs_non_porteurs;
          let has_portes = donnees_json["gammes-produits-creation-murs-non-porteurs--portes"].has_portes;
          let portes = donnees_json["gammes-produits-creation-murs-non-porteurs--portes"].portes;
          // Calcul du prix pour les murs non porteurs
          let total_murs = murs.length;
          for (let i = 0; i < total_murs; i++) {

            //donnees prix coutant
            let artisan_pose = murs[i].artisan_pose
            if(artisan_pose){
              const artisan_pose_marge = (artisan_pose.split(':'));
             


              let id_gamme = parseInt(artisan_pose_marge[0]);
              let NatureDesTravaux = (artisan_pose_marge[2]);
              let Montant = parseFloat(artisan_pose_marge[1]);
              let gamme = await Gamme.findByPk(id_gamme);
              let id_artisan = gamme.ArtisanID
              //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
              await this.ajouterArtisanFournisseurProjet({
                  NatureDesTravaux,
                  Montant,
                  ProjetID: projet_id,
                  DevistacheID: devis_id,
                  UtilisateurID: id_artisan
              });




            }

          
          
          }

          


        

      
        // Retourner le prix total et la formule descriptive
        return true

      }
        

      async add_datas_tache_10(donnees_json, devis_id, projet_id) {
       

        
        
        const portes = donnees_json["gammes-produits-pose-portes"].portes;
        
        // Parcourir chaque porte
        portes.forEach(async (porte, index) => {

          
          
          if(porte.artisan_pose ){
            let artisan_pose = (porte.artisan_pose.split(":"));

            let id_gamme = parseInt(artisan_pose[0]);
            let NatureDesTravaux = (artisan_pose[2]);
            let Montant = parseFloat(artisan_pose[1]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_artisan = gamme.ArtisanID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });
           


          }

          if( porte.fournisseur_pose ){
            let fournisseur_pose = (porte.fournisseur_pose.split(":"));

            let id_gamme = parseInt(fournisseur_pose[0]);
            let NatureDesTravaux = (fournisseur_pose[2]);
            let Montant = parseFloat(fournisseur_pose[1]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_fournisseur = gamme.FournisseurID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_fournisseur
            });
           

         

          }

          if(porte.artisan_nature){
         
            let artisan_nature = (porte.artisan_nature.split(":"));
            let id_gamme = parseInt(artisan_nature[0]);
            let NatureDesTravaux = (artisan_nature[2]);
            let Montant = parseFloat(artisan_nature[1]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_artisan = gamme.ArtisanID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });
          

          }

          if(porte.fournisseur_nature){
         
         
            let fournisseur_nature = (porte.fournisseur_nature.split(":"));
            let id_gamme = parseInt(fournisseur_nature[0]);
            let NatureDesTravaux = (fournisseur_nature[2]);
            let Montant = parseFloat(fournisseur_nature[1]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_fournisseur = gamme.FournisseurID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_fournisseur
            });


          }

          if(porte.artisan_type){
       
            let artisan_type = (porte.artisan_type.split(":"));
            let id_gamme = parseInt(artisan_type[0]);
            let NatureDesTravaux = (artisan_type[2]);
            let Montant = parseFloat(artisan_type[1]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_artisan = gamme.ArtisanID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });
          

          }

          if(porte.fournisseur_type){
        
            let fournisseur_type = (porte.fournisseur_type.split(":"));
            let id_gamme = parseInt(fournisseur_type[0]);
            let NatureDesTravaux = (fournisseur_type[2]);
            let Montant = parseFloat(fournisseur_type[1]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_fournisseur = gamme.FournisseurID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_fournisseur
            });

         

          }

        
        });
      
        
       
        return true;

      }
    
      
       async add_datas_tache_12(donnees_json, devis_id, projet_id) {
       
      
        // Données principales
        const surface = donnees_json["dimensions-pose-chauffage"].surface;
        const radiateursTypes = donnees_json["etat-surfaces-pose-chauffage"].radiateurs;
        const radiateursGammes = donnees_json["gammes-produits-pose-chauffage"].radiateurs;
    
      
        // Itération sur chaque radiateur
        radiateursTypes.forEach(async (radiateur, index) => {
          
       
          
          const artisan_type = radiateur.artisan_type.split(':');
          const fournisseur_type = radiateur.fournisseur_type.split(':');
          const artisan_pose = radiateursGammes[index].artisan_pose.split(':');
          const fournisseur_pose = radiateursGammes[index].fournisseur_pose.split(':');
       

          
          if (artisan_type) {
            let id_gamme = parseInt(artisan_type[0]);
            let NatureDesTravaux = (artisan_type[2]);
            let Montant = parseFloat(artisan_type[1]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_artisan = gamme.ArtisanID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });
          }

          if (fournisseur_type) {
              let id_gamme = parseInt(fournisseur_type[0]);
            let NatureDesTravaux = (fournisseur_type[2]);
            let Montant = parseFloat(fournisseur_type[1]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_fournisseur = gamme.FournisseurID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_fournisseur
            });
          }

          if (artisan_pose) {
              let id_gamme = parseInt(artisan_pose[0]);
            let NatureDesTravaux = (artisan_pose[2]);
            let Montant = parseFloat(artisan_pose[1]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_artisan = gamme.ArtisanID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });
          }

          if (fournisseur_pose) {
             let id_gamme = parseInt(fournisseur_pose[0]);
            let NatureDesTravaux = (fournisseur_pose[2]);
            let Montant = parseFloat(fournisseur_pose[1]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_fournisseur = gamme.FournisseurID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_fournisseur
            });
          }

         
        });
      
        

      
        // Retourner le prix total et la formule descriptive
        return true;
      }

      
      
      async add_datas_tache_8(donnees_json, devis_id, projet_id) {
          
      
          // Données principales
          const gammes = donnees_json["gammes-produits-pose-plafond"];
          const surface = donnees_json["dimensions-pose-plafond"].longueur * donnees_json["dimensions-pose-plafond"].largeur/10000;
         

           //donnees prix coutant
          const fournisseur_pose = (gammes.fournisseur_pose).split(':');
          const artisan_pose = (gammes.artisan_pose).split(':');
          const artisan_surfaces = (gammes.artisan_surfaces).split('-');
          const artisan_depose = (gammes.artisan_depose).split(':');

          if(fournisseur_pose){

            let id_gamme = parseInt(fournisseur_pose[0]);
            let NatureDesTravaux = (fournisseur_pose[1]);
            let Montant = parseFloat(fournisseur_pose[2]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_fournisseur = gamme.FournisseurID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_fournisseur
            });
           
          }

          if(artisan_pose){
           
           let id_gamme = parseInt(artisan_pose[0]);
            let NatureDesTravaux = (artisan_pose[1]);
            let Montant = parseFloat(artisan_pose[2]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_artisan = gamme.ArtisanID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });
          }

          if(artisan_surfaces){

           let id_gamme = parseInt(artisan_surfaces[0]);
            let NatureDesTravaux = (artisan_surfaces[1]);
            let Montant = parseFloat(artisan_surfaces[2]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_artisan = gamme.ArtisanID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });
           
          }

          if(artisan_depose){
          
            
            let id_gamme = parseInt(artisan_depose[0]);
            let NatureDesTravaux = (artisan_depose[1]);
            let Montant = parseFloat(artisan_depose[2]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_artisan = gamme.ArtisanID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });
          }
         
      

      
        // Retourner le prix total et la formule descriptive
        return true;
      }

 
      
       async add_datas_tache_9(donnees_json, devis_id, projet_id) {
        
   
        const gammes = donnees_json["gammes-produits-pose-sol"];
       


        //donnees prix coutant
        const fournisseur_pose = (gammes.fournisseur_pose).split(':');
        const artisan_pose = (gammes.artisan_pose).split(':');
        const fournisseur_pose_plinthes = (gammes.fournisseur_pose_plinthes).split(':');
        const artisan_pose_plinthes = (gammes.artisan_pose_plinthes).split(':');
        const artisan_surfaces = (gammes.artisan_surfaces).split('-');
        const artisan_depose = (gammes.artisan_depose).split(':');

       
            let id_gamme = parseInt(artisan_pose[0]);
            let NatureDesTravaux = (artisan_pose[1]);
            let Montant = parseFloat(artisan_pose[2]);
            let gamme = await Gamme.findByPk(id_gamme);
            let id_artisan = gamme.ArtisanID
             //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });

            id_gamme = parseInt(fournisseur_pose[0]);
            NatureDesTravaux = (fournisseur_pose[1]);
            Montant = parseFloat(fournisseur_pose[2]);
            gamme = await Gamme.findByPk(id_gamme);
            let id_fournisseur = gamme.FournisseurID
             //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_fournisseur
            });

             id_gamme = parseInt(fournisseur_pose_plinthes[0]);
            NatureDesTravaux = (fournisseur_pose_plinthes[1]);
            Montant = parseFloat(fournisseur_pose_plinthes[2]);
            gamme = await Gamme.findByPk(id_gamme);
            id_fournisseur = gamme.FournisseurID
             //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_fournisseur
            });


             id_gamme = parseInt(artisan_pose_plinthes[0]);
             NatureDesTravaux = (artisan_pose_plinthes[1]);
             Montant = parseFloat(artisan_pose_plinthes[2]);
             gamme = await Gamme.findByPk(id_gamme);
             id_artisan = gamme.ArtisanID
             //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });

             id_gamme = parseInt(artisan_surfaces[0]);
             NatureDesTravaux = (artisan_surfaces[1]);
             Montant = parseFloat(artisan_surfaces[2]);
             gamme = await Gamme.findByPk(id_gamme);
             id_artisan = gamme.ArtisanID
             //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });


             id_gamme = parseInt(artisan_depose[0]);
             NatureDesTravaux = (artisan_depose[1]);
             Montant = parseFloat(artisan_depose[2]);
             gamme = await Gamme.findByPk(id_gamme);
             id_artisan = gamme.ArtisanID
             //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });

            

          
       

      
        // Retourner le prix total et la formule descriptive
        return true;
    }
    
        

      async add_datas_tache_13(donnees_json, devis_id, projet_id) {
         
        
          const appareils = donnees_json["gammes-produits-pose-electricite"].appareils_electrique_a_remplacer;
          const gammes = donnees_json["gammes-produits-pose-electricite"]
         
   

       

          //donnees prix coutant
          if(gammes.artisan_gamme){
            

            let gamme_artisan = (gammes.artisan_gamme.split("-"));
            let gamme_fournisseur = (gammes.fournisseur_gamme.split("-"));


            let prix_gamme_artisan = JSON.parse(gammes.artisan_gamme.split("-")[1]);
            let prix_gamme_fournisseur = JSON.parse(gammes.fournisseur_gamme.split("-")[1]);

            appareils.forEach(async (appareil, index) => {
              if (appareil.active) {
                let appareil_gamme_artisan = prix_gamme_artisan.find(a => a.nom.toLowerCase() === appareil.titre.toLowerCase());
                let appareil_gamme_fournisseur = prix_gamme_fournisseur.find(a => a.nom.toLowerCase() === appareil.titre.toLowerCase());

                if (appareil.nombre_a_creer>0) {
                  // création

                   let id_gamme = parseInt(gamme_artisan[0]);
                    let NatureDesTravaux = (gamme_artisan[2]);
                    let Montant = parseFloat(gamme_artisan[2]);
                    let gamme = await Gamme.findByPk(id_gamme);
                    let id_artisan = gamme.ArtisanID
                    //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
                    await this.ajouterArtisanFournisseurProjet({
                        NatureDesTravaux,
                        Montant:appareil_gamme_artisan.prix,
                        ProjetID: projet_id,
                        DevistacheID: devis_id,
                        UtilisateurID: id_artisan
                    });

                    id_gamme = parseInt(gamme_fournisseur[0]);
                    NatureDesTravaux = (gamme_fournisseur[2]);
                    Montant = parseFloat(gamme_fournisseur[2]);
                    gamme = await Gamme.findByPk(id_gamme);
                    let id_fournisseur = gamme.FournisseurID

                    await this.ajouterArtisanFournisseurProjet({
                        NatureDesTravaux,
                        Montant:appareil_gamme_fournisseur.prix,
                        ProjetID: projet_id,
                        DevistacheID: devis_id,
                        UtilisateurID: id_artisan
                    });


                }
               
              }
            });

          }
          
        
           
            
            
        
          // Retourner le prix total et la formule descriptive
          return true;
        }
        


      async add_datas_tache_14(donnees_json, devis_id, projet_id) {
          
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


     async add_datas_tache_15(donnees_json, devis_id, projet_id) {
         

          const artisan_chauffage = donnees_json["gammes-produits-renovation-electrique"].artisan_chauffage
          const artisan_mise_aux_normes = donnees_json["gammes-produits-renovation-electrique"].artisan_mise_aux_normes
          const artisan_mise_en_securite = donnees_json["gammes-produits-renovation-electrique"].artisan_mise_en_securite

          if(artisan_chauffage){
            let id_gamme = parseInt(artisan_chauffage.split(":")[0]);
            let NatureDesTravaux = (artisan_chauffage.split(":")[1]);
            let Montant = parseFloat(artisan_chauffage.split(":")[2]);
            console.log('artisan_chauffage',artisan_chauffage)

            const gamme = await Gamme.findByPk(id_gamme);

            let id_artisan = gamme.ArtisanID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });


           
          }

          if(artisan_mise_aux_normes){
            let id_gamme = parseInt(artisan_mise_aux_normes.split(":")[0]);
            let NatureDesTravaux = (artisan_mise_aux_normes.split(":")[1]);
            let Montant = parseFloat(artisan_mise_aux_normes.split(":")[2]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_artisan = gamme.ArtisanID

            //si id_artisan chercher une ligne de lui pour ce projet ArtisanFournisseurProjet et ce devis et ajouter prix a montant
            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });
            
          }

          if(artisan_mise_en_securite){
            let id_gamme = parseInt(artisan_mise_en_securite.split(":")[0]);
            let NatureDesTravaux = (artisan_mise_en_securite.split(":")[1]);
            let Montant = parseFloat(artisan_mise_en_securite.split(":")[2]);

            const gamme = await Gamme.findByPk(id_gamme);

            let id_artisan = gamme.ArtisanID

            await this.ajouterArtisanFournisseurProjet({
                NatureDesTravaux,
                Montant,
                ProjetID: projet_id,
                DevistacheID: devis_id,
                UtilisateurID: id_artisan
            });
           
          }

          return true

        }
      
      

  


      async add_datas_tache_16(donnees_json, devis_id, projet_id) {
        let formule = ""; // Stocke la formule explicative
        let prix = 0;
        let formule_marge='';
        let prix_marge = 0;
        
      
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


       
      
        // Retourner le prix total et la formule descriptive
        return true
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