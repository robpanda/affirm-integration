// Salesforce Affirm Payment Injector
(function() {
    // Wait for page to load
    setTimeout(function() {
        // Try to find the invoice amount on the page
        let amount = 0;
        
        // Common selectors for invoice amounts
        const amountSelectors = [
            '[class*="total"]',
            '[class*="amount"]',
            '[id*="total"]',
            '[id*="amount"]',
            'td:contains("$")',
            '.currency',
            '.money'
        ];
        
        // Search for amount in the page
        for (let selector of amountSelectors) {
            const elements = document.querySelectorAll(selector);
            for (let el of elements) {
                const text = el.textContent || el.innerText;
                const match = text.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
                if (match) {
                    amount = Math.max(amount, parseFloat(match[1].replace(',', '')) * 100);
                }
            }
        }
        
        // Get invoice ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const invoiceId = urlParams.get('invoiceId');
        
        // Create Affirm payment button
        const affirmButton = document.createElement('div');
        affirmButton.innerHTML = `
            <div style="margin: 20px 0; padding: 15px; border: 2px solid #007cba; border-radius: 8px; background: #f8f9fa;">
                <h3 style="margin: 0 0 10px 0; color: #007cba;">Pay with Affirm</h3>
                <p style="margin: 0 0 15px 0; font-size: 14px;">Buy now, pay over time with flexible monthly payments</p>
                <button onclick="window.open('https://main.d1pu69wxa8lwvk.amplifyapp.com/invoice-payment.html?invoiceId=${invoiceId}&amount=${amount}', '_blank')" 
                        style="background: #007cba; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
                    Pay $${(amount/100).toFixed(2)} with Affirm
                </button>
            </div>
        `;
        
        // Insert after the main payment form
        const paymentForm = document.querySelector('form') || document.querySelector('.payment') || document.body;
        paymentForm.appendChild(affirmButton);
        
    }, 2000); // Wait 2 seconds for page to fully load
})();