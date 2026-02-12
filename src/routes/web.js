const express = require("express");
const multer = require("multer");
const webController = require("../controllers/webController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", webController.home);
router.get("/services", webController.services);
router.get("/services/:slug", webController.serviceDetail);
router.get("/packs-concerts", webController.packsConcerts);
router.get("/catalogue", webController.catalogue);
router.get("/produit/:slug", webController.productDetail);

router.post("/devis/panier/ajouter", webController.addToQuoteCart);
router.post("/devis/panier/retirer", webController.removeFromQuoteCart);
router.post("/devis/panier/update", webController.updateQuoteCart);
router.get("/checkout", webController.checkoutPage);
router.post("/checkout/start", webController.checkoutStart);
router.get("/checkout/payer/:orderId", webController.checkoutPayPage);
router.post("/checkout/payer/:orderId/confirm", webController.checkoutConfirm);
router.post("/checkout/payer/:orderId/cancel", webController.checkoutCancel);
router.get("/checkout/success", webController.checkoutSuccess);
router.get("/checkout/invoice/:orderId", webController.checkoutInvoice);
router.get("/checkout/cancel", webController.checkoutCancelPage);

router.get("/devis", webController.quoteForm);
router.post("/devis/step", webController.saveQuoteStep);
router.post("/devis/submit", upload.single("rider"), webController.submitQuote);
router.get("/devis/confirmation", webController.quoteConfirmation);

router.get("/realisations", webController.realisations);
router.get("/a-propos", webController.about);
router.get("/contact", webController.contact);
router.get("/cgv", webController.cgv);
router.get("/privacy", webController.privacy);

module.exports = router;
