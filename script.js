import { auth, db } from "./firebase-config.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

console.log("Script loaded");

// ✅ Signup
const signupForm = document.getElementById("signup-form");
if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                alert("Signup successful!");
                window.location.href = "role.html";
            })
            .catch((error) => {
                alert("Signup error: " + error.message);
            });
    });
}

// ✅ Login
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                alert("Login successful!");
                window.location.href = "role.html";
            })
            .catch((error) => {
                alert("Login error: " + error.message);
            });
    });
}

// ✅ Load posts on main.html with hide-message-on-own-post logic
if (window.location.pathname.includes("main.html")) {
  const feedContainer = document.querySelector(".post-feed");

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      alert("Please login to view the feed.");
      window.location.href = "index.html";
      return;
    }

    const currentUserId = user.uid;
    const q = query(collection(db, "items"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    feedContainer.innerHTML = "";

    snapshot.forEach((doc) => {
      const item = doc.data();
      const sellerId = item.sellerId || "unknown";
      const sellerName = item.sellerName || "Seller";
      const phoneNumber = item.phoneNumber || "";

      const card = document.createElement("div");
      card.className = "post-card";

      let postHTML = `
        <h4>${sellerName}</h4>
        <img src="${item.imageUrl}" alt="Waste Image">
        <h3>${item.name}</h3>
        <p>Price: ₹${item.price}</p>
        <p>Type: ${item.type}</p>
      `;

      if (sellerId !== currentUserId) {
        if (phoneNumber && phoneNumber.startsWith("+")) {
          postHTML += `
            <a href="https://wa.me/${phoneNumber.replace(/\+/g, '')}" target="_blank">
              <button class="message-btn">Message Seller</button>
            </a>
          `;
        } else {
          postHTML += `<p style="color: grey; font-size: 12px;">WhatsApp contact not available</p>`;
        }
      }

      card.innerHTML = postHTML;
      feedContainer.appendChild(card);
    });
  });
}
