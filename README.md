# Affirm Payment Integration

Complete Affirm payment system using Stripe with Express.js backend and static frontend.

## Files
- `affirm-checkout.html` - Payment form with Stripe Elements
- `affirm-server.js` - Express server for payment processing
- `success.html` - Payment success page
- `affirm-stripe-plugin.php` - WordPress plugin
- `amplify.yml` - AWS Amplify configuration
- `render.yaml` - Render.com deployment configuration

## Setup
1. Install dependencies: `npm install`
2. Add your Stripe keys to `.env` file
3. Run locally: `node affirm-server.js`