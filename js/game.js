// ====================================
// 🪔 DIWALI RUNNER — Main Game Engine
// ====================================
(function () {
    'use strict';

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = CW;
    canvas.height = CH;

    // --- Input ---
    const keys = {};
    window.addEventListener('keydown', e => {
        keys[e.code] = true;
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
        if (e.code === 'Enter') handleEnter();
        if (e.code === 'KeyM') audio.toggle();
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });

    // --- Game State ---
    let state = STATE.MENU;
    let levelIndex = 0;
    let levels = null;
    let currentLevel = null;
    let player = null;
    let camX = 0;
    const camY = 20; // Fixed vertical offset
    let particles = null;
    let fireworks = null;
    let background = null;
    let ui = null;
    let deathParticlesDone = false;
    let finishFlag = null;

    function init() {
        levels = createLevels();
        background = new Background();
        ui = new UI();
        particles = new ParticleSystem();
        fireworks = new FireworkManager();
        loadLevel(0);
        // Hide loading screen
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) loading.classList.add('hidden');
        }, 600);
    }

    function loadLevel(idx) {
        levelIndex = idx;
        currentLevel = levels[idx];
        player = new Player(currentLevel.playerStart.x, currentLevel.playerStart.y);
        // Preserve score and lives across levels
        if (idx > 0) {
            const prev = player;
            player.score = window._carryScore || 0;
            player.lives = window._carryLives || 3;
        }
        camX = 0;
        particles = new ParticleSystem();
        deathParticlesDone = false;
        deathCountdown = -1;
        finishFlag = {
            x: currentLevel.finishX,
            y: 9 * TILE,
            frame: 0
        };
        // Reset enemies and collectibles by reloading level
        levels[idx] = idx === 0 ? createLevel1() : (idx === 1 ? createLevel2() : createLevel3());
        currentLevel = levels[idx];
        
        generateGroundDecos(currentLevel.grid, currentLevel.width);

        // Carry score
        if (window._carryScore !== undefined) {
            player.score = window._carryScore;
            player.lives = window._carryLives;
        }
        ui.toast(currentLevel.name, 120);
    }

    function handleEnter() {
        audio.init();
        if (state === STATE.MENU) {
            state = STATE.PLAYING;
            window._carryScore = 0;
            window._carryLives = 3;
            loadLevel(0);
            audio.startMusic();
        } else if (state === STATE.DEAD) {
            if (player.lives > 0) {
                // Retry same level
                state = STATE.PLAYING;
                window._carryScore = player.score;
                window._carryLives = player.lives;
                loadLevel(levelIndex);
            } else {
                // Full restart
                state = STATE.PLAYING;
                window._carryScore = 0;
                window._carryLives = 3;
                loadLevel(0);
            }
            audio.startMusic();
        } else if (state === STATE.LEVEL_DONE) {
            if (levelIndex + 1 < levels.length) {
                state = STATE.PLAYING;
                window._carryScore = player.score;
                window._carryLives = player.lives;
                loadLevel(levelIndex + 1);
            } else {
                state = STATE.WIN;
            }
        } else if (state === STATE.WIN) {
            state = STATE.MENU;
            window._carryScore = 0;
            window._carryLives = 3;
            loadLevel(0);
        }
    }

    // --- Ground decoration positions (generated once per level) ---
    let groundDecos = [];
    function generateGroundDecos(grid, gridW) {
        groundDecos = [];
        for (let c = 0; c < gridW; c++) {
            // Find top surface of ground
            for (let r = 0; r < ROWS; r++) {
                if (grid[r][c] >= 1 && (r === 0 || grid[r-1][c] === 0)) {
                    // This is a surface tile — maybe place decoration
                    if (chance(0.12)) {
                        groundDecos.push({
                            x: c * TILE + rand(5, TILE - 5),
                            y: r * TILE,
                            type: chance(0.5) ? 'diya' : 'plant',
                            flicker: rand(0, Math.PI * 2),
                            size: rand(0.7, 1.2)
                        });
                    }
                    break;
                }
            }
        }
    }

    let _tilesFrame = 0;

    // --- Helper: is tile solid ---
    function isSolidTile(v) { return v === T_SOLID || v === T_MYSTERY || v === T_PILLAR_TOP || v === T_PILLAR_BODY; }

    // --- Tile Rendering ---
    function drawTiles(ctx, grid, gridW) {
        _tilesFrame++;
        const startCol = Math.max(0, Math.floor(camX / TILE) - 1);
        const endCol = Math.min(gridW - 1, Math.ceil((camX + CW) / TILE) + 1);
        const T = TILE;

        for (let r = 0; r < ROWS; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const tile = grid[r][c];
                if (tile === 0) continue;
                const sx = Math.round(c * T - camX);
                const sy = Math.round(r * T - camY);
                const aboveSolid = r > 0 && isSolidTile(grid[r - 1][c]);

                if (tile === T_SOLID) {
                    drawBrickTile(ctx, sx, sy, r, c, !aboveSolid);
                } else if (tile === T_MYSTERY) {
                    drawMysteryBlock(ctx, sx, sy);
                } else if (tile === T_PILLAR_TOP) {
                    drawPillarTop(ctx, sx, sy);
                } else if (tile === T_PILLAR_BODY) {
                    drawPillarBody(ctx, sx, sy);
                }
            }
        }

        // Ground decorations
        drawGroundDecorations(ctx);
    }

    function drawBrickTile(ctx, sx, sy, row, col, isTop) {
        const T = TILE;
        if (isTop) {
            // ---- TOP SURFACE TILE (like Mario's grass strip) ----
            // Main brick fill
            ctx.fillStyle = PAL.brickLight;
            ctx.fillRect(sx, sy, T, T);

            // Staggered brick mortar
            ctx.strokeStyle = PAL.brickDark;
            ctx.lineWidth = 1;
            const halfT = T / 2;
            const thirdT = T / 3;
            // Horizontal mortar lines
            ctx.beginPath();
            ctx.moveTo(sx, sy + thirdT); ctx.lineTo(sx + T, sy + thirdT);
            ctx.moveTo(sx, sy + thirdT * 2); ctx.lineTo(sx + T, sy + thirdT * 2);
            ctx.stroke();
            // Vertical mortar (staggered)
            ctx.beginPath();
            if (col % 2 === 0) {
                ctx.moveTo(sx + halfT, sy); ctx.lineTo(sx + halfT, sy + thirdT);
                ctx.moveTo(sx + T * 0.25, sy + thirdT); ctx.lineTo(sx + T * 0.25, sy + thirdT * 2);
                ctx.moveTo(sx + T * 0.75, sy + thirdT); ctx.lineTo(sx + T * 0.75, sy + thirdT * 2);
                ctx.moveTo(sx + halfT, sy + thirdT * 2); ctx.lineTo(sx + halfT, sy + T);
            } else {
                ctx.moveTo(sx + T * 0.25, sy); ctx.lineTo(sx + T * 0.25, sy + thirdT);
                ctx.moveTo(sx + T * 0.75, sy); ctx.lineTo(sx + T * 0.75, sy + thirdT);
                ctx.moveTo(sx + halfT, sy + thirdT); ctx.lineTo(sx + halfT, sy + thirdT * 2);
                ctx.moveTo(sx + T * 0.25, sy + thirdT * 2); ctx.lineTo(sx + T * 0.25, sy + T);
                ctx.moveTo(sx + T * 0.75, sy + thirdT * 2); ctx.lineTo(sx + T * 0.75, sy + T);
            }
            ctx.stroke();

            // Saffron/gold top strip (like Mario's green grass)
            const grad = ctx.createLinearGradient(sx, sy - 2, sx, sy + 8);
            grad.addColorStop(0, PAL.grassHighlight);
            grad.addColorStop(0.4, PAL.grassTop);
            grad.addColorStop(1, PAL.saffron);
            ctx.fillStyle = grad;
            ctx.fillRect(sx, sy - 2, T, 8);

            // Scalloped toran pattern on top edge
            ctx.fillStyle = PAL.gold;
            for (let i = 0; i < 4; i++) {
                const bx = sx + i * (T / 4) + T / 8;
                ctx.beginPath();
                ctx.arc(bx, sy + 7, 4, 0, Math.PI);
                ctx.fill();
            }

            // Bright highlight line at very top
            ctx.fillStyle = PAL.cream;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(sx, sy - 2, T, 2);
            ctx.globalAlpha = 1;

            // Block outline
            ctx.strokeStyle = PAL.brickOutline;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(sx, sy, T, T);
        } else {
            // ---- INNER BRICK TILE ----
            ctx.fillStyle = PAL.brick;
            ctx.fillRect(sx, sy, T, T);

            // Staggered mortar
            const thirdT = T / 3;
            ctx.strokeStyle = PAL.brickDark;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx, sy + thirdT); ctx.lineTo(sx + T, sy + thirdT);
            ctx.moveTo(sx, sy + thirdT * 2); ctx.lineTo(sx + T, sy + thirdT * 2);
            ctx.stroke();
            ctx.beginPath();
            if (col % 2 === 0) {
                ctx.moveTo(sx + T / 2, sy); ctx.lineTo(sx + T / 2, sy + thirdT);
                ctx.moveTo(sx + T * 0.25, sy + thirdT); ctx.lineTo(sx + T * 0.25, sy + thirdT * 2);
                ctx.moveTo(sx + T * 0.75, sy + thirdT); ctx.lineTo(sx + T * 0.75, sy + thirdT * 2);
                ctx.moveTo(sx + T / 2, sy + thirdT * 2); ctx.lineTo(sx + T / 2, sy + T);
            } else {
                ctx.moveTo(sx + T * 0.25, sy); ctx.lineTo(sx + T * 0.25, sy + thirdT);
                ctx.moveTo(sx + T * 0.75, sy); ctx.lineTo(sx + T * 0.75, sy + thirdT);
                ctx.moveTo(sx + T / 2, sy + thirdT); ctx.lineTo(sx + T / 2, sy + thirdT * 2);
                ctx.moveTo(sx + T * 0.25, sy + thirdT * 2); ctx.lineTo(sx + T * 0.25, sy + T);
                ctx.moveTo(sx + T * 0.75, sy + thirdT * 2); ctx.lineTo(sx + T * 0.75, sy + T);
            }
            ctx.stroke();

            // Subtle highlight on top-left of each brick
            ctx.fillStyle = 'rgba(255,200,150,0.1)';
            ctx.fillRect(sx + 1, sy + 1, T / 2 - 2, 2);

            // Block outline
            ctx.strokeStyle = PAL.brickOutline;
            ctx.lineWidth = 1;
            ctx.strokeRect(sx, sy, T, T);
        }
    }

    function drawMysteryBlock(ctx, sx, sy) {
        const T = TILE;
        const anim = Math.sin(_tilesFrame * 0.06);
        const shimmer = 0.85 + 0.15 * anim;

        // Main block
        const grad = ctx.createLinearGradient(sx, sy, sx, sy + T);
        grad.addColorStop(0, '#FFE04A');
        grad.addColorStop(0.5, PAL.mysteryGold);
        grad.addColorStop(1, PAL.mysteryDark);
        ctx.fillStyle = grad;
        ctx.fillRect(sx + 1, sy + 1, T - 2, T - 2);

        // Dark outline
        ctx.strokeStyle = PAL.mysteryOutline;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, T, T);

        // Inner border highlight
        ctx.strokeStyle = 'rgba(255,255,200,0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 3, sy + 3, T - 6, T - 6);

        // Corner rivets
        ctx.fillStyle = PAL.mysteryOutline;
        const rv = 3;
        ctx.beginPath(); ctx.arc(sx + 5, sy + 5, rv, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + T - 5, sy + 5, rv, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 5, sy + T - 5, rv, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + T - 5, sy + T - 5, rv, 0, Math.PI * 2); ctx.fill();

        // Diya symbol in center
        ctx.globalAlpha = shimmer;
        ctx.fillStyle = PAL.saffron;
        ctx.font = 'bold 18px Outfit';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪔', sx + T / 2, sy + T / 2 + 1);
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        // Shimmer highlight
        ctx.fillStyle = `rgba(255,255,255,${0.1 + 0.1 * anim})`;
        ctx.fillRect(sx + 3, sy + 3, T * 0.4, T * 0.3);
    }

    function drawPillarTop(ctx, sx, sy) {
        const T = TILE;

        // Rim / lip at top (wider than body)
        ctx.fillStyle = PAL.pillarRim;
        ctx.fillRect(sx - 4, sy, T + 8, 8);
        ctx.fillStyle = PAL.pillarLight;
        ctx.fillRect(sx - 4, sy, T + 8, 3);

        // Inner opening (dark)
        ctx.fillStyle = '#0a2a12';
        ctx.beginPath();
        ctx.ellipse(sx + T / 2, sy + 6, T / 2 - 2, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body below rim
        const bodyGrad = ctx.createLinearGradient(sx, sy, sx + T, sy);
        bodyGrad.addColorStop(0, PAL.pillarDark);
        bodyGrad.addColorStop(0.3, PAL.pillarGreen);
        bodyGrad.addColorStop(0.7, PAL.pillarLight);
        bodyGrad.addColorStop(1, PAL.pillarDark);
        ctx.fillStyle = bodyGrad;
        ctx.fillRect(sx, sy + 8, T, T - 8);

        // Highlights
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(sx + T * 0.6, sy + 8, 3, T - 8);
    }

    function drawPillarBody(ctx, sx, sy) {
        const T = TILE;
        const bodyGrad = ctx.createLinearGradient(sx, sy, sx + T, sy);
        bodyGrad.addColorStop(0, PAL.pillarDark);
        bodyGrad.addColorStop(0.3, PAL.pillarGreen);
        bodyGrad.addColorStop(0.7, PAL.pillarLight);
        bodyGrad.addColorStop(1, PAL.pillarDark);
        ctx.fillStyle = bodyGrad;
        ctx.fillRect(sx, sy, T, T);

        // Vertical highlight
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(sx + T * 0.6, sy, 3, T);

        // Subtle horizontal ring
        ctx.strokeStyle = PAL.pillarRim;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy + T / 2);
        ctx.lineTo(sx + T, sy + T / 2);
        ctx.stroke();
    }

    function drawGroundDecorations(ctx) {
        for (const d of groundDecos) {
            const sx = d.x - camX;
            const sy = d.y - camY;
            if (sx < -20 || sx > CW + 20) continue;

            if (d.type === 'diya') {
                const flick = 0.6 + 0.4 * Math.sin(_tilesFrame * 0.07 + d.flicker);
                const s = d.size;
                // Diya base
                ctx.fillStyle = '#A0522D';
                ctx.beginPath();
                ctx.ellipse(sx, sy - 1, 5 * s, 3 * s, 0, 0, Math.PI * 2);
                ctx.fill();
                // Flame
                ctx.fillStyle = PAL.diya;
                ctx.globalAlpha = flick;
                ctx.shadowBlur = 10 * s;
                ctx.shadowColor = PAL.diya;
                ctx.beginPath();
                ctx.ellipse(sx, sy - 6 * s, 3 * s * flick, 7 * s * flick, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            } else {
                // Small decorative plant/bush
                const s = d.size;
                ctx.fillStyle = '#1B5E20';
                ctx.beginPath();
                ctx.arc(sx, sy - 6 * s, 7 * s, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#2E7D32';
                ctx.beginPath();
                ctx.arc(sx - 4 * s, sy - 4 * s, 5 * s, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(sx + 4 * s, sy - 4 * s, 5 * s, 0, Math.PI * 2);
                ctx.fill();
                // Stem
                ctx.fillStyle = '#4E342E';
                ctx.fillRect(sx - 1, sy - 3 * s, 2, 3 * s);
            }
        }
    }

    // --- Finish Flag ---
    function drawFinishFlag(ctx) {
        if (!finishFlag) return;
        finishFlag.frame++;
        const sx = finishFlag.x - camX;
        const sy = finishFlag.y - camY;
        if (sx < -80 || sx > CW + 80) return;

        // Pole
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(sx + 16, sy - 10, 5, TILE * 3 + 20);
        ctx.fillStyle = '#888';
        ctx.fillRect(sx + 18, sy - 10, 2, TILE * 3 + 20);

        // Pole top ball
        ctx.fillStyle = PAL.gold;
        ctx.shadowBlur = 8;
        ctx.shadowColor = PAL.gold;
        ctx.beginPath();
        ctx.arc(sx + 18, sy - 14, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Flag (waving)
        const wave = Math.sin(finishFlag.frame * 0.06) * 4;
        const wave2 = Math.sin(finishFlag.frame * 0.06 + 1) * 3;

        // Flag shape - Indian tricolor inspired
        const fw = 38, fh = 28;
        const fx = sx + 21, fy = sy - 5;
        // Saffron stripe
        ctx.fillStyle = PAL.saffron;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + fw + wave, fy + 2);
        ctx.lineTo(fx + fw + wave2, fy + fh / 3 + 1);
        ctx.lineTo(fx, fy + fh / 3);
        ctx.fill();
        // White stripe
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(fx, fy + fh / 3);
        ctx.lineTo(fx + fw + wave2, fy + fh / 3 + 1);
        ctx.lineTo(fx + fw + wave, fy + fh * 2 / 3 + 2);
        ctx.lineTo(fx, fy + fh * 2 / 3);
        ctx.fill();
        // Green stripe
        ctx.fillStyle = '#138808';
        ctx.beginPath();
        ctx.moveTo(fx, fy + fh * 2 / 3);
        ctx.lineTo(fx + fw + wave, fy + fh * 2 / 3 + 2);
        ctx.lineTo(fx + fw + wave2, fy + fh + 3);
        ctx.lineTo(fx, fy + fh);
        ctx.fill();
        // Diya on white stripe
        ctx.fillStyle = PAL.saffron;
        ctx.font = '12px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText('🪔', fx + fw * 0.4 + wave * 0.3, fy + fh / 2 + 5);
        ctx.textAlign = 'left';
    }

    // --- Death tracking ---
    let deathCountdown = -1; // -1 means not dying

    // --- Update ---
    function update() {
        ui.update();
        background.update();
        fireworks.update(camX);

        if (state === STATE.MENU || state === STATE.WIN) {
            particles.update();
            return;
        }

        if (state !== STATE.PLAYING) {
            particles.update();
            return;
        }

        // If death countdown is active, tick it down
        if (deathCountdown > 0) {
            deathCountdown--;
            particles.update();
            // Update enemies visually even during death
            for (const e of currentLevel.enemies) e.update(particles);
            return;
        } else if (deathCountdown === 0) {
            deathCountdown = -1;
            state = STATE.DEAD;
            particles.update();
            return;
        }

        // Update player
        player.update(keys, currentLevel.grid, currentLevel.width);

        // Camera follow
        const targetCamX = player.x - CW * 0.35;
        camX = lerp(camX, targetCamX, 0.1);
        camX = clamp(camX, 0, currentLevel.width * TILE - CW);

        // Update collectibles
        for (const c of currentLevel.collectibles) {
            if (c.collected) continue;
            c.update();
            if (player.alive && aabb(player.getBounds(), c.getBounds())) {
                c.collected = true;
                player.score += c.value;
                particles.collectSparkle(c.x + c.w / 2, c.y + c.h / 2);
                ui.addScorePopup(c.x + c.w / 2 - camX, c.y - camY - 10,
                    '+' + c.value, c.bonus ? PAL.crimson : PAL.gold);
                if (c.bonus) {
                    audio.bonusCollect();
                } else {
                    audio.collect();
                }
            }
        }

        // Update enemies
        for (const e of currentLevel.enemies) {
            e.update(particles);
            if (!player.alive || player.invincible > 0) continue;
            if (aabb(player.getBounds(), e.getBounds())) {
                triggerDeath();
            }
        }

        // Detect death from falling off map (player.die() was called inside player.update)
        if (!player.alive && deathCountdown < 0) {
            triggerDeath();
        }

        // Check finish
        if (player.alive && player.x + player.w >= currentLevel.finishX) {
            state = STATE.LEVEL_DONE;
            window._carryScore = player.score;
            window._carryLives = player.lives;
            audio.levelComplete();
            fireworks.celebrationBurst(player.x, player.y - 100);
            audio.stopMusic();
        }

        particles.update();
    }

    function triggerDeath() {
        if (deathCountdown >= 0) return; // Already dying, don't re-trigger
        if (!player.alive && player.deathTimer > 1) {
            // Already dead from falling — just start countdown
        } else {
            player.die();
        }
        particles.playerExplosion(player.deathX, player.deathY);
        fireworks.celebrationBurst(player.deathX, player.deathY - 100);
        audio.stopMusic();
        audio.explosion();
        deathCountdown = 90; // ~1.5 seconds at 60fps
    }

    // --- Render ---
    function render() {
        ctx.clearRect(0, 0, CW, CH);

        // Background (always draw)
        background.draw(ctx, camX);

        // Fireworks behind everything
        fireworks.draw(ctx, camX, camY);

        if (state === STATE.MENU) {
            ui.drawMenuScreen(ctx);
            return;
        }

        if (state === STATE.WIN) {
            ui.drawVictory(ctx, player ? player.score : 0);
            return;
        }

        // Game world
        drawTiles(ctx, currentLevel.grid, currentLevel.width);
        drawFinishFlag(ctx);

        // Collectibles
        for (const c of currentLevel.collectibles) c.draw(ctx, camX, camY);

        // Enemies
        for (const e of currentLevel.enemies) e.draw(ctx, camX, camY);

        // Player
        if (player) player.draw(ctx, camX, camY);

        // Particles
        particles.draw(ctx, camX, camY);

        // HUD
        if (state === STATE.PLAYING || state === STATE.DEAD || state === STATE.LEVEL_DONE) {
            const progress = player ? player.x / currentLevel.finishX : 0;
            ui.drawHUD(ctx, player.score, player.lives, currentLevel.name, progress);
        }

        // Overlay screens
        if (state === STATE.DEAD) {
            ui.drawGameOver(ctx, player.score);
        } else if (state === STATE.LEVEL_DONE) {
            ui.drawLevelComplete(ctx, currentLevel.name, player.score);
        }
    }

    // --- Game Loop ---
    let lastTime = 0;
    function gameLoop(timestamp) {
        const dt = timestamp - lastTime;
        lastTime = timestamp;

        // Cap frame updates to prevent spiral of death on tab switch
        if (dt < 100) {
            update();
        }
        render();
        requestAnimationFrame(gameLoop);
    }

    // --- Start ---
    init();
    requestAnimationFrame(gameLoop);
})();
