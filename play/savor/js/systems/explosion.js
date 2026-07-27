// ===== SENSORY EXPLOSION SYSTEM =====
// Timed sequence controller for the "perfect moment" feedback

const ExplosionSystem = {
    active: false,
    overlay: null,
    foodImage: null,
    flash: null,
    textEl: null,

    init() {
        this.overlay = document.getElementById('explosion-overlay');
        this.foodImage = document.getElementById('explosion-food-image');
        this.flash = document.getElementById('explosion-flash');
        this.textEl = document.getElementById('explosion-text');
    },

    async triggerPerfect(dish, canvasEl) {
        this.active = true;
        this.overlay.classList.remove('hidden');

        // 0ms: BGM fade out
        AudioSystem.setBGMVolume(0);
        AudioSystem.stopSizzle();

        // 100ms: Camera zoom (food image zoom in)
        await Utils.delay(100);
        this.foodImage.style.background = dish.previewGradient;
        this.foodImage.classList.add('zoom-in');

        // 400ms: Perfect ASMR sound
        await Utils.delay(300);
        AudioSystem.playPerfect();

        // Flash effect
        this.flash.classList.add('active');

        // 500ms: Particles burst on canvas
        const cx = canvasEl.width / 2;
        const cy = canvasEl.height * 0.4;
        ParticleSystem.emitExplosion(cx, cy, dish.explosion.particleColor);

        // 600ms: Vibration (two-stage)
        await Utils.delay(200);
        Utils.vibrate([50, 30, 100]); // short-pause-long

        // 800ms: Gold text
        await Utils.delay(200);
        this.textEl.textContent = dish.explosion.text;
        this.textEl.style.color = dish.explosion.color;
        this.textEl.classList.add('visible');

        // 2500ms: Fade out
        await Utils.delay(1700);
        return this.cleanup();
    },

    async triggerGood(dish) {
        this.active = true;
        this.overlay.classList.remove('hidden');

        AudioSystem.stopSizzle();

        await Utils.delay(100);
        this.foodImage.style.background = dish.previewGradient;
        this.foodImage.style.opacity = '0.7';
        this.foodImage.style.filter = 'saturate(0.7)';
        this.foodImage.classList.add('zoom-in');

        await Utils.delay(400);
        AudioSystem.playClick();

        this.textEl.textContent = dish.name + ' · 不错';
        this.textEl.style.color = '#ccaa66';
        this.textEl.classList.add('visible');

        await Utils.delay(1500);
        return this.cleanup();
    },

    async triggerBurn(dish) {
        this.active = true;
        this.overlay.classList.remove('hidden');

        AudioSystem.stopSizzle();
        AudioSystem.playBurn();

        await Utils.delay(100);
        this.foodImage.style.background =
            'radial-gradient(circle at 50% 45%, #4a3020 0%, #2a1a10 40%, #0a0a0a 100%)';
        this.foodImage.classList.add('zoom-in');

        Utils.vibrate([200]); // long vibration

        await Utils.delay(300);
        this.textEl.textContent = '过火了...';
        this.textEl.style.color = '#aa4444';
        this.textEl.classList.add('visible');

        await Utils.delay(1500);
        return this.cleanup();
    },

    cleanup() {
        this.foodImage.classList.remove('zoom-in');
        this.foodImage.style.opacity = '';
        this.foodImage.style.filter = '';
        this.flash.classList.remove('active');
        this.textEl.classList.remove('visible');
        this.overlay.classList.add('hidden');
        this.active = false;
    },
};
