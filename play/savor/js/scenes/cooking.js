// ===== COOKING SCENE =====
// Core gameplay: heat gauge + gesture timing + canvas rendering

const CookingScene = {
    element: null,
    canvas: null,
    ctx: null,
    gaugeCanvas: null,
    gaugeCtx: null,
    dish: null,
    running: false,
    gestureTriggered: false,
    _raf: null,
    _lastTime: 0,
    _criticalEntered: false,
    _hintShown: false,
    _shakeAmount: 0,

    init() {
        this.element = document.getElementById('cooking-hud');
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gaugeCanvas = document.getElementById('heat-gauge-canvas');
        this.gaugeCtx = this.gaugeCanvas.getContext('2d');
    },

    show(dish) {
        this.dish = dish;
        this.running = true;
        this.gestureTriggered = false;
        this._criticalEntered = false;
        this._hintShown = false;
        this._shakeAmount = 0;

        // Resize canvases
        this._resizeCanvas();

        this.element.classList.remove('hidden');
        document.getElementById('cooking-dish-name').textContent =
            `${dish.cuisineIcon} ${dish.name}`;
        document.getElementById('cooking-status').textContent = '加热中...';

        // Show gesture hint
        this._showHint();

        // Init systems
        HeatSystem.init(dish);
        ParticleSystem.clear();
        AudioSystem.startSizzle();
        AudioSystem.startBGM();
        AudioSystem.setBGMVolume(0.03);

        // Init gesture recognition
        GestureSystem.init(this.canvas);
        GestureSystem.setExpected(dish.gestureType, (result, detected) => {
            this._onGesture(result, detected);
        });

        // Start render loop
        this._lastTime = performance.now();
        this._loop();
    },

    hide() {
        this.running = false;
        this.element.classList.add('hidden');
        if (this._raf) cancelAnimationFrame(this._raf);
        AudioSystem.stopSizzle();
        AudioSystem.stopBGM();
        GestureSystem.destroy();
        ParticleSystem.clear();
    },

    _resizeCanvas() {
        const container = document.getElementById('game-container');
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = container.clientWidth * dpr;
        this.canvas.height = container.clientHeight * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = container.clientWidth + 'px';
        this.canvas.style.height = container.clientHeight + 'px';

        // Gauge canvas
        const gc = this.gaugeCanvas;
        gc.width = 280 * dpr;
        gc.height = 60 * dpr;
        this.gaugeCtx.scale(dpr, dpr);
    },

    _showHint() {
        if (this._hintShown) return;
        this._hintShown = true;
        const hint = document.getElementById('gesture-hint');
        const icon = document.getElementById('gesture-icon');
        const text = document.getElementById('gesture-text');
        icon.textContent = GESTURE_TYPES[this.dish.gestureType].icon;
        text.textContent = this.dish.gestureDesc;
        hint.classList.remove('hidden');
        hint.style.animation = 'none';
        hint.offsetHeight; // reflow
        hint.style.animation = 'hintFade 2.5s ease forwards';
        setTimeout(() => hint.classList.add('hidden'), 2600);
    },

    _onGesture(result, detected) {
        if (this.gestureTriggered || !this.running) return;
        if (ExplosionSystem.active) return;

        this.gestureTriggered = true;
        HeatSystem.stop();

        const heat = HeatSystem.getPercent();
        const inCritical = heat >= HeatSystem.criticalMin && heat <= HeatSystem.criticalMax;
        const precision = HeatSystem.getPrecision();

        let rating;
        if (result === 'correct' && inCritical) {
            if (precision > 0.5) {
                rating = 3; // Perfect
            } else {
                rating = 2; // Good
            }
        } else if (heat < HeatSystem.criticalMin) {
            rating = 1; // Too early
        } else {
            rating = 1; // Wrong gesture or out of zone
        }

        this._finishCooking(rating);
    },

    async _finishCooking(rating) {
        this.running = false;

        // Update streak
        if (rating === 3) {
            SaveSystem.setStreak(SaveSystem.getStreak() + 1);
        } else {
            SaveSystem.setStreak(0);
        }

        // Save result
        SaveSystem.saveDishResult(this.dish.id, rating);

        // Trigger explosion
        if (rating === 3) {
            await ExplosionSystem.triggerPerfect(this.dish, this.canvas);
        } else if (rating === 2) {
            await ExplosionSystem.triggerGood(this.dish);
        } else {
            AudioSystem.playFail();
            await Utils.delay(800);
        }

        // Show result
        Game.showResult(this.dish, rating);
    },

    _loop() {
        if (!this.running && !ExplosionSystem.active) return;

        const now = performance.now();
        const dt = Math.min((now - this._lastTime) / 1000, 0.1);
        this._lastTime = now;

        if (this.running) {
            // Update heat
            const prevState = HeatSystem.state;
            HeatSystem.update(dt);

            // State change events
            if (HeatSystem.state === 'critical' && prevState !== 'critical') {
                this._criticalEntered = true;
                AudioSystem.playCriticalEnter();
                document.getElementById('cooking-status').textContent = '临界区间!';
                // Reduce BGM
                AudioSystem.setBGMVolume(0.01);
            }

            if (HeatSystem.state === 'overheated' && prevState !== 'overheated') {
                document.getElementById('cooking-status').textContent = '即将过火!';
            }

            // Auto-burn
            if (HeatSystem.state === 'burnt' && !this.gestureTriggered) {
                this.gestureTriggered = true;
                HeatSystem.stop();
                SaveSystem.setStreak(0);
                SaveSystem.saveDishResult(this.dish.id, 0);
                ExplosionSystem.triggerBurn(this.dish).then(() => {
                    Game.showResult(this.dish, 0);
                });
                this.running = false;
            }

            // Update audio
            AudioSystem.updateSizzle(HeatSystem.getPercent());

            // Shake in overheated state
            if (HeatSystem.state === 'overheated') {
                this._shakeAmount = Math.min(this._shakeAmount + dt * 3, 5);
            }
        }

        // Update particles
        ParticleSystem.update(dt);

        // Emit particles based on heat
        if (this.running && !this.gestureTriggered) {
            const w = this.canvas.width / (window.devicePixelRatio || 1);
            const h = this.canvas.height / (window.devicePixelRatio || 1);
            const intensity = HeatSystem.getPercent() / 100;
            ParticleSystem.emitSteam(w / 2, h * 0.3, intensity * 0.3);
            if (this.dish.id === 'miso_ramen' || this.dish.id === 'tempura') {
                ParticleSystem.emitBubbles(w / 2, h * 0.5, intensity * 0.2);
            }
        }

        // Render
        this._render(dt);

        this._raf = requestAnimationFrame(() => this._loop());
    },

    _render(dt) {
        const ctx = this.ctx;
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);

        // Clear
        ctx.save();

        // Screen shake
        if (this._shakeAmount > 0) {
            const sx = Utils.rand(-this._shakeAmount, this._shakeAmount);
            const sy = Utils.rand(-this._shakeAmount, this._shakeAmount);
            ctx.translate(sx, sy);
        }

        ctx.clearRect(-10, -10, w + 20, h + 20);

        // Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#0a0a0a');
        bgGrad.addColorStop(0.5, '#1a1208');
        bgGrad.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(-10, -10, w + 20, h + 20);

        // Draw food
        this._drawFood(ctx, w, h);

        // Draw particles
        ParticleSystem.draw(ctx);

        ctx.restore();

        // Draw heat gauge
        this._drawGauge();
    },

    _drawFood(ctx, w, h) {
        const heat = HeatSystem.getPercent() / 100;
        const dish = this.dish;
        const cx = w / 2;
        const cy = h * 0.45;
        const baseRadius = Math.min(w, h) * 0.22;

        // Determine color interpolation based on heat
        let fillColor, ringColor, detailColor;
        const colors = dish.foodColors;

        if (heat < 0.6) {
            const t = heat / 0.6;
            fillColor = Utils.lerpColor(
                colors.raw.fill, colors.cooking.fill, t
            );
            ringColor = Utils.lerpColor(
                colors.raw.ring, colors.cooking.ring, t
            );
        } else if (heat < 0.9) {
            const t = (heat - 0.6) / 0.3;
            fillColor = Utils.lerpColor(
                colors.cooking.fill, colors.perfect.fill, t
            );
            ringColor = Utils.lerpColor(
                colors.cooking.ring, colors.perfect.ring, t
            );
        } else {
            const t = (heat - 0.9) / 0.1;
            fillColor = Utils.lerpColor(
                colors.perfect.fill, colors.burnt.fill, Math.min(t, 1)
            );
            ringColor = Utils.lerpColor(
                colors.perfect.ring, colors.burnt.ring, Math.min(t, 1)
            );
        }

        // Plate/pan shadow
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy + baseRadius + 20, baseRadius * 1.2, baseRadius * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();
        ctx.restore();

        // Pan/plate ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * 1.15, 0, Math.PI * 2);
        ctx.fillStyle = '#2a2a2a';
        ctx.fill();
        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Food body with gradient
        ctx.save();
        const foodGrad = ctx.createRadialGradient(
            cx - baseRadius * 0.2, cy - baseRadius * 0.2, 0,
            cx, cy, baseRadius
        );
        foodGrad.addColorStop(0, ringColor);
        foodGrad.addColorStop(0.7, fillColor);
        foodGrad.addColorStop(1, fillColor);
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = foodGrad;
        ctx.fill();
        ctx.restore();

        // Gloss/shine on food (peak at perfect heat)
        const glossIntensity = heat > 0.6 && heat < 0.95
            ? Math.sin((heat - 0.6) / 0.35 * Math.PI) * 0.4
            : 0;
        if (glossIntensity > 0) {
            ctx.save();
            const glossGrad = ctx.createRadialGradient(
                cx - baseRadius * 0.3, cy - baseRadius * 0.3, 0,
                cx, cy, baseRadius * 0.8
            );
            glossGrad.addColorStop(0, `rgba(255, 250, 230, ${glossIntensity})`);
            glossGrad.addColorStop(1, 'rgba(255, 250, 230, 0)');
            ctx.beginPath();
            ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
            ctx.fillStyle = glossGrad;
            ctx.fill();
            ctx.restore();
        }

        // Critical zone pulsing glow
        if (HeatSystem.state === 'critical') {
            const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 200);
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, baseRadius * 1.3, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.2 + pulse * 0.3})`;
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        }

        // Overheated warning glow
        if (HeatSystem.state === 'overheated') {
            const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 150);
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, baseRadius * 1.3, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 60, 30, ${0.3 + pulse * 0.4})`;
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        }

        // Dish-specific details
        this._drawDishDetail(ctx, cx, cy, baseRadius, heat);
    },

    _drawDishDetail(ctx, cx, cy, r, heat) {
        const dish = this.dish;

        if (dish.id === 'fried_egg') {
            // Yolk
            const yolkR = r * 0.35;
            const yolkColor = Utils.lerpColor('#ffcc44', '#ff9900', heat);
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx + r * 0.1, cy - r * 0.05, yolkR, 0, Math.PI * 2);
            const yolkGrad = ctx.createRadialGradient(
                cx + r * 0.05, cy - r * 0.1, 0,
                cx + r * 0.1, cy - r * 0.05, yolkR
            );
            yolkGrad.addColorStop(0, '#fff4cc');
            yolkGrad.addColorStop(0.3, yolkColor);
            yolkGrad.addColorStop(1, yolkColor);
            ctx.fillStyle = yolkGrad;
            ctx.fill();
            ctx.restore();
        }

        if (dish.id === 'pepper_steak') {
            // Grill lines
            ctx.save();
            ctx.globalAlpha = heat * 0.6;
            ctx.strokeStyle = '#3a2010';
            ctx.lineWidth = 3;
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.moveTo(cx - r * 0.6, cy + i * r * 0.25);
                ctx.lineTo(cx + r * 0.6, cy + i * r * 0.25);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (dish.id === 'tempura') {
            // Crispy texture dots
            ctx.save();
            ctx.globalAlpha = heat * 0.5;
            for (let i = 0; i < 20; i++) {
                const angle = (i / 20) * Math.PI * 2;
                const dist = r * Utils.rand(0.3, 0.8);
                ctx.beginPath();
                ctx.arc(
                    cx + Math.cos(angle) * dist,
                    cy + Math.sin(angle) * dist,
                    Utils.rand(1, 3), 0, Math.PI * 2
                );
                ctx.fillStyle = `rgba(180, 140, 60, ${0.3 + heat * 0.4})`;
                ctx.fill();
            }
            ctx.restore();
        }

        if (dish.id === 'salmon_sashimi') {
            // Fat lines
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.strokeStyle = '#ffccaa';
            ctx.lineWidth = 2;
            for (let i = -3; i <= 3; i++) {
                ctx.beginPath();
                ctx.moveTo(cx - r * 0.7, cy + i * r * 0.2 - r * 0.1);
                ctx.bezierCurveTo(
                    cx - r * 0.2, cy + i * r * 0.2 + r * 0.05,
                    cx + r * 0.2, cy + i * r * 0.2 - r * 0.05,
                    cx + r * 0.7, cy + i * r * 0.2 + r * 0.1
                );
                ctx.stroke();
            }
            ctx.restore();
        }
    },

    _drawGauge() {
        const ctx = this.gaugeCtx;
        const w = 280;
        const h = 60;
        ctx.clearRect(0, 0, w, h);

        const heat = HeatSystem.getPercent();
        const cx = w / 2;
        const cy = h + 5;
        const radius = 50;
        const startAngle = Math.PI + 0.3; // slightly past left
        const endAngle = -0.3;            // slightly past right
        const totalAngle = endAngle - startAngle + Math.PI * 2;

        // Background arc
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, startAngle + totalAngle);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();

        // Critical zone highlight
        const critMinAngle = startAngle + (HeatSystem.criticalMin / 100) * totalAngle;
        const critMaxAngle = startAngle + (HeatSystem.criticalMax / 100) * totalAngle;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, critMinAngle, critMaxAngle);
        const pulse = HeatSystem.state === 'critical'
            ? 0.3 + 0.3 * Math.sin(performance.now() / 200)
            : 0.15;
        ctx.strokeStyle = `rgba(255, 215, 0, ${pulse})`;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();

        // Heat progress arc
        const heatAngle = startAngle + (heat / 100) * totalAngle;
        let heatColor;
        if (heat < HeatSystem.criticalMin) {
            heatColor = Utils.lerpColor('#4488aa', '#44aa88', heat / HeatSystem.criticalMin);
        } else if (heat <= HeatSystem.criticalMax) {
            heatColor = '#ffd700';
        } else {
            heatColor = '#ff4422';
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, heatAngle);
        ctx.strokeStyle = heatColor;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();

        // Heat dot
        const dotX = cx + Math.cos(heatAngle) * radius;
        const dotY = cy + Math.sin(heatAngle) * radius;
        ctx.save();
        ctx.beginPath();
        ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
        ctx.fillStyle = heatColor;
        ctx.fill();
        ctx.shadowColor = heatColor;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();

        // Percentage text
        ctx.save();
        ctx.font = '14px -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255,220,180,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(heat) + '%', cx, cy - 15);
        ctx.restore();
    },
};
