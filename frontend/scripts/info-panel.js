let infoOpen = false;

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtnContainer = document.querySelector('.left-controls');
    const toggleBtn = document.getElementById('infoToggleBtn');
    const infoPanel = document.getElementById('infoPanel');

    toggleBtn.addEventListener('click', () => {
        infoOpen = !infoOpen;
        infoPanel.classList.toggle('open');
        toggleBtnContainer.classList.toggle('open');
    });
});