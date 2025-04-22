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

// 1. Get sellerId from URL
const urlParams = new URLSearchParams(window.location.search);
const sellerId = urlParams.get("sellerId");

let currentUser;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    listenToMessages();
  } else {
    alert("Please login first.");
    window.location.href = "login.html";
  }
});

// 2. Listen to messages between currentUser and seller
function listenToMessages() {
  const chatBox = document.getElementById("chat-box");

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
document.getElementById("send-btn").addEventListener("click", async () => {
  const input = document.getElementById("msg-input");
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
    alert("Message failed.");
  }
});
