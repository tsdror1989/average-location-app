// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Your Firebase config (replace with your values from Firebase console)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get group ID from URL
const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get("group") || "default";
document.getElementById("group-id").textContent = groupId;

// Share location
document.getElementById("share-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    try {
      await addDoc(collection(db, `groups/${groupId}/coordinates`), {
        lat: latitude,
        lng: longitude,
        timestamp: Date.now()
      });
      alert("Location shared!");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  });
});

// Listen and update average location
onSnapshot(collection(db, `groups/${groupId}/coordinates`), (snapshot) => {
  const data = snapshot.docs.map(doc => doc.data());
  if (data.length === 0) return;

  const avgLat = data.reduce((sum, p) => sum + p.lat, 0) / data.length;
  const avgLng = data.reduce((sum, p) => sum + p.lng, 0) / data.length;

  document.getElementById("avg-lat").textContent = avgLat.toFixed(6);
  document.getElementById("avg-lng").textContent = avgLng.toFixed(6);
});
