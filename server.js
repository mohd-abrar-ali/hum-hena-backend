require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());

/* ---------- DATABASE ---------- */
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

(async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ DB connection failed", err);
    process.exit(1);
  }
})();

/* ---------- ROUTES ---------- */
app.get("/", (req, res) => {
  res.json({ status: "Backend running" });
});

app.get("/healthz", (req, res) => {
  res.send("OK");
});

/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
