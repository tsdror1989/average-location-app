const participants = [];

function submitLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    participants.push({ lat, lng });

    updateMap();
  }, error => {
    alert("Failed to get location");
  });
}

function calculateAverage(coords) {
  const latSum = coords.reduce((sum, p) => sum + p.lat, 0);
  const lngSum = coords.reduce((sum, p) => sum + p.lng, 0);
  return {
    lat: latSum / coords.length,
    lng: lngSum / coords.length
  };
}

let map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let avgMarker;

function updateMap() {
  const avg = calculateAverage(participants);

  if (avgMarker) {
    avgMarker.setLatLng(avg);
  } else {
    avgMarker = L.marker(avg).addTo(map);
  }

  map.setView(avg, 4);
}
