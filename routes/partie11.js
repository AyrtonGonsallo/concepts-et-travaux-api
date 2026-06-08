const express = require('express');
const router = express.Router();
const Utilisateur = require('../Utilisateur');
const Visite=require('../Visite')
const Paiement=require('../Paiement')
const Parametre=require('../Parametre')
const ModeleEquipement=require('../ModeleEquipement')
const Gamme=require('../Gamme')
const TacheGenerale=require('../TacheGenerale')
const DevisPiece=require('../DevisPiece')
const Projet=require('../Projet')
const DevisTache=require('../DevisTache')
const path = require('path');
const ejs = require('ejs');
const { Op } = require('sequelize');
const xlsx = require('xlsx');
const { parse } = require('json2csv');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAILS_HOST,
  port: Number(process.env.MAILS_PORT),
  secure: process.env.MAILS_PORT == 465, // true si 465
  auth: {
    user: process.env.MAILS_USER,
    pass: process.env.MAILS_PASSWORD
  }
});


router.put('/valider_devis_piece/:id', async (req, res)  => {
  const { id } = req.params;
  try {
    const devis = await DevisPiece.findByPk(id);
    if (!devis) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }
    // Mettre à jour les champs nécessaire
    devis.Payed = 1;
    // Sauvegarder les modifications
    await devis.save();

    return res.status(200).json(devis);
  } catch (error) {
    console.error('Erreur lors de la validation du devis :', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});
router.post('/add_gamme', async (req, res) => {
  try {
      const gamme = await Gamme.create(req.body);
      res.status(201).json(gamme);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
router.get('/get_gammes', async (req, res) => {
  try {
    const gammes = await Gamme.findAll();
    res.status(200).json(gammes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/get_gammes_sans_equipements', async (req, res) => {
  try {
    const listeIds = [2, 7, 13, 15, 16, 12]; // tes IDs Travail
    const gammes = await Gamme.findAll({
      where: {
        TravailID: {
          [Op.notIn]: listeIds
        }
      }
    });
    res.status(200).json(gammes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/get_equipements_gammes', async (req, res) => {
  try {
    const listeIds = [2, 7, 13, 15, 16, 12]; // tes IDs Travail

    const equipements_gammes = await Gamme.findAll({
      where: {
        TravailID: {
          [Op.in]: listeIds
        }
      }
    });
    res.status(200).json(equipements_gammes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/get_gamme/:id', async (req, res) => {
  try {
    const gamme = await Gamme.findByPk(req.params.id);
    if (gamme) {
      res.status(200).json(gamme);
    } else {
      res.status(404).json({ error: 'Gamme not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/update_gamme/:id', async (req, res) => {
  try {
    const dataToUpdate = { ...req.body };

// Forcer explicitement null si FournisseurID ou GammeDeReferenceID ne sont pas valides (> 0)
dataToUpdate.FournisseurID = (dataToUpdate.FournisseurID > 0) ? dataToUpdate.FournisseurID : null;
dataToUpdate.GammeDeReferenceID = (dataToUpdate.GammeDeReferenceID > 0) ? dataToUpdate.GammeDeReferenceID : null;

// Mise à jour de la Gamme
const [updated] = await Gamme.update(dataToUpdate, {
  where: { ID: req.params.id }
});
    if (updated) {
      const updatedGamme = await Gamme.findByPk(req.params.id);
      res.status(200).json(updatedGamme);
    } else {
      res.status(404).json({ error: 'Gamme not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete_gamme/:id', async (req, res) => {
  try {
    const deleted = await Gamme.destroy({
      where: { ID: req.params.id }
    });
    if (deleted) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: 'Gamme not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Endpoint to fetch gammes by travailID and type
router.get('/get_gammes_by_type_and_travailID/:tid/:type', async (req, res) => {
  const { tid, type } = req.params;
  
  try {
    const gammes = await Gamme.findAll({
      where: {
        TravailID: tid,
        Type: type,
        ActiverFournisseur:false
      },
      order: [['Ordre', 'ASC']]
    });
    res.status(200).json(gammes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch gammes by travailID and type
router.get('/get_artisans_fournisseurs_by_refID/:refId/:type', async (req, res) => {
  const { refId, type } = req.params;
  let alias = ''

  try {

    let roleId = null;

    if (type === 'artisan') {
      roleId = 17;
      alias = 'Artisan'
    } else if (type === 'fournisseur') {
      roleId = 15;
      alias = 'Fournisseur'
    } else {
      return res.status(400).json({
        error: 'Type invalide. Valeurs autorisées : artisan, fournisseur'
      });
    }

    console.log('refId',refId)
    console.log('roleId',roleId)
    console.log('type',type)
    console.log('alias',alias)

    const gammes = await Gamme.findAll({
      where: {
        GammeDeReferenceID: refId,
        ActiverFournisseur: 1
      },
      include: [
        {
          model: Utilisateur,
          as: alias,
          where: {
            RoleId: roleId
          },
          required: true
        },
        
      ]
    });

    res.status(200).json(gammes);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





// Endpoint to fetch gammes by label reference and type
router.get('/get_artisans_fournisseurs_modeles_by_refID/:refID/:type', async (req, res) => {
  const { refID, type } = req.params;
  let alias = ''

  try {

    let roleId = null;

    if (type === 'artisan') {
      roleId = 17;
      alias = 'Artisan'
    } else if (type === 'fournisseur') {
      roleId = 15;
      alias = 'Fournisseur'
    } else {
      return res.status(400).json({
        error: 'Type invalide. Valeurs autorisées : artisan, fournisseur'
      });
    }

  
    console.log('refId',refID)
    console.log('roleId',roleId)
    console.log('type',type)
    console.log('alias',alias)

    

    const modeles = await ModeleEquipement.findAll({
      where: {
        ModeleDeReferenceID: refID,
        ActiverFournisseur: 1
      },
      include: [
        {
          model: Utilisateur,
          as: alias,
          where: {
            RoleId: roleId
          },
          required: true
        },
        
      ]
    });

    res.status(200).json(modeles);

  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: error.message });
  }
});



// Endpoint to fetch gammes by travailID and type
router.get('/get_ordered_gammes_by_type_and_travailID/:tid/:type', async (req, res) => {
  const { tid, type } = req.params;
  
  try {
    const gammes = await Gamme.findAll({
      where: {
        TravailID: tid,
        Type: type,
        ActiverFournisseur:false
      },
      order: [
        ['Ordre', 'ASC'], // Tri par Titre en ordre croissant
        ['Label', 'ASC']
      ]
    });
    res.status(200).json(gammes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.post('/add_tache_generale', async (req, res) => {
  try {
      const tache_generale = await TacheGenerale.create(req.body);
      res.status(201).json(tache_generale);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
router.get('/get_tache_generales', async (req, res) => {
  try {
    const tache_generales = await TacheGenerale.findAll();
    res.status(200).json(tache_generales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/get_tache_generale/:id', async (req, res) => {
  try {
    const tache_generale = await TacheGenerale.findByPk(req.params.id);
    if (tache_generale) {
      res.status(200).json(tache_generale);
    } else {
      res.status(404).json({ error: 'TacheGenerale not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/update_tache_generale/:id', async (req, res) => {
  try {
    const [updated] = await TacheGenerale.update(req.body, {
      where: { ID: req.params.id }
    });
    if (updated) {
      const updatedTacheGenerale = await TacheGenerale.findByPk(req.params.id);
      res.status(200).json(updatedTacheGenerale);
    } else {
      res.status(404).json({ error: 'TacheGenerale not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete_tache_generale/:id', async (req, res) => {
  try {
    const deleted = await TacheGenerale.destroy({
      where: { ID: req.params.id }
    });
    if (deleted) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: 'TacheGenerale not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
