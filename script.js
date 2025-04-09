// Firebase Auth imports (inside a module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
console.log("Script loaded!");
console.log("script.js is connected!");


// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCBO6RkW2Ij668W71uSpx8rfRTA1sabRcA",
    authDomain: "wastemarketplace-670b2.firebaseapp.com",
    projectId: "wastemarketplace-670b2",
    storageBucket: "wastemarketplace-670b2.firebasestorage.app",
    messagingSenderId: "732485108549",
    appId: "1:732485108549:web:4d669594538485f336f42c"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // ✅ This is the missing line
const db = getFirestore(app);




// Signup
document.getElementById("signup-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Signup successful!");
      window.location.href = "role.html";  // <-- Redirect to home after signup
    })
    .catch((error) => {
      alert("Signup error: " + error);
    });
  
});

// Login
document.getElementById("login-form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("Login form submitted"); // 🧪 Debug

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  console.log("Email:", email, "Password:", password); // 🧪 Debug

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("Login successful", userCredential); // 🧪 Debug
      alert("Login successful!");
      window.location.href = "role.html";
    })
    .catch((error) => {
      console.error("Login error:", error); // 🧪 Debug
      alert("Login error: " + error.message);
    });
});



// Form submit for seller's add-item page
if (document.getElementById("wasteForm")) {
  document.getElementById("wasteForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to post items.");
      return;
    }

    const wasteName = document.getElementById("wasteName").value;
    const wastePrice = document.getElementById("wastePrice").value;
    const wasteType = document.getElementById("wasteType").value;
    const wasteImage = document.getElementById("wasteImage").files[0]?.name || "no-image.png";

    try {
      await addDoc(collection(db, "wasteItems"), {
        uid: user.uid,
        name: wasteName,
        price: wastePrice,
        type: wasteType,
        imageName: wasteImage,
        postedAt: new Date()
      });

      alert("Item posted successfully!");
      window.location.href = "main.html"; // redirect to main page
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to post item.");
    }
  });
}



