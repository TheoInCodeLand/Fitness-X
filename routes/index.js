const express = require("express");
const router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/auth/login");
}

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.user });
});

module.exports = router;
