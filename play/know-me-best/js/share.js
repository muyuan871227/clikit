// 分享卡生成（Canvas API）

class ShareCardGenerator {
  // 生成分享卡
  async generate(data) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
    gradient.addColorStop(0, '#FFF8F0');
    gradient.addColorStop(1, '#FFE8D6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // 装饰圆
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#FF8FAB';
    ctx.beginPath();
    ctx.arc(900, 150, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(180, 900, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // 标题
    ctx.fillStyle = '#FF8FAB';
    ctx.font = 'bold 48px "PingFang SC", "Hiragino Sans GB", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('就你了解我', 540, 120);

    ctx.fillStyle = '#999';
    ctx.font = '28px "PingFang SC", sans-serif';
    ctx.fillText('KNOW ME BEST', 540, 165);

    // 默契百分比
    ctx.fillStyle = '#F5C842';
    ctx.font = 'bold 180px "PingFang SC", sans-serif';
    ctx.fillText(`${data.harmonyPercent}%`, 540, 440);

    ctx.fillStyle = '#FF8FAB';
    ctx.font = '36px "PingFang SC", sans-serif';
    ctx.fillText('我们的默契值', 540, 500);

    // 玩家名
    ctx.fillStyle = '#666';
    ctx.font = '32px "PingFang SC", sans-serif';
    ctx.fillText(`${data.player1} & ${data.player2}`, 540, 570);

    // 高亮题目
    if (data.highlightQuestion) {
      // 题目框
      const boxY = 630;
      ctx.fillStyle = 'rgba(255,143,171,0.1)';
      this.roundRect(ctx, 100, boxY, 880, 200, 20);
      ctx.fill();

      ctx.fillStyle = '#FF8FAB';
      ctx.font = '28px "PingFang SC", sans-serif';
      ctx.fillText('本局最惊喜时刻', 540, boxY + 45);

      ctx.fillStyle = '#333';
      ctx.font = '32px "PingFang SC", sans-serif';
      const questionText = data.highlightQuestion;
      this.wrapText(ctx, questionText, 540, boxY + 100, 800, 40);

      if (data.highlightAnswer) {
        ctx.fillStyle = '#F5C842';
        ctx.font = 'bold 34px "PingFang SC", sans-serif';
        ctx.fillText(data.highlightAnswer, 540, boxY + 160);
      }
    }

    // 底部水印
    ctx.fillStyle = '#ccc';
    ctx.font = '24px "PingFang SC", sans-serif';
    ctx.fillText('就你了解我 KNOW ME BEST', 540, 1020);

    // 日期
    const date = new Date().toLocaleDateString('zh-CN');
    ctx.fillStyle = '#ddd';
    ctx.font = '22px "PingFang SC", sans-serif';
    ctx.fillText(date, 540, 1055);

    return canvas.toDataURL('image/png');
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (ctx.measureText(text).width <= maxWidth) {
      ctx.fillText(text, x, y);
      return;
    }
    const chars = text.split('');
    let line = '';
    let currentY = y;
    for (const char of chars) {
      const test = line + char;
      if (ctx.measureText(test).width > maxWidth) {
        ctx.fillText(line, x, currentY);
        line = char;
        currentY += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, currentY);
  }

  // 触发分享
  async share(imageDataUrl) {
    if (navigator.share && navigator.canShare) {
      try {
        const res = await fetch(imageDataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'knowmebest.png', { type: 'image/png' });
        await navigator.share({ files: [file], title: '就你了解我', text: '来测测我们的默契值吧！' });
        return true;
      } catch (e) {
        // fallback
      }
    }
    // Fallback: 下载图片
    const link = document.createElement('a');
    link.download = 'knowmebest.png';
    link.href = imageDataUrl;
    link.click();
    return false;
  }
}

const shareCard = new ShareCardGenerator();
