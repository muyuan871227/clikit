// ============================================================
// engine.js - Game loop, input handling, camera, constants
// ============================================================

// ---- Game Constants ----
const CONFIG = {
    // World
    MAP_WIDTH: 4000,
    MAP_HEIGHT: 4000,
    TILE_SIZE: 64,

    // Player
    PLAYER_RADIUS: 16,
    PLAYER_BASE_SPEED: 200,
    PLAYER_BASE_HP: 100,
    PLAYER_MAGNET_RANGE: 80,
    PLAYER_MAGNET_SPEED: 400,

    // Combat
    MAX_WEAPONS: 6,
    MAX_ENEMIES_ON_SCREEN: 300,
    LEVEL_DURATION: 900, // 15 minutes in seconds

    // Infection chain
    INFECTION_TICK: 0.5,
    INFECTION_DECAY: 0.8,
    INFECTION_MAX_DEPTH: 5,

    // Visuals
    BG_COLOR: '#1C1C1E',
    GRID_COLOR: '#252528',
    EXP_COLOR: '#4488ff',
    INFECTION_GREEN: '#39FF14',
    BURN_ORANGE: '#FF6B00',
    FREEZE_BLUE: '#00D4FF',
    POISON_GREEN: '#39FF14',
    SHOCK_YELLOW: '#FFD700',
    ENEMY_COLOR: '#8B1A1A',
    PLAYER_COLOR: '#E8F4FD',
    HP_RED: '#ff4444',
    CRIT_COLOR: '#FF8C00',

    // Status effect configs
    STATUS: {
        burn: { dps: 5, duration: 4, spreadRadius: 80, spreadCount: 3, color: '#FF6B00', name: '燃烧' },
        freeze: { slowPct: 0.7, duration: 2, spreadRadius: 50, spreadCount: 2, color: '#00D4FF', name: '冰冻' },
        poison: { dps: 3, duration: 8, spreadRadius: 120, spreadCount: 5, color: '#39FF14', name: '中毒' },
        shock: { stunDur: 0.5, dmgBonus: 0.3, spreadRadius: 60, spreadCount: 1, color: '#FFD700', name: '感电' }
    }
};

// ---- Input System ----
const Input = {
    keys: {},
    mouse: { x: 0, y: 0, down: false },
    touch: { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0, dx: 0, dy: 0 },
    moveDir: { x: 0, y: 0 },

    init(canvas) {
        // Keyboard
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
            e.preventDefault();
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });

        // Mouse
        canvas.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        canvas.addEventListener('mousedown', e => { this.mouse.down = true; });
        canvas.addEventListener('mouseup', e => { this.mouse.down = false; });

        // Touch (virtual joystick)
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            const t = e.touches[0];
            this.touch.active = true;
            this.touch.startX = t.clientX;
            this.touch.startY = t.clientY;
            this.touch.currentX = t.clientX;
            this.touch.currentY = t.clientY;
        }, { passive: false });

        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            if (this.touch.active) {
                const t = e.touches[0];
                this.touch.currentX = t.clientX;
                this.touch.currentY = t.clientY;
            }
        }, { passive: false });

        canvas.addEventListener('touchend', e => {
            e.preventDefault();
            this.touch.active = false;
            this.touch.dx = 0;
            this.touch.dy = 0;
        }, { passive: false });
    },

    update() {
        let dx = 0, dy = 0;

        // Keyboard
        if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

        // Touch joystick
        if (this.touch.active) {
            const tdx = this.touch.currentX - this.touch.startX;
            const tdy = this.touch.currentY - this.touch.startY;
            const dist = Math.sqrt(tdx * tdx + tdy * tdy);
            const deadzone = 15;
            if (dist > deadzone) {
                const maxDist = 80;
                const factor = Math.min(dist, maxDist) / maxDist;
                dx = (tdx / dist) * factor;
                dy = (tdy / dist) * factor;
            }
        }

        // Normalize keyboard input
        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 1) {
                dx /= len;
                dy /= len;
            }
        }

        this.moveDir.x = dx;
        this.moveDir.y = dy;
    }
};

// ---- Camera System ----
const Camera = {
    x: 0, y: 0,
    targetX: 0, targetY: 0,
    width: 0, height: 0,
    smoothing: 0.08,

    follow(target) {
        this.targetX = target.x - this.width / 2;
        this.targetY = target.y - this.height / 2;
    },

    update(dt) {
        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;
    },

    worldToScreen(wx, wy) {
        return { x: wx - this.x, y: wy - this.y };
    },

    isVisible(wx, wy, margin = 100) {
        return wx > this.x - margin && wx < this.x + this.width + margin &&
               wy > this.y - margin && wy < this.y + this.height + margin;
    },

    resize(w, h) {
        this.width = w;
        this.height = h;
    },

    // Screen shake
    shakeAmount: 0,
    shakeDuration: 0,
    shakeX: 0,
    shakeY: 0,

    shake(amount, duration) {
        this.shakeAmount = amount;
        this.shakeDuration = duration;
    },

    updateShake(dt) {
        if (this.shakeDuration > 0) {
            this.shakeDuration -= dt;
            this.shakeX = (Math.random() - 0.5) * this.shakeAmount * 2;
            this.shakeY = (Math.random() - 0.5) * this.shakeAmount * 2;
            this.shakeAmount *= 0.95;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
    }
};

// ---- Particle System ----
class Particle {
    constructor() { this.active = false; }
    init(x, y, vx, vy, color, size, life, shrink = true, glow = false) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.color = color;
        this.size = size; this.maxSize = size;
        this.life = life; this.maxLife = life;
        this.shrink = shrink;
        this.glow = glow;
        this.active = true;
        this.alpha = 1;
    }
    update(dt) {
        if (!this.active) return;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= dt;
        const t = this.life / this.maxLife;
        this.alpha = t;
        if (this.shrink) this.size = this.maxSize * t;
        if (this.life <= 0) this.active = false;
    }
}

const Particles = {
    list: [],
    maxParticles: 2000,

    init() {
        this.list = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.list.push(new Particle());
        }
    },

    emit(x, y, count, color, speedMin, speedMax, sizeMin, sizeMax, lifeMin, lifeMax, glow = false) {
        for (let i = 0; i < count; i++) {
            const p = this._getFree();
            if (!p) return;
            const angle = Math.random() * Math.PI * 2;
            const speed = Utils.rand(speedMin, speedMax);
            p.init(
                x + Utils.rand(-4, 4), y + Utils.rand(-4, 4),
                Math.cos(angle) * speed, Math.sin(angle) * speed,
                color,
                Utils.rand(sizeMin, sizeMax),
                Utils.rand(lifeMin, lifeMax),
                true, glow
            );
        }
    },

    emitDirectional(x, y, angle, spread, count, color, speedMin, speedMax, size, life) {
        for (let i = 0; i < count; i++) {
            const a = angle + Utils.rand(-spread, spread);
            const speed = Utils.rand(speedMin, speedMax);
            const p = this._getFree();
            if (!p) return;
            p.init(x, y, Math.cos(a) * speed, Math.sin(a) * speed, color, size, life);
        }
    },

    _getFree() {
        for (let i = 0; i < this.list.length; i++) {
            if (!this.list[i].active) return this.list[i];
        }
        return null;
    },

    update(dt) {
        for (let i = 0; i < this.list.length; i++) {
            this.list[i].update(dt);
        }
    },

    render(ctx) {
        for (let i = 0; i < this.list.length; i++) {
            const p = this.list[i];
            if (!p.active) continue;
            const sp = Camera.worldToScreen(p.x, p.y);
            if (sp.x < -50 || sp.x > Camera.width + 50 || sp.y < -50 || sp.y > Camera.height + 50) continue;

            ctx.globalAlpha = p.alpha;
            if (p.glow) {
                ctx.shadowColor = p.color;
                ctx.shadowBlur = p.size * 2;
            }
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            if (p.glow) {
                ctx.shadowBlur = 0;
            }
        }
        ctx.globalAlpha = 1;
    }
};

// ---- Floating Text System ----
const FloatingTexts = {
    list: [],

    add(x, y, text, color, size = 16, duration = 0.8) {
        this.list.push({ x, y, text, color, size, duration, maxDuration: duration, vy: -60, alpha: 1 });
    },

    update(dt) {
        for (let i = this.list.length - 1; i >= 0; i--) {
            const ft = this.list[i];
            ft.y += ft.vy * dt;
            ft.vy *= 0.95;
            ft.duration -= dt;
            ft.alpha = ft.duration / ft.maxDuration;
            if (ft.duration <= 0) this.list.splice(i, 1);
        }
    },

    render(ctx) {
        for (const ft of this.list) {
            const sp = Camera.worldToScreen(ft.x, ft.y);
            ctx.globalAlpha = ft.alpha;
            ctx.fillStyle = ft.color;
            ctx.font = `bold ${ft.size}px 'Segoe UI', sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, sp.x, sp.y);
        }
        ctx.globalAlpha = 1;
    }
};
