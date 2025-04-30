// Firebase config (yours is correct)
const firebaseConfig = {
  apiKey: "AIzaSyBsjOURX7bM6OlvgklFC9TwD7czCSjP0PY",
  authDomain: "average-location-app.firebaseapp.com",
  projectId: "average-location-app",
  storageBucket: "average-location-app.appspot.com",
  messagingSenderId: "112355932948",
  appId: "1:112355932948:web:bd11b6ebbb2f538edf6001"
};

// Init Firebase and Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Get group ID from URL (e.g., ?group=paris)
const params = new URLSearchParams(window.location.search);
const groupId = params.get("group") || "default";
document.getElementById("group-id").textContent = groupId;

// Share current location
document.getElementById("share-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;

    try {
      await db.collection("groups").doc(groupId).collection("coordinates").add({
        lat: latitude,
        lng: longitude,
        timestamp: Date.now()
      });
      alert("Location shared.");
    } catch (err) {
      console.error("Error saving location:", err);
    }
  });
});

// Listen to Firestore and compute averages
db.collection("groups").doc(groupId).collection("coordinates")
  .onSnapshot((snapshot) => {
    const docs = snapshot.docs.map(doc => doc.data());
    if (docs.length === 0) return;

    const avgLat = docs.reduce((sum, d) => sum + d.lat, 0) / docs.length;
    const avgLng = docs.reduce((sum, d) => sum + d.lng, 0) / docs.length;

    document.getElementById("avg-lat").textContent = avgLat.toFixed(6);
    document.getElementById("avg-lng").textContent = avgLng.toFixed(6);
  });
