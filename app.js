require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const sqlite3 = require("sqlite3").verbose();
const SQLiteStore = require("connect-sqlite3")(session);

// Initialize Express App
const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "./db" }),
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Messages
app.use(flash());

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/workouts", require("./routes/workouts"));
app.use("/meals", require("./routes/meals"));
app.use("/progress", require("./routes/progress"));
app.use("/api", require("./routes/api"));

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
