let mapData = null;
let zoomLevel = 1.0;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 15.0;
const ZOOM_SPEED = 0.005; // For scroll wheel

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

function updateZoom(newZoom) {
    zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    canvas.style.transform = `scale(${zoomLevel})`;
}

document.getElementById('zoomInBtn').addEventListener('click', () => {
    updateZoom(zoomLevel * 1.3);
});

document.getElementById('zoomOutBtn').addEventListener('click', () => {
    updateZoom(zoomLevel / 1.3);
});

window.addEventListener('wheel', (e) => {
    // Prevent default scroll behavior so the page doesn't bounce
    e.preventDefault();
    // e.deltaY is positive when scrolling down (zoom out), negative when up (zoom in)
    const zoomMultiplier = Math.exp(-e.deltaY * ZOOM_SPEED);
    updateZoom(zoomLevel * zoomMultiplier);
}, { passive: false });

// Linear interpolation
function lerp(start, end, t) {
    return Math.floor(start + (end - start) * t);
}

// Color mapping function based on noise value
function getColor(v) {
    // Clamp v to [-1, 1] just in case
    v = Math.max(-1, Math.min(1, v));

    if (v < -0.3) {
        // Deep water: -1.0 to -0.3
        let t = (v + 1.0) / 0.7;
        t = Math.max(0, t);
        return `rgb(0, ${lerp(0, 100, t)}, ${lerp(100, 255, t)})`;
    } else if (v < 0) {
        // Shallow water: -0.3 to 0
        let t = (v + 0.3) / 0.3;
        return `rgb(${lerp(0, 150, t)}, ${lerp(100, 200, t)}, 255)`;
    } else if (v < 0.05) {
        // Beach: 0 to 0.05
        return `rgb(240, 230, 150)`;
    } else if (v < 0.65) {
        // Vegetation: 0.05 to 0.65
        let t = (v - 0.05) / 0.75;
        return `rgb(${lerp(0, 180, t)}, ${lerp(100, 130, t)}, ${lerp(0, 80, t)})`;
    } else if (v < 0.75) {
        // Light brown: 0.65 to 0.75
        let t = (v - 0.05) / 0.75;
        return `rgb(${lerp(0, 180, t)}, ${lerp(100, 130, t)}, ${lerp(0, 80, t)})`;
    } else {
        // High elevation: > 0.75
        // Normalize t from 0 to 1 for the range 0.75 to 1.0
        let t = (v - 0.75) / 0.25;

        // Calculate the exact color at v = 0.75 from the previous block to ensure a seamless match
        let t_prev = (0.75 - 0.05) / 0.75;
        let startR = lerp(0, 180, t_prev);
        let startG = lerp(100, 130, t_prev);
        let startB = lerp(0, 80, t_prev);

        // Target a neutral gray
        let endGray = 180;

        return `rgb(${lerp(startR, endGray, t)}, ${lerp(startG, endGray, t)}, ${lerp(startB, endGray, t)})`;
    }
}

function renderMap() {
    if (!mapData || mapData.length === 0) return;

    const rows = mapData.length;
    const cols = mapData[0].length;

    const tileSize = 20;

    canvas.width = cols * tileSize;
    canvas.height = rows * tileSize;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const val = mapData[y][x];
            ctx.fillStyle = getColor(val);
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}

async function fetchAndRenderMap() {
    try {
        const response = await fetch('http://localhost:8080/');
        mapData = await response.json();
        renderMap();
    } catch (error) {
        console.error("Failed to fetch map:", error);
        canvas.width = 400;
        canvas.height = 200;
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '16px sans-serif';
        ctx.fillText('Failed to load map. Is the Go backend running?', 200, 100);
    }
}

// Run on load
fetchAndRenderMap();