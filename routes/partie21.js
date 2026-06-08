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




router.delete('/delete_paiement/:id', async (req, res) => {
  try {
    const deleted = await Paiement.destroy({
      where: { ID: req.params.id }
    });
    if (deleted) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: 'Paiement not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/add_visite', async (req, res) => {
  try {
      const { Date, Paye } = req.body;

      if (!Date || Paye === undefined) {
          return res.status(400).json({ message: "Les champs 'Date' et 'Paye' sont requis." });
      }

      const newVisite = await Visite.create({ Date, Paye });
      return res.status(201).json(newVisite);
  } catch (error) {
      console.error("Erreur lors de l'ajout de la visite :", error);
      return res.status(500).json({ message: "Erreur serveur" });
  }
});

router.put('/update_visite/:id', async (req, res) => {
  const { id } = req.params;
  const { Date, DateDeProgrammation, Paye } = req.body;

  try {
    const visite = await Visite.findByPk(id);

    if (!visite) {
      return res.status(404).json({ message: "Visite non trouvée." });
    }

    // Met à jour uniquement les champs fournis
    if (Date !== undefined) visite.Date = Date;
    if (DateDeProgrammation !== undefined) visite.DateDeProgrammation = DateDeProgrammation;
    if (Paye !== undefined) visite.Paye = Paye;

    await visite.save();

    return res.status(200).json(visite);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la visite :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});


router.post('/add_paiement', async (req, res) => {
  try {
      const {  Type, Montant, Date, ProjetID } = req.body;

      if ( !Type || !Montant || !Date || !ProjetID) {
          return res.status(400).json({ message: 'Tous les champs sont requis' });
      }
      // Vérifier si le Projet avec ProjetID existe
      const projet = await Projet.findByPk(ProjetID);

      if (!projet) {
          return res.status(400).json({ message: 'Projet non trouvée pour cet ID' });
      }
      const newPaiement = await Paiement.create({
          Type,
          Montant,
          Date,
          ProjetID
      });

      res.status(201).json({ message: 'Paiement ajouté avec succès', paiement: newPaiement });
  } catch (error) {
      console.error('Erreur lors de l\'ajout du paiement :', error);
      res.status(500).json({ message: 'Erreur serveur', error });
  }
});

router.post('/add_demande_paiement', async (req, res) => {
  try {
      const { Titre,Commentaire,Requette,Status, Type, Montant, DateCreation, ProjetID } = req.body;

      if (!Titre || !Commentaire || !Requette || !Type || !Montant || !DateCreation || !ProjetID) {
          return res.status(400).json({ message: 'Tous les champs sont requis' });
      }
      // Vérifier si la Projet avec ProjetID existe
      const projet = await Projet.findOne({
      where: { Id: ProjetID },
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
      ]
    });

      if (!projet) {
          return res.status(400).json({ message: 'projet non trouvée pour cet ID' });
      }
      const newPaiement = await Paiement.create({
          Titre,
          Commentaire,
          Requette,
          Status,
          Type,
          Montant,
          DateCreation,
          ProjetID,
      });
     

      res.status(201).json({ message: 'Demande de paiement ajoutée avec succès', paiement: newPaiement });
  } catch (error) {
      console.error('Erreur lors de l\'ajout du paiement :', error);
      res.status(500).json({ message: 'Erreur serveur', error });
  }
});




router.put('/update_demande_paiement/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
      const {  Lien,ReferenceVirement } = req.body;
      const existingPaiement = await Paiement.findByPk(id);

      if (existingPaiement) {
        // Mise à jour si trouvé
        await existingPaiement.update({
          Lien: Lien,
          ReferenceVirement: ReferenceVirement,
        });
      }else{
        return res.status(400).json({ message: 'paiement non trouvée pour cet ID' });
      }
      //console.log("existingPaiement",existingPaiement)
      //console.log("Lien",Lien)
      //console.log("ReferenceVirement",ReferenceVirement)

      const projet = await Projet.findOne({
        where: { Id: existingPaiement.ProjetID },
        include: [
          { model: Utilisateur, as: 'Utilisateur' },
          { model: Utilisateur, as: 'Client' },
        ]});

      if (!projet) {
          return res.status(400).json({ message: 'projet non trouvée pour cet ID' });
      }

      Type = existingPaiement.Type
      Montant= existingPaiement.Montant
      Commentaire= existingPaiement.Commentaire
      Titre= existingPaiement.Titre

  
      

      lien_paiements_compte="https://dev.homeren.fr/espace-membre/paiements"
      let invite = "";

      if(Type==='visite' || Type==='acompte'){
        invite = `
          <p>
            Pour effectuer le règlement, vous pouvez :<br>
            - Utiliser le lien de paiement suivant : <a href="${Lien}">${Lien}</a><br>
            - Effectuer un virement avec la référence suivante comme motif : <strong>${ReferenceVirement}</strong><br>
            - Vous connecter à votre compte HomeRen et régler le montant dans le panier
          </p>
        `;
      
      }else{
        invite = `
          <p>
            Pour effectuer le règlement, vous pouvez :<br>
            - Utiliser le lien de paiement suivant : <a href="${Lien}">${Lien}</a><br>
            - Effectuer un virement avec la référence suivante comme motif : <strong>${ReferenceVirement}</strong><br>
            - Vous connecter à votre compte HomeRen "Votre compte > Paiements" et régler le montant : <a href="${lien_paiements_compte}">${lien_paiements_compte}</a>
          </p>
        `;
      
      }
        

      

      
          const utilisateur = projet.Client;
          const pseudo = `${utilisateur.Nom} ${utilisateur.Prenom}`;
          const email_user = utilisateur.Email;
          let nomProjet="";
          if (projet) {
            let currentYear = new Date().getFullYear();
            nomProjet = `projet HR-${currentYear}-${projet.Id}`;
          } 
      
          const currentDate = new Date().toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
      
          const emailTemplatePath = path.join(__dirname, '..', 'mails-templates', 'emailDemandePaiement.ejs');
          const htmlContent = await ejs.renderFile(emailTemplatePath, {
            pseudo,
            currentDate,
            nomProjet,
            email_user,
            Montant,
            Commentaire,
            Titre,
            invite
          });
      
          const mailOptions = {
            from: `${process.env.MAILS_TITLE} <${process.env.MAILS_USER}>`,
            to: email_user,
            subject: `Demande de paiement`,
            html: htmlContent
          };
      
          await transporter.sendMail(mailOptions);

      res.status(201).json({ message: 'Demande de paiement mise a jour avec succès', paiement: existingPaiement });
  } catch (error) {
      console.error('Erreur lors de l\'ajout du paiement :', error);
      res.status(500).json({ message: 'Erreur serveur', error });
  }
});


router.put('/update_demande_paiement_data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
      const {  TypeDePaiement } = req.body;
      const existingPaiement = await Paiement.findByPk(id);
      console.log("TypeDePaiement",TypeDePaiement)
      console.log("id",id)
      if (existingPaiement) {
        // Mise à jour si trouvé
        await existingPaiement.update({
          TypeDePaiement: TypeDePaiement,
        });
      }else{
        return res.status(400).json({ message: 'paiement non trouvée pour cet ID' });
      }
    

      res.status(201).json({ message: 'Demande de paiement mise a jour avec succès', paiement: existingPaiement });
  } catch (error) {
      console.error('Erreur lors de l\'ajout du paiement :', error);
      res.status(500).json({ message: 'Erreur serveur', error });
  }
});


router.get('/ressend_demande_paiement/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const paiement = await Paiement.findByPk(id);
      if (!paiement) {
        return res.status(404).json({ error: 'paiement non trouvé' });
      }
      // Vérifier si la Projet avec ProjetID existe
      const projet = await Projet.findOne({
      where: { Id: paiement.ProjetID },
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        
        
      ]
      
    });
    let Montant = paiement.Montant
    let Commentaire = paiement.Commentaire
    let Titre = paiement.Titre
    let Type = paiement.Type
    let Lien = paiement.Lien
    let ReferenceVirement = paiement.ReferenceVirement

    lien_paiements_compte="https://dev.homeren.fr/espace-membre/paiements"
    let invite = "";

    
     if(Type==='visite' || Type==='acompte'){
        invite = `
          <p>
            Pour effectuer le règlement, vous pouvez :<br>
            - Utiliser le lien de paiement suivant : <a href="${Lien}">${Lien}</a><br>
            - Effectuer un virement avec la référence suivante comme motif : <strong>${ReferenceVirement}</strong><br>
            - Vous connecter à votre compte HomeRen et régler le montant dans le panier
          </p>
        `;
      
      }else{
        invite = `
          <p>
            Pour effectuer le règlement, vous pouvez :<br>
            - Utiliser le lien de paiement suivant : <a href="${Lien}">${Lien}</a><br>
            - Effectuer un virement avec la référence suivante comme motif : <strong>${ReferenceVirement}</strong><br>
            - Vous connecter à votre compte HomeRen "Votre compte > Paiements" et régler le montant : <a href="${lien_paiements_compte}">${lien_paiements_compte}</a>
          </p>
        `;
      
      }
    


      if (!projet) {
          return res.status(400).json({ message: 'projet non trouvée pour cet ID' });
      }
      

      
          const utilisateur = projet.Client;
          const pseudo = `${utilisateur.Nom} ${utilisateur.Prenom}`;
          const email_user = utilisateur.Email;
          let nomProjet="";
          if (projet) {
            let currentYear = new Date().getFullYear();
            nomProjet = `projet HR-${currentYear}-${projet.Id}`;
          } 
      
          const currentDate = new Date().toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
      
          const emailTemplatePath = path.join(__dirname, '..', 'mails-templates', 'emailDemandePaiement.ejs');
          const htmlContent = await ejs.renderFile(emailTemplatePath, {
            pseudo,
            currentDate,
            nomProjet,
            email_user,
            Montant,
            Commentaire,
            Titre,
            invite
          });
      
          const mailOptions = {
            from: `${process.env.MAILS_TITLE} <${process.env.MAILS_USER}>`,
            to: email_user,
            subject: `Rappel de demande de paiement`,
            html: htmlContent
          };
      
          await transporter.sendMail(mailOptions);

      res.status(201).json({ message: 'Rappel de demande de paiement envoyé avec succès', paiement: paiement });
  } catch (error) {
      console.error('Erreur lors de l\'envoi du rappel :', error);
      res.status(500).json({ message: 'Erreur serveur', error });
  }
});



// Mettre à jour une page par ID
router.put('/update_status_demande_paiement/:id', async (req, res) => {
  try {
    const paiementID = req.params.id;
    

    const paiement = await Paiement.findByPk(paiementID);
    if (!paiement) {
      return res.status(404).json({ error: 'paiement non trouvé' });
    }
    const currentStatus = paiement.Status;
    const updateData = {
      Status: !currentStatus
    };
    // Si on passe de non payé → payé
    if (!currentStatus) {
      updateData.DatedePaiement = new Date();
    }
    await paiement.update(updateData);

    res.status(200).json(paiement);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
