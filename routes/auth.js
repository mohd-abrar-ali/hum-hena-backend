const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

/* DB CONNECTION (reuse env) */
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

/* REGISTER / LOGIN (PHONE BASED) */
router.post("/login", async (req, res) => {
  const { phone, role } = req.body;

  if (!phone || !role) {
    return res.status(400).json({ message: "Phone and role required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE phone = ?",
      [phone]
    );

    // If user does not exist → create
    if (rows.length === 0) {
      const [result] = await db.query(
        "INSERT INTO users (phone, role, status) VALUES (?, ?, 'active')",
        [phone, role]
      );

      // If WORKER → insert into workers table
      if (role === "WORKER") {
        await db.query(
          "INSERT INTO workers (user_id, is_online) VALUES (?, 0)",
          [result.insertId]
        );
      }

      return res.json({ success: true, newUser: true });
    }

    // Existing user
    if (rows[0].status === "suspended") {
      return res.status(403).json({ message: "Account suspended" });
    }

    res.json({ success: true, newUser: false });
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
