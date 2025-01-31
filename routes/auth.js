const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./db/database.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) console.error(err.message);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash("error_msg", "Please log in to view this resource");
  res.redirect("/auth/login");
}

router.get("/google", passport.authenticate("google", { scope: ["profile", "email", "https://www.googleapis.com/auth/fitness.activity.read"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    req.session.accessToken = req.user.accessToken;
    res.redirect("/dashboard"); // Redirect after login
  }
);

router.get("/login", (req, res) => {
  res.render("auth/login");
});
router.get("/signup", (req, res) => {
  res.render("auth/signup");
});
router.post("/signup", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    req.flash("error_msg", "Please fill in all fields");
    return res.redirect("/auth/signup");
  }
  if (password !== confirmPassword) {
    req.flash("error_msg", "Passwords do not match");
    return res.redirect("/auth/signup");
  }
  if (password.length < 6) {
    req.flash("error_msg", "Password must be at least 6 characters");
    return res.redirect("/auth/signup");
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (user) {
      req.flash("error_msg", "Email is already registered");
      return res.redirect("/auth/signup");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
      (err) => {
        if (err) console.log(err);
        req.flash("success_msg", "You are now registered! Please log in");
        res.redirect("/auth/login");
      }
    );
  });
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success_msg", "You have logged out");
    res.redirect("/auth/login");
  });
});

module.exports = router;