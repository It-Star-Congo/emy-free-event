const jwt = require("jsonwebtoken");

function getTokenFromCookie(req) {
  return req.cookies?.admin_token;
}

function requireAdmin(req, res, next) {
  const token = getTokenFromCookie(req);
  if (!token) return res.redirect("/admin/login");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    if (payload.role !== "admin") return res.redirect("/admin/login");
    req.admin = payload;
    res.locals.admin = payload;
    return next();
  } catch (error) {
    return res.redirect("/admin/login");
  }
}

function optionalAdmin(req, res, next) {
  const token = getTokenFromCookie(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    res.locals.admin = payload;
  } catch (error) {
    // ignore invalid token
  }
  return next();
}

module.exports = { requireAdmin, optionalAdmin };

