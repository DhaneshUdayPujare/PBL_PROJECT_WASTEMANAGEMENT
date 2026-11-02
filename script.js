import { auth, db } from "./firebase-config.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
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

// ✅ Logout
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        signOut(auth).then(() => {
            alert("Logged out successfully!");
            window.location.href = "index.html";
        }).catch((err) => {
            alert("Logout error: " + err.message);
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

    try {
      const q = query(collection(db, "items"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);

      feedContainer.innerHTML = "";

      if (snapshot.empty) {
        feedContainer.innerHTML = "<p style='color: grey; text-align: center; margin: 2rem;'>No waste items listed yet. Be the first to post!</p>";
        return;
      }

      snapshot.forEach((doc) => {
        const item = doc.data();
        const sellerId = item.sellerId || "unknown";
        const sellerName = item.sellerName || "Seller";
        const phoneNumber = item.phoneNumber || "";

        const card = document.createElement("div");
        card.className = "post-card";

        let postHTML = `
          <h4>${sellerName}</h4>
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name || 'Waste Image'}" onerror="this.style.display='none'">` : ''}
          <h3>${item.name || 'Unnamed Item'}</h3>
          <p>Price: ₹${item.price || '0'}</p>
          <p>Type: ${item.type || 'General'}</p>
        `;

        if (sellerId !== currentUserId) {
          postHTML += `<div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 10px;">`;
          if (phoneNumber && phoneNumber.startsWith("+")) {
            postHTML += `
              <a href="https://wa.me/${phoneNumber.replace(/\+/g, '')}" target="_blank">
                <button class="message-btn" style="margin: 4px;">WhatsApp</button>
              </a>
            `;
          }
          postHTML += `
            <a href="chat.html?sellerId=${sellerId}&sellerName=${encodeURIComponent(sellerName)}">
              <button class="message-btn" style="background: #7b1fa2; margin: 4px;">In-App Chat</button>
            </a>
          </div>`;
        }

        card.innerHTML = postHTML;
        feedContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Error loading feed:", error);
      feedContainer.innerHTML = "<p style='color: red; text-align: center;'>Failed to load items. Please try refreshing.</p>";
    }
  });
}
