// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBsjOURX7bM6OlvgklFC9TwD7czCSjP0PY",
  authDomain: "average-location-app.firebaseapp.com",
  projectId: "average-location-app",
  storageBucket: "average-location-app.appspot.com",
  messagingSenderId: "112355932948",
  appId: "1:112355932948:web:bd11b6ebbb2f538edf6001"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Get group ID from URL (or use "default")
const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get("group") || "default";
document.getElementById("group-id").textContent = groupId;

// Share location button
document.getElementById("share-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    try {
      await db.collection("groups").doc(groupId).collection("coordinates").add({
        lat: latitude,
        lng: longitude,
        timestamp: Date.now()
      });
      alert("Location shared!");
    } catch (error) {
      console.error("Error sharing location:", error);
    }
  });
});

// Listen to updates and show average
db.collection("groups").doc(groupId).collection("coordinates")
  .onSnapshot((snapshot) => {
    const points = snapshot.docs.map(doc => doc.data());
    if (points.length === 0) return;

    const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const avgLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;

    document.getElementById("avg-lat").textContent = avgLat.toFixed(6);
    document.getElementById("avg-lng").textContent = avgLng.toFixed(6);
  });
