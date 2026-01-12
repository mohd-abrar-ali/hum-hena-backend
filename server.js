const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// The credentials you provided are for the Frontend. The Backend requires a Service Account.
// I have set up the structure below. You must replace the placeholders with values from your
// serviceAccountKey.json file (download from Firebase Console > Project Settings > Service Accounts).
// Alternatively, set these as Environment Variables in Render.
const serviceAccount = {
  project_id: "gen-lang-client-0322108828",
  private_key: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '')
    : undefined,
  clie"-----BEGIN PRIVATE KEY-----\nPASTE_YOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n" process.env.FIREBASE_CLIENT_EMAIL
}; || "PASTE_YOUR_CLIENT_EMAIL_HERE"  -----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDCfVaasMEs51Z6
FKayImSfWaQrogs2isjgesGor0XLdkBQK+CUJhDB78MpNp55cT4myX0IE8L95gFi
MdFemtx7Jd+gO+Sv/TR9T+r8gn4k5J7o9Z0EwekctKrZ8gkRTWzumutAcRq8hBb/
lqUCdVCjx7uoOg5rvrnV+LkJLJ9kzAfbs72f2xcHjIXfjL9EDGHl2ynn/umcti1h
pI8R3T0bNAPBkWbvrp2uCTVC02k4Hycchj3sI7g4M4xlICIiH8ZZA+TGOrU4p0OL
dv8btOkuoVRXDYI7CHY1w/v9hi4NXvLACFciKb4LV/0pLhHVWrCJSwZVsBHPeZKt
xv5ZX5+LAgMBAAECggEAKMbXnAo4Dj6YinL++jUszJ4iRgWs/Sv+7tW9+ax54S0z
UbvJU7ZhaA/pZqAtfL/J7J7tCH8AMHSDUL+qKoAkfutTZgh4q49WbHmPho6jfP+z
85rfZ2pyghK9CYHt9cM6dhJkBXhRRzoYilDe2tOW6yfKx/wYHu33j42c2fgRmTOx
j4tP1PyiFX720pVikGSFQV0kQ4YrGncfnphUGRTQ5fN2KReUje+mJLnVP/JVlagB
F8P6JRB9xtIhHvd/sgy7BRP0J7s+ezUqk5SNhFvw8qugzaQJ/ZXqPcJYRTecJ0uW
XdPDWk5XjGPFyXKa+PaumeN0/6RxZ4YqIDX5CQoeXQKBgQD92iSdFdcnGo0ibY4N
DxFTB5eD9D44pejR9BPc1565A3hhmXJ2z1eAjnZ5fBv8tqpuaQRmfeCjCQMMl/Vv
/mmmrGciDSbnBsenzYbuvMQgqM+qbS2X7QpoiSSV1xTyWJESj8qul1vK+9Ddejng
WxQJZfffUFCVU1fhnh5iRQec7wKBgQDEIpzqmL5uyD84yeIOtHivPLdfZw/CU2KN
lCaukXUwby4vM739Exlg1xlL91Bkvvu8cOZd9vvGfYHAFgo4Cjwd8fUmvYXS01Y1
V1DEQV1SdKYpI9kfLWFoH/TjFr91RypPidz1uFXM7YnvCv5Ikc3bc+JooN5tlwiX
wzRKmwsfJQKBgA6gQvvKBlt6bCdPqJ+X/qeKCHDR4cPhy0hNh9dxlPOT/5uf+7hc
ue3uR2U4gWROIgO6iUZeelLqcgKHvtx1DCFOTaLonxUwjtBcRyn6NlKrZ0uqfrYC
MldTj4gSnGJaOAGZx1PH5MINQDuCj1Md7EmeVmnHdt0jsCyPr7B5ybaBAoGAcADY
HPvm27qMp/BZoE4dEO0aRmfDTxRxFiqBQHUeN+91r0zb9NZgSrXq4z+y8CVD+mN6
nmjQ9qSbo3nl3knL9y5ftiBb4geFfvIxFOh2dnkWw0ZOAHNa8ZkrBfKDz6pQeLFet
D8EZdjI7738WoPhqVyTBKUCcZHa4WHoHtYb+feUCgYA8R0Nqj2xjfwxk1sSMYf80
wz+ezaB0mrAWx26GpiFVosscT59oYAsw4C9+1f6leSIBacnWkxMExAfIBuRK+lxL
8v92RZdCdwh1j1P/wMSWPoWn05BLo/2ZP/CLCPNyNPhj59UVRYz+PDFJWiujYdEU
k5qS2np4r0QIvkxfvzW3Fw==
-----END PRIVATE KEY-----


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

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
