// ===== HEAT SYSTEM =====
// Manages heat value, critical zone, and state

const HeatSystem = {
    value: 0,           // 0-100
    speed: 1,           // %/second
    criticalMin: 75,
    criticalMax: 90,
    burnTime: 5,        // seconds after max before burn
    burnTimer: 0,
    state: 'idle',      // idle, heating, critical, overheated, burnt
    prevState: 'idle',
    hotStreak: 0,       // consecutive perfects

    init(dish) {
        this.value = 0;
        this.speed = dish.heatSpeed;
        this.burnTime = dish.burnTime;
        this.burnTimer = 0;
        this.state = 'heating';
        this.prevState = 'idle';

        // Apply difficulty modifier to critical zone
        const diff = DIFFICULTY[SaveSystem.getDifficulty()] || DIFFICULTY.normal;
        const baseWidth = dish.criticalMax - dish.criticalMin;
        const adjustedWidth = baseWidth * diff.multiplier;

        // Apply hot streak bonus
        const streak = SaveSystem.getStreak();
        const streakBonus = streak >= 3 ? 10 : 0;

        const center = (dish.criticalMin + dish.criticalMax) / 2;
        this.criticalMin = Math.max(0, center - (adjustedWidth + streakBonus) / 2);
        this.criticalMax = Math.min(100, center + (adjustedWidth + streakBonus) / 2);
    },

    update(dt) {
        if (this.state === 'idle' || this.state === 'burnt') return;

        this.prevState = this.state;

        // Heat rises
        this.value += this.speed * dt;
        this.value = Math.min(this.value, 105); // allow a bit over for burn timer

        // Determine state
        if (this.value < this.criticalMin) {
            this.state = 'heating';
        } else if (this.value >= this.criticalMin && this.value <= this.criticalMax) {
            this.state = 'critical';
        } else if (this.value > this.criticalMax) {
            this.state = 'overheated';
            this.burnTimer += dt;
            if (this.burnTimer >= this.burnTime) {
                this.state = 'burnt';
            }
        }

        return this.state;
    },

    isInCritical() {
        return this.state === 'critical';
    },

    getPercent() {
        return Math.clamp(this.value, 0, 100);
    },

    // Normalized position within critical zone (0 = min, 1 = max)
    getCriticalPosition() {
        if (this.value < this.criticalMin) return -1;
        if (this.value > this.criticalMax) return 2;
        return (this.value - this.criticalMin) / (this.criticalMax - this.criticalMin);
    },

    // How close to center of critical zone (0 = perfect center, 1 = edge)
    getPrecision() {
        const center = (this.criticalMin + this.criticalMax) / 2;
        const halfWidth = (this.criticalMax - this.criticalMin) / 2;
        return 1 - Math.abs(this.value - center) / halfWidth;
    },

    stop() {
        this.state = 'idle';
    },
};
