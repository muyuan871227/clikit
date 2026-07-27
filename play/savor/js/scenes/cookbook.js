// ===== COOKBOOK SCENE =====
// Food collection / album with waterfall grid

const CookbookScene = {
    element: null,

    init() {
        this.element = document.getElementById('cookbook-scene');
        this.element.querySelector('.back-btn').addEventListener('click', () => {
            AudioSystem.playClick();
            Game.switchScene('menu');
        });
        document.getElementById('detail-close').addEventListener('click', () => {
            this._hideDetail();
        });
    },

    show() {
        this.element.classList.remove('hidden');
        this._renderGrid();

        const count = SaveSystem.getUnlockedCount();
        document.getElementById('cookbook-progress').textContent =
            `${count} / ${DISHES.length}`;
    },

    hide() {
        this.element.classList.add('hidden');
        this._hideDetail();
    },

    _renderGrid() {
        const grid = document.getElementById('cookbook-grid');
        grid.innerHTML = '';

        DISHES.forEach(dish => {
            const unlocked = SaveSystem.isDishUnlocked(dish.id);
            const rating = SaveSystem.getDishBestRating(dish.id);

            const card = document.createElement('div');
            card.className = 'cookbook-card' + (unlocked ? '' : ' locked');

            if (unlocked) {
                card.innerHTML = `
                    <div class="cookbook-card-img" style="background: ${dish.previewGradient}; width:100%; height:100%;"></div>
                    <div class="cookbook-card-label">
                        ${dish.name}
                        ${rating > 0 ? '<br>' + '⭐'.repeat(rating) : ''}
                    </div>
                `;
                card.addEventListener('click', () => {
                    AudioSystem.playClick();
                    this._showDetail(dish);
                });
            } else {
                card.innerHTML = `
                    <div class="cookbook-card-img" style="background: #1a1a1a; width:100%; height:100%;"></div>
                    <span class="lock-icon">🔒</span>
                    <div class="cookbook-card-label">${dish.name}</div>
                `;
            }

            grid.appendChild(card);
        });
    },

    _showDetail(dish) {
        const detail = document.getElementById('cookbook-detail');
        detail.classList.remove('hidden');

        document.getElementById('detail-image').style.background = dish.previewGradient;
        document.getElementById('detail-name').textContent =
            `${dish.cuisineIcon} ${dish.name}`;

        const rating = SaveSystem.getDishBestRating(dish.id);
        document.getElementById('detail-rating').textContent =
            rating > 0 ? '⭐'.repeat(rating) : '';

        const cookbook = SaveSystem.getCookbook();
        const data = cookbook[dish.id];
        const perfectCount = data?.perfectCount || 0;

        document.getElementById('detail-knowledge').innerHTML = `
            <strong>${dish.knowledge.title}</strong>
            ${dish.knowledge.content}
            ${perfectCount >= 5 ? `<br><br><strong>食材故事</strong><br>${dish.story}` : ''}
            ${perfectCount < 5 && perfectCount > 0 ? `<br><br><em style="color:rgba(255,180,100,0.3)">再完美出餐 ${5 - perfectCount} 次解锁食材故事</em>` : ''}
        `;

        const unlockDate = data?.unlockedDate || '';
        document.getElementById('detail-story').textContent =
            unlockDate ? `解锁于 ${unlockDate}` : '';
    },

    _hideDetail() {
        document.getElementById('cookbook-detail').classList.add('hidden');
    },
};
