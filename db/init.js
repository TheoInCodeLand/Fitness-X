const sqlite3 = require("sqlite3").verbose();

// Connect to SQLite database
const db = new sqlite3.Database("./db/database.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to SQLite database.");
});

db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`,
  (err) => {
    if (err) console.log(err);
    else console.log("Users table created.");
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    workout_type TEXT NOT NULL,
    duration INTEGER NOT NULL,
    calories_burned INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  (err) => {
    if (err) console.log(err);
    else console.log("Workouts table created.");
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    meal_name TEXT NOT NULL,
    calories INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  (err) => {
    if (err) console.log(err);
    else console.log("Meals table created.");
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    weight REAL,
    body_fat REAL,
    steps INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  (err) => {
    if (err) console.log(err);
    else console.log("Progress table created.");
  }
);

db.close();
