const slugify = require("slugify");
const { Op } = require("sequelize");
const {
  Product,
  Pack,
  QuoteRequest,
  Reservation
} = require("../models");
const { toArray } = require("../utils/json");
const { buildQuotePdf } = require("../services/pdfService");
const { storeFile } = require("../services/storageService");

async function dashboard(req, res) {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [newQuotes, monthQuotes, productsCount, packsCount] = await Promise.all([
    QuoteRequest.count({ where: { status: "nouveau" } }),
    QuoteRequest.count({ where: { createdAt: { [Op.gte]: firstDayOfMonth } } }),
    Product.count(),
    Pack.count()
  ]);
  res.render("admin/dashboard", { layout: "layouts/admin", stats: { newQuotes, monthQuotes, productsCount, packsCount } });
}

async function listProducts(req, res) {
  const products = await Product.findAll({ order: [["createdAt", "DESC"]] });
  res.render("admin/products", { layout: "layouts/admin", products: products.map((p) => ({ ...p.toJSON(), images: toArray(p.images) })) });
}

async function createProduct(req, res) {
  const slug = slugify(req.body.name, { lower: true, strict: true });
  const uploadedImage = req.file ? await storeFile(req.file, "uploads") : null;
  await Product.create({
    name: req.body.name,
    slug,
    category: req.body.category,
    description: req.body.description,
    pricePerDay: Number(req.body.pricePerDay || 0),
    deposit: Number(req.body.deposit || 0),
    power: req.body.power || "",
    images: uploadedImage ? [uploadedImage] : req.body.images ? [req.body.images] : [],
    isActive: Boolean(req.body.isActive)
  });
  res.redirect("/admin/produits");
}

async function updateProduct(req, res) {
  const product = await Product.findByPk(Number(req.params.id));
  if (!product) return res.redirect("/admin/produits");
  const uploadedImage = req.file ? await storeFile(req.file, "uploads") : null;
  await product.update({
    name: req.body.name,
    slug: slugify(req.body.name, { lower: true, strict: true }),
    category: req.body.category,
    description: req.body.description,
    pricePerDay: Number(req.body.pricePerDay || 0),
    deposit: Number(req.body.deposit || 0),
    power: req.body.power || "",
    images: uploadedImage ? [uploadedImage] : req.body.images ? [req.body.images] : toArray(product.images),
    isActive: Boolean(req.body.isActive)
  });
  res.redirect("/admin/produits");
}

async function deleteProduct(req, res) {
  await Product.destroy({ where: { id: Number(req.params.id) } });
  res.redirect("/admin/produits");
}

async function listPacks(req, res) {
  const packs = await Pack.findAll({ order: [["pricePerDay", "ASC"]] });
  res.render("admin/packs", { layout: "layouts/admin", packs: packs.map((p) => ({ ...p.toJSON(), images: toArray(p.images) })) });
}

async function createPack(req, res) {
  const uploadedImage = req.file ? await storeFile(req.file, "uploads") : null;
  await Pack.create({
    name: req.body.name,
    audienceSize: req.body.audienceSize,
    includedText: req.body.includedText,
    pricePerDay: Number(req.body.pricePerDay || 0),
    optionsText: req.body.optionsText || "",
    images: uploadedImage ? [uploadedImage] : req.body.images ? [req.body.images] : []
  });
  res.redirect("/admin/packs");
}

async function updatePack(req, res) {
  const pack = await Pack.findByPk(Number(req.params.id));
  if (!pack) return res.redirect("/admin/packs");
  const uploadedImage = req.file ? await storeFile(req.file, "uploads") : null;
  await pack.update({
    name: req.body.name,
    audienceSize: req.body.audienceSize,
    includedText: req.body.includedText,
    pricePerDay: Number(req.body.pricePerDay || 0),
    optionsText: req.body.optionsText || "",
    images: uploadedImage ? [uploadedImage] : req.body.images ? [req.body.images] : toArray(pack.images)
  });
  res.redirect("/admin/packs");
}

async function deletePack(req, res) {
  await Pack.destroy({ where: { id: Number(req.params.id) } });
  res.redirect("/admin/packs");
}

async function listQuotes(req, res) {
  const quotes = await QuoteRequest.findAll({ include: [Pack], order: [["createdAt", "DESC"]] });
  res.render("admin/quotes", { layout: "layouts/admin", quotes: quotes.map((q) => ({ ...q.toJSON(), needs: toArray(q.needs), itemsJson: toArray(q.itemsJson) })) });
}

async function quoteDetail(req, res) {
  const quote = await QuoteRequest.findByPk(Number(req.params.id), { include: [Pack] });
  if (!quote) return res.redirect("/admin/devis");
  res.render("admin/quote-detail", {
    layout: "layouts/admin",
    quote: { ...quote.toJSON(), needs: toArray(quote.needs), itemsJson: toArray(quote.itemsJson) }
  });
}

async function updateQuoteStatus(req, res) {
  const quote = await QuoteRequest.findByPk(Number(req.params.id));
  if (quote) await quote.update({ status: req.body.status || quote.status });
  res.redirect(`/admin/devis/${req.params.id}`);
}

async function exportQuotePdf(req, res) {
  const quote = await QuoteRequest.findByPk(Number(req.params.id));
  if (!quote) return res.redirect("/admin/devis");
  return buildQuotePdf(res, { ...quote.toJSON(), needs: toArray(quote.needs), itemsJson: toArray(quote.itemsJson) });
}

async function calendar(req, res) {
  const reservations = await Reservation.findAll({ order: [["startDate", "ASC"]] });
  res.render("admin/calendar", { layout: "layouts/admin", reservations });
}

module.exports = {
  dashboard,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listPacks,
  createPack,
  updatePack,
  deletePack,
  listQuotes,
  quoteDetail,
  updateQuoteStatus,
  exportQuotePdf,
  calendar
};
