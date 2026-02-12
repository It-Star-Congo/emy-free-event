function quoteToWhatsAppMessage(quote, appUrl) {
  const items = (quote.itemsJson || [])
    .map((item) => `- ${item.name} x${item.quantity}`)
    .join("\n");
  const needs = (quote.needs || []).join(", ");
  const options = quote.optionsJson ? JSON.stringify(quote.optionsJson) : "{}";

  return `Bonjour EMY FREE EVENT,
Je souhaite un devis.
Nom: ${quote.customerName}
Téléphone: ${quote.phone}
Événement: ${quote.eventType}
Date: ${quote.eventDate}
Lieu: ${quote.location}
Public: ${quote.audience || ""}
Besoins: ${needs}
Pack ID: ${quote.packId || ""}
Matériel:
${items}
Options: ${options}
Suivi: ${appUrl}/devis/confirmation?id=${quote.id}`;
}

function makeWhatsAppLink(message, phone) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

module.exports = { quoteToWhatsAppMessage, makeWhatsAppLink };
