// ═══ sprites.js — 程序化绘制(Canvas路径,无外部图片) ═══
// 所有sprite用Canvas 2D路径手绘,在Render系统中按需调用
const Sprites = {

  // === 玩家头像(圆形+剪影) ===
  drawPlayer(ctx, x, y, color, size, role = 'detective', isYou = false, alive = true) {
    const r = size;
    ctx.save();
    if (!alive) { ctx.globalAlpha = 0.35; }

    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.85, r * 0.85, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 主体身体(圆角矩形剪影)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - r * 0.1, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this._darken(color, 0.85);
    ctx.beginPath();
    ctx.arc(x, y + r * 0.4, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // 描边
    ctx.strokeStyle = isYou ? '#FFD700' : 'rgba(0,0,0,0.5)';
    ctx.lineWidth = isYou ? 3 : 1.5;
    ctx.beginPath();
    ctx.arc(x, y - r * 0.1, r * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    if (!alive) {
      ctx.strokeStyle = '#FF3B30';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.6, y - r * 0.6);
      ctx.lineTo(x + r * 0.6, y + r * 0.6);
      ctx.moveTo(x + r * 0.6, y - r * 0.6);
      ctx.lineTo(x - r * 0.6, y + r * 0.6);
      ctx.stroke();
    }
    ctx.restore();
  },

  // === 房间地板 ===
  drawRoom(ctx, x, y, w, h, colorTemp, name) {
    let bg, accent, line;
    if (colorTemp === 'warm') {
      bg = '#6a5034'; accent = '#8a6a42'; line = '#b08850';
    } else if (colorTemp === 'cool') {
      bg = '#2e4466'; accent = '#3f5c85'; line = '#5874a2';
    } else {
      bg = '#464654'; accent = '#5a5a6c'; line = '#7a7a8e';
    }
    // 地板基色
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    // 木纹/瓷砖纹理
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 28) {
      ctx.beginPath();
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i, y + h);
      ctx.stroke();
    }
    for (let j = 0; j < h; j += 28) {
      ctx.beginPath();
      ctx.moveTo(x, y + j);
      ctx.lineTo(x + w, y + j);
      ctx.stroke();
    }
    // 房间边框
    ctx.strokeStyle = line;
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    // 房间名标签
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 14px PingFang SC, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(name, x + 8, y + 6);
  },

  // === 证据 slot 框 ===
  drawSlot(ctx, x, y, size, state, evidenceCategory = null, mark = 'unknown') {
    // state: empty | searching(0-1) | revealed
    const half = size / 2;
    ctx.save();
    // 底色
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    Sprites._roundRect(ctx, x - half, y - half, size, size, 6);
    ctx.fill();

    if (state === 'empty' || state === null) {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      Sprites._roundRect(ctx, x - half, y - half, size, size, 6);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', x, y);
    } else if (typeof state === 'number') {
      // searching progress
      ctx.fillStyle = 'rgba(255,215,0,0.25)';
      Sprites._roundRect(ctx, x - half, y - half, size, size, 6);
      ctx.fill();
      // progress arc
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, half - 4, -Math.PI / 2, -Math.PI / 2 + state * Math.PI * 2);
      ctx.stroke();
    } else if (state === 'revealed') {
      Sprites.drawEvidenceIcon(ctx, x, y, size * 0.55, evidenceCategory);
      // 真伪标记
      let edge = 'rgba(255,255,255,0.4)';
      if (mark === 'real') edge = '#34C759';
      else if (mark === 'fake') edge = '#FF3B30';
      ctx.strokeStyle = edge;
      ctx.lineWidth = mark === 'unknown' ? 1.5 : 3;
      Sprites._roundRect(ctx, x - half, y - half, size, size, 6);
      ctx.stroke();
    }
    ctx.restore();
  },

  // === 证据图标 ===
  drawEvidenceIcon(ctx, cx, cy, r, category) {
    ctx.save();
    ctx.translate(cx, cy);
    switch (category) {
      case 'weapon': // 刀
        ctx.fillStyle = '#C0C0CC';
        ctx.beginPath();
        ctx.moveTo(-r, r * 0.3); ctx.lineTo(r * 0.3, -r); ctx.lineTo(r, -r * 0.6);
        ctx.lineTo(-r * 0.5, r * 0.6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#5a3a1a'; // 把手
        ctx.fillRect(-r, r * 0.3, r * 0.5, r * 0.4);
        break;
      case 'motive_doc': // 文件
        ctx.fillStyle = '#F5E6C8';
        Sprites._roundRect(ctx, -r * 0.7, -r * 0.85, r * 1.4, r * 1.7, 3);
        ctx.fill();
        ctx.strokeStyle = '#8a6a3a';
        ctx.lineWidth = 1;
        for (let i = -3; i <= 3; i += 2) {
          ctx.beginPath();
          ctx.moveTo(-r * 0.5, i * r * 0.18);
          ctx.lineTo(r * 0.5, i * r * 0.18);
          ctx.stroke();
        }
        break;
      case 'movement_log': // 脚印
        ctx.fillStyle = '#8B7355';
        for (let i = 0; i < 2; i++) {
          const ox = (i - 0.5) * r * 0.6;
          ctx.beginPath();
          ctx.ellipse(ox, -r * 0.1 + i * r * 0.4, r * 0.25, r * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          for (let j = 0; j < 4; j++) {
            ctx.beginPath();
            ctx.arc(ox - r * 0.18 + j * r * 0.12, -r * 0.5 + i * r * 0.4, r * 0.07, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      case 'fingerprint': // 指纹环
        ctx.strokeStyle = '#6B4226';
        ctx.lineWidth = 1.5;
        for (let i = 1; i <= 4; i++) {
          ctx.beginPath();
          ctx.arc(0, 0, r * (0.25 + i * 0.16), 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      case 'physical_trace': // 血滴/晶体(铁证)
        ctx.fillStyle = '#9B0000';
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.bezierCurveTo(r, -r * 0.2, r * 0.7, r * 0.8, 0, r);
        ctx.bezierCurveTo(-r * 0.7, r * 0.8, -r, -r * 0.2, 0, -r);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(-r * 0.25, -r * 0.3, r * 0.15, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'time_clue': // 时钟(铁证)
        ctx.fillStyle = '#FFFAF0';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3a2a1a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
        ctx.stroke();
        // 指针
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.55); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(r * 0.4, r * 0.1); ctx.stroke();
        ctx.fillStyle = '#3a2a1a';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.08, 0, Math.PI * 2); ctx.fill();
        break;
      default:
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  },

  // === 放大镜 ===
  drawLens(ctx, cx, cy, r) {
    ctx.save();
    ctx.translate(cx, cy);
    // 把手
    ctx.strokeStyle = '#8B5A2B';
    ctx.lineWidth = r * 0.3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.55, r * 0.55);
    ctx.lineTo(r * 1.0, r * 1.0);
    ctx.stroke();
    // 镜框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = r * 0.18;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    // 镜片(高光)
    const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r * 0.7);
    grad.addColorStop(0, 'rgba(0,229,255,0.35)');
    grad.addColorStop(1, 'rgba(0,229,255,0.05)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  // === 家具(主题化) ===
  // 所有家具的接口: drawFurniture(ctx, type, x, y, w, h)
  drawFurniture(ctx, type, x, y, w, h) {
    ctx.save();
    const fn = this._furnitureMap[type] || this._drawGenericFurniture;
    fn.call(this, ctx, x, y, w, h);
    ctx.restore();
  },

  _drawGenericFurniture(ctx, x, y, w, h) {
    ctx.fillStyle = '#6a4a2a';
    Sprites._roundRect(ctx, x, y, w, h, 4);
    ctx.fill();
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  },

  _furnitureMap: {
    coat_rack(ctx, x, y, w, h) {
      // 深木色立柱
      ctx.strokeStyle = '#4a2e10';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h);
      ctx.lineTo(x + w / 2, y + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 2, y); ctx.lineTo(x + w / 2, y + 6); ctx.lineTo(x + w - 2, y); ctx.stroke();
      // 挂着的外套(深色带高光)
      ctx.fillStyle = '#2C3E50';
      Sprites._roundRect(ctx, x + 2, y + 8, w - 4, h * 0.45, 3);
      ctx.fill();
      ctx.fillStyle = '#34495E';
      ctx.fillRect(x + w / 2 - 4, y + h * 0.55, 8, 4);
      // 金色挂钩
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x + 4, y + 2, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(x + w - 4, y + 2, 2, 0, Math.PI * 2); ctx.fill();
    },
    umbrella_stand(ctx, x, y, w, h) {
      ctx.fillStyle = '#5a4a3a';
      Sprites._roundRect(ctx, x + 4, y + h * 0.35, w - 8, h * 0.65, 4);
      ctx.fill();
      // 伞把手
      ctx.strokeStyle = '#1a1a25';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.4, y + 2); ctx.lineTo(x + w * 0.4, y + h * 0.4); ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + w * 0.55, y + 6, 5, Math.PI, Math.PI * 1.5); ctx.stroke();
    },
    mirror(ctx, x, y, w, h) {
      // 镜框
      ctx.fillStyle = '#bfa050';
      Sprites._roundRect(ctx, x, y, w, h, 6);
      ctx.fill();
      // 镜面
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#a8d4f0'); grad.addColorStop(0.5, '#e8f4ff'); grad.addColorStop(1, '#80a8c8');
      ctx.fillStyle = grad;
      Sprites._roundRect(ctx, x + 4, y + 4, w - 8, h - 8, 4);
      ctx.fill();
    },
    bookshelf(ctx, x, y, w, h) {
      // 外框浅木色(对比明显)
      ctx.fillStyle = '#D4A06A';
      ctx.fillRect(x, y, w, h);
      // 内部深色衬底(让书脊颜色更跳)
      ctx.fillStyle = '#2a1a08';
      ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
      ctx.strokeStyle = '#6a4228';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      // 书脊(鲜艳颜色)
      const colors = ['#E74C3C', '#3498DB', '#27AE60', '#F39C12', '#9B59B6', '#16A085'];
      const shelves = 3;
      for (let s = 0; s < shelves; s++) {
        const shelfY = y + 4 + s * (h - 8) / shelves;
        for (let i = 0, bx = x + 4; bx < x + w - 4; i++) {
          const bw = 4 + (i % 3) * 2;
          ctx.fillStyle = colors[(i + s) % colors.length];
          ctx.fillRect(bx, shelfY, bw, (h - 8) / shelves - 3);
          bx += bw + 1;
        }
        // 书架分层线
        ctx.strokeStyle = '#5a3a18';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 2, shelfY + (h - 8) / shelves - 2);
        ctx.lineTo(x + w - 2, shelfY + (h - 8) / shelves - 2);
        ctx.stroke();
      }
    },
    reading_desk(ctx, x, y, w, h) {
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x, y, w, h * 0.55);
      ctx.fillStyle = '#3a2410';
      ctx.fillRect(x + 4, y + h * 0.55, 4, h * 0.45);
      ctx.fillRect(x + w - 8, y + h * 0.55, 4, h * 0.45);
      // 书 + 蜡烛
      ctx.fillStyle = '#8a6a1a';
      ctx.fillRect(x + 6, y + 4, 14, 8);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x + w - 14, y + 2, 4, 12);
      ctx.fillStyle = '#FF8800';
      ctx.beginPath();
      ctx.arc(x + w - 12, y, 2.5, 0, Math.PI * 2); ctx.fill();
    },
    stove(ctx, x, y, w, h) {
      ctx.fillStyle = '#3a3a3a';
      Sprites._roundRect(ctx, x, y, w, h, 3);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      // 4 个灶眼
      const cx1 = x + w * 0.3, cy1 = y + h * 0.3;
      const cx2 = x + w * 0.7, cy2 = y + h * 0.3;
      ctx.beginPath(); ctx.arc(cx1, cy1, w * 0.13, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx2, cy1, w * 0.13, 0, Math.PI * 2); ctx.fill();
      // 火焰(其中一个)
      ctx.fillStyle = '#FF6B00';
      ctx.beginPath(); ctx.arc(cx1, cy1, w * 0.08, 0, Math.PI * 2); ctx.fill();
      // 烤箱门
      ctx.fillStyle = '#2a2a2a';
      Sprites._roundRect(ctx, x + 4, y + h * 0.55, w - 8, h * 0.4, 3);
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x + w / 2 - 6, y + h * 0.6, 12, 2);
    },
    counter_knives(ctx, x, y, w, h) {
      ctx.fillStyle = '#8a8a8a';
      Sprites._roundRect(ctx, x, y, w, h, 3);
      ctx.fill();
      // 砧板
      ctx.fillStyle = '#a8742e';
      Sprites._roundRect(ctx, x + 6, y + 6, w * 0.45, h - 12, 2);
      ctx.fill();
      // 刀架 + 刀
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x + w * 0.6, y + 4, w * 0.35, h - 8);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#cfcfdf';
        ctx.fillRect(x + w * 0.62 + i * 5, y + 6, 3, h - 14);
      }
    },
    fridge(ctx, x, y, w, h) {
      ctx.fillStyle = '#dcdce0';
      Sprites._roundRect(ctx, x, y, w, h, 4);
      ctx.fill();
      ctx.strokeStyle = '#888'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y + h * 0.4); ctx.lineTo(x + w, y + h * 0.4); ctx.stroke();
      // 把手
      ctx.fillStyle = '#666';
      ctx.fillRect(x + w - 8, y + 8, 4, 14);
      ctx.fillRect(x + w - 8, y + h * 0.5, 4, 14);
    },
    dining_table(ctx, x, y, w, h) {
      ctx.fillStyle = '#6a3a1a';
      Sprites._roundRect(ctx, x, y, w, h * 0.7, 5);
      ctx.fill();
      ctx.strokeStyle = '#3a1f08'; ctx.lineWidth = 1;
      ctx.stroke();
      // 桌腿
      ctx.fillStyle = '#3a1f08';
      ctx.fillRect(x + 6, y + h * 0.7, 4, h * 0.3);
      ctx.fillRect(x + w - 10, y + h * 0.7, 4, h * 0.3);
      // 餐具
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x + w * 0.25, y + h * 0.35, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + w * 0.75, y + h * 0.35, 8, 0, Math.PI * 2); ctx.fill();
      // 红酒杯
      ctx.fillStyle = '#9B0000';
      ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.35, 4, 0, Math.PI * 2); ctx.fill();
    },
    fireplace(ctx, x, y, w, h) {
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(x, y, w, h);
      // 炉口
      ctx.fillStyle = '#1a0a08';
      Sprites._roundRect(ctx, x + 4, y + 4, w - 8, h - 8, 3);
      ctx.fill();
      // 火焰
      ctx.fillStyle = '#FF6B00';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h - 4);
      ctx.bezierCurveTo(x + w * 0.2, y + h * 0.7, x + w * 0.3, y + h * 0.3, x + w / 2, y + 6);
      ctx.bezierCurveTo(x + w * 0.7, y + h * 0.3, x + w * 0.8, y + h * 0.7, x + w / 2, y + h - 4);
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h * 0.6, w * 0.15, h * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
    },
    sideboard(ctx, x, y, w, h) {
      ctx.fillStyle = '#5a3a1a';
      Sprites._roundRect(ctx, x, y, w, h, 3);
      ctx.fill();
      ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.stroke();
      // 把手
      ctx.fillStyle = '#bfa050';
      ctx.beginPath(); ctx.arc(x + w * 0.3, y + h / 2, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + w * 0.7, y + h / 2, 1.5, 0, Math.PI * 2); ctx.fill();
    },
    desk(ctx, x, y, w, h) {
      ctx.fillStyle = '#8b5a2a';
      ctx.fillRect(x, y, w, h * 0.5);
      ctx.strokeStyle = '#2a1a08';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h * 0.5);
      ctx.fillStyle = '#5a3a18';
      ctx.fillRect(x + 4, y + h * 0.5, 6, h * 0.5);
      ctx.fillRect(x + w - 10, y + h * 0.5, 6, h * 0.5);
      // 文档堆
      ctx.fillStyle = '#F5E6C8';
      ctx.fillRect(x + 8, y + 6, 14, 12);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 24, y + 4, 14, 14);
      // 墨水瓶
      ctx.fillStyle = '#1a1a3a';
      ctx.beginPath(); ctx.arc(x + w - 14, y + 12, 4, 0, Math.PI * 2); ctx.fill();
    },
    safe(ctx, x, y, w, h) {
      ctx.fillStyle = '#3a3a3a';
      Sprites._roundRect(ctx, x, y, w, h, 4);
      ctx.fill();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2;
      Sprites._roundRect(ctx, x + 4, y + 4, w - 8, h - 8, 3);
      ctx.stroke();
      // 转盘
      ctx.fillStyle = '#bfa050';
      ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3a3a3a';
      ctx.beginPath(); ctx.moveTo(x + w / 2, y + h / 2); ctx.lineTo(x + w / 2, y + h * 0.35); ctx.stroke();
    },
    grandfather_clock(ctx, x, y, w, h) {
      ctx.fillStyle = '#4a2a10';
      Sprites._roundRect(ctx, x, y, w, h, 3);
      ctx.fill();
      // 钟面
      ctx.fillStyle = '#fffaf0';
      ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.18, w * 0.36, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3a1a08';
      ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.18, w * 0.36, 0, Math.PI * 2); ctx.stroke();
      // 指针
      ctx.beginPath(); ctx.moveTo(x + w / 2, y + h * 0.18); ctx.lineTo(x + w / 2, y + h * 0.06); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + w / 2, y + h * 0.18); ctx.lineTo(x + w * 0.7, y + h * 0.22); ctx.stroke();
      // 摆锤
      ctx.fillStyle = '#bfa050';
      ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.75, w * 0.18, 0, Math.PI * 2); ctx.fill();
    },
    bed(ctx, x, y, w, h) {
      // 床头板(较亮棕)
      ctx.fillStyle = '#8b5a2a';
      Sprites._roundRect(ctx, x, y, w, h * 0.18, 4);
      ctx.fill();
      ctx.strokeStyle = '#3a1f08'; ctx.lineWidth = 1.5;
      Sprites._roundRect(ctx, x, y, w, h * 0.18, 4); ctx.stroke();
      // 床垫(米白)
      ctx.fillStyle = '#f0e2c8';
      ctx.fillRect(x + 2, y + h * 0.2, w - 4, h * 0.55);
      // 被子(红)
      ctx.fillStyle = '#C0392B';
      ctx.fillRect(x + 2, y + h * 0.45, w - 4, h * 0.5);
      // 被子花纹
      ctx.fillStyle = '#E74C3C';
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 2, y + h * 0.55 + i * 6, w - 4, 1.5);
      // 枕头
      ctx.fillStyle = '#fff';
      Sprites._roundRect(ctx, x + 6, y + h * 0.22, w * 0.25, h * 0.18, 3);
      ctx.fill();
      // 床尾板
      ctx.fillStyle = '#6a3e18';
      ctx.fillRect(x, y + h - 10, w, 10);
    },
    vanity(ctx, x, y, w, h) {
      // 桌子
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x, y + h * 0.5, w, h * 0.5);
      // 镜子
      ctx.fillStyle = '#bfa050';
      Sprites._roundRect(ctx, x + 4, y, w - 8, h * 0.55, 6);
      ctx.fill();
      ctx.fillStyle = '#a8d4f0';
      Sprites._roundRect(ctx, x + 8, y + 4, w - 16, h * 0.5 - 8, 4);
      ctx.fill();
      // 化妆品
      ctx.fillStyle = '#FF1493';
      ctx.fillRect(x + 6, y + h * 0.6, 4, h * 0.2);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x + 14, y + h * 0.65, 4, h * 0.2);
    },
    dresser(ctx, x, y, w, h) {
      ctx.fillStyle = '#5a3a1a';
      Sprites._roundRect(ctx, x, y, w, h, 3);
      ctx.fill();
      // 抽屉横线
      ctx.strokeStyle = '#2a1a08'; ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y + (h * i / 4)); ctx.lineTo(x + w, y + (h * i / 4));
        ctx.stroke();
      }
      // 把手
      ctx.fillStyle = '#bfa050';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h * (i + 0.5) / 4, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    statue(ctx, x, y, w, h) {
      // 底座
      ctx.fillStyle = '#8a8a8a';
      ctx.fillRect(x, y + h * 0.85, w, h * 0.15);
      // 主体(简笔人形)
      ctx.fillStyle = '#cfcfd8';
      // 头
      ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.18, w * 0.18, 0, Math.PI * 2); ctx.fill();
      // 身体
      Sprites._roundRect(ctx, x + w * 0.25, y + h * 0.32, w * 0.5, h * 0.55, 5);
      ctx.fill();
    },
    pond(ctx, x, y, w, h) {
      // 水
      const grad = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, w / 2);
      grad.addColorStop(0, '#5a8acf'); grad.addColorStop(1, '#1a3a6a');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      // 涟漪
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      const t = performance.now() / 800;
      const rr = (Math.sin(t) + 1) * 0.4;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w * 0.2 + rr * 8, h * 0.2 + rr * 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      // 睡莲
      ctx.fillStyle = '#2a8a3a';
      ctx.beginPath(); ctx.arc(x + w * 0.3, y + h * 0.5, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FF1493';
      ctx.beginPath(); ctx.arc(x + w * 0.3, y + h * 0.45, 3, 0, Math.PI * 2); ctx.fill();
    },
    hedge(ctx, x, y, w, h) {
      ctx.fillStyle = '#1f4f1a';
      Sprites._roundRect(ctx, x, y, w, h, 8);
      ctx.fill();
      // 叶子细节
      ctx.fillStyle = '#2a6a2a';
      for (let i = 0; i < 12; i++) {
        const lx = x + Math.random() * w, ly = y + Math.random() * h;
        ctx.beginPath();
        ctx.arc(lx, ly, 4 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    body(ctx, x, y, w, h) {
      // 受害者轮廓 + 血迹
      ctx.fillStyle = '#3a1a1a';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w * 0.45, h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // 头部
      ctx.fillStyle = '#5a3a2a';
      ctx.beginPath();
      ctx.arc(x + w * 0.3, y + h * 0.3, w * 0.18, 0, Math.PI * 2);
      ctx.fill();
      // 衣服
      ctx.fillStyle = '#4a2a2a';
      ctx.beginPath();
      ctx.ellipse(x + w * 0.55, y + h * 0.5, w * 0.3, h * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      // 血滩(扩散)
      const grad = ctx.createRadialGradient(x + w / 2, y + h * 0.7, 0, x + w / 2, y + h * 0.7, w * 0.5);
      grad.addColorStop(0, 'rgba(155,0,0,0.8)');
      grad.addColorStop(1, 'rgba(80,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h * 0.7, w * 0.6, h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      // X 眼
      ctx.strokeStyle = '#1a0808';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.24, y + h * 0.26);
      ctx.lineTo(x + w * 0.34, y + h * 0.36);
      ctx.moveTo(x + w * 0.34, y + h * 0.26);
      ctx.lineTo(x + w * 0.24, y + h * 0.36);
      ctx.stroke();
    },
    vent(ctx, x, y, w, h) {
      ctx.fillStyle = '#2a2a2a';
      Sprites._roundRect(ctx, x, y, w, h, 3);
      ctx.fill();
      ctx.strokeStyle = '#888'; ctx.lineWidth = 1.5;
      Sprites._roundRect(ctx, x + 2, y + 2, w - 4, h - 4, 2);
      ctx.stroke();
      // 通风栅
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 6 + i * (h - 12) / 4);
        ctx.lineTo(x + w - 4, y + 6 + i * (h - 12) / 4);
        ctx.stroke();
      }
    }
  },

  // === 工具 ===
  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  _darken(hex, factor) {
    if (!hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16) * factor;
    const g = parseInt(hex.slice(3, 5), 16) * factor;
    const b = parseInt(hex.slice(5, 7), 16) * factor;
    return `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
  },

  // === 粒子辅助绘制 ===
  drawParticle(ctx, p) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation || 0);
    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'star') {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? p.size : p.size * 0.5;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    } else { // square
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    }
    ctx.restore();
  }
};
