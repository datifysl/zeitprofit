const c = 299792458; // Lichtgeschwindigkeit m/s

let totalMantissa = 0;
let totalExponent = null;
let lastTimestamp = null;

const speedDisplay = document.getElementById("speed");
const deltaTimeDisplay = document.getElementById("deltaTime");
const totalTimeDisplay = document.getElementById("totalTime");
const resetBtn = document.getElementById("resetBtn");

// ---------- Superscript Helper ----------
function toSuperscript(num) {
    const map = {"-":"⁻","0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹"};
    return String(num).split("").map(c => map[c] || c).join("");
}

// ---------- Format als x × 10^n ----------
function formatScientific(mantissa, exponent) {
    return mantissa.toFixed(3) + " × 10" + toSuperscript(exponent);
}

// ---------- Anzeige ----------
function updateDisplay(speed, deltaMant, deltaExp, totalMant, totalExp) {
    speedDisplay.textContent = speed.toFixed(2);
    deltaTimeDisplay.textContent = formatScientific(deltaMant, deltaExp);
    totalTimeDisplay.textContent = formatScientific(totalMant, totalExp);
}

// ---------- Reset ----------
resetBtn.addEventListener("click", () => {
    totalMantissa = 0;
    totalExponent = null;
    lastTimestamp = null;
    updateDisplay(0, 0, 0, 0, 0);
});

// ---------- GPS + Exponenten-Methode ----------
if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(position => {

        const timestamp = position.timestamp;
        let speedMS = position.coords.speed;

        // Nur echte GPS-Werte nutzen, sonst 0
        if (speedMS === null) speedMS = 0;

        const speedKMH = speedMS * 3.6;

        // Minimalbewegung sichtbar machen (z.B. GPS-Noise > 0)
        const MIN_SPEED = 0.01; // 0.036 km/h
        if (speedMS > 0 && speedMS < MIN_SPEED) speedMS = MIN_SPEED;

        // Δt pro Sekunde ~ v^2 / (2c^2) nur Exponent berechnen
        const deltaRaw = (speedMS*speedMS)/(2*c*c);
        const deltaExp = Math.floor(Math.log10(deltaRaw));
        const deltaMant = deltaRaw / Math.pow(10, deltaExp);

        // Kumulative Zeit hochzählen
        if (lastTimestamp) {
            const dt = (timestamp - lastTimestamp) / 1000; // Sekunden seit letztem Update
            const deltaTotal = deltaMant * Math.pow(10, deltaExp) * dt;

            if (totalExponent === null) {
                totalExponent = Math.floor(Math.log10(deltaTotal));
                totalMantissa = deltaTotal / Math.pow(10, totalExponent);
            } else {
                let newTotal = totalMantissa * Math.pow(10, totalExponent) + deltaTotal;
                totalExponent = Math.floor(Math.log10(newTotal));
                totalMantissa = newTotal / Math.pow(10, totalExponent);
            }
        } else {
            totalMantissa = deltaMant;
            totalExponent = deltaExp;
        }

        updateDisplay(speedKMH, deltaMant, deltaExp, totalMantissa, totalExponent);
        lastTimestamp = timestamp;

    }, () => {
        alert("Standortzugriff fehlgeschlagen.");
    }, { enableHighAccuracy: true });
}
