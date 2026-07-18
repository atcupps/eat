import { getColor, getTileTypeName } from "./tile-type.js";

let mapData = null;
let zoomLevel = 1.0;
let panX = 0;
let panY = 0;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 15.0;
const ZOOM_SPEED = 0.005; // For scroll wheel
const PAN_SPEED = 20; // For arrow keys

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

function updateTransform() {
    canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
}

function updateZoom(newZoom) {
    zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    updateTransform();
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

canvas.addEventListener('mousemove', (e) => {
    if (!mapData) return;

    const rect = canvas.getBoundingClientRect();

    // Scale down from on-screen pixels to actual canvas dimensions
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const tileSize = 20;
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);

    if (tileY >= 0 && tileY < mapData.length && tileX >= 0 && tileX < mapData[0].length) {
        const val = mapData[tileY][tileX];
        const typeName = getTileTypeName(val);

        const typeElem = document.getElementById('infoTileType');
        const valElem = document.getElementById('infoTileValue');

        if (typeElem) typeElem.innerText = typeName;
        if (valElem) valElem.innerText = `Noise Value: ${val.toFixed(4)}\nCoordinates: (${tileX}, ${tileY})`;
    }
});

canvas.addEventListener('mouseleave', () => {
    const typeElem = document.getElementById('infoTileType');
    const valElem = document.getElementById('infoTileValue');
    if (typeElem) typeElem.innerText = 'Hover over a tile';
    if (valElem) valElem.innerText = '';
});