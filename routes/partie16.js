const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const Realisation=require('../Realisation')
const Piece=require('../Piece')
const CategorieArtisan=require('../CategorieArtisan')
const CategorieFournisseur=require('../CategorieFournisseur')

router.get('/retirer_image/:object_id/:typeImage/:table', async (req, res) => {
  try {

    const object_id = req.params.object_id;
    const typeImage = req.params.typeImage;
    const table = req.params.table; 


  const sequelize = require('./config/database');
      let objet;

      const transaction = await sequelize.transaction();
      if(table =='realisation'){
         objet = await Realisation.findByPk(object_id, { transaction });
        if (typeImage =="principale") {
          console.log("suppression image principale realisation")
          objet.Image_principale = '';
        }
        await objet.save({ transaction });

      }else if(table =='piece'){
         objet = await Piece.findByPk(object_id, { transaction });

        if (typeImage =="principale") {
          console.log("suppression image principale piece")
          objet.Image_principale = '';
        }

        if (typeImage =="presentation") {
          console.log("suppression image presentation piece")
          objet.Image_presentation = '';
        }

        await objet.save({ transaction });
      }
      await transaction.commit();
      
      res.status(200).json(objet);
       

      
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Endpoint POST pour ajouter une catégorie de piece
router.post('/ajouter_categorie_artisan', async (req, res) => {
  try {
    const { Titre } = req.body;
    // Création de la catégorie de projet dans la base de données
    const categorie_artisan = await CategorieArtisan.create({ Titre });
    res.status(201).json(categorie_artisan);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la catégorie de projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint pour supprimer une catégorie de pièce par son ID
router.delete('/delete_categorie_artisan/:id', async (req, res) => {
  try {
    const rowsDeleted = await CategorieArtisan.destroy({
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


router.get('/get_categories_artisan', async (req, res) => {
  try {
    const categories_artisan = await CategorieArtisan.findAll({
      order: [['Titre', 'ASC']]
    });
    res.status(200).json(categories_artisan);
  } catch (error) {
    console.error('Erreur lors de la récupération des categories de pieces :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer une catégorie de pièce par son ID
router.get('/get_categorie_artisan/:id', async (req, res) => {
  try {
    const categorie_artisan = await CategorieArtisan.findByPk(req.params.id);
    if (!categorie_artisan) {
      return res.status(404).json({ error: 'Catégorie de pièce non trouvée' });
    }
    res.status(200).json(categorie_artisan);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie de pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint pour mettre à jour une catégorie de pièce
router.put('/update_categorie_artisan/:id', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    const categorie_artisan = await CategorieArtisan.findByPk(req.params.id);
    if (!categorie_artisan) {
      return res.status(404).json({ error: 'Catégorie de pièce non trouvée' });
    }

    categorie_artisan.Titre = Titre || categorie_artisan.Titre;
    await categorie_artisan.save();

    res.status(200).json(categorie_artisan);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie de pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});




// Endpoint POST pour ajouter une catégorie de piece
router.post('/ajouter_categorie_fournisseur', async (req, res) => {
  try {
    const { Titre } = req.body;
    // Création de la catégorie de projet dans la base de données
    const categorie_fournisseur = await CategorieFournisseur.create({ Titre });
    res.status(201).json(categorie_fournisseur);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la catégorie de projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint pour supprimer une catégorie de pièce par son ID
router.delete('/delete_categorie_fournisseur/:id', async (req, res) => {
  try {
    const rowsDeleted = await CategorieFournisseur.destroy({
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


router.get('/get_categories_fournisseur', async (req, res) => {
  try {
    const categories_fournisseur = await CategorieFournisseur.findAll({
      order: [['Titre', 'ASC']]
    });
    res.status(200).json(categories_fournisseur);
  } catch (error) {
    console.error('Erreur lors de la récupération des categories de pieces :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer une catégorie de pièce par son ID
router.get('/get_categorie_fournisseur/:id', async (req, res) => {
  try {
    const categorie_fournisseur = await CategorieFournisseur.findByPk(req.params.id);
    if (!categorie_fournisseur) {
      return res.status(404).json({ error: 'Catégorie de pièce non trouvée' });
    }
    res.status(200).json(categorie_fournisseur);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie de pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint pour mettre à jour une catégorie de pièce
router.put('/update_categorie_fournisseur/:id', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    const categorie_fournisseur = await CategorieFournisseur.findByPk(req.params.id);
    if (!categorie_fournisseur) {
      return res.status(404).json({ error: 'Catégorie de pièce non trouvée' });
    }

    categorie_fournisseur.Titre = Titre || categorie_fournisseur.Titre;
    await categorie_fournisseur.save();

    res.status(200).json(categorie_fournisseur);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie de pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});




module.exports = router;
