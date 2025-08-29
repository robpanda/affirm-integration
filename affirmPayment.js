import { LightningElement, api } from 'lwc';

export default class AffirmPayment extends LightningElement {
    @api invoiceId;
    
    handleAffirmPayment() {
        const affirmUrl = `https://main.d1pu69wxa8lwvk.amplifyapp.com/invoice-payment.html?invoiceId=${this.invoiceId}`;
        window.open(affirmUrl, '_blank');
    }
}