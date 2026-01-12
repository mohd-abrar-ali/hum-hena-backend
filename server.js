const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Firebase Admin SDK initialization
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
} else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0322108828",
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '')
    })
  });
} else {
  throw new Error("Firebase credentials not found. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_PRIVATE_KEY/FIREBASE_CLIENT_EMAIL.");
}

const app = express();
app.use(cors());
app.use(express.json());

const dbPool = require('./db');

const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).send('Unauthorized');
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
};

const isAdmin = async (req, res, next) => {
    const [rows] = await dbPool.query('SELECT role FROM users WHERE id = ?', [req.user.uid]);
    if (rows.length > 0 && rows[0].role === 'ADMIN') {
        next();
    } else {
        res.status(403).send('Forbidden');
    }
}

// Routes
const jobRoutes = require('./routes/jobs');
const workerRoutes = require('./routes/workers');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');
const cmsRoutes = require('./routes/cms');
const transactionRoutes = require('./routes/transactions');

app.use('/api/job', verifyToken, jobRoutes);
app.use('/api/worker', verifyToken, workerRoutes);
app.use('/api/admin', verifyToken, isAdmin, adminRoutes);
app.use('/api/users', verifyToken, usersRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/transactions', verifyToken, transactionRoutes);

// Serve frontend with cache control
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
    }
}));

app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
