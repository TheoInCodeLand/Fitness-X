const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();

// Connect to SQLite database
const db = new sqlite3.Database("./db/database.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) console.error(err.message);
});

// Configure Passport Strategy
module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false, { message: "No user found with this email!" });

        // Compare passwords
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) return done(null, user);
          return done(null, false, { message: "Incorrect password!" });
        });
      });
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, user) => {
      done(err, user);
    });
  });
};
