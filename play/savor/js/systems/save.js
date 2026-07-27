// ===== SAVE SYSTEM =====
// LocalStorage wrapper for game state persistence

const SaveSystem = {
    PREFIX: 'savor_',

    get(key, defaultVal) {
        try {
            const raw = localStorage.getItem(this.PREFIX + key);
            if (raw === null) return defaultVal;
            return JSON.parse(raw);
        } catch {
            return defaultVal;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
        } catch { /* storage full */ }
    },

    // Cookbook data: { dishId: { unlocked, bestRating, perfectCount, unlockedDate } }
    getCookbook() {
        return this.get('cookbook', {});
    },

    saveDishResult(dishId, rating) {
        const cookbook = this.getCookbook();
        const existing = cookbook[dishId] || { unlocked: false, bestRating: 0, perfectCount: 0 };

        existing.unlocked = true;
        existing.bestRating = Math.max(existing.bestRating, rating);
        if (rating === 3) existing.perfectCount = (existing.perfectCount || 0) + 1;
        if (!existing.unlockedDate) existing.unlockedDate = Utils.today();

        cookbook[dishId] = existing;
        this.set('cookbook', cookbook);
    },

    isDishUnlocked(dishId) {
        const cookbook = this.getCookbook();
        return cookbook[dishId]?.unlocked || false;
    },

    getDishBestRating(dishId) {
        const cookbook = this.getCookbook();
        return cookbook[dishId]?.bestRating || 0;
    },

    getUnlockedCount() {
        const cookbook = this.getCookbook();
        return Object.values(cookbook).filter(d => d.unlocked).length;
    },

    // Settings
    getDifficulty() {
        return this.get('difficulty', 'normal');
    },

    setDifficulty(val) {
        this.set('difficulty', val);
    },

    // Last visit date (for cold start detection)
    getLastVisit() {
        return this.get('lastVisit', null);
    },

    setLastVisit() {
        this.set('lastVisit', Utils.today());
    },

    // Hot streak
    getStreak() {
        return this.get('streak', 0);
    },

    setStreak(val) {
        this.set('streak', val);
    },
};
