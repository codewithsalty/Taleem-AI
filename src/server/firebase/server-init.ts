import admin from 'firebase-admin';

let initialized = false;

export function initializeFirebaseServer() {
  if (!initialized) {
    initialized = true;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'studio-6147701984-fafcf';

    try {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId,
        });
      } else {
        admin.initializeApp({ projectId });
      }
    } catch (e) {
      console.warn('Firebase Admin SDK init failed. Firestore unavailable.', e);
    }
  }
  return admin;
}
