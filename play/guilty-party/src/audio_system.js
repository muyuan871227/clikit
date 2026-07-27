// ═══ audio_system.js — Web Audio合成所有SFX/BGM ═══
const Audio_ = (() => {
  let ctx = null;
  let bgmGain = null, sfxGain = null, masterGain = null;
  let bgmInterval = null;
  let muted = false;
  let lastSfxTime = {};

  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = cfg('audio.master_volume', 1.0);
      masterGain.connect(ctx.destination);
      bgmGain = ctx.createGain();
      bgmGain.gain.value = cfg('audio.bgm_volume', 0.4);
      bgmGain.connect(masterGain);
      sfxGain = ctx.createGain();
      sfxGain.gain.value = cfg('audio.sfx_volume', 0.7);
      sfxGain.connect(masterGain);
    } catch (e) { console.warn('Audio init failed', e); }
  }

  function resumeIfNeeded() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  // 音色合成器
  function tone({freq = 440, duration = 0.15, type = 'sine', vol = 0.4, attack = 0.01, decay = 0.1, target = sfxGain}) {
    if (!ctx || !target) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = ctx.currentTime;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration + decay);
    osc.connect(gain);
    gain.connect(target);
    osc.start(t0);
    osc.stop(t0 + duration + decay);
  }

  function noise({duration = 0.2, vol = 0.2, filter = 1500, target = sfxGain}) {
    if (!ctx || !target) return;
    const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    const t0 = ctx.currentTime;
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = filter;
    src.connect(lpf);
    lpf.connect(gain);
    gain.connect(target);
    src.start(t0);
  }

  // === 各种sfx预设 ===
  const SFX = {
    sfx_search_start() { tone({freq: 220, duration: 0.08, type: 'triangle', vol: 0.2}); },
    sfx_evidence_found() {
      tone({freq: 660, duration: 0.1, type: 'sine', vol: 0.3});
      setTimeout(() => tone({freq: 880, duration: 0.15, type: 'sine', vol: 0.3}), 80);
      setTimeout(() => tone({freq: 1320, duration: 0.2, type: 'triangle', vol: 0.25}), 160);
    },
    sfx_paper_rustle() { noise({duration: 0.12, vol: 0.12, filter: 4000}); },
    sfx_dark_whisper() {
      tone({freq: 110, duration: 0.4, type: 'sawtooth', vol: 0.18, attack: 0.05});
      noise({duration: 0.5, vol: 0.06, filter: 600});
    },
    sfx_pen_scratch() { noise({duration: 0.18, vol: 0.18, filter: 3000}); },
    sfx_match_burn() {
      noise({duration: 0.06, vol: 0.4, filter: 8000});
      setTimeout(() => noise({duration: 0.5, vol: 0.18, filter: 800}), 60);
    },
    sfx_chime_bright() {
      tone({freq: 880, duration: 0.2, type: 'sine', vol: 0.3});
      setTimeout(() => tone({freq: 1318, duration: 0.3, type: 'sine', vol: 0.28}), 80);
      setTimeout(() => tone({freq: 1760, duration: 0.4, type: 'sine', vol: 0.22}), 160);
    },
    sfx_reveal_sting() {
      tone({freq: 523, duration: 0.15, type: 'square', vol: 0.25});
      setTimeout(() => tone({freq: 784, duration: 0.2, type: 'sine', vol: 0.3}), 100);
      setTimeout(() => tone({freq: 1047, duration: 0.4, type: 'triangle', vol: 0.3}), 200);
    },
    sfx_reveal_sting_negative() {
      tone({freq: 415, duration: 0.18, type: 'square', vol: 0.3});
      setTimeout(() => tone({freq: 311, duration: 0.25, type: 'sawtooth', vol: 0.3}), 120);
      setTimeout(() => tone({freq: 233, duration: 0.4, type: 'sawtooth', vol: 0.25}), 240);
    },
    sfx_gavel_soft() { noise({duration: 0.1, vol: 0.25, filter: 1200}); },
    sfx_gavel_heavy() {
      tone({freq: 80, duration: 0.4, type: 'sine', vol: 0.5, attack: 0.005});
      noise({duration: 0.2, vol: 0.3, filter: 800});
    },
    sfx_bell_chime() {
      tone({freq: 1047, duration: 0.4, type: 'sine', vol: 0.3});
      setTimeout(() => tone({freq: 783, duration: 0.5, type: 'sine', vol: 0.22}), 50);
    },
    sfx_clock_tick_rapid() { tone({freq: 1000, duration: 0.04, type: 'square', vol: 0.18}); },
    sfx_killer_victory() {
      tone({freq: 110, duration: 0.6, type: 'sawtooth', vol: 0.35});
      setTimeout(() => tone({freq: 87, duration: 0.8, type: 'sawtooth', vol: 0.35}), 200);
      setTimeout(() => tone({freq: 73, duration: 1.2, type: 'square', vol: 0.3}), 500);
    },
    sfx_detective_victory() {
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => setTimeout(() => tone({freq: f, duration: 0.25, type: 'sine', vol: 0.32}), i * 120));
    },
    sfx_tension_build() { tone({freq: 200, duration: 0.3, type: 'sawtooth', vol: 0.1, attack: 0.2}); },
    sfx_footstep_soft() { noise({duration: 0.05, vol: 0.08, filter: 600}); },
    sfx_court_bell() {
      tone({freq: 660, duration: 0.5, type: 'sine', vol: 0.35});
      setTimeout(() => tone({freq: 880, duration: 0.7, type: 'sine', vol: 0.3}), 80);
    },
    sfx_heartbeat() {
      // 双击心跳:低频 thump-thump
      tone({freq: 60, duration: 0.08, type: 'sine', vol: 0.35, attack: 0.005});
      setTimeout(() => tone({freq: 50, duration: 0.10, type: 'sine', vol: 0.28, attack: 0.005}), 100);
    },
    sfx_distant_scream() {
      noise({duration: 0.5, vol: 0.12, filter: 1200});
      setTimeout(() => tone({freq: 350, duration: 0.4, type: 'sawtooth', vol: 0.08}), 80);
    },
    sfx_door_creak() {
      // 频率扫过的吱呀声
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const t0 = ctx.currentTime;
      osc.frequency.setValueAtTime(80, t0);
      osc.frequency.exponentialRampToValueAtTime(220, t0 + 0.6);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.08, t0 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.7);
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 400;
      osc.connect(lpf); lpf.connect(gain); gain.connect(sfxGain);
      osc.start(t0); osc.stop(t0 + 0.7);
    },
    sfx_rat_squeak() {
      tone({freq: 1800, duration: 0.05, type: 'square', vol: 0.08});
      setTimeout(() => tone({freq: 2400, duration: 0.04, type: 'square', vol: 0.06}), 50);
    },
    sfx_light_flicker() {
      noise({duration: 0.08, vol: 0.05, filter: 6000});
    },
    sfx_button_hover() { tone({freq: 1200, duration: 0.04, type: 'sine', vol: 0.1}); },
    sfx_button_click() { tone({freq: 800, duration: 0.06, type: 'square', vol: 0.18}); },
  };

  function play(name) {
    if (!ctx || muted) return;
    resumeIfNeeded();
    // 50ms去重
    const now = performance.now();
    if (lastSfxTime[name] && now - lastSfxTime[name] < 50) return;
    lastSfxTime[name] = now;
    const fn = SFX[name];
    if (fn) fn();
  }

  // BGM 已移除 — 保留空函数以免调用出错
  function startBgm() {}
  function stopBgm() {}
  const audioState = {};

  function setMuted(m) {
    muted = m;
    if (masterGain) masterGain.gain.value = m ? 0 : cfg('audio.master_volume', 1.0);
  }
  function isMuted() { return muted; }

  // === 全局事件订阅 ===
  function bindBus() {
    Bus.on('phase_changed', ({newPhase}) => {
      if (newPhase === 'investigate') startBgm();
      if (newPhase === 'voting' || newPhase === 'game_over') stopBgm();
    });
    // 把juice事件名映射到sfx名
    Bus.on('triggerJuice', ({eventName}) => {
      const spec = DATA.juice?.events?.[eventName];
      if (spec?.sound) play(spec.sound);
    });
  }

  return { init, play, startBgm, stopBgm, setMuted, isMuted, bindBus, resumeIfNeeded };
})();
