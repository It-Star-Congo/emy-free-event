const crypto = require("crypto");

function generateCheckoutToken() {
  return crypto.randomBytes(24).toString("hex");
}

function createPaymentSession({ order, provider = "mock" }) {
  const checkoutToken = generateCheckoutToken();
  const paymentUrl = `/checkout/payer/${order.id}?token=${checkoutToken}`;
  return {
    provider,
    providerRef: `${provider}_${Date.now()}_${order.id}`,
    checkoutToken,
    paymentUrl
  };
}

module.exports = { createPaymentSession };

