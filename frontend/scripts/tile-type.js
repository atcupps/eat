const DEEP_WATER_THRESHOLD = -0.3;
const SHALLOW_WATER_THRESHOLD = 0;
const BEACH_THRESHOLD = 0.05;
const VEGETATION_THRESHOLD = 0.65;
const HILLS_THRESHOLD = 0.75;
const MIN_NOISE_VALUE = -1.0;
const MAX_NOISE_VALUE = 1.0;

// Linear interpolation
function lerp(start, end, t) {
    return Math.floor(start + (end - start) * t);
}

// Color mapping function based on noise value
function getColor(v) {
    v = Math.max(MIN_NOISE_VALUE, Math.min(MAX_NOISE_VALUE, v));

    if (v < DEEP_WATER_THRESHOLD) {
        // Deep water: -1.0 to -0.3
        let t = (v + 1.0) / (DEEP_WATER_THRESHOLD + 1.0);
        t = Math.max(0, t);
        return `rgb(0, ${lerp(0, 100, t)}, ${lerp(100, 255, t)})`;
    } else if (v < SHALLOW_WATER_THRESHOLD) {
        // Shallow water: -0.3 to 0
        let t = (v - DEEP_WATER_THRESHOLD) / (SHALLOW_WATER_THRESHOLD - DEEP_WATER_THRESHOLD);
        return `rgb(${lerp(0, 150, t)}, ${lerp(100, 200, t)}, 255)`;
    } else if (v < BEACH_THRESHOLD) {
        // Beach: 0 to 0.05
        return `rgb(240, 230, 150)`;
    } else if (v < VEGETATION_THRESHOLD) {
        // Vegetation: 0.05 to 0.65 (Deep Green to Lighter Green)
        let t = (v - BEACH_THRESHOLD) / (VEGETATION_THRESHOLD - BEACH_THRESHOLD);
        return `rgb(${lerp(0, 120, t)}, ${lerp(100, 150, t)}, ${lerp(0, 40, t)})`;
    } else if (v < HILLS_THRESHOLD) {
        // Hills: 0.65 to 0.75 (Lighter Green to Light Brown)
        let t = (v - VEGETATION_THRESHOLD) / (HILLS_THRESHOLD - VEGETATION_THRESHOLD);
        return `rgb(${lerp(120, 180, t)}, ${lerp(150, 130, t)}, ${lerp(40, 80, t)})`;
    } else {
        // High elevation / Snow: > 0.75 (Light Brown to Gray/White)
        let t = (v - HILLS_THRESHOLD) / (MAX_NOISE_VALUE - HILLS_THRESHOLD);

        // Start from the exact end color of the Hills block (180, 130, 80)
        let startR = 180;
        let startG = 130;
        let startB = 80;

        // Target a neutral gray/white for mountains
        let endGray = 220;

        return `rgb(${lerp(startR, endGray, t)}, ${lerp(startG, endGray, t)}, ${lerp(startB, endGray, t)})`;
    }
}

function getTileTypeName(v) {
    if (v < DEEP_WATER_THRESHOLD) return "Deep Water";
    if (v < SHALLOW_WATER_THRESHOLD) return "Shallow Water";
    if (v < BEACH_THRESHOLD) return "Beach";
    if (v < VEGETATION_THRESHOLD) return "Vegetation";
    if (v < HILLS_THRESHOLD) return "Dirt";
    return "Mountain";
}

export { getColor, getTileTypeName };