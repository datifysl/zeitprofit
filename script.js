const c = 299792458; // Lichtgeschwindigkeit in m/s

let totalTime = 0;
let lastTimestamp = null;
let lastPosition = null;

const speedDisplay = document.getElementById("speed");
const deltaTimeDisplay = document.getElementById("deltaTime");
const totalTimeDisplay = document.getElementById("totalTime");
const resetBtn = document.getElementById("resetBtn");

// Reset-Funktion
resetBtn.addEventListener("click", () => {
    totalTime = 0;
    lastTimestamp = null;
    lastPosition = null;
    speedDisplay.textContent = "0";
    deltaTimeDisplay.textContent = "0";
    totalTimeDisplay.textContent = "0";
});

// GPS und Berechnung
if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(position => {
        const timestamp = position.timestamp;
        const coords = position.coords;

        let speed = 0;
        if (coords.speed != null) {
            speed = coords.speed * 3.6; // m/s -> km/h
        } else if (lastPosition) {
            const dt = (timestamp - lastTimestamp) / 1000; // s
            const dx = coords.latitude - lastPosition.latitude;
            const dy = coords.longitude - lastPosition.longitude;
            const dz = (coords.altitude || 0) - (lastPosition.altitude || 0);
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz) * 111139;
            speed = (distance / dt) * 3.6; // km/h
        }

        const v = speed / 3.6; // km/h -> m/s
        const gamma = 1 / Math.sqrt(1 - (v*v)/(c*c));
        const deltaT = (1 - 1/gamma);

        if (lastTimestamp) {
            const dt = (timestamp - lastTimestamp) / 1000;
            totalTime += deltaT * dt;
        }

        speedDisplay.textContent = speed.toFixed(2);
        deltaTimeDisplay.textContent = deltaT.toExponential(3);
        totalTimeDisplay.textContent = totalTime.toExponential(3);

        lastTimestamp = timestamp;
        lastPosition = coords;

    }, err => {
        alert("Fehler beim Abrufen des Standorts: " + err.message);
    }, { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 });
} else {
    alert("Geolocation wird von deinem Browser nicht unterstützt.");
}