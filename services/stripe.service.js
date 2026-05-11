const fs = require('fs');
require('dotenv').config();
const path = require('path');
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
const Paiement=require('../Paiement')

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);




function logToFile(message) {
  const logPath = path.join(__dirname, '../logs/stripe_webhook.log');
  const date = new Date().toISOString();

  const logMessage =
    typeof message === 'object'
      ? JSON.stringify(message, null, 2)
      : message.toString();

  fs.appendFileSync(logPath, `[${date}] ${logMessage}\n\n`, 'utf8');
}

async function handleStripeWebhook(req) {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    logToFile({
      error: 'Signature verification failed',
      message: err.message
    });
    throw new Error('Invalid signature');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const projet_id = session.metadata?.projet_id;
    const id_paiement = session.metadata?.id_paiement;

    if (!id_paiement) {
      logToFile('❌ id_paiement manquant');
      return;
    }

    const paiement = await Paiement.findByPk(id_paiement);

    if (!paiement) {
      logToFile(`❌ Paiement ${id_paiement} introuvable`);
      return;
    }

    if (!paiement.Status) {
      await paiement.update({ Status: true });
    }

    logToFile({
      message: `Paiement n°${id_paiement} confirmé`,
      projet_id,
      id_paiement,
      newStatus: true
    });
  }

  return true;
}

module.exports = {
  handleStripeWebhook
};