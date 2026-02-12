const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const SVGtoPDF = require("svg-to-pdfkit");

const COLORS = {
  text: "#1f2937",
  muted: "#6b7280",
  brand: "#b8860b",
  softBrand: "#f8e7b5",
  border: "#d1d5db",
  panel: "#f9fafb"
};

const BRAND = {
  name: "EMY FREE EVENT",
  baseline: "Location materiel concert | Son | Lumiere | Scene",
  logoPath: path.join(process.cwd(), "public", "uploads", "logo-emy-free-event.svg")
};

function formatMoney(value, currency = "XOF") {
  return `${Number(value || 0).toLocaleString("fr-FR")} ${currency}`;
}

function formatDate(value) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return "-";
  return d.toISOString().slice(0, 10);
}

function newDoc() {
  return new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
}

function registerBrandFonts(doc) {
  const regular = path.join(process.cwd(), "node_modules", "@fontsource", "poppins", "files", "poppins-latin-400-normal.woff");
  const semibold = path.join(process.cwd(), "node_modules", "@fontsource", "poppins", "files", "poppins-latin-600-normal.woff");
  const bold = path.join(process.cwd(), "node_modules", "@fontsource", "poppins", "files", "poppins-latin-700-normal.woff");

  const fonts = {
    regular: "Helvetica",
    semibold: "Helvetica-Bold",
    bold: "Helvetica-Bold"
  };

  try {
    if (fs.existsSync(regular)) {
      doc.registerFont("BrandRegular", regular);
      fonts.regular = "BrandRegular";
    }
    if (fs.existsSync(semibold)) {
      doc.registerFont("BrandSemibold", semibold);
      fonts.semibold = "BrandSemibold";
    }
    if (fs.existsSync(bold)) {
      doc.registerFont("BrandBold", bold);
      fonts.bold = "BrandBold";
    }
  } catch (error) {
    // Fallback Helvetica
  }

  return fonts;
}

function drawLogo(doc, x, y) {
  try {
    if (fs.existsSync(BRAND.logoPath)) {
      const svg = fs.readFileSync(BRAND.logoPath, "utf8");
      SVGtoPDF(doc, svg, x, y, { width: 66, height: 54, preserveAspectRatio: "xMinYMin meet" });
      return true;
    }
  } catch (error) {
    // fallback below
  }

  doc.save();
  doc.roundedRect(x, y + 2, 52, 38, 6).fill(COLORS.softBrand).stroke(COLORS.brand);
  doc.restore();
  return false;
}

function drawPageHeader(doc, fonts, title, reference) {
  const x = doc.page.margins.left;
  const w = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  doc.save();
  doc.roundedRect(x, 30, w, 90, 10).fill(COLORS.panel).stroke(COLORS.border);

  drawLogo(doc, x + 14, 46);

  doc.fillColor(COLORS.brand).font(fonts.bold).fontSize(17).text(BRAND.name, x + 90, 49);
  doc.fillColor(COLORS.muted).font(fonts.regular).fontSize(9).text(BRAND.baseline, x + 90, 72, { width: 230 });

  doc.fillColor(COLORS.text).font(fonts.semibold).fontSize(15).text(title, x + 90, 90, { width: w - 260 });
  doc.fillColor(COLORS.muted).font(fonts.regular).fontSize(10).text(reference, x + w - 190, 91, {
    width: 176,
    align: "right"
  });
  doc.restore();

  doc.y = 134;
}

function drawInfoBox(doc, fonts, title, lines, x, y, w) {
  const lineHeight = 14;
  const boxH = 24 + lines.length * lineHeight + 10;

  doc.save();
  doc.roundedRect(x, y, w, boxH, 8).fill("#ffffff").stroke(COLORS.border);
  doc.fillColor(COLORS.brand).font(fonts.semibold).fontSize(10).text(title, x + 10, y + 8);
  doc.fillColor(COLORS.text).font(fonts.regular).fontSize(10);
  lines.forEach((line, i) => {
    doc.text(line, x + 10, y + 24 + i * lineHeight, { width: w - 20 });
  });
  doc.restore();

  return boxH;
}

function drawTableHeader(doc, fonts, y, columns) {
  doc.save();
  doc.rect(40, y, 515, 24).fill(COLORS.softBrand).stroke(COLORS.border);
  doc.fillColor(COLORS.text).font(fonts.semibold).fontSize(9);
  columns.forEach((col) => {
    doc.text(col.label, col.x, y + 8, { width: col.w, align: col.align || "left" });
  });
  doc.restore();
}

function drawTableRow(doc, fonts, y, columns, row) {
  doc.save();
  doc.rect(40, y, 515, 22).stroke(COLORS.border);
  doc.fillColor(COLORS.text).font(fonts.regular).fontSize(9);
  columns.forEach((col) => {
    doc.text(String(row[col.key] ?? "-"), col.x, y + 7, { width: col.w, align: col.align || "left" });
  });
  doc.restore();
}

function ensureRoom(doc, neededHeight, redrawHeader) {
  if (doc.y + neededHeight <= 770) return;
  doc.addPage();
  if (typeof redrawHeader === "function") redrawHeader();
}

function addPagination(doc, fonts) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(i);
    const label = `Page ${i + 1} / ${range.count}`;
    doc.fillColor(COLORS.muted).font(fonts.regular).fontSize(8).text(label, 40, 805, {
      width: 515,
      align: "right"
    });
  }
}

function writeQuoteContent(doc, fonts, quote) {
  drawPageHeader(doc, fonts, "Demande de devis", `Reference: DEV-${quote.id}`);

  const x = 40;
  const gap = 12;
  const w = (515 - gap) / 2;
  const y = doc.y;

  const h1 = drawInfoBox(
    doc,
    fonts,
    "Client",
    [
      `Nom: ${quote.customerName || "-"}`,
      `Telephone: ${quote.phone || "-"}`,
      `Email: ${quote.email || "-"}`,
      `Lieu: ${quote.location || "-"}`
    ],
    x,
    y,
    w
  );

  const h2 = drawInfoBox(
    doc,
    fonts,
    "Evenement",
    [
      `Type: ${quote.eventType || "-"}`,
      `Date: ${quote.eventDate || "-"}`,
      `Audience: ${quote.audience || "-"}`,
      `Statut: ${quote.status || "-"}`
    ],
    x + w + gap,
    y,
    w
  );

  doc.y = y + Math.max(h1, h2) + 18;

  doc.fillColor(COLORS.brand).font(fonts.semibold).fontSize(11).text("Besoins techniques");
  doc.moveDown(0.5);
  doc.fillColor(COLORS.text).font(fonts.regular).fontSize(10);
  if (!quote.needs || !quote.needs.length) {
    doc.text("Aucun besoin specifie.");
  } else {
    quote.needs.forEach((need) => doc.text(`- ${need}`));
  }

  doc.moveDown(1);
  doc.fillColor(COLORS.brand).font(fonts.semibold).fontSize(11).text("Materiel demande");
  doc.moveDown(0.4);

  const columns = [
    { key: "name", label: "Article", x: 48, w: 290 },
    { key: "quantity", label: "Qte", x: 345, w: 50, align: "center" },
    { key: "unit", label: "Prix/jour", x: 400, w: 70, align: "right" },
    { key: "line", label: "Total", x: 475, w: 70, align: "right" }
  ];

  const redraw = () => {
    doc.y = 40;
    drawPageHeader(doc, fonts, "Demande de devis", `Reference: DEV-${quote.id}`);
    drawTableHeader(doc, fonts, doc.y, columns);
    doc.y += 24;
  };

  drawTableHeader(doc, fonts, doc.y, columns);
  doc.y += 24;

  let total = 0;
  (quote.itemsJson || []).forEach((item) => {
    const qty = Number(item.quantity || 0);
    const unit = Number(item.pricePerDay || 0);
    const lineTotal = qty * unit;
    total += lineTotal;

    ensureRoom(doc, 24, redraw);
    drawTableRow(doc, fonts, doc.y, columns, {
      name: item.name || "-",
      quantity: qty,
      unit: formatMoney(unit, "XOF"),
      line: formatMoney(lineTotal, "XOF")
    });
    doc.y += 22;
  });

  doc.moveDown(0.8);
  doc.font(fonts.bold).fillColor(COLORS.text).text(`Estimation totale: ${formatMoney(total, "XOF")}`, { align: "right" });

  doc.moveDown(1);
  doc.font(fonts.semibold).fillColor(COLORS.brand).text("Notes options", { align: "left" });
  doc.font(fonts.regular).fillColor(COLORS.text).fontSize(10).text(JSON.stringify(quote.optionsJson || {}, null, 2), {
    width: 515
  });

  doc.moveDown(1);
  doc.fontSize(9).fillColor(COLORS.muted).font(fonts.regular).text(
    "Document genere automatiquement. Un conseiller EMY FREE EVENT vous contactera rapidement.",
    40,
    790,
    { width: 515, align: "center" }
  );
}

function writeInvoiceContent(doc, fonts, order, items) {
  drawPageHeader(doc, fonts, "Facture", `Facture: INV-${order.id}`);

  const x = 40;
  const gap = 12;
  const w = (515 - gap) / 2;
  const y = doc.y;

  const h1 = drawInfoBox(
    doc,
    fonts,
    "Facture",
    [
      `Commande: #${order.id}`,
      `Date: ${formatDate(order.updatedAt || order.createdAt)}`,
      `Statut paiement: ${order.paymentStatus || "-"}`,
      `Devise: ${order.currency || "XOF"}`
    ],
    x,
    y,
    w
  );

  const h2 = drawInfoBox(
    doc,
    fonts,
    "Client",
    [`Nom: ${order.customerName || "-"}`, `Telephone: ${order.phone || "-"}`, `Email: ${order.email || "-"}`],
    x + w + gap,
    y,
    w
  );

  doc.y = y + Math.max(h1, h2) + 18;

  const columns = [
    { key: "name", label: "Article", x: 48, w: 265 },
    { key: "quantity", label: "Qte", x: 320, w: 45, align: "center" },
    { key: "unit", label: "Prix unitaire", x: 370, w: 85, align: "right" },
    { key: "line", label: "Total ligne", x: 460, w: 85, align: "right" }
  ];

  const redraw = () => {
    doc.y = 40;
    drawPageHeader(doc, fonts, "Facture", `Facture: INV-${order.id}`);
    drawTableHeader(doc, fonts, doc.y, columns);
    doc.y += 24;
  };

  drawTableHeader(doc, fonts, doc.y, columns);
  doc.y += 24;

  let grandTotal = 0;
  (items || []).forEach((item) => {
    const qty = Number(item.quantity || 0);
    const unit = Number(item.unitPrice || 0);
    const lineTotal = Number(item.lineTotal || qty * unit);
    grandTotal += lineTotal;

    ensureRoom(doc, 24, redraw);
    drawTableRow(doc, fonts, doc.y, columns, {
      name: item.productName || "-",
      quantity: qty,
      unit: formatMoney(unit, order.currency),
      line: formatMoney(lineTotal, order.currency)
    });
    doc.y += 22;
  });

  doc.moveDown(1);
  doc.save();
  doc.roundedRect(360, doc.y, 195, 62, 8).fill(COLORS.panel).stroke(COLORS.border);
  doc.fillColor(COLORS.muted).font(fonts.regular).fontSize(10).text("Total TTC", 372, doc.y + 12);
  doc.fillColor(COLORS.brand).font(fonts.bold).fontSize(16).text(formatMoney(grandTotal, order.currency), 372, doc.y + 30);
  doc.restore();

  doc.moveDown(5);
  doc.fillColor(COLORS.muted).font(fonts.regular).fontSize(9).text(
    "Merci pour votre confiance. Cette facture tient lieu de justificatif de paiement.",
    40,
    790,
    { width: 515, align: "center" }
  );
}

function buildQuotePdf(res, quote) {
  const doc = newDoc();
  const fonts = registerBrandFonts(doc);
  const fileName = `devis-${quote.id}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  doc.pipe(res);
  writeQuoteContent(doc, fonts, quote);
  addPagination(doc, fonts);
  doc.end();
}

function buildInvoicePdf(res, order, items) {
  const doc = newDoc();
  const fonts = registerBrandFonts(doc);
  const fileName = `facture-${order.id}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  doc.pipe(res);
  writeInvoiceContent(doc, fonts, order, items);
  addPagination(doc, fonts);
  doc.end();
}

function buildInvoicePdfBuffer(order, items) {
  return new Promise((resolve, reject) => {
    const doc = newDoc();
    const fonts = registerBrandFonts(doc);
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    writeInvoiceContent(doc, fonts, order, items);
    addPagination(doc, fonts);
    doc.end();
  });
}

module.exports = { buildQuotePdf, buildInvoicePdf, buildInvoicePdfBuffer };
