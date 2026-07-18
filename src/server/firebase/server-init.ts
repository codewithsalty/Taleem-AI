import admin from 'firebase-admin';

export function initializeFirebaseServer() {
  if (admin.apps.length > 0) {
    return admin;
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'studio-6147701984-fafcf';

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      const serviceAccount = JSON.parse(raw);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId,
      });
    } else {
      admin.initializeApp({ projectId });
    }
  } catch (e) {
    console.error('Firebase Admin SDK init failed. Firestore unavailable.', e);
  }
  return admin;
}
