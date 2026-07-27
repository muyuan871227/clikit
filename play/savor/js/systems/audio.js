// ===== AUDIO SYSTEM =====
// Web Audio API synthesized sounds (no external files needed)

const AudioSystem = {
    ctx: null,
    masterGain: null,
    sizzleNode: null,
    sizzleGain: null,
    bgmOsc: null,
    bgmGain: null,
    _enabled: true,

    init() {
        this._enabled = SaveSystem.get('sound', true);
    },

    _ensureCtx() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this._enabled ? 1 : 0;
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    setEnabled(on) {
        this._enabled = on;
        SaveSystem.set('sound', on);
        if (this.masterGain) {
            this.masterGain.gain.value = on ? 1 : 0;
        }
    },

    // === SIZZLE SOUND (continuous, volume tied to heat) ===
    startSizzle() {
        this._ensureCtx();
        if (this.sizzleNode) return;

        // White noise source
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        this.sizzleNode = this.ctx.createBufferSource();
        this.sizzleNode.buffer = buffer;
        this.sizzleNode.loop = true;

        // Bandpass filter to shape noise into sizzle
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 3000;
        filter.Q.value = 0.8;
        this.sizzleFilter = filter;

        this.sizzleGain = this.ctx.createGain();
        this.sizzleGain.gain.value = 0;

        this.sizzleNode.connect(filter);
        filter.connect(this.sizzleGain);
        this.sizzleGain.connect(this.masterGain);
        this.sizzleNode.start();
    },

    updateSizzle(heatPercent) {
        if (!this.sizzleGain) return;
        // Volume and frequency rise with heat
        const t = heatPercent / 100;
        this.sizzleGain.gain.setTargetAtTime(t * 0.15, this.ctx.currentTime, 0.1);
        if (this.sizzleFilter) {
            this.sizzleFilter.frequency.setTargetAtTime(
                2000 + t * 4000, this.ctx.currentTime, 0.1
            );
        }
    },

    stopSizzle() {
        if (this.sizzleNode) {
            try { this.sizzleNode.stop(); } catch {}
            this.sizzleNode = null;
            this.sizzleGain = null;
            this.sizzleFilter = null;
        }
    },

    // === PERFECT SOUND ===
    playPerfect() {
        this._ensureCtx();
        const now = this.ctx.currentTime;

        // Warm chord: C major with overtones
        const freqs = [261.6, 329.6, 392.0, 523.3];
        freqs.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.12 - i * 0.02, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 2);
        });

        // Rising shimmer
        const shimmer = this.ctx.createOscillator();
        const shimmerGain = this.ctx.createGain();
        shimmer.type = 'triangle';
        shimmer.frequency.setValueAtTime(800, now);
        shimmer.frequency.exponentialRampToValueAtTime(2000, now + 0.5);
        shimmerGain.gain.setValueAtTime(0.08, now);
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        shimmer.connect(shimmerGain);
        shimmerGain.connect(this.masterGain);
        shimmer.start(now);
        shimmer.stop(now + 0.8);
    },

    // === FAIL SOUND ===
    playFail() {
        this._ensureCtx();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.6);
    },

    // === BURN SOUND ===
    playBurn() {
        this._ensureCtx();
        const now = this.ctx.currentTime;

        // Harsh hissing
        const bufferSize = this.ctx.sampleRate;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 4000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        src.start(now);
        src.stop(now + 0.8);
    },

    // === UI CLICK ===
    playClick() {
        this._ensureCtx();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.08);
    },

    // === CRITICAL ZONE ENTER SOUND ===
    playCriticalEnter() {
        this._ensureCtx();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.3);
    },

    // === BGM (simple ambient loop) ===
    startBGM() {
        this._ensureCtx();
        if (this.bgmOsc) return;

        // Soft pad
        this.bgmOsc = this.ctx.createOscillator();
        this.bgmGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        this.bgmOsc.type = 'triangle';
        this.bgmOsc.frequency.value = 220;
        this.bgmGain.gain.value = 0;

        this.bgmOsc.connect(filter);
        filter.connect(this.bgmGain);
        this.bgmGain.connect(this.masterGain);
        this.bgmOsc.start();
    },

    setBGMVolume(vol) {
        if (this.bgmGain && this.ctx) {
            this.bgmGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.3);
        }
    },

    stopBGM() {
        if (this.bgmOsc) {
            try { this.bgmOsc.stop(); } catch {}
            this.bgmOsc = null;
            this.bgmGain = null;
        }
    },
};
