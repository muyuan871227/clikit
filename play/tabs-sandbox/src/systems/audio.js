// ═══ Audio 系统 · SFX (使用 jsfxr 参数) + BGM ═══
const AudioSys = (() => {
  let audioCtx = null;
  let masterGain = null;
  let sfxMap = {};
  let bgmCurrent = null;
  let bgmGain = null;
  let enabled = false;

  function init() {
    on('entity_damaged', ({ target }) => {
      if (target.damage_effect) {
        const snd = DATA.juice?.events?.[target.damage_effect]?.sound;
        if (snd) playSfx(snd, 0.3);
      }
    });
    on('entity_destroyed', ({ target }) => {
      if (target.death_effect) {
        const snd = DATA.juice?.events?.[target.death_effect]?.sound;
        if (snd) playSfx(snd, 0.4);
      }
    });
    on('battle_phase_started', () => { playSfx('sfx_horn', 0.5); });
    on('level_won', () => { playSfx('sfx_victory', 0.6); });
    on('level_lost', () => { playSfx('sfx_defeat', 0.5); });

    // 用户手势后初始化 AudioContext
    const initAudio = () => {
      if (audioCtx) return;
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.5;
        masterGain.connect(audioCtx.destination);
        loadSfxMap();
        enabled = true;
      } catch (e) { console.warn('audio init fail', e); }
    };
    window.addEventListener('pointerdown', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
  }

  async function loadSfxMap() {
    try {
      const resp = await fetch('assets/audio/sfx.json');
      const data = await resp.json();
      // 支持两种格式: 数组或对象
      if (Array.isArray(data)) {
        for (const item of data) {
          for (const [k, v] of Object.entries(item)) sfxMap[k] = v;
        }
      } else {
        for (const [k, v] of Object.entries(data)) sfxMap[k] = v;
      }
    } catch (e) { console.warn('sfx load fail', e); }
  }

  // 简单的程序生成音效 (fallback), 基于 jsfxr 风格参数: [shape, ...envelope, freq, ...]
  // 对每个 sfx name 生成一段简单音
  function playSfx(name, volume = 0.5) {
    if (!enabled || !audioCtx) return;
    const profile = sfxProfile(name);
    const now0 = audioCtx.currentTime;
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.0001, now0);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, now0 + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now0 + profile.duration);

    const osc = audioCtx.createOscillator();
    osc.type = profile.waveType;
    osc.frequency.setValueAtTime(profile.freqStart, now0);
    if (profile.freqEnd) osc.frequency.exponentialRampToValueAtTime(profile.freqEnd, now0 + profile.duration);

    osc.connect(gainNode);
    gainNode.connect(masterGain);
    osc.start(now0);
    osc.stop(now0 + profile.duration);

    // 噪声叠加 (for explosion/smash/ragdoll)
    if (profile.noise) {
      const noise = makeNoise();
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.15, now0);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now0 + profile.duration);
      noise.connect(noiseGain);
      noiseGain.connect(masterGain);
      noise.start(now0);
      noise.stop(now0 + profile.duration);
    }
  }

  function makeNoise() {
    const bufferSize = audioCtx.sampleRate * 0.3;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const node = audioCtx.createBufferSource();
    node.buffer = buffer;
    return node;
  }

  function sfxProfile(name) {
    // 每种 sfx 的参数 (预设)
    const map = {
      sfx_hit_light:  { waveType: 'square', freqStart: 440, freqEnd: 180, duration: 0.10 },
      sfx_hit_heavy:  { waveType: 'square', freqStart: 220, freqEnd: 80,  duration: 0.18, noise: true },
      sfx_hit_smash:  { waveType: 'sawtooth', freqStart: 140, freqEnd: 50, duration: 0.28, noise: true },
      sfx_hit_fire:   { waveType: 'sawtooth', freqStart: 600, freqEnd: 200, duration: 0.22, noise: true },
      sfx_hit_clang:  { waveType: 'triangle', freqStart: 1200, freqEnd: 400, duration: 0.12 },
      sfx_death_flop: { waveType: 'triangle', freqStart: 200, freqEnd: 60, duration: 0.45, noise: true },
      sfx_death_flop_big: { waveType: 'sawtooth', freqStart: 120, freqEnd: 40, duration: 0.6, noise: true },
      sfx_death_giant: { waveType: 'sawtooth', freqStart: 80, freqEnd: 30, duration: 0.9, noise: true },
      sfx_deploy:     { waveType: 'sine', freqStart: 300, freqEnd: 500, duration: 0.15 },
      sfx_deploy_big: { waveType: 'sine', freqStart: 120, freqEnd: 200, duration: 0.25, noise: true },
      sfx_deploy_magic: { waveType: 'triangle', freqStart: 800, freqEnd: 1400, duration: 0.20 },
      sfx_swing_pike: { waveType: 'square', freqStart: 800, freqEnd: 300, duration: 0.08 },
      sfx_draw_bow:   { waveType: 'triangle', freqStart: 600, freqEnd: 200, duration: 0.12 },
      sfx_sword:      { waveType: 'square', freqStart: 1000, freqEnd: 400, duration: 0.09 },
      sfx_club_raise: { waveType: 'triangle', freqStart: 200, freqEnd: 500, duration: 0.15 },
      sfx_cast:       { waveType: 'triangle', freqStart: 600, freqEnd: 1200, duration: 0.20 },
      sfx_bash:       { waveType: 'square', freqStart: 400, freqEnd: 150, duration: 0.11 },
      sfx_horn:       { waveType: 'sawtooth', freqStart: 220, freqEnd: 330, duration: 0.6 },
      sfx_victory:    { waveType: 'triangle', freqStart: 440, freqEnd: 880, duration: 0.8 },
      sfx_defeat:     { waveType: 'sawtooth', freqStart: 300, freqEnd: 100, duration: 0.7 },
      sfx_deny:       { waveType: 'square', freqStart: 200, freqEnd: 100, duration: 0.15 },
      sfx_tick:       { waveType: 'square', freqStart: 1000, freqEnd: 600, duration: 0.04 }
    };
    return map[name] || map.sfx_hit_light;
  }

  function setVolume(v) { if (masterGain) masterGain.gain.value = clamp(v, 0, 1); }

  // ═══ 程序生成 BGM (Tone.js 风格的简单循环) ═══
  let bgmIntervals = [];
  let bgmActive = null;

  function stopBgm() {
    bgmIntervals.forEach(id => clearInterval(id));
    bgmIntervals = [];
    bgmActive = null;
  }

  function startBgm(name) {
    if (!enabled || !audioCtx) return;
    if (bgmActive === name) return;
    stopBgm();
    bgmActive = name;
    const profiles = {
      bgm_plan: { tempo: 100, scale: [220, 247, 277, 330, 370], lead: 'sine', bass: 'triangle', volume: 0.10 },
      bgm_battle: { tempo: 140, scale: [196, 220, 233, 262, 311], lead: 'sawtooth', bass: 'square', volume: 0.13 },
      bgm_boss: { tempo: 120, scale: [165, 196, 220, 247, 294], lead: 'sawtooth', bass: 'square', volume: 0.15 },
      bgm_menu: { tempo: 90, scale: [262, 294, 330, 392, 440], lead: 'triangle', bass: 'sine', volume: 0.08 }
    };
    const p = profiles[name] || profiles.bgm_plan;
    const beatMs = 60000 / p.tempo;
    let step = 0;
    const id = setInterval(() => {
      if (bgmActive !== name) return;
      const note = p.scale[step % p.scale.length];
      const noteHi = note * 2;
      // lead
      const tNow = audioCtx.currentTime;
      const oscA = audioCtx.createOscillator();
      oscA.type = p.lead;
      oscA.frequency.setValueAtTime(noteHi, tNow);
      const gA = audioCtx.createGain();
      gA.gain.setValueAtTime(0, tNow);
      gA.gain.linearRampToValueAtTime(p.volume * 0.5, tNow + 0.02);
      gA.gain.exponentialRampToValueAtTime(0.001, tNow + beatMs / 1000 * 0.9);
      oscA.connect(gA); gA.connect(masterGain);
      oscA.start(tNow); oscA.stop(tNow + beatMs / 1000);
      // bass (每两拍)
      if (step % 2 === 0) {
        const oscB = audioCtx.createOscillator();
        oscB.type = p.bass;
        oscB.frequency.setValueAtTime(note / 2, tNow);
        const gB = audioCtx.createGain();
        gB.gain.setValueAtTime(0, tNow);
        gB.gain.linearRampToValueAtTime(p.volume * 0.7, tNow + 0.02);
        gB.gain.exponentialRampToValueAtTime(0.001, tNow + beatMs / 500);
        oscB.connect(gB); gB.connect(masterGain);
        oscB.start(tNow); oscB.stop(tNow + beatMs / 1000 * 2);
      }
      step++;
    }, beatMs);
    bgmIntervals.push(id);
  }

  // BGM 切换由事件驱动
  on('zone_entered', ({ zone_data }) => {
    if (zone_data?.music) startBgm(zone_data.music);
  });
  on('battle_phase_started', () => startBgm('bgm_battle'));
  on('game_state_changed', ({ to }) => {
    if (to === 'MENU') startBgm('bgm_menu');
    else if (to === 'PLAN' || to === 'LEVEL_SELECT') {
      // 回到 plan/select 用 plan 音乐
      if (bgmActive === 'bgm_battle' || bgmActive === 'bgm_boss') startBgm('bgm_plan');
    } else if (to === 'RESULT_WIN' || to === 'RESULT_LOSS') stopBgm();
  });

  return { init, playSfx, setVolume, startBgm, stopBgm };
})();
window.AudioSys = AudioSys;
