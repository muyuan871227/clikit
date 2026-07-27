// ===== UTILITY FUNCTIONS =====

const Utils = {
    // Linear interpolation
    lerp(a, b, t) {
        return a + (b - a) * Math.clamp(t, 0, 1);
    },

    // Color interpolation (hex)
    lerpColor(colorA, colorB, t) {
        const a = Utils.hexToRgb(colorA);
        const b = Utils.hexToRgb(colorB);
        t = Math.clamp(t, 0, 1);
        return `rgb(${Math.round(a.r + (b.r - a.r) * t)}, ${Math.round(a.g + (b.g - a.g) * t)}, ${Math.round(a.b + (b.b - a.b) * t)})`;
    },

    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    },

    // Multi-stop color interpolation
    multiLerpColor(stops, t) {
        t = Math.clamp(t, 0, 1);
        for (let i = 0; i < stops.length - 1; i++) {
            if (t <= stops[i + 1].pos) {
                const localT = (t - stops[i].pos) / (stops[i + 1].pos - stops[i].pos);
                return Utils.lerpColor(stops[i].color, stops[i + 1].color, localT);
            }
        }
        return stops[stops.length - 1].color;
    },

    // Easing functions
    easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); },
    easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    easeOutElastic(t) {
        if (t === 0 || t === 1) return t;
        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
    },
    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },

    // Random range
    rand(min, max) { return Math.random() * (max - min) + min; },
    randInt(min, max) { return Math.floor(Utils.rand(min, max + 1)); },

    // Delay helper
    delay(ms) { return new Promise(r => setTimeout(r, ms)); },

    // Get today's date string
    today() { return new Date().toISOString().split('T')[0]; },

    // Simple hash for daily rotation
    dayHash(dateStr) {
        let h = 0;
        for (let i = 0; i < dateStr.length; i++) {
            h = ((h << 5) - h) + dateStr.charCodeAt(i);
            h |= 0;
        }
        return Math.abs(h);
    },

    // Draw rounded rect on canvas
    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    },

    // Vibrate if available and enabled
    vibrate(pattern) {
        if (SaveSystem.get('vibration', true) && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }
};

// Polyfill Math.clamp
if (!Math.clamp) {
    Math.clamp = function(val, min, max) {
        return Math.min(Math.max(val, min), max);
    };
}
