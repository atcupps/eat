import { clearInfoPanelTile, setInfoPanelTile, updateInfoPanel } from "./info-panel.js";
import { getColor } from "./tile-type.js";

let elevation = null;
let nutrition = null;
let zoomLevel = 1.0;
let panX = 0;
let panY = 0;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 15.0;
const ZOOM_SPEED = 0.005; // For scroll wheel
const PAN_SPEED = 20; // For arrow keys

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

canvas.style.transformOrigin = '0 0';

function updateTransform() {
    canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
}

function zoomTowards(newZoom, clientX, clientY) {
    const oldZoom = zoomLevel;
    newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

    if (newZoom !== oldZoom) {
        const rect = canvas.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;

        panX = panX + offsetX * (1 - newZoom / oldZoom);
        panY = panY + offsetY * (1 - newZoom / oldZoom);

        zoomLevel = newZoom;
        updateTransform();
    }
}

document.getElementById('zoomInBtn').addEventListener('click', () => {
    zoomTowards(zoomLevel * 1.3, window.innerWidth / 2, window.innerHeight / 2);
});

document.getElementById('zoomOutBtn').addEventListener('click', () => {
    zoomTowards(zoomLevel / 1.3, window.innerWidth / 2, window.innerHeight / 2);
});

window.addEventListener('wheel', (e) => {
    // Prevent default scroll behavior so the page doesn't bounce
    e.preventDefault();
    // e.deltaY is positive when scrolling down (zoom out), negative when up (zoom in)
    const zoomMultiplier = Math.exp(-e.deltaY * ZOOM_SPEED);
    zoomTowards(zoomLevel * zoomMultiplier, e.clientX, e.clientY);
}, { passive: false });

// Dragging logic
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

window.addEventListener('mousedown', (e) => {
    // Only drag with left click, and don't interfere with buttons
    if (e.button !== 0 || e.target.tagName.toLowerCase() === 'button') return;
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    panX += dx;
    panY += dy;
    updateTransform();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mouseleave', () => {
    isDragging = false; // Stop dragging if mouse leaves the window
});

// Arrow key logic
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            panY += PAN_SPEED;
            updateTransform();
            break;
        case 'ArrowDown':
            panY -= PAN_SPEED;
            updateTransform();
            break;
        case 'ArrowLeft':
            panX += PAN_SPEED;
            updateTransform();
            break;
        case 'ArrowRight':
            panX -= PAN_SPEED;
            updateTransform();
            break;
    }
});

function renderMap() {
    if (!elevation || elevation.length === 0) return;

    const rows = elevation.length;
    const cols = elevation[0].length;

    const tileSize = 20;

    canvas.width = cols * tileSize;
    canvas.height = rows * tileSize;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const elev = elevation[y][x];
            const nutr = nutrition[y][x];
            ctx.fillStyle = getColor(elev, nutr);
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}

async function connectInit() {
    const init = await fetch("http://localhost:8080/init");
    const data = JSON.parse(await init.text());
    elevation = data.elevation;
    nutrition = data.nutrition;
    renderMap();
}

function connectWebSocket() {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.onopen = () => {
        console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        nutrition = data.nutrition;
        renderMap();
        updateInfoPanel();
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
        console.log("WebSocket connection closed. Reconnecting in 1s...");
        setTimeout(connectWebSocket, 1000);
    };
}

connectInit();
connectWebSocket();

canvas.addEventListener('mousemove', (e) => {
    if (!elevation) return;

    const rect = canvas.getBoundingClientRect();

    // Scale down from on-screen pixels to actual canvas dimensions
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const tileSize = 20;
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);

    let elev = getTileElevation(tileX, tileY);
    let nutr = getTileNutrition(tileX, tileY);
    if (elev !== null && nutr !== null) {
        setInfoPanelTile(tileX, tileY, elev, nutr);
    }
});

canvas.addEventListener('mouseleave', () => {
    clearInfoPanelTile();
});

function getTileElevation(tileX, tileY) {
    if (tileY >= 0 && tileY < elevation.length && tileX >= 0 && tileX < elevation[0].length) {
        return elevation[tileY][tileX];
    }

    return null;
}

function getTileNutrition(tileX, tileY) {
    if (nutrition && tileY >= 0 && tileY < nutrition.length && tileX >= 0 && tileX < nutrition[0].length) {
        return nutrition[tileY][tileX];
    }

    return null;
}

export { getTileElevation, getTileNutrition }