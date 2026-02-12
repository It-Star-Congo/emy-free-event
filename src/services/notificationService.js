const EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send";

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || "service_eip0lei";
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || "template_7izxe49";
const EMAILJS_USER_ID = process.env.EMAILJS_USER_ID || "0itHGT0RE2JJZzn8U";

function canSendEmail() {
  return Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_USER_ID);
}

async function sendViaEmailJs({ name, contact, subject, message }) {
  if (!canSendEmail()) return { skipped: true };

  const payload = {
    service_id: EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id: EMAILJS_USER_ID,
    public_key: EMAILJS_USER_ID,
    template_params: {
      name,
      contact,
      subject,
      message
    }
  };

  try {
    const response = await fetch(EMAILJS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, status: response.status, error: text || `HTTP ${response.status}` };
    }
    return { ok: true, status: response.status };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function sendQuoteEmailMock(quote) {
  if (!quote.email) return { skipped: true, reason: "missing-customer-email" };
  return sendViaEmailJs({
    name: quote.customerName,
    contact: quote.email,
    subject: `Confirmation devis #${quote.id} - EMY FREE EVENT`,
    message:
      `Bonjour ${quote.customerName}, votre demande de devis #${quote.id} a ete recue.\n` +
      `Evenement: ${quote.eventType}\nDate: ${quote.eventDate}\nLieu: ${quote.location}\n` +
      "Notre equipe vous contacte rapidement."
  });
}

async function sendQuoteAdminNotification(quote) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return { skipped: true, reason: "missing-admin-email" };
  return sendViaEmailJs({
    name: "Admin EMY FREE EVENT",
    contact: adminEmail,
    subject: `Nouveau devis #${quote.id}`,
    message:
      `Client: ${quote.customerName}\nTelephone: ${quote.phone}\nEmail: ${quote.email || "-"}\n` +
      `Evenement: ${quote.eventType}\nDate: ${quote.eventDate}\nLieu: ${quote.location}`
  });
}

async function sendInvoiceEmail(order, items, invoiceUrl) {
  if (!order.email) return { customerResult: { skipped: true, reason: "missing-customer-email" } };

  return {
    customerResult: {
      skipped: true,
      reason: "emailjs-server-side-disabled",
      invoiceUrl
    },
    adminResult: { skipped: true }
  };
}

module.exports = { sendQuoteEmailMock, sendQuoteAdminNotification, sendInvoiceEmail };
