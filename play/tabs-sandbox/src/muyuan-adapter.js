// ═══ muyuan-adapter.js ═══
// 把 TABS Lite 桥接到 Sharky/Delta 游戏运行时 SDK (muyuan 环境)
//
// 核心思路:
// - muyuan SDK 提供 #game canvas + 生命周期 (lobby/playing/result)
// - TABS 有自己的 Three.js 渲染 + 事件总线 + 主循环
// - 此 adapter:
//   1. 注入额外的 #threecanvas (覆盖在 #game 之上做 3D 渲染)
//   2. 把 TABS 的 #ui canvas 也注入
//   3. 让 TABS 的 main loop 自己跑 (SDK render 回调只做空操作)
//   4. 通过 __DELTA_GAME_CONFIG__ 给 SDK 提供必要的 lifecycle 回调
//   5. 单人模式 (沙盒) — 不做多人同步, 通过 SDK 的 parallel networkProfile

(function () {
  'use strict';

  // SDK 加载时若 DOM 还没准备好, 等一下
  function whenReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // 把 #threecanvas 和 #ui 注入页面 (在 #game 之上)
  function injectTabsCanvases() {
    if (!document.getElementById('threecanvas')) {
      const c = document.createElement('canvas');
      c.id = 'threecanvas';
      c.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;pointer-events:none;display:block;';
      document.body.appendChild(c);
    }
    if (!document.getElementById('ui')) {
      const c = document.createElement('canvas');
      c.id = 'ui';
      c.width = 1280;
      c.height = 720;
      // 16:9 自适应居中, 与 standalone 版本一致
      c.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);aspect-ratio:16/9;width:min(100vw,calc(100vh*16/9));height:min(100vh,calc(100vw*9/16));z-index:3;pointer-events:auto;touch-action:none;';
      document.body.appendChild(c);
    }
    // 隐藏 SDK 的 #game canvas (我们用自己的两个)
    const sdkCanvas = document.getElementById('game');
    if (sdkCanvas) sdkCanvas.style.display = 'none';
  }

  // 通知 TABS 主菜单跳过, 直接进沙盒
  function autoStartSandbox() {
    if (typeof emit === 'function') {
      emit('menu_select', { option: 'sandbox' });
    }
  }

  whenReady(() => {
    injectTabsCanvases();
    // TABS 的 main.js 在自己加载时会自动 init 所有系统并启动主循环
    // 等待 RenderSys 就绪后再处理
    let tries = 0;
    const wait = setInterval(() => {
      tries++;
      if (typeof window.GameState !== 'undefined' && window.RenderSys && window.cameraAPI) {
        clearInterval(wait);
        // 自动进沙盒
        setTimeout(autoStartSandbox, 300);
      } else if (tries > 40) {
        clearInterval(wait);
        console.warn('[muyuan-adapter] TABS systems failed to initialize within 4s');
      }
    }, 100);
  });

  // ═══ DELTA Game Config ═══
  // 提供给 muyuan SDK 的最小契约
  window.__DELTA_GAME_CONFIG__ = {
    title: 'TABS Lite',
    subtitle: 'Absurd Battle Simulator',
    instructions: [
      'Deploy units on each side',
      'Left half = Blue · Right half = Red',
      'Press START BATTLE to launch',
      'Right-click removes a unit'
    ],
    theme: { bg: '#0d0f1a', accent: '#58CC02', text: '#FFFFFF', animation: 'none', bgPreset: 'none' },
    minPlayers: 1,
    maxPlayers: 1,
    // 单人并行模式 (每个玩家独立, 无需同步)
    networkProfile: { class: 'confirm_only', interactionModel: 'parallel' },
    world: { width: 1280, height: 720 },

    initState: function (ctx) {
      return { phase: 'init', startTime: Date.now() };
    },

    initPlayer: function (userId, info, ctx) {
      return { user_id: userId, joined_at: Date.now() };
    },

    // SDK render 我们空跑 — TABS 有自己的 requestAnimationFrame 主循环, 渲染到 #threecanvas + #ui
    render: function (c, state, ctx, phase, dt) {
      // 清掉 SDK canvas, 我们用自己的两个 canvas
      if (c && c.canvas) {
        c.clearRect(0, 0, c.canvas.width, c.canvas.height);
      }
    },

    // SDK 输入 → TABS 事件 (沙盒不需要多人 action 同步, 输入直接到本地)
    customActions: function (input, ctx) {
      // 沙盒模式 TABS 的 InputSys 已经接管了 pointer 事件, 这里不返回任何 action
      // (SDK 会自动派发 MOVE 等动作, 我们让它走 noop)
      return null;
    },

    onAction: function (state, action, userId, ctx) {
      // 让 SDK 自动处理 START / RESTART, 不干预游戏逻辑
      return state;
    },

    onTick: function (state, dt, ctx) {
      // TABS 自己的 main loop 驱动, 这里不需要做事
      return state;
    },

    // 当所有蓝方或红方都死了, 单局结束
    isGameOver: function (state) {
      try {
        if (typeof GameState === 'undefined' || !GameState.getState) return false;
        const s = GameState.getState();
        return s === 'RESULT_SANDBOX' || s === 'RESULT_WIN' || s === 'RESULT_LOSS';
      } catch (e) { return false; }
    },

    getScores: function (state) {
      try {
        if (typeof EntitySys === 'undefined') return [];
        const blue = EntitySys.getAllies().length;
        const red = EntitySys.getEnemies().length;
        const winner = blue > red ? 'Blue' : (red > blue ? 'Red' : 'Tie');
        return [
          { label: 'Winner', value: winner },
          { label: 'Blue Survivors', value: blue },
          { label: 'Red Survivors', value: red }
        ];
      } catch (e) { return []; }
    },

    onPhaseChange: function (phase, prevPhase, ctx) {
      // SDK → playing 时, 确保 TABS 在沙盒模式 (autoStartSandbox 已经处理初始)
      if (phase === 'playing' && prevPhase === 'lobby') {
        if (typeof emit === 'function') emit('menu_select', { option: 'sandbox' });
      }
    },

    onInit: function (ctx) {
      // SDK 桥接好之后, 把 ctx 暴露到全局供调试
      window.__muyuanCtx = ctx;
    }
  };
})();
