import { getTileTypeName, getColor } from "./tile-type.js";
import { getTileValue } from "./tilemap.js";

let infoOpen = false;
let tileX = 0;
let tileY = 0;
let tileValue = 0.0;

const toggleBtnContainer = document.querySelector('.left-controls');
const toggleBtn = document.getElementById('infoToggleBtn');
const infoPanel = document.getElementById('infoPanel');
const typeElem = document.getElementById('infoTileType');
const valElem = document.getElementById('infoTileValue');
const tileDisplay = document.getElementById('infoTileDisplay');

document.addEventListener('DOMContentLoaded', () => {

    toggleBtn.addEventListener('click', () => {
        infoOpen = !infoOpen;
        infoPanel.classList.toggle('open');
        toggleBtnContainer.classList.toggle('open');
    });
});

function setInfoPanelTile(x, y, val) {
    tileX = x;
    tileY = y;
    tileValue = val;

    const typeName = getTileTypeName(val);

    if (typeElem) typeElem.innerText = typeName;
    if (valElem) valElem.innerText = `Noise Value: ${val.toFixed(4)}\nCoordinates: (${x}, ${y})`;
    if (tileDisplay) {
        tileDisplay.style.display = 'block';
        tileDisplay.style.backgroundColor = getColor(val);
    }
}

function clearInfoPanelTile() {
    if (typeElem) typeElem.innerText = 'Hover over a tile';
    if (valElem) valElem.innerText = '';
    if (tileDisplay) tileDisplay.style.display = 'none';
}

function updateInfoPanel() {
    let val = getTileValue(tileX, tileY);

    if (val !== null) {
        setInfoPanelTile(tileX, tileY, val);
    }
}

export { setInfoPanelTile, clearInfoPanelTile, updateInfoPanel }