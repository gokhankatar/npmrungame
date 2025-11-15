import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: "npmrungame-cc969.firebaseapp.com",
    projectId: "npmrungame-cc969",
    storageBucket: "npmrungame-cc969.firebasestorage.app",
    messagingSenderId: "654207403196",
    appId: "1:654207403196:web:0f18c442974bd930a2bcb9",
    measurementId: "G-QGB9W2XWD9",
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const analytics = process.client ? getAnalytics(app) : null;

  return {
    provide: {
      firebase: app,
      auth,
      analytics,
    },
  };
});
