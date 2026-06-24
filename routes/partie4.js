const express = require('express');
const router = express.Router();
const Role = require('../Role');
const crypto = require('crypto');
const Utilisateur = require('../Utilisateur');
const RoleAutorisation = require('../RoleAutorisation');
const Visite=require('../Visite')

const Tva=require('../Tva')
const Travail=require('../Travail')

const ejs = require('ejs');
const TacheGenerale=require('../TacheGenerale')
const DevisPiece=require('../DevisPiece')
const DevisTache=require('../DevisTache')

const Realisation=require('../Realisation')
const Piece=require('../Piece')
const ProjetDevis = require('../ProjetDevis');
const cors = require('cors');
const Projet = require('../Projet'); 
const Autorisation = require('../Autorisation'); // Importez le modèle Grade




const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Nombre de "sauts" pour générer le sel
const fs = require('fs');
const mime = require('mime-types');
const nodemailer = require('nodemailer');
const { Op,Sequelize } = require('sequelize');
const Stripe = require('stripe');
const bodyParser = require('body-parser');

// Définir le chemin du répertoire contenant les fichiers
const filesDirectory = path.join(__dirname,'..', 'files');
// Créer un transporteur SMTP réutilisable pour envoyer des e-mails via https://homeren.fr/
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

  


function cleanFilePath(filePath) {
  return filePath.replace(/^.*\\fakepath\\/, '');
}

// Définir le point de terminaison pour modifier un projet
router.put('/update_project/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Status,Valider, Description,Date_de_debut_des_travaux,Date_de_fin_des_travaux,Date_de_fin_gpa, Artisans,Devis } = req.body;

    const project = await Projet.findByPk(id);

    if (project) {
      project.Status = Status;
      project.Valider = Valider;
      project.Description = Description;
      project.Date_de_debut_des_travaux = Date_de_debut_des_travaux;
      project.Date_de_fin_des_travaux = Date_de_fin_des_travaux;
      project.Date_de_fin_gpa = Date_de_fin_gpa;

      await project.save();
      // Mettre à jour les artisans associés au projet
      
      await ProjetDevis.destroy({ where: { projet_id: project.Id } });
      if (Devis && Devis.length > 0) {
        // Supprimer les devisPromises actuels
        
        // Ajouter les nouveaux devisPromises
        const devisPromises = Devis.map(devisId => 
          ProjetDevis.create({
            projet_id: project.Id,
            devis_id: devisId
          })
        );
        await Promise.all(devisPromises);
      }

      // Récupérer le projet avec les associations pour la réponse
      const updatedProject = await Projet.findOne({
        where: { Id: project.Id },
        include: [
          { model: Utilisateur, as: 'Utilisateur' },
          { model: Utilisateur, as: 'Client' },
        ]
      });

      res.status(200).json(updatedProject);
    } else {
      res.status(404).json({ error: 'Project not found.' });
    }
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'An error occurred while updating the project.' });
  }
});
// Définir le point de terminaison pour supprimer un projet
router.delete('/delete_project/:id', async (req, res) => {
    const sequelize = require('../config/database');  
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const projet = await Projet.findByPk(id, {
      include: [{
        model: DevisPiece,
        as: 'Devis',
        attributes: ['ID']
      }],
      transaction
    });

    if (!projet) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Project not found.' });
    }

    // IDs des devis liés
    const devisIds = projet.Devis.map(d => d.ID);

    // 1️⃣ supprimer la table pivot
    await ProjetDevis.destroy({
      where: { projet_id: id },
      transaction
    });

    // 2️⃣ supprimer les devis
    if (devisIds.length) {
      await DevisPiece.destroy({
        where: { ID: devisIds },
        transaction
      });
    }

    // 3️⃣ supprimer le projet
    await projet.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({ message: 'Project and related devis deleted successfully.' });

  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'An error occurred while deleting the project.' });
  }
});



router.get('/get_project/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Projet.findOne({
      where: { Id: id },
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
            { model: Piece },
            { model: Tva },
            { model: Utilisateur }
          ]
        }
      ]
    });

    if (project) {
      res.status(200).json(project);
    } else {
      res.status(404).json({ error: 'Project not found.' });
    }
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'An error occurred while fetching the project.' });
  }
});


// Définissez la route pour récupérer les rôles avec leurs autorisations associées
router.get('/get_projects', async (req, res) => {
  try {
    // Récupérez tous les Projets avec leurs autorisations associées
    const projets = await Projet.findAll({
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
            { model: Piece },
            { model: Tva },
            { model: Utilisateur }
          ]
        }
      ],
      order: [['Date_de_creation', 'DESC']]
    });

    // Répondez avec les rôles récupérés au format JSON
    res.json(projets);
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Définir le point de terminaison pour récupérer la liste des projets
router.get('/get_all_projects', async (req, res) => {
  try {
    const projects = await Projet.findAll({
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
            { model: Piece },
            { model: Tva },
            { model: Utilisateur }
          ]
        }
      ]
    });    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'An error occurred while fetching the projects.' });
  }
});

// Définir le point de terminaison pour récupérer la liste des projets d'un utilisateur
router.get('/get_user_projects/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const projects = await Projet.findAll({ 
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: DevisPiece, as: 'Devis' ,include: [{ model: Tva },]  }
      ],
      where: {  [Sequelize.Op.or]: [
        { User_id: userId },
        { Client_id: userId },
      ] } });

    if (projects.length > 0) {
      res.status(200).json(projects);
    } else {
      res.status(404).json({ error: 'No projects found for the user.' });
    }
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'An error occurred while fetching user projects.' });
  }
});


// Définir le point de terminaison pour récupérer la liste des projets d'un utilisateur
router.get('/get_current_user_projects/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const statusList = [
      'visite à régler',
      'visite réglée',
    'visite programmée',
    'projet validé',
    'acompte payé',
    'travaux démarrés',
    'travaux en cours',
    ];
    const projects = await Projet.findAll({ 
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: DevisPiece, as: 'Devis' }
      ],
      where: { 
        Status: { [Op.in]: statusList },
         [Sequelize.Op.or]: [
        { User_id: userId },
        { Client_id: userId },
      ] } });

    if (projects.length > 0) {
      res.status(200).json(projects);
    } else {
      res.status(404).json({ error: 'No projects found for the user.' });
    }
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'An error occurred while fetching user projects.' });
  }
});



// Définir le point de terminaison pour récupérer la liste des projets d'un utilisateur
router.get('/get_ended_user_projects/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
const statusList = [
      'travaux achevés',
    'travaux livrés'
    ];
    const projects = await Projet.findAll({ 
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: DevisPiece, as: 'Devis' }
      ],
      where: { 
         Status: { [Op.in]: statusList },
        [Sequelize.Op.or]: [
        { User_id: userId },
        { Client_id: userId }
            ] } });

    if (projects.length > 0) {
      res.status(200).json(projects);
    } else {
      res.status(404).json({ error: 'No projects found for the user.' });
    }
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'An error occurred while fetching user projects.' });
  }
});



// Définir le point de terminaison pour récupérer la liste des projets d'un utilisateur
router.get('/get_visits_by_user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const projets = await Projet.findAll({
      where: { 
        User_id: userId,
        Payed: 0,
        VisiteID: { [Op.ne]: null }
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

    if (projets.length > 0) {
      res.status(200).json(projets);
    } else {
      res.status(404).json({ error: 'No devisAvecVisite found for the user.' });
    }
  } catch (error) {
    console.error('Error fetching user devisAvecVisite:', error);
    res.status(500).json({ error: 'An error occurred while fetching user devisAvecVisite.' });
  }
});


// Endpoint POST pour modifier un particulier
router.post('/update_particulier/:id', async (req, res) => {
  try {
    const userId = req.params.id; // Récupérer l'ID de l'utilisateur à mettre à jour
    const { RaisonSociale, NumeroSIRET, Nom, Prenom, Email, Password, Telephone, AdressePostale,CodePostal,CommunePostale, Activite, CA, Effectif, References, QuestionnaireTarif, AssuranceRCDecennale, KBis,CategorieArtisan,CategorieFournisseur, RoleId,Commentaire } = req.body;

    // Vérifier si l'utilisateur existe dans la base de données
    const utilisateur = await Utilisateur.findByPk(userId);

    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
// Utilisez la fonction cleanFilePath pour nettoyer les chemins d'accès des fichiers
const cleanedQuestionnaireTarif = cleanFilePath(QuestionnaireTarif);
const cleanedAssuranceRCDecennale = cleanFilePath(AssuranceRCDecennale);
const cleanedKBis = cleanFilePath(KBis);
console.log(cleanedQuestionnaireTarif)
    // Définir un objet pour stocker les données à mettre à jour
    // Définir un objet pour stocker les données à mettre à jour
    const updateData = {
      RaisonSociale,
      NumeroSIRET,
      Nom,
      Prenom,
      Email,
      Telephone,
      AdressePostale,
      CodePostal,
      CommunePostale,
      Activite,
      CA,
      Effectif,
      References,
      CategorieArtisan,
      CategorieFournisseur,
      RoleId, // Mettez à jour le rôle de l'utilisateur
      Commentaire
    };

    // Utilisez la fonction cleanFilePath pour nettoyer les chemins d'accès des fichiers
    if (QuestionnaireTarif) {
      const cleanedQuestionnaireTarif = cleanFilePath(QuestionnaireTarif);
      updateData.QuestionnaireTarif = cleanedQuestionnaireTarif;
    }

    if (AssuranceRCDecennale) {
      const cleanedAssuranceRCDecennale = cleanFilePath(AssuranceRCDecennale);
      updateData.AssuranceRCDecennale = cleanedAssuranceRCDecennale;
    }

    if (KBis) {
      const cleanedKBis = cleanFilePath(KBis);
      updateData.KBis = cleanedKBis;
    }

    // Hasher le mot de passe si un nouveau mot de passe est fourni
    if (Password!="000") {
      const hashedPassword = await bcrypt.hash(Password, saltRounds);
      updateData.Password = hashedPassword;
    }

    // Mettre à jour les informations de l'utilisateur
    await utilisateur.update(updateData);

    // Répondre avec l'utilisateur mis à jour
    res.status(200).json(utilisateur);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint POST pour modifier un utilisateur et ses rôles
router.post('/update_utilisateur/:id', async (req, res) => {
  try {
    const userId = req.params.id; // Récupérer l'ID de l'utilisateur à mettre à jour
    const { RaisonSociale, NumeroSIRET, Nom, Prenom, Email, Password, Telephone, AdressePostale, Activite, CA, Effectif, References, QuestionnaireTarif, AssuranceRCDecennale, KBis,CategorieArtisan,CategorieFournisseur, RoleId } = req.body;

    // Vérifier si l'utilisateur existe dans la base de données
    const utilisateur = await Utilisateur.findByPk(userId);

    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
// Utilisez la fonction cleanFilePath pour nettoyer les chemins d'accès des fichiers
const cleanedQuestionnaireTarif = cleanFilePath(QuestionnaireTarif);
const cleanedAssuranceRCDecennale = cleanFilePath(AssuranceRCDecennale);
const cleanedKBis = cleanFilePath(KBis);
console.log(cleanedQuestionnaireTarif)
    // Définir un objet pour stocker les données à mettre à jour
    // Définir un objet pour stocker les données à mettre à jour
    const updateData = {
      RaisonSociale,
      NumeroSIRET,
      Nom,
      Prenom,
      Email,
      Telephone,
      AdressePostale,
      Activite,
      CA,
      Effectif,
      References,
      CategorieArtisan,
      CategorieFournisseur,
      RoleId // Mettez à jour le rôle de l'utilisateur
    };

    // Utilisez la fonction cleanFilePath pour nettoyer les chemins d'accès des fichiers
    if (QuestionnaireTarif) {
      const cleanedQuestionnaireTarif = cleanFilePath(QuestionnaireTarif);
      updateData.QuestionnaireTarif = cleanedQuestionnaireTarif;
    }

    if (AssuranceRCDecennale) {
      const cleanedAssuranceRCDecennale = cleanFilePath(AssuranceRCDecennale);
      updateData.AssuranceRCDecennale = cleanedAssuranceRCDecennale;
    }

    if (KBis) {
      const cleanedKBis = cleanFilePath(KBis);
      updateData.KBis = cleanedKBis;
    }

    // Hasher le mot de passe si un nouveau mot de passe est fourni
    if (Password!="000") {
      const hashedPassword = await bcrypt.hash(Password, saltRounds);
      updateData.Password = hashedPassword;
    }

    // Mettre à jour les informations de l'utilisateur
    await utilisateur.update(updateData);

    // Répondre avec l'utilisateur mis à jour
    res.status(200).json(utilisateur);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


router.get('/clear_questionnaire_tarif/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe dans la base de données
    const utilisateur = await Utilisateur.findByPk(userId);

    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour le champ QuestionnaireTarif à vide
    utilisateur.QuestionnaireTarif = '';

    // Sauvegarder les modifications
    await utilisateur.save();

    res.status(200).json({ message: 'QuestionnaireTarif mis à vide avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/clear_assurance_rc_decennale/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe dans la base de données
    const utilisateur = await Utilisateur.findByPk(userId);

    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour le champ AssuranceRCDecennale à vide
    utilisateur.AssuranceRCDecennale = '';

    // Sauvegarder les modifications
    await utilisateur.save();

    res.status(200).json({ message: 'AssuranceRCDecennale mis à vide avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/clear_kbis/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe dans la base de données
    const utilisateur = await Utilisateur.findByPk(userId);

    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour le champ KBis à vide
    utilisateur.KBis = '';

    // Sauvegarder les modifications
    await utilisateur.save();

    res.status(200).json({ message: 'KBis mis à vide avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});





// Définissez la route pour récupérer les rôles avec leurs autorisations associées
router.get('/get_roles', async (req, res) => {
  try {
    // Récupérez tous les rôles avec leurs autorisations associées
    const roles = await Role.findAll({
      include: {
        model: Autorisation,
        through: {
          attributes: [] // Excluez les attributs de la table de liaison RoleAutorisation
        }
      }
    });

    // Répondez avec les rôles récupérés au format JSON
    res.json(roles);
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint GET pour récupérer un rôle par son ID avec ses autorisations associées
router.get('/get_role/:id', async (req, res) => {
  try {
    // Récupérer l'ID du rôle spécifié dans les paramètres d'URL
    const roleId = req.params.id;

    // Récupérer le rôle spécifique par son ID avec ses autorisations associées
    const role = await Role.findByPk(roleId, {
      include: {
        model: Autorisation,
        through: {
          attributes: [] // Exclure les attributs de la table de liaison RoleAutorisation
        }
      }
    });

    // Vérifier si le rôle existe
    if (!role) {
      return res.status(404).json({ error: 'Rôle non trouvé' });
    }

    // Répondre avec le rôle récupéré au format JSON
    res.json(role);
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint GET pour récupérer toutes les autorisations
router.get('/get_autorisations', async (req, res) => {
  try {
      // Récupérer toutes les autorisations
      const autorisations = await Autorisation.findAll();

      res.status(200).json(autorisations);
  } catch (error) {
      console.error('Erreur lors de la récupération des autorisations :', error);
      res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint GET pour récupérer un ensemble d'autorisations par ID
router.get('/get_autorisations/:ids', async (req, res) => {
  try {
    const ids = req.params.ids.split(','); // Séparer les IDs par une virgule s'ils sont fournis sous forme de liste
    
    // Récupérer les autorisations par ID
    const autorisations = await Autorisation.findAll({
      where: {
        Id: ids
      }
    });

    res.status(200).json(autorisations);
  } catch (error) {
    console.error('Erreur lors de la récupération des autorisations :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint GET pour récupérer un ensemble d'autorisations par ID
router.get('/get_utilisateurs/:ids', async (req, res) => {
  try {
    const ids = req.params.ids.split(','); // Séparer les IDs par une virgule s'ils sont fournis sous forme de liste
    
    // Récupérer les autorisations par ID
    const utilisateurs = await Utilisateurs.findAll({
      where: {
        Id: ids
      }
    });

    res.status(200).json(utilisateurs);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// Endpoint POST pour modifier un particulier
router.post('/update_fournisseur/:id', async (req, res) => {
  try {
    const userId = req.params.id; // Récupérer l'ID de l'utilisateur à mettre à jour
    const { RaisonSociale, NumeroSIRET, Nom, Prenom, Email, Password, Telephone, AdressePostale,CodePostal,CommunePostale, Activite, CA, Effectif, References,Qualifications,ZoneGeographiqueDactivite,NomDirigeant } = req.body;

    // Vérifier si l'utilisateur existe dans la base de données
    const utilisateur = await Utilisateur.findByPk(userId);

    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }


    // Définir un objet pour stocker les données à mettre à jour
    const updateData = {
      RaisonSociale,
      NumeroSIRET,
      Nom,
      Prenom,
      Email,
      Telephone,
      AdressePostale,
      CodePostal,
      CommunePostale,
      Activite,
      CA,
      Effectif,
      References,
      Qualifications,ZoneGeographiqueDactivite,NomDirigeant
    };

    

    // Hasher le mot de passe si un nouveau mot de passe est fourni
    if (Password!="000") {
      const hashedPassword = await bcrypt.hash(Password, saltRounds);
      updateData.Password = hashedPassword;
    }

    // Mettre à jour les informations de l'utilisateur
    await utilisateur.update(updateData);

    // Répondre avec l'utilisateur mis à jour
    res.status(200).json(utilisateur);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// Endpoint GET pour récupérer une autorisation par son ID
router.get('/get_autorisation/:id', async (req, res) => {
  try {
      // Récupérer l'ID de l'autorisation à partir des paramètres de la requête
      const autorisationId = req.params.id;

      // Recherche de l'autorisation par son ID
      const autorisation = await Autorisation.findByPk(autorisationId);

      // Vérifier si l'autorisation existe
      if (!autorisation) {
          return res.status(404).json({ error: 'Autorisation non trouvée' });
      }

      // Retourner l'autorisation trouvée
      res.status(200).json(autorisation);
  } catch (error) {
      console.error('Erreur lors de la récupération de l\'autorisation :', error);
      res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
