const express = require('express');
const router = express.Router();
const Gamme=require('../Gamme')
const ModeleEquipement=require('../ModeleEquipement')
const multer = require('multer');
const Equipement=require('../Equipement')
const xlsx = require('xlsx');
const upload = multer({ storage: multer.memoryStorage() });
const { Op } = require('sequelize');
require('dotenv').config();




router.get('/export_modeles_equipement_artisan/:artisan_id', async (req, res) => {
  try {

    const { artisan_id } = req.params;
    // 1. Récupérer les modeles
    const modeles = await ModeleEquipement.findAll({
      where: {
        ArtisanID:artisan_id
      }
    });

    // 2. Mapper les données en JSON "plat"
    const modelesData = modeles.map(modele => ({
      ID: modele.ID,
      Titre: modele.Titre,
      Description: modele.Description,
      Etape: modele.Etape,
      PrixPose: modele.PrixPose,
      Longeur: modele.Longeur,
      Largeur: modele.Largeur,
      Hauteur: modele.Hauteur,
      Epaisseur: modele.Epaisseur,
      NombreDeVasques: modele.NombreDeVasques,
      Matiere: modele.Matiere,
      EquipementID: modele.EquipementID,
      ModeleDeReferenceID: modele.ModeleDeReferenceID,
      FournisseurID: modele.FournisseurID,
      ArtisanID: modele.ArtisanID,
    }));

    // 3. Créer feuille Excel
    const worksheet = xlsx.utils.json_to_sheet(modelesData);

    // 4. Créer workbook
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Modeles');

    // 5. Générer buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 6. Envoyer
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=modeles_export.xlsx'
    );

    return res.send(buffer);

  } catch (err) {
    console.error('Erreur lors de l\'export des modeles :', err);
    res.status(500).json({ error: 'Erreur lors de l\'export des modeles' });
  }
});

router.get('/download_modele_equipements_fournisseur/:fournisseur_id', async (req, res) => {
  try {

    const { fournisseur_id } = req.params;
   
    const modeles = await ModeleEquipement.findAll({
      where: {
        Etape: {
          [Op.like]: '%étape 3%'
        },
        ModeleDeReferenceID:null
      }
    });

    // 2. Mapper les données en JSON "plat"
    const modelesData = modeles.map(modele => ({
      Titre: `exemple ${modele.Titre}`,
      Description: modele.Description,
      Etape: modele.Etape,
      PrixFournisseur: 0,
      Longeur: modele.Longeur,
      Largeur: modele.Largeur,
      Hauteur: modele.Hauteur,
      Epaisseur: modele.Epaisseur,
      NombreDeVasques: modele.NombreDeVasques,
      Matiere: modele.Matiere,
      EquipementID: modele.EquipementID,
      ActiverFournisseur: true,
      FournisseurID: fournisseur_id,
      ModeleDeReferenceID: modele.ID,
    }));

    // 3. Créer feuille Excel
    const worksheet = xlsx.utils.json_to_sheet(modelesData);

    // 4. Créer workbook
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Modeles');

    // 5. Générer buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 6. Envoyer
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=modeles_export.xlsx'
    );

    return res.send(buffer);

  } catch (err) {
    console.error('Erreur lors de l\'export des modeles :', err);
    res.status(500).json({ error: 'Erreur lors de l\'export des modeles' });
  }
});


router.get('/download_modele_equipements_artisan/:artisan_id', async (req, res) => {
  try {

    const { artisan_id } = req.params;
   
    const modeles = await ModeleEquipement.findAll({
      where: {
        Etape: {
          [Op.like]: '%étape 3%'
        },
        ModeleDeReferenceID:null
      }
    });

    // 2. Mapper les données en JSON "plat"
    const modelesData = modeles.map(modele => ({
      Titre: `exemple ${modele.Titre}`,
      Description: modele.Description,
      Etape: modele.Etape,
      PrixPose: 0,
      Longeur: modele.Longeur,
      Largeur: modele.Largeur,
      Hauteur: modele.Hauteur,
      Epaisseur: modele.Epaisseur,
      NombreDeVasques: modele.NombreDeVasques,
      Matiere: modele.Matiere,
      EquipementID: modele.EquipementID,
      ActiverFournisseur: true,
      ArtisanID: artisan_id,
      ModeleDeReferenceID: modele.ID,
    }));

    // 3. Créer feuille Excel
    const worksheet = xlsx.utils.json_to_sheet(modelesData);

    // 4. Créer workbook
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Modeles');

    // 5. Générer buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 6. Envoyer
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=modeles_export.xlsx'
    );

    return res.send(buffer);

  } catch (err) {
    console.error('Erreur lors de l\'export des modeles :', err);
    res.status(500).json({ error: 'Erreur lors de l\'export des modeles' });
  }
});

router.post('/import_equipements', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier envoyé.' });
    }

    // Lire le fichier Excel
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    let createdCount = 0;
    let updatedCount = 0;

    for (const row of jsonData) {
      const prixPose = parseFloat(row.PrixPose) || 0;
      const prixFournisseur = parseFloat(row.PrixFournisseur) || 0;

      const prix =
        row.Prix !== undefined && row.Prix !== null && row.Prix !== ''
          ? parseFloat(row.Prix)
          : prixPose + prixFournisseur;
      // Si ID existe et > 0, on tente une mise à jour
      if (row.ID && parseInt(row.ID) > 0) {
        const existing = await ModeleEquipement.findByPk(row.ID);

        if (existing) {
          await existing.update({
            Titre: row.Titre,
            Description: row.Description,
            Prix: prix,
            PrixFournisseur: parseFloat(row.PrixFournisseur),
            PrixPose: parseFloat(row.PrixPose),
            Longeur: row.Longeur,
            Largeur: row.Largeur,
            Hauteur: row.Hauteur,
            Etape:row.Etape,
            Epaisseur: row.Epaisseur,
            NombreDeVasques: row.NombreDeVasques,
            Matiere: row.Matiere,
            EquipementID: row.EquipementID,
            ActiverFournisseur: row.ActiverFournisseur === true || row.ActiverFournisseur === 'true',
            FournisseurID: row.FournisseurID || null,
            ArtisanID: row.ArtisanID || null,
            ModeleDeReferenceID: row.ModeleDeReferenceID || null,
          });
          updatedCount++;
        } else {
          // Si ID donné mais inexistant → création
          await ModeleEquipement.create({
            Titre: row.Titre,
            Description: row.Description,
            Prix: prix,
            PrixFournisseur: parseFloat(row.PrixFournisseur),
            PrixPose: parseFloat(row.PrixPose),
            Longeur: row.Longeur,
            Largeur: row.Largeur,
            Hauteur: row.Hauteur,
            Etape:row.Etape,
            Epaisseur: row.Epaisseur,
            NombreDeVasques: row.NombreDeVasques,
            Matiere: row.Matiere,
            EquipementID: row.EquipementID,
            ActiverFournisseur: row.ActiverFournisseur === true || row.ActiverFournisseur === 'true',
            FournisseurID: row.FournisseurID || null,
            ArtisanID: row.ArtisanID || null,
            ModeleDeReferenceID: row.ModeleDeReferenceID || null,
          });
          createdCount++;
        }
      } else {
        // ID vide → création directe
        await ModeleEquipement.create({
          Titre: row.Titre,
          Description: row.Description,
          Prix: prix,
           PrixFournisseur: parseFloat(row.PrixFournisseur),
            PrixPose: parseFloat(row.PrixPose),
            Etape:row.Etape,
          Longeur: row.Longeur,
          Largeur: row.Largeur,
          Hauteur: row.Hauteur,
          Epaisseur: row.Epaisseur,
          NombreDeVasques: row.NombreDeVasques,
          Matiere: row.Matiere,
          EquipementID: row.EquipementID,
          ActiverFournisseur: row.ActiverFournisseur === true || row.ActiverFournisseur === 'true',
          FournisseurID: row.FournisseurID || null,
          ArtisanID: row.ArtisanID || null,
          ModeleDeReferenceID: row.ModeleDeReferenceID || null,
        });

        
        createdCount++;
      }
    }

    res.json({ message: `Import terminé avec succès. Créés : ${createdCount} - Mis à jour: ${updatedCount}` });
  } catch (err) {
    console.error('Erreur lors de l\'import des équipements :', err);
    res.status(500).json({ error: 'Erreur lors de l\'import' });
  }
});


router.get('/get_artisan_gammes_sans_equipements/:artisan_id', async (req, res) => {
  try {
     const { artisan_id } = req.params;
    const listeIds = [2, 7, 13, 15, 16, 12]; // tes IDs Travail
    const gammes = await Gamme.findAll({
      where: {
        TravailID: {
          [Op.notIn]: listeIds
        },
        ArtisanID:artisan_id
      }
    });
    res.status(200).json(gammes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/get_fournisseur_gammes_sans_equipements/:fournisseur_id', async (req, res) => {
  try {
     const { fournisseur_id } = req.params;
    const listeIds = [2, 7, 13, 15, 16, 12]; // tes IDs Travail
    const gammes = await Gamme.findAll({
      where: {
        TravailID: {
          [Op.notIn]: listeIds
        },
        FournisseurID:fournisseur_id
      }
    });
    res.status(200).json(gammes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/get_fournisseur_modeles_equipement/:fournisseur_id', async (req, res) => {
  try {
    const { fournisseur_id } = req.params;
    const modeles = await ModeleEquipement.findAll({
      where: {
        FournisseurID:fournisseur_id
      },
      include: [
        {
          model: Equipement,
          as: 'Equipement'
        },
      ]
    });

    res.status(200).json(modeles);
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
  
});

router.get('/get_artisans_modeles_equipement/:artisan_id', async (req, res) => {
  try {
    const { artisan_id } = req.params;
    const modeles = await ModeleEquipement.findAll({
      where: {
        ArtisanID:artisan_id
      },
      include: [
        {
          model: Equipement,
          as: 'Equipement'
        },
      ]
    });

    res.status(200).json(modeles);
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
  
});

module.exports = router;
