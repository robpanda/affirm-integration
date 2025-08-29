// ==UserScript==
// @name         Salesforce Affirm Payment Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add Affirm payment option to Salesforce invoice pages
// @author       You
// @match        https://ability-saas-2460.my.salesforce-sites.com/payment/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // Wait for page to load
    setTimeout(function() {
        const urlParams = new URLSearchParams(window.location.search);
        const invoiceId = urlParams.get('invoiceId');
        
        if (!invoiceId) return;
        
        // Create Affirm payment option
        const affirmDiv = document.createElement('div');
        affirmDiv.innerHTML = `
            <div style="margin: 20px 0; padding: 20px; border: 2px solid #007cba; border-radius: 8px; background: #f8f9fa;">
                <h3 style="margin: 0 0 10px 0; color: #007cba;">Alternative Payment Method</h3>
                <p style="margin: 0 0 15px 0; font-size: 14px;">Pay with Affirm - Buy now, pay over time with flexible monthly payments</p>
                <button onclick="window.open('https://main.d1pu69wxa8lwvk.amplifyapp.com/invoice-payment.html?invoiceId=${invoiceId}', '_blank')" 
                        style="background: #007cba; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
                    Pay with Affirm
                </button>
            </div>
        `;
        
        // Find the best place to insert the button
        const targetElement = document.querySelector('form') || 
                             document.querySelector('.payment') || 
                             document.querySelector('body');
        
        targetElement.appendChild(affirmDiv);
        
    }, 3000); // Wait 3 seconds for Salesforce page to fully load
})();