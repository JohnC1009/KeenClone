// ---------------------------------------------------------------------------
// levels.js — three handcrafted worlds, written as ASCII tile maps.
//
//   X  solid rock            B  solid brick / tech panel
//   -  one-way platform      S  goo spikes (hazard)
//   *  candy (100)           %  soda (250)
//   A  zapper ammo (+4)      H  heart (heal)
//   r  red keycard           R  red security door
//   g  green keycard         G  green security door
//   E  exit door             P  player start
//   1  Gloop                 2  Boinger                3  Krawler
//   .  empty
//
// Rows are exactly 17 tiles tall (one screen); maps scroll horizontally.
// Rows are composed from run-length helpers so columns stay exact.
// ---------------------------------------------------------------------------
'use strict';

const D = n => '.'.repeat(n);   // dots (empty)
const XX = n => 'X'.repeat(n);  // rock
const BB = n => 'B'.repeat(n);  // brick

// ============================ LEVEL 1: CRASH CANYON =========================

const L1_MAP = [
  /* r0 */ D(144) + BB(6),
  /* r1 */ D(144) + BB(6),
  /* r2 */ D(144) + BB(6),
  /* r3 */ D(144) + BB(6),
  /* r4 */ D(144) + BB(6),
  /* r5 */ D(144) + BB(6),
  /* r6 */ D(74) + 'r' + D(69) + BB(6),
  /* r7 */ D(73) + '---' + D(68) + BB(6),
  /* r8 */ D(84) + 'X' + D(59) + BB(6),
  /* r9 */ D(52) + '**' + D(30) + 'X' + D(57) + 'BB' + BB(6),
  /* r10*/ D(28) + '---' + D(21) + 'BB' + D(14) + '---' + D(13) + 'R' + D(18) + '*****' + D(34) + 'EE' + BB(6),
  /* r11*/ D(7) + '***' + D(10) + '***' + D(13) + '--' + D(14) + 'BB' + D(30) + 'R' + D(2) + '***' + D(7) + '--' + D(33) + '*****' + D(5) + 'EE' + BB(6),
  /* r12*/ D(3) + 'P' + D(20) + '1' + D(8) + 'A' + D(12) + '3' + D(5) + 'BB' + D(7) + 'H' + D(2) + '2' + D(19) + 'R' + D(5) + '1' + D(14) + '2' + D(3) + '%' + D(2) + '3' + D(2) + 'A' + D(12) + '1' + D(8) + 'H' + D(4) + 'EE' + BB(6),
  /* r13*/ XX(15) + D(3) + XX(17) + D(4) + XX(17) + D(4) + XX(36) + D(4) + XX(19) + D(4) + XX(21) + BB(6),
  /* r14*/ XX(15) + D(3) + XX(17) + 'SSSS' + XX(17) + D(4) + XX(36) + 'SSSS' + XX(19) + D(4) + XX(21) + BB(6),
  /* r15*/ XX(15) + D(3) + XX(38) + D(4) + XX(59) + D(4) + XX(21) + BB(6),
  /* r16*/ XX(15) + D(3) + XX(38) + D(4) + XX(59) + D(4) + XX(21) + BB(6),
];

// ========================== LEVEL 2: THE GOO CAVERNS ========================
// Expanded: 210 tiles wide, both keycards, a two-tier ledge section, three
// spike zones and six pits.

const L2_MAP = [
  /* r0 */ XX(198) + BB(12),
  /* r1 */ XX(198) + BB(12),
  /* r2 */ 'X' + D(24) + 'X' + D(60) + 'X' + D(80) + 'X' + D(30) + BB(12),
  /* r3 */ 'X' + D(24) + 'X' + D(60) + 'X' + D(80) + 'X' + D(30) + BB(12),
  /* r4 */ 'X' + D(85) + 'X' + D(80) + 'X' + D(30) + BB(12),
  /* r5 */ 'X' + D(85) + 'X' + D(80) + 'X' + D(30) + BB(12),
  /* r6 */ 'X' + D(72) + 'r' + D(12) + 'X' + D(62) + 'g' + D(17) + 'X' + D(30) + BB(12),
  /* r7 */ 'X' + D(71) + '---' + D(11) + 'X' + D(61) + '---' + D(16) + 'X' + D(30) + BB(12),
  /* r8 */ 'X' + D(85) + 'X' + D(43) + '**' + '1' + '**' + D(32) + 'X' + D(30) + BB(12),
  /* r9 */ 'X' + D(85) + 'X' + D(41) + XX(9) + D(30) + 'X' + D(28) + 'BB' + BB(12),
  /* r10*/ 'X' + D(67) + '---' + D(15) + 'R' + D(57) + '---' + D(20) + 'G' + D(28) + 'EE' + BB(12),
  /* r11*/ 'X' + D(17) + '****' + D(15) + '*' + D(5) + '*' + D(4) + '*****' + D(33) + 'R' + D(7) + '***' + D(3) + '--' + D(24) + '--' + D(32) + '--' + D(5) + 'G' + D(4) + '*****' + D(12) + '*****' + D(2) + 'EE' + BB(12),
  /* r12*/ 'X' + D(2) + 'P' + D(18) + '1' + D(13) + '---' + D(3) + '---' + D(7) + '3' + D(5) + '%' + D(18) + '1' + D(8) + 'R' + D(5) + '2' + D(15) + '3' + D(2) + 'A' + D(3) + '3' + D(2) + '2' + D(11) + '3' + D(5) + '1' + D(16) + '1' + D(2) + '2' + D(10) + 'G' + D(3) + '3' + D(2) + '2' + D(2) + '1' + D(10) + '1' + D(3) + '3' + D(1) + 'H' + D(1) + 'EE' + BB(12),
  /* r13*/ XX(13) + D(3) + XX(15) + D(15) + XX(15) + D(4) + XX(34) + D(4) + XX(18) + D(4) + XX(34) + D(4) + XX(18) + D(4) + XX(13) + BB(12),
  /* r14*/ XX(13) + D(3) + XX(15) + '..2....SSS.....' + XX(15) + D(4) + XX(34) + 'SSSS' + XX(18) + D(4) + XX(34) + 'SSSS' + XX(18) + D(4) + XX(13) + BB(12),
  /* r15*/ XX(13) + D(3) + XX(45) + D(4) + XX(56) + D(4) + XX(56) + D(4) + XX(13) + BB(12),
  /* r16*/ XX(13) + D(3) + XX(45) + D(4) + XX(56) + D(4) + XX(56) + D(4) + XX(13) + BB(12),
];

// =========================== LEVEL 3: REACTOR ANNEX =========================
// Expanded: 210 tiles wide, a second full spike gauntlet past the green door
// and a longer enemy gauntlet before the exit.

const L3_MAP = [
  /* r0 */ BB(210),
  /* r1 */ BB(210),
  /* r2 */ 'B' + D(73) + 'B' + D(59) + 'B' + D(67) + BB(8),
  /* r3 */ 'B' + D(73) + 'B' + D(59) + 'B' + D(67) + BB(8),
  /* r4 */ 'B' + D(73) + 'B' + D(59) + 'B' + D(67) + BB(8),
  /* r5 */ 'B' + D(73) + 'B' + D(59) + 'B' + D(67) + BB(8),
  /* r6 */ 'B' + D(56) + 'r' + D(16) + 'B' + D(37) + 'g' + D(21) + 'B' + D(67) + BB(8),
  /* r7 */ 'B' + D(55) + '---' + D(15) + 'B' + D(36) + '---' + D(20) + 'B' + D(67) + BB(8),
  /* r8 */ 'B' + D(73) + 'B' + D(59) + 'B' + D(67) + BB(8),
  /* r9 */ 'B' + D(39) + '*' + D(33) + 'B' + D(12) + '*****' + D(42) + 'B' + D(24) + '*' + D(26) + '****' + D(7) + 'BB' + D(3) + BB(8),
  /* r10*/ 'B' + D(38) + '---' + D(18) + '---' + D(11) + 'R' + D(11) + '-------' + D(14) + '---' + D(24) + 'G' + D(23) + '---' + D(24) + '------' + D(6) + 'EE' + D(3) + BB(8),
  /* r11*/ 'B' + D(18) + '*****' + D(11) + '*' + D(9) + '*' + D(28) + 'R' + D(59) + 'G' + D(12) + '*****' + D(2) + '*' + D(9) + '*' + D(32) + 'EE' + D(3) + BB(8),
  /* r12*/ 'B' + D(2) + 'P' + D(18) + '1' + D(5) + '3' + D(5) + '---' + D(7) + '---' + D(6) + '2' + D(2) + 'A' + D(2) + '2' + D(14) + 'R' + D(4) + '3' + D(2) + '%' + D(5) + 'SSS' + D(4) + '1' + D(2) + '3' + D(18) + '2' + D(3) + '3' + D(1) + 'H' + D(10) + 'G' + D(3) + '1' + D(3) + '2' + D(1) + 'A' + D(1) + '3' + D(6) + '---' + D(7) + '---' + D(4) + '2' + D(3) + '3' + D(3) + '1' + D(2) + '2' + D(4) + 'SSS' + D(4) + '1' + D(1) + 'H' + D(1) + 'EE' + D(3) + BB(8),
  /* r13*/ BB(13) + D(4) + BB(16) + D(16) + BB(16) + D(4) + BB(32) + D(4) + BB(20) + D(4) + BB(23) + D(16) + BB(42),
  /* r14*/ XX(13) + D(4) + XX(16) + 'S'.repeat(16) + XX(16) + D(4) + XX(32) + D(4) + XX(20) + D(4) + XX(23) + 'S'.repeat(16) + XX(34) + BB(8),
  /* r15*/ XX(13) + D(4) + XX(48) + D(4) + XX(32) + D(4) + XX(20) + D(4) + XX(73) + BB(8),
  /* r16*/ XX(13) + D(4) + XX(48) + D(4) + XX(32) + D(4) + XX(20) + D(4) + XX(73) + BB(8),
];

// ========================== LEVEL 4: THE SLIME SEWERS =======================

const L4_MAP = [
  /* r0 */ XX(162) + BB(8),
  /* r1 */ XX(162) + BB(8),
  /* r2 */ 'X' + D(39) + 'X' + D(27) + 'X' + D(21) + 'X' + D(31) + 'X' + D(7) + 'X' + D(31) + BB(8),
  /* r3 */ 'X' + D(39) + 'X' + D(27) + 'X' + D(21) + 'X' + D(31) + 'X' + D(7) + 'X' + D(31) + BB(8),
  /* r4 */ 'X' + D(39) + 'X' + D(27) + 'X' + D(53) + 'X' + D(7) + 'X' + D(31) + BB(8),
  /* r5 */ 'X' + D(67) + 'X' + D(53) + 'X' + D(39) + BB(8),
  /* r6 */ 'X' + D(52) + 'r' + D(14) + 'X' + D(34) + 'g' + D(18) + 'X' + D(39) + BB(8),
  /* r7 */ 'X' + D(51) + '---' + D(13) + 'X' + D(33) + '---' + D(17) + 'X' + D(39) + BB(8),
  /* r8 */ 'X' + D(67) + 'X' + D(53) + 'X' + D(39) + BB(8),
  /* r9 */ 'X' + D(35) + '*' + D(31) + 'X' + D(12) + '*******' + D(11) + 'H' + D(22) + 'X' + D(27) + '*****' + D(5) + 'BB' + BB(8),
  /* r10*/ 'X' + D(34) + '---' + D(10) + '---' + D(17) + 'R' + D(10) + '-----------' + D(8) + '---' + D(21) + 'G' + D(26) + '----------' + D(1) + 'EE' + BB(8),
  /* r11*/ 'X' + D(16) + '*****' + D(9) + '*' + D(9) + '*' + D(26) + 'R' + D(4) + '***' + D(46) + 'G' + D(4) + '*****' + D(5) + '--' + D(21) + 'EE' + BB(8),
  /* r12*/ 'X' + D(2) + 'P' + D(15) + '1' + D(4) + '3' + D(1) + '2' + D(20) + '2' + D(2) + '%' + D(1) + '3' + D(3) + '1' + D(11) + 'R' + D(1) + 'A' + D(1) + '3' + D(2) + '2' + D(4) + 'SSS' + D(1) + '1' + D(1) + 'SSS' + D(8) + '2' + D(8) + '3' + D(1) + 'A' + D(1) + '1' + D(11) + 'G' + D(3) + '1' + D(2) + '3' + D(2) + '2' + D(12) + '1' + D(2) + '3' + D(11) + 'EE' + BB(8),
  /* r13*/ XX(11) + D(5) + XX(13) + D(16) + XX(14) + D(5) + XX(27) + D(5) + XX(17) + D(5) + XX(18) + D(4) + XX(22) + BB(8),
  /* r14*/ XX(11) + D(5) + XX(13) + 'S'.repeat(16) + XX(14) + D(5) + XX(27) + D(5) + XX(17) + D(5) + XX(18) + 'SSSS' + XX(22) + BB(8),
  /* r15*/ XX(11) + D(5) + XX(43) + D(5) + XX(27) + D(5) + XX(17) + D(5) + XX(44) + BB(8),
  /* r16*/ XX(11) + D(5) + XX(43) + D(5) + XX(27) + D(5) + XX(17) + D(5) + XX(44) + BB(8),
];

// =========================== LEVEL 5: THE JUNK FLEET ========================

const L5_MAP = [
  /* r0 */ D(67) + 'X' + D(49) + 'X' + D(42) + BB(10),
  /* r1 */ D(67) + 'X' + D(49) + 'X' + D(42) + BB(10),
  /* r2 */ D(67) + 'X' + D(49) + 'X' + D(42) + BB(10),
  /* r3 */ D(67) + 'X' + D(49) + 'X' + D(42) + BB(10),
  /* r4 */ D(67) + 'X' + D(49) + 'X' + D(42) + BB(10),
  /* r5 */ D(67) + 'X' + D(49) + 'X' + D(42) + BB(10),
  /* r6 */ D(67) + 'X' + D(49) + 'X' + D(42) + BB(10),
  /* r7 */ D(60) + 'r' + D(6) + 'X' + D(39) + 'g' + D(9) + 'X' + D(42) + BB(10),
  /* r8 */ D(60) + '--' + D(5) + 'X' + D(38) + '--' + D(9) + 'X' + D(42) + BB(10),
  /* r9 */ D(46) + '**' + D(19) + 'X' + D(24) + '***' + D(22) + 'X' + D(12) + '**' + D(26) + 'BB' + BB(10),
  /* r10*/ D(32) + '--' + D(12) + 'BB' + D(8) + '--' + D(9) + 'R' + D(12) + '**' + D(9) + '-----' + D(6) + '--' + D(6) + '--' + D(5) + 'G' + D(12) + '--' + D(14) + '*****' + D(7) + 'EE' + BB(10),
  /* r11*/ D(17) + '--' + D(9) + '*' + D(7) + '*' + D(9) + 'BB' + D(19) + 'R' + D(12) + '--' + D(35) + 'G' + D(40) + 'EE' + BB(10),
  /* r12*/ D(3) + 'P' + D(10) + '--' + D(7) + '1' + D(4) + '--' + D(6) + '--' + D(6) + '3' + D(1) + 'BB' + D(1) + '1' + D(17) + 'R' + D(1) + 'A' + '2' + D(2) + '%' + D(18) + 'SSS' + D(2) + '3' + D(1) + '1' + D(17) + 'G' + D(2) + '1' + D(1) + '3' + D(18) + '1' + D(3) + '3' + D(3) + '2' + D(3) + '1' + D(2) + 'H' + D(1) + 'EE' + BB(10),
  /* r13*/ XX(13) + D(7) + XX(7) + D(14) + XX(10) + D(12) + XX(12) + D(14) + XX(12) + D(12) + XX(12) + D(12) + XX(23) + BB(10),
  /* r14*/ XX(13) + D(7) + XX(7) + D(14) + XX(10) + D(12) + XX(12) + D(14) + XX(12) + D(12) + XX(12) + D(12) + XX(23) + BB(10),
  /* r15*/ XX(13) + D(7) + XX(7) + D(14) + XX(10) + D(12) + XX(12) + D(14) + XX(12) + D(12) + XX(12) + D(12) + XX(23) + BB(10),
  /* r16*/ XX(13) + D(7) + XX(7) + D(14) + XX(10) + D(12) + XX(12) + D(14) + XX(12) + D(12) + XX(12) + D(12) + XX(23) + BB(10),
];

// =========================== LEVEL 6: THE GOO THRONE ========================

const L6_MAP = [
  /* r0 */ BB(180),
  /* r1 */ BB(180),
  /* r2 */ 'B' + D(71) + 'B' + D(69) + 'B' + D(29) + BB(8),
  /* r3 */ 'B' + D(71) + 'B' + D(69) + 'B' + D(29) + BB(8),
  /* r4 */ 'B' + D(71) + 'B' + D(69) + 'B' + D(29) + BB(8),
  /* r5 */ 'B' + D(71) + 'B' + D(69) + 'B' + D(29) + BB(8),
  /* r6 */ 'B' + D(60) + 'r' + D(10) + 'B' + D(53) + 'g' + D(15) + 'B' + D(29) + BB(8),
  /* r7 */ 'B' + D(59) + '---' + D(9) + 'B' + D(52) + '---' + D(14) + 'B' + D(29) + BB(8),
  /* r8 */ 'B' + D(71) + 'B' + D(69) + 'B' + D(29) + BB(8),
  /* r9 */ 'B' + D(37) + '*' + D(7) + '*' + D(25) + 'B' + D(3) + '***' + D(31) + '*' + D(31) + 'B' + D(11) + '******' + D(10) + 'BB' + BB(8),
  /* r10*/ 'B' + D(36) + '---' + D(6) + '--' + D(8) + '---' + D(13) + 'R' + D(2) + '-----' + D(29) + '---' + D(9) + '---' + D(18) + 'G' + D(9) + '----------' + D(8) + 'EE' + BB(8),
  /* r11*/ 'B' + D(18) + '*****' + D(9) + '*' + D(9) + '*' + D(28) + 'R' + D(16) + '*****' + D(48) + 'G' + D(27) + 'EE' + BB(8),
  /* r12*/ 'B' + D(2) + 'P' + D(14) + '1' + D(2) + '3' + D(2) + '2' + D(2) + '3' + D(4) + '---' + D(7) + '---' + D(6) + '2' + D(1) + 'A' + D(1) + '2' + D(3) + '3' + D(12) + 'R' + D(3) + 'SSS' + D(9) + '2' + D(2) + '1' + D(2) + '3' + D(1) + '2' + D(1) + '%' + D(1) + '1' + D(3) + '---' + D(7) + '---' + D(12) + '3' + D(1) + '2' + D(10) + 'G' + D(1) + 'A' + D(1) + '1' + D(2) + '3' + D(3) + 'SSS' + D(2) + 'SSS' + D(3) + 'H' + D(1) + '2' + D(3) + 'EE' + BB(8),
  /* r13*/ BB(11) + D(5) + BB(15) + D(18) + BB(14) + D(5) + BB(13) + D(5) + BB(17) + D(16) + BB(14) + D(5) + BB(42),
  /* r14*/ XX(11) + D(5) + XX(15) + 'S'.repeat(18) + XX(14) + D(5) + XX(13) + D(5) + XX(17) + 'S'.repeat(16) + XX(14) + D(5) + XX(34) + BB(8),
  /* r15*/ XX(11) + D(5) + XX(47) + D(5) + XX(13) + D(5) + XX(47) + D(5) + XX(34) + BB(8),
  /* r16*/ XX(11) + D(5) + XX(47) + D(5) + XX(13) + D(5) + XX(47) + D(5) + XX(34) + BB(8),
];

// ------------------------------- THEMES -------------------------------------

const LEVELS = [
  {
    name: 'CRASH CANYON',
    subtitle: 'The Star Skipper is toast. The only way home is through.',
    map: L1_MAP,
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
    map: L2_MAP,
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
    map: L3_MAP,
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
    map: L4_MAP,
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
    map: L5_MAP,
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
    map: L6_MAP,
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
