import { auth, db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const imgbbApiKey = "9808a16c8eb1be46d5437f97a181f440";

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
  } else {
    alert("Please login first.");
    window.location.href = "index.html";
  }
});

const addItemForm = document.getElementById("addItemForm");
if (addItemForm) {
  addItemForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!currentUser) {
      alert("User not logged in!");
      window.location.href = "index.html";
      return;
    }

    const imageInput = document.getElementById("wasteImage");
    const file = imageInput.files[0];
    if (!file) {
      alert("Please select an image.");
      return;
    }

    const submitBtn = addItemForm.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Posting...";
    }

    const reader = new FileReader();

    reader.onloadend = async function () {
      try {
        const base64Image = reader.result.split(',')[1];

        const formData = new FormData();
        formData.append("key", imgbbApiKey);
        formData.append("image", base64Image);

        const response = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: formData
        });

        const result = await response.json();
        const imageUrl = result.data ? result.data.url : "";

        const sellerName = document.getElementById("sellerName").value;
        const phoneNumber = document.getElementById("phoneNumber").value;
        const itemName = document.getElementById("wasteName").value;
        const itemPrice = document.getElementById("wastePrice").value;
        const itemType = document.getElementById("wasteType").value;

        // Save everything to Firestore
        await addDoc(collection(db, "items"), {
          sellerId: currentUser.uid,
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
        alert("Failed to upload item: " + error.message);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Post Item";
        }
      }
    };

    reader.readAsDataURL(file);
  });
}
