function formatScientific(value, digits = 3) {
    if (value === 0) return "0 × 10⁰";

    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const mantissa = value / Math.pow(10, exponent);

    return `${mantissa.toFixed(digits)} × 10${toSuperscript(exponent)}`;
}

function toSuperscript(num) {
    const map = {
        "-": "⁻",
        "0": "⁰",
        "1": "¹",
        "2": "²",
        "3": "³",
        "4": "⁴",
        "5": "⁵",
        "6": "⁶",
        "7": "⁷",
        "8": "⁸",
        "9": "⁹"
    };
    return String(num).split("").map(c => map[c]).join("");
}

function updateDisplay(speed, deltaT, totalT){
    speedDisplay.textContent = speed.toFixed(2);
    deltaTimeDisplay.textContent = formatScientific(deltaT);
    totalTimeDisplay.textContent = formatScientific(totalT);
}
