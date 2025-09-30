import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyANyxIoJ8wSa9MXCBCHvLvLAgbTuggabeA",
  authDomain: "video-streamer-68dca.firebaseapp.com",
  projectId: "video-streamer-68dca",
  storageBucket: "video-streamer-68dca.firebasestorage.app",
  messagingSenderId: "941147798723",
  appId: "1:941147798723:web:dabee00fe9914f5e6b7676",
  measurementId: "G-N0TSV7M9LW"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Auth persistence settings
export const setPersistence = async (persistence) => {
  const { setPersistence, browserLocalPersistence, browserSessionPersistence } = await import('firebase/auth');
  
  const persistenceType = persistence === 'local' ? browserLocalPersistence : browserSessionPersistence;
  
  try {
    await setPersistence(auth, persistenceType);
  } catch (error) {
    console.error('Error setting auth persistence:', error);
  }
};

export default app;