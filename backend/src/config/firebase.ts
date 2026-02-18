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
    console.error('❌ Failed to load Firebase credentials:', error);
    console.warn(`Tried loading from: ${path.resolve(serviceAccountPath)}`);
    console.warn('⚠️  Running in demo mode (Auth will fail for real tokens).');
    console.warn('   Make sure the service account file exists and is valid JSON.');

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
