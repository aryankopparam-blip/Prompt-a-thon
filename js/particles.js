// ====================================
// 🪔 DIWALI RUNNER — Particle System
// ====================================
class Particle {
    constructor(x, y, vx, vy, color, life, size, grav = 0.04, glow = false) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.color = color;
        this.life = life; this.maxLife = life;
        this.size = size;
        this.grav = grav;
        this.glow = glow;
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.grav;
        this.vx *= 0.99;
        this.life--;
        this.alpha = clamp(this.life / this.maxLife, 0, 1);
        return this.life > 0;
    }

    draw(ctx, cx, cy) {
        const sx = this.x - cx;
        const sy = this.y - cy;
        if (sx < -20 || sx > CW + 20 || sy < -20 || sy > CH + 20) return;
        ctx.globalAlpha = this.alpha;
        if (this.glow) {
            ctx.shadowBlur = this.size * 3;
            ctx.shadowColor = this.color;
        }
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(sx, sy, this.size * this.alpha, 0, Math.PI * 2);
        ctx.fill();
        if (this.glow) ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    add(p) { this.particles.push(p); }

    burst(x, y, count, colors, speedMin, speedMax, lifeMin, lifeMax, sizeMin, sizeMax, grav = 0.04, glow = false) {
        for (let i = 0; i < count; i++) {
            const angle = rand(0, Math.PI * 2);
            const speed = rand(speedMin, speedMax);
            const color = colors[randInt(0, colors.length - 1)];
            this.add(new Particle(
                x, y,
                Math.cos(angle) * speed, Math.sin(angle) * speed,
                color, randInt(lifeMin, lifeMax), rand(sizeMin, sizeMax), grav, glow
            ));
        }
    }

    collectSparkle(x, y) {
        this.burst(x, y, 12, [PAL.gold, PAL.diya, PAL.cream, PAL.white], 1, 3, 15, 30, 1, 3, 0.05, true);
    }

    playerExplosion(x, y) {
        const colors = [PAL.crimson, PAL.saffron, PAL.gold, PAL.orange, '#FF4444', PAL.pink, PAL.white];
        this.burst(x, y, 80, colors, 2, 10, 40, 90, 2, 6, 0.06, true);
        this.burst(x, y, 40, [PAL.gold, PAL.cream], 1, 5, 60, 120, 1, 3, 0.03, true);
    }

    update() {
        this.particles = this.particles.filter(p => p.update());
    }

    draw(ctx, cx, cy) {
        for (const p of this.particles) p.draw(ctx, cx, cy);
    }

    get count() { return this.particles.length; }
}

// ============= FIREWORK SYSTEM =============
class Firework {
    constructor(x, groundY) {
        this.x = x;
        this.y = groundY;
        this.targetY = rand(40, groundY * 0.35);
        this.vy = -rand(5, 8);
        this.phase = 'rise'; // rise, explode, done
        this.trail = [];
        this.particles = [];
        this.color = [PAL.gold, PAL.crimson, PAL.pink, PAL.purple, PAL.orange, PAL.teal, '#FF6B6B', '#69F0AE'][randInt(0, 7)];
        this.life = 0;
    }

    update() {
        this.life++;
        if (this.phase === 'rise') {
            this.y += this.vy;
            this.trail.push({ x: this.x + rand(-1, 1), y: this.y, alpha: 1, size: rand(1.5, 3) });
            if (this.trail.length > 15) this.trail.shift();
            for (const t of this.trail) t.alpha *= 0.92;
            if (this.y <= this.targetY) {
                this.phase = 'explode';
                this._explode();
            }
        } else if (this.phase === 'explode') {
            this.particles = this.particles.filter(p => p.update());
            if (this.particles.length === 0) this.phase = 'done';
        }
        return this.phase !== 'done';
    }

    _explode() {
        const count = randInt(40, 70);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + rand(-0.1, 0.1);
            const speed = rand(1.5, 5);
            this.particles.push(new Particle(
                this.x, this.y,
                Math.cos(angle) * speed, Math.sin(angle) * speed,
                chance(0.3) ? PAL.gold : this.color,
                randInt(40, 80), rand(1.5, 3.5), 0.03, true
            ));
        }
        // Inner burst
        for (let i = 0; i < 15; i++) {
            const angle = rand(0, Math.PI * 2);
            this.particles.push(new Particle(
                this.x, this.y,
                Math.cos(angle) * rand(0.5, 2), Math.sin(angle) * rand(0.5, 2),
                PAL.white, randInt(20, 40), rand(1, 2), 0.02, true
            ));
        }
        audio.explosion();
    }

    draw(ctx, cx, cy) {
        if (this.phase === 'rise') {
            // Trail
            for (const t of this.trail) {
                ctx.globalAlpha = t.alpha * 0.6;
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 6;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(t.x - cx, t.y - cy, t.size, 0, Math.PI * 2);
                ctx.fill();
            }
            // Head
            ctx.globalAlpha = 1;
            ctx.fillStyle = PAL.white;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x - cx, this.y - cy, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        } else if (this.phase === 'explode') {
            for (const p of this.particles) p.draw(ctx, cx, cy);
        }
    }
}

class FireworkManager {
    constructor() {
        this.fireworks = [];
        this.timer = 0;
        this.interval = 90;
    }

    update(camX) {
        this.timer++;
        if (this.timer >= this.interval) {
            this.timer = 0;
            this.interval = randInt(50, 120);
            const x = camX + rand(50, CW - 50);
            this.fireworks.push(new Firework(x, CH));
        }
        this.fireworks = this.fireworks.filter(f => f.update());
    }

    celebrationBurst(x, y) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.fireworks.push(new Firework(x + rand(-200, 200), y + 200));
            }, i * 200);
        }
    }

    draw(ctx, cx, cy) {
        for (const f of this.fireworks) f.draw(ctx, cx, cy);
    }
}
