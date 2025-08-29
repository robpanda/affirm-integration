(function() {
    // Affirm Payment Widget
    window.AffirmPaymentWidget = {
        init: function(config) {
            const amount = config.amount || 3500;
            const containerId = config.containerId || 'affirm-payment-widget';
            
            const container = document.getElementById(containerId);
            if (!container) return;
            
            // Create payment form
            container.innerHTML = `
                <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Pay with Affirm</h3>
                    <form id="affirm-widget-form">
                        <div id="affirm-widget-payment-element"></div>
                        <button type="submit" style="background: #007cba; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; margin-top: 15px;">
                            Pay $${(amount/100).toFixed(2)} with Affirm
                        </button>
                    </form>
                </div>
            `;
            
            // Load Stripe and initialize
            this.loadStripe(amount);
        },
        
        loadStripe: function(amount) {
            if (window.Stripe) {
                this.initializePayment(amount);
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = () => this.initializePayment(amount);
            document.head.appendChild(script);
        },
        
        initializePayment: function(amount) {
            const stripe = Stripe('pk_live_51P9Ull1EZLiysIlxLkg4tRxLgxxpD4Snm2xjJKgDS1C8gjPkKTU1wca2dNNUbVJ8Fn2MUR8Z55iNGGBqoSUh1fdu00mp1EMuWv');
            let elements, paymentElement;
            
            fetch('https://affirm-integration.onrender.com/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amount, currency: 'usd' }),
            })
            .then(response => response.json())
            .then(data => {
                elements = stripe.elements({ clientSecret: data.client_secret });
                paymentElement = elements.create('payment', {
                    paymentMethodTypes: ['affirm']
                });
                paymentElement.mount('#affirm-widget-payment-element');
            });
            
            document.getElementById('affirm-widget-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const { error } = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: window.location.origin + '/success.html',
                    },
                    redirect: 'if_required'
                });
                
                if (!error) {
                    alert('Payment successful!');
                }
            });
        }
    };
})();