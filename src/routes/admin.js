const express = require("express");
const multer = require("multer");
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const { requireAdmin } = require("../middlewares/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/login", authController.loginPage);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.get("/", requireAdmin, adminController.dashboard);

router.get("/produits", requireAdmin, adminController.listProducts);
router.post("/produits", requireAdmin, upload.single("imageFile"), adminController.createProduct);
router.post("/produits/:id/update", requireAdmin, upload.single("imageFile"), adminController.updateProduct);
router.post("/produits/:id/delete", requireAdmin, adminController.deleteProduct);

router.get("/packs", requireAdmin, adminController.listPacks);
router.post("/packs", requireAdmin, upload.single("imageFile"), adminController.createPack);
router.post("/packs/:id/update", requireAdmin, upload.single("imageFile"), adminController.updatePack);
router.post("/packs/:id/delete", requireAdmin, adminController.deletePack);

router.get("/devis", requireAdmin, adminController.listQuotes);
router.get("/devis/:id", requireAdmin, adminController.quoteDetail);
router.post("/devis/:id/status", requireAdmin, adminController.updateQuoteStatus);
router.get("/devis/:id/export-pdf", requireAdmin, adminController.exportQuotePdf);

router.get("/calendrier", requireAdmin, adminController.calendar);

module.exports = router;
