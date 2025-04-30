import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsjOURX7bM6OlvgklFC9TwD7czCSjP0PY",
  authDomain: "average-location-app.firebaseapp.com",
  projectId: "average-location-app",
  storageBucket: "average-location-app.appspot.com",
  messagingSenderId: "112355932948",
  appId: "1:112355932948:web:bd11b6ebbb2f538edf6001"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Group ID
const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get("group") || "default";
document.getElementById("group-id").textContent = groupId;

// Leaflet map setup
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);

// Marker storage
let markers = [];
let avgMarker = null;

// Share location button
document.getElementById("share-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported.");
    return;
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    try {
      await addDoc(collection(db, `groups/${groupId}/coordinates`), {
        lat: latitude,
        lng: longitude,
        timestamp: Date.now()
      });
      alert("Location shared!");
    } catch (err) {
      console.error("Error sharing location:", err);
    }
  });
});

// Listen for changes and update map
onSnapshot(collection(db, `groups/${groupId}/coordinates`), (snapshot) => {
  const points = snapshot.docs.map(doc => doc.data());
  if (!points.length) return;

  // Clear old markers
  markers.forEach(m => map.removeLayer(m));
  if (avgMarker) map.removeLayer(avgMarker);
  markers = [];

  // Add new markers
  points.forEach(p => {
    const marker = L.marker([p.lat, p.lng]).addTo(map);
    markers.push(marker);
  });

  // Calculate and show average
  const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const avgLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
  avgMarker = L.marker([avgLat, avgLng], {
    icon: L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    })
  }).addTo(map).bindPopup("Average Location").openPopup();

  map.setView([avgLat, avgLng], 6);
});
