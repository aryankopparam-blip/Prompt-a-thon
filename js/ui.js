// ====================================
// 🪔 DIWALI RUNNER — UI System
// ====================================
class UI {
    constructor() {
        this.frame = 0;
        this.toastMsg = '';
        this.toastTimer = 0;
        this.scorePopups = [];
    }

    update() {
        this.frame++;
        if (this.toastTimer > 0) this.toastTimer--;
        this.scorePopups = this.scorePopups.filter(p => {
            p.y -= 1;
            p.life--;
            return p.life > 0;
        });
    }

    toast(msg, dur = 120) {
        this.toastMsg = msg;
        this.toastTimer = dur;
    }

    addScorePopup(x, y, text, color = PAL.gold) {
        this.scorePopups.push({ x, y, text, color, life: 50 });
    }

    drawHUD(ctx, score, lives, levelName, progress) {
        // Classic Mario-style crisp text styling function
        const drawMarioText = (text, x, y, align = 'left') => {
            ctx.textAlign = align;
            // Strong black shadow/outline
            ctx.fillStyle = '#000000';
            ctx.fillText(text, x + 2, y + 2);
            // Crisp white inner text
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(text, x, y);
        };

        // Top padding
        const ty = 28;
        ctx.font = 'bold 20px Outfit'; // Using modern font but vintage styling

        // Player / Score column
        drawMarioText('PLAYER', 30, ty);
        const scoreStr = score.toString().padStart(6, '0');
        drawMarioText(scoreStr, 30, ty + 24);

        // Sweets / Coins column
        const cx = CW * 0.35;
        drawMarioText('SWEETS', cx, ty, 'center');
        // Add little animated sweet icon
        const sweetAnim = Math.sin(this.frame * 0.1) * 2;
        ctx.fillStyle = PAL.gold;
        ctx.shadowBlur = 4;
        ctx.shadowColor = PAL.gold;
        ctx.beginPath();
        ctx.arc(cx - 16, ty + 18 + sweetAnim, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        const pts = score % 100; // pretend 100 sweets = 1 life or something
        drawMarioText('x' + pts.toString().padStart(2, '0'), cx + 5, ty + 24, 'left');

        // World / Level column
        const wx = CW * 0.65;
        drawMarioText('WORLD', wx, ty, 'center');
        drawMarioText(levelName.split(' ')[0], wx, ty + 24, 'center'); // Short name

        // Time / Lives column
        const lx = CW - 30;
        drawMarioText('LIVES', lx, ty, 'right');
        // Draw heart icons
        const hx = lx - (lives * 18);
        for (let i = 0; i < lives; i++) {
            ctx.fillStyle = '#000000';
            ctx.fillText('❤️', hx + i * 18 + 2, ty + 24 + 2);
            ctx.fillStyle = PAL.crimson;
            ctx.fillText('❤️', hx + i * 18, ty + 24);
        }

        // Progress bar (slim, bottom of HUD area)
        const barW = 200;
        const barX = CW / 2 - barW / 2;
        const barY = ty + 40;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(barX, barY, barW, 4);
        ctx.fillStyle = PAL.gold;
        ctx.fillRect(barX, barY, barW * clamp(progress, 0, 1), 4);

        // Score popups
        for (const p of this.scorePopups) {
            ctx.globalAlpha = clamp(p.life / 30, 0, 1);
            ctx.font = 'bold 16px Outfit';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.fillText(p.text, p.x + 1, p.y + 1);
            ctx.fillStyle = p.color;
            ctx.fillText(p.text, p.x, p.y);
        }
        ctx.globalAlpha = 1;

        // Toast message
        if (this.toastTimer > 0) {
            const alpha = this.toastTimer > 20 ? 1 : this.toastTimer / 20;
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 24px Outfit';
            drawMarioText('🪔 ' + this.toastMsg + ' 🪔', CW / 2, CH / 2 - 60, 'center');
            ctx.globalAlpha = 1;
        }
    }

    drawMenuScreen(ctx) {
        const f = this.frame;
        // Dark overlay
        ctx.fillStyle = 'rgba(5,10,25,0.85)';
        ctx.fillRect(0, 0, CW, CH);

        // Decorative border pattern (rangoli-inspired)
        this._drawRangoliBorder(ctx);

        // Title
        const bounce = Math.sin(f * 0.03) * 5;
        ctx.save();
        ctx.translate(CW / 2, 130 + bounce);

        ctx.font = '900 52px Outfit';
        ctx.textAlign = 'center';
        // Text glow
        ctx.shadowBlur = 25;
        ctx.shadowColor = PAL.saffron;
        const titleGrad = ctx.createLinearGradient(-200, 0, 200, 0);
        titleGrad.addColorStop(0, PAL.gold);
        titleGrad.addColorStop(0.5, PAL.saffron);
        titleGrad.addColorStop(1, PAL.crimson);
        ctx.fillStyle = titleGrad;
        ctx.fillText('DIWALI RUNNER', 0, 0);
        ctx.shadowBlur = 0;

        // Subtitle
        ctx.font = '600 20px Outfit';
        ctx.fillStyle = PAL.cream;
        ctx.fillText('🪔 A Festive Platformer Adventure 🪔', 0, 40);

        ctx.restore();

        // Controls
        const controlY = 230;
        ctx.font = '500 15px Outfit';
        ctx.fillStyle = 'rgba(255,248,225,0.7)';
        ctx.textAlign = 'center';
        const controls = [
            '← → / A D  —  Move',
            'SPACE / ↑ / W  —  Jump',
            'SHIFT  —  Sprint',
            'Double-tap Jump  —  Double Jump',
            'M  —  Toggle Music'
        ];
        controls.forEach((c, i) => {
            ctx.fillText(c, CW / 2, controlY + i * 26);
        });

        // Start prompt
        const pulse = 0.5 + 0.5 * Math.sin(f * 0.06);
        ctx.globalAlpha = pulse;
        ctx.font = 'bold 24px Outfit';
        ctx.fillStyle = PAL.gold;
        ctx.shadowBlur = 15;
        ctx.shadowColor = PAL.gold;
        ctx.fillText('Press ENTER to Start', CW / 2, CH - 80);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Diya decorations at bottom
        this._drawDiyaRow(ctx, CH - 30, f);
    }

    drawGameOver(ctx, score) {
        const f = this.frame;
        ctx.fillStyle = 'rgba(10,5,5,0.88)';
        ctx.fillRect(0, 0, CW, CH);

        // Explosion text
        ctx.font = '900 42px Outfit';
        ctx.textAlign = 'center';
        ctx.fillStyle = PAL.crimson;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FF4444';
        ctx.fillText('💥 BOOM! YOU BECAME A CRACKER 💥', CW / 2, CH / 2 - 50);
        ctx.shadowBlur = 0;

        ctx.font = '600 22px Outfit';
        ctx.fillStyle = PAL.gold;
        ctx.fillText('Score: ' + score, CW / 2, CH / 2 + 10);

        const pulse = 0.5 + 0.5 * Math.sin(f * 0.06);
        ctx.globalAlpha = pulse;
        ctx.font = 'bold 20px Outfit';
        ctx.fillStyle = PAL.cream;
        ctx.fillText('Press ENTER to Try Again', CW / 2, CH / 2 + 60);
        ctx.globalAlpha = 1;

        this._drawDiyaRow(ctx, CH - 20, f);
    }

    drawLevelComplete(ctx, levelName, score) {
        const f = this.frame;
        ctx.fillStyle = 'rgba(5,10,30,0.85)';
        ctx.fillRect(0, 0, CW, CH);

        this._drawRangoliBorder(ctx);

        ctx.font = '900 38px Outfit';
        ctx.textAlign = 'center';
        ctx.fillStyle = PAL.gold;
        ctx.shadowBlur = 20;
        ctx.shadowColor = PAL.gold;
        ctx.fillText('🎇 LEVEL COMPLETE! 🎇', CW / 2, CH / 2 - 60);
        ctx.shadowBlur = 0;

        ctx.font = '600 22px Outfit';
        ctx.fillStyle = PAL.cream;
        ctx.fillText(levelName, CW / 2, CH / 2 - 15);

        ctx.fillStyle = PAL.saffron;
        ctx.fillText('Score: ' + score, CW / 2, CH / 2 + 25);

        const pulse = 0.5 + 0.5 * Math.sin(f * 0.06);
        ctx.globalAlpha = pulse;
        ctx.font = 'bold 20px Outfit';
        ctx.fillStyle = PAL.gold;
        ctx.fillText('Press ENTER for Next Level', CW / 2, CH / 2 + 75);
        ctx.globalAlpha = 1;
    }

    drawVictory(ctx, score) {
        const f = this.frame;
        ctx.fillStyle = 'rgba(5,10,30,0.85)';
        ctx.fillRect(0, 0, CW, CH);

        this._drawRangoliBorder(ctx);

        const bounce = Math.sin(f * 0.04) * 4;
        ctx.font = '900 48px Outfit';
        ctx.textAlign = 'center';
        const grad = ctx.createLinearGradient(CW / 2 - 200, 0, CW / 2 + 200, 0);
        grad.addColorStop(0, PAL.gold);
        grad.addColorStop(0.5, PAL.saffron);
        grad.addColorStop(1, PAL.crimson);
        ctx.fillStyle = grad;
        ctx.shadowBlur = 25;
        ctx.shadowColor = PAL.gold;
        ctx.fillText('🪔 HAPPY DIWALI! 🪔', CW / 2, CH / 2 - 70 + bounce);
        ctx.shadowBlur = 0;

        ctx.font = '700 26px Outfit';
        ctx.fillStyle = PAL.cream;
        ctx.fillText('You conquered all levels!', CW / 2, CH / 2 - 15);

        ctx.font = '600 22px Outfit';
        ctx.fillStyle = PAL.gold;
        ctx.fillText('Final Score: ' + score, CW / 2, CH / 2 + 25);

        const pulse = 0.5 + 0.5 * Math.sin(f * 0.06);
        ctx.globalAlpha = pulse;
        ctx.font = 'bold 20px Outfit';
        ctx.fillStyle = PAL.saffron;
        ctx.fillText('Press ENTER to Play Again', CW / 2, CH / 2 + 75);
        ctx.globalAlpha = 1;

        this._drawDiyaRow(ctx, CH - 20, f);
    }

    _drawDiyaRow(ctx, y, f) {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const dx = (i + 0.5) * (CW / count);
            const flick = 0.6 + 0.4 * Math.sin(f * 0.08 + i * 0.7);
            // Base
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.ellipse(dx, y + 5, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // Flame
            ctx.globalAlpha = flick;
            ctx.fillStyle = PAL.diya;
            ctx.shadowBlur = 12;
            ctx.shadowColor = PAL.diya;
            ctx.beginPath();
            ctx.ellipse(dx, y - 3, 3 * flick, 7 * flick, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
    }

    _drawRangoliBorder(ctx) {
        const f = this.frame;
        ctx.strokeStyle = PAL.saffron;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;

        // Corner rangoli patterns
        const corners = [[30, 30], [CW - 30, 30], [30, CH - 30], [CW - 30, CH - 30]];
        for (const [cx, cy] of corners) {
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 + f * 0.005;
                const r = 20;
                ctx.beginPath();
                ctx.arc(cx, cy, r, angle, angle + Math.PI / 3);
                ctx.stroke();
            }
            ctx.fillStyle = PAL.gold;
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}
