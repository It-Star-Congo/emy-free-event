const { Op } = require("sequelize");
const crypto = require("crypto");
const {
  Product,
  Pack,
  QuoteRequest,
  Realisation,
  Order,
  OrderItem,
  PaymentTransaction,
  sequelize
} = require("../models");
const { toArray, toObject } = require("../utils/json");
const { getCart, addToCart, removeFromCart, updateQuantity } = require("../services/cartService");
const {
  sendQuoteEmailMock,
  sendQuoteAdminNotification
} = require("../services/notificationService");
const { quoteToWhatsAppMessage, makeWhatsAppLink } = require("../utils/whatsapp");
const { storeFile } = require("../services/storageService");
const { createPaymentSession } = require("../services/paymentService");
const { buildInvoicePdf } = require("../services/pdfService");

const categories = ["Son", "Lumière", "Vidéo", "Scène", "Énergie", "Accessoires"];

function normalizeMulti(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function sanitizeEntityJson(entity) {
  if (!entity) return entity;
  return {
    ...entity.toJSON(),
    images: toArray(entity.images),
    needs: toArray(entity.needs),
    itemsJson: toArray(entity.itemsJson),
    optionsJson: toObject(entity.optionsJson)
  };
}

function getBackRedirect(req, fallback = "/catalogue") {
  return req.body.next || req.get("referer") || fallback;
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + (Number(item.pricePerDay) || 0) * (Number(item.quantity) || 0), 0);
}

async function home(req, res) {
  const [packs, products, realisations] = await Promise.all([
    Pack.findAll({ order: [["pricePerDay", "ASC"]], limit: 3 }),
    Product.findAll({ where: { isActive: true }, order: [["createdAt", "DESC"]], limit: 6 }),
    Realisation.findAll({ order: [["eventDate", "DESC"]], limit: 3 })
  ]);

  res.render("pages/home", {
    packs: packs.map(sanitizeEntityJson),
    products: products.map(sanitizeEntityJson),
    realisations
  });
}

function services(req, res) {
  const serviceItems = [
    {
      title: "LOCATION DE MATERIEL DE SONORISATION",
      slug: "location-materiel-sonorisation",
      content: "Parc professionnel pour concerts, shows live, conferences et tournees."
    },
    {
      title: "ECOUTE, CONSEIL ET PLANIFICATION",
      slug: "ecoute-conseil-planification",
      content: "Etude technique, reperage et recommandations adaptees a votre budget."
    },
    {
      title: "INSTALLATION ET MAINTENANCE",
      slug: "installation-maintenance",
      content: "Montage, reglages et supervision technique son/lumiere le jour J."
    }
  ];
  res.render("pages/services", { services: serviceItems });
}

function serviceDetail(req, res) {
  const detailMap = {
    "location-materiel-sonorisation": {
      title: "Location de materiel de sonorisation",
      text: "Enceintes, subs, consoles, micros et peripheriques pour toutes jauges de concert."
    },
    "ecoute-conseil-planification": {
      title: "Ecoute, conseil et planification",
      text: "Accompagnement complet de la conception a la feuille de route technique."
    },
    "installation-maintenance": {
      title: "Installation et maintenance",
      text: "Equipe terrain pour installation, exploitation et maintenance preventive."
    }
  };
  const data = detailMap[req.params.slug];
  if (!data) return res.status(404).render("pages/not-found", { message: "Service introuvable." });
  return res.render("pages/service-detail", { service: data });
}

async function packsConcerts(req, res) {
  const packs = await Pack.findAll({ order: [["pricePerDay", "ASC"]] });
  res.render("pages/packs", { packs: packs.map(sanitizeEntityJson) });
}

async function catalogue(req, res) {
  const { category, q, minPrice, maxPrice, power, dispo } = req.query;
  const where = { isActive: true };

  if (category) where.category = category;
  if (q) where.name = { [Op.like]: `%${q}%` };
  if (power) where.power = { [Op.like]: `%${power}%` };
  if (minPrice || maxPrice) {
    where.pricePerDay = {};
    if (minPrice) where.pricePerDay[Op.gte] = Number(minPrice);
    if (maxPrice) where.pricePerDay[Op.lte] = Number(maxPrice);
  }
  if (dispo === "1") where.isActive = true;

  const products = await Product.findAll({ where, order: [["createdAt", "DESC"]] });
  res.render("pages/catalogue", { products: products.map(sanitizeEntityJson), categories, filters: req.query });
}

async function productDetail(req, res) {
  const product = await Product.findOne({ where: { slug: req.params.slug, isActive: true } });
  if (!product) return res.status(404).render("pages/not-found", { message: "Produit introuvable." });
  return res.render("pages/product-detail", { product: sanitizeEntityJson(product) });
}

async function addToQuoteCart(req, res) {
  const product = await Product.findByPk(Number(req.body.productId));
  if (product) addToCart(req.session, product, req.body.quantity);
  res.redirect(getBackRedirect(req));
}

function removeFromQuoteCart(req, res) {
  removeFromCart(req.session, req.body.productId);
  res.redirect(getBackRedirect(req, "/devis"));
}

function updateQuoteCart(req, res) {
  updateQuantity(req.session, req.body.productId, req.body.quantity);
  res.redirect(getBackRedirect(req, "/devis"));
}

async function quoteForm(req, res) {
  const step = Math.min(Math.max(Number(req.query.step || 1), 1), 3);
  const [packs] = await Promise.all([Pack.findAll({ order: [["pricePerDay", "ASC"]] })]);
  const cart = getCart(req.session);
  const quoteDraft = req.session.quoteDraft || {};

  res.render("pages/quote", {
    step,
    packs: packs.map(sanitizeEntityJson),
    cart,
    quoteDraft
  });
}

function saveQuoteStep(req, res) {
  const step = Number(req.body.step || 1);
  const draft = req.session.quoteDraft || {};

  if (step === 1) {
    draft.customerName = req.body.customerName;
    draft.phone = req.body.phone;
    draft.email = req.body.email;
  }
  if (step === 2) {
    draft.eventType = req.body.eventType;
    draft.eventDate = req.body.eventDate;
    draft.location = req.body.location;
    draft.audience = Number(req.body.audience || 0);
    draft.packId = req.body.packId ? Number(req.body.packId) : null;
  }
  if (step === 3) {
    draft.needs = normalizeMulti(req.body.needs);
    draft.optionsJson = {
      installation: Boolean(req.body.installation),
      technicienSon: Boolean(req.body.technicienSon),
      technicienLumiere: Boolean(req.body.technicienLumiere),
      heureDebut: req.body.heureDebut || "",
      heureFin: req.body.heureFin || "",
      notes: req.body.notes || ""
    };
  }

  req.session.quoteDraft = draft;
  const nextStep = Math.min(step + 1, 3);
  res.redirect(`/devis?step=${nextStep}`);
}

async function submitQuote(req, res) {
  const draft = req.session.quoteDraft || {};
  const cart = getCart(req.session);
  if (!draft.customerName || !draft.phone || !draft.eventType || !draft.eventDate || !draft.location) {
    return res.redirect("/devis?step=1");
  }

  let riderFilePath = null;
  if (req.file) riderFilePath = await storeFile(req.file, "uploads");

  const quote = await QuoteRequest.create({
    customerName: draft.customerName,
    phone: draft.phone,
    email: draft.email,
    eventType: draft.eventType,
    eventDate: draft.eventDate,
    location: draft.location,
    audience: draft.audience || null,
    needs: draft.needs || [],
    itemsJson: cart,
    packId: draft.packId || null,
    optionsJson: draft.optionsJson || {},
    status: "nouveau",
    riderFile: riderFilePath
  });

  try {
    await sendQuoteEmailMock(quote);
    await sendQuoteAdminNotification(quote);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[QUOTE EMAIL ERROR]", error.message);
  }
  const message = quoteToWhatsAppMessage(quote.toJSON(), process.env.APP_URL || "http://localhost:3000");
  const whatsappLink = makeWhatsAppLink(message, process.env.WHATSAPP_PHONE || "2250707022425");

  req.session.quoteCart = [];
  req.session.quoteDraft = null;
  res.redirect(`/devis/confirmation?id=${quote.id}&wa=${encodeURIComponent(whatsappLink)}`);
}

async function quoteConfirmation(req, res) {
  const quote = await QuoteRequest.findByPk(Number(req.query.id), { include: [Pack] });
  if (!quote) return res.redirect("/devis");
  res.render("pages/quote-confirmation", {
    quote: sanitizeEntityJson(quote),
    whatsappLink: req.query.wa || "#"
  });
}

function checkoutPage(req, res) {
  const cart = getCart(req.session);
  const total = cartTotal(cart);
  res.render("pages/checkout", { cart, total, error: req.query.error === "1" });
}

async function checkoutStart(req, res) {
  const cart = getCart(req.session);
  if (!cart.length) return res.redirect("/catalogue");

  const customerName = (req.body.customerName || "").trim();
  const phone = (req.body.phone || "").trim();
  const email = (req.body.email || "").trim();
  if (!customerName || !phone) return res.redirect("/checkout?error=1");

  const total = cartTotal(cart);

  const paymentUrl = await sequelize.transaction(async (transaction) => {
    const order = await Order.create(
      {
        customerName,
        phone,
        email: email || null,
        totalAmount: total,
        currency: "XOF",
        status: "pending",
        paymentStatus: "pending"
      },
      { transaction }
    );

    await OrderItem.bulkCreate(
      cart.map((item) => ({
        orderId: order.id,
        productId: item.productId || null,
        productName: item.name,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.pricePerDay) || 0,
        lineTotal: (Number(item.pricePerDay) || 0) * (Number(item.quantity) || 1)
      })),
      { transaction }
    );

    const session = createPaymentSession({ order, provider: "mock" });
    await PaymentTransaction.create(
      {
        orderId: order.id,
        provider: session.provider,
        amount: total,
        currency: "XOF",
        status: "pending",
        providerRef: session.providerRef,
        checkoutToken: session.checkoutToken
      },
      { transaction }
    );

    return session.paymentUrl;
  });

  return res.redirect(paymentUrl);
}

async function checkoutPayPage(req, res) {
  const orderId = Number(req.params.orderId);
  const token = req.query.token;

  const order = await Order.findByPk(orderId, {
    include: [{ model: OrderItem }, { model: PaymentTransaction }]
  });
  if (!order) return res.redirect("/checkout");

  const transaction = (order.PaymentTransactions || []).find((tx) => tx.checkoutToken === token);
  if (!transaction) return res.status(403).render("pages/not-found", { message: "Session de paiement invalide." });

  return res.render("pages/payment", { order, transaction });
}

async function checkoutConfirm(req, res) {
  const orderId = Number(req.params.orderId);
  const token = req.body.token;
  const tx = await PaymentTransaction.findOne({ where: { orderId, checkoutToken: token } });
  if (!tx) return res.redirect("/checkout");

  await sequelize.transaction(async (dbTx) => {
    await tx.update({ status: "succeeded" }, { transaction: dbTx });
    await Order.update({ paymentStatus: "paid", status: "confirmed" }, { where: { id: orderId }, transaction: dbTx });
  });

  const mailed = "0";
  const invoiceToken = token;

  req.session.quoteCart = [];
  if (!req.session.invoiceTokensByOrder) req.session.invoiceTokensByOrder = {};
  req.session.invoiceTokensByOrder[String(orderId)] = invoiceToken;

  return res.redirect(`/checkout/success?order=${orderId}&mailed=${mailed}&token=${encodeURIComponent(invoiceToken)}`);
}

async function checkoutCancel(req, res) {
  const orderId = Number(req.params.orderId);
  const token = req.body.token;
  const tx = await PaymentTransaction.findOne({ where: { orderId, checkoutToken: token } });
  if (tx) await tx.update({ status: "cancelled" });
  await Order.update({ status: "cancelled", paymentStatus: "pending" }, { where: { id: orderId } });
  return res.redirect(`/checkout/cancel?order=${orderId}`);
}

async function checkoutSuccess(req, res) {
  const orderId = Number(req.query.order);
  const order = await Order.findByPk(orderId, { include: [OrderItem] });
  if (!order) return res.redirect("/checkout");

  let resolvedToken = req.query.token || "";
  if (!resolvedToken && req.session.invoiceTokensByOrder && req.session.invoiceTokensByOrder[String(orderId)]) {
    resolvedToken = req.session.invoiceTokensByOrder[String(orderId)];
  }
  if (!resolvedToken) {
    const latestTx = await PaymentTransaction.findOne({
      where: { orderId },
      order: [["updatedAt", "DESC"]]
    });
    resolvedToken = latestTx?.checkoutToken || "";
  }
  if (!resolvedToken && order.paymentStatus === "paid") {
    resolvedToken = crypto.randomBytes(24).toString("hex");
    await PaymentTransaction.create({
      orderId,
      provider: "legacy",
      amount: order.totalAmount,
      currency: order.currency,
      status: "succeeded",
      providerRef: `legacy_${orderId}_${Date.now()}`,
      checkoutToken: resolvedToken
    });
  }
  if (resolvedToken) {
    if (!req.session.invoiceTokensByOrder) req.session.invoiceTokensByOrder = {};
    req.session.invoiceTokensByOrder[String(orderId)] = resolvedToken;
  }

  return res.render("pages/checkout-success", {
    order,
    mailed: req.query.mailed === "1",
    invoiceToken: resolvedToken
  });
}

async function checkoutInvoice(req, res) {
  const orderId = Number(req.params.orderId);
  let token = req.query.token;
  if (!token && req.session.invoiceTokensByOrder) {
    token = req.session.invoiceTokensByOrder[String(orderId)];
  }
  if (!token) return res.redirect("/checkout");

  const order = await Order.findByPk(orderId, { include: [OrderItem] });
  if (!order || order.paymentStatus !== "paid") return res.redirect("/checkout");

  const tx = await PaymentTransaction.findOne({
    where: { orderId, checkoutToken: token }
  });
  if (!tx) return res.redirect("/checkout");

  return buildInvoicePdf(res, order, order.OrderItems || []);
}

async function checkoutCancelPage(req, res) {
  const order = await Order.findByPk(Number(req.query.order));
  return res.render("pages/checkout-cancel", { order });
}

async function realisations(req, res) {
  const rows = await Realisation.findAll({ order: [["eventDate", "DESC"]] });
  res.render("pages/realisations", { realisations: rows });
}

function about(req, res) {
  res.render("pages/about");
}

function contact(req, res) {
  res.render("pages/contact");
}

function cgv(req, res) {
  res.render("pages/cgv");
}

function privacy(req, res) {
  res.render("pages/privacy");
}

module.exports = {
  home,
  services,
  serviceDetail,
  packsConcerts,
  catalogue,
  productDetail,
  addToQuoteCart,
  removeFromQuoteCart,
  updateQuoteCart,
  quoteForm,
  saveQuoteStep,
  submitQuote,
  quoteConfirmation,
  checkoutPage,
  checkoutStart,
  checkoutPayPage,
  checkoutConfirm,
  checkoutCancel,
  checkoutSuccess,
  checkoutInvoice,
  checkoutCancelPage,
  realisations,
  about,
  contact,
  cgv,
  privacy
};


