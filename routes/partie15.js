const express = require('express');
const router = express.Router();


const Remise = require('../Remise'); 
const DevisPiece=require('../DevisPiece')
const Projet=require('../Projet')
const DevisTache=require('../DevisTache')
const Travail=require('../Travail')
const Visite=require('../Visite')
const Utilisateur = require('../Utilisateur');
const Parametre = require('../Parametre');
const Tva = require('../Tva');



router.delete('/delete_remise/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Récupérer la remise
    const remise = await Remise.findByPk(id);
    if (!remise) {
      return res.status(404).json({ message: 'Remise non trouvée' });
    }

    // 2️⃣ Récupérer le devis lié
    const devisPiece = await DevisPiece.findByPk(remise.DevisID, {
      include: [
        {
          model: DevisTache,
          include: [Travail]
        }
      ]
    });

    if (!devisPiece) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }

    
    let nouveau_total = 0;

    for (const travail of devisPiece.DevisTaches) {
      const prixBaseHT = Number(travail.Prix) || 0;
      let prixRemiseHT = prixBaseHT;

      if (remise.Type === 'pourcentage' && remise.Pourcentage) {
        prixRemiseHT = prixBaseHT + (prixBaseHT * remise.Pourcentage / 100);
      }

      if (remise.Type === 'fixe' && remise.Valeur) {
        prixRemiseHT = prixBaseHT + remise.Valeur;
      }

      // Sécurité : pas de prix négatif
      prixRemiseHT = Math.max(prixRemiseHT, 0);

      travail.Prix = prixRemiseHT;
      await travail.save();

      nouveau_total += prixRemiseHT;

      console.log(
        `Travail ${travail.id} | base: ${prixBaseHT} | après remise: ${prixRemiseHT}`
      );
    }

    devisPiece.Prix = nouveau_total;
    await devisPiece.save();

    // 3️⃣ Supprimer la remise
    await remise.destroy();


    res.json({
      message: 'Remise supprimée et devis recalculé',
      nouveau_total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erreur lors de la suppression de la remise'
    });
  }
});


router.get('/get_all_remises_by_devis/:devisId', async (req, res) => {
  try {
    const { devisId } = req.params;

    const remises = await Remise.findAll({
      where: { DevisID: devisId },
      order: [['ID', 'ASC']]
    });

    res.json(remises);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des remises' });
  }
});


router.post('/add_remise', async (req, res) => {
  try {
    const {
      Titre,
      Type, // "pourcentage" ou "valeur"
      Pourcentage,
      Valeur,
      DevisID,
      Commentaire
    } = req.body;

    if (!Titre || !Type || !DevisID) {
      return res.status(400).json({
        message: 'Titre, Type et DevisID sont obligatoires'
      });
    }

    const devisPiece = await DevisPiece.findByPk(DevisID, {
      include: [
        {
          model: DevisTache,
          include: [Travail]
        }
      ]
    });

    if (!devisPiece) {
      return res.status(404).json({ error: 'DevisPiece non trouvé' });
    }

    // Création de la remise
    const remise = await Remise.create({
      Titre,
      Type,
      Pourcentage,
      Valeur,
      DevisID,
      Commentaire
    });

    let nouveau_total = 0;

    for (const travail of devisPiece.DevisTaches) {
      const prixBaseHT = Number(travail.Prix) || 0;
      let prixRemiseHT = prixBaseHT;

      if (Type === 'pourcentage' && Pourcentage) {
        prixRemiseHT = prixBaseHT - (prixBaseHT * Pourcentage / 100);
      }

      if (Type === 'fixe' && Valeur) {
        prixRemiseHT = prixBaseHT - Valeur;
      }

      // Sécurité : pas de prix négatif
      prixRemiseHT = Math.max(prixRemiseHT, 0);

      travail.Prix = prixRemiseHT;
      await travail.save();

      nouveau_total += prixRemiseHT;

      console.log(
        `Travail ${travail.id} | base: ${prixBaseHT} | après remise: ${prixRemiseHT}`
      );
    }

    devisPiece.Prix = nouveau_total;
    await devisPiece.save();

    res.status(201).json({
      remise,
      nouveau_total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erreur lors de la création de la remise'
    });
  }
});

router.get('/generate_paylink/:projet_id/:payer_visite/:payer_acompte', async (req, res) => {
  try {
    require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const projet_id = req.params.projet_id; 
    const payer_visite = req.params.payer_visite === 'true';
    const payer_acompte = req.params.payer_acompte === 'true';

    const project = await Projet.findOne({
      where: { Id: projet_id },
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
          ]
        }
      ]
    });
  
    if (!project) {
      console.warn('Projet non trouvé.');
      return res.status(404).json({ error: 'Projet introuvable' });
    }

    const parametre_visite = await Parametre.findByPk(3);
    const parametre_acompte = await Parametre.findByPk(2);
    const parametre_coeff = await Parametre.findByPk(1);
    const parametre_tva = await Parametre.findByPk(6);
    const cout_visite = parametre_visite.Valeur;
    const pourcent_acompte = parametre_acompte.Valeur;
    const pourcent_coeff= parametre_coeff.Valeur;
    const pourcent_tva = parametre_tva.Valeur;

    let total = (project.Devis.reduce((sum, devis) => {
      return sum + (Number((devis.Prix*pourcent_coeff*(1+pourcent_tva/100))  ) || 0);
    }, 0)).toFixed(2);
    console.log("total ",total)
    let montant = 0;

    console.log("payer_visite ",payer_visite)
    console.log("payer_acompte ",payer_acompte)
    if(payer_visite){
      montant = ((cout_visite)).toFixed(2);
      console.log("cout_visite ",cout_visite)
    }else if(payer_acompte){
      montant = ((total * pourcent_acompte)/100).toFixed(2);
      console.log("pourcent_acompte ",pourcent_acompte)
    }
    console.log("montant ",montant)
    



    let desc="";
    if(payer_visite){
      desc=`Paiement d'un montant de ${montant} pour le projet Homeren n° ${project.Id} de ${project.Utilisateur.Nom} ${project.Utilisateur.Prenom}. Ce montant correspond aux frais de visite du technicien qui viendra valider votre demande de devis.`
    }else if (payer_acompte){
      desc=`Paiement d'un montant de ${montant} pour le projet Homeren n° ${project.Id} de ${project.Utilisateur.Nom} ${project.Utilisateur.Prenom}. Ce montant correspond à un acompte sur le projet n°${project.Id} qui vous a été transmis par email et que vous pouvez retrouver sur votre compte Homeren.`
    }
    if (!projet_id || !project.Devis) {
      return res.status(400).json({ error: "id projet et liste_devis sont requis" });
    }


    // Création du produit
    const product = await stripe.products.create({
      name: 'Montant à régler',
      description: desc,
      metadata: {
        projet_id: project.Id,
        type_paiement: payer_visite ? 'visite' : 'acompte'
      }
    });

    // Création du prix
    const price = await stripe.prices.create({
      unit_amount: Math.round(montant * 100),
      currency: 'eur',
      product: product.id,
    });

    // Création du payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        liste_devis: project.Devis.map(d => d.ID).join(','),
        projet_id: project.Id
      }
    });

    res.json({ url: paymentLink.url });

    //res.json({ url: session.url });
   
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe :', error);
    res.status(500).json({ error: error.message });
  }
});


router.post('/generate_paylink/:projet_id/', async (req, res) => {
  const {
      Montant,
      Type, 
      Titre,
      Commentaire,
      id_paiement
    } = req.body;
  try {

    console.log("id_paiement",id_paiement)

     const projet_id = req.params.projet_id; 

    const project = await Projet.findOne({
      where: { Id: projet_id },
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
          ]
        }
      ]
    });
  
    if (!project) {
      console.warn('Projet non trouvé.');
      return res.status(404).json({ error: 'Projet introuvable' });
    }

    
      require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
      desc=`Paiement d'un montant de ${Montant} pour le projet Homeren n° ${project.Id} de ${project.Utilisateur.Nom} ${project.Utilisateur.Prenom}.\n Commentaire : ${Commentaire}`
      
      if (!projet_id || !project.Devis) {
        return res.status(400).json({ error: "id projet et liste_devis sont requis" });
      }


      // Création du produit
      const product = await stripe.products.create({
        name: Titre,
        description: desc,
        metadata: {
          projet_id: project.Id,
          type_paiement: Type,
          id_paiement:id_paiement
        }
      });

      // Création du prix
      const price = await stripe.prices.create({
        unit_amount: Math.round(Montant * 100),
        currency: 'eur',
        product: product.id,
      });

      // Création du payment link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        metadata: {
          liste_devis: project.Devis.map(d => d.ID).join(','),
          projet_id: project.Id,
          id_paiement:id_paiement
        }
      });


      const now = new Date();
      const date = now.toISOString().slice(0, 10); // YYYY-MM-DD

      let reference = `PROJET-HR-000${project.Id}-${project.Client_id}-${date}`;
      res.json({ url: paymentLink.url, ref:reference });
    

    
    
    
   
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe :', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/ajouter_tva', async (req, res) => {
  try {
    const { Valeur, Commentaire, Defaut } = req.body;

    const nouvelleTva = await Tva.create({
      Valeur,
      Commentaire,
      Defaut
    });

    res.status(201).json(nouvelleTva);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/*
    ➜ UPDATE TVA
*/
router.put('/update_tva/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tva = await Tva.findByPk(id);
    if (!tva) {
      return res.status(404).json({ message: 'TVA non trouvée' });
    }

    await tva.update(req.body);

    res.json(tva);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/*
    ➜ DELETE TVA
*/
router.delete('/delete_tva/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tva = await Tva.findByPk(id);
    if (!tva) {
      return res.status(404).json({ message: 'TVA non trouvée' });
    }

    await tva.destroy();

    res.json({ message: 'TVA supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/*
    ➜ GET TVA PAR ID
*/
router.get('/get_tva/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tva = await Tva.findByPk(id);
    if (!tva) {
      return res.status(404).json({ message: 'TVA non trouvée' });
    }

    res.json(tva);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/*
    ➜ GET ALL TVA
*/
router.get('/get_all_tva', async (req, res) => {
  try {
    const tvas = await Tva.findAll({
      order: [['Valeur', 'ASC']]
    });

    res.json(tvas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});








module.exports = router;
