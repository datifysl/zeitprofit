const c = 299792458; // Lichtgeschwindigkeit m/s

let totalTime = 0;
let lastTimestamp = null;

const speedDisplay = document.getElementById("speed");
const deltaTimeDisplay = document.getElementById("deltaTime");
const totalTimeDisplay = document.getElementById("totalTime");
const resetBtn = document.getElementById("resetBtn");

// ---------- Wissenschaftliche Notation ----------
function toSuperscript(num) {
    const map = {
        "-": "⁻","0": "⁰","1": "¹","2": "²","3": "³","4": "⁴",
        "5": "⁵","6": "⁶","7": "⁷","8": "⁸","9": "⁹"
    };
    return String(num).split("").map(c => map[c]).join("");
}

function formatScientific(value) {
    if (Math.abs(value) < 1e-30) value = 1e-30; // minimal sichtbarer Wert

    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const mantissa = value / Math.pow(10, exponent);

    // Dynamische Nachkommastellen
    let digits = 3;
    if (Math.abs(value) < 1e-10) digits = 6;
    if (Math.abs(value) < 1e-15) digits = 8;
    if (Math.abs(value) < 1e-20) digits = 10;

    return mantissa.toFixed(digits) + " × 10" + toSuperscript(exponent);
}

// ---------- Anzeige ----------
function updateDisplay(speed, deltaT, totalT) {
    speedDisplay.textContent = speed.toFixed(2);
    deltaTimeDisplay.textContent = formatScientific(deltaT);
    totalTimeDisplay.textContent = formatScientific(totalT);
}

// ---------- Reset ----------
resetBtn.addEventListener("click", () => {
    totalTime = 0;
    lastTimestamp = null;
    updateDisplay(0, 0, 0);
});

// ---------- GPS + Relativität + Echtzeit-Counter ----------
if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(position => {

        const timestamp = position.timestamp;

        // Wenn speed = 0 oder null, minimale Bewegung setzen
        let speedMS = position.coords.speed;
        if (speedMS === null || speedMS === 0) speedMS = 0.388; // 1,4 km/h

        const speedKMH = speedMS * 3.6;

        // Relativistische Zeitdilatation
        const v = speedMS;
        const gamma = 1 / Math.sqrt(1 - (v * v) / (c * c));
        const deltaT = 1 - 1 / gamma;

        // Echtzeit hochzählen
        if (lastTimestamp) {
            const dt = (timestamp - lastTimestamp) / 1000; // Sekunden seit letztem Update
            totalTime += deltaT * dt;
        }

        updateDisplay(speedKMH, deltaT, totalTime);
        lastTimestamp = timestamp;

    }, () => {
        alert("Standortzugriff fehlgeschlagen.");
    }, { enableHighAccuracy: true });
}
