// 倒计时组件
class GameTimer {
  constructor() {
    this.timerId = null;
    this.remaining = 0;
    this.total = 0;
    this.onTick = null;
    this.onComplete = null;
  }

  start(seconds, onTick, onComplete) {
    this.stop();
    this.total = seconds;
    this.remaining = seconds;
    this.onTick = onTick;
    this.onComplete = onComplete;

    if (this.onTick) this.onTick(this.remaining, this.total);

    this.timerId = setInterval(() => {
      this.remaining -= 0.1;
      if (this.remaining <= 0) {
        this.remaining = 0;
        this.stop();
        if (this.onTick) this.onTick(0, this.total);
        if (this.onComplete) this.onComplete();
      } else {
        if (this.onTick) this.onTick(this.remaining, this.total);
      }
    }, 100);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  getProgress() {
    return this.total > 0 ? this.remaining / this.total : 0;
  }
}
