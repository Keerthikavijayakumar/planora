const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let db;
let auth;

try {
    // Check for critical variables to give helpful error
    if (!process.env.FIREBASE_PROJECT_ID) {
        console.warn("⚠️ Warning: FIREBASE_PROJECT_ID is missing in .env");
    }

    if (!admin.apps.length) {
        // Only attempt to initialize if we have credentials
        if (process.env.FIREBASE_PRIVATE_KEY) {
            const serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            };

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('✅ Firebase Admin Initialized');
        } else {
            console.warn("⚠️ Skipping Firebase Init: No Private Key found");
            // Initialize with default/null implies DB won't work, but prevents crash
        }
    }

    // Only assign if apps initialized
    if (admin.apps.length) {
        db = admin.firestore();
        auth = admin.auth();
    } else {
        console.warn("⚠️ Firebase apps not initialized. DB calls will fail.");
    }

} catch (error) {
    console.error('❌ Firebase Init Error:', error.message);
}

module.exports = { admin, db, auth };
