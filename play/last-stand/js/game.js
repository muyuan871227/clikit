// ============================================================
// game.js - All game entities, weapons, infection, waves, upgrades
// ============================================================

// ---- WEAPON DEFINITIONS ----
const WEAPON_DEFS = {
    machineGun: {
        name: '机枪', icon: '🔫', desc: '高频单体射击',
        fireRate: 0.2, damage: 8, bulletSpeed: 600, bulletRadius: 4,
        range: 400, type: 'projectile', piercing: 0,
        statusEffect: null, color: '#E8F4FD',
        levelUpDesc: ['伤害+20%', '攻速+15%', '伤害+20%', '攻速+15%', '伤害+50%'],
        growthType: ['damage', 'speed', 'damage', 'speed', 'damage'],
    },
    flamethrower: {
        name: '喷火器', icon: '🔥', desc: '范围持续燃烧',
        fireRate: 0.15, damage: 4, bulletSpeed: 350, bulletRadius: 8,
        range: 200, type: 'projectile', piercing: 2,
        statusEffect: 'burn', color: CONFIG.BURN_ORANGE,
        levelUpDesc: ['伤害+20%', '范围+15%', '伤害+20%', '范围+15%', '持续时间+50%'],
        growthType: ['damage', 'range', 'damage', 'range', 'damage'],
    },
    iceGun: {
        name: '冰晶枪', icon: '❄️', desc: '减速冰冻敌人',
        fireRate: 0.8, damage: 15, bulletSpeed: 500, bulletRadius: 6,
        range: 350, type: 'projectile', piercing: 0,
        statusEffect: 'freeze', color: CONFIG.FREEZE_BLUE,
        levelUpDesc: ['伤害+20%', '攻速+15%', '减速+10%', '攻速+15%', '冰冻范围扩大'],
        growthType: ['damage', 'speed', 'damage', 'speed', 'damage'],
    },
    infector: {
        name: '感染注射器', icon: '🧪', desc: '附加中毒并传播',
        fireRate: 1.0, damage: 5, bulletSpeed: 400, bulletRadius: 6,
        range: 300, type: 'projectile', piercing: 0,
        statusEffect: 'poison', color: CONFIG.POISON_GREEN,
        levelUpDesc: ['伤害+20%', '传播范围+20%', '攻速+15%', '传播数+1', '中毒伤害翻倍'],
        growthType: ['damage', 'range', 'speed', 'range', 'damage'],
    },
    ricochet: {
        name: '弹射刀', icon: '🗡️', desc: '弹射多个目标',
        fireRate: 0.6, damage: 12, bulletSpeed: 500, bulletRadius: 5,
        range: 350, type: 'ricochet', piercing: 0, bounces: 3,
        statusEffect: null, color: '#C0C0C0',
        levelUpDesc: ['伤害+20%', '弹射+1', '攻速+15%', '弹射+1', '伤害+50%'],
        growthType: ['damage', 'bounces', 'speed', 'bounces', 'damage'],
    },
    emp: {
        name: '电磁脉冲', icon: '⚡', desc: 'AOE眩晕感电',
        fireRate: 2.0, damage: 20, bulletSpeed: 0, bulletRadius: 0,
        range: 150, type: 'aoe', piercing: 0,
        statusEffect: 'shock', color: CONFIG.SHOCK_YELLOW,
        levelUpDesc: ['伤害+20%', '范围+15%', '攻速+15%', '范围+15%', '连锁感电'],
        growthType: ['damage', 'range', 'speed', 'range', 'damage'],
    },
    poisonBomb: {
        name: '毒雾炸弹', icon: '☠️', desc: '大范围中毒',
        fireRate: 1.5, damage: 10, bulletSpeed: 300, bulletRadius: 10,
        range: 250, type: 'projectile_aoe', piercing: 0, aoeRadius: 80,
        statusEffect: 'poison', color: '#2d8a2d',
        levelUpDesc: ['伤害+20%', 'AOE范围+15%', '攻速+15%', '中毒时间+30%', '双弹'],
        growthType: ['damage', 'range', 'speed', 'damage', 'damage'],
    },
    laser: {
        name: '激光炮', icon: '💥', desc: '穿透直线激光',
        fireRate: 1.2, damage: 25, bulletSpeed: 800, bulletRadius: 5,
        range: 600, type: 'projectile', piercing: 999,
        statusEffect: null, color: '#ff3333',
        levelUpDesc: ['伤害+20%', '攻速+15%', '伤害+30%', '宽度+30%', '伤害+50%'],
        growthType: ['damage', 'speed', 'damage', 'range', 'damage'],
    }
};

// ---- EVOLUTION DEFINITIONS ----
const EVOLUTIONS = [
    {
        name: '地狱炎龙', icon: '🐉',
        desc: '喷火范围x3，持续点燃地面',
        requires: ['flamethrower'],
        reqLevel: 5,
        color: '#FF4500',
    },
    {
        name: '冰封女王', icon: '👸',
        desc: '冰冻范围全屏闪光',
        requires: ['iceGun'],
        reqLevel: 5,
        color: '#87CEEB',
    },
    {
        name: '病毒宿主', icon: '🦠',
        desc: '角色自动发射感染光线',
        requires: ['infector'],
        reqLevel: 5,
        color: '#00FF00',
    },
];

// ---- PLAYER ----
class Player {
    constructor() {
        this.x = CONFIG.MAP_WIDTH / 2;
        this.y = CONFIG.MAP_HEIGHT / 2;
        this.radius = CONFIG.PLAYER_RADIUS;
        this.speed = CONFIG.PLAYER_BASE_SPEED;
        this.maxHp = CONFIG.PLAYER_BASE_HP;
        this.hp = this.maxHp;
        this.level = 1;
        this.exp = 0;
        this.expToLevel = 10;
        this.weapons = [];
        this.magnetRange = CONFIG.PLAYER_MAGNET_RANGE;
        this.invincibleTimer = 0;
        this.kills = 0;
        this.maxChain = 0;
        this.rerolls = 1;

        // Movement trail
        this.facingAngle = 0;
        this.moving = false;

        // Meta bonuses (from upgrade tree)
        this.metaBonuses = { hp: 0, speed: 0, exp: 0, magnet: 0, damage: 0, armor: 0 };
    }

    applyMetaBonuses(tree) {
        this.maxHp = CONFIG.PLAYER_BASE_HP + (tree.hp || 0) * 5;
        this.hp = this.maxHp;
        this.speed = CONFIG.PLAYER_BASE_SPEED * (1 + (tree.speed || 0) * 0.05);
        this.magnetRange = CONFIG.PLAYER_MAGNET_RANGE + (tree.magnet || 0) * 10;
    }

    addWeapon(weaponId) {
        if (this.weapons.length >= CONFIG.MAX_WEAPONS) return false;
        if (this.weapons.find(w => w.id === weaponId)) return false;
        const def = WEAPON_DEFS[weaponId];
        if (!def) return false;
        this.weapons.push({
            id: weaponId,
            def: def,
            level: 1,
            maxLevel: 5,
            cooldown: 0,
            evolved: false
        });
        return true;
    }

    upgradeWeapon(weaponId) {
        const w = this.weapons.find(w => w.id === weaponId);
        if (w && w.level < w.maxLevel) {
            w.level++;
            return true;
        }
        return false;
    }

    getWeaponDamage(weapon) {
        const baseDmg = weapon.def.damage;
        const levelMult = 1 + (weapon.level - 1) * 0.2;
        const metaMult = 1 + (this.metaBonuses.damage || 0) * 0.05;
        return baseDmg * levelMult * metaMult;
    }

    getWeaponFireRate(weapon) {
        const baseRate = weapon.def.fireRate;
        const speedBonus = weapon.def.growthType.slice(0, weapon.level).filter(g => g === 'speed').length;
        return baseRate / (1 + speedBonus * 0.15);
    }

    getWeaponRange(weapon) {
        const baseRange = weapon.def.range;
        const rangeBonus = weapon.def.growthType.slice(0, weapon.level).filter(g => g === 'range').length;
        return baseRange * (1 + rangeBonus * 0.15);
    }

    update(dt) {
        // Movement
        const dx = Input.moveDir.x;
        const dy = Input.moveDir.y;
        this.moving = dx !== 0 || dy !== 0;

        if (this.moving) {
            this.x += dx * this.speed * dt;
            this.y += dy * this.speed * dt;
            this.facingAngle = Math.atan2(dy, dx);
        }

        // Clamp to map
        this.x = Utils.clamp(this.x, this.radius, CONFIG.MAP_WIDTH - this.radius);
        this.y = Utils.clamp(this.y, this.radius, CONFIG.MAP_HEIGHT - this.radius);

        // Invincibility
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
        }

        // Weapon cooldowns
        for (const w of this.weapons) {
            w.cooldown -= dt;
        }
    }

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return;
        const armor = this.metaBonuses.armor || 0;
        const reduced = Math.max(1, amount - armor);
        this.hp -= reduced;
        this.invincibleTimer = 0.3;
        Camera.shake(4, 0.15);
        Particles.emit(this.x, this.y, 8, CONFIG.HP_RED, 50, 150, 2, 4, 0.3, 0.5);
        FloatingTexts.add(this.x, this.y - 20, `-${reduced}`, CONFIG.HP_RED, 18);
    }

    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
        FloatingTexts.add(this.x, this.y - 20, `+${amount}`, '#44ff44', 16);
    }

    addExp(amount) {
        const mult = 1 + (this.metaBonuses.exp || 0) * 0.1;
        this.exp += amount * mult;
    }

    checkLevelUp() {
        if (this.exp >= this.expToLevel) {
            this.exp -= this.expToLevel;
            this.level++;
            this.expToLevel = Math.floor(10 + this.level * 5 + this.level * this.level * 0.5);
            return true;
        }
        return false;
    }

    render(ctx) {
        const sp = Camera.worldToScreen(this.x, this.y);
        const flicker = this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 20) % 2 === 0;
        if (flicker) return;

        // Body
        ctx.fillStyle = CONFIG.PLAYER_COLOR;
        ctx.shadowColor = CONFIG.PLAYER_COLOR;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Direction indicator
        const angle = this.facingAngle;
        ctx.strokeStyle = CONFIG.INFECTION_GREEN;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sp.x + Math.cos(angle) * this.radius * 0.5, sp.y + Math.sin(angle) * this.radius * 0.5);
        ctx.lineTo(sp.x + Math.cos(angle) * this.radius * 1.3, sp.y + Math.sin(angle) * this.radius * 1.3);
        ctx.stroke();

        // Weapon indicators (small circles around player)
        for (let i = 0; i < this.weapons.length; i++) {
            const wa = (i / this.weapons.length) * Math.PI * 2 - Math.PI / 2;
            const wx = sp.x + Math.cos(wa) * (this.radius + 10);
            const wy = sp.y + Math.sin(wa) * (this.radius + 10);
            ctx.fillStyle = this.weapons[i].def.color;
            ctx.beginPath();
            ctx.arc(wx, wy, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// ---- ENEMY ----
class Enemy {
    constructor() { this.active = false; }

    init(x, y, type, hpMult = 1, speedMult = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;
        this.radius = type.radius;
        this.maxHp = type.hp * hpMult;
        this.hp = this.maxHp;
        this.speed = type.speed * speedMult;
        this.baseSpeed = this.speed;
        this.damage = type.damage;
        this.expValue = type.expValue;
        this.isElite = type.isElite || false;
        this.isBoss = type.isBoss || false;
        this.immuneToInfection = this.isElite || this.isBoss;

        // Status effects
        this.statuses = {};
        this.infectionDepth = {};
        this.stunTimer = 0;
        this.damageBonus = 0;

        // AI
        this.attackCooldown = 0;

        // Visual
        this.hitFlash = 0;
        this.deathAnim = 0;
    }

    update(dt, playerX, playerY) {
        if (!this.active) return;

        // Update status effects
        this._updateStatuses(dt);

        // Stun
        if (this.stunTimer > 0) {
            this.stunTimer -= dt;
            return;
        }

        // Movement - chase player
        const angle = Utils.angle(this, { x: playerX, y: playerY });
        const currentSpeed = this.speed;
        this.x += Math.cos(angle) * currentSpeed * dt;
        this.y += Math.sin(angle) * currentSpeed * dt;

        // Visual timers
        if (this.hitFlash > 0) this.hitFlash -= dt;
    }

    _updateStatuses(dt) {
        this.speed = this.baseSpeed;
        this.damageBonus = 0;

        for (const [statusId, status] of Object.entries(this.statuses)) {
            status.timer -= dt;
            if (status.timer <= 0) {
                delete this.statuses[statusId];
                continue;
            }

            const conf = CONFIG.STATUS[statusId];
            if (!conf) continue;

            // Apply effects
            if (statusId === 'burn') {
                status.tickTimer -= dt;
                if (status.tickTimer <= 0) {
                    this.hp -= conf.dps;
                    status.tickTimer = 1;
                    Particles.emit(this.x, this.y, 2, conf.color, 20, 60, 2, 4, 0.2, 0.4, true);
                }
            } else if (statusId === 'freeze') {
                this.speed *= (1 - conf.slowPct);
            } else if (statusId === 'poison') {
                status.tickTimer -= dt;
                if (status.tickTimer <= 0) {
                    this.hp -= conf.dps;
                    status.tickTimer = 1;
                    Particles.emit(this.x, this.y, 1, conf.color, 10, 40, 2, 3, 0.3, 0.5);
                }
            } else if (statusId === 'shock') {
                if (!status.stunApplied) {
                    this.stunTimer = conf.stunDur;
                    status.stunApplied = true;
                }
                this.damageBonus = conf.dmgBonus;
            }
        }

        // Check death from status
        if (this.hp <= 0) {
            this.active = false;
        }
    }

    applyStatus(statusId, depth = 0) {
        if (this.immuneToInfection && depth > 0) return false;
        const conf = CONFIG.STATUS[statusId];
        if (!conf) return false;

        const decay = Math.pow(CONFIG.INFECTION_DECAY, depth);
        const existing = this.statuses[statusId];
        if (existing && existing.timer > conf.duration * decay * 0.5) return false;

        this.statuses[statusId] = {
            timer: conf.duration * decay,
            tickTimer: 0,
            stunApplied: false,
            depth: depth
        };
        this.infectionDepth[statusId] = depth;
        return true;
    }

    takeDamage(amount) {
        const mult = 1 + this.damageBonus;
        const finalDmg = Math.floor(amount * mult);
        this.hp -= finalDmg;
        this.hitFlash = 0.1;

        // Damage number
        const isCrit = mult > 1;
        const color = isCrit ? CONFIG.CRIT_COLOR : '#ffffff';
        const size = isCrit ? 20 : 14;
        FloatingTexts.add(this.x + Utils.rand(-10, 10), this.y - this.radius, finalDmg.toString(), color, size);

        if (this.hp <= 0) {
            this.active = false;
        }
        return finalDmg;
    }

    render(ctx) {
        if (!this.active) return;
        const sp = Camera.worldToScreen(this.x, this.y);

        // Status glow
        const statusKeys = Object.keys(this.statuses);
        if (statusKeys.length > 0) {
            const glowColor = CONFIG.STATUS[statusKeys[0]]?.color || '#fff';
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 12;
        }

        // Body
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : (this.isBoss ? '#ff2222' : this.isElite ? '#cc3333' : CONFIG.ENEMY_COLOR);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Status indicators (rings)
        for (const statusId of statusKeys) {
            const conf = CONFIG.STATUS[statusId];
            if (conf) {
                ctx.strokeStyle = conf.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, this.radius + 4, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }

        // HP bar for elites/bosses
        if ((this.isElite || this.isBoss) && this.hp < this.maxHp) {
            const barW = this.radius * 2.5;
            const barH = 4;
            const barX = sp.x - barW / 2;
            const barY = sp.y - this.radius - 10;
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = CONFIG.HP_RED;
            ctx.fillRect(barX, barY, barW * (this.hp / this.maxHp), barH);
        }

        // Boss name
        if (this.isBoss) {
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.type.name, sp.x, sp.y - this.radius - 16);
        }
    }
}

// ---- ENEMY TYPES ----
const ENEMY_TYPES = {
    zombie: { name: '丧尸', hp: 20, speed: 60, damage: 10, radius: 14, expValue: 1, isElite: false },
    fast: { name: '快速感染者', hp: 10, speed: 130, damage: 8, radius: 12, expValue: 2, isElite: false },
    tank: { name: '重甲异变体', hp: 80, speed: 35, damage: 15, radius: 22, expValue: 3, isElite: false },
    exploder: { name: '爆炸丧尸', hp: 15, speed: 70, damage: 25, radius: 16, expValue: 2, isElite: false, explodeOnDeath: true },
    elite: { name: '感染精英', hp: 200, speed: 50, damage: 20, radius: 26, expValue: 15, isElite: true },
    boss: { name: '末日巨兽', hp: 3000, speed: 30, damage: 30, radius: 50, expValue: 50, isBoss: true, isElite: true },
};

// ---- PROJECTILE ----
class Projectile {
    constructor() { this.active = false; }
    init(x, y, vx, vy, damage, radius, piercing, statusEffect, color, weaponId, bounces = 0) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.damage = damage;
        this.radius = radius;
        this.piercing = piercing;
        this.hitCount = 0;
        this.statusEffect = statusEffect;
        this.color = color;
        this.weaponId = weaponId;
        this.bounces = bounces;
        this.active = true;
        this.life = 3;
        this.hitEnemies = new Set();
        this.trail = [];
    }

    update(dt) {
        if (!this.active) return;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;

        // Trail
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 6) this.trail.shift();
        for (const t of this.trail) t.alpha -= dt * 3;

        // Out of bounds
        if (this.x < -100 || this.x > CONFIG.MAP_WIDTH + 100 ||
            this.y < -100 || this.y > CONFIG.MAP_HEIGHT + 100 || this.life <= 0) {
            this.active = false;
        }
    }

    render(ctx) {
        if (!this.active) return;
        const sp = Camera.worldToScreen(this.x, this.y);

        // Trail
        for (const t of this.trail) {
            if (t.alpha <= 0) continue;
            const tp = Camera.worldToScreen(t.x, t.y);
            ctx.globalAlpha = t.alpha * 0.4;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(tp.x, tp.y, this.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Bullet
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ---- EXP GEM ----
class ExpGem {
    constructor() { this.active = false; }
    init(x, y, value) {
        this.x = x; this.y = y;
        this.value = value;
        this.active = true;
        this.magnetized = false;
        this.radius = value >= 10 ? 6 : value >= 5 ? 5 : 4;
        this.bobPhase = Math.random() * Math.PI * 2;
    }

    update(dt, playerX, playerY, magnetRange) {
        if (!this.active) return;
        this.bobPhase += dt * 3;

        const dist = Utils.dist(this, { x: playerX, y: playerY });
        if (dist < magnetRange || this.magnetized) {
            this.magnetized = true;
            const angle = Utils.angle(this, { x: playerX, y: playerY });
            const speed = CONFIG.PLAYER_MAGNET_SPEED * (this.magnetized ? 1.5 : 1);
            this.x += Math.cos(angle) * speed * dt;
            this.y += Math.sin(angle) * speed * dt;

            if (dist < 15) {
                this.active = false;
                return this.value;
            }
        }
        return 0;
    }

    render(ctx) {
        if (!this.active) return;
        const sp = Camera.worldToScreen(this.x, this.y);
        const bob = Math.sin(this.bobPhase) * 2;

        ctx.fillStyle = this.value >= 10 ? '#88ccff' : CONFIG.EXP_COLOR;
        ctx.shadowColor = CONFIG.EXP_COLOR;
        ctx.shadowBlur = 6;
        ctx.beginPath();

        // Diamond shape
        const r = this.radius;
        ctx.moveTo(sp.x, sp.y - r + bob);
        ctx.lineTo(sp.x + r, sp.y + bob);
        ctx.lineTo(sp.x, sp.y + r + bob);
        ctx.lineTo(sp.x - r, sp.y + bob);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ---- HEALTH PICKUP ----
class HealthPickup {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.active = true;
        this.radius = 10;
        this.healAmount = 20;
        this.bobPhase = Math.random() * Math.PI * 2;
    }

    update(dt, playerX, playerY) {
        if (!this.active) return 0;
        this.bobPhase += dt * 2;
        const dist = Utils.dist(this, { x: playerX, y: playerY });
        if (dist < 25) {
            this.active = false;
            return this.healAmount;
        }
        return 0;
    }

    render(ctx) {
        if (!this.active) return;
        const sp = Camera.worldToScreen(this.x, this.y);
        const bob = Math.sin(this.bobPhase) * 3;

        // Red cross
        ctx.fillStyle = '#ff4444';
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 8;
        ctx.fillRect(sp.x - 3, sp.y - 8 + bob, 6, 16);
        ctx.fillRect(sp.x - 8, sp.y - 3 + bob, 16, 6);
        ctx.shadowBlur = 0;
    }
}

// ---- GAME STATE ----
const GameState = {
    // Entities
    player: null,
    enemies: [],
    projectiles: [],
    expGems: [],
    healthPickups: [],

    // State
    state: 'menu', // menu, playing, upgrading, gameover
    gameTime: 0,
    paused: false,
    slowMotion: 0,
    victory: false,
    bossSpawned: false,

    // Infection chain tracking
    infectionGrid: null,
    infectionTimer: 0,
    currentChain: 0,

    // Wave system
    waveTimer: 0,
    spawnAccumulator: 0,
    rushTimer: 0,

    // Meta progression (persisted in localStorage)
    meta: { gold: 0, hp: 0, speed: 0, exp: 0, magnet: 0, damage: 0, armor: 0 },
    totalKills: 0,

    init() {
        this.loadMeta();
        Particles.init();
        this.infectionGrid = new SpatialGrid(100);
    },

    loadMeta() {
        try {
            const saved = localStorage.getItem('laststand_meta');
            if (saved) this.meta = JSON.parse(saved);
        } catch (e) {}
    },

    saveMeta() {
        try {
            localStorage.setItem('laststand_meta', JSON.stringify(this.meta));
        } catch (e) {}
    },

    startGame() {
        this.player = new Player();
        this.player.applyMetaBonuses(this.meta);
        this.enemies = [];
        this.projectiles = [];
        this.expGems = [];
        this.healthPickups = [];
        this.gameTime = 0;
        this.slowMotion = 0;
        this.victory = false;
        this.bossSpawned = false;
        this.infectionTimer = 0;
        this.currentChain = 0;
        this.waveTimer = 0;
        this.spawnAccumulator = 0;
        this.rushTimer = Utils.rand(20, 40);

        Particles.init();
        FloatingTexts.list = [];

        // Starting weapon
        this.player.addWeapon('machineGun');

        // Snap camera to player immediately
        Camera.x = this.player.x - Camera.width / 2;
        Camera.y = this.player.y - Camera.height / 2;
        Camera.targetX = Camera.x;
        Camera.targetY = Camera.y;

        this.state = 'playing';
    },

    update(dt) {
        if (this.state !== 'playing') return;

        // Slow motion
        let effectiveDt = dt;
        if (this.slowMotion > 0) {
            this.slowMotion -= dt;
            effectiveDt = dt * 0.2;
        }

        Input.update();
        this.gameTime += effectiveDt;

        // Update player
        this.player.update(effectiveDt);

        // Update camera
        Camera.follow(this.player);
        Camera.update(effectiveDt);
        Camera.updateShake(effectiveDt);

        // Weapon firing
        this._updateWeapons(effectiveDt);

        // Update projectiles
        this._updateProjectiles(effectiveDt);

        // Update enemies
        this._updateEnemies(effectiveDt);

        // Infection chain
        this._updateInfectionChain(effectiveDt);

        // EXP gems
        this._updateExpGems(effectiveDt);

        // Health pickups
        this._updateHealthPickups(effectiveDt);

        // Wave spawning
        this._updateWaves(effectiveDt);

        // Health pickup spawning
        if (Utils.chance(0.001 * effectiveDt * 60)) {
            this._spawnHealthPickup();
        }

        // Particles and floating text
        Particles.update(effectiveDt);
        FloatingTexts.update(effectiveDt);

        // Level up check
        if (this.player.checkLevelUp()) {
            this.triggerLevelUp();
        }

        // Game over check
        if (this.player.hp <= 0) {
            this.endGame(false);
        }

        // Victory check (survived 15 min and boss dead)
        if (this.gameTime >= CONFIG.LEVEL_DURATION && this.bossSpawned) {
            const bossAlive = this.enemies.some(e => e.active && e.isBoss);
            if (!bossAlive) {
                this.endGame(true);
            }
        }
    },

    _updateWeapons(dt) {
        const p = this.player;
        for (const weapon of p.weapons) {
            weapon.cooldown -= dt;
            if (weapon.cooldown > 0) continue;

            const fireRate = p.getWeaponFireRate(weapon);
            weapon.cooldown = fireRate;

            // Find target
            const range = p.getWeaponRange(weapon);
            let target = this._findNearestEnemy(p.x, p.y, range);
            if (!target) continue;

            const damage = p.getWeaponDamage(weapon);
            const angle = Utils.angle(p, target);

            if (weapon.def.type === 'aoe') {
                // AOE - hit all enemies in range
                const nearby = this.enemies.filter(e =>
                    e.active && Utils.dist(p, e) < range
                );
                for (const e of nearby) {
                    e.takeDamage(damage);
                    if (weapon.def.statusEffect) {
                        e.applyStatus(weapon.def.statusEffect, 0);
                    }
                }
                // AOE visual
                Particles.emit(p.x, p.y, 15, weapon.def.color, 100, 250, 3, 6, 0.3, 0.5, true);
                Camera.shake(3, 0.1);
            } else {
                // Projectile
                const speed = weapon.def.bulletSpeed;
                const proj = new Projectile();
                proj.init(
                    p.x, p.y,
                    Math.cos(angle) * speed, Math.sin(angle) * speed,
                    damage, weapon.def.bulletRadius,
                    weapon.def.piercing || 0,
                    weapon.def.statusEffect,
                    weapon.def.color,
                    weapon.id,
                    weapon.def.bounces || 0
                );
                this.projectiles.push(proj);
            }
        }
    },

    _updateProjectiles(dt) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update(dt);

            if (!proj.active) {
                this.projectiles.splice(i, 1);
                continue;
            }

            // Collision with enemies
            for (const enemy of this.enemies) {
                if (!enemy.active || proj.hitEnemies.has(enemy)) continue;
                const dist = Utils.dist(proj, enemy);
                if (dist < proj.radius + enemy.radius) {
                    enemy.takeDamage(proj.damage);
                    proj.hitEnemies.add(enemy);

                    // Apply status effect
                    if (proj.statusEffect) {
                        enemy.applyStatus(proj.statusEffect, 0);
                    }

                    // Piercing
                    proj.hitCount++;
                    if (proj.hitCount > proj.piercing) {
                        // Ricochet
                        if (proj.bounces > 0) {
                            proj.bounces--;
                            const nextTarget = this._findNearestEnemy(proj.x, proj.y, 200, enemy);
                            if (nextTarget) {
                                const a = Utils.angle(proj, nextTarget);
                                const speed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
                                proj.vx = Math.cos(a) * speed;
                                proj.vy = Math.sin(a) * speed;
                                proj.hitCount = 0;
                            } else {
                                proj.active = false;
                            }
                        } else {
                            proj.active = false;
                        }
                    }

                    // Hit particles
                    const hitAngle = Utils.angle(enemy, proj);
                    Particles.emitDirectional(enemy.x, enemy.y, hitAngle, 0.5, 3, '#fff', 50, 120, 2, 0.2);

                    // Check enemy death
                    if (!enemy.active) {
                        this._onEnemyDeath(enemy);
                    }
                    break;
                }
            }

            // AOE explosion projectiles
            if (proj.active && WEAPON_DEFS[proj.weaponId]?.type === 'projectile_aoe') {
                const def = WEAPON_DEFS[proj.weaponId];
                // Check if near any enemy
                for (const enemy of this.enemies) {
                    if (!enemy.active) continue;
                    if (Utils.dist(proj, enemy) < def.aoeRadius) {
                        // Explode
                        const nearby = this.enemies.filter(e =>
                            e.active && Utils.dist(proj, e) < def.aoeRadius
                        );
                        for (const e of nearby) {
                            e.takeDamage(proj.damage);
                            if (proj.statusEffect) e.applyStatus(proj.statusEffect, 0);
                            if (!e.active) this._onEnemyDeath(e);
                        }
                        Particles.emit(proj.x, proj.y, 20, proj.color, 50, 200, 3, 8, 0.3, 0.6, true);
                        Camera.shake(3, 0.1);
                        proj.active = false;
                        break;
                    }
                }
            }
        }
    },

    _updateEnemies(dt) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.active) {
                this._onEnemyDeath(enemy);
                this.enemies.splice(i, 1);
                continue;
            }

            enemy.update(dt, this.player.x, this.player.y);

            // Contact damage
            const dist = Utils.dist(enemy, this.player);
            if (dist < enemy.radius + this.player.radius) {
                this.player.takeDamage(enemy.damage);
            }
        }
    },

    _updateInfectionChain(dt) {
        this.infectionTimer += dt;
        if (this.infectionTimer < CONFIG.INFECTION_TICK) return;
        this.infectionTimer = 0;

        // Rebuild spatial grid
        this.infectionGrid.clear();
        for (const enemy of this.enemies) {
            if (enemy.active) this.infectionGrid.insert(enemy);
        }

        // For each infected enemy, spread to nearby
        let chainKills = 0;
        for (const enemy of this.enemies) {
            if (!enemy.active) continue;

            for (const [statusId, status] of Object.entries(enemy.statuses)) {
                const depth = enemy.infectionDepth[statusId] || 0;
                if (depth >= CONFIG.INFECTION_MAX_DEPTH) continue;

                const conf = CONFIG.STATUS[statusId];
                if (!conf) continue;

                const nearby = this.infectionGrid.queryRadius(enemy.x, enemy.y, conf.spreadRadius);
                let spreadCount = 0;

                for (const target of nearby) {
                    if (target === enemy || !target.active || target.immuneToInfection) continue;
                    if (spreadCount >= conf.spreadCount) break;

                    if (target.applyStatus(statusId, depth + 1)) {
                        spreadCount++;

                        // Infection line visual
                        Particles.emit(
                            (enemy.x + target.x) / 2,
                            (enemy.y + target.y) / 2,
                            3, conf.color, 10, 40, 2, 3, 0.3, 0.5, true
                        );
                    }
                }
            }
        }

        // Count chain kills
        let currentChainCount = 0;
        for (const enemy of this.enemies) {
            if (!enemy.active && Object.keys(enemy.statuses).length > 0) {
                currentChainCount++;
            }
        }
        if (currentChainCount > this.currentChain) {
            this.currentChain = currentChainCount;
        }
    },

    _updateExpGems(dt) {
        for (let i = this.expGems.length - 1; i >= 0; i--) {
            const gem = this.expGems[i];
            const exp = gem.update(dt, this.player.x, this.player.y, this.player.magnetRange);
            if (exp > 0) {
                this.player.addExp(exp);
            }
            if (!gem.active) {
                this.expGems.splice(i, 1);
            }
        }
    },

    _updateHealthPickups(dt) {
        for (let i = this.healthPickups.length - 1; i >= 0; i--) {
            const hp = this.healthPickups[i];
            const heal = hp.update(dt, this.player.x, this.player.y);
            if (heal > 0) {
                this.player.heal(heal);
            }
            if (!hp.active) {
                this.healthPickups.splice(i, 1);
            }
        }
    },

    _updateWaves(dt) {
        this.waveTimer += dt;

        // Difficulty scaling based on time
        const t = this.gameTime;
        let spawnRate, hpMult, speedMult, types;

        if (t < 120) {
            // Warmup 0-2min
            spawnRate = 0.8; hpMult = 1; speedMult = 1;
            types = [{ type: 'zombie', weight: 1 }];
        } else if (t < 300) {
            // Building 2-5min
            spawnRate = 1.5; hpMult = 1.2; speedMult = 1.1;
            types = [{ type: 'zombie', weight: 3 }, { type: 'fast', weight: 1 }];
        } else if (t < 480) {
            // Pressure 5-8min
            spawnRate = 2.5; hpMult = 1.5; speedMult = 1.2;
            types = [{ type: 'zombie', weight: 2 }, { type: 'fast', weight: 2 }, { type: 'tank', weight: 1 }];
        } else if (t < 720) {
            // Frenzy 8-12min
            spawnRate = 3.5; hpMult = 2; speedMult = 1.3;
            types = [{ type: 'zombie', weight: 2 }, { type: 'fast', weight: 2 }, { type: 'tank', weight: 1 }, { type: 'exploder', weight: 1 }];
        } else if (t < 840) {
            // Elite 12-14min
            spawnRate = 2; hpMult = 3; speedMult = 1.2;
            types = [{ type: 'zombie', weight: 2 }, { type: 'fast', weight: 1 }, { type: 'tank', weight: 1 }, { type: 'elite', weight: 0.3 }];
        } else {
            // Boss phase 14-15min
            if (!this.bossSpawned) {
                this._spawnBoss();
                this.bossSpawned = true;
            }
            spawnRate = 0.5; hpMult = 2; speedMult = 1;
            types = [{ type: 'zombie', weight: 1 }];
        }

        // Rush waves
        this.rushTimer -= dt;
        if (this.rushTimer <= 0 && t > 60) {
            this.rushTimer = Utils.rand(25, 45);
            // Spawn rush of enemies
            for (let i = 0; i < 15; i++) {
                this._spawnEnemy('fast', hpMult, speedMult * 1.2);
            }
            FloatingTexts.add(this.player.x, this.player.y - 60, '! 紧急潮 !', '#ff4444', 22, 1.5);
        }

        // Regular spawning
        if (this.enemies.length < CONFIG.MAX_ENEMIES_ON_SCREEN) {
            this.spawnAccumulator += spawnRate * dt;
            while (this.spawnAccumulator >= 1) {
                this.spawnAccumulator -= 1;
                const typeWeights = types.map(t => t.weight);
                const typeNames = types.map(t => t.type);
                const chosen = Utils.weightedPick(typeNames, typeWeights);
                this._spawnEnemy(chosen, hpMult, speedMult);
            }
        }
    },

    _spawnEnemy(typeName, hpMult, speedMult) {
        const type = ENEMY_TYPES[typeName];
        if (!type) return;

        // Spawn from edge
        const side = Utils.randInt(0, 3);
        let x, y;
        const margin = 100;
        const camX = Camera.x;
        const camY = Camera.y;

        switch (side) {
            case 0: x = camX + Utils.rand(-margin, Camera.width + margin); y = camY - margin; break;
            case 1: x = camX + Camera.width + margin; y = camY + Utils.rand(-margin, Camera.height + margin); break;
            case 2: x = camX + Utils.rand(-margin, Camera.width + margin); y = camY + Camera.height + margin; break;
            case 3: x = camX - margin; y = camY + Utils.rand(-margin, Camera.height + margin); break;
        }

        x = Utils.clamp(x, 0, CONFIG.MAP_WIDTH);
        y = Utils.clamp(y, 0, CONFIG.MAP_HEIGHT);

        const enemy = new Enemy();
        enemy.init(x, y, type, hpMult, speedMult);
        this.enemies.push(enemy);
    },

    _spawnBoss() {
        const type = ENEMY_TYPES.boss;
        const angle = Math.random() * Math.PI * 2;
        const dist = 500;
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;
        const enemy = new Enemy();
        enemy.init(x, y, type, 1, 1);
        this.enemies.push(enemy);
        FloatingTexts.add(this.player.x, this.player.y - 80, '!! BOSS 出现 !!', '#ff2222', 28, 2);
        Camera.shake(10, 0.5);
    },

    _spawnHealthPickup() {
        const angle = Math.random() * Math.PI * 2;
        const dist = Utils.rand(100, 400);
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;
        if (x > 0 && x < CONFIG.MAP_WIDTH && y > 0 && y < CONFIG.MAP_HEIGHT) {
            this.healthPickups.push(new HealthPickup(x, y));
        }
    },

    _onEnemyDeath(enemy) {
        if (!enemy._deathHandled) {
            enemy._deathHandled = true;
            this.player.kills++;

            // EXP gems
            const gemCount = enemy.expValue;
            for (let i = 0; i < gemCount; i++) {
                const gem = new ExpGem();
                gem.init(
                    enemy.x + Utils.rand(-15, 15),
                    enemy.y + Utils.rand(-15, 15),
                    1
                );
                this.expGems.push(gem);
            }

            // Bonus EXP for chain kills (killed by status effects)
            if (Object.keys(enemy.statuses).length > 0) {
                const bonus = new ExpGem();
                bonus.init(enemy.x, enemy.y, 1);
                this.expGems.push(bonus);

                // Track chain
                this.currentChain++;
                if (this.currentChain > this.player.maxChain) {
                    this.player.maxChain = this.currentChain;
                }

                // Chain notification
                if (this.currentChain >= 5 && this.currentChain % 5 === 0) {
                    FloatingTexts.add(this.player.x, this.player.y - 50, `CHAIN x${this.currentChain}`, CONFIG.INFECTION_GREEN, 24, 1.5);
                    Camera.shake(3, 0.15);
                }
            }

            // Exploder death effect
            if (enemy.type.explodeOnDeath) {
                const nearby = this.enemies.filter(e => e.active && Utils.dist(enemy, e) < 80);
                for (const e of nearby) {
                    e.takeDamage(enemy.damage);
                }
                Particles.emit(enemy.x, enemy.y, 25, CONFIG.BURN_ORANGE, 80, 250, 3, 8, 0.3, 0.6, true);
                Camera.shake(5, 0.2);
            }

            // Death particles
            Particles.emit(enemy.x, enemy.y, 8, CONFIG.ENEMY_COLOR, 40, 150, 2, 5, 0.2, 0.5);
        }
    },

    _findNearestEnemy(x, y, range, exclude = null) {
        let nearest = null;
        let minDist = range * range;
        for (const enemy of this.enemies) {
            if (!enemy.active || enemy === exclude) continue;
            const d = Utils.distSq(enemy, { x, y });
            if (d < minDist) {
                minDist = d;
                nearest = enemy;
            }
        }
        return nearest;
    },

    triggerLevelUp() {
        this.slowMotion = 0.5;
        this.state = 'upgrading';
        this._generateUpgradeCards();
    },

    _generateUpgradeCards() {
        const cards = [];
        const p = this.player;

        // Possible cards
        const pool = [];

        // Existing weapon upgrades
        for (const w of p.weapons) {
            if (w.level < w.maxLevel) {
                pool.push({
                    type: 'weaponUp',
                    weaponId: w.id,
                    name: `${w.def.name} Lv.${w.level + 1}`,
                    icon: w.def.icon,
                    desc: w.def.levelUpDesc[w.level - 1] || '强化',
                    rarity: w.level >= 4 ? 'epic' : w.level >= 2 ? 'rare' : 'common',
                    weight: 3
                });
            }
        }

        // New weapons
        const weaponIds = Object.keys(WEAPON_DEFS);
        for (const wid of weaponIds) {
            if (!p.weapons.find(w => w.id === wid) && p.weapons.length < CONFIG.MAX_WEAPONS) {
                const def = WEAPON_DEFS[wid];
                pool.push({
                    type: 'newWeapon',
                    weaponId: wid,
                    name: def.name,
                    icon: def.icon,
                    desc: def.desc,
                    rarity: 'common',
                    weight: 2
                });
            }
        }

        // Passive upgrades
        const passives = [
            { name: '生命强化', icon: '❤️', desc: 'HP上限+15', effect: () => { p.maxHp += 15; p.hp = Math.min(p.hp + 15, p.maxHp); }, rarity: 'common' },
            { name: '疾步', icon: '💨', desc: '移动速度+8%', effect: () => { p.speed *= 1.08; }, rarity: 'common' },
            { name: '磁力', icon: '🧲', desc: '磁吸范围+30', effect: () => { p.magnetRange += 30; }, rarity: 'common' },
            { name: '急救包', icon: '💊', desc: '立即恢复30HP', effect: () => { p.heal(30); }, rarity: 'common' },
            { name: '护甲', icon: '🛡️', desc: '减少2点受伤', effect: () => { p.metaBonuses.armor = (p.metaBonuses.armor || 0) + 2; }, rarity: 'rare' },
        ];

        for (const passive of passives) {
            pool.push({
                type: 'passive',
                passive: passive,
                name: passive.name,
                icon: passive.icon,
                desc: passive.desc,
                rarity: passive.rarity,
                weight: 1.5
            });
        }

        // Infection chain upgrades
        if (p.weapons.some(w => w.def.statusEffect)) {
            pool.push({
                type: 'passive',
                passive: { name: '感染强化', icon: '🦠', desc: '感染传播范围+20%', effect: () => {
                    for (const key of Object.keys(CONFIG.STATUS)) {
                        CONFIG.STATUS[key].spreadRadius *= 1.2;
                    }
                }, rarity: 'rare' },
                name: '感染强化',
                icon: '🦠',
                desc: '感染传播范围+20%',
                rarity: 'rare',
                weight: 2
            });
        }

        // Evolution check
        for (const evo of EVOLUTIONS) {
            const allReady = evo.requires.every(wid => {
                const w = p.weapons.find(w => w.id === wid);
                return w && w.level >= evo.reqLevel;
            });
            if (allReady) {
                pool.unshift({
                    type: 'evolution',
                    evolution: evo,
                    name: evo.name,
                    icon: evo.icon,
                    desc: evo.desc,
                    rarity: 'legendary',
                    weight: 10
                });
            }
        }

        // Pick 3 cards
        const weights = pool.map(c => c.weight);
        while (cards.length < 3 && pool.length > 0) {
            const idx = Utils.weightedPick(
                pool.map((_, i) => i),
                pool.map(c => c.weight)
            );
            cards.push(pool[idx]);
            pool.splice(idx, 1);
        }

        this._showUpgradeUI(cards);
    },

    _showUpgradeUI(cards) {
        const container = document.getElementById('cardContainer');
        container.innerHTML = '';

        const screen = document.getElementById('upgradeScreen');
        screen.style.display = 'flex';

        document.getElementById('rerollCount').textContent = this.player.rerolls;
        const rerollBtn = document.getElementById('btnReroll');
        rerollBtn.disabled = this.player.rerolls <= 0;
        rerollBtn.onclick = () => {
            if (this.player.rerolls > 0) {
                this.player.rerolls--;
                this._generateUpgradeCards();
            }
        };

        for (const card of cards) {
            const el = document.createElement('div');
            el.className = `upgrade-card card-rarity-${card.rarity}`;
            el.innerHTML = `
                <div class="card-icon">${card.icon}</div>
                <div class="card-name">${card.name}</div>
                <div class="card-desc">${card.desc}</div>
            `;
            el.onclick = () => this._selectCard(card);
            container.appendChild(el);
        }
    },

    _selectCard(card) {
        const p = this.player;

        switch (card.type) {
            case 'weaponUp':
                p.upgradeWeapon(card.weaponId);
                break;
            case 'newWeapon':
                p.addWeapon(card.weaponId);
                break;
            case 'passive':
                card.passive.effect();
                break;
            case 'evolution':
                // Apply evolution effect (simplified - boost the weapon significantly)
                const evo = card.evolution;
                for (const wid of evo.requires) {
                    const w = p.weapons.find(w => w.id === wid);
                    if (w) {
                        w.evolved = true;
                        w.def = { ...w.def, damage: w.def.damage * 3, range: w.def.range * 1.5 };
                    }
                }
                FloatingTexts.add(p.x, p.y - 40, `进化: ${evo.name}!`, '#FFD700', 26, 2);
                Camera.shake(8, 0.4);
                break;
        }

        document.getElementById('upgradeScreen').style.display = 'none';
        this.state = 'playing';
    },

    endGame(victory) {
        this.state = 'gameover';
        this.victory = victory;

        const goldEarned = Math.floor(this.gameTime * 0.5 + this.player.kills * 0.2);
        this.meta.gold += goldEarned;
        this.saveMeta();

        // Show game over screen
        const screen = document.getElementById('gameOver');
        screen.style.display = 'flex';

        const title = document.getElementById('resultTitle');
        title.textContent = victory ? '胜利!' : '游戏结束';
        title.className = 'gameover-title' + (victory ? ' victory' : '');

        document.getElementById('statTime').textContent = Utils.formatTime(this.gameTime);
        document.getElementById('statKills').textContent = this.player.kills;
        document.getElementById('statChain').textContent = this.player.maxChain;
        document.getElementById('statGold').textContent = goldEarned;
    },

    // Rendering
    render(ctx, canvas) {
        const w = canvas.width;
        const h = canvas.height;

        ctx.save();
        ctx.translate(Camera.shakeX, Camera.shakeY);

        // Background
        ctx.fillStyle = CONFIG.BG_COLOR;
        ctx.fillRect(0, 0, w, h);

        // Grid lines
        this._renderGrid(ctx);

        // Map boundary
        this._renderBoundary(ctx);

        // Health pickups
        for (const hp of this.healthPickups) hp.render(ctx);

        // EXP gems
        for (const gem of this.expGems) gem.render(ctx);

        // Enemies
        for (const enemy of this.enemies) enemy.render(ctx);

        // Projectiles
        for (const proj of this.projectiles) proj.render(ctx);

        // Particles
        Particles.render(ctx);

        // Player
        if (this.player) this.player.render(ctx);

        // Floating texts
        FloatingTexts.render(ctx);

        ctx.restore();

        // HUD (screen space)
        if (this.state === 'playing' || this.state === 'upgrading') {
            this._renderHUD(ctx, w, h);
        }

        // Touch joystick indicator
        if (Input.touch.active) {
            this._renderJoystick(ctx);
        }

        // Damage vignette
        if (this.player && this.player.hp < this.player.maxHp * 0.3) {
            const alpha = (1 - this.player.hp / (this.player.maxHp * 0.3)) * 0.3;
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
            ctx.fillRect(0, 0, w, h);
        }
    },

    _renderGrid(ctx) {
        const gridSize = CONFIG.TILE_SIZE;
        const startX = Math.floor(Camera.x / gridSize) * gridSize;
        const startY = Math.floor(Camera.y / gridSize) * gridSize;

        ctx.strokeStyle = CONFIG.GRID_COLOR;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;

        for (let x = startX; x < Camera.x + Camera.width + gridSize; x += gridSize) {
            const sp = Camera.worldToScreen(x, 0);
            ctx.beginPath();
            ctx.moveTo(sp.x, 0);
            ctx.lineTo(sp.x, Camera.height);
            ctx.stroke();
        }
        for (let y = startY; y < Camera.y + Camera.height + gridSize; y += gridSize) {
            const sp = Camera.worldToScreen(0, y);
            ctx.beginPath();
            ctx.moveTo(0, sp.y);
            ctx.lineTo(Camera.width, sp.y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    },

    _renderBoundary(ctx) {
        const tl = Camera.worldToScreen(0, 0);
        const br = Camera.worldToScreen(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT);
        ctx.strokeStyle = '#ff444466';
        ctx.lineWidth = 3;
        ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
    },

    _renderHUD(ctx, w, h) {
        const p = this.player;
        if (!p) return;

        const padding = 15;
        const barW = 200;
        const barH = 16;

        // Semi-transparent top bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, w, 70);

        // HP bar
        ctx.fillStyle = '#333';
        ctx.fillRect(padding, padding, barW, barH);
        const hpPct = p.hp / p.maxHp;
        ctx.fillStyle = hpPct > 0.5 ? CONFIG.HP_RED : hpPct > 0.2 ? '#ff8800' : '#ff0000';
        ctx.fillRect(padding, padding, barW * hpPct, barH);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.strokeRect(padding, padding, barW, barH);

        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`HP: ${Math.ceil(p.hp)}/${p.maxHp}`, padding + 5, padding + 12);

        // EXP bar
        const expY = padding + barH + 5;
        ctx.fillStyle = '#333';
        ctx.fillRect(padding, expY, barW, barH - 4);
        ctx.fillStyle = CONFIG.EXP_COLOR;
        ctx.fillRect(padding, expY, barW * (p.exp / p.expToLevel), barH - 4);
        ctx.strokeStyle = '#555';
        ctx.strokeRect(padding, expY, barW, barH - 4);

        ctx.fillStyle = '#fff';
        ctx.font = '11px sans-serif';
        ctx.fillText(`Lv.${p.level}  EXP: ${Math.floor(p.exp)}/${p.expToLevel}`, padding + 5, expY + 10);

        // Timer
        const timeLeft = Math.max(0, CONFIG.LEVEL_DURATION - this.gameTime);
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillStyle = timeLeft < 60 ? '#ff4444' : '#ffffff';
        ctx.fillText(Utils.formatTime(this.gameTime), w - padding, padding + 16);

        // Phase label
        const t = this.gameTime;
        let phase = '';
        if (t < 120) phase = '热身期';
        else if (t < 300) phase = '建设期';
        else if (t < 480) phase = '压力期';
        else if (t < 720) phase = '狂潮期';
        else if (t < 840) phase = '精英期';
        else phase = 'BOSS战';

        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#888';
        ctx.fillText(phase, w - padding, padding + 34);

        // Chain record
        ctx.font = '14px sans-serif';
        ctx.fillStyle = CONFIG.INFECTION_GREEN;
        ctx.fillText(`感染链: ${p.maxChain}`, w - padding, padding + 52);

        // Kill count
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'left';
        ctx.font = '12px sans-serif';
        ctx.fillText(`击杀: ${p.kills}`, padding, padding + 58);

        // Weapon slots at bottom
        const slotSize = 40;
        const slotGap = 6;
        const totalSlotW = CONFIG.MAX_WEAPONS * (slotSize + slotGap);
        const slotStartX = (w - totalSlotW) / 2;
        const slotY = h - slotSize - padding;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(slotStartX - 5, slotY - 5, totalSlotW + 10, slotSize + 10);

        for (let i = 0; i < CONFIG.MAX_WEAPONS; i++) {
            const sx = slotStartX + i * (slotSize + slotGap);
            ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1;
            ctx.fillRect(sx, slotY, slotSize, slotSize);
            ctx.strokeRect(sx, slotY, slotSize, slotSize);

            if (i < p.weapons.length) {
                const w = p.weapons[i];
                ctx.font = '20px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(w.def.icon, sx + slotSize / 2, slotY + slotSize / 2 + 6);

                // Level indicator
                ctx.font = '10px sans-serif';
                ctx.fillStyle = w.evolved ? '#FFD700' : '#39FF14';
                ctx.fillText(`Lv.${w.level}`, sx + slotSize / 2, slotY + slotSize - 3);

                // Cooldown overlay
                if (w.cooldown > 0) {
                    const cdPct = w.cooldown / p.getWeaponFireRate(w);
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx.fillRect(sx, slotY + slotSize * (1 - cdPct), slotSize, slotSize * cdPct);
                }
            }
        }

        // Enemy count
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'left';
        ctx.fillText(`敌人: ${this.enemies.length}`, padding, h - padding);
    },

    _renderJoystick(ctx) {
        const t = Input.touch;
        // Base
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(t.startX, t.startY, 50, 0, Math.PI * 2);
        ctx.stroke();

        // Stick
        const dx = t.currentX - t.startX;
        const dy = t.currentY - t.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 40;
        const factor = Math.min(dist, maxDist);
        const angle = Math.atan2(dy, dx);
        const sx = t.startX + Math.cos(angle) * factor;
        const sy = t.startY + Math.sin(angle) * factor;

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(sx, sy, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    },

    // Upgrade tree UI
    showUpgradeTree() {
        const screen = document.getElementById('upgradeTree');
        screen.style.display = 'flex';
        document.getElementById('goldDisplay').textContent = `金币: ${this.meta.gold}`;

        const grid = document.getElementById('treeGrid');
        grid.innerHTML = '';

        const nodes = [
            { key: 'hp', name: 'HP强化', icon: '❤️', cost: [50, 100, 200], max: 3, desc: 'HP上限+5/级' },
            { key: 'speed', name: '移速强化', icon: '💨', cost: [50, 100, 200], max: 3, desc: '移速+5%/级' },
            { key: 'exp', name: 'EXP效率', icon: '💎', cost: [60, 120, 250], max: 3, desc: 'EXP获取+10%/级' },
            { key: 'magnet', name: '磁吸范围', icon: '🧲', cost: [40, 80, 160], max: 3, desc: '磁吸+10/级' },
            { key: 'damage', name: '伤害强化', icon: '⚔️', cost: [80, 160, 300], max: 3, desc: '伤害+5%/级' },
            { key: 'armor', name: '护甲', icon: '🛡️', cost: [100, 200, 400], max: 3, desc: '减伤+1/级' },
        ];

        for (const node of nodes) {
            const level = this.meta[node.key] || 0;
            const maxed = level >= node.max;
            const cost = maxed ? '已满' : `${node.cost[level]} 金币`;

            const el = document.createElement('div');
            el.className = `tree-node ${maxed ? 'maxed' : ''}`;
            el.innerHTML = `
                <div class="tree-node-icon">${node.icon}</div>
                <div class="tree-node-name">${node.name}</div>
                <div class="tree-node-level">Lv.${level}/${node.max}</div>
                <div class="tree-node-cost">${cost}</div>
            `;

            if (!maxed) {
                el.onclick = () => {
                    const c = node.cost[level];
                    if (this.meta.gold >= c) {
                        this.meta.gold -= c;
                        this.meta[node.key] = level + 1;
                        this.saveMeta();
                        this.showUpgradeTree();
                    }
                };
            }

            grid.appendChild(el);
        }
    }
};
