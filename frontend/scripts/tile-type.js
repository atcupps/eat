import { RGBColor } from "./color.js";

const MIN_NOISE_VALUE = -1.0;
const MAX_NOISE_VALUE = 1.0;

const DEEP_WATER_THRESHOLD = -0.3;
const SHALLOW_WATER_THRESHOLD = 0;
const BEACH_THRESHOLD = 0.05;
const VEGETATION_THRESHOLD = 0.65;
const HILLS_THRESHOLD = 0.75;

const MIN_NUTRITION = 0.0;
const MAX_NUTRITION = 1.0;

const DEEP_WATER_COLOR = new RGBColor(0, 0, 100);
const SHALLOW_WATER_START_COLOR = new RGBColor(0, 100, 255);
const SHALLOW_WATER_END_COLOR = new RGBColor(150, 200, 255);
const BEACH_COLOR = new RGBColor(240, 230, 150);
const VEGETATION_COLOR = new RGBColor(0, 137, 52);
const HILLS_COLOR = new RGBColor(137, 147, 52);
const MOUNTAIN_START_COLOR = new RGBColor(190, 141, 84);
const MOUNTAIN_END_COLOR = new RGBColor(220, 220, 220);

function effectiveValue(elevation, nutrition) {
    if (BEACH_THRESHOLD < elevation && elevation < VEGETATION_THRESHOLD) {
        // defaultNutrition = 1.0 - (elevation - BEACH_THRESHOLD) / (VEGETATION_THRESHOLD - BEACH_THRESHOLD)
        // solving for elevation:
        // n = 1 - (e - b) / (v - b)
        // n - 1 = - (e - b) / (v - b)
        // (n - 1) * (v - b) = - e + b
        // (1 - n) * (v - b) = e - b
        // (1 - n) * (v - b) + b = e
        return (1 - nutrition) * (VEGETATION_THRESHOLD - BEACH_THRESHOLD) + BEACH_THRESHOLD;
    }
    return elevation;
}

// Color mapping function based on elevation and nutrition value
function getColor(elevation, nutrition) {
    let v = effectiveValue(elevation, nutrition);
    v = Math.max(MIN_NOISE_VALUE, Math.min(MAX_NOISE_VALUE, v));

    if (v < DEEP_WATER_THRESHOLD) {
        // Deep water: -1.0 to -0.3
        let t = (v + 1.0) / (DEEP_WATER_THRESHOLD + 1.0);
        t = Math.max(0, t);
        return RGBColor.lerp(DEEP_WATER_COLOR, SHALLOW_WATER_START_COLOR, t).rgbString();
    } else if (v < SHALLOW_WATER_THRESHOLD) {
        // Shallow water: -0.3 to 0
        let t = (v - DEEP_WATER_THRESHOLD) / (SHALLOW_WATER_THRESHOLD - DEEP_WATER_THRESHOLD);
        return RGBColor.lerp(SHALLOW_WATER_START_COLOR, SHALLOW_WATER_END_COLOR, t).rgbString();
    } else if (v < BEACH_THRESHOLD) {
        // Beach: 0 to 0.05
        return BEACH_COLOR.rgbString();
    } else if (v < VEGETATION_THRESHOLD) {
        // Vegetation: 0.05 to 0.65 (Deep Green to Lighter Green)
        let t = (v - BEACH_THRESHOLD) / (VEGETATION_THRESHOLD - BEACH_THRESHOLD);
        return RGBColor.lerp(VEGETATION_COLOR, HILLS_COLOR, t).rgbString();
    } else if (v < HILLS_THRESHOLD) {
        // Hills: 0.65 to 0.75 (Lighter Green to Light Brown)
        let t = (v - VEGETATION_THRESHOLD) / (HILLS_THRESHOLD - VEGETATION_THRESHOLD);
        return RGBColor.lerp(HILLS_COLOR, MOUNTAIN_START_COLOR, t).rgbString();
    } else {
        // High elevation / Snow: > 0.75 (Light Brown to Gray/White)
        let t = (v - HILLS_THRESHOLD) / (MAX_NOISE_VALUE - HILLS_THRESHOLD);

        return RGBColor.lerp(MOUNTAIN_START_COLOR, MOUNTAIN_END_COLOR, t).rgbString();
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