// ---------------------------------------------------------------------------
// sprites.js — every graphic in the game. Characters and items are ASCII
// pixel-maps rendered to offscreen canvases at load time; tiles are drawn
// procedurally per world theme. '.' (or space) = transparent.
// ---------------------------------------------------------------------------
'use strict';

const SCALE = 2;          // pixel-art pixels -> screen pixels
const TILE = 32;          // screen pixels per tile (16 art px * SCALE)

// Render an ASCII pixel-map into a canvas.
function makeSprite(rows, pal, scale = SCALE) {
  const w = Math.max(...rows.map(r => r.length));
  const h = rows.length;
  const c = document.createElement('canvas');
  c.width = w * scale;
  c.height = h * scale;
  const g = c.getContext('2d');
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const col = pal[ch];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return c;
}

function flipH(src) {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext('2d');
  g.translate(src.width, 0);
  g.scale(-1, 1);
  g.drawImage(src, 0, 0);
  return c;
}

// Deterministic RNG for tile speckling (so tiles look identical every load).
function lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ----------------------------- MADISON ---------------------------------------

const MADISON_PAL = {
  h: '#3fd12f', H: '#1f8f16',            // helmet
  f: '#ffd0a0', F: '#e0a878',            // skin
  k: '#141420', w: '#ffffff',            // eyes / lines
  p: '#a83af0', P: '#6b1f9e',            // shirt
  y: '#ffd94a',                          // lightning bolt
  b: '#2b62e0', B: '#1a3d96',            // pants
  r: '#e03a3a',                          // shoes
  s: '#c9ced9', g: '#5a6070',            // pogo stick
};

const MADISON_HEAD = [
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..HHffffffffHH..',
  '..HHfkwffkwfHH..',
  '...fffffffffF...',
  '...ffFkkkkFff...',
  '....ffffffff....',
];

const MADISON_TORSO = [
  '...pppppppppp...',
  '..fpppyypppppf..',
  '..fppppyyppppf..',
  '..fpPPPPPPPPpf..',
  '....PPPPPPPP....',
];

const MADISON_IDLE = MADISON_HEAD.concat(MADISON_TORSO, [
  '....bbbbbbbb....',
  '....bbbBBbbb....',
  '....bb....bb....',
  '....bb....bb....',
  '...rrr....rrr...',
  '..rrrr....rrrr..',
  '................',
]);

const MADISON_RUN1 = MADISON_HEAD.concat(MADISON_TORSO, [
  '....bbbbbbbb....',
  '...bbbBBbbbb....',
  '...bb.....bbb...',
  '..bb.......bbb..',
  '.rrr.......rrr..',
  'rrrr.......rrrr.',
  '................',
]);

const MADISON_RUN2 = MADISON_HEAD.concat(MADISON_TORSO, [
  '....bbbbbbbb....',
  '....bbBBbbb.....',
  '.....bbbbb......',
  '.....bbbb.......',
  '....rrrr........',
  '...rrrrr........',
  '................',
]);

const MADISON_JUMP = MADISON_HEAD.concat(MADISON_TORSO, [
  '....bbbbbbbb....',
  '...bbbBBbbbb....',
  '...bbb...bbb....',
  '..rrr....rrr....',
  '..rrrr...rrrr...',
  '................',
  '................',
]);

const MADISON_POGO = MADISON_HEAD.concat(MADISON_TORSO, [
  '....bbbbbbbb....',
  '....bbbBBbbb....',
  '...bbb.ss.bbb...',
  '...rrr.ss.rrr...',
  '..rrrr.ss.rrrr..',
  '.......ss.......',
  '.......ss.......',
  '......gssg......',
  '......gssg......',
  '.......ss.......',
  '......ssss......',
]);

// ------------------------------ ENEMIES ------------------------------------

const GLOOP_PAL = {
  G: '#49d049', D: '#2a8f2a', e: '#8af08a',
  k: '#141420', w: '#ffffff',
};

const GLOOP_1 = [
  '.....GGGGGG.....',
  '...GGGeeGGGGG...',
  '..GGGGGGGGGGGG..',
  '..GGGwwwwwwGGG..',
  '.GGGwwkkwwwwGGG.',
  '.GGGwwkkwwwwGGG.',
  '.GGGGwwwwwwGGGG.',
  '.GGGGGGGGGGGGGG.',
  '.GGGGGGGGGGGGGG.',
  '.GDGGGGGGGGGGDG.',
  '..GGGGGGGGGGGG..',
  '..DDD..DDD.DDD..',
  '..DDD..DDD.DDD..',
];

const GLOOP_2 = [
  '.....GGGGGG.....',
  '...GGGeeGGGGG...',
  '..GGGGGGGGGGGG..',
  '..GGGwwwwwwGGG..',
  '.GGGwwwwkkwwGGG.',
  '.GGGwwwwkkwwGGG.',
  '.GGGGwwwwwwGGGG.',
  '.GGGGGGGGGGGGGG.',
  '.GGGGGGGGGGGGGG.',
  '.GDGGGGGGGGGGDG.',
  '..GGGGGGGGGGGG..',
  '.DDD.DDD..DDD...',
  '.DDD.DDD..DDD...',
];

const GLOOP_STUN = [
  '................',
  '................',
  '.....GGGGGG.....',
  '...GGGGGGGGGG...',
  '..GGGwwwwwwGGG..',
  '.GGGwkwwwwkwGGG.',
  '.GGGwwkwwkwwGGG.',
  '.GGGGwwwwwwGGGG.',
  '.GGGGGGGGGGGGGG.',
  '.GGGGGGGGGGGGGG.',
  '..GGGGGGGGGGGG..',
  '..DDDDDDDDDDDD..',
  '..DDDDDDDDDDDD..',
];

const BOINGER_PAL = {
  R: '#e84040', r: '#a02020',
  k: '#141420', w: '#ffffff',
  s: '#c9ced9', g: '#5a6070',
};

const BOINGER_1 = [
  '.....RRRRRR.....',
  '...RRRRRRRRRR...',
  '..RRRRRRRRRRRR..',
  '..RRkwwRRkwwRR..',
  '..RRkwwRRkwwRR..',
  '..RRRRRRRRRRRR..',
  '..RRRkkkkkkRRR..',
  '...RRRRRRRRRR...',
  '.....rrrrrr.....',
  '......ssss......',
  '....ssss........',
  '........ssss....',
  '....ssss........',
  '....gggggggg....',
  '....gggggggg....',
];

const BOINGER_2 = [
  '................',
  '................',
  '.....RRRRRR.....',
  '...RRRRRRRRRR...',
  '..RRRRRRRRRRRR..',
  '..RRkwwRRkwwRR..',
  '..RRkwwRRkwwRR..',
  '..RRRRRRRRRRRR..',
  '..RRRkkkkkkRRR..',
  '...RRRRRRRRRR...',
  '.....rrrrrr.....',
  '......ssss......',
  '.....ssssss.....',
  '....gggggggg....',
  '....gggggggg....',
];

const BOINGER_STUN = [
  '................',
  '................',
  '................',
  '.....RRRRRR.....',
  '...RRRRRRRRRR...',
  '..RRRRRRRRRRRR..',
  '..RRwkwRRwkwRR..',
  '..RRkwkRRkwkRR..',
  '..RRRRRRRRRRRR..',
  '..RRwwwwwwwwRR..',
  '...RRRRRRRRRR...',
  '.....rrrrrr.....',
  '......ssss......',
  '....gggggggg....',
  '....gggggggg....',
];

const KRAWLER_PAL = {
  P: '#b04ae8', p: '#7a28b0', d: '#521a78',
  k: '#141420', w: '#ffffff',
};

const KRAWLER_1 = [
  '...P..P..P..P...',
  '..PPPPPPPPPPPP..',
  '.PPPPPPPPPPPPPP.',
  '.PPwkkwPPwkkwPP.',
  '.PPPPPPPPPPPPPP.',
  '.PkwkwkwkwkwkwP.',
  '.PPPPPPPPPPPPPP.',
  '..pppppppppppp..',
  '..dd.dd..dd.dd..',
  '..dd.dd..dd.dd..',
];

const KRAWLER_2 = [
  '...P..P..P..P...',
  '..PPPPPPPPPPPP..',
  '.PPPPPPPPPPPPPP.',
  '.PPwkkwPPwkkwPP.',
  '.PPPPPPPPPPPPPP.',
  '.PkwkwkwkwkwkwP.',
  '.PPPPPPPPPPPPPP.',
  '..pppppppppppp..',
  '.dd..dd..dd..dd.',
  '.dd..dd..dd..dd.',
];

const KRAWLER_STUN = [
  '................',
  '...P..P..P..P...',
  '..PPPPPPPPPPPP..',
  '.PPPPPPPPPPPPPP.',
  '.PPkwwkPPkwwkPP.',
  '.PPwkkwPPwkkwPP.',
  '.PPPPPPPPPPPPPP.',
  '.PPPPPPPPPPPPPP.',
  '..pppppppppppp..',
  '..dddddddddddd..',
];

// ------------------------------- ITEMS -------------------------------------

const CANDY = makeSpriteLater([
  '..rrrrr..',
  '.rrwwwrr.',
  '.rwrrrwr.',
  '.rrwwwrr.',
  '..rrrrr..',
  '....s....',
  '....s....',
  '....s....',
], { r: '#ff4a8a', w: '#ffffff', s: '#e8e8f0' });

const SODA = makeSpriteLater([
  '..gggg..',
  '.rrrrrr.',
  '.rrrrrr.',
  '.rwwwwr.',
  '.rwkkwr.',
  '.rwwwwr.',
  '.rrrrrr.',
  '.rrrrrr.',
  '..gggg..',
], { g: '#c9ced9', r: '#e03a3a', w: '#ffffff', k: '#141420' });

const AMMO = makeSpriteLater([
  '..gggg..',
  '.yyyyyy.',
  '.yyykyy.',
  '.yykkyy.',
  '.yykkky.',
  '.yyykyy.',
  '.yyyyyy.',
  '.yyyyyy.',
], { g: '#5a6070', y: '#ffd94a', k: '#141420' });

const HEART = makeSpriteLater([
  '.rr..rr.',
  'rrrrrrrr',
  'rrwrrrrr',
  'rrrrrrrr',
  '.rrrrrr.',
  '..rrrr..',
  '...rr...',
], { r: '#ff3a5c', w: '#ffb0c0' });

function keyRows() {
  return [
    '.KKK........',
    'KK.KK.......',
    'KK.KKKKKKKKK',
    'KK.KK....K.K',
    '.KKK.....K.K',
  ];
}

const SHOT = makeSpriteLater([
  'yyww',
  'wwyy',
], { y: '#ffd94a', w: '#ffffff' });

// small helper so consts above can call before makeSprite hoisting concerns
function makeSpriteLater(rows, pal) { return makeSprite(rows, pal); }

// ------------------------------- TILES -------------------------------------

// Draw one 16x16-art tile into a TILE x TILE canvas using a painter fn.
function makeTile(painter, seed) {
  const c = document.createElement('canvas');
  c.width = TILE;
  c.height = TILE;
  const g = c.getContext('2d');
  const rnd = lcg(seed);
  const px = (x, y, col) => { g.fillStyle = col; g.fillRect(x * SCALE, y * SCALE, SCALE, SCALE); };
  painter(g, px, rnd);
  return c;
}

// Build the tile set for a world theme.
function buildTiles(theme) {
  const t = {};

  // X : solid rock
  t['X'] = makeTile((g, px, rnd) => {
    g.fillStyle = theme.rock;
    g.fillRect(0, 0, TILE, TILE);
    for (let i = 0; i < 26; i++) {
      px(Math.floor(rnd() * 16), Math.floor(rnd() * 16),
         rnd() < 0.5 ? theme.rockDark : theme.rockLight);
    }
    g.fillStyle = theme.rockLight;
    g.fillRect(0, 0, TILE, SCALE);
    g.fillStyle = theme.rockDark;
    g.fillRect(0, TILE - SCALE, TILE, SCALE);
    g.fillRect(TILE - SCALE, 0, SCALE, TILE);
  }, theme.seed);

  // B : brick / tech panel
  t['B'] = makeTile((g, px, rnd) => {
    g.fillStyle = theme.brick;
    g.fillRect(0, 0, TILE, TILE);
    g.fillStyle = theme.brickDark;
    g.fillRect(0, 7 * SCALE, TILE, SCALE);
    g.fillRect(0, 15 * SCALE, TILE, SCALE);
    g.fillRect(7 * SCALE, 0, SCALE, 8 * SCALE);
    g.fillRect(3 * SCALE, 8 * SCALE, SCALE, 8 * SCALE);
    g.fillRect(11 * SCALE, 8 * SCALE, SCALE, 8 * SCALE);
    g.fillStyle = theme.brickLight;
    g.fillRect(0, 0, TILE, SCALE);
    px(1, 1, theme.brickLight); px(14, 1, theme.brickLight);
    px(1, 9, theme.brickLight); px(9, 9, theme.brickLight);
  }, theme.seed + 1);

  // - : one-way platform
  t['-'] = makeTile((g, px) => {
    g.fillStyle = theme.platform;
    g.fillRect(0, 0, TILE, 5 * SCALE);
    g.fillStyle = theme.platformLight;
    g.fillRect(0, 0, TILE, SCALE);
    g.fillStyle = theme.platformDark;
    g.fillRect(0, 4 * SCALE, TILE, SCALE);
    px(2, 2, theme.platformLight); px(7, 2, theme.platformLight);
    px(12, 2, theme.platformLight);
  }, theme.seed + 2);

  // S : goo spikes
  t['S'] = makeTile((g) => {
    g.fillStyle = theme.spike;
    for (let i = 0; i < 4; i++) {
      const bx = i * 8 * (TILE / 32);
      g.beginPath();
      g.moveTo(bx * 2, TILE);
      g.lineTo(bx * 2 + 8, TILE);
      g.lineTo(bx * 2 + 4, TILE - 22);
      g.closePath();
      g.fill();
    }
    g.fillStyle = theme.spikeLight;
    for (let i = 0; i < 4; i++) {
      g.fillRect(i * 8 + 3, TILE - 18, 2, 10);
    }
  }, theme.seed + 3);

  // R / G : locked security doors
  const doorPainter = (base, dark, light) => (g) => {
    g.fillStyle = dark;
    g.fillRect(0, 0, TILE, TILE);
    g.fillStyle = base;
    g.fillRect(SCALE, SCALE, TILE - 2 * SCALE, TILE - 2 * SCALE);
    g.fillStyle = light;
    g.fillRect(SCALE, SCALE, TILE - 2 * SCALE, SCALE);
    g.fillStyle = dark;
    g.beginPath();
    g.arc(TILE / 2, TILE / 2, 6, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = light;
    g.beginPath();
    g.arc(TILE / 2, TILE / 2, 3, 0, Math.PI * 2);
    g.fill();
  };
  t['R'] = makeTile(doorPainter('#c03040', '#701020', '#ff8090'), theme.seed + 4);
  t['G'] = makeTile(doorPainter('#30a848', '#106028', '#80ffa0'), theme.seed + 5);

  return t;
}

// ------------------------------ EXPORT -------------------------------------

const Sprites = {
  madison: {
    idle:  makeSprite(MADISON_IDLE, MADISON_PAL),
    run1:  makeSprite(MADISON_RUN1, MADISON_PAL),
    run2:  makeSprite(MADISON_RUN2, MADISON_PAL),
    jump:  makeSprite(MADISON_JUMP, MADISON_PAL),
    pogo:  makeSprite(MADISON_POGO, MADISON_PAL),
  },
  gloop:   { f1: makeSprite(GLOOP_1, GLOOP_PAL),   f2: makeSprite(GLOOP_2, GLOOP_PAL),   stun: makeSprite(GLOOP_STUN, GLOOP_PAL) },
  boinger: { f1: makeSprite(BOINGER_1, BOINGER_PAL), f2: makeSprite(BOINGER_2, BOINGER_PAL), stun: makeSprite(BOINGER_STUN, BOINGER_PAL) },
  krawler: { f1: makeSprite(KRAWLER_1, KRAWLER_PAL), f2: makeSprite(KRAWLER_2, KRAWLER_PAL), stun: makeSprite(KRAWLER_STUN, KRAWLER_PAL) },
  items: {
    candy: CANDY,
    soda: SODA,
    ammo: AMMO,
    heart: HEART,
    keyRed:   makeSprite(keyRows(), { K: '#ff5060' }),
    keyGreen: makeSprite(keyRows(), { K: '#50e070' }),
  },
  shot: SHOT,
  buildTiles,
};

// Pre-build mirrored (left-facing) frames.
Sprites.madisonL = {};
for (const k of Object.keys(Sprites.madison)) Sprites.madisonL[k] = flipH(Sprites.madison[k]);
for (const name of ['gloop', 'boinger', 'krawler']) {
  Sprites[name].f1L = flipH(Sprites[name].f1);
  Sprites[name].f2L = flipH(Sprites[name].f2);
  Sprites[name].stunL = flipH(Sprites[name].stun);
}
