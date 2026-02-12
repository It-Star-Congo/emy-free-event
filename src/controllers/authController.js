const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AdminUser } = require("../models");

function loginPage(req, res) {
  res.render("admin/login", { error: null, layout: "layouts/admin-auth" });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await AdminUser.findOne({ where: { email } });
  if (!user) return res.status(401).render("admin/login", { error: "Identifiants invalides.", layout: "layouts/admin-auth" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).render("admin/login", { error: "Identifiants invalides.", layout: "layouts/admin-auth" });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "8h" }
  );
  res.cookie("admin_token", token, { httpOnly: true, sameSite: "lax" });
  return res.redirect("/admin");
}

function logout(req, res) {
  res.clearCookie("admin_token");
  res.redirect("/admin/login");
}

module.exports = { loginPage, login, logout };

