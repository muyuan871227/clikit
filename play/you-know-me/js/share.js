// share.js — Share card generation (Canvas 1080x1080)

export function generateShareCard(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#FAFAF5';
  ctx.fillRect(0, 0, 1080, 1080);

  // Decorative border
  ctx.strokeStyle = '#C9956C';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 1000, 1000);

  // Inner frame
  ctx.strokeStyle = '#C9956C40';
  ctx.lineWidth = 1;
  ctx.strokeRect(60, 60, 960, 960);

  // Title area
  ctx.fillStyle = '#C9956C';
  ctx.font = 'bold 36px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('你 懂 我 吗 ？', 540, 120);

  // Subtitle
  ctx.fillStyle = '#999';
  ctx.font = '22px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('YOU KNOW ME?', 540, 155);

  // Divider line
  ctx.beginPath();
  ctx.moveTo(340, 180);
  ctx.lineTo(740, 180);
  ctx.strokeStyle = '#C9956C60';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Question card area
  const questionBg = data.questionType === 'secret' ? '#8B2635' :
    data.questionType === 'memory' ? '#F5C842' :
    data.questionType === 'courage' ? '#333' : '#FAFAF5';
  const questionColor = ['secret', 'courage'].includes(data.questionType) ? '#FAFAF5' : '#333';

  ctx.fillStyle = questionBg;
  roundRect(ctx, 100, 210, 880, 160, 16);
  ctx.fill();

  ctx.fillStyle = questionColor;
  ctx.font = '28px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  wrapText(ctx, data.question, 540, 270, 800, 36);

  // Two intention cards side by side
  // Left: Asker's intention
  ctx.fillStyle = '#FFF';
  roundRect(ctx, 100, 420, 420, 280, 12);
  ctx.fill();
  ctx.strokeStyle = '#C9956C';
  ctx.lineWidth = 2;
  roundRect(ctx, 100, 420, 420, 280, 12);
  ctx.stroke();

  ctx.fillStyle = '#C9956C';
  ctx.font = 'bold 20px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${data.askerName} 的意图`, 310, 460);

  ctx.fillStyle = '#666';
  ctx.font = '18px "PingFang SC", "Microsoft YaHei", sans-serif';
  const typeLabel = { confirm: '确认', explore: '探索', express: '表达', test: '测试' };
  ctx.fillText(`【${typeLabel[data.intentionType] || data.intentionType}】`, 310, 495);

  ctx.fillStyle = '#333';
  ctx.font = '22px "PingFang SC", "Microsoft YaHei", sans-serif';
  wrapText(ctx, `"${data.intentionText}"`, 310, 540, 360, 30);

  // Right: Guesser's guess
  ctx.fillStyle = '#FFF';
  roundRect(ctx, 560, 420, 420, 280, 12);
  ctx.fill();
  ctx.strokeStyle = '#E8EAF6';
  ctx.lineWidth = 2;
  roundRect(ctx, 560, 420, 420, 280, 12);
  ctx.stroke();

  ctx.fillStyle = '#666';
  ctx.font = 'bold 20px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${data.guesserName} 的猜测`, 770, 460);

  ctx.fillStyle = '#666';
  ctx.font = '18px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(`猜测类型：${typeLabel[data.guessType] || data.guessType}`, 770, 495);

  ctx.fillStyle = '#333';
  ctx.font = '22px "PingFang SC", "Microsoft YaHei", sans-serif';
  wrapText(ctx, `"${data.guessText || '...'}"`, 770, 540, 360, 30);

  // Heart between cards
  ctx.fillStyle = '#C9956C';
  ctx.font = '48px serif';
  ctx.textAlign = 'center';
  ctx.fillText('♡', 540, 575);

  // Result
  const resultText = data.result === 'match' ? '心有灵犀 ♡+2' :
    data.result === 'partial' ? '接近了 ♡+1' :
    data.result === 'dual_resonance' ? '双向共鸣！♡+5' : '打开了一扇门';
  const resultColor = data.result === 'match' ? '#C9956C' :
    data.result === 'dual_resonance' ? '#F5C842' : '#FF9A6C';

  ctx.fillStyle = resultColor;
  ctx.font = 'bold 32px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(resultText, 540, 770);

  // Heartbeat meter
  ctx.fillStyle = '#EEE';
  roundRect(ctx, 200, 810, 680, 24, 12);
  ctx.fill();
  const fillWidth = (data.heartbeat / 30) * 680;
  ctx.fillStyle = data.heartbeat >= 26 ? '#F5C842' : '#C9956C';
  roundRect(ctx, 200, 810, fillWidth, 24, 12);
  ctx.fill();
  ctx.fillStyle = '#999';
  ctx.font = '16px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(`默契心跳 ${data.heartbeat}/30`, 540, 860);

  // Footer
  ctx.fillStyle = '#CCC';
  ctx.font = '18px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('#YouKnowMe  #你懂我吗', 980, 1000);

  ctx.fillStyle = '#DDD';
  ctx.font = '14px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'left';
  const date = new Date().toLocaleDateString('zh-CN');
  ctx.fillText(date, 100, 1000);

  return canvas;
}

export function downloadShareCard(canvas, filename = 'youknowme.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Helper: rounded rectangle
function roundRect(ctx, x, y, w, h, r) {
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

// Helper: wrap text
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('');
  let line = '';
  let currentY = y;
  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY);
      line = chars[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
