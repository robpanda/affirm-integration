require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jsforce = require('jsforce');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Root route for health check
app.get('/', (req, res) => {
  res.json({ status: 'Affirm Payment Server Running', endpoints: ['/create-payment-intent', '/capture-payment'] });
});

// Salesforce connection
const conn = new jsforce.Connection({
  loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com'
});

// Get invoice data from Salesforce
app.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    // Login to Salesforce if not already connected
    if (!conn.accessToken) {
      await conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD + process.env.SF_SECURITY_TOKEN);
    }
    
    // Query FinancialForce invoice - try both standard and custom objects
    let invoice;
    try {
      // Try FinancialForce invoice object first
      invoice = await conn.sobject('fw1__Invoice__c').retrieve(invoiceId);
    } catch (e) {
      // Fallback to standard Invoice object
      invoice = await conn.sobject('Invoice').retrieve(invoiceId);
    }
    
    // Extract amount (try different field names)
    const amount = invoice.fw1__Total__c || invoice.Amount || invoice.TotalAmount || 3500;
    const amountCents = Math.round(amount * 100);
    
    res.json({ 
      invoiceId, 
      amount: amountCents, 
      currency: 'usd',
      invoiceNumber: invoice.Name || invoice.InvoiceNumber,
      description: `Invoice ${invoice.Name || invoiceId}`
    });
  } catch (error) {
    console.error('Salesforce API Error:', error.message);
    // Fallback to default amount if Salesforce fails
    res.json({ invoiceId: req.params.invoiceId, amount: 3500, currency: 'usd' });
  }
});

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount = 3500, currency = 'usd', invoiceId } = req.body || {};

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