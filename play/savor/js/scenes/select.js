// ===== DISH SELECTION SCENE =====

const SelectScene = {
    element: null,

    init() {
        this.element = document.getElementById('select-scene');
        this.element.querySelector('.back-btn').addEventListener('click', () => {
            AudioSystem.playClick();
            Game.switchScene('menu');
        });
    },

    show() {
        this.element.classList.remove('hidden');
        this._renderGrid();
    },

    hide() {
        this.element.classList.add('hidden');
    },

    _renderGrid() {
        const grid = document.getElementById('dish-grid');
        grid.innerHTML = '';

        DISHES.forEach(dish => {
            const card = document.createElement('div');
            card.className = 'dish-card';
            card.innerHTML = `
                <div class="dish-card-bg" style="background: ${dish.previewGradient}; width:100%; height:100%;"></div>
                <div class="dish-card-gradient"></div>
                <div class="dish-card-info">
                    <div class="dish-card-name">${dish.cuisineIcon} ${dish.name}</div>
                    <div class="dish-card-type">${dish.nameEn}</div>
                    <div class="dish-card-gesture">${GESTURE_TYPES[dish.gestureType].icon} ${GESTURE_TYPES[dish.gestureType].label}</div>
                    ${this._renderMiniStars(dish.id)}
                </div>
            `;

            card.addEventListener('click', () => {
                AudioSystem.playClick();
                Game.startCooking(dish);
            });

            grid.appendChild(card);
        });
    },

    _renderMiniStars(dishId) {
        const rating = SaveSystem.getDishBestRating(dishId);
        if (rating === 0) return '';
        const stars = '⭐'.repeat(rating);
        return `<div style="margin-top:0.2rem; font-size:0.7rem;">${stars}</div>`;
    },
};
