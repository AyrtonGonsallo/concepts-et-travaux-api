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


router.get('/export_gammes', async (req, res) => {
  try {
    // 1. Récupérer les gammes
    const gammes = await Gamme.findAll();

    // 2. Formater les données JSON (plat)
    const gammesData = gammes.map(gamme => ({
      ID: gamme.ID,
      Type: gamme.Type,
      Label: gamme.Label,
      Etape: gamme.Etape,
      PrixFournisseur: gamme.PrixFournisseur,
      PrixPose: gamme.PrixPose,
      Prix: gamme.Prix,
      TravailID: gamme.TravailID,
      ActiverPrixMultiples: gamme.ActiverPrixMultiples,
      ActiverFournisseur: gamme.ActiverFournisseur,
      FournisseurID: gamme.FournisseurID,
      ArtisanID: gamme.ArtisanID,
      GammeDeReferenceID:gamme.GammeDeReferenceID,
    }));

    // 3. Créer feuille Excel
    const worksheet = xlsx.utils.json_to_sheet(gammesData);

    // 4. Créer workbook
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Gammes');

    // 5. Générer buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 6. Envoyer
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=taches_export.xlsx'
    );

    return res.send(buffer);

  } catch (err) {
    console.error('Erreur lors de l\'export des gammes :', err);
    res.status(500).json({ error: 'Erreur lors de l\'export des gammes' });
  }
});


router.get('/export_gammes_artisan/:artisan_id', async (req, res) => {
  try {
    const { artisan_id } = req.params;
    // 1. Récupérer les gammes
    const gammes = await Gamme.findAll({
      where: { 
        ArtisanID:artisan_id
       }
    });

    // 2. Formater les données JSON (plat)
    const gammesData = gammes.map(gamme => ({
      ID: gamme.ID,
      Type: gamme.Type,
      Label: gamme.Label,
      Etape: gamme.Etape,
      PrixPose: gamme.PrixPose,
      TravailID: gamme.TravailID,
      FournisseurID: gamme.FournisseurID,
      ArtisanID: gamme.ArtisanID,
      GammeDeReferenceID:gamme.GammeDeReferenceID,
    }));

    // 3. Créer feuille Excel
    const worksheet = xlsx.utils.json_to_sheet(gammesData);

    // 4. Créer workbook
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Gammes');

    // 5. Générer buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 6. Envoyer
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=taches_export.xlsx'
    );

    return res.send(buffer);

  } catch (err) {
    console.error('Erreur lors de l\'export des gammes :', err);
    res.status(500).json({ error: 'Erreur lors de l\'export des gammes' });
  }
});



router.get('/export_gammes_fournisseur/:fournisseur_id', async (req, res) => {
  try {
    const { fournisseur_id } = req.params;
    // 1. Récupérer les gammes
    const gammes = await Gamme.findAll({
      where: { 
        FournisseurID:fournisseur_id,
        Etape: 'Étape 3 - Choix du nouveau revêtement',
       }
    });

    // 2. Formater les données JSON (plat)
    const gammesData = gammes.map(gamme => ({
      ID: gamme.ID,
      Type: gamme.Type,
      Label: gamme.Label,
      Etape: gamme.Etape,
      PrixFournisseur: gamme.PrixFournisseur,
      TravailID: gamme.TravailID,
      FournisseurID: gamme.FournisseurID,
      ArtisanID: gamme.ArtisanID,
      GammeDeReferenceID:gamme.GammeDeReferenceID,
    }));

    // 3. Créer feuille Excel
    const worksheet = xlsx.utils.json_to_sheet(gammesData);

    // 4. Créer workbook
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Gammes');

    // 5. Générer buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 6. Envoyer
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=taches_export.xlsx'
    );

    return res.send(buffer);

  } catch (err) {
    console.error('Erreur lors de l\'export des gammes :', err);
    res.status(500).json({ error: 'Erreur lors de l\'export des gammes' });
  }
});



router.get('/download_modele_gammes_artisan/:artisan_id', async (req, res) => {
  try {
    const { artisan_id } = req.params;
    // 1. Récupérer les gammes
    const gammes = await Gamme.findAll({
      where: { 
        GammeDeReferenceID:null
       }
    });

    // 2. Formater les données JSON (plat)
    const gammesData = gammes.map(gamme => ({
      Type: gamme.Type,
      Label: `exemple ${gamme.Label}`,
      Etape: gamme.Etape,
      PrixPose: 0,
      TravailID: gamme.TravailID,
      ArtisanID: artisan_id,
      GammeDeReferenceID:gamme.ID,
      ActiverFournisseur: true,
    }));

    // 3. Créer feuille Excel
    const worksheet = xlsx.utils.json_to_sheet(gammesData);

    // 4. Créer workbook
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Gammes');

    // 5. Générer buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 6. Envoyer
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=taches_export.xlsx'
    );

    return res.send(buffer);

  } catch (err) {
    console.error('Erreur lors de l\'export des gammes :', err);
    res.status(500).json({ error: 'Erreur lors de l\'export des gammes' });
  }
});



router.get('/download_modele_gammes_fournisseur/:fournisseur_id', async (req, res) => {
  try {
    const { fournisseur_id } = req.params;
    // 1. Récupérer les gammes
    const gammes = await Gamme.findAll({
      where: { 
        Etape: 'Étape 3 - Choix du nouveau revêtement',
        GammeDeReferenceID:null
       }
    });

    // 2. Formater les données JSON (plat)
    const gammesData = gammes.map(gamme => ({
      Type: gamme.Type,
      Label: `exemple ${gamme.Label}`,
      Etape: gamme.Etape,
      PrixFournisseur: 0,
      TravailID: gamme.TravailID,
      FournisseurID: fournisseur_id,
      GammeDeReferenceID:gamme.ID,
      ActiverFournisseur: true,
    }));

    // 3. Créer feuille Excel
    const worksheet = xlsx.utils.json_to_sheet(gammesData);

    // 4. Créer workbook
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Gammes');

    // 5. Générer buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 6. Envoyer
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=taches_export.xlsx'
    );

    return res.send(buffer);

  } catch (err) {
    console.error('Erreur lors de l\'export des gammes :', err);
    res.status(500).json({ error: 'Erreur lors de l\'export des gammes' });
  }
});

router.post('/import_gammes', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier envoyé.' });
    }

    // Lire le fichier Excel
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: null });

    let createdCount = 0;
    let updatedCount = 0;

    for (const row of jsonData) {
      const prixPose = parseFloat(row.PrixPose) || 0;
      const prixFournisseur = parseFloat(row.PrixFournisseur) || 0;

      const prix =
        row.Prix !== undefined && row.Prix !== null && row.Prix !== ''
          ? parseFloat(row.Prix)
          : prixPose + prixFournisseur;
      // Vérifier si l'ID est présent et supérieur à 0
      if (row.ID && parseInt(row.ID) > 0) {
        // Essayer de récupérer l'élément existant
        const existingGamme = await Gamme.findByPk(row.ID);

        if (existingGamme) {
          // Mise à jour si trouvé
          await existingGamme.update({
            Type: row.Type,
            Label: row.Label,
            Etape: row.Etape,
            PrixPose: parseFloat(row.PrixPose),
            PrixFournisseur: parseFloat(row.PrixFournisseur),
            Prix: prix,
            TravailID: row.TravailID,
            ActiverPrixMultiples: row.ActiverPrixMultiples === true || row.ActiverPrixMultiples === 'true',
            ActiverFournisseur: row.ActiverFournisseur === true || row.ActiverFournisseur === 'true',
            GammeDeReferenceID: row.GammeDeReferenceID || null,
            FournisseurID: row.FournisseurID || null,
            ArtisanID: row.ArtisanID || null
          });
          updatedCount++;
        } else {
          // Si ID donné mais introuvable → créer quand même
          await Gamme.create({
            Type: row.Type,
            Label: row.Label,
            Etape: row.Etape,
            PrixPose: parseFloat(row.PrixPose),
            PrixFournisseur: parseFloat(row.PrixFournisseur),
            Prix: prix,
            TravailID: row.TravailID,
            ActiverPrixMultiples: row.ActiverPrixMultiples === true || row.ActiverPrixMultiples === 'true',
            ActiverFournisseur: row.ActiverFournisseur === true || row.ActiverFournisseur === 'true',
            FournisseurID: row.FournisseurID || null,
            ArtisanID: row.ArtisanID || null,
            GammeDeReferenceID: row.GammeDeReferenceID || null,
          });
          createdCount++;
        }
      } else {
        // Si pas d'ID ou ID vide/0 → créer une nouvelle ligne
        await Gamme.create({
          Type: row.Type,
          Label: row.Label,
            Etape: row.Etape,
            PrixPose: parseFloat(row.PrixPose),
            PrixFournisseur: parseFloat(row.PrixFournisseur),
          Prix: prix,
          TravailID: row.TravailID,
          ActiverPrixMultiples: row.ActiverPrixMultiples === true || row.ActiverPrixMultiples === 'true',
          ActiverFournisseur: row.ActiverFournisseur === true || row.ActiverFournisseur === 'true',
          FournisseurID: row.FournisseurID || null,
          ArtisanID: row.ArtisanID || null,
          GammeDeReferenceID: row.GammeDeReferenceID || null,
        });
        createdCount++;
        
      }
    }


    res.json({ message: `Import terminé avec succès. Créés : ${createdCount} - Mis à jour: ${updatedCount}` });

  } catch (err) {
    console.error('Erreur lors de l\'import des gammes :', err);
    res.status(500).json({ error: 'Erreur lors de l\'import des gammes' });
  }
});


router.get('/export_modeles_equipement', async (req, res) => {
  try {
    // 1. Récupérer les modeles
    const modeles = await ModeleEquipement.findAll();

    // 2. Mapper les données en JSON "plat"
    const modelesData = modeles.map(modele => ({
      ID: modele.ID,
      Titre: modele.Titre,
      Description: modele.Description,
      Etape: modele.Etape,
      Prix: modele.Prix,
      PrixPose: modele.PrixPose,
      PrixFournisseur: modele.PrixFournisseur,
      Longeur: modele.Longeur,
      Largeur: modele.Largeur,
      Hauteur: modele.Hauteur,
      Epaisseur: modele.Epaisseur,
      NombreDeVasques: modele.NombreDeVasques,
      Matiere: modele.Matiere,
      EquipementID: modele.EquipementID,
      ActiverFournisseur: modele.ActiverFournisseur,
      FournisseurID: modele.FournisseurID,
      ArtisanID: modele.ArtisanID,
      ModeleDeReferenceID: modele.ModeleDeReferenceID,
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


router.get('/export_modeles_equipement_fournisseur/:fournisseur_id', async (req, res) => {
  try {

    const { fournisseur_id } = req.params;
    // 1. Récupérer les modeles
    const modeles = await ModeleEquipement.findAll({
      where: {
        FournisseurID:fournisseur_id
      }
    });

    // 2. Mapper les données en JSON "plat"
    const modelesData = modeles.map(modele => ({
      ID: modele.ID,
      Titre: modele.Titre,
      Description: modele.Description,
      Etape: modele.Etape,
      PrixFournisseur: modele.PrixFournisseur,
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


module.exports = router;
