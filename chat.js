import { auth, db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// 1. Get sellerId and sellerName from URL query params
const urlParams = new URLSearchParams(window.location.search);
const sellerId = urlParams.get("sellerId");
const sellerName = urlParams.get("sellerName");

const chatWithHeader = document.getElementById("chat-with");
if (chatWithHeader) {
  if (sellerName) {
    chatWithHeader.textContent = "Chat with: " + sellerName;
  } else if (sellerId) {
    chatWithHeader.textContent = "Chat with: " + sellerId;
  } else {
    chatWithHeader.textContent = "Chat (No seller selected)";
  }
}

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    if (sellerId) {
      listenToMessages();
    } else {
      const chatBox = document.getElementById("chat-box");
      if (chatBox) {
        chatBox.innerHTML = "<p style='color: grey; text-align: center; margin-top: 50px;'>Select an item from the feed and click 'In-App Chat' to message the seller.</p>";
      }
    }
  } else {
    alert("Please login first.");
    window.location.href = "index.html";
  }
});

// 2. Listen to messages between currentUser and seller
function listenToMessages() {
  const chatBox = document.getElementById("chat-box");
  if (!chatBox) return;

  const q = query(
    collection(db, "messages"),
    orderBy("timestamp", "asc")
  );

  onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = "";

    snapshot.forEach((doc) => {
      const msg = doc.data();
      const isRelevant =
        (msg.senderId === currentUser.uid && msg.receiverId === sellerId) ||
        (msg.senderId === sellerId && msg.receiverId === currentUser.uid);

      if (isRelevant) {
        const msgDiv = document.createElement("div");
        msgDiv.className = msg.senderId === currentUser.uid ? "msg sent" : "msg received";
        msgDiv.textContent = msg.text;
        chatBox.appendChild(msgDiv);
      }
    });

    // Auto-scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// 3. Send new message
const chatForm = document.getElementById("chat-form");
if (chatForm) {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!sellerId) {
      alert("No seller selected. Please go to the feed and click Chat on an item.");
      return;
    }

    if (!currentUser) {
      alert("Please login first.");
      window.location.href = "index.html";
      return;
    }

    const input = document.getElementById("message-input");
    const text = input.value.trim();
    if (text === "") return;

    try {
      await addDoc(collection(db, "messages"), {
        senderId: currentUser.uid,
        receiverId: sellerId,
        text: text,
        timestamp: serverTimestamp()
      });

      input.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message: " + error.message);
    }
  });
}
