// ====================================
// 🪔 DIWALI RUNNER — Configuration
// ====================================
const TILE = 40;
const CW = 960;
const CH = 540;
const ROWS = 14;
const GRAVITY = 0.58;
const MAX_FALL = 12;

const PLAYER_W = 30;
const PLAYER_H = 46;
const WALK_ACCEL = 0.45;
const RUN_ACCEL = 0.55;
const AIR_ACCEL = 0.28;
const WALK_MAX = 4.2;
const RUN_MAX = 6.8;
const FRICTION = 0.78;
const AIR_FRICTION = 0.92;
const JUMP_VEL = -12.2;
const JUMP_CUT = -5.5;
const DOUBLE_JUMP_VEL = -10.5;

const STATE = { MENU: 0, PLAYING: 1, DEAD: 2, LEVEL_DONE: 3, WIN: 4 };

// Tile types: 0=empty, 1=solid block, 2=mystery block, 3=pillar_top, 4=pillar_body
const T_EMPTY = 0, T_SOLID = 1, T_MYSTERY = 2, T_PILLAR_TOP = 3, T_PILLAR_BODY = 4;

const PAL = {
    saffron: '#FF6F00', gold: '#FFD700', deepGold: '#B8860B',
    crimson: '#DC143C', ruby: '#E91E63', pink: '#FF80AB',
    nightTop: '#050d1a', nightBot: '#0a1e3d', nightMid: '#0d1b2a',
    diya: '#FFB300', diySoft: '#FFE082', cream: '#FFF8E1',
    skin: '#C68642', skinDark: '#8D5524', skinLight: '#DDA15E',
    kurta: '#FF8F00', kurtaDark: '#E65100', kurtaLight: '#FFB74D',
    dhoti: '#FFF3E0', dhotiShade: '#FFE0B2',
    brick: '#7A3B10', brickLight: '#A0602A', brickDark: '#4A2200',
    brickOutline: '#3E1A00',
    platTop: '#D4A574', platSide: '#A67C52',
    green: '#2E7D32', greenLight: '#4CAF50',
    grassTop: '#E8850C', grassHighlight: '#FFB347',
    mysteryGold: '#F5C518', mysteryDark: '#C6940E', mysteryOutline: '#8B6914',
    pillarGreen: '#1B813E', pillarDark: '#0F5D2A', pillarLight: '#2FA85A', pillarRim: '#0B4A20',
    star: '#FFF9C4', white: '#FFFFFF',
    purple: '#9C27B0', orange: '#FF9800', teal: '#00BCD4',
};

// Utility functions
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rand(a, b) { return Math.random() * (b - a) + a; }
function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }
function chance(p) { return Math.random() < p; }

// Simple AABB collision
function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}
