const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

/* =====================================================
   FIREBASE ADMIN INITIALIZATION (RENDER SAFE)
===================================================== */
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_PRIVATE_KEY_BASE64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;

if (!admin.apps.length) {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY_BASE64) {
    console.error('❌ Firebase env vars missing');
    console.error({
      FIREBASE_PROJECT_ID: !!FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY_BASE64: !!FIREBASE_PRIVATE_KEY_BASE64,
    });
    throw new Error('❌ Firebase env vars missing');
  }

  let privateKey;
  try {
    privateKey = Buffer.from(FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
  } catch (err) {
    console.error('❌ Failed to decode FIREBASE_PRIVATE_KEY_BASE64');
    throw err;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });

  console.log('✅ Firebase Admin initialized');
}

/* =====================================================
   APP SETUP
===================================================== */
const app = express();
app.use(cors());
app.use(express.json());

const dbPool = require('./db');

/* =====================================================
   AUTH MIDDLEWARE
===================================================== */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: token missing' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ Token verification failed', err.message);
    return res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const [rows] = await dbPool.query(
      'SELECT role FROM users WHERE firebase_uid = ?',
      [req.user.uid]
    );

    if (rows.length && rows[0].role === 'ADMIN') {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden' });
  } catch (err) {
    console.error('❌ Admin check failed', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/* =====================================================
   ROUTES
===================================================== */
app.use('/api/job', verifyToken, require('./routes/jobs'));
app.use('/api/worker', verifyToken, require('./routes/workers'));
app.use('/api/admin', verifyToken, isAdmin, require('./routes/admin'));
app.use('/api/users', verifyToken, require('./routes/users'));
app.use('/api/cms', require('./routes/cms'));
app.use('/api/transactions', verifyToken, require('./routes/transactions'));

/* =====================================================
   HEALTH CHECK
===================================================== */
app.get('/healthz', (req, res) => {
  res.send('OK');
});

/* =====================================================
   FRONTEND (OPTIONAL – SAFE)
===================================================== */
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

/* =====================================================
   START SERVER
===================================================== */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
