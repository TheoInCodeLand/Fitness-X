require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const sqlite3 = require("sqlite3").verbose();
const SQLiteStore = require("connect-sqlite3")(session);
require("./config/passport")(passport);

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "./db" }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["https://www.googleapis.com/auth/fitness.activity.read"],
    },
    (accessToken, refreshToken, profile, done) => {
      // Store the Google Fit Access Token
      profile.accessToken = accessToken;
      return done(null, profile);
    }
  )
);

app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/workouts", require("./routes/workouts"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
