// ====================================
// 🪔 DIWALI RUNNER — Player Character
// ====================================
class Player {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.vx = 0; this.vy = 0;
        this.w = PLAYER_W; this.h = PLAYER_H;
        this.onGround = false;
        this.facing = 1; // 1=right, -1=left
        this.state = 'idle'; // idle, run, jump, fall
        this.frame = 0;
        this.canDoubleJump = true;
        this.hasDoubleJump = true;
        this.alive = true;
        this.deathTimer = 0;
        this.deathX = 0; this.deathY = 0;
        this.invincible = 0;
        this.score = 0;
        this.lives = 3;
        this.runFrame = 0;
    }

    update(keys, grid, gridW) {
        if (!this.alive) {
            this.deathTimer++;
            return;
        }
        if (this.invincible > 0) this.invincible--;

        this.frame++;
        const running = keys['ShiftLeft'] || keys['ShiftRight'];
        const maxSpd = running ? RUN_MAX : WALK_MAX;
        const accel = this.onGround ? (running ? RUN_ACCEL : WALK_ACCEL) : AIR_ACCEL;
        const fric = this.onGround ? FRICTION : AIR_FRICTION;

        // Horizontal movement
        let inputX = 0;
        if (keys['ArrowLeft'] || keys['KeyA']) inputX = -1;
        if (keys['ArrowRight'] || keys['KeyD']) inputX = 1;

        if (inputX !== 0) {
            this.vx += inputX * accel;
            this.vx = clamp(this.vx, -maxSpd, maxSpd);
            this.facing = inputX;
        } else {
            this.vx *= fric;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
        }

        // Jump
        const jumpKey = keys['Space'] || keys['ArrowUp'] || keys['KeyW'];
        if (jumpKey && !this._jumpPressed) {
            if (this.onGround) {
                this.vy = JUMP_VEL;
                this.onGround = false;
                this.canDoubleJump = this.hasDoubleJump;
                audio.jump();
            } else if (this.canDoubleJump) {
                this.vy = DOUBLE_JUMP_VEL;
                this.canDoubleJump = false;
                audio.doubleJump();
            }
            this._jumpPressed = true;
        }
        if (!jumpKey) {
            this._jumpPressed = false;
            // Variable jump height
            if (this.vy < JUMP_CUT && !this.onGround) {
                this.vy = JUMP_CUT;
            }
        }

        // Gravity
        this.vy += GRAVITY;
        if (this.vy > MAX_FALL) this.vy = MAX_FALL;

        // Move X then resolve collisions
        this.x += this.vx;
        this._resolveX(grid, gridW);

        // Move Y then resolve collisions
        this.y += this.vy;
        this._resolveY(grid, gridW);

        // Fell off map
        if (this.y > ROWS * TILE + 100) {
            this.die();
        }

        // Animation state
        if (!this.onGround) {
            this.state = this.vy < 0 ? 'jump' : 'fall';
        } else if (Math.abs(this.vx) > 0.5) {
            this.state = 'run';
            this.runFrame += Math.abs(this.vx) * 0.12;
        } else {
            this.state = 'idle';
        }

        // Clamp to left edge
        if (this.x < 0) { this.x = 0; this.vx = 0; }
    }

    _getTile(grid, gw, col, row) {
        if (col < 0 || col >= gw || row < 0 || row >= ROWS) return 0;
        return grid[row][col];
    }

    _resolveX(grid, gw) {
        const top = Math.floor(this.y / TILE);
        const bot = Math.floor((this.y + this.h - 1) / TILE);
        if (this.vx > 0) {
            const col = Math.floor((this.x + this.w) / TILE);
            for (let r = top; r <= bot; r++) {
                if (this._getTile(grid, gw, col, r) >= 1) {
                    this.x = col * TILE - this.w;
                    this.vx = 0;
                    break;
                }
            }
        } else if (this.vx < 0) {
            const col = Math.floor(this.x / TILE);
            for (let r = top; r <= bot; r++) {
                if (this._getTile(grid, gw, col, r) >= 1) {
                    this.x = (col + 1) * TILE;
                    this.vx = 0;
                    break;
                }
            }
        }
    }

    _resolveY(grid, gw) {
        const left = Math.floor(this.x / TILE);
        const right = Math.floor((this.x + this.w - 1) / TILE);
        this.onGround = false;
        if (this.vy > 0) {
            const row = Math.floor((this.y + this.h) / TILE);
            for (let c = left; c <= right; c++) {
                if (this._getTile(grid, gw, c, row) >= 1) {
                    this.y = row * TILE - this.h;
                    this.vy = 0;
                    this.onGround = true;
                    break;
                }
            }
        } else if (this.vy < 0) {
            const row = Math.floor(this.y / TILE);
            for (let c = left; c <= right; c++) {
                if (this._getTile(grid, gw, c, row) >= 1) {
                    this.y = (row + 1) * TILE;
                    this.vy = 0;
                    break;
                }
            }
        }
    }

    die() {
        if (!this.alive) return;
        this.alive = false;
        this.deathTimer = 0;
        this.deathX = this.x + this.w / 2;
        this.deathY = this.y + this.h / 2;
        this.lives--;
        audio.hit();
    }

    draw(ctx, cx, cy) {
        if (!this.alive) return;
        if (this.invincible > 0 && Math.floor(this.invincible / 3) % 2 === 0) return;

        const sx = Math.round(this.x - cx);
        const sy = Math.round(this.y - cy);

        ctx.save();
        ctx.translate(sx + this.w / 2, sy + this.h);
        ctx.scale(this.facing, 1);

        const legAnim = this.state === 'run' ? Math.sin(this.runFrame) : 0;
        const breathe = this.state === 'idle' ? Math.sin(this.frame * 0.06) * 1 : 0;
        const jumpSquash = this.state === 'jump' ? -2 : (this.state === 'fall' ? 2 : 0);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        const legY = -this.h * 0.32;
        ctx.fillStyle = PAL.skinDark;
        // Left leg
        ctx.save();
        ctx.translate(-5, legY);
        ctx.rotate(legAnim * 0.5);
        ctx.fillRect(-3, 0, 6, this.h * 0.32);
        // Foot
        ctx.fillStyle = '#6D3600';
        ctx.fillRect(-4, this.h * 0.28, 8, 4);
        ctx.restore();
        // Right leg
        ctx.save();
        ctx.fillStyle = PAL.skinDark;
        ctx.translate(5, legY);
        ctx.rotate(-legAnim * 0.5);
        ctx.fillRect(-3, 0, 6, this.h * 0.32);
        ctx.fillStyle = '#6D3600';
        ctx.fillRect(-4, this.h * 0.28, 8, 4);
        ctx.restore();

        // Dhoti (lower garment) — white/cream wrap
        const dhotiY = -this.h * 0.52;
        ctx.fillStyle = PAL.dhoti;
        ctx.beginPath();
        ctx.moveTo(-this.w / 2, dhotiY);
        ctx.lineTo(this.w / 2, dhotiY);
        ctx.lineTo(this.w / 2 + 2, legY + 4);
        ctx.lineTo(-this.w / 2 - 2, legY + 4);
        ctx.closePath();
        ctx.fill();
        // Dhoti border
        ctx.strokeStyle = PAL.dhotiShade;
        ctx.lineWidth = 1;
        ctx.stroke();
        // Gold border at bottom
        ctx.strokeStyle = PAL.deepGold;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-this.w / 2 - 1, legY + 3);
        ctx.lineTo(this.w / 2 + 1, legY + 3);
        ctx.stroke();

        // Kurta (upper body) — saffron
        const kurtaTop = -this.h * 0.82 + breathe;
        ctx.fillStyle = PAL.kurta;
        ctx.fillRect(-this.w / 2 + 1, kurtaTop + jumpSquash, this.w - 2, this.h * 0.32);
        // Kurta detail — golden neckline
        ctx.strokeStyle = PAL.gold;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-4, kurtaTop + jumpSquash + 2);
        ctx.lineTo(0, kurtaTop + jumpSquash + 7);
        ctx.lineTo(4, kurtaTop + jumpSquash + 2);
        ctx.stroke();
        // Kurta side detail
        ctx.strokeStyle = PAL.kurtaDark;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, kurtaTop + jumpSquash + 8);
        ctx.lineTo(0, dhotiY);
        ctx.stroke();

        // Arms
        const armY = kurtaTop + jumpSquash + 5;
        ctx.fillStyle = PAL.skin;
        // Left arm
        ctx.save();
        ctx.translate(-this.w / 2, armY);
        ctx.rotate(-legAnim * 0.4 + (this.state === 'jump' ? -0.8 : 0));
        ctx.fillStyle = PAL.kurta;
        ctx.fillRect(-5, 0, 5, 14);
        ctx.fillStyle = PAL.skin;
        ctx.fillRect(-5, 12, 5, 6);
        ctx.restore();
        // Right arm
        ctx.save();
        ctx.translate(this.w / 2, armY);
        ctx.rotate(legAnim * 0.4 + (this.state === 'jump' ? 0.8 : 0));
        ctx.fillStyle = PAL.kurta;
        ctx.fillRect(0, 0, 5, 14);
        ctx.fillStyle = PAL.skin;
        ctx.fillRect(0, 12, 5, 6);
        ctx.restore();

        // Head
        const headY = kurtaTop + jumpSquash - 10;
        const headR = 9;
        ctx.fillStyle = PAL.skin;
        ctx.beginPath();
        ctx.arc(0, headY, headR, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(0, headY - 2, headR, Math.PI, 0);
        ctx.fill();

        // Topi (cap)
        ctx.fillStyle = PAL.crimson;
        ctx.beginPath();
        ctx.ellipse(0, headY - headR + 1, headR - 1, 5, 0, Math.PI, 0);
        ctx.fill();
        // Topi detail
        ctx.fillStyle = PAL.gold;
        ctx.fillRect(-headR + 2, headY - headR - 1, (headR - 2) * 2, 2);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(2, headY - 2, 2.5, 2.5);

        // Smile
        if (this.state !== 'fall') {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(2, headY + 2, 3, 0, Math.PI);
            ctx.stroke();
        }

        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}
