const c = 299792458;

let totalTime = 0;
let lastTimestamp = null;

const speedDisplay = document.getElementById("speed");
const deltaTimeDisplay = document.getElementById("deltaTime");
const totalTimeDisplay = document.getElementById("totalTime");
const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", () => {
    totalTime = 0;
    lastTimestamp = null;
    updateDisplay(0,0,0);
});

function updateDisplay(speed, deltaT, totalT){
    speedDisplay.textContent = speed.toFixed(2);
    deltaTimeDisplay.textContent = deltaT.toExponential(3);
    totalTimeDisplay.textContent = totalT.toExponential(3);
}

if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(position => {

        const timestamp = position.timestamp;
        const speedMS = position.coords.speed || 0;
        const speedKMH = speedMS * 3.6;

        const v = speedMS;
        const gamma = 1 / Math.sqrt(1 - (v*v)/(c*c));
        const deltaT = 1 - 1/gamma;

        if(lastTimestamp){
            const dt = (timestamp - lastTimestamp)/1000;
            totalTime += deltaT * dt;
        }

        updateDisplay(speedKMH, deltaT, totalTime);
        lastTimestamp = timestamp;

    }, err => {
        alert("Standortzugriff fehlgeschlagen.");
    }, { enableHighAccuracy: true });
}
