// 粒子特效 + 音效系统

class Effects {
  constructor() {
    this.audioCtx = null;
  }

  getAudioCtx() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioCtx;
  }

  // === 粒子特效 ===

  // 金色粒子爆散（猜中）
  burstParticles(container, color = '#F5C842', count = 30) {
    const rect = container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `
        position: absolute;
        width: ${4 + Math.random() * 8}px;
        height: ${4 + Math.random() * 8}px;
        background: ${color};
        border-radius: 50%;
        left: ${cx}px;
        top: ${cy}px;
        pointer-events: none;
        z-index: 100;
      `;
      container.appendChild(p);

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = 80 + Math.random() * 160;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      p.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) scale(0)`, opacity: 0 }
      ], { duration: 600 + Math.random() * 400, easing: 'ease-out' })
       .onfinish = () => p.remove();
    }
  }

  // 心形粒子爆散（闪光时刻）
  heartBurst(container, count = 40) {
    const rect = container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'heart-particle';
      p.innerHTML = '💕';
      p.style.cssText = `
        position: absolute;
        font-size: ${14 + Math.random() * 20}px;
        left: ${cx}px;
        top: ${cy}px;
        pointer-events: none;
        z-index: 100;
      `;
      container.appendChild(p);

      const angle = (Math.PI * 2 * i) / count;
      const dist = 100 + Math.random() * 200;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      p.animate([
        { transform: 'translate(0,0) scale(0.5)', opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) scale(1.5)`, opacity: 0 }
      ], { duration: 1000 + Math.random() * 500, easing: 'ease-out' })
       .onfinish = () => p.remove();
    }
  }

  // 浮动文字效果
  floatText(container, text, color = '#FF8FAB', size = '1.5rem') {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: ${size};
      color: ${color};
      font-weight: bold;
      pointer-events: none;
      z-index: 100;
      text-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;
    container.appendChild(el);

    el.animate([
      { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
      { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 1, offset: 0.3 },
      { transform: 'translate(-50%, -80%) scale(1)', opacity: 0 }
    ], { duration: 1500, easing: 'ease-out' })
     .onfinish = () => el.remove();
  }

  // === 音效 ===

  // 叮咚声（猜中）
  playCorrect() {
    try {
      const ctx = this.getAudioCtx();
      const notes = [523, 659, 784]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.3);
      });
    } catch(e) {}
  }

  // 惊讶音效（猜错/藏题成功）
  playSurprise() {
    try {
      const ctx = this.getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch(e) {}
  }

  // 烟花音效（闪光时刻）
  playFirework() {
    try {
      const ctx = this.getAudioCtx();
      // 上升音
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(300, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
      gain1.gain.setValueAtTime(0.1, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);

      // 爆散和弦
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + 0.3);
        osc.stop(ctx.currentTime + 0.8);
      });
    } catch(e) {}
  }

  // 倒计时滴答
  playTick() {
    try {
      const ctx = this.getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch(e) {}
  }

  // 心跳音效（最后3秒）
  playHeartbeat() {
    try {
      const ctx = this.getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 60;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  }

  // 按钮点击
  playClick() {
    try {
      const ctx = this.getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 600;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch(e) {}
  }
}

const effects = new Effects();
