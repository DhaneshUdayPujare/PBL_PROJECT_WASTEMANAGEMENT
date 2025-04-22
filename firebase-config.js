// firebase-config.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCBO6RkW2Ij668W71uSpx8rfRTA1sabRcA",
  authDomain: "wastemarketplace-670b2.firebaseapp.com",
  projectId: "wastemarketplace-670b2",
  storageBucket: "wastemarketplace-670b2.appspot.com",
  messagingSenderId: "732485108549",
  appId: "1:732485108549:web:4d669594538485f336f42c"
};

// Prevent duplicate initialization
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
