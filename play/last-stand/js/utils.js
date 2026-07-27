// ============================================================
// utils.js - Math utilities, spatial grid, helpers
// ============================================================

const Utils = {
    // Random helpers
    rand(min, max) { return Math.random() * (max - min) + min; },
    randInt(min, max) { return Math.floor(this.rand(min, max + 1)); },
    randPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    chance(pct) { return Math.random() < pct; },

    // Vector math
    dist(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); },
    distSq(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return dx * dx + dy * dy; },
    angle(from, to) { return Math.atan2(to.y - from.y, to.x - from.x); },
    lerp(a, b, t) { return a + (b - a) * t; },
    clamp(v, min, max) { return v < min ? min : v > max ? max : v; },

    normalize(x, y) {
        const len = Math.sqrt(x * x + y * y);
        if (len === 0) return { x: 0, y: 0 };
        return { x: x / len, y: y / len };
    },

    // Format time as MM:SS
    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    // Weighted random pick
    weightedPick(items, weights) {
        const total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (let i = 0; i < items.length; i++) {
            r -= weights[i];
            if (r <= 0) return items[i];
        }
        return items[items.length - 1];
    }
};

// ============================================================
// Spatial Grid for efficient collision detection
// ============================================================
class SpatialGrid {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.cells = new Map();
    }

    clear() {
        this.cells.clear();
    }

    _key(cx, cy) {
        return (cx * 73856093) ^ (cy * 19349663);
    }

    insert(entity) {
        const cx = Math.floor(entity.x / this.cellSize);
        const cy = Math.floor(entity.y / this.cellSize);
        const key = this._key(cx, cy);
        let cell = this.cells.get(key);
        if (!cell) {
            cell = [];
            this.cells.set(key, cell);
        }
        cell.push(entity);
        entity._gridCx = cx;
        entity._gridCy = cy;
    }

    query(x, y, radius) {
        const results = [];
        const minCx = Math.floor((x - radius) / this.cellSize);
        const maxCx = Math.floor((x + radius) / this.cellSize);
        const minCy = Math.floor((y - radius) / this.cellSize);
        const maxCy = Math.floor((y + radius) / this.cellSize);

        for (let cx = minCx; cx <= maxCx; cx++) {
            for (let cy = minCy; cy <= maxCy; cy++) {
                const cell = this.cells.get(this._key(cx, cy));
                if (cell) {
                    for (let i = 0; i < cell.length; i++) {
                        results.push(cell[i]);
                    }
                }
            }
        }
        return results;
    }

    queryRadius(x, y, radius) {
        const candidates = this.query(x, y, radius);
        const rSq = radius * radius;
        const results = [];
        for (let i = 0; i < candidates.length; i++) {
            const e = candidates[i];
            const dx = e.x - x, dy = e.y - y;
            if (dx * dx + dy * dy <= rSq) {
                results.push(e);
            }
        }
        return results;
    }
}

// ============================================================
// Object Pool for performance
// ============================================================
class ObjectPool {
    constructor(factory, reset, initialSize = 50) {
        this.factory = factory;
        this.reset = reset;
        this.pool = [];
        this.active = [];
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(factory());
        }
    }

    get() {
        let obj = this.pool.pop();
        if (!obj) obj = this.factory();
        this.active.push(obj);
        return obj;
    }

    release(obj) {
        const idx = this.active.indexOf(obj);
        if (idx !== -1) {
            this.active.splice(idx, 1);
            this.reset(obj);
            this.pool.push(obj);
        }
    }

    releaseAll() {
        while (this.active.length > 0) {
            const obj = this.active.pop();
            this.reset(obj);
            this.pool.push(obj);
        }
    }
}
