const express = require('express');
const router = express.Router();

const Piece=require('../Piece')
const ProjetDevis = require('../ProjetDevis');
const Projet = require('../Projet'); 
const Tva=require('../Tva')
const DevisPiece=require('../DevisPiece')
const Utilisateur = require('../Utilisateur');
const Visite=require('../Visite')
const Paiement=require('../Paiement')
const DevisTache=require('../DevisTache')
const { Op } = require('sequelize');
require('dotenv').config();





router.get('/get_espace_membre_stats/:userId', async (req, res) => {

  try {

    const { userId } = req.params;

    const current_statusList = [
      'visite à régler',
      'visite programmée',
      'projet validé',
      'acompte payé',
      'travaux démarrés',
      'travaux en cours',
    ];
    const current_projects = await Projet.findAll({ 
      
      where: { 
        Status: { [Op.in]: current_statusList },
         [Op.or]: [
        { User_id: userId },
        { Client_id: userId },
      ] } 
    });


    const ended_statusList = [
      'travaux achevés',
      'travaux livrés'
    ];
    const ended_projects = await Projet.findAll({ 
    
      where: { 
         Status: { [Op.in]: ended_statusList },
        [Op.or]: [
          { User_id: userId },
          { Client_id: userId }
        ] 
      }  
    });


    const to_visite_projets = await Projet.findAll({
      where: { 
        User_id: userId,
        Payed: 0,
        VisiteID: { [Op.ne]: null }
       },
      
    });

    const all_projets = await Projet.findAll({
      where: { 
        User_id: userId,
       },
      
    });

    let all_paiements = [];
    let to_pay_paiements = [];

    for (const projet of all_projets) {

      const all_paiements_projet = await Paiement.findAll({
        where: { projetID: projet.Id }
      });

      const to_pay_paiements_projet = await Paiement.findAll({
        where: {
          projetID: projet.Id,
          Status: 0
        }
      });

      all_paiements.push(...all_paiements_projet);
      to_pay_paiements.push(...to_pay_paiements_projet);
    }


    

    let json_result = {
      'all_paiements':all_paiements,
      'to_pay_paiements':to_pay_paiements,
      'to_visite_projets':to_visite_projets,
      'ended_projects':ended_projects,
      'current_projects':current_projects,
    }

    return res.status(200).json(json_result);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});

module.exports = router;
