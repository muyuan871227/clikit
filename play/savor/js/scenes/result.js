// ===== RESULT SCENE =====

const ResultScene = {
    element: null,
    currentDish: null,
    currentRating: 0,

    init() {
        this.element = document.getElementById('result-scene');

        document.getElementById('btn-next-dish').addEventListener('click', () => {
            AudioSystem.playClick();
            Game.switchScene('select');
        });
        document.getElementById('btn-back-menu').addEventListener('click', () => {
            AudioSystem.playClick();
            Game.switchScene('menu');
        });
    },

    show(dish, rating) {
        this.currentDish = dish;
        this.currentRating = rating;
        this.element.classList.remove('hidden');

        // Rating label
        const labels = {
            3: '完美出餐',
            2: '不错',
            1: '还需练习',
            0: '残品',
        };
        document.getElementById('result-rating').textContent = labels[rating] || '';

        // Dish name
        document.getElementById('result-dish-name').textContent =
            `${dish.cuisineIcon} ${dish.name}`;

        // Stars
        const starsEl = document.getElementById('result-stars');
        if (rating === 0) {
            starsEl.textContent = '💔';
        } else {
            starsEl.textContent = '⭐'.repeat(rating) + '☆'.repeat(3 - rating);
        }

        // Knowledge tip
        const tipEl = document.getElementById('result-tip');
        if (rating >= 2) {
            tipEl.innerHTML = `
                <strong style="color:#ffdcb4">${dish.knowledge.title}</strong><br>
                ${dish.knowledge.content.slice(0, 80)}...
            `;
        } else if (rating === 0) {
            tipEl.textContent = '食材过火了，但别灰心——下次掌握好火候，你一定能做出完美的料理。';
        } else {
            tipEl.textContent = '时机还差一点。多观察火候值的视觉和听觉线索，感受临界点的到来。';
        }

        // Streak info
        const streak = SaveSystem.getStreak();
        if (streak >= 3) {
            document.getElementById('cooking-status').textContent =
                `🔥 热场 ×${streak}`;
        }
    },

    hide() {
        this.element.classList.add('hidden');
    },
};
