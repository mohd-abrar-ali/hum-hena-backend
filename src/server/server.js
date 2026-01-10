const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const serviceAccount = require('../../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
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

// Serve frontend
app.use(express.static(path.join(__dirname, '../../dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
