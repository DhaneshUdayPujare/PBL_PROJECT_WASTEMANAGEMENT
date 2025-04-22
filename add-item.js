import { auth, db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const imgbbApiKey = "9808a16c8eb1be46d5437f97a181f440";

document.getElementById("addItemForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const imageInput = document.getElementById("wasteImage");
  const file = imageInput.files[0];
  const reader = new FileReader();

  reader.onloadend = async function () {
    const base64Image = reader.result.split(',')[1];

    const formData = new FormData();
    formData.append("key", imgbbApiKey);
    formData.append("image", base64Image);

    try {
      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      const imageUrl = result.data.url;

      const sellerName = document.getElementById("sellerName").value;
const phoneNumber = document.getElementById("phoneNumber").value;
const itemName = document.getElementById("wasteName").value;
const itemPrice = document.getElementById("wastePrice").value;
const itemType = document.getElementById("wasteType").value;

// Get logged-in user UID (already done earlier)
const user = auth.currentUser;
if (!user) {
  alert("User not logged in!");
  return;
}

// Save everything to Firestore
await addDoc(collection(db, "items"), {
  sellerId: user.uid,
  sellerName: sellerName,
  phoneNumber: phoneNumber,
  name: itemName,
  price: itemPrice,
  type: itemType,
  imageUrl: imageUrl,
  timestamp: serverTimestamp()
});


      alert("Item posted successfully!");
      window.location.href = "main.html";

    } catch (error) {
      console.error("Error uploading or saving:", error);
      alert("Failed to upload item. Try again.");
    }
  };

  reader.readAsDataURL(file);
});
