import { getTileTypeName, getColor } from "./tile-type.js";
import { getTileElevation, getTileNutrition } from "./tilemap.js";

let infoOpen = false;
let tileX = 0;
let tileY = 0;

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

function setInfoPanelTile(x, y, elev, nutr) {
    tileX = x;
    tileY = y;

    const typeName = getTileTypeName(elev);

    if (typeElem) typeElem.innerText = typeName;
    if (valElem) valElem.innerText = `Elevation: ${elev.toFixed(4)}\nNutrition: ${nutr.toFixed(4)}\nCoordinates: (${x}, ${y})`;
    if (tileDisplay) {
        tileDisplay.style.display = 'block';
        tileDisplay.style.backgroundColor = getColor(elev, nutr);
    }
}

function clearInfoPanelTile() {
    if (typeElem) typeElem.innerText = 'Hover over a tile';
    if (valElem) valElem.innerText = '';
    if (tileDisplay) tileDisplay.style.display = 'none';
}

function updateInfoPanel() {
    let elev = getTileElevation(tileX, tileY);
    let nutr = getTileNutrition(tileX, tileY);

    if (elev !== null && nutr !== null) {
        setInfoPanelTile(tileX, tileY, elev, nutr);
    }
}

export { setInfoPanelTile, clearInfoPanelTile, updateInfoPanel }