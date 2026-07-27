// ===== PARTICLE SYSTEM =====
// Canvas-based particles for steam, oil sparks, and explosion effects

class Particle {
    constructor(x, y, opts = {}) {
        this.x = x;
        this.y = y;
        this.vx = opts.vx || Utils.rand(-0.5, 0.5);
        this.vy = opts.vy || Utils.rand(-2, -0.5);
        this.life = opts.life || Utils.rand(0.5, 2);
        this.maxLife = this.life;
        this.size = opts.size || Utils.rand(2, 6);
        this.color = opts.color || 'rgba(255,255,255,0.3)';
        this.type = opts.type || 'steam'; // steam, spark, bubble
        this.gravity = opts.gravity || 0;
        this.friction = opts.friction || 0.99;
    }

    update(dt) {
        this.life -= dt;
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        return this.life > 0;
    }

    draw(ctx) {
        const alpha = Math.clamp(this.life / this.maxLife, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha * 0.6;

        if (this.type === 'steam') {
            const s = this.size * (1 + (1 - alpha) * 2);
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, s);
            gradient.addColorStop(0, 'rgba(255,248,240,0.3)');
            gradient.addColorStop(1, 'rgba(255,248,240,0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'spark') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'bubble') {
            const s = this.size * alpha;
            ctx.strokeStyle = 'rgba(255,240,220,0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}

const ParticleSystem = {
    particles: [],

    clear() {
        this.particles = [];
    },

    emit(x, y, count, opts = {}) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(
                x + Utils.rand(-20, 20),
                y + Utils.rand(-10, 10),
                opts
            ));
        }
    },

    // Emit steam rising from food
    emitSteam(x, y, intensity) {
        const count = Math.floor(intensity * 3);
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(
                x + Utils.rand(-40, 40),
                y + Utils.rand(-10, 0),
                {
                    vx: Utils.rand(-0.3, 0.3),
                    vy: Utils.rand(-1.5, -0.3) * (0.5 + intensity),
                    life: Utils.rand(0.8, 2.5),
                    size: Utils.rand(4, 12) * (0.5 + intensity * 0.5),
                    type: 'steam',
                }
            ));
        }
    },

    // Oil spark burst
    emitSparks(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const angle = Utils.rand(0, Math.PI * 2);
            const speed = Utils.rand(1, 5);
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: Utils.rand(0.3, 0.8),
                size: Utils.rand(1, 3),
                color: color || '#ffcc66',
                type: 'spark',
                gravity: 0.1,
                friction: 0.97,
            }));
        }
    },

    // Bubbles for liquid cooking
    emitBubbles(x, y, intensity) {
        const count = Math.floor(intensity * 2);
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(
                x + Utils.rand(-30, 30),
                y + Utils.rand(0, 20),
                {
                    vx: Utils.rand(-0.2, 0.2),
                    vy: Utils.rand(-1, -0.2),
                    life: Utils.rand(0.3, 1.2),
                    size: Utils.rand(2, 6),
                    type: 'bubble',
                }
            ));
        }
    },

    // Explosion burst for perfect moment
    emitExplosion(x, y, color) {
        // Central burst
        this.emitSparks(x, y, 30, color);
        // Ring of steam
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const dist = Utils.rand(20, 60);
            this.particles.push(new Particle(
                x + Math.cos(angle) * dist,
                y + Math.sin(angle) * dist,
                {
                    vx: Math.cos(angle) * 1.5,
                    vy: Math.sin(angle) * 1.5 - 0.5,
                    life: Utils.rand(1, 2.5),
                    size: Utils.rand(8, 18),
                    type: 'steam',
                }
            ));
        }
    },

    update(dt) {
        this.particles = this.particles.filter(p => p.update(dt));
    },

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    },
};
