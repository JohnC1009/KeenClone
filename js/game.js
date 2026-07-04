// ---------------------------------------------------------------------------
// game.js — the engine. Fixed-timestep loop, AABB tile collision with one-way
// platforms, enemies, zapper shots, particles, parallax backgrounds, HUD, and
// the state machine: TITLE -> STORY -> LEVELINTRO -> PLAY -> ... -> WIN.
// ---------------------------------------------------------------------------
'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const VIEW_W = canvas.width;    // 960
const VIEW_H = canvas.height;   // 544 = 17 rows * 32
const T = TILE;                 // 32

// Physics
const GRAV = 0.5;
const MAX_FALL = 12;
const ACC = 0.6;
const FRICTION = 0.78;
const MAX_RUN = 4;
const JUMP_V = -11;
const POGO_V = -11.5;
const POGO_MEGA_V = -15.5;
const SHOT_SPEED = 10;

const SOLID = { X: 1, B: 1, R: 1, G: 1 };
const ITEMS = { '*': 1, '%': 1, A: 1, H: 1, r: 1, g: 1 };

// ------------------------------- INPUT --------------------------------------

const keys = {};
const pressed = {};   // edge-triggered, cleared each frame

const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyW: 'jump', KeyZ: 'jump', Space: 'jump',
  KeyX: 'shoot',
  KeyC: 'pogo',
  Enter: 'start',
  KeyM: 'mute',
};

window.addEventListener('keydown', (e) => {
  const k = KEYMAP[e.code];
  if (!k) return;
  e.preventDefault();
  Sfx.unlock();
  if (!keys[k]) pressed[k] = true;
  keys[k] = true;
});
window.addEventListener('keyup', (e) => {
  const k = KEYMAP[e.code];
  if (!k) return;
  e.preventDefault();
  keys[k] = false;
});

// ------------------------------ GAME STATE ----------------------------------

const G = {
  state: 'TITLE',       // TITLE STORY LEVELINTRO PLAY DYING LEVELCLEAR GAMEOVER WIN PAUSE
  storyPage: 0,
  levelIdx: 0,
  score: 0,
  lives: 3,
  ammo: 6,
  nextLifeAt: 15000,
  time: 0,              // global frame counter (for animation)
  stateTime: 0,         // frames in current state
  camX: 0,
};

let level = null;       // parsed level
let player = null;
let enemies = [];
let shots = [];
let particles = [];
let toasts = [];        // floating texts
let tiles = {};         // themed tile canvases
let bg = null;          // background decoration data

const STORY_PAGES = [
  ['THE YEAR IS 2087.', '',
   "Eight-year-old genius ZOE 'COMET' CARTER was",
   'halfway through her math homework when every',
   'candy store on Earth vanished into space in a',
   'flash of lime-green light.'],
  ["The GLOOPIAN EMPIRE has stolen Earth's sugar",
   'to fuel their MEGA GOO REACTOR -- a machine',
   'that will turn every planet in the sector',
   'into lukewarm, lime-flavored goo.', '',
   'EARTH IS NEXT ON THE MENU.'],
  ['So Zoe built the STAR SKIPPER from a vacuum',
   "cleaner, her go-kart, and her mom's blender.", '',
   'Armed with her NEURAL ZAPPER and trusty POGO',
   'STICK, she crash-lands on PLANET GREXON-7...', '',
   'Bedtime is at 9:00 PM. Better hurry.'],
];

// ---------------------------- LEVEL PARSING ---------------------------------

const ENEMY_DEFS = {
  '1': { kind: 'gloop',   w: 30, h: 24, speed: 0.8 },
  '2': { kind: 'boinger', w: 26, h: 28, speed: 1.2 },
  '3': { kind: 'krawler', w: 30, h: 18, speed: 1.1 },
};

function loadLevel(idx) {
  const def = LEVELS[idx];
  const rows = def.map;
  const w = Math.max(...rows.map(r => r.length));
  const h = rows.length;
  const grid = [];
  enemies = [];
  shots = [];
  particles = [];
  toasts = [];
  let spawn = { x: 64, y: 64 };
  let exitRect = null;

  for (let r = 0; r < h; r++) {
    const row = [];
    for (let c = 0; c < w; c++) {
      let ch = rows[r][c] || '.';
      if (ch === ' ') ch = '.';
      if (ch === 'P') {
        spawn = { x: c * T + 5, y: (r + 1) * T - 38 };
        ch = '.';
      } else if (ENEMY_DEFS[ch]) {
        const d = ENEMY_DEFS[ch];
        enemies.push({
          kind: d.kind, w: d.w, h: d.h,
          x: c * T + (T - d.w) / 2, y: (r + 1) * T - d.h,
          vx: -d.speed, vy: 0, dir: -1, speed: d.speed,
          stunned: false, stunTime: 0, onGround: false, anim: Math.random() * 100,
        });
        ch = '.';
      } else if (ch === 'E') {
        if (!exitRect) exitRect = { c0: c, r0: r, c1: c, r1: r };
        else {
          exitRect.c0 = Math.min(exitRect.c0, c); exitRect.c1 = Math.max(exitRect.c1, c);
          exitRect.r0 = Math.min(exitRect.r0, r); exitRect.r1 = Math.max(exitRect.r1, r);
        }
      }
      row.push(ch);
    }
    grid.push(row);
  }

  level = {
    def, grid, w, h,
    pxW: w * T, pxH: h * T,
    spawn, exitRect,
    keys: { red: false, green: false },
  };

  player = {
    x: spawn.x, y: spawn.y, w: 22, h: 38,
    vx: 0, vy: 0, facing: 1,
    onGround: false, coyote: 0,
    pogo: false, hearts: 3, invuln: 0,
    shootCd: 0, anim: 0,
    doorMsgCd: 0,
  };

  tiles = Sprites.buildTiles(def.theme);
  bg = makeBackground(def.theme);
  G.camX = Math.max(0, Math.min(player.x - VIEW_W / 2, level.pxW - VIEW_W));
}

// ------------------------------ TILE HELPERS --------------------------------

function tileAt(c, r) {
  if (c < 0 || c >= level.w) return 'X';       // walls beyond edges
  if (r < 0 || r >= level.h) return '.';       // open sky / pit
  return level.grid[r][c];
}

function isSolid(ch) { return SOLID[ch] === 1; }

// Open every connected door tile of the same color.
function openDoor(c0, r0, ch) {
  const stack = [[c0, r0]];
  while (stack.length) {
    const [c, r] = stack.pop();
    if (tileAt(c, r) !== ch) continue;
    level.grid[r][c] = '.';
    burst(c * T + T / 2, r * T + T / 2, ch === 'R' ? '#ff8090' : '#80ffa0', 8);
    stack.push([c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]);
  }
  Sfx.door();
}

// -------------------------- MOVEMENT & COLLISION -----------------------------

// Move an entity with tile collision. Returns { hitX, onGround, hitHead }.
function moveEntity(e, opts = {}) {
  const res = { hitX: false, onGround: false, hitHead: false };
  const isPlayer = opts.player === true;

  // ---- X axis
  e.x += e.vx;
  if (e.x < 0) { e.x = 0; res.hitX = true; }
  if (e.x + e.w > level.pxW) { e.x = level.pxW - e.w; res.hitX = true; }
  {
    const r0 = Math.floor(e.y / T), r1 = Math.floor((e.y + e.h - 0.01) / T);
    if (e.vx > 0) {
      const c = Math.floor((e.x + e.w - 0.01) / T);
      for (let r = r0; r <= r1; r++) {
        const ch = tileAt(c, r);
        if (isSolid(ch)) {
          if (isPlayer && (ch === 'R' || ch === 'G')) tryDoor(c, r, ch);
          if (isSolid(tileAt(c, r))) { e.x = c * T - e.w; res.hitX = true; }
          break;
        }
      }
    } else if (e.vx < 0) {
      const c = Math.floor(e.x / T);
      for (let r = r0; r <= r1; r++) {
        const ch = tileAt(c, r);
        if (isSolid(ch)) {
          if (isPlayer && (ch === 'R' || ch === 'G')) tryDoor(c, r, ch);
          if (isSolid(tileAt(c, r))) { e.x = (c + 1) * T; res.hitX = true; }
          break;
        }
      }
    }
  }

  // ---- Y axis
  const prevBottom = e.y + e.h;
  e.y += e.vy;
  {
    const c0 = Math.floor(e.x / T), c1 = Math.floor((e.x + e.w - 0.01) / T);
    if (e.vy > 0) {
      const r = Math.floor((e.y + e.h - 0.01) / T);
      for (let c = c0; c <= c1; c++) {
        const ch = tileAt(c, r);
        const oneway = ch === '-' && prevBottom <= r * T + 0.01;
        if (isSolid(ch) || oneway) {
          e.y = r * T - e.h;
          e.vy = 0;
          res.onGround = true;
          break;
        }
      }
    } else if (e.vy < 0) {
      const r = Math.floor(e.y / T);
      for (let c = c0; c <= c1; c++) {
        const ch = tileAt(c, r);
        if (isSolid(ch)) {
          if (isPlayer && (ch === 'R' || ch === 'G')) tryDoor(c, r, ch);
          if (isSolid(tileAt(c, r))) {
            e.y = (r + 1) * T;
            e.vy = 0;
            res.hitHead = true;
          }
          break;
        }
      }
    }
  }
  return res;
}

function tryDoor(c, r, ch) {
  const need = ch === 'R' ? 'red' : 'green';
  if (level.keys[need]) {
    openDoor(c, r, ch);
    addScore(500);
    toast(c * T, r * T - 10, 'ACCESS GRANTED', '#a0ffb0');
  } else if (player.doorMsgCd <= 0) {
    toast(player.x, player.y - 14, `NEED ${need.toUpperCase()} KEYCARD`, ch === 'R' ? '#ff8090' : '#80ffa0');
    player.doorMsgCd = 60;
  }
}

// ------------------------------ FX HELPERS ----------------------------------

function burst(x, y, color, n = 10, spread = 3) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * spread * 2,
      vy: (Math.random() - 0.9) * spread * 2,
      life: 20 + Math.random() * 20,
      color, size: 2 + Math.random() * 3,
    });
  }
}

function toast(x, y, text, color = '#ffffff') {
  toasts.push({ x, y, text, color, life: 70 });
}

function addScore(n) {
  G.score += n;
  if (G.score >= G.nextLifeAt) {
    G.lives++;
    G.nextLifeAt += 15000;
    Sfx.oneUp();
    toast(player.x - 20, player.y - 24, 'EXTRA LIFE!', '#ffd94a');
  }
}

// ------------------------------ PLAYER UPDATE -------------------------------

function updatePlayer() {
  const p = player;
  p.anim++;
  if (p.invuln > 0) p.invuln--;
  if (p.shootCd > 0) p.shootCd--;
  if (p.doorMsgCd > 0) p.doorMsgCd--;
  if (p.coyote > 0) p.coyote--;

  // Horizontal
  if (keys.left)  { p.vx = Math.max(p.vx - ACC, -MAX_RUN); p.facing = -1; }
  else if (keys.right) { p.vx = Math.min(p.vx + ACC, MAX_RUN); p.facing = 1; }
  else { p.vx *= FRICTION; if (Math.abs(p.vx) < 0.1) p.vx = 0; }

  // Pogo toggle
  if (pressed.pogo) {
    p.pogo = !p.pogo;
    Sfx.select();
    toast(p.x - 6, p.y - 14, p.pogo ? 'POGO ON' : 'POGO OFF', '#c9ced9');
  }

  // Jumping
  if (p.pogo) {
    if (p.onGround) {
      const mega = keys.jump;
      p.vy = mega ? POGO_MEGA_V : POGO_V;
      p.onGround = false;
      if (mega) Sfx.megaPogo(); else Sfx.pogo();
      burst(p.x + p.w / 2, p.y + p.h, '#c9ced9', 4, 1.5);
    }
  } else {
    if (pressed.jump && (p.onGround || p.coyote > 0)) {
      p.vy = JUMP_V;
      p.onGround = false;
      p.coyote = 0;
      Sfx.jump();
    }
    if (!keys.jump && p.vy < -4) p.vy = -4;   // jump cut for variable height
  }

  // Shooting
  if (pressed.shoot && p.shootCd <= 0) {
    if (G.ammo > 0) {
      G.ammo--;
      p.shootCd = 16;
      const sy = p.y + 14;
      const sx = p.facing > 0 ? p.x + p.w : p.x - 8;
      shots.push({ x: sx, y: sy, vx: SHOT_SPEED * p.facing, life: 70 });
      Sfx.shoot();
      burst(sx + (p.facing > 0 ? 4 : 4), sy + 2, '#ffd94a', 3, 1);
    } else {
      p.shootCd = 16;
      toast(p.x - 4, p.y - 14, 'NO AMMO!', '#ff8080');
    }
  }

  // Gravity
  p.vy = Math.min(p.vy + GRAV, MAX_FALL);

  const wasGround = p.onGround;
  const res = moveEntity(p, { player: true });
  p.onGround = res.onGround;
  if (wasGround && !p.onGround && p.vy >= 0) p.coyote = 6;

  // Fell off the planet
  if (p.y > level.pxH + 80) { killPlayer(true); return; }

  // Tile interactions over the player's rectangle
  const c0 = Math.floor(p.x / T), c1 = Math.floor((p.x + p.w - 1) / T);
  const r0 = Math.floor(p.y / T), r1 = Math.floor((p.y + p.h - 1) / T);
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const ch = tileAt(c, r);
      if (ITEMS[ch]) collectItem(c, r, ch);
      else if (ch === 'S') {
        // Spikes only bite on their pointy upper half
        const spikeTop = r * T + 8;
        if (p.y + p.h > spikeTop) hurtPlayer();
      } else if (ch === 'E') {
        levelClear();
        return;
      }
    }
  }
}

function collectItem(c, r, ch) {
  level.grid[r][c] = '.';
  const x = c * T + T / 2, y = r * T + T / 2;
  switch (ch) {
    case '*': addScore(100); toast(x - 10, y - 10, '100', '#ff9ac0'); burst(x, y, '#ff4a8a', 6, 1.5); Sfx.pickup(); break;
    case '%': addScore(250); toast(x - 10, y - 10, '250', '#ffd0d0'); burst(x, y, '#e03a3a', 8, 2); Sfx.soda(); break;
    case 'A': G.ammo += 4; toast(x - 14, y - 10, 'AMMO +4', '#ffd94a'); burst(x, y, '#ffd94a', 6, 1.5); Sfx.ammo(); break;
    case 'H':
      if (player.hearts < 3) player.hearts++;
      else addScore(200);
      toast(x - 6, y - 10, '<3', '#ff3a5c'); burst(x, y, '#ff3a5c', 8, 2); Sfx.heart();
      break;
    case 'r': level.keys.red = true; addScore(500); toast(x - 24, y - 10, 'RED KEYCARD', '#ff8090'); burst(x, y, '#ff5060', 10, 2); Sfx.key(); break;
    case 'g': level.keys.green = true; addScore(500); toast(x - 30, y - 10, 'GREEN KEYCARD', '#80ffa0'); burst(x, y, '#50e070', 10, 2); Sfx.key(); break;
  }
}

function hurtPlayer() {
  const p = player;
  if (p.invuln > 0) return;
  p.hearts--;
  Sfx.hurt();
  burst(p.x + p.w / 2, p.y + p.h / 2, '#ff3a5c', 10, 2.5);
  if (p.hearts <= 0) { killPlayer(false); return; }
  p.invuln = 90;
  p.vy = -6;
  p.vx = p.facing * -3;
}

function killPlayer(fell) {
  Sfx.die();
  G.state = 'DYING';
  G.stateTime = 0;
  player.vy = fell ? -4 : -10;
  player.vx = 0;
}

function levelClear() {
  addScore(1000);
  Sfx.levelClear();
  G.state = 'LEVELCLEAR';
  G.stateTime = 0;
}

// ------------------------------ ENEMY UPDATE --------------------------------

function updateEnemies() {
  for (const e of enemies) {
    e.anim++;
    if (e.stunned) {
      e.stunTime++;
      e.vx = 0;
      e.vy = Math.min(e.vy + GRAV, MAX_FALL);
      moveEntity(e);
      continue;
    }

    if (e.kind === 'boinger') {
      e.vy = Math.min(e.vy + GRAV, MAX_FALL);
      const res = moveEntity(e);
      if (res.hitX) { e.dir *= -1; }
      if (res.onGround) {
        e.vy = -8.5;
        e.vx = e.dir * e.speed;
      }
    } else {
      // Walkers: gloop & krawler
      let sp = e.speed;
      if (e.kind === 'krawler') {
        const sameRow = Math.abs((e.y + e.h) - (player.y + player.h)) < T * 1.5;
        const seesYou = sameRow && Math.abs(player.x - e.x) < T * 6 &&
                        Math.sign(player.x - e.x) === e.dir;
        if (seesYou) sp = 2.6;
      }
      e.vx = e.dir * sp;
      e.vy = Math.min(e.vy + GRAV, MAX_FALL);
      const res = moveEntity(e);
      if (res.hitX) e.dir *= -1;
      if (res.onGround) {
        // Turn at ledges: is there ground under the leading edge?
        const aheadX = e.dir > 0 ? e.x + e.w + 2 : e.x - 2;
        const c = Math.floor(aheadX / T);
        const r = Math.floor((e.y + e.h + 2) / T);
        const below = tileAt(c, r);
        if (!isSolid(below) && below !== '-' && below !== 'S') e.dir *= -1;
      }
    }

    // Contact with the player
    if (overlap(e, player)) {
      const stompable = player.vy > 0 &&
        (player.y + player.h) - e.y < 16;
      if (stompable) {
        stun(e, 'stomp');
        player.vy = player.pogo ? POGO_MEGA_V * 0.85 : -8;
        Sfx.stomp();
      } else {
        hurtPlayer();
      }
    }
  }
}

function stun(e, how) {
  if (e.stunned) return;
  e.stunned = true;
  e.stunTime = 0;
  e.vy = -3;
  addScore(how === 'zap' ? 100 : 75);
  toast(e.x, e.y - 12, how === 'zap' ? 'ZAPPED!' : 'BONK!', '#ffd94a');
  burst(e.x + e.w / 2, e.y + e.h / 2, '#ffd94a', 8, 2);
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

// ------------------------------ SHOT UPDATE ---------------------------------

function updateShots() {
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    s.x += s.vx;
    s.life--;
    let dead = s.life <= 0;

    const c = Math.floor((s.x + (s.vx > 0 ? 8 : 0)) / T);
    const r = Math.floor((s.y + 2) / T);
    if (isSolid(tileAt(c, r))) {
      burst(s.x + 4, s.y + 2, '#ffd94a', 5, 1.5);
      dead = true;
    }
    if (!dead) {
      for (const e of enemies) {
        if (!e.stunned && overlap({ x: s.x, y: s.y, w: 8, h: 4 }, e)) {
          stun(e, 'zap');
          Sfx.zapHit();
          dead = true;
          break;
        }
      }
    }
    if (dead) shots.splice(i, 1);
  }
}

// ---------------------------- FX / CAMERA UPDATE ----------------------------

function updateFx() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
  for (let i = toasts.length - 1; i >= 0; i--) {
    const t = toasts[i];
    t.y -= 0.5; t.life--;
    if (t.life <= 0) toasts.splice(i, 1);
  }
}

function updateCamera() {
  const target = player.x + player.w / 2 - VIEW_W / 2 + player.facing * 60;
  G.camX += (target - G.camX) * 0.08;
  G.camX = Math.max(0, Math.min(G.camX, level.pxW - VIEW_W));
}

// ------------------------------ BACKGROUNDS ---------------------------------

function makeBackground(theme) {
  const rnd = lcg(theme.seed * 7 + 3);
  const stars = [];
  for (let i = 0; i < 90; i++) {
    stars.push({ x: rnd() * VIEW_W * 2, y: rnd() * VIEW_H * 0.8, s: rnd() < 0.2 ? 2 : 1, tw: rnd() * 100 });
  }
  const far = [];
  for (let i = 0; i < 30; i++) {
    far.push({ x: i * 140 + rnd() * 60, w: 60 + rnd() * 110, h: 90 + rnd() * 170 });
  }
  const near = [];
  for (let i = 0; i < 40; i++) {
    near.push({ x: i * 110 + rnd() * 50, w: 40 + rnd() * 90, h: 50 + rnd() * 120 });
  }
  return { stars, far, near };
}

function drawBackground(theme) {
  // Sky
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  grad.addColorStop(0, theme.skyTop);
  grad.addColorStop(1, theme.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // Stars
  ctx.fillStyle = '#ffffff';
  for (const st of bg.stars) {
    const x = (st.x - G.camX * 0.1) % (VIEW_W * 2);
    const sx = x < 0 ? x + VIEW_W * 2 : x;
    if (sx > VIEW_W) continue;
    const blink = (G.time + st.tw) % 120 < 100;
    if (!blink) continue;
    ctx.globalAlpha = st.s === 2 ? 0.9 : 0.55;
    ctx.fillRect(sx, st.y, st.s, st.s);
  }
  ctx.globalAlpha = 1;

  if (theme.type === 'canyon') {
    // Two moons
    ctx.fillStyle = '#e8d8b0';
    ctx.beginPath(); ctx.arc(720 - G.camX * 0.04, 90, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c8b890';
    ctx.beginPath(); ctx.arc(712 - G.camX * 0.04, 84, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b0c8e0';
    ctx.beginPath(); ctx.arc(240 - G.camX * 0.05, 140, 18, 0, Math.PI * 2); ctx.fill();
  } else if (theme.type === 'reactor') {
    // Pulsing core glow
    const pulse = 0.25 + 0.15 * Math.sin(G.time * 0.05);
    const rg = ctx.createRadialGradient(VIEW_W / 2, VIEW_H, 50, VIEW_W / 2, VIEW_H, VIEW_H);
    rg.addColorStop(0, `rgba(255,60,40,${pulse})`);
    rg.addColorStop(1, 'rgba(255,60,40,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  } else if (theme.type === 'cave') {
    // Goo glow pools
    for (let i = 0; i < 5; i++) {
      const gx = ((i * 420 + 200) - G.camX * 0.35) % (VIEW_W + 500) - 200;
      const rg = ctx.createRadialGradient(gx, VIEW_H - 30, 8, gx, VIEW_H - 30, 130);
      rg.addColorStop(0, 'rgba(80,255,80,0.16)');
      rg.addColorStop(1, 'rgba(80,255,80,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(gx - 140, VIEW_H - 170, 280, 170);
    }
  }

  // Far silhouettes
  ctx.fillStyle = theme.far;
  for (const m of bg.far) {
    const x = (m.x - G.camX * 0.25) % (30 * 140);
    const sx = x < -200 ? x + 30 * 140 : x;
    if (sx > VIEW_W + 100 || sx < -200) continue;
    if (theme.type === 'cave') {
      ctx.beginPath();
      ctx.moveTo(sx, 0); ctx.lineTo(sx + m.w, 0);
      ctx.lineTo(sx + m.w / 2, m.h * 0.9);
      ctx.closePath(); ctx.fill();
    } else {
      ctx.fillRect(sx, VIEW_H - m.h, m.w, m.h);
      ctx.fillRect(sx + m.w * 0.2, VIEW_H - m.h - 18, m.w * 0.6, 18);
    }
  }
  // Near silhouettes
  ctx.fillStyle = theme.near;
  for (const m of bg.near) {
    const x = (m.x - G.camX * 0.45) % (40 * 110);
    const sx = x < -200 ? x + 40 * 110 : x;
    if (sx > VIEW_W + 100 || sx < -200) continue;
    if (theme.type === 'cave') {
      ctx.beginPath();
      ctx.moveTo(sx, 0); ctx.lineTo(sx + m.w, 0);
      ctx.lineTo(sx + m.w / 2, m.h * 0.7);
      ctx.closePath(); ctx.fill();
    } else if (theme.type === 'reactor') {
      ctx.fillRect(sx, VIEW_H - m.h, m.w * 0.5, m.h);
      const on = Math.floor(G.time / 30 + m.x) % 2 === 0;
      ctx.fillStyle = on ? '#ff5a3a' : '#601810';
      ctx.fillRect(sx + m.w * 0.15, VIEW_H - m.h + 10, 6, 6);
      ctx.fillStyle = theme.near;
    } else {
      ctx.fillRect(sx, VIEW_H - m.h, m.w, m.h);
    }
  }
}

// ------------------------------- DRAWING ------------------------------------

function drawTiles() {
  const c0 = Math.max(0, Math.floor(G.camX / T));
  const c1 = Math.min(level.w - 1, Math.floor((G.camX + VIEW_W) / T));
  for (let r = 0; r < level.h; r++) {
    for (let c = c0; c <= c1; c++) {
      const ch = level.grid[r][c];
      if (ch === '.') continue;
      const x = Math.floor(c * T - G.camX);
      const y = r * T;
      if (tiles[ch]) {
        ctx.drawImage(tiles[ch], x, y);
      } else if (ch === '*') {
        drawItem(Sprites.items.candy, x, y, 3);
      } else if (ch === '%') {
        drawItem(Sprites.items.soda, x, y, 2);
      } else if (ch === 'A') {
        drawItem(Sprites.items.ammo, x, y, 2);
      } else if (ch === 'H') {
        drawItem(Sprites.items.heart, x, y, 3);
      } else if (ch === 'r') {
        drawItem(Sprites.items.keyRed, x, y, 4);
      } else if (ch === 'g') {
        drawItem(Sprites.items.keyGreen, x, y, 4);
      } else if (ch === 'E') {
        // Portal body; frame drawn after loop
        ctx.fillStyle = '#0c1230';
        ctx.fillRect(x, y, T, T);
        const tw = (G.time + c * 13 + r * 7) % 60;
        if (tw < 30) {
          ctx.fillStyle = '#8090ff';
          ctx.fillRect(x + 6 + (tw % 20), y + 4 + ((tw * 3) % 24), 3, 3);
        }
      }
    }
  }

  // Exit door dressing
  if (level.exitRect) {
    const er = level.exitRect;
    const x = Math.floor(er.c0 * T - G.camX);
    const y = er.r0 * T;
    const w = (er.c1 - er.c0 + 1) * T;
    const h = (er.r1 - er.r0 + 1) * T;
    if (x > -w - 60 && x < VIEW_W + 60) {
      ctx.strokeStyle = '#8090ff';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      const on = Math.floor(G.time / 20) % 2 === 0;
      ctx.fillStyle = on ? '#aaffcc' : '#3a6a5a';
      ctx.font = 'bold 16px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('EXIT', x + w / 2, y - 8);
      ctx.textAlign = 'left';
    }
  }
}

// Item sprites float and bob inside their tile.
function drawItem(img, x, y, bobSeed) {
  const bob = Math.sin(G.time * 0.08 + bobSeed) * 3;
  ctx.drawImage(img, Math.floor(x + (T - img.width) / 2), Math.floor(y + (T - img.height) / 2 + bob));
}

function drawPlayer() {
  const p = player;
  if (p.invuln > 0 && Math.floor(G.time / 4) % 2 === 0) return;  // blink

  const set = p.facing > 0 ? Sprites.zoe : Sprites.zoeL;
  let img;
  if (p.pogo) img = set.pogo;
  else if (!p.onGround) img = set.jump;
  else if (Math.abs(p.vx) > 0.5) img = (Math.floor(p.anim / 7) % 2 === 0) ? set.run1 : set.run2;
  else img = set.idle;

  const dx = Math.floor(p.x - G.camX - (img.width - p.w) / 2);
  const dy = Math.floor(p.y + p.h - img.height);
  ctx.drawImage(img, dx, dy);
}

function drawEnemies() {
  for (const e of enemies) {
    const set = Sprites[e.kind];
    let img;
    if (e.stunned) img = e.dir > 0 ? set.stunL : set.stun;
    else {
      const f = Math.floor(e.anim / 9) % 2 === 0;
      img = e.dir > 0 ? (f ? set.f1L : set.f2L) : (f ? set.f1 : set.f2);
    }
    const dx = Math.floor(e.x - G.camX - (img.width - e.w) / 2);
    const dy = Math.floor(e.y + e.h - img.height);
    if (dx < -60 || dx > VIEW_W + 60) continue;
    ctx.drawImage(img, dx, dy);

    // Dizzy stars over freshly stunned enemies
    if (e.stunned && e.stunTime < 150) {
      const a = e.stunTime * 0.15;
      for (let i = 0; i < 3; i++) {
        const ang = a + i * (Math.PI * 2 / 3);
        const sx = e.x + e.w / 2 + Math.cos(ang) * 12 - G.camX;
        const sy = e.y - 8 + Math.sin(ang) * 4;
        ctx.fillStyle = '#ffd94a';
        ctx.fillRect(Math.floor(sx), Math.floor(sy), 3, 3);
      }
    }
  }
}

function drawShots() {
  for (const s of shots) {
    ctx.drawImage(Sprites.shot, Math.floor(s.x - G.camX), Math.floor(s.y));
  }
}

function drawFx() {
  for (const p of particles) {
    ctx.globalAlpha = Math.min(1, p.life / 15);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.floor(p.x - G.camX), Math.floor(p.y), p.size, p.size);
  }
  ctx.globalAlpha = 1;
  ctx.font = 'bold 13px "Courier New"';
  for (const t of toasts) {
    ctx.globalAlpha = Math.min(1, t.life / 20);
    ctx.fillStyle = '#000000';
    ctx.fillText(t.text, Math.floor(t.x - G.camX) + 1, Math.floor(t.y) + 1);
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, Math.floor(t.x - G.camX), Math.floor(t.y));
  }
  ctx.globalAlpha = 1;
}

function drawHud() {
  // Backing strip
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, VIEW_W, 34);

  ctx.font = 'bold 16px "Courier New"';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`SCORE ${String(G.score).padStart(7, '0')}`, 12, 22);

  // Hearts
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = i < player.hearts ? 1 : 0.22;
    ctx.drawImage(Sprites.items.heart, 210 + i * 22, 9);
  }
  ctx.globalAlpha = 1;

  // Ammo
  ctx.drawImage(Sprites.items.ammo, 300, 9);
  ctx.fillStyle = '#ffd94a';
  ctx.fillText(`x${G.ammo}`, 322, 22);

  // Keys
  let kx = 390;
  if (level.keys.red)   { ctx.drawImage(Sprites.items.keyRed, kx, 12); kx += 34; }
  if (level.keys.green) { ctx.drawImage(Sprites.items.keyGreen, kx, 12); }

  // Lives (little Zoe heads) + level name
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`ZOE x${G.lives}`, 480, 22);
  ctx.fillStyle = '#a0a0ff';
  ctx.textAlign = 'right';
  ctx.fillText(`${level.def.name}`, VIEW_W - 12, 22);
  ctx.textAlign = 'left';

  if (player.pogo) {
    ctx.fillStyle = '#c9ced9';
    ctx.fillText('POGO', 590, 22);
  }
}

// --------------------------- SCREEN / TEXT HELPERS ---------------------------

function dimScreen(a = 0.72) {
  ctx.fillStyle = `rgba(4,2,12,${a})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function bigText(text, y, size = 40, color = '#ffd94a') {
  ctx.font = `bold ${size}px "Courier New"`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000000';
  ctx.fillText(text, VIEW_W / 2 + 3, y + 3);
  ctx.fillStyle = color;
  ctx.fillText(text, VIEW_W / 2, y);
  ctx.textAlign = 'left';
}

function blinkText(text, y, size = 18, color = '#ffffff') {
  if (Math.floor(G.time / 25) % 2 === 0) bigText(text, y, size, color);
}

// ------------------------------ STATE SCREENS -------------------------------

function drawTitle() {
  // Space backdrop
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  grad.addColorStop(0, '#05030f');
  grad.addColorStop(1, '#1c0f38');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const rnd = lcg(42);
  for (let i = 0; i < 120; i++) {
    const x = rnd() * VIEW_W, y = rnd() * VIEW_H, s = rnd() < 0.15 ? 2 : 1;
    if ((G.time + i * 7) % 140 > 120) continue;
    ctx.globalAlpha = 0.3 + rnd() * 0.7;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, s, s);
  }
  ctx.globalAlpha = 1;

  // Planet
  ctx.fillStyle = '#5a3a7a';
  ctx.beginPath(); ctx.arc(VIEW_W - 130, 120, 70, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7a5a9a';
  ctx.beginPath(); ctx.arc(VIEW_W - 150, 100, 22, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#9a7aba';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(VIEW_W - 130, 125, 105, 22, -0.25, 0, Math.PI * 2);
  ctx.stroke();

  bigText('COMMANDER COMET', 170, 52);
  bigText('ESCAPE FROM GREXON-7', 215, 22, '#a0a0ff');

  // Big bouncing Zoe on her pogo
  const bounce = Math.abs(Math.sin(G.time * 0.06)) * 40;
  const img = Sprites.zoe.pogo;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 150, 300 - bounce, img.width * 3, img.height * 3);
  ctx.restore();

  ctx.font = 'bold 16px "Courier New"';
  ctx.fillStyle = '#c9ced9';
  ctx.textAlign = 'center';
  const lines = [
    'ARROWS / WASD .... RUN',
    'Z or SPACE ....... JUMP',
    'X ................ NEURAL ZAPPER',
    'C ................ POGO STICK',
  ];
  lines.forEach((l, i) => ctx.fillText(l, VIEW_W / 2 + 120, 300 + i * 26));
  ctx.textAlign = 'left';

  blinkText('PRESS ENTER TO START', 470, 22, '#aaffcc');
  bigText("(c) 2087 CARTER AEROSPACE (ZOE'S GARAGE)", 522, 12, '#6a5aa8');
}

function drawStory() {
  dimScreen(1);
  const page = STORY_PAGES[G.storyPage];
  bigText(`- ${G.storyPage + 1} -`, 90, 18, '#6a5aa8');
  ctx.font = 'bold 20px "Courier New"';
  ctx.textAlign = 'center';
  page.forEach((line, i) => {
    ctx.fillStyle = line === line.toUpperCase() && line.length > 0 ? '#ffd94a' : '#e0e0f0';
    ctx.fillText(line, VIEW_W / 2, 170 + i * 34);
  });
  ctx.textAlign = 'left';
  blinkText(G.storyPage < STORY_PAGES.length - 1 ? 'ENTER: NEXT' : 'ENTER: BLAST OFF!', 480, 18, '#aaffcc');
}

function drawLevelIntro() {
  dimScreen(1);
  bigText(`ZONE ${G.levelIdx + 1}`, 200, 24, '#a0a0ff');
  bigText(LEVELS[G.levelIdx].name, 260, 44);
  bigText(LEVELS[G.levelIdx].subtitle, 310, 17, '#c9ced9');
  blinkText('PRESS ENTER', 420, 20, '#aaffcc');
}

// ------------------------------ STATE MACHINE -------------------------------

function update() {
  G.time++;
  G.stateTime++;

  switch (G.state) {
    case 'TITLE':
      if (pressed.start) { Sfx.select(); G.state = 'STORY'; G.storyPage = 0; G.stateTime = 0; }
      break;

    case 'STORY':
      if (pressed.start) {
        Sfx.select();
        G.storyPage++;
        if (G.storyPage >= STORY_PAGES.length) {
          G.levelIdx = 0; G.score = 0; G.lives = 3; G.ammo = 6; G.nextLifeAt = 15000;
          loadLevel(0);
          G.state = 'LEVELINTRO';
        }
        G.stateTime = 0;
      }
      break;

    case 'LEVELINTRO':
      if (pressed.start) { Sfx.select(); G.state = 'PLAY'; G.stateTime = 0; }
      break;

    case 'PLAY':
      if (pressed.start) { G.state = 'PAUSE'; break; }
      if (pressed.mute) Sfx.toggleMute();
      updatePlayer();
      if (G.state !== 'PLAY') break;   // died or cleared during update
      updateEnemies();
      updateShots();
      updateFx();
      updateCamera();
      break;

    case 'PAUSE':
      if (pressed.start) G.state = 'PLAY';
      break;

    case 'DYING':
      player.vy += GRAV;
      player.y += player.vy;
      updateFx();
      if (G.stateTime > 90) {
        G.lives--;
        if (G.lives < 0) {
          Sfx.gameOver();
          G.state = 'GAMEOVER';
        } else {
          loadLevel(G.levelIdx);
          G.state = 'LEVELINTRO';
        }
        G.stateTime = 0;
      }
      break;

    case 'LEVELCLEAR':
      updateFx();
      if (G.stateTime > 40 && pressed.start) {
        Sfx.select();
        G.levelIdx++;
        if (G.levelIdx >= LEVELS.length) {
          Sfx.win();
          G.state = 'WIN';
        } else {
          loadLevel(G.levelIdx);
          G.state = 'LEVELINTRO';
        }
        G.stateTime = 0;
      }
      break;

    case 'GAMEOVER':
    case 'WIN':
      if (G.stateTime > 60 && pressed.start) {
        Sfx.select();
        G.state = 'TITLE';
        G.stateTime = 0;
      }
      break;
  }

  for (const k of Object.keys(pressed)) pressed[k] = false;
}

function render() {
  switch (G.state) {
    case 'TITLE':
      drawTitle();
      break;

    case 'STORY':
      drawStory();
      break;

    case 'LEVELINTRO':
      drawLevelIntro();
      break;

    case 'PLAY':
    case 'PAUSE':
    case 'DYING':
    case 'LEVELCLEAR': {
      drawBackground(level.def.theme);
      drawTiles();
      drawEnemies();
      if (G.state !== 'DYING' || Math.floor(G.time / 3) % 2 === 0) drawPlayer();
      drawShots();
      drawFx();
      drawHud();
      if (G.state === 'PAUSE') {
        dimScreen(0.55);
        bigText('PAUSED', 260, 44);
        blinkText('ENTER TO RESUME', 320, 18, '#aaffcc');
      } else if (G.state === 'LEVELCLEAR') {
        dimScreen(0.55);
        bigText('ZONE CLEAR!', 240, 44);
        bigText('+1000', 285, 24, '#aaffcc');
        if (G.stateTime > 40) blinkText('PRESS ENTER', 360, 20, '#aaffcc');
      }
      break;
    }

    case 'GAMEOVER':
      dimScreen(1);
      bigText('GAME OVER', 220, 52, '#ff5060');
      bigText('The Gloopian Empire keeps the candy...', 280, 18, '#c9ced9');
      bigText(`FINAL SCORE ${G.score}`, 330, 24);
      if (G.stateTime > 60) blinkText('PRESS ENTER', 420, 20, '#aaffcc');
      break;

    case 'WIN':
      dimScreen(1);
      bigText('YOU DID IT!', 130, 48);
      ctx.font = 'bold 19px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e0e0f0';
      const lines = [
        'The MEGA GOO REACTOR sputters, gurgles,',
        'and dies with a sad little burp.',
        '',
        "Earth's candy rains gently home by tractor beam.",
        'The Gloopian Empire files for bankruptcy.',
        '',
        'Zoe walks in the front door at 8:59 PM.',
        'Nobody ever knew.',
      ];
      lines.forEach((l, i) => ctx.fillText(l, VIEW_W / 2, 190 + i * 30));
      ctx.textAlign = 'left';
      bigText(`FINAL SCORE ${G.score}`, 460, 26);
      if (G.stateTime > 60) blinkText('PRESS ENTER', 510, 18, '#aaffcc');
      break;
  }
}

// -------------------------------- MAIN LOOP ---------------------------------

let last = performance.now();
let acc = 0;
const STEP = 1000 / 60;

function frame(now) {
  acc += Math.min(now - last, 100);
  last = now;
  while (acc >= STEP) {
    update();
    acc -= STEP;
  }
  render();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
