<?php
/**
 * Plugin Name: Affirm Stripe Payment
 * Description: Adds Affirm payment integration via Stripe
 * Version: 1.0
 * Author: Your Company
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class AffirmStripePlugin {
    
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('affirm_payment', array($this, 'affirm_payment_shortcode'));
        add_action('admin_menu', array($this, 'admin_menu'));
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('stripe-js', 'https://js.stripe.com/v3/', array(), null, true);
    }
    
    public function affirm_payment_shortcode($atts) {
        $atts = shortcode_atts(array(
            'amount' => '3500',
            'currency' => 'usd'
        ), $atts);
        
        $publishable_key = get_option('affirm_stripe_publishable_key', '');
        $api_url = get_option('affirm_stripe_api_url', '');
        
        if (empty($publishable_key) || empty($api_url)) {
            return '<p>Please configure Affirm Stripe settings in WordPress admin.</p>';
        }
        
        $unique_id = uniqid('affirm_');
        
        ob_start();
        ?>
        <div id="<?php echo $unique_id; ?>_container">
            <div id="<?php echo $unique_id; ?>_element"></div>
            <button id="<?php echo $unique_id; ?>_button">Pay with Affirm</button>
        </div>
        
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof Stripe === 'undefined') {
                console.error('Stripe.js not loaded');
                return;
            }
            
            const stripe = Stripe('<?php echo esc_js($publishable_key); ?>');
            let elements, affirmElement;

            async function initialize() {
                try {
                    const response = await fetch('<?php echo esc_js($api_url); ?>/create-payment-intent', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            amount: <?php echo intval($atts['amount']); ?>,
                            currency: '<?php echo esc_js($atts['currency']); ?>'
                        }),
                    });
                    
                    const data = await response.json();
                    elements = stripe.elements({ clientSecret: data.client_secret });
                    affirmElement = elements.create('affirm');
                    affirmElement.mount('#<?php echo $unique_id; ?>_element');
                } catch (error) {
                    console.error('Error initializing payment:', error);
                }
            }

            async function handleSubmit(event) {
                event.preventDefault();
                
                try {
                    const { error, paymentIntent } = await stripe.confirmPayment({
                        elements,
                        confirmParams: {
                            return_url: window.location.href,
                        },
                        redirect: 'if_required'
                    });

                    if (error) {
                        alert('Payment failed: ' + error.message);
                    } else if (paymentIntent && paymentIntent.status === 'requires_capture') {
                        await fetch('<?php echo esc_js($api_url); ?>/capture-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ payment_intent_id: paymentIntent.id })
                        });
                        alert('Payment successful!');
                    }
                } catch (error) {
                    console.error('Payment error:', error);
                    alert('Payment failed');
                }
            }

            document.getElementById('<?php echo $unique_id; ?>_button').addEventListener('click', handleSubmit);
            initialize();
        });
        </script>
        <?php
        return ob_get_clean();
    }
    
    public function admin_menu() {
        add_options_page(
            'Affirm Stripe Settings',
            'Affirm Stripe',
            'manage_options',
            'affirm-stripe-settings',
            array($this, 'admin_page')
        );
    }
    
    public function admin_page() {
        if (isset($_POST['submit'])) {
            update_option('affirm_stripe_publishable_key', sanitize_text_field($_POST['publishable_key']));
            update_option('affirm_stripe_api_url', sanitize_text_field($_POST['api_url']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        $publishable_key = get_option('affirm_stripe_publishable_key', '');
        $api_url = get_option('affirm_stripe_api_url', '');
        ?>
        <div class="wrap">
            <h1>Affirm Stripe Settings</h1>
            <form method="post">
                <table class="form-table">
                    <tr>
                        <th scope="row">Stripe Publishable Key</th>
                        <td><input type="text" name="publishable_key" value="<?php echo esc_attr($publishable_key); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th scope="row">API Gateway URL</th>
                        <td><input type="text" name="api_url" value="<?php echo esc_attr($api_url); ?>" class="regular-text" placeholder="https://your-api-id.execute-api.region.amazonaws.com/prod" /></td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            <h3>Usage</h3>
            <p>Use shortcode: <code>[affirm_payment amount="3500" currency="usd"]</code></p>
            <p>Amount is in cents (3500 = $35.00)</p>
        </div>
        <?php
    }
}

new AffirmStripePlugin();
?>