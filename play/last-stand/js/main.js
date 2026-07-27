// ============================================================
// main.js - Entry point, game loop, UI bindings
// ============================================================

(function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Resize
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.scale(dpr, dpr);
        Camera.resize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', resize);
    resize();

    // Init systems
    Input.init(canvas);
    GameState.init();

    // UI Bindings
    document.getElementById('btnStart').addEventListener('click', () => {
        document.getElementById('mainMenu').style.display = 'none';
        GameState.startGame();
    });

    document.getElementById('btnRetry').addEventListener('click', () => {
        document.getElementById('gameOver').style.display = 'none';
        GameState.startGame();
    });

    document.getElementById('btnBackMenu').addEventListener('click', () => {
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'flex';
    });

    document.getElementById('btnUpgrades').addEventListener('click', () => {
        document.getElementById('mainMenu').style.display = 'none';
        GameState.showUpgradeTree();
    });

    document.getElementById('btnBackFromTree').addEventListener('click', () => {
        document.getElementById('upgradeTree').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'flex';
    });

    // Game Loop
    let lastTime = 0;

    function gameLoop(timestamp) {
        const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // Cap at 50ms
        lastTime = timestamp;

        // Update
        if (GameState.state === 'playing') {
            GameState.update(dt);
        }

        // Render
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (GameState.state !== 'menu') {
            GameState.render(ctx, { width: window.innerWidth, height: window.innerHeight });
        }

        ctx.restore();

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
})();
