const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
require("dotenv").config();

const db = new sqlite3.Database("./db/database.db");

db.run(
  `CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    duration INTEGER,
    calories INTEGER,
    date TEXT
  )`
);

router.post("/log", (req, res) => {
  const { user_id, type, duration, calories } = req.body;
  const date = new Date().toISOString().split("T")[0];

  db.run(
    "INSERT INTO workouts (user_id, type, duration, calories, date) VALUES (?, ?, ?, ?, ?)",
    [user_id, type, duration, calories, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Workout logged!", id: this.lastID });
    }
  );
});

router.get("/:user_id", (req, res) => {
  const { user_id } = req.params;
  db.all(
    "SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC",
    [user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.get("/sync/google-fit", async (req, res) => {
  if (!req.session.accessToken) return res.status(401).json({ error: "Not authenticated" });

  try {
    const response = await axios.post(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
        endTimeMillis: Date.now(),
      },
      { headers: { Authorization: `Bearer ${req.session.accessToken}` } }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;