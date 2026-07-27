// audio.js — Sound effects using Web Audio API (zero dependencies)

let audioCtx = null;
let isMuted = false;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function toggleMute() {
  isMuted = !isMuted;
  return isMuted;
}

export function getMuted() { return isMuted; }

// Helper: play a tone
function playTone(freq, duration, type = 'sine', volume = 0.3, delay = 0) {
  if (isMuted) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

// Helper: play noise burst
function playNoise(duration, volume = 0.1, delay = 0) {
  if (isMuted) return;
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime + delay);
}

// 1. Correct guess — gentle chime "ding~" (3 pitch variations)
const chimePitches = [880, 1047, 1175]; // A5, C6, D6
let chimeIndex = 0;

export function playCorrect() {
  const freq = chimePitches[chimeIndex % chimePitches.length];
  chimeIndex++;
  playTone(freq, 0.6, 'sine', 0.25);
  playTone(freq * 1.5, 0.4, 'sine', 0.15, 0.05); // harmonic
  playTone(freq * 2, 0.3, 'sine', 0.08, 0.1);     // sparkle
}

// 2. Dual Resonance — 3-second string swell
export function playDualResonance() {
  if (isMuted) return;
  const ctx = getCtx();
  // Chord: C major with warmth
  const freqs = [262, 330, 392, 523]; // C4, E4, G4, C5
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.8);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + 3);
  });
}

// 3. Miss — soft curious "oh~"
export function playMiss() {
  if (isMuted) return;
  // Descending curious tone
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.6);
}

// 4. Gemini card appears — soft whoosh + gentle bell
export function playGeminiAppear() {
  playNoise(0.3, 0.08);
  playTone(1568, 0.5, 'sine', 0.12, 0.15); // G6 bell
  playTone(2093, 0.3, 'sine', 0.06, 0.2);  // C7 shimmer
}

// 5. Heartbeat +1 — delicate tink with sparkle
export function playHeartbeatUp() {
  playTone(1318, 0.3, 'sine', 0.15);        // E6
  playTone(1976, 0.2, 'sine', 0.08, 0.05);  // B6 sparkle
}

// 6. Countdown tick
export function playTick(urgent = false) {
  const freq = urgent ? 800 : 600;
  const vol = urgent ? 0.15 : 0.08;
  playTone(freq, 0.05, 'square', vol);
}

// 7. Card flip
export function playCardFlip() {
  playNoise(0.1, 0.12);
  playTone(400, 0.08, 'sine', 0.1, 0.05);
}

// 8. Button click
export function playClick() {
  playTone(1000, 0.05, 'sine', 0.08);
}

// 9. Round transition
export function playRoundTransition() {
  playTone(523, 0.3, 'sine', 0.15);       // C5
  playTone(659, 0.3, 'sine', 0.15, 0.15); // E5
  playTone(784, 0.4, 'sine', 0.2, 0.3);   // G5
}

// 10. Full meter celebration
export function playFullMeter() {
  playDualResonance();
  setTimeout(() => {
    playTone(1047, 0.2, 'sine', 0.2);
    playTone(1318, 0.2, 'sine', 0.2, 0.1);
    playTone(1568, 0.3, 'sine', 0.25, 0.2);
  }, 500);
}

// Resume audio context (needed for mobile)
export function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}
