const express = require('express');
const router = express.Router();
const Role = require('../Role');

const Recuperation=require('../Recuperation')
const PieceTravail=require('../PieceTravail')
const Pointcle=require('../Pointcle')
const Avis=require('../Avis')
const Gamme=require('../Gamme')
const ejs = require('ejs');
const TacheGenerale=require('../TacheGenerale')
const DevisPiece=require('../DevisPiece')
const DevisTache=require('../DevisTache')
const Page=require('../Page')
const PointcleRealisation=require('../PointcleRealisation')
const BesoinProjet=require('../Besoin_projet')
const CategoriePiece=require('../Categorie_piece')
const EtapeProjet=require('../Etape_projet')
const EtapeDevis=require('../Etape_devis')
const Galerie=require('../Galerie')
const Equipement=require('../Equipement')
const ModeleEquipement=require('../ModeleEquipement')
const BesoinProjetRealisation=require('../BesoinProjetRealisation')
const EtapeProjetRealisation=require('../EtapeProjetRealisation')
const QuestionCategorie=require('../QuestionCategorie')
const QuestionFaq=require('../QuestionFaq')
const CategorieQuestionFaq=require('../CategorieQuestionFaq')
const Image=require('../Image')
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

  





router.get('/get_categories_piece', async (req, res) => {
  try {
    const categories_piece = await CategoriePiece.findAll();
    res.status(200).json(categories_piece);
  } catch (error) {
    console.error('Erreur lors de la récupération des categories de pieces :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer une catégorie de pièce par son ID
router.get('/get_categorie_piece/:id', async (req, res) => {
  try {
    const categoriePiece = await CategoriePiece.findByPk(req.params.id);
    if (!categoriePiece) {
      return res.status(404).json({ error: 'Catégorie de pièce non trouvée' });
    }
    res.status(200).json(categoriePiece);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie de pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour mettre à jour une catégorie de pièce
router.put('/update_categorie_piece/:id', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    const categoriePiece = await CategoriePiece.findByPk(req.params.id);
    if (!categoriePiece) {
      return res.status(404).json({ error: 'Catégorie de pièce non trouvée' });
    }

    categoriePiece.Titre = Titre || categoriePiece.Titre;
    categoriePiece.Description = Description || categoriePiece.Description;
    await categoriePiece.save();

    res.status(200).json(categoriePiece);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie de pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour supprimer une catégorie de pièce par son ID
router.delete('/delete_categorie_piece/:id', async (req, res) => {
  try {
    const rowsDeleted = await CategoriePiece.destroy({
      where: { ID: req.params.id }
    });
    if (rowsDeleted === 0) {
      return res.status(404).json({ error: 'Catégorie de pièce non trouvée' });
    }
    res.status(200).json({ message: 'Catégorie de pièce supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie de pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


router.post('/create_categorie_question', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    const nouvelleCategorie = await CategorieQuestionFaq.create({ Titre, Description });
    res.status(201).json(nouvelleCategorie);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie de question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


router.post('/add_question', async (req, res) => {
  require('dotenv').config();
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
  }
);  const { Titre, Question, Reponse, CategorieQuestionFaqs } = req.body;

  const transaction = await sequelize.transaction();

  try {
    // Créer la nouvelle question dans la base de données
    const nouvelleQuestion = await QuestionFaq.create({
      Titre,
      Question,
      Reponse
    }, { transaction });

    // Ajouter les catégories associées à la question
    if (CategorieQuestionFaqs && CategorieQuestionFaqs.length > 0) {
      await Promise.all(CategorieQuestionFaqs.map(async (categorieID) => {
        await QuestionCategorie.create({
          QuestionID: nouvelleQuestion.ID,
          CategorieID: categorieID
        }, { transaction });
      }));
    }

    await transaction.commit();
    res.status(201).json(nouvelleQuestion);
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la création de la question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/get_questions', async (req, res) => {
  try {
    const questions = await QuestionFaq.findAll({
      include: [{
        model: CategorieQuestionFaq,
        through: {
          attributes: []
        }
      }]
    });

    res.status(200).json(questions);
  } catch (error) {
    console.error('Erreur lors de la récupération des questions :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/get_questions_par_categorie/:id', async (req, res) => {
  require('dotenv').config();
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
  }
);
  const categorieId = req.params.id;

  try {
    // Récupérer les questions associées à la catégorie spécifiée
    const questions = await sequelize.query(
      `SELECT q.* FROM QuestionFaq q,Question_Categorie qc,CategorieQuestionFaq c
       WHERE q.ID=qc.QuestionID and c.ID=qc.CategorieID and
       c.ID = :categorieId`,
      {
        replacements: { categorieId },
        type: Sequelize.QueryTypes.SELECT,
        model: QuestionFaq,
        mapToModel: true,
        
      }
    );

    res.status(200).json(questions);
  } catch (error) {
    console.error('Erreur lors de la récupération des questions par catégorie :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/get_questions_par_categories', async (req, res) => {
  require('dotenv').config();
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
  }
);


  try {
    const query = `
      SELECT q.ID, q.Titre, q.Question, q.Reponse, c.ID as cat_id, c.Titre as categorie
      FROM QuestionFaq q
      INNER JOIN Question_Categorie qc ON q.ID = qc.QuestionID
      INNER JOIN CategorieQuestionFaq c ON c.ID = qc.CategorieID
      ORDER BY c.Titre, q.Question asc`;

    const questions = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT
    });

    let result = [];
    let currentCategorie = 0;
    let categorieObject = null;

    questions.forEach(row => {
      if (row.cat_id != currentCategorie) {
        // Nouvelle catégorie
        if (categorieObject !== null) {
          result.push(categorieObject);
        }
        currentCategorie = row.cat_id;
        categorieObject = {
          CategorieID: row.cat_id,
          Titre: row.categorie,
          Questions: []
        };
      }
      // Ajouter la question à la catégorie actuelle
      categorieObject.Questions.push({
        QuestionID: row.ID,
        Titre: row.Titre,
        Question: row.Question,
        Reponse: row.Reponse
      });
    });

    // Ajouter la dernière catégorie à la liste résultante
    if (categorieObject !== null) {
      result.push(categorieObject);
    }

    res.status(200).json(result);
  } catch (error) {
console.error('Erreur lors de la récupération des questions par catégorie :', error);
res.status(500).json({ error: 'Erreur serveur' });
}
});

router.get('/get_categories_question', async (req, res) => {
  try {
    const categories = await CategorieQuestionFaq.findAll();

    res.status(200).json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories de questions :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer une question par son ID
router.get('/get_question/:id', async (req, res) => {
  try {
    const question = await QuestionFaq.findByPk(req.params.id, {
      include: [{
        model: CategorieQuestionFaq,
        through: {
          attributes: []
        }
      }]
    });

    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }

    res.status(200).json(question);
  } catch (error) {
    console.error('Erreur lors de la récupération de la question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer une catégorie de question par son ID
router.get('/get_categorie_question/:id', async (req, res) => {
  try {
    const categorie = await CategorieQuestionFaq.findByPk(req.params.id);

    if (!categorie) {
      return res.status(404).json({ error: 'Catégorie de question non trouvée' });
    }

    res.status(200).json(categorie);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie de question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour supprimer une question par son ID
router.delete('/delete_question/:id', async (req, res) => {
  try {
    const rowsDeleted = await QuestionFaq.destroy({
      where: {
        ID: req.params.id
      }
    });

    if (rowsDeleted === 0) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }

    res.status(200).json({ message: 'Question supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour supprimer une catégorie de question par son ID
router.delete('/delete_categorie_question/:id', async (req, res) => {
  try {
    const rowsDeleted = await CategorieQuestionFaq.destroy({
      where: {
        ID: req.params.id
      }
    });

    if (rowsDeleted === 0) {
      return res.status(404).json({ error: 'Catégorie de question non trouvée' });
    }

    res.status(200).json({ message: 'Catégorie de question supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie de question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour mettre à jour une question
router.put('/update_question/:id', async (req, res) => {
  require('dotenv').config();
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
  }
);  const { Titre, Question, Reponse, CategorieQuestionFaqs } = req.body;
  const transaction = await sequelize.transaction();

  try {
    // Trouver la question à mettre à jour
    const question = await QuestionFaq.findByPk(req.params.id, { transaction });
    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }

    // Mettre à jour les champs de la question
    question.Titre = Titre;
    question.Question = Question;
    question.Reponse = Reponse;

    await question.save({ transaction });

    // Mettre à jour les catégories associées à la question
    if (CategorieQuestionFaqs && CategorieQuestionFaqs.length > 0) {
      // Supprimer les anciennes associations
      await QuestionCategorie.destroy({
        where: { QuestionID: question.ID },
        transaction
      });

      // Ajouter les nouvelles associations
      await Promise.all(CategorieQuestionFaqs.map(async (categorieID) => {
        await QuestionCategorie.create({
          QuestionID: question.ID,
          CategorieID: categorieID
        }, { transaction });
      }));
    }

    await transaction.commit();
    res.status(200).json(question);
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la mise à jour de la question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
  
});

// Endpoint pour mettre à jour une catégorie de question
router.put('/update_categorie_question/:id', async (req, res) => {
  try {
    const { Titre, Description } = req.body;

    // Trouver la catégorie à mettre à jour
    const categorie = await CategorieQuestionFaq.findByPk(req.params.id);
    if (!categorie) {
      return res.status(404).json({ error: 'Catégorie de question non trouvée' });
    }

    // Mettre à jour les champs de la catégorie
    categorie.Titre = Titre;
    categorie.Description = Description;

    await categorie.save();
    res.status(200).json(categorie);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie de question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour créer un Pointcle
router.post('/add_pointcle', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    const nouveauPointcle = await Pointcle.create({ Titre, Description });
    res.status(201).json(nouveauPointcle);
  } catch (error) {
    console.error('Erreur lors de la création du Pointcle :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour obtenir tous les Pointcles
router.get('/get_pointscle', async (req, res) => {
  try {
    const pointscles = await Pointcle.findAll();
    res.status(200).json(pointscles);
  } catch (error) {
    console.error('Erreur lors de la récupération des Pointcles :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour obtenir un Pointcle par ID
router.get('/get_pointcle/:id', async (req, res) => {
  try {
    const pointcle = await Pointcle.findByPk(req.params.id);
    if (!pointcle) {
      return res.status(404).json({ error: 'Pointcle non trouvé' });
    }
    res.status(200).json(pointcle);
  } catch (error) {
    console.error('Erreur lors de la récupération du Pointcle :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour mettre à jour un Pointcle par ID
router.put('/update_pointcle/:id', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    const pointcle = await Pointcle.findByPk(req.params.id);
    if (!pointcle) {
      return res.status(404).json({ error: 'Pointcle non trouvé' });
    }
    pointcle.Titre = Titre;
    pointcle.Description = Description;
    await pointcle.save();
    res.status(200).json(pointcle);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du Pointcle :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour supprimer un Pointcle par ID
router.delete('/delete_pointcle/:id', async (req, res) => {
  try {
    const pointcle = await Pointcle.findByPk(req.params.id);
    if (!pointcle) {
      return res.status(404).json({ error: 'Pointcle non trouvé' });
    }
    await pointcle.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du Pointcle :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create
router.post('/add_avis', async (req, res) => {
  try {
      const avis = await Avis.create(req.body);
      res.status(201).json(avis);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Read all
router.get('/get_all_avis', async (req, res) => {
  try {
      const avis = await Avis.findAll();
      res.status(200).json(avis);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Read one
router.get('/get_avis/:id', async (req, res) => {
  try {
      const avis = await Avis.findByPk(req.params.id);
      if (avis) {
          res.status(200).json(avis);
      } else {
          res.status(404).json({ error: 'Avis not found' });
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Update
router.put('/update_avis/:id', async (req, res) => {
  try {
      const [updated] = await Avis.update(req.body, {
          where: { ID: req.params.id }
      });
      if (updated) {
          const updatedAvis = await Avis.findByPk(req.params.id);
          res.status(200).json(updatedAvis);
      } else {
          res.status(404).json({ error: 'Avis not found' });
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

module.exports = router;
