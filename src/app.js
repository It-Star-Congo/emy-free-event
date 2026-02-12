require("dotenv").config();
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
const { optionalAdmin } = require("./middlewares/auth");

const webRoutes = require("./routes/web");
const adminRoutes = require("./routes/admin");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.set("layout", "layouts/main");
app.use(expressLayouts);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session",
    resave: false,
    saveUninitialized: false
  })
);
app.use(express.static(path.join(process.cwd(), "public")));
app.use(optionalAdmin);

app.use((req, res, next) => {
  const quoteCart = req.session?.quoteCart || [];
  const cartCount = quoteCart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  res.locals.brand = "EMY FREE EVENT";
  res.locals.contactPhone = process.env.CONTACT_PHONE || "+2250707022425";
  res.locals.whatsappPhone = process.env.WHATSAPP_PHONE || "2250707022425";
  res.locals.currentPath = req.path;
  res.locals.cartCount = cartCount;
  res.locals.emailjsServiceId = process.env.EMAILJS_SERVICE_ID || "service_eip0lei";
  res.locals.emailjsTemplateId = process.env.EMAILJS_TEMPLATE_ID || "template_7izxe49";
  res.locals.emailjsUserId = process.env.EMAILJS_USER_ID || "0itHGT0RE2JJZzn8U";
  next();
});

app.use("/", webRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).render("pages/not-found", { message: "Page introuvable." });
});

module.exports = app;
