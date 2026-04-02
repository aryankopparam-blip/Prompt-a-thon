// ====================================
// 🪔 DIWALI RUNNER — Parallax Background
// ====================================
class Background {
    constructor() {
        this.stars = [];
        for (let i = 0; i < 120; i++) {
            this.stars.push({
                x: rand(0, CW * 3),
                y: rand(0, CH * 0.55),
                size: rand(0.5, 2.5),
                twinkle: rand(0, Math.PI * 2),
                speed: rand(0.3, 0.8)
            });
        }
        // Pre-generate building silhouettes for skyline layers
        this.buildings1 = this._genBuildings(30, 60, 120, 0.4); // far skyline
        this.buildings2 = this._genBuildings(20, 80, 160, 0.6); // mid buildings
        this.houses = this._genHouses(25); // near houses with diyas
        this.stringLights = this._genStringLights(8);
        this.moonX = rand(CW * 0.6, CW * 0.85);
        this.moonY = rand(40, 100);
        this.frameCount = 0;
    }

    _genBuildings(count, minH, maxH, widthFactor) {
        const b = [];
        let x = 0;
        for (let i = 0; i < count; i++) {
            const w = rand(40, 100) * widthFactor + 30;
            const h = rand(minH, maxH);
            const windows = [];
            const wx = Math.floor(w / 18);
            const wy = Math.floor(h / 22);
            for (let r = 0; r < wy; r++) {
                for (let c = 0; c < wx; c++) {
                    if (chance(0.6)) {
                        windows.push({
                            x: 6 + c * 18,
                            y: 8 + r * 22,
                            lit: chance(0.7),
                            flicker: rand(0, Math.PI * 2)
                        });
                    }
                }
            }
            b.push({ x, w, h, windows, hasFlag: chance(0.2) });
            x += w + rand(5, 30);
        }
        return b;
    }

    _genHouses(count) {
        const h = [];
        let x = 0;
        for (let i = 0; i < count; i++) {
            const w = rand(70, 130);
            const ht = rand(80, 140);
            const roofH = rand(20, 40);
            const diyas = [];
            if (chance(0.7)) {
                const nd = randInt(1, 4);
                for (let d = 0; d < nd; d++) {
                    diyas.push({ x: rand(5, w - 5), flicker: rand(0, Math.PI * 2) });
                }
            }
            const doorX = rand(w * 0.3, w * 0.6);
            h.push({ x, w, h: ht, roofH, diyas, doorX, color: `hsl(${randInt(15, 45)}, ${randInt(30, 60)}%, ${randInt(20, 35)}%)` });
            x += w + rand(20, 60);
        }
        return h;
    }

    _genStringLights(count) {
        const lights = [];
        let x = rand(100, 300);
        for (let i = 0; i < count; i++) {
            const w = rand(100, 250);
            const bulbs = [];
            const nb = Math.floor(w / 15);
            for (let b = 0; b < nb; b++) {
                bulbs.push({
                    t: b / nb,
                    color: [PAL.crimson, PAL.gold, PAL.green, PAL.orange, PAL.pink, PAL.teal][randInt(0, 5)],
                    flicker: rand(0, Math.PI * 2)
                });
            }
            lights.push({ x, w, y: rand(30, 100), sag: rand(15, 35), bulbs });
            x += w + rand(150, 400);
        }
        return lights;
    }

    update() {
        this.frameCount++;
    }

    draw(ctx, camX) {
        const f = this.frameCount;

        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, CH);
        skyGrad.addColorStop(0, PAL.nightTop);
        skyGrad.addColorStop(0.5, PAL.nightMid);
        skyGrad.addColorStop(1, '#0f2847');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, CW, CH);

        // Moon
        const moonSX = this.moonX - camX * 0.02;
        ctx.fillStyle = '#FFF8E1';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#FFE082';
        ctx.beginPath();
        ctx.arc(moonSX, this.moonY, 22, 0, Math.PI * 2);
        ctx.fill();
        // Moon crescent shadow
        ctx.shadowBlur = 0;
        ctx.fillStyle = PAL.nightTop;
        ctx.beginPath();
        ctx.arc(moonSX + 8, this.moonY - 3, 18, 0, Math.PI * 2);
        ctx.fill();

        // Stars
        for (const s of this.stars) {
            const sx = ((s.x - camX * 0.03) % (CW * 1.5) + CW * 1.5) % (CW * 1.5);
            if (sx > CW) continue;
            const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(f * 0.03 * s.speed + s.twinkle));
            ctx.globalAlpha = twinkle;
            ctx.fillStyle = PAL.star;
            ctx.beginPath();
            ctx.arc(sx, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Layer 1: Far skyline (parallax 0.05)
        this._drawSkyline(ctx, camX * 0.05, this.buildings1, CH * 0.55, 'rgba(10,15,40,0.9)', 'rgba(255,200,50,0.3)', false);

        // Layer 2: Mid buildings (parallax 0.15)
        this._drawSkyline(ctx, camX * 0.15, this.buildings2, CH * 0.45, 'rgba(15,20,45,0.95)', 'rgba(255,180,50,0.5)', true);

        // String lights (parallax 0.2)
        this._drawStringLights(ctx, camX * 0.2, f);

        // Layer 3: Near houses with diyas (parallax 0.3)
        this._drawHouses(ctx, camX * 0.3, f);
    }

    _drawSkyline(ctx, offsetX, buildings, baseY, buildColor, winColor, showDomes) {
        for (const b of buildings) {
            const sx = b.x - offsetX;
            if (sx + b.w < -50 || sx > CW + 50) continue;

            ctx.fillStyle = buildColor;
            ctx.fillRect(sx, baseY + (CH - baseY) - b.h, b.w, b.h + 50);

            // Dome or pointed top on some buildings
            if (showDomes && b.hasFlag) {
                ctx.beginPath();
                ctx.arc(sx + b.w / 2, baseY + (CH - baseY) - b.h, b.w * 0.3, Math.PI, 0);
                ctx.fill();
            }

            // Windows
            for (const w of b.windows) {
                if (!w.lit) continue;
                const wx = sx + w.x;
                const wy = baseY + (CH - baseY) - b.h + w.y;
                const flick = 0.5 + 0.5 * Math.sin(this.frameCount * 0.05 + w.flicker);
                ctx.globalAlpha = flick;
                ctx.fillStyle = winColor;
                ctx.fillRect(wx, wy, 8, 10);
                ctx.globalAlpha = 1;
            }
        }
    }

    _drawHouses(ctx, offsetX, f) {
        const baseY = CH * 0.65;
        for (const h of this.houses) {
            const sx = h.x - offsetX;
            if (sx + h.w < -20 || sx > CW + 20) continue;

            // House body
            ctx.fillStyle = h.color;
            ctx.fillRect(sx, baseY + (CH - baseY) - h.h, h.w, h.h + 50);

            // Roof
            ctx.fillStyle = 'rgba(80,30,10,0.9)';
            ctx.beginPath();
            ctx.moveTo(sx - 5, baseY + (CH - baseY) - h.h);
            ctx.lineTo(sx + h.w / 2, baseY + (CH - baseY) - h.h - h.roofH);
            ctx.lineTo(sx + h.w + 5, baseY + (CH - baseY) - h.h);
            ctx.closePath();
            ctx.fill();

            // Door
            ctx.fillStyle = 'rgba(60,20,5,0.9)';
            ctx.fillRect(sx + h.doorX - 8, baseY + (CH - baseY) - 30, 16, 30);

            // Diyas on ledge
            for (const d of h.diyas) {
                const dx = sx + d.x;
                const dy = baseY + (CH - baseY) - h.h - 3;
                const flick = 0.6 + 0.4 * Math.sin(f * 0.08 + d.flicker);

                // Diya base
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.ellipse(dx, dy + 3, 4, 2, 0, 0, Math.PI * 2);
                ctx.fill();

                // Flame
                ctx.globalAlpha = flick;
                ctx.fillStyle = PAL.diya;
                ctx.shadowBlur = 12;
                ctx.shadowColor = PAL.diya;
                ctx.beginPath();
                ctx.ellipse(dx, dy - 2, 2.5 * flick, 5 * flick, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }
        }
    }

    _drawStringLights(ctx, offsetX, f) {
        for (const sl of this.stringLights) {
            const sx = sl.x - offsetX;
            if (sx + sl.w < -20 || sx > CW + 20) continue;

            // Wire
            ctx.strokeStyle = 'rgba(80,80,80,0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let t = 0; t <= 1; t += 0.02) {
                const bx = sx + t * sl.w;
                const by = sl.y + Math.sin(t * Math.PI) * sl.sag;
                t === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
            }
            ctx.stroke();

            // Bulbs
            for (const bulb of sl.bulbs) {
                const bx = sx + bulb.t * sl.w;
                const by = sl.y + Math.sin(bulb.t * Math.PI) * sl.sag;
                const flick = 0.5 + 0.5 * Math.sin(f * 0.06 + bulb.flicker);
                ctx.globalAlpha = flick;
                ctx.fillStyle = bulb.color;
                ctx.shadowBlur = 8;
                ctx.shadowColor = bulb.color;
                ctx.beginPath();
                ctx.arc(bx, by, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            ctx.globalAlpha = 1;
        }
    }
}
