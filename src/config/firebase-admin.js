import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Check if Firebase app is already initialized
const app = getApps().length === 0
  ? initializeApp({
      credential: cert(serviceAccount),
    })
  : getApp();

const db = getFirestore(app);

export { db };