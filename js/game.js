/**
 * Game Logic: Merge Hell (Fixed God Mode Persistence)
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 游戏初始化与配置 ---
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = document.getElementById('game-container');

    // UI 元素引用
    const ui = {
        score: document.getElementById('score-val'),
        playerHp: document.getElementById('player-hp'),
        bossHud: document.getElementById('boss-hud'),
        bossName: document.getElementById('boss-name'),
        bossHp: document.getElementById('boss-hp'),
        sudoTag: document.getElementById('sudo-tag'),
        shieldTag: document.getElementById('shield-tag'),
        terminal: document.getElementById('terminal'),
        levelName: document.getElementById('level-name'),
        screens: {
            start: document.getElementById('start-screen'),
            gameOver: document.getElementById('game-over-screen'),
            levelClear: document.getElementById('level-clear-screen')
        },
        warning: document.getElementById('warning-flash')
    };

    // 游戏常量配置
    const CONFIG = {
        gravity: 0.5,
        jumpForce: -10,
        groundY: 400,
        playerSpeed: 5,
        bossApproachX: 200,
        colors: {
            player: '#00fff2',
            boss: '#ff0055',
            text: '#bcbec4',
            shield: '#8be9fd',
            string: '#50fa7b',
            gold: '#f1fa8c'
        }
    };

    // 关卡设计
    const LEVELS = [
        {
            name: "Merge Hell",
            bg: '#1a1a1d',
            bossName: "⚠️ LEGACY CODE MONSTROSITY",
            bossHP: 2000,
            runDuration: 1000,
            enemyWeights: [{ type: 'conflict', weight: 4 }, { type: 'bug', weight: 5 }, { type: 'techdebt', weight: 1 }]
        },
        {
            name: "Runtime Inferno",
            bg: '#2b1a1c',
            bossName: "💀 MEMORY LEAK DAEMON",
            bossHP: 3500,
            runDuration: 1500,
            enemyWeights: [{ type: 'crash', weight: 5 }, { type: 'lock', weight: 3 }, { type: 'bug', weight: 2 }]
        },
        {
            name: "Final Frontier",
            bg: '#0f172a',
            bossName: "👑 THE ARCHITECT",
            bossHP: 5000,
            runDuration: 2000,
            enemyWeights: [{ type: 'firewall', weight: 4 }, { type: 'crash', weight: 2 }, { type: 'conflict', weight: 2 }, { type: 'techdebt', weight: 1 }]
        }
    ];

    // 输入状态
    const input = { left: false, right: false, jump: false, shoot: false };

    // 游戏全局状态
    let gameLoopId = null;
    let state = {
        mode: 'MENU',
        frames: 0,
        score: 0,
        shake: 0,
        level: 0,
        bossTriggerScore: 0,
        godMode: false, // [关键修复] 新增全局作弊状态标志
        currentLevelConfig: LEVELS[0]
    };

    // 响应式画布调整
    function resize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        CONFIG.groundY = canvas.height - 50;
        if (player) player.y = Math.min(player.y, CONFIG.groundY - player.h);
    }
    window.addEventListener('resize', resize);

    function log(msg, type = 'info') {
        if (!ui.terminal) return;
        const div = document.createElement('div');
        div.className = `log-item ${type}`;
        const time = new Date().toLocaleTimeString('en-US', {hour12:false});
        div.innerText = `[${time}] ${msg}`;
        ui.terminal.prepend(div);
        if(ui.terminal.children.length > 20) ui.terminal.lastChild.remove();
    }

    // --- 实体类定义 ---

    class FloatingText {
        constructor(x, y, text, color) { this.x = x; this.y = y; this.text = text; this.color = color; this.life = 1.0; this.vy = -2; }
        update() { this.y += this.vy; this.life -= 0.03; }
        draw() {
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.fillStyle = this.color;
            ctx.font = 'bold 16px Arial';
            ctx.fillText(this.text, this.x, this.y);
            ctx.globalAlpha = 1;
        }
    }

    class Player {
        constructor() {
            this.w = 30; this.h = 30;
            this.x = 100; this.y = CONFIG.groundY - 100;
            this.dy = 0; this.grounded = false;
            this.hp = 100; this.maxHp = 100;
            this.lastShot = 0; this.cooldown = 25;
            this.sudoMode = 0; this.shieldTime = 0; this.invincibleFrame = 0;
        }
        update() {
            if (input.left) this.x -= CONFIG.playerSpeed;
            if (input.right) this.x += CONFIG.playerSpeed;
            if (this.x < 0) this.x = 0;
            if (this.x > canvas.width - this.w) this.x = canvas.width - this.w;

            this.dy += CONFIG.gravity;
            this.y += this.dy;

            if (this.y + this.h > CONFIG.groundY) {
                this.y = CONFIG.groundY - this.h;
                this.dy = 0;
                this.grounded = true;
            } else {
                this.grounded = false;
            }

            if (input.jump && this.grounded) {
                this.dy = CONFIG.jumpForce;
                input.jump = false;
            }

            if (input.shoot) this.shoot();

            if (this.invincibleFrame > 0) this.invincibleFrame--;

            this.cooldown = 25;
            if (this.sudoMode > 0) {
                // 如果是无限模式(God Mode开启时赋予的超大值)，则不倒计时
                if (this.sudoMode < 900000) {
                    this.sudoMode--;
                }

                ui.sudoTag.style.display = 'block';
                this.cooldown = 8;

                if(this.sudoMode === 0) {
                    ui.sudoTag.style.display = 'none';
                    log("Sudo permissions expired.", "warn");
                }
            } else {
                ui.sudoTag.style.display = 'none';
            }

            if (this.shieldTime > 0) {
                this.shieldTime--;
                ui.shieldTag.style.display = 'block';
                if(this.shieldTime === 0) {
                    ui.shieldTag.style.display = 'none';
                    log("Final shield deprecated.", "warn");
                }
            } else {
                ui.shieldTag.style.display = 'none';
            }
        }
        shoot() {
            if (state.frames - this.lastShot >= this.cooldown) {
                this.lastShot = state.frames;
                const isSudo = this.sudoMode > 0;
                projectiles.push(new Projectile(this.x + this.w, this.y + this.h/2, isSudo ? 12 : 8, isSudo ? 'sudo' : 'commit'));
            }
        }
        takeDamage(amount) {
            // 伤害判断：如果开启了 Shield, 无敌帧, 或者 Sudo Mode，则不受伤害
            if (this.shieldTime > 0 || this.invincibleFrame > 0 || this.sudoMode > 0) return;

            this.hp -= amount;
            this.invincibleFrame = 60;
            state.shake = 10;
            ui.playerHp.style.width = Math.max(0, (this.hp / this.maxHp * 100)) + '%';
            container.parentElement.classList.add('glitch-active');
            setTimeout(() => container.parentElement.classList.remove('glitch-active'), 200);
            if (this.hp <= 0) endGame("FATAL ERROR: Integrity Compromised");
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            if (this.invincibleFrame > 0 && Math.floor(state.frames / 4) % 2 === 0) ctx.globalAlpha = 0.5;
            ctx.fillStyle = this.sudoMode > 0 ? CONFIG.colors.gold : CONFIG.colors.player;
            ctx.beginPath();
            ctx.roundRect(0, 0, this.w, this.h, 5);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 20px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('J', this.w/2, this.h/2);
            if (this.shieldTime > 0) {
                ctx.strokeStyle = CONFIG.colors.shield;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.w/2, this.h/2, 25 + Math.sin(state.frames * 0.2)*2, 0, Math.PI*2);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    class Boss {
        constructor(config) {
            this.w = 120; this.h = 150;
            this.x = canvas.width + 200; this.y = 150;
            this.targetX = canvas.width - CONFIG.bossApproachX;
            this.hp = config.bossHP; this.maxHp = config.bossHP;
            this.active = false; this.floatOffset = 0;
            this.actionTimer = 0;
            this.symbol = config.bossName.split(' ')[0];
            this.name = config.bossName;
            this.level = state.level;
            this.powerupTimer = 0;
        }
        activate() {
            this.active = true;
            ui.bossHud.style.display = 'flex';
            log(`WARNING: ${this.name} HAS APPEARED!`, "err");
            ui.warning.style.animation = "warning-pulse 1s 3";
        }
        update() {
            if (!this.active) return;
            if (this.x > this.targetX) {
                this.x -= 2;
            } else {
                this.floatOffset += 0.03 + (this.level * 0.01);
                this.y = 150 + Math.sin(this.floatOffset) * 50;
                this.actionTimer++;
                const attackRate = Math.max(80, 150 - this.level * 20);
                if (this.actionTimer > attackRate) {
                    this.attack();
                    this.actionTimer = 0;
                }
                this.powerupTimer++;
                if (this.powerupTimer > 400) {
                    this.dropPowerup();
                    this.powerupTimer = 0;
                }
            }
        }
        dropPowerup() {
            const type = Math.random() > 0.5 ? 'powerup_sudo' : 'powerup_shield';
            enemies.push(new Enemy(this.x, this.y + 100, type));
            log("Boss dropped a leaked resource!", "info");
        }
        attack() {
            if (this.level === 0) {
                const r = Math.random();
                if (r < 0.3) enemies.push(new Enemy(this.x, CONFIG.groundY - 100, 'techdebt'));
                else if (r < 0.6) enemies.push(new Enemy(this.x, this.y + 75, 'null'));
                else enemies.push(new Enemy(this.x, CONFIG.groundY - 40, 'conflict'));
            } else if (this.level === 1) {
                if (Math.random() < 0.5) enemies.push(new Enemy(this.x, this.y + 50, 'crash'));
                else enemies.push(new Enemy(this.x, CONFIG.groundY - 40, 'lock'));
            } else if (this.level === 2) {
                if (Math.random() < 0.3) enemies.push(new Enemy(this.x, canvas.height/2, 'firewall'));
                else for(let i=0; i<3; i++) enemies.push(new Enemy(this.x, CONFIG.groundY - (i*50) - 40, 'crash'));
            }
        }
        takeDamage(amount) {
            if (!this.active) return;
            this.hp -= amount;
            ui.bossHp.style.width = Math.max(0, (this.hp / this.maxHp * 100)) + '%';
            texts.push(new FloatingText(this.x + this.w/2 + (Math.random()-0.5)*50, this.y + this.h/2, "-" + amount, "#fff"));
            if (this.hp <= 0) this.die();
        }
        die() {
            this.active = false;
            ui.bossHud.style.display = 'none';
            createMegaExplosion(this.x + this.w/2, this.y + this.h/2, CONFIG.colors.boss);
            const nextLevel = state.level + 1;
            if (nextLevel < LEVELS.length) {
                state.mode = 'LEVEL_CLEAR';
                log(`LEVEL ${nextLevel} UNLOCKED. Preparing next environment...`, "gold");
                ui.screens.levelClear.style.display = 'flex';
                document.getElementById('lc-msg').innerText = `Module ${state.level + 1} Refactored. Preparing Level ${nextLevel + 1}: ${LEVELS[nextLevel].name}...`;
                setTimeout(() => { state.level = nextLevel; startLevel(); }, 3000);
            } else {
                state.mode = 'VICTORY';
                log("ALL REFACTORING COMPLETE. PROJECT DEPLOYED.", "gold");
                setTimeout(() => endGame("TOTAL VICTORY: Project Deployed"), 3000);
            }
        }
        draw() {
            if (!this.active && this.x > canvas.width) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillStyle = CONFIG.colors.boss;
            ctx.fillRect(0, 0, 120, 150);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 80px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.symbol, 60, 75);
            ctx.restore();
        }
    }

    class Projectile {
        constructor(x, y, speed, type) {
            this.x = x; this.y = y; this.speed = speed; this.type = type;
            this.w = type === 'sudo' ? 60 : 30; this.h = type === 'sudo' ? 15 : 10;
            this.dead = false; this.damage = type === 'sudo' ? 80 : 20;
        }
        update() {
            this.x += this.speed;
            if (this.x > canvas.width) this.dead = true;
        }
        draw() {
            ctx.fillStyle = this.type === 'sudo' ? CONFIG.colors.gold : CONFIG.colors.string;
            ctx.font = this.type === 'sudo' ? 'bold 16px monospace' : '12px monospace';
            ctx.fillText(this.type === 'sudo' ? 'rm -rf' : 'push', this.x, this.y);
        }
    }

    class Enemy {
        constructor(x, y, type) {
            this.x = x; this.y = y; this.type = type; this.dead = false;
            this.initialY = y; this.frames = 0;
            this.w = 40; this.h = 40; this.vx = 3 + (state.level * 0.5); this.damage = 20;

            if (type === 'conflict' || type === 'techdebt' || type === 'lock') {
                this.y = CONFIG.groundY - 40;
                if (type === 'techdebt') this.y = CONFIG.groundY - 80;
                this.initialY = this.y;
            }
            if (type === 'firewall') this.y = 0;

            if (type === 'conflict') { this.color = '#cf8e6d'; this.symbol = '<<HEAD'; }
            else if (type === 'bug') { this.color = CONFIG.colors.boss; this.symbol = '🐛'; }
            else if (type === 'techdebt') { this.w = 60; this.h = 80; this.vx = 2; this.color = '#5c6370'; this.symbol = 'TODO'; this.damage = 30;}
            else if (type === 'crash') { this.w = 50; this.h = 50; this.vx = 5 + (state.level*1); this.color = '#ff9800'; this.symbol = '💥'; this.damage = 40; }
            else if (type === 'lock') { this.color = '#4caf50'; this.symbol = '🔒'; }
            else if (type === 'firewall') { this.w = 80; this.h = 150; this.vx = 1.5; this.color = '#1e88e5'; this.symbol = '🔥'; this.damage = 50;}
            else if (type === 'powerup_sudo') { this.color = CONFIG.colors.gold; this.symbol = '⚡'; this.w = 30; this.h = 30;}
            else if (type === 'powerup_shield') { this.color = CONFIG.colors.shield; this.symbol = '🛡️'; this.w = 30; this.h = 30;}
        }
        update() {
            this.frames++;
            this.x -= this.vx;
            if (this.type === 'lock') this.y = this.initialY + Math.sin(this.frames * 0.1) * 30;
            if (this.x + this.w < -100) this.dead = true;
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            if (this.type === 'firewall') {
                ctx.fillStyle = this.color; ctx.fillRect(0, 0, this.w, this.h);
                ctx.fillStyle = '#fff'; ctx.font = 'bold 20px monospace'; ctx.fillText('FIREWALL', 5, 20);
            } else if (this.type === 'techdebt') {
                ctx.fillStyle = this.color; ctx.fillRect(0, 0, this.w, this.h);
                ctx.fillStyle = '#fff'; ctx.font = '12px monospace'; ctx.fillText('//TODO', 5, 20);
            } else {
                ctx.fillStyle = this.color; ctx.font = '24px monospace'; ctx.fillText(this.symbol, 0, 24);
            }
            ctx.restore();
        }
    }

    class Particle {
        constructor(x, y, color, vx, vy, lifeDecay = 0.05) {
            this.x = x; this.y = y;
            this.vx = vx || (Math.random()-0.5) * 10;
            this.vy = vy || (Math.random()-0.5) * 10;
            this.life = 1.0; this.color = color; this.lifeDecay = lifeDecay;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            this.vy += 0.2; this.life -= this.lifeDecay;
        }
        draw() {
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, 4, 4);
            ctx.globalAlpha = 1;
        }
    }

    // --- 游戏主流程控制 ---

    let player = new Player();
    let boss = new Boss(LEVELS[0]);
    let projectiles = [], enemies = [], particles = [], texts = [];

    function createMegaExplosion(x, y, color) {
        ui.warning.style.backgroundColor = '#fff';
        ui.warning.style.animation = "warning-pulse 0.2s 5";
        setTimeout(() => { ui.warning.style.animation = 'none'; }, 1000);
        for(let i=0; i<300; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 15 + 5;
            particles.push(new Particle(x, y, i % 3 === 0 ? CONFIG.colors.gold : (i % 3 === 1 ? CONFIG.colors.player : color), Math.cos(angle) * speed, Math.sin(angle) * speed, 0.02 + Math.random()*0.01));
        }
        state.shake = 30;
    }

    function spawnManager() {
        const currentLevel = state.currentLevelConfig;
        if (state.score >= state.bossTriggerScore && state.mode === 'RUNNING') {
            state.mode = 'BOSS_WARNING';
            log("ANOMALY DETECTED. STOPPING SCROLL...", "warn");
            setTimeout(() => {
                state.mode = 'BOSS_FIGHT';
                boss.activate();
            }, 2000);
            return;
        }
        if (state.mode === 'RUNNING' && state.frames % 80 === 0) {
            let totalWeight = currentLevel.enemyWeights.reduce((sum, item) => sum + item.weight, 0);
            let random = Math.random() * totalWeight;
            let enemyType = 'bug';
            for (const item of currentLevel.enemyWeights) {
                if (random < item.weight) { enemyType = item.type; break; }
                random -= item.weight;
            }
            const r = Math.random();
            if (r < 0.04) enemies.push(new Enemy(canvas.width, CONFIG.groundY - 150, 'powerup_sudo'));
            else if (r < 0.08) enemies.push(new Enemy(canvas.width, CONFIG.groundY - 150, 'powerup_shield'));
            else enemies.push(new Enemy(canvas.width, CONFIG.groundY - 100 - Math.random()*100, enemyType));
        }
    }

    function checkCollisions() {
        const pRect = {x: player.x, y: player.y, w: player.w, h: player.h};
        enemies.forEach(e => {
            if (e.dead) return;
            if (rectIntersect(pRect, {x: e.x, y: e.y, w: e.w, h: e.h})) {
                if (e.type.startsWith('powerup')) {
                    e.dead = true;
                    if (e.type === 'powerup_sudo') {
                        player.sudoMode = 400;
                        log("ROOT ACCESS GRANTED. UNLIMITED POWER.", "warn");
                        texts.push(new FloatingText(player.x, player.y - 20, "SUDO!", CONFIG.colors.gold));
                    } else if (e.type === 'powerup_shield') {
                        player.shieldTime = 400;
                        log("FINAL KEYWORD ADDED. IMMUTABLE.", "info");
                        texts.push(new FloatingText(player.x, player.y - 20, "SHIELD!", CONFIG.colors.shield));
                    }
                } else {
                    // [关键优化] 如果有无敌(Sudo Mode)或护盾，敌人直接爆炸，而不是造成伤害特效
                    if (player.shieldTime > 0 || player.sudoMode > 0) {
                        e.dead = true;
                        // Sudo 模式是金色爆炸，护盾是蓝色爆炸
                        const color = player.sudoMode > 0 ? CONFIG.colors.gold : CONFIG.colors.shield;
                        createExplosion(e.x, e.y, 8, color);
                        // 提示文字
                        if(player.sudoMode > 0) texts.push(new FloatingText(e.x, e.y, "BLOCKED", color));
                    } else {
                        // 正常受伤
                        e.dead = true;
                        player.takeDamage(e.damage);
                        createExplosion(player.x, player.y, 10, '#fff');
                    }
                }
            }
        });

        projectiles.forEach(p => {
            if (p.dead) return;
            const pRect = {x: p.x, y: p.y, w: p.w, h: p.h};
            enemies.forEach(e => {
                if (e.dead || e.type.startsWith('powerup')) return;
                if (rectIntersect(pRect, {x: e.x, y: e.y, w: e.w, h: e.h})) {
                    e.dead = true;
                    state.score += 50;
                    createExplosion(e.x, e.y, 5, e.color);
                    if (p.type !== 'sudo') p.dead = true;
                }
            });
            if (state.mode === 'BOSS_FIGHT' && boss.active) {
                if (rectIntersect(pRect, {x: boss.x, y: boss.y, w: boss.w, h: boss.h})) {
                    p.dead = true;
                    boss.takeDamage(p.damage);
                    createExplosion(p.x, p.y, 3, '#fff');
                }
            }
        });
    }

    function rectIntersect(r1, r2) {
        return !(r2.x > r1.x + r1.w || r2.x + r2.w < r1.x || r2.y > r1.y + r1.h || r2.y + r2.h < r1.y);
    }

    function createExplosion(x, y, count, color) {
        for(let i=0; i<count; i++) particles.push(new Particle(x, y, color));
    }

    function drawBackground() {
        ctx.fillStyle = state.currentLevelConfig.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 255, 242, 0.03)';
        for(let i=0; i<canvas.height; i+=4) ctx.fillRect(0, i, canvas.width, 1);
        ctx.fillStyle = '#2b2d30';
        ctx.font = '14px JetBrains Mono';
        const offset = (state.frames * 1.5) % 200;
        const codes = ["public void suffer() {", "while(alive) {", "git push --force", "try { fix(); }", "catch (Exception e)"];
        for(let i=0; i<canvas.height/30; i++) {
            for(let j=0; j<4; j++) {
                ctx.fillText(codes[i%codes.length], 50 + j*300 - offset, 50 + i*30);
            }
        }
        ctx.fillStyle = '#323232';
        ctx.fillRect(0, CONFIG.groundY, canvas.width, canvas.height - CONFIG.groundY);
        ctx.strokeStyle = '#555';
        ctx.beginPath();
        ctx.moveTo(0, CONFIG.groundY);
        ctx.lineTo(canvas.width, CONFIG.groundY);
        ctx.stroke();
    }

    function loop() {
        if (['GAMEOVER', 'MENU', 'LEVEL_CLEAR', 'VICTORY'].includes(state.mode)) return;
        state.frames++;
        if (state.shake > 0) {
            ctx.save();
            ctx.translate((Math.random()-0.5)*state.shake, (Math.random()-0.5)*state.shake);
            state.shake *= 0.9;
            if(state.shake < 0.5) state.shake = 0;
        }

        player.update();
        if (state.mode === 'RUNNING') spawnManager();
        if (state.mode === 'BOSS_FIGHT') boss.update();
        enemies.forEach(e => e.update());
        projectiles.forEach(p => p.update());
        particles.forEach(p => p.update());
        texts.forEach(t => t.update());

        enemies = enemies.filter(e => !e.dead);
        projectiles = projectiles.filter(p => !p.dead);
        particles = particles.filter(p => p.life > 0);
        texts = texts.filter(t => t.life > 0);

        checkCollisions();
        drawBackground();
        player.draw();
        boss.draw();
        enemies.forEach(e => e.draw());
        projectiles.forEach(p => p.draw());
        particles.forEach(p => p.draw());
        texts.forEach(t => t.draw());

        if (state.mode === 'RUNNING') {
            state.score += 0.5;
            ui.score.innerText = Math.floor(state.score);
        }

        if (state.shake > 0) ctx.restore();
        gameLoopId = requestAnimationFrame(loop);
    }

    function startLevel() {
        Object.values(ui.screens).forEach(screen => screen.style.display = 'none');
        ui.bossHud.style.display = 'none';
        state.currentLevelConfig = LEVELS[state.level];
        state.bossTriggerScore = state.score + state.currentLevelConfig.runDuration;

        player = new Player();
        // [关键修复] 每次开始新关卡或重启时，检查全局 GodMode 状态并应用
        if (state.godMode) {
            player.sudoMode = 999999;
            ui.sudoTag.style.display = 'block';
        }

        boss = new Boss(state.currentLevelConfig);
        enemies = [];
        projectiles = [];
        particles = [];
        texts = [];

        ui.playerHp.style.width = '100%';
        ui.bossHp.style.width = '100%';
        ui.levelName.innerText = `LEVEL ${state.level + 1}: ${state.currentLevelConfig.name}`;
        ui.bossName.innerText = state.currentLevelConfig.bossName;
        container.style.backgroundColor = state.currentLevelConfig.bg;

        log(`LEVEL ${state.level + 1}: ${state.currentLevelConfig.name} - Initializing...`, "sys");
        state.mode = 'RUNNING';
        resize();
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        gameLoopId = requestAnimationFrame(loop);
    }

    function startGame() {
        state.level = 0;
        state.frames = 0;
        state.score = 0;
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
        startLevel();
    }

    function endGame(reason) {
        const lang = localStorage.getItem('site_lang') || 'en';
        const titles = {
            en: { vic: "PROJECT DEPLOYED", fail: "BUILD FAILED" },
            zh: { vic: "项目部署成功", fail: "构建失败" }
        };

        state.mode = reason.includes("VICTORY") ? 'VICTORY' : 'GAMEOVER';
        ui.screens.gameOver.style.display = 'flex';

        const isVic = reason.includes("VICTORY");
        const titleText = isVic ? titles[lang].vic : titles[lang].fail;

        const goTitle = document.getElementById('go-title');
        goTitle.innerText = titleText;

        document.getElementById('go-reason').innerText = reason;
        document.getElementById('final-score').innerText = Math.floor(state.score);

        if (isVic) {
            goTitle.style.color = CONFIG.colors.gold;
            document.getElementById('go-reason').style.color = CONFIG.colors.gold;
        } else {
            goTitle.style.color = CONFIG.colors.boss;
            document.getElementById('go-reason').style.color = CONFIG.colors.boss;
        }
    }

    // --- 事件监听 ---
    window.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if(['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();

        if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true;
        if (e.code === 'Space') {
            input.jump = true;
            if (['MENU', 'GAMEOVER', 'VICTORY'].includes(state.mode)) startGame();
        }
        if (e.code === 'KeyC') input.shoot = true;
    });

    window.addEventListener('keyup', e => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false;
        if (e.code === 'Space') input.jump = false;
        if (e.code === 'KeyC') input.shoot = false;
    });

    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    if (startBtn) startBtn.onclick = startGame;
    if (restartBtn) restartBtn.onclick = startGame;

    // --- [修复 & 升级] 暴露接口给终端使用 ---
    window.gameInstance = {
        // 开启上帝模式
        enableGodMode: function() {
            state.godMode = true; // [关键] 记录状态
            if(player) {
                player.sudoMode = 999999;
                log("TERMINAL INJECTION: GOD MODE ENABLED", "warn");
                texts.push(new FloatingText(player.x, player.y - 40, "HACKED!", CONFIG.colors.gold));
                if(ui && ui.sudoTag) ui.sudoTag.style.display = 'block';
            }
        },
        // 关闭上帝模式
        disableGodMode: function() {
            state.godMode = false; // [关键] 记录状态
            if(player) {
                player.sudoMode = 0;
                log("TERMINAL INJECTION: GOD MODE DISABLED", "info");
                texts.push(new FloatingText(player.x, player.y - 40, "NORMAL", CONFIG.colors.player));
                if(ui && ui.sudoTag) ui.sudoTag.style.display = 'none';
            }
        }
    };

    // 初始化
    resize();
});