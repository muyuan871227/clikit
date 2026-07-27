// ===== PREVIEW SCENE =====
// 3-second food splash on cold start

const PreviewScene = {
    element: null,
    foodEl: null,

    init() {
        this.element = document.getElementById('preview-scene');
        this.foodEl = document.getElementById('preview-food');
    },

    async show() {
        const todayDish = getTodayDish();

        this.element.style.display = 'flex';
        this.element.style.opacity = '1';
        this.element.classList.remove('hidden');
        this.foodEl.style.background = todayDish.previewGradient;

        // Fade in food
        await Utils.delay(100);
        this.foodEl.classList.add('visible');
        this.element.classList.add('active');

        // Hold for 3 seconds
        await Utils.delay(3000);

        // Fade out and hide
        this._forceHide();
    },

    _forceHide() {
        this.element.style.display = 'none';
        this.element.style.opacity = '0';
        this.element.classList.add('hidden');
        this.element.classList.remove('active');
        this.foodEl.classList.remove('visible');
    },

    hide() {
        this._forceHide();
    },
};
