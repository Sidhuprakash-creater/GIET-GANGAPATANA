/**
 * Firebase Admin SDK initialization
 * Handles authentication verification and Firestore database access
 */
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';

try {
    const serviceAccount = require(path.resolve(serviceAccountPath));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
    console.warn('⚠️  Firebase service account not found. Running in demo mode.');
    console.warn('   Place your firebase-service-account.json in the backend root.');
    // Initialize without credentials for development
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: 'demo-project',
        });
    }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export default admin;
