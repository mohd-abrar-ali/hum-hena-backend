const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

/* ---------- FIREBASE INIT ---------- */
if (!admin.apps.length) {
  if (
    process.env.FIREBASE_PRIVATE_KEY_BASE64 &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PROJECT_ID
  ) {
    const privateKey = Buffer.from(
      process.env.FIREBASE_PRIVATE_KEY_BASE64,
      'base64'
    ).toString('utf8');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });

    console.log('✅ Firebase Admin initialized (BASE64)');
  } else {
    throw new Error('❌ Firebase env vars missing');
  }
}

/* ---------- APP ---------- */
const app = express();
app.use(cors());
app.use(express.json());

const dbPool = require('./db');

/* ---------- AUTH MIDDLEWARE ---------- */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = async (req, res, next) => {
  const [rows] = await dbPool.query(
    'SELECT role FROM users WHERE firebase_uid = ?',
    [req.user.uid]
  );

  if (rows.length && rows[0].role === 'ADMIN') return next();
  return res.status(403).json({ error: 'Forbidden' });
};

/* ---------- ROUTES ---------- */
app.use('/api/job', verifyToken, require('./routes/jobs'));
app.use('/api/worker', verifyToken, require('./routes/workers'));
app.use('/api/admin', verifyToken, isAdmin, require('./routes/admin'));
app.use('/api/users', verifyToken, require('./routes/users'));
app.use('/api/cms', require('./routes/cms'));
app.use('/api/transactions', verifyToken, require('./routes/transactions'));

/* ---------- FRONTEND ---------- */
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

/* ---------- START ---------- */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
