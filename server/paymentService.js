/**
 * Geidea Payment Service (MOCK / STRUCTURE)
 * This serves as a template for integrating the Geidea API.
 * In a real scenario, you would use the Geidea SDK or REST API with your Merchant ID and API Password.
 */

const GEIDEA_CONFIG = {
    merchantId: process.env.GEIDEA_MERCHANT_ID || 'MOCK_MERCHANT',
    apiPassword: process.env.GEIDEA_API_PASSWORD || 'MOCK_PASSWORD',
    isSandbox: process.env.PAYMENT_MODE !== 'production'
};

/**
 * Initialize a payment session.
 * @param {Object} order - Order details (total, currency, reference).
 */
async function initiatePayment(order) {
    console.log(`✦ Initiating Geidea Payment for Order #${order.id} (Total: ${order.total} EGP)`);
    
    // In production, you would call:
    // https://api.geidea.net/payment-intent/v1/direct/pay
    
    // MOCK RESPONSE
    return {
        success: true,
        paymentUrl: `https://www.geidea.net/pay/mock/${order.id}`,
        sessionId: `sess_${Date.now()}`
    };
}

/**
 * Handle Geidea Webhook / Callback.
 */
async function handleWebhook(payload) {
    // Verify signature and update order status in Supabase
    console.log("✦ Geidea Webhook received:", payload);
    return { status: 'acknowledged' };
}

module.exports = { initiatePayment, handleWebhook };
