// ===== MAIN MENU SCENE =====

const MenuScene = {
    element: null,

    init() {
        this.element = document.getElementById('menu-scene');

        document.getElementById('btn-start').addEventListener('click', () => {
            AudioSystem.playClick();
            Game.switchScene('select');
        });
        document.getElementById('btn-cookbook').addEventListener('click', () => {
            AudioSystem.playClick();
            Game.switchScene('cookbook');
        });
        document.getElementById('btn-settings').addEventListener('click', () => {
            AudioSystem.playClick();
            this.showSettings();
        });
        document.getElementById('settings-close').addEventListener('click', () => {
            this.hideSettings();
        });

        // Settings controls
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            SaveSystem.setDifficulty(e.target.value);
        });
        document.getElementById('vibration-toggle').addEventListener('change', (e) => {
            SaveSystem.set('vibration', e.target.checked);
        });
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            AudioSystem.setEnabled(e.target.checked);
        });
    },

    show() {
        this.element.classList.remove('hidden');

        // Update today's challenge
        const todayDish = getTodayDish();
        document.getElementById('today-challenge').innerHTML = `
            <div class="challenge-label">今日挑战</div>
            <div class="challenge-dish">${todayDish.cuisineIcon} ${todayDish.name}</div>
        `;

        // Sync settings UI
        document.getElementById('difficulty-select').value = SaveSystem.getDifficulty();
        document.getElementById('vibration-toggle').checked = SaveSystem.get('vibration', true);
        document.getElementById('sound-toggle').checked = SaveSystem.get('sound', true);
    },

    hide() {
        this.element.classList.add('hidden');
        this.hideSettings();
    },

    showSettings() {
        document.getElementById('settings-overlay').classList.remove('hidden');
    },

    hideSettings() {
        document.getElementById('settings-overlay').classList.add('hidden');
    },
};
