// ===== MAIN GAME CONTROLLER =====

const Game = {
    currentScene: null,

    async init() {
        // Init all systems
        AudioSystem.init();
        ExplosionSystem.init();

        // Init all scenes
        PreviewScene.init();
        MenuScene.init();
        SelectScene.init();
        CookingScene.init();
        ResultScene.init();
        CookbookScene.init();

        // First-time user touch to unlock audio context
        const unlockAudio = () => {
            AudioSystem._ensureCtx();
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('click', unlockAudio);
        };
        document.addEventListener('touchstart', unlockAudio, { once: true });
        document.addEventListener('click', unlockAudio, { once: true });

        // Show preview on cold start (different day or first visit)
        const lastVisit = SaveSystem.getLastVisit();
        const today = Utils.today();

        if (lastVisit !== today) {
            SaveSystem.setLastVisit();
            await PreviewScene.show();
        }

        // Show main menu
        this.switchScene('menu');
    },

    switchScene(name) {
        // Always ensure preview is hidden
        PreviewScene.hide();

        // Hide all scenes
        if (this.currentScene) {
            this._getScene(this.currentScene)?.hide();
        }

        // Clear canvas when leaving cooking
        if (this.currentScene === 'cooking') {
            const canvas = document.getElementById('game-canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        this.currentScene = name;
        this._getScene(name)?.show();
    },

    startCooking(dish) {
        // Hide other scenes
        if (this.currentScene) {
            this._getScene(this.currentScene)?.hide();
        }
        this.currentScene = 'cooking';
        CookingScene.show(dish);
    },

    showResult(dish, rating) {
        CookingScene.hide();
        this.currentScene = 'result';
        ResultScene.show(dish, rating);
    },

    _getScene(name) {
        const scenes = {
            preview: PreviewScene,
            menu: MenuScene,
            select: SelectScene,
            cooking: CookingScene,
            result: ResultScene,
            cookbook: CookbookScene,
        };
        return scenes[name];
    },
};

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
