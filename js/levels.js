// ====================================
// 🪔 DIWALI RUNNER — Level Data
// ====================================

function createLevels() {
    return [createLevel1(), createLevel2(), createLevel3()];
}

function createLevel1() {
    const W = 200;
    const grid = makeEmptyGrid(W);

    // Ground: rows 12-13 (bottom two rows)
    fillGround(grid, 0, W - 1);

    // Gaps
    clearGround(grid, 18, 20);
    clearGround(grid, 35, 37);
    clearGround(grid, 55, 58);
    clearGround(grid, 75, 77);
    clearGround(grid, 95, 98);
    clearGround(grid, 120, 122);
    clearGround(grid, 140, 143);
    clearGround(grid, 165, 167);
    clearGround(grid, 182, 184);

    // Raised sections (stairs)
    fillBlock(grid, 28, 11, 33, 11);
    fillBlock(grid, 68, 10, 73, 11);
    fillBlock(grid, 108, 11, 113, 11);
    fillBlock(grid, 150, 10, 155, 11);

    // Floating platforms
    fillBlock(grid, 10, 9, 14, 9);
    fillBlock(grid, 22, 8, 26, 8);
    fillBlock(grid, 40, 9, 44, 9);
    fillBlock(grid, 50, 7, 53, 7);
    fillBlock(grid, 60, 9, 64, 9);
    fillBlock(grid, 80, 8, 84, 8);
    fillBlock(grid, 90, 7, 93, 7);
    fillBlock(grid, 100, 9, 104, 9);
    fillBlock(grid, 115, 7, 118, 7);
    fillBlock(grid, 125, 9, 129, 9);
    fillBlock(grid, 135, 8, 138, 8);
    fillBlock(grid, 155, 9, 158, 9);
    fillBlock(grid, 170, 8, 174, 8);
    fillBlock(grid, 185, 9, 190, 9);

    // Mystery blocks (golden diya blocks)
    placeMystery(grid, 8, 9);
    placeMystery(grid, 24, 5);
    placeMystery(grid, 42, 9);
    placeMystery(grid, 62, 6);
    placeMystery(grid, 82, 5);
    placeMystery(grid, 102, 9);
    placeMystery(grid, 127, 6);
    placeMystery(grid, 157, 6);
    placeMystery(grid, 172, 5);

    // Pillars (pipe-like obstacles)
    placePillar(grid, 33, 10, 2);
    placePillar(grid, 73, 9, 3);
    placePillar(grid, 113, 10, 2);
    placePillar(grid, 160, 10, 2);

    // Collectibles
    const collectibles = [];
    // Laddoos along paths
    addLaddooArc(collectibles, 5, 10, 3);
    addLaddooArc(collectibles, 11, 7.5, 4);
    addLaddooArc(collectibles, 23, 6.5, 3);
    addLaddooArc(collectibles, 41, 7.5, 3);
    addLaddooArc(collectibles, 61, 7.5, 3);
    addLaddooArc(collectibles, 81, 6.5, 3);
    addLaddooArc(collectibles, 101, 7.5, 3);
    addLaddooArc(collectibles, 126, 7.5, 3);
    addLaddooArc(collectibles, 156, 7.5, 3);
    addLaddooArc(collectibles, 171, 6.5, 3);
    addLaddooArc(collectibles, 186, 7.5, 4);
    // Bonus sweets on hard-to-reach platforms
    collectibles.push(new Laddoo(51 * TILE + 10, 5.5 * TILE, true));
    collectibles.push(new Laddoo(91 * TILE + 10, 5.5 * TILE, true));
    collectibles.push(new Laddoo(116 * TILE + 10, 5.5 * TILE, true));

    // Enemies
    const enemies = [];
    enemies.push(new GroundCracker(30 * TILE + 10, 11 * TILE - 28));
    enemies.push(new GroundCracker(45 * TILE + 10, 12 * TILE - 28));
    enemies.push(new GroundCracker(70 * TILE + 10, 10 * TILE - 28));
    enemies.push(new GroundCracker(110 * TILE + 10, 11 * TILE - 28));
    enemies.push(new GroundCracker(152 * TILE + 10, 10 * TILE - 28));
    enemies.push(new Rocket(85 * TILE, 11 * TILE, 'left', 2));
    enemies.push(new Rocket(130 * TILE, 11 * TILE, 'right', 2));
    enemies.push(new Rocket(175 * TILE, 11 * TILE, 'left', 2.5));

    return {
        grid, width: W, collectibles, enemies,
        playerStart: { x: 3 * TILE, y: 10 * TILE },
        finishX: 195 * TILE,
        name: 'Rooftop Run',
        bg: 0
    };
}

function createLevel2() {
    const W = 250;
    const grid = makeEmptyGrid(W);
    fillGround(grid, 0, W - 1);

    // More gaps, bigger
    clearGround(grid, 14, 17);
    clearGround(grid, 28, 31);
    clearGround(grid, 42, 46);
    clearGround(grid, 58, 61);
    clearGround(grid, 72, 76);
    clearGround(grid, 88, 91);
    clearGround(grid, 102, 106);
    clearGround(grid, 118, 121);
    clearGround(grid, 135, 139);
    clearGround(grid, 152, 155);
    clearGround(grid, 168, 172);
    clearGround(grid, 188, 191);
    clearGround(grid, 205, 209);
    clearGround(grid, 225, 228);

    // Raised terrain
    fillBlock(grid, 20, 10, 25, 11);
    fillBlock(grid, 50, 10, 55, 11);
    fillBlock(grid, 82, 9, 86, 11);
    fillBlock(grid, 112, 10, 116, 11);
    fillBlock(grid, 145, 9, 149, 11);
    fillBlock(grid, 178, 10, 183, 11);
    fillBlock(grid, 215, 10, 220, 11);

    // Floating platforms — more complex layouts
    fillBlock(grid, 8, 9, 12, 9);
    fillBlock(grid, 16, 8, 19, 8);
    fillBlock(grid, 32, 7, 35, 7);
    fillBlock(grid, 38, 9, 41, 9);
    fillBlock(grid, 47, 8, 50, 8);
    fillBlock(grid, 55, 6, 58, 6);
    fillBlock(grid, 62, 9, 65, 9);
    fillBlock(grid, 68, 7, 71, 7);
    fillBlock(grid, 77, 8, 80, 8);
    fillBlock(grid, 92, 7, 95, 7);
    fillBlock(grid, 98, 9, 101, 9);
    fillBlock(grid, 107, 7, 110, 7);
    fillBlock(grid, 122, 8, 125, 8);
    fillBlock(grid, 130, 6, 133, 6);
    fillBlock(grid, 140, 8, 143, 8);
    fillBlock(grid, 156, 7, 159, 7);
    fillBlock(grid, 163, 9, 166, 9);
    fillBlock(grid, 173, 7, 176, 7);
    fillBlock(grid, 192, 8, 196, 8);
    fillBlock(grid, 200, 6, 203, 6);
    fillBlock(grid, 210, 8, 213, 8);
    fillBlock(grid, 230, 9, 234, 9);

    const collectibles = [];
    addLaddooArc(collectibles, 9, 7.5, 3);
    addLaddooArc(collectibles, 17, 6.5, 3);
    addLaddooArc(collectibles, 33, 5.5, 3);
    addLaddooArc(collectibles, 48, 6.5, 3);
    addLaddooArc(collectibles, 63, 7.5, 3);
    addLaddooArc(collectibles, 69, 5.5, 3);
    addLaddooArc(collectibles, 78, 6.5, 3);
    addLaddooArc(collectibles, 93, 5.5, 3);
    addLaddooArc(collectibles, 108, 5.5, 3);
    addLaddooArc(collectibles, 123, 6.5, 3);
    addLaddooArc(collectibles, 141, 6.5, 3);
    addLaddooArc(collectibles, 157, 5.5, 3);
    addLaddooArc(collectibles, 193, 6.5, 3);
    addLaddooArc(collectibles, 231, 7.5, 3);
    // Bonus
    collectibles.push(new Laddoo(56 * TILE + 10, 4.5 * TILE, true));
    collectibles.push(new Laddoo(131 * TILE + 10, 4.5 * TILE, true));
    collectibles.push(new Laddoo(201 * TILE + 10, 4.5 * TILE, true));

    const enemies = [];
    enemies.push(new GroundCracker(22 * TILE, 10 * TILE - 28));
    enemies.push(new GroundCracker(52 * TILE, 10 * TILE - 28));
    enemies.push(new GroundCracker(84 * TILE, 9 * TILE - 28));
    enemies.push(new GroundCracker(114 * TILE, 10 * TILE - 28));
    enemies.push(new GroundCracker(147 * TILE, 9 * TILE - 28));
    enemies.push(new GroundCracker(180 * TILE, 10 * TILE - 28));
    enemies.push(new GroundCracker(217 * TILE, 10 * TILE - 28));

    enemies.push(new Rocket(35 * TILE, 10 * TILE, 'left', 2.5));
    enemies.push(new Rocket(65 * TILE, 11 * TILE, 'right', 3));
    enemies.push(new Rocket(100 * TILE, 11 * TILE, 'left', 2.5));
    enemies.push(new Rocket(142 * TILE, 10 * TILE, 'right', 3));
    enemies.push(new Rocket(175 * TILE, 11 * TILE, 'left', 3));
    enemies.push(new Rocket(210 * TILE, 11 * TILE, 'right', 2.5));

    enemies.push(new ExplodingTrap(48 * TILE, 12 * TILE - 22));
    enemies.push(new ExplodingTrap(95 * TILE, 12 * TILE - 22));
    enemies.push(new ExplodingTrap(160 * TILE, 12 * TILE - 22));

    return {
        grid, width: W, collectibles, enemies,
        playerStart: { x: 3 * TILE, y: 10 * TILE },
        finishX: 240 * TILE,
        name: 'Festival Heights',
        bg: 1
    };
}

function createLevel3() {
    const W = 300;
    const grid = makeEmptyGrid(W);
    fillGround(grid, 0, W - 1);

    // Many gaps — the hardest level
    const gapStarts = [12,25,38,50,62,74,85,96,108,120,132,144,155,166,178,190,202,214,226,238,250,262,275];
    for (const g of gapStarts) {
        const w = (g > 150) ? randInt(4, 6) : randInt(3, 5);
        clearGround(grid, g, Math.min(g + w, W - 1));
    }

    // Raised terrain everywhere
    fillBlock(grid, 18, 10, 22, 11);
    fillBlock(grid, 44, 9, 48, 11);
    fillBlock(grid, 70, 10, 73, 11);
    fillBlock(grid, 100, 9, 104, 11);
    fillBlock(grid, 126, 10, 130, 11);
    fillBlock(grid, 150, 9, 153, 11);
    fillBlock(grid, 175, 10, 178, 11);
    fillBlock(grid, 196, 9, 200, 11);
    fillBlock(grid, 220, 10, 224, 11);
    fillBlock(grid, 245, 9, 249, 11);
    fillBlock(grid, 268, 10, 272, 11);

    // Lots of floating platforms — narrow ones for challenge
    const platDefs = [
        [6,9,9,9],[14,7,16,7],[28,8,31,8],[34,6,36,6],
        [41,9,43,9],[52,7,55,7],[58,9,60,9],
        [65,7,68,7],[76,8,79,8],[82,6,84,6],
        [88,9,91,9],[98,7,100,7],[106,9,108,9],
        [112,6,114,6],[122,8,124,8],[134,7,137,7],
        [140,9,142,9],[148,6,150,6],[158,8,161,8],
        [164,9,166,9],[170,7,173,7],[180,8,183,8],
        [186,6,188,6],[194,9,196,9],[204,7,207,7],
        [210,9,212,9],[218,6,220,6],[228,8,231,8],
        [236,7,239,7],[252,8,255,8],[258,6,260,6],
        [264,9,266,9],[276,8,279,8],[282,9,285,9],
        [288,7,291,7]
    ];
    for (const [x1,y1,x2,y2] of platDefs) {
        fillBlock(grid, x1, y1, x2, y2);
    }

    const collectibles = [];
    for (let i = 0; i < platDefs.length; i += 2) {
        const [x1, y1] = platDefs[i];
        addLaddooArc(collectibles, x1, y1 - 1.5, 2 + (i % 3));
    }
    // Bonus sweets
    collectibles.push(new Laddoo(35 * TILE + 10, 4.5 * TILE, true));
    collectibles.push(new Laddoo(83 * TILE + 10, 4.5 * TILE, true));
    collectibles.push(new Laddoo(113 * TILE + 10, 4.5 * TILE, true));
    collectibles.push(new Laddoo(149 * TILE + 10, 4.5 * TILE, true));
    collectibles.push(new Laddoo(187 * TILE + 10, 4.5 * TILE, true));
    collectibles.push(new Laddoo(219 * TILE + 10, 4.5 * TILE, true));
    collectibles.push(new Laddoo(259 * TILE + 10, 4.5 * TILE, true));

    const enemies = [];
    // Ground crackers on raised platforms
    for (let i = 0; i < 15; i++) {
        const x = 20 + i * 18;
        if (x < W) enemies.push(new GroundCracker(x * TILE, 12 * TILE - 28));
    }
    // Rockets
    for (let i = 0; i < 12; i++) {
        const x = 30 + i * 22;
        if (x < W) enemies.push(new Rocket(x * TILE, (10 + (i % 2)) * TILE, i % 2 === 0 ? 'left' : 'right', 2.5 + i * 0.15));
    }
    // Exploding traps
    for (let i = 0; i < 8; i++) {
        const x = 40 + i * 30;
        if (x < W) enemies.push(new ExplodingTrap(x * TILE, 12 * TILE - 22));
    }

    return {
        grid, width: W, collectibles, enemies,
        playerStart: { x: 3 * TILE, y: 10 * TILE },
        finishX: 292 * TILE,
        name: 'Firecracker Fury',
        bg: 2
    };
}

// --- Level helpers ---
function makeEmptyGrid(w) {
    const grid = [];
    for (let r = 0; r < ROWS; r++) grid[r] = new Array(w).fill(0);
    return grid;
}

function fillGround(grid, x1, x2) {
    for (let c = x1; c <= x2; c++) {
        if (c < grid[0].length) {
            grid[12][c] = 1;
            grid[13][c] = 1;
        }
    }
}

function clearGround(grid, x1, x2) {
    for (let c = x1; c <= x2; c++) {
        if (c < grid[0].length) {
            grid[12][c] = 0;
            grid[13][c] = 0;
        }
    }
}

function fillBlock(grid, x1, y1, x2, y2) {
    for (let r = y1; r <= y2; r++) {
        for (let c = x1; c <= x2; c++) {
            if (r >= 0 && r < ROWS && c >= 0 && c < grid[0].length) {
                grid[r][c] = 1;
            }
        }
    }
}

function addLaddooArc(collectibles, startCol, row, count) {
    for (let i = 0; i < count; i++) {
        const x = (startCol + i) * TILE + TILE / 2 - 9;
        const arcY = row * TILE - Math.sin((i / (count - 1 || 1)) * Math.PI) * 20;
        collectibles.push(new Laddoo(x, arcY));
    }
}

function placeMystery(grid, col, row) {
    if (col >= 0 && col < grid[0].length && row >= 0 && row < ROWS) {
        grid[row][col] = T_MYSTERY;
    }
}

function placePillar(grid, col, topRow, height) {
    if (col < 0 || col >= grid[0].length) return;
    for (let r = topRow; r < topRow + height && r < ROWS; r++) {
        grid[r][col] = (r === topRow) ? T_PILLAR_TOP : T_PILLAR_BODY;
    }
}
