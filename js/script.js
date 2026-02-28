const c = 299792458; // Lichtgeschwindigkeit m/s

let totalMantissa = 0;
let totalExponent = null;
let lastTimestamp = null;

const speedDisplay = document.getElementById("speed");
const deltaTimeDisplay = document.getElementById("deltaTime");
const totalTimeDisplay = document.getElementById("totalTime");
const resetBtn = document.getElementById("resetBtn");

// Superscript Helper
function toSuperscript(num) {
    const map = {"-":"⁻","0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹"};
    return String(num).split("").map(c => map[c] || c).join("");
}

// Format als x × 10^n
function formatScientific(mantissa, exponent) {
    return mantissa.toFixed(3) + " × 10" + toSuperscript(exponent);
}

// Anzeige
function updateDisplay(speed, deltaMant, deltaExp, totalMant, totalExp) {
    speedDisplay.textContent = speed.toFixed(2);
    deltaTimeDisplay.textContent = formatScientific(deltaMant, deltaExp);
    totalTimeDisplay.textContent = formatScientific(totalMant, totalExp);
}

// Reset
resetBtn.addEventListener("click", () => {
    totalMantissa = 0;
    totalExponent = null;
    lastTimestamp = null;
    updateDisplay(0, 0, 0, 0, 0);
});

// GPS + echte Geschwindigkeit
if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(position => {
        const timestamp = position.timestamp;
        let speedMS = position.coords.speed || 0;
        const speedKMH = speedMS * 3.6;

        // Δt berechnen
        let deltaRaw = (speedMS * speedMS) / (2 * c * c);
        let deltaExp, deltaMant;

        if (deltaRaw === 0) {
            deltaMant = 0;
            deltaExp = 0;
        } else {
            deltaExp = Math.floor(Math.log10(deltaRaw));
            deltaMant = deltaRaw / Math.pow(10, deltaExp);
        }

        // Kumulative Zeit hochzählen nur bei echter Geschwindigkeit
        if (lastTimestamp) {
            const dt = (timestamp - lastTimestamp) / 1000;
            if (speedMS > 0) {
                const deltaTotal = deltaMant * Math.pow(10, deltaExp) * dt;

                if (totalExponent === null) {
                    totalMantissa = deltaTotal;
                    totalExponent = deltaTotal === 0 ? 0 : Math.floor(Math.log10(deltaTotal));
                } else {
                    let newTotal = totalMantissa * Math.pow(10, totalExponent) + deltaTotal;
                    totalExponent = newTotal === 0 ? 0 : Math.floor(Math.log10(newTotal));
                    totalMantissa = newTotal / Math.pow(10, totalExponent);
                }
            }
        } else {
            // Erstes GPS-Update, keine Kumulierung, nur delta vorbereiten
            if (speedMS > 0) {
                totalMantissa = deltaMant;
                totalExponent = deltaExp;
            }
        }

        updateDisplay(speedKMH, deltaMant, deltaExp, totalMantissa, totalExponent === null ? 0 : totalExponent);
        lastTimestamp = timestamp;

    }, () => {
        alert("Standortzugriff fehlgeschlagen.");
    }, { enableHighAccuracy: true });
}
