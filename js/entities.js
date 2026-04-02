// ====================================
// 🪔 DIWALI RUNNER — Enemies & Collectibles
// ====================================

// --- COLLECTIBLE: Laddoo (Sweet) ---
class Laddoo {
    constructor(x, y, bonus = false) {
        this.x = x; this.y = y;
        this.baseY = y;
        this.w = 18; this.h = 18;
        this.bonus = bonus;
        this.collected = false;
        this.frame = rand(0, Math.PI * 2);
        this.value = bonus ? 50 : 10;
    }

    update() {
        if (this.collected) return;
        this.frame += 0.05;
        this.y = this.baseY + Math.sin(this.frame) * 5;
    }

    draw(ctx, cx, cy) {
        if (this.collected) return;
        const sx = this.x - cx;
        const sy = this.y - cy;
        if (sx < -30 || sx > CW + 30) return;

        const r = this.bonus ? 10 : 8;
        const glow = 0.6 + 0.4 * Math.sin(this.frame * 2);

        // Glow
        ctx.globalAlpha = glow * 0.4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.bonus ? PAL.crimson : PAL.gold;
        ctx.fillStyle = this.bonus ? PAL.crimson : PAL.gold;
        ctx.beginPath();
        ctx.arc(sx + this.w / 2, sy + this.h / 2, r + 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Laddoo body
        ctx.fillStyle = this.bonus ? '#FF1744' : '#E8A317';
        ctx.beginPath();
        ctx.arc(sx + this.w / 2, sy + this.h / 2, r, 0, Math.PI * 2);
        ctx.fill();

        // Texture dots (boondi texture)
        ctx.fillStyle = this.bonus ? '#FF5252' : '#D4941A';
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            const dx = Math.cos(a) * r * 0.5;
            const dy = Math.sin(a) * r * 0.5;
            ctx.beginPath();
            ctx.arc(sx + this.w / 2 + dx, sy + this.h / 2 + dy, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(sx + this.w / 2 - 2, sy + this.h / 2 - 2, r * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Silver vark on bonus
        if (this.bonus) {
            ctx.fillStyle = 'rgba(192,192,192,0.5)';
            ctx.beginPath();
            ctx.arc(sx + this.w / 2, sy + this.h / 2, r * 0.6, -0.5, 1);
            ctx.fill();
        }
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}

// --- ENEMY: Ground Cracker ---
class GroundCracker {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.w = 20; this.h = 28;
        this.frame = 0;
        this.alive = true;
    }

    update() {
        this.frame++;
    }

    draw(ctx, cx, cy) {
        if (!this.alive) return;
        const sx = this.x - cx;
        const sy = this.y - cy;
        if (sx < -40 || sx > CW + 40) return;

        const sparkle = Math.sin(this.frame * 0.15);

        // Cracker body (cylindrical)
        ctx.fillStyle = '#CC0000';
        ctx.fillRect(sx + 3, sy + 4, 14, this.h - 4);

        // Stripes
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(sx + 3, sy + 8, 14, 3);
        ctx.fillRect(sx + 3, sy + 16, 14, 3);
        ctx.fillRect(sx + 3, sy + 24, 14, 3);

        // Fuse at top
        ctx.strokeStyle = '#8B8B8B';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx + 10, sy + 4);
        ctx.quadraticCurveTo(sx + 12 + sparkle * 2, sy - 3, sx + 10, sy - 6);
        ctx.stroke();

        // Spark at fuse tip
        const sp = 0.5 + 0.5 * sparkle;
        ctx.fillStyle = PAL.gold;
        ctx.shadowBlur = 8;
        ctx.shadowColor = PAL.gold;
        ctx.globalAlpha = sp;
        ctx.beginPath();
        ctx.arc(sx + 10, sy - 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }

    getBounds() {
        return { x: this.x + 2, y: this.y + 2, w: this.w - 4, h: this.h - 2 };
    }
}

// --- ENEMY: Rocket ---
class Rocket {
    constructor(x, y, dir = 'left', speed = 2.5) {
        this.x = x; this.y = y;
        this.startX = x;
        this.w = 30; this.h = 14;
        this.dir = dir;
        this.speed = speed;
        this.frame = 0;
        this.alive = true;
        this.range = 300;
    }

    update() {
        if (!this.alive) return;
        this.frame++;
        if (this.dir === 'left') {
            this.x -= this.speed;
            if (this.x < this.startX - this.range) this.dir = 'right';
        } else {
            this.x += this.speed;
            if (this.x > this.startX + this.range) this.dir = 'left';
        }
    }

    draw(ctx, cx, cy) {
        if (!this.alive) return;
        const sx = this.x - cx;
        const sy = this.y - cy;
        if (sx < -50 || sx > CW + 50) return;

        const f = this.dir === 'left' ? -1 : 1;

        ctx.save();
        ctx.translate(sx + this.w / 2, sy + this.h / 2);
        ctx.scale(f, 1);

        // Rocket body
        ctx.fillStyle = '#E53935';
        ctx.beginPath();
        ctx.moveTo(-this.w / 2, -this.h / 2 + 2);
        ctx.lineTo(this.w / 2 - 4, -this.h / 2 + 2);
        ctx.lineTo(this.w / 2, 0);
        ctx.lineTo(this.w / 2 - 4, this.h / 2 - 2);
        ctx.lineTo(-this.w / 2, this.h / 2 - 2);
        ctx.closePath();
        ctx.fill();

        // Nose cone
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(this.w / 2 - 4, -this.h / 2 + 2);
        ctx.lineTo(this.w / 2 + 2, 0);
        ctx.lineTo(this.w / 2 - 4, this.h / 2 - 2);
        ctx.closePath();
        ctx.fill();

        // Stripe
        ctx.fillStyle = PAL.gold;
        ctx.fillRect(-5, -2, 10, 4);

        // Fins
        ctx.fillStyle = '#B71C1C';
        ctx.beginPath();
        ctx.moveTo(-this.w / 2, -this.h / 2 + 2);
        ctx.lineTo(-this.w / 2 - 5, -this.h / 2 - 3);
        ctx.lineTo(-this.w / 2 + 4, -this.h / 2 + 2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-this.w / 2, this.h / 2 - 2);
        ctx.lineTo(-this.w / 2 - 5, this.h / 2 + 3);
        ctx.lineTo(-this.w / 2 + 4, this.h / 2 - 2);
        ctx.closePath();
        ctx.fill();

        // Exhaust flame
        const flicker = rand(0.7, 1.3);
        ctx.fillStyle = PAL.saffron;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(-this.w / 2, -3);
        ctx.lineTo(-this.w / 2 - 12 * flicker, 0);
        ctx.lineTo(-this.w / 2, 3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = PAL.gold;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(-this.w / 2, -1.5);
        ctx.lineTo(-this.w / 2 - 8 * flicker, 0);
        ctx.lineTo(-this.w / 2, 1.5);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.restore();
    }

    getBounds() {
        return { x: this.x + 2, y: this.y + 1, w: this.w - 4, h: this.h - 2 };
    }
}

// --- ENEMY: Exploding Trap ---
class ExplodingTrap {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.w = 22; this.h = 22;
        this.frame = 0;
        this.alive = true;
        this.timer = randInt(120, 240);
        this.maxTimer = this.timer;
        this.exploding = false;
        this.explodeFrame = 0;
        this.dangerRadius = 50;
    }

    update(particles) {
        if (!this.alive) return;
        this.frame++;
        this.timer--;

        if (this.timer <= 0 && !this.exploding) {
            this.exploding = true;
            this.explodeFrame = 0;
            if (particles) {
                particles.burst(
                    this.x + this.w / 2, this.y + this.h / 2,
                    30, [PAL.crimson, PAL.saffron, PAL.gold, PAL.white],
                    2, 6, 20, 50, 1.5, 4, 0.05, true
                );
            }
            audio.explosion();
        }

        if (this.exploding) {
            this.explodeFrame++;
            if (this.explodeFrame > 40) {
                this.exploding = false;
                this.timer = this.maxTimer;
            }
        }
    }

    draw(ctx, cx, cy) {
        if (!this.alive) return;
        const sx = this.x - cx;
        const sy = this.y - cy;
        if (sx < -50 || sx > CW + 50) return;

        if (this.exploding) {
            // Explosion flash
            const progress = this.explodeFrame / 40;
            const radius = this.dangerRadius * (1 - progress);
            ctx.globalAlpha = 1 - progress;
            ctx.fillStyle = PAL.saffron;
            ctx.shadowBlur = 20;
            ctx.shadowColor = PAL.saffron;
            ctx.beginPath();
            ctx.arc(sx + this.w / 2, sy + this.h / 2, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            return;
        }

        // Warning flash when about to explode
        const warning = this.timer < 60;
        const flash = warning ? Math.sin(this.frame * 0.3) > 0 : false;

        // Bomb body
        ctx.fillStyle = flash ? '#FF4444' : '#333';
        ctx.beginPath();
        ctx.arc(sx + this.w / 2, sy + this.h / 2 + 2, 10, 0, Math.PI * 2);
        ctx.fill();

        // Band
        ctx.fillStyle = flash ? '#FF8888' : '#666';
        ctx.fillRect(sx + 4, sy + this.h / 2 - 1, this.w - 8, 4);

        // Fuse
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx + this.w / 2, sy + 3);
        ctx.quadraticCurveTo(sx + this.w / 2 + 5, sy - 4, sx + this.w / 2 + 2, sy - 8);
        ctx.stroke();

        // Fuse spark
        if (warning || chance(0.3)) {
            ctx.fillStyle = PAL.gold;
            ctx.shadowBlur = 6;
            ctx.shadowColor = PAL.gold;
            ctx.beginPath();
            ctx.arc(sx + this.w / 2 + 2, sy - 8, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Timer indicator
        if (warning) {
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 10px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('!', sx + this.w / 2, sy - 10);
        }
    }

    getBounds() {
        if (this.exploding && this.explodeFrame < 15) {
            const r = this.dangerRadius;
            return {
                x: this.x + this.w / 2 - r,
                y: this.y + this.h / 2 - r,
                w: r * 2, h: r * 2
            };
        }
        return { x: this.x + 2, y: this.y + 2, w: this.w - 4, h: this.h - 4 };
    }
}
