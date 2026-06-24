const express = require('express');
const router = express.Router();
const Role = require('../Role');
const crypto = require('crypto');
const Utilisateur = require('../Utilisateur');
const Visite = require('../Visite');
const DevisCalculator = require('../services/DevisCalculator');

const Travail=require('../Travail')
const Tva=require('../Tva')
const Pointcle=require('../Pointcle')
const Avis=require('../Avis')
const Gamme=require('../Gamme')
const ejs = require('ejs');
const TacheGenerale=require('../TacheGenerale')
const DevisPiece=require('../DevisPiece')
const DevisTacheHistorique=require('../DevisTacheHistorique')
const DevisTache=require('../DevisTache')
const Page=require('../Page')

const Piece=require('../Piece')
const ProjetDevis = require('../ProjetDevis');
const cors = require('cors');
const Projet = require('../Projet'); 
const Autorisation = require('../Autorisation'); // Importez le modèle Grade





const { Op,Sequelize } = require('sequelize');







router.get('/get_no_payed_project_by_user/:user_id/:device_id', async (req, res) => {
  const { device_id,user_id } = req.params;
  try {
     const project = await Projet.findOne({
      where: {
        Payed: 0,
        [Op.or]: [
          { Client_id: user_id }
        ]
        
      },
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: Visite },
        {
          model: DevisPiece,
          as: 'Devis',
          include: [
            {
              model: DevisTache,
              include: [Travail]
            },
            { model: Tva },
            { model: Piece },
            { model: Utilisateur }
          ]
        }
      ]
    });

    if (project) {
      res.status(200).json(project);
    } else {
      res.status(404).json({ message: 'No records found for the provided username and IP address' });
    }
  } catch (error) {
    console.error('Error retrieving DevisPiece records:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



router.get('/get_all_projects_to_pay_visit_by_user/:user_id/:device_id', async (req, res) => {
  const { device_id,user_id } = req.params;
  try {
     const project = await Projet.findOne({
      where: {
        Payed: 0,
        VisiteID: null,
        [Op.or]: [
          { Client_id: user_id }
        ]
        
      },
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: Visite },
        {
          model: DevisPiece,
          as: 'Devis',
          include: [
            {
              model: DevisTache,
              include: [Travail]
            },
            { model: Tva },
            { model: Piece },
            { model: Utilisateur }
          ]
        }
      ]
    });

    if (project) {
      res.status(200).json(project);
    } else {
      res.status(404).json({ message: 'No records found for the provided username and IP address' });
    }
  } catch (error) {
    console.error('Error retrieving DevisPiece records:', error);
    res.status(500).json({ error: 'Server error' });
  }
});




router.get('/get_all_project_to_pay_acompt_by_user/:user_id/:device_id', async (req, res) => {
  const { device_id,user_id } = req.params;
  try {
     const project = await Projet.findOne({
      where: { 
        Valider:1,
        Status:'projet validé',
        [Op.or]: [
          { Client_id: user_id }
        ]
       },
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: Visite },
        {
          model: DevisPiece,
          as: 'Devis',
          include: [
            {
              model: DevisTache,
              include: [Travail]
            },
            { model: Tva },
            { model: Piece },
            { model: Utilisateur }
          ]
        }
      ]
    });

    if (project) {
      res.status(200).json(project);
    } else {
      res.status(404).json({ message: 'No records found for the provided username and IP address' });
    }
  } catch (error) {
    console.error('Error retrieving project records:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/get_one_no_visited_project_by_user/:device_id/:user_id', async (req, res) => {
  const { device_id,user_id } = req.params;
  try {

    const project = await Projet.findOne({
      where: { Client_id: user_id,Status:'visite à régler' },
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: Visite },
        {
          model: DevisPiece,
          as: 'Devis',
          include: [
            {
              model: DevisTache,
              include: [Travail]
            },
            { model: Tva },
            { model: Piece },
            { model: Utilisateur }
          ]
        }
      ]
    });

    if (project) {
      res.status(200).json(project);
    } else {
      res.status(404).json({ message: 'No records found for the provided username and IP address' });
    }
  } catch (error) {
    console.error('Error retrieving project records:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/get_current_project_piece_by_user/:device_id/:user_id', async (req, res) => {
  const { device_id,user_id } = req.params;
  try {
     const project = await Projet.findOne({
      where: { Client_id: user_id,DeviceID:device_id,Status:'acompte payé' },
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: Visite },
        {
          model: DevisPiece,
          as: 'Devis',
          include: [
            {
              model: DevisTache,
              include: [Travail]
            },
            { model: Tva },
            { model: Piece },
            { model: Utilisateur }
          ]
        }
      ]
    });

    if (project) {
      res.status(200).json(project);
    } else {
      res.status(404).json({ message: 'No records found for the provided username and IP address' });
    }
  } catch (error) {
    console.error('Error retrieving project records:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/get_no_payed_devis_piece', async (req, res) => {
  const { username, ip } = req.body;
console.log({ username, ip })
  try {
    const devisPieces = await DevisPiece.findAll({
      where: {
        Payed: 0,
        Username: username,
        AdresseIP: ip
      },include: [
        {
          model: DevisTache,
          include: [Travail]
        },
        {
          model: Piece
        }
      ]
    });

    if (devisPieces.length > 0) {
      res.status(200).json(devisPieces);
    } else {
      res.status(404).json({ message: 'No records found for the provided username and IP address' });
    }
  } catch (error) {
    console.error('Error retrieving DevisPiece records:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/get_user_Projects/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const projects = await Projet.findAll({
      where: { Client_id: uid },
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: DevisPiece, through: { model: ProjetDevis }, as: 'Devis',include: [{ model: Tva },]  }
      ]
    });
    


    res.status(200).json(projects);
  } catch (error) {
    console.error('Erreur lors de la récupération des devis :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/get_all_devis_piece', async (req, res) => {
  try {
    const devisPieces = await DevisPiece.findAll({
      include: [
        {
          model: DevisTache,
          include: [Travail]
        },
        {
          model: Piece
        },
        {
          model: Utilisateur
        }
      ]
    });

    if (!devisPieces || devisPieces.length === 0) {
      return res.status(404).json({ error: 'Aucun devis trouvé' });
    }

    res.status(200).json(devisPieces);
  } catch (error) {
    console.error('Erreur lors de la récupération des devis :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/get_all_devis_piece_with_projects', async (req, res) => {
  try {
    const devisPieces = await DevisPiece.findAll({
      include: [
        {
          model: DevisTache,
          include: [Travail]
        },
        {
          model: Piece
        },
        {
          model: Utilisateur
        },
        {
          model: Tva
        },
        {
          model: Projet,
          as: 'Projets',          // 👈 OBLIGATOIRE (alias)
          through: { attributes: [] } // optionnel : masque la table pivot
        }
      ]
    });

    if (!devisPieces || devisPieces.length === 0) {
      return res.status(404).json({ error: 'Aucun devis trouvé' });
    }

    res.status(200).json(devisPieces);
  } catch (error) {
    console.error('Erreur lors de la récupération des devis :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});




router.delete('/delete_devis_piece/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDevisPiece = await DevisPiece.findByPk(id);

    if (!deletedDevisPiece) {
      return res.status(404).json({ error: 'Devis pièce non trouvé' });
    }

    await deletedDevisPiece.destroy();
    res.status(204).end(); // 204 No Content: succès de la suppression
  } catch (error) {
    console.error('Erreur lors de la suppression du devis pièce :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du devis pièce' });
  }
});

router.put('/update_devis_piece/:id', async (req, res) => {
  const { id } = req.params;
  const updatedDevis = req.body;
  const sequelize = require('../config/database');

  const t = await sequelize.transaction();

  try {
    const devis = await DevisPiece.findByPk(id, { transaction: t });

    if (!devis) {
      await t.rollback();
      return res.status(404).json({ error: 'Devis non trouvé' });
    }
    console.log('tva ',updatedDevis.TvaID)

    // 1️⃣ Mettre à jour les champs simples
    devis.set({
      Utilisateur: updatedDevis.Utilisateur,
      AdresseIP: updatedDevis.AdresseIP,
      Date: updatedDevis.Date,
      Commentaire: updatedDevis.Commentaire,
      Prix: updatedDevis.Prix,
      Payed: updatedDevis.Payed,
      VisiteFaite: updatedDevis.VisiteFaite,
      VisiteID: updatedDevis.VisiteID,
      TvaID: updatedDevis.TvaID,
      UtilisateurID: updatedDevis.UtilisateurID
    });

    await devis.save({ transaction: t });

    // 2️⃣ Mettre à jour les artisans associés si fournis
    if (Array.isArray(updatedDevis.selected_artisans)) {
      // Supprimer les anciens
      await devis.setArtisans([], { transaction: t });  

      // Ajouter les nouveaux
      await devis.addArtisans(updatedDevis.selected_artisans, { transaction: t });
    }

    await t.commit();

    // Recharger le devis avec les artisans inclus
    const result = await DevisPiece.findByPk(id, {
      include: [{ model: Utilisateur, as: 'Artisans' }],
    });

    return res.status(200).json(result);

  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la mise à jour du devis :', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});


router.put('/update_commentaire_devis_piece/:id', async (req, res)  => {
  const { id } = req.params;
  const updatedDevis = req.body;
  try {
    const devis = await DevisPiece.findByPk(id);

    if (!devis) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }
    devis.Commentaire = updatedDevis.Commentaire;
    devis.Titre = updatedDevis.Titre;
    // Sauvegarder les modifications
    await devis.save();
    return res.status(200).json(devis);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du devis :', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/update_devis_tache/:id', async (req, res) => {
  const { id } = req.params;
  const updatedDevisTache = req.body;

  try {
    const devisTache = await DevisTache.findByPk(id);

    if (!devisTache) {
      return res.status(404).json({ error: 'DevisTache non trouvé' });
    }

    // Mettre à jour les champs nécessaires
    devisTache.Prix = updatedDevisTache.Prix;
    devisTache.Donnees = updatedDevisTache.Donnees;

    // Sauvegarder les modifications
    await devisTache.save();

    const devisPiece = await DevisPiece.findByPk(devisTache.DevisPieceID, {
      include: [
        {
          model: DevisTache,
          include: [Travail]
        },
        {
          model: Piece
        }
      ]
    });

    if (!devisPiece) {
      return res.status(404).json({ error: 'DevisPiece non trouvé' });
    }

    const calculator = new DevisCalculator();
    await calculator.init();
    let total = 0;
   
    for (const travail of devisPiece.DevisTaches) {
      const donnees = {
        formulaire: JSON.parse(travail.Donnees),
        nomtache: travail.TravailSlug
      };

      const newHistorique = await DevisTacheHistorique.create({
        TacheID: id, // ID de la tâche concernée
        Date: new Date(), // date actuelle
        Donnees: JSON.parse(travail.Donnees),
      });

      const result = await calculator.calculer_prix(travail.TravailID, donnees,travail.DevisPieceID);

      const prix = parseFloat(result?.prix ?? 0);
      const prix_ht = parseFloat(result?.prix_ht ?? 0);
      travail.Prix = prix_ht;
      await travail.save();
      total += prix_ht;
       console.log("prix ",prix_ht)
    }

    devisPiece.Prix = total;
   

    

    // Sauvegarder les modifications
    await devisPiece.save();

    return res.status(200).json({ devisTache, devisPiece });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la DevisTache :', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});



router.get('/get_historique_devis_tache/:tache_id', async (req, res) => {
  const { tache_id } = req.params;
  

  try {
    const historiques = await DevisTacheHistorique.findAll({
      where: { TacheID: tache_id },       // id = ID de la tâche recherchée
      order: [['Date', 'DESC']]     // tri décroissant par Date
    });



    return res.status(200).json( historiques );
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la DevisTache :', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/restaurer_devis_tache/:id_tache/:id_historique', async (req, res) => {
   const { id_tache,id_historique } = req.params;
   try {
    const historique = await DevisTacheHistorique.findByPk(id_historique);
    const devistache = await DevisTache.findByPk(id_tache);

    if (!devistache) {
      return res.status(404).json({ error: 'Devis tache non trouvé' });
    }
    devistache.Donnees =  JSON.parse(historique.Donnees);
    // Sauvegarder les modifications
    await devistache.save();


    return res.status(200).json( devistache );
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la DevisTache :', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }

});


module.exports = router;
