// ---------------------------------------------------------------------------
// levels.js — six handcrafted worlds, Keen-sized: every map is 30 tiles tall
// (almost two screens, with vertical camera scrolling) and 280-320 wide.
//
//   X  solid rock            B  solid brick / tech panel
//   -  one-way platform      S  goo spikes (hazard)
//   *  candy (100)           %  soda (250)
//   A  zapper ammo (+4)      H  heart (heal)
//   r  red keycard           R  red security door
//   g  green keycard         G  green security door
//   E  exit door             P  player start
//   1  Gloop                 2  Boinger                3  Krawler
//
// Maps are painted onto a grid with a tiny builder instead of hand-counted
// strings. Movement rules used throughout: a jump rises 3 tiles, so steps
// rise 2 and one-way platforms are spaced 3 apart; gaps are at most 5 wide.
// ---------------------------------------------------------------------------
'use strict';

const MAP_H = 30;

function blank(w, ch = '.') {
  const m = {
    w, h: MAP_H,
    g: Array.from({ length: MAP_H }, () => Array(w).fill(ch)),
    set(x, y, c) { if (x >= 0 && x < w && y >= 0 && y < MAP_H) m.g[y][x] = c; },
    rect(x0, y0, x1, y1, c) {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m.set(x, y, c);
    },
    rows() { return m.g.map(r => r.join('')); },
  };
  return m;
}

// --- structural motifs ------------------------------------------------------

// Solid floor from `top` down to bedrock.
function ground(m, x0, x1, top, ch = 'X') { m.rect(x0, top, x1, m.h - 1, ch); }
// Floating 2-thick ledge.
function ledge(m, x0, x1, top, ch = 'X') { m.rect(x0, top, x1, top + 1, ch); }
// 2x2 step block (approach ledges with rise-2 hops).
function step(m, x, top, ch = 'X') { m.rect(x, top, x + 1, top + 1, ch); }
// One-way platform.
function plat(m, x0, x1, y) { m.rect(x0, y, x1, y, '-'); }
// Spikes resting on the surface whose top is `surfTop` (spikes go one above).
function spikes(m, x0, x1, surfTop) { m.rect(x0, surfTop - 1, x1, surfTop - 1, 'S'); }
// Spike pit sunk 2 into a floor whose top is `top`.
function spikePit(m, x0, x1, top) {
  m.rect(x0, top, x1, top + 1, '.');
  m.rect(x0, top + 1, x1, top + 1, 'S');
}
// Bottomless pit through a floor whose top is `top`.
function pit(m, x0, x1, top) { m.rect(x0, top, x1, m.h - 1, '.'); }
// Locked door (3 tall, bottom on floor top-1) sealed by a pillar up to `sealTo`.
function door(m, x, floorTop, color, sealTo, pillarCh) {
  m.rect(x, floorTop - 3, x, floorTop - 1, color);
  m.rect(x, sealTo, x, floorTop - 4, pillarCh);
}
// Exit door: 2 wide, 3 tall, standing on a floor whose top is `floorTop`.
function exitDoor(m, x, floorTop) { m.rect(x, floorTop - 3, x + 1, floorTop - 1, 'E'); }
// Key floating over a small platform perch.
function keyPerch(m, x, y, keyCh) {
  m.set(x, y, keyCh);
  plat(m, x - 1, x + 1, y + 1);
}
// Climb shaft: a 4-wide gap in the storey divider with a platform zigzag
// below it. Lower floor top = `lowTop`, divider top = `divTop`.
function shaft(m, x, divTop, lowTop) {
  m.rect(x, divTop, x + 3, divTop + 1, '.');            // punch the gap
  plat(m, x, x + 1, lowTop - 3);
  plat(m, x + 2, x + 3, lowTop - 6);
  plat(m, x, x + 1, divTop + 3);
}
// Stamp a run of candy.
function candy(m, x0, x1, y) { m.rect(x0, y, x1, y, '*'); }

// Shared two-storey frame for enclosed levels: ceiling, side walls, lower
// floor (top 26) and a storey divider (top 14). Returns handy constants.
function twoStorey(m, ch) {
  m.rect(0, 0, m.w - 1, 1, ch);                          // ceiling
  m.rect(0, 0, 1, m.h - 1, ch);                          // left wall
  m.rect(m.w - 6, 0, m.w - 1, m.h - 1, ch);              // right wall
  ground(m, 2, m.w - 7, 26, 'X');                        // lower floor
  m.rect(2, 14, m.w - 7, 15, ch);                        // storey divider
  return { FLOOR: 26, DIV: 14, IN: 2, OUT: m.w - 7 };
}

// ============================ LEVEL 1: CRASH CANYON =========================
// Open canyon, one main floor plus two tiers of mesas. Teach the ropes.

function buildCanyon() {
  const m = blank(300);
  const F = 26;
  m.rect(294, 0, 299, m.h - 1, 'X');                     // right wall

  // Main floor with pits
  ground(m, 0, 40, F); ground(m, 45, 90, F); ground(m, 96, 150, F);
  ground(m, 155, 210, F); ground(m, 216, 293, F);
  spikes(m, 66, 68, F); spikes(m, 170, 172, F); spikes(m, 250, 252, F);

  // Mesa tier one (ledges, top 22) + approach steps (top 24)
  ledge(m, 14, 24, 22); step(m, 11, 24);
  ledge(m, 50, 64, 22); step(m, 47, 24);
  ledge(m, 116, 130, 22); step(m, 113, 24);
  ledge(m, 190, 204, 22); step(m, 187, 24);
  ledge(m, 226, 240, 22); step(m, 223, 24);

  // Mesa tier two (top 18) + steps standing on tier one (top 20)
  ledge(m, 8, 20, 18); step(m, 22, 20);
  ledge(m, 54, 70, 18); step(m, 50, 20);
  ledge(m, 110, 126, 18); step(m, 128, 20);
  ledge(m, 186, 198, 18); step(m, 200, 20);

  // Red key high on tier two; red door seals the floor route
  keyPerch(m, 115, 16, 'r');
  door(m, 180, F, 'R', 17, 'X');

  exitDoor(m, 288, F);

  // Items
  candy(m, 10, 13, F - 1); candy(m, 30, 33, F - 1); candy(m, 100, 104, F - 1);
  candy(m, 140, 143, F - 1); candy(m, 220, 224, F - 1); candy(m, 262, 265, F - 1);
  candy(m, 52, 56, 21); candy(m, 118, 122, 21); candy(m, 228, 231, 21);
  candy(m, 10, 14, 17); candy(m, 56, 60, 17); candy(m, 188, 192, 17);
  m.set(66, 17, '%'); m.set(194, 21, '%');
  m.set(48, F - 1, 'A'); m.set(160, F - 1, 'A');
  m.set(127, 21, 'H'); m.set(270, F - 1, 'H');

  // Cast
  m.set(3, F - 1, 'P');
  for (const x of [25, 75, 135, 240, 280]) m.set(x, F - 1, '1');
  for (const x of [105, 165, 260]) m.set(x, F - 1, '3');
  for (const x of [60, 200]) m.set(x, F - 1, '2');
  m.set(120, 21, '1'); m.set(232, 21, '3'); m.set(60, 17, '1');

  return m.rows();
}

// ========================== LEVEL 2: THE GOO CAVERNS ========================
// Enclosed two-storey cavern. Route: lower west -> shaft up -> red key on the
// upper storey -> back down -> red door -> green key in the deep east -> a
// second shaft -> green door -> exit on the upper storey.

function buildCaverns() {
  const m = blank(300);
  const { FLOOR: F, DIV } = twoStorey(m, 'X');

  shaft(m, 40, DIV, F);                                  // shaft 1 (west)
  shaft(m, 140, DIV, F);                                 // shaft 2 (mid-east)

  // --- lower storey
  spikePit(m, 60, 63, F); plat(m, 60, 61, F - 2);
  door(m, 120, F, 'R', 16, 'X');
  spikePit(m, 160, 164, F); plat(m, 161, 162, F - 2);
  spikes(m, 200, 202, F);
  spikePit(m, 238, 242, F); plat(m, 239, 240, F - 2);
  // green key nest in the deep east, ringed by spikes
  spikes(m, 262, 264, F); spikes(m, 274, 276, F);
  keyPerch(m, 269, F - 4, 'g');
  candy(m, 10, 14, F - 1); candy(m, 80, 84, F - 1); candy(m, 180, 184, F - 1);
  candy(m, 224, 228, F - 1); candy(m, 284, 287, F - 1);
  m.set(100, F - 1, 'A'); m.set(210, F - 1, '%');

  // --- upper storey (floor = divider top 14)
  spikes(m, 70, 72, DIV); spikes(m, 180, 182, DIV);
  spikePit(m, 100, 103, DIV);
  ledge(m, 60, 74, 10); step(m, 57, 12);                 // west gallery ledge
  keyPerch(m, 80, 12, 'r');
  door(m, 110, DIV, 'R', 2, 'X');                        // upper red door: no bypassing
  door(m, 160, DIV, 'G', 2, 'X');
  ledge(m, 220, 236, 10); step(m, 217, 12);
  candy(m, 30, 34, DIV - 1); candy(m, 62, 66, 9); candy(m, 128, 132, DIV - 1);
  candy(m, 222, 226, 9); candy(m, 250, 254, DIV - 1);
  m.set(96, DIV - 1, 'A'); m.set(230, 9, 'H'); m.set(68, 9, '%');
  exitDoor(m, 288, DIV);

  // hanging stalactites for atmosphere
  for (const x of [24, 90, 200, 260]) m.rect(x, 2, x, 3, 'X');

  // Cast
  m.set(4, F - 1, 'P');
  for (const x of [22, 90, 185, 226, 282]) m.set(x, F - 1, '1');
  for (const x of [70, 205, 250]) m.set(x, F - 1, '3');
  for (const x of [55, 150, 220]) m.set(x, F - 1, '2');
  for (const x of [34, 120, 200, 262]) m.set(x, DIV - 1, '1');
  for (const x of [92, 244]) m.set(x, DIV - 1, '3');
  m.set(66, 9, '1'); m.set(228, 9, '3');

  return m.rows();
}

// =========================== LEVEL 3: REACTOR ANNEX =========================
// Enclosed two-storey machine works. Same bones as the caverns but mirrored
// colors, more spikes, and meaner placement.

function buildAnnex() {
  const m = blank(300);
  const { FLOOR: F, DIV } = twoStorey(m, 'B');

  shaft(m, 50, DIV, F);
  shaft(m, 180, DIV, F);

  // --- lower storey
  spikePit(m, 28, 32, F); plat(m, 29, 30, F - 2);
  door(m, 140, F, 'G', 16, 'B');
  spikes(m, 100, 103, F);
  spikePit(m, 160, 165, F); plat(m, 161, 162, F - 2);
  spikes(m, 205, 208, F);
  spikePit(m, 228, 233, F); plat(m, 229, 230, F - 2);
  // red key nest, deep east
  spikes(m, 252, 254, F); spikes(m, 266, 268, F);
  keyPerch(m, 260, F - 4, 'r');
  candy(m, 12, 16, F - 1); candy(m, 70, 74, F - 1); candy(m, 148, 152, F - 1);
  candy(m, 214, 218, F - 1); candy(m, 280, 284, F - 1);
  m.set(90, F - 1, 'A'); m.set(220, F - 1, '%'); m.set(285, F - 1, 'H');

  // --- upper storey
  spikes(m, 34, 37, DIV); spikes(m, 120, 123, DIV); spikes(m, 200, 202, DIV);
  spikePit(m, 74, 77, DIV);
  ledge(m, 84, 98, 10); step(m, 81, 12);
  keyPerch(m, 90, 8, 'g');                               // green key up high
  door(m, 150, DIV, 'G', 2, 'B');                        // upper green door: no bypassing
  door(m, 210, DIV, 'R', 2, 'B');
  ledge(m, 240, 254, 10); step(m, 237, 12);
  candy(m, 26, 30, DIV - 1); candy(m, 86, 90, 9); candy(m, 152, 156, DIV - 1);
  candy(m, 242, 246, 9); candy(m, 268, 272, DIV - 1);
  m.set(110, DIV - 1, 'A'); m.set(248, 9, 'H');
  exitDoor(m, 288, DIV);

  // Cast
  m.set(4, F - 1, 'P');
  for (const x of [20, 80, 130, 196, 276]) m.set(x, F - 1, '1');
  for (const x of [60, 110, 216, 248]) m.set(x, F - 1, '3');
  for (const x of [45, 155, 240, 272]) m.set(x, F - 1, '2');
  for (const x of [28, 108, 160, 230]) m.set(x, DIV - 1, '1');
  for (const x of [56, 144, 264]) m.set(x, DIV - 1, '3');
  for (const x of [130, 222]) m.set(x, DIV - 1, '2');
  m.set(94, 9, '3');

  return m.rows();
}

// ========================== LEVEL 4: THE SLIME SEWERS =======================
// Enclosed two-storey sludge works: shorter than the annex but soaked in
// spikes, with tight platform hops on both storeys.

function buildSewers() {
  const m = blank(280);
  const { FLOOR: F, DIV } = twoStorey(m, 'X');

  shaft(m, 36, DIV, F);
  shaft(m, 150, DIV, F);

  // --- lower storey: long spike runs bridged by platforms
  spikes(m, 56, 62, F); plat(m, 55, 63, F - 3);
  candy(m, 56, 62, F - 4);
  door(m, 110, F, 'R', 16, 'X');
  spikePit(m, 126, 131, F); plat(m, 127, 128, F - 2);
  spikes(m, 170, 177, F); plat(m, 169, 178, F - 3);
  candy(m, 170, 177, F - 4);
  spikePit(m, 196, 200, F); plat(m, 197, 198, F - 2);
  spikes(m, 230, 232, F); spikes(m, 242, 244, F);
  keyPerch(m, 237, F - 4, 'g');                          // green key between spikes
  candy(m, 10, 14, F - 1); candy(m, 90, 94, F - 1); candy(m, 214, 218, F - 1);
  m.set(80, F - 1, 'A'); m.set(258, F - 1, '%');

  // --- upper storey
  spikes(m, 52, 56, DIV); spikes(m, 96, 99, DIV);
  spikePit(m, 120, 124, DIV);
  ledge(m, 62, 76, 10); step(m, 59, 12);
  keyPerch(m, 70, 8, 'r');
  door(m, 130, DIV, 'R', 2, 'X');                        // upper red door: no bypassing
  door(m, 200, DIV, 'G', 2, 'X');
  spikes(m, 178, 181, DIV);
  ledge(m, 216, 230, 10); step(m, 213, 12);
  candy(m, 26, 30, DIV - 1); candy(m, 64, 68, 9); candy(m, 140, 144, DIV - 1);
  candy(m, 218, 222, 9); candy(m, 244, 248, DIV - 1);
  m.set(132, DIV - 1, 'A'); m.set(224, 9, 'H');
  exitDoor(m, 268, DIV);

  for (const x of [28, 104, 188, 250]) m.rect(x, 2, x, 3, 'X');

  // Cast
  m.set(4, F - 1, 'P');
  for (const x of [20, 88, 142, 210, 252]) m.set(x, F - 1, '1');
  for (const x of [70, 118, 190, 226]) m.set(x, F - 1, '3');
  for (const x of [48, 160, 248]) m.set(x, F - 1, '2');
  for (const x of [22, 90, 134, 240]) m.set(x, DIV - 1, '1');
  for (const x of [46, 154, 208]) m.set(x, DIV - 1, '3');
  for (const x of [108, 252]) m.set(x, DIV - 1, '2');
  m.set(66, 9, '1'); m.set(226, 9, '3');

  return m.rows();
}

// =========================== LEVEL 5: THE JUNK FLEET ========================
// Open sky, no divider: three altitude bands of floating wrecks over a
// bottomless drop, chained together with one-way platforms.

function buildFleet() {
  const m = blank(280);
  m.rect(274, 0, 279, m.h - 1, 'X');                     // right-hand hulk

  // Low band islands (top 26)
  const low = [[0, 14], [22, 30], [40, 52], [62, 70], [84, 96], [110, 118],
               [130, 142], [158, 166], [180, 192], [204, 212], [224, 273]];
  for (const [a, b] of low) ground(m, a, b, 26);
  // platform stitches over the gaps
  plat(m, 16, 19, 23); plat(m, 33, 36, 23); plat(m, 55, 58, 23);
  plat(m, 73, 79, 23); plat(m, 99, 106, 23); plat(m, 121, 126, 23);
  plat(m, 145, 154, 23); plat(m, 169, 176, 23); plat(m, 195, 200, 23);
  plat(m, 215, 220, 23); plat(m, 226, 230, 23);

  // Mid band wreck decks (top 20) and high band (top 16)
  const mid = [[26, 36], [66, 78], [104, 116], [148, 158], [188, 198], [232, 242]];
  for (const [a, b] of mid) ledge(m, a, b, 20);
  const high = [[30, 40], [70, 80], [108, 118], [152, 162], [192, 202]];
  for (const [a, b] of high) ledge(m, a, b, 16);
  // steps from mid to high (rise 2, standing on mid decks)
  step(m, 26, 18); step(m, 66, 18); step(m, 104, 18); step(m, 148, 18); step(m, 192, 18);

  keyPerch(m, 113, 14, 'r');                             // red key, high band
  keyPerch(m, 157, 14, 'g');                             // green key, high band
  door(m, 136, 26, 'R', 0, 'X');                         // sky-high pillar doors
  door(m, 246, 26, 'G', 0, 'X');
  exitDoor(m, 264, 26);

  candy(m, 8, 12, 25); candy(m, 44, 48, 25); candy(m, 86, 90, 25);
  candy(m, 131, 135, 25); candy(m, 182, 186, 25); candy(m, 226, 230, 25);
  candy(m, 28, 32, 19); candy(m, 68, 72, 19); candy(m, 150, 154, 19);
  candy(m, 234, 238, 19);
  candy(m, 32, 36, 15); candy(m, 72, 76, 15); candy(m, 194, 198, 15);
  m.set(110, 15, '%'); m.set(196, 15, '%');
  m.set(64, 25, 'A'); m.set(206, 25, 'A');
  m.set(236, 19, 'H'); m.set(76, 15, 'H');

  // Cast (gloops on small islands, they watch their step)
  m.set(3, 25, 'P');
  for (const x of [26, 46, 88, 114, 184, 228]) m.set(x, 25, '1');
  for (const x of [66, 134, 208, 256]) m.set(x, 25, '3');
  m.set(250, 25, '2'); m.set(162, 25, '1');
  for (const x of [30, 70, 108, 152, 236]) m.set(x, 19, '1');
  m.set(192, 19, '3'); m.set(112, 15, '1'); m.set(156, 15, '3');

  return m.rows();
}

// =========================== LEVEL 6: THE GOO THRONE ========================
// The longest gauntlet: enclosed two-storey fortress, three shafts, spike
// corridors on both floors, and a packed throne room before the exit.

function buildThrone() {
  const m = blank(320);
  const { FLOOR: F, DIV } = twoStorey(m, 'B');

  shaft(m, 44, DIV, F);
  shaft(m, 150, DIV, F);
  shaft(m, 250, DIV, F);

  // --- lower storey
  spikePit(m, 24, 28, F); plat(m, 25, 26, F - 2);
  spikes(m, 66, 72, F); plat(m, 65, 73, F - 3); candy(m, 66, 72, F - 4);
  door(m, 130, F, 'R', 16, 'B');
  spikePit(m, 108, 112, F); plat(m, 109, 110, F - 2);
  spikes(m, 168, 174, F); plat(m, 167, 175, F - 3); candy(m, 168, 174, F - 4);
  spikePit(m, 190, 195, F); plat(m, 191, 192, F - 2);
  spikes(m, 212, 214, F); spikes(m, 226, 228, F);
  keyPerch(m, 220, F - 4, 'g');                          // green key nest
  spikes(m, 274, 280, F); plat(m, 273, 281, F - 3);
  candy(m, 10, 14, F - 1); candy(m, 90, 94, F - 1); candy(m, 152, 156, F - 1);
  candy(m, 240, 244, F - 1); candy(m, 296, 300, F - 1);
  m.set(84, F - 1, 'A'); m.set(200, F - 1, '%'); m.set(302, F - 1, 'A');

  // --- upper storey
  spikes(m, 28, 31, DIV); spikes(m, 90, 93, DIV);
  spikePit(m, 64, 68, DIV);
  ledge(m, 94, 108, 10); step(m, 91, 12);
  keyPerch(m, 100, 8, 'r');                              // red key over spiked ledge
  spikes(m, 96, 98, 10);
  door(m, 120, DIV, 'R', 2, 'B');                        // upper red door: no bypassing
  spikePit(m, 130, 134, DIV);
  spikes(m, 180, 184, DIV);
  door(m, 260, DIV, 'G', 2, 'B');
  // throne room: candy hoard and the guard
  candy(m, 268, 272, DIV - 1); candy(m, 284, 288, DIV - 1); candy(m, 296, 300, DIV - 1);
  ledge(m, 288, 300, 10); step(m, 285, 12);
  candy(m, 290, 294, 9);
  m.set(298, 9, 'H');
  candy(m, 26, 30, DIV - 1); candy(m, 122, 126, DIV - 1); candy(m, 200, 204, DIV - 1);
  m.set(146, DIV - 1, 'A'); m.set(224, DIV - 1, '%');
  exitDoor(m, 308, DIV);

  // Cast — the heaviest roster in the game
  m.set(4, F - 1, 'P');
  for (const x of [18, 58, 98, 146, 208, 250, 290]) m.set(x, F - 1, '1');
  for (const x of [40, 120, 182, 236, 268]) m.set(x, F - 1, '3');
  for (const x of [80, 160, 232, 296]) m.set(x, F - 1, '2');
  for (const x of [24, 76, 140, 200, 270]) m.set(x, DIV - 1, '1');
  for (const x of [50, 118, 210, 284]) m.set(x, DIV - 1, '3');
  for (const x of [104, 176, 292]) m.set(x, DIV - 1, '2');
  m.set(98, 9, '3'); m.set(294, 9, '1');

  return m.rows();
}

// ------------------------------- THEMES -------------------------------------

const LEVELS = [
  {
    name: 'CRASH CANYON',
    subtitle: 'The Star Skipper is toast. The only way home is through.',
    map: buildCanyon(),
    diff: 1.0,
    theme: {
      type: 'canyon', seed: 101,
      skyTop: '#1a0f38', skyBottom: '#7a3a6a',
      far: '#3a2050', near: '#552d68',
      rock: '#c98a4b', rockDark: '#8a5a2b', rockLight: '#eebd80',
      brick: '#8a7aae', brickDark: '#584a80', brickLight: '#b8a8dc',
      platform: '#9a8ab8', platformLight: '#cabbe8', platformDark: '#5a4a80',
      spike: '#6ecc2f', spikeLight: '#b8f070',
    },
  },
  {
    name: 'THE GOO CAVERNS',
    subtitle: 'It smells like lime jello down here.',
    map: buildCaverns(),
    diff: 1.12,
    theme: {
      type: 'cave', seed: 202,
      skyTop: '#050d10', skyBottom: '#0e2a24',
      far: '#12332c', near: '#1b473c',
      rock: '#4a6a72', rockDark: '#2a4048', rockLight: '#70929c',
      brick: '#5a7a6a', brickDark: '#38503f', brickLight: '#88ae96',
      platform: '#6a9a84', platformLight: '#9ecfb4', platformDark: '#3a5a48',
      spike: '#4ae04a', spikeLight: '#a8ff98',
    },
  },
  {
    name: 'REACTOR ANNEX',
    subtitle: 'The machine hums louder the deeper you go.',
    map: buildAnnex(),
    diff: 1.25,
    theme: {
      type: 'reactor', seed: 303,
      skyTop: '#160812', skyBottom: '#3a1020',
      far: '#2c1226', near: '#421a30',
      rock: '#5a4a50', rockDark: '#38282e', rockLight: '#80686e',
      brick: '#6a7080', brickDark: '#3a4050', brickLight: '#9aa4b8',
      platform: '#8a90a4', platformLight: '#c2c8dc', platformDark: '#4a5060',
      spike: '#ff5a3a', spikeLight: '#ffb080',
    },
  },
  {
    name: 'THE SLIME SEWERS',
    subtitle: 'Something down here just burped.',
    map: buildSewers(),
    diff: 1.4,
    theme: {
      type: 'cave', seed: 404,
      skyTop: '#0a0612', skyBottom: '#1e1030',
      far: '#241638', near: '#332048',
      rock: '#5a5470', rockDark: '#38334a', rockLight: '#807a9c',
      brick: '#6a5a80', brickDark: '#443a58', brickLight: '#988ab4',
      platform: '#7a6a9a', platformLight: '#b0a0d4', platformDark: '#4a3f66',
      spike: '#b44ae0', spikeLight: '#e0a0ff',
    },
  },
  {
    name: 'THE JUNK FLEET',
    subtitle: 'Wrecked ships. Thin air. Do not look down.',
    map: buildFleet(),
    diff: 1.55,
    theme: {
      type: 'canyon', seed: 505,
      skyTop: '#0c1a30', skyBottom: '#3a5a80',
      far: '#26364e', near: '#31465e',
      rock: '#7a8494', rockDark: '#4e5665', rockLight: '#a8b2c4',
      brick: '#8a7a5a', brickDark: '#5a5040', brickLight: '#c0ac80',
      platform: '#98a4b8', platformLight: '#ccd8e8', platformDark: '#5a6478',
      spike: '#ffb03a', spikeLight: '#ffe0a0',
    },
  },
  {
    name: 'THE GOO THRONE',
    subtitle: "The reactor's heart. Bedtime is in ten minutes.",
    map: buildThrone(),
    diff: 1.7,
    theme: {
      type: 'reactor', seed: 606, glow: '60,255,120',
      skyTop: '#04120a', skyBottom: '#0e3a20',
      far: '#0e2c1a', near: '#164028',
      rock: '#3a5a44', rockDark: '#20362a', rockLight: '#5a8266',
      brick: '#4a6a56', brickDark: '#2c4436', brickLight: '#74a284',
      platform: '#6a9a7c', platformLight: '#a0d4b4', platformDark: '#3a5a46',
      spike: '#50ff50', spikeLight: '#c0ffc0',
    },
  },
];
