require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount = 3500, currency = 'usd' } = req.body || {};

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: ['affirm'],
      capture_method: 'manual',
    });

    res.send({
      client_secret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment Intent Error:', error.message);
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.post('/capture-payment', async (req, res) => {
  try {
    const { payment_intent_id } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.capture(payment_intent_id);
    
    res.send({ success: true, paymentIntent });
  } catch (error) {
    console.error('Capture Error:', error.message);
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});