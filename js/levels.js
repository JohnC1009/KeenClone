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

const L2_MAP = [
  /* r0 */ XX(144) + BB(6),
  /* r1 */ XX(144) + BB(6),
  /* r2 */ 'X' + D(24) + 'X' + D(60) + 'X' + D(25) + 'X' + D(31) + BB(6),
  /* r3 */ 'X' + D(24) + 'X' + D(60) + 'X' + D(25) + 'X' + D(31) + BB(6),
  /* r4 */ 'X' + D(85) + 'X' + D(57) + BB(6),
  /* r5 */ 'X' + D(85) + 'X' + D(57) + BB(6),
  /* r6 */ 'X' + D(72) + 'g' + D(12) + 'X' + D(57) + BB(6),
  /* r7 */ 'X' + D(71) + '---' + D(11) + 'X' + D(57) + BB(6),
  /* r8 */ 'X' + D(85) + 'X' + D(57) + BB(6),
  /* r9 */ 'X' + D(85) + 'X' + D(55) + 'BB' + BB(6),
  /* r10*/ 'X' + D(67) + '---' + D(15) + 'G' + D(55) + 'EE' + BB(6),
  /* r11*/ 'X' + D(17) + '****' + D(15) + '*' + D(5) + '*' + D(4) + '*****' + D(33) + 'G' + D(7) + '***' + D(3) + '--' + D(31) + '*****' + D(4) + 'EE' + BB(6),
  /* r12*/ 'X' + D(2) + 'P' + D(18) + '1' + D(13) + '---' + D(3) + '---' + D(7) + '3' + D(5) + '%' + D(18) + '1' + D(8) + 'G' + D(5) + '2' + D(15) + '3' + D(2) + 'A' + D(3) + '3' + D(2) + 'H' + D(11) + '1' + D(11) + 'EE' + BB(6),
  /* r13*/ XX(13) + D(3) + XX(15) + D(15) + XX(15) + D(4) + XX(34) + D(4) + XX(18) + D(4) + XX(19) + BB(6),
  /* r14*/ XX(13) + D(3) + XX(15) + '..2....SSS.....' + XX(15) + D(4) + XX(34) + 'SSSS' + XX(18) + D(4) + XX(19) + BB(6),
  /* r15*/ XX(13) + D(3) + XX(45) + D(4) + XX(56) + D(4) + XX(19) + BB(6),
  /* r16*/ XX(13) + D(3) + XX(45) + D(4) + XX(56) + D(4) + XX(19) + BB(6),
];

// =========================== LEVEL 3: REACTOR CORE ==========================

const L3_MAP = [
  /* r0 */ BB(160),
  /* r1 */ BB(160),
  /* r2 */ 'B' + D(73) + 'B' + D(59) + 'B' + D(19) + BB(6),
  /* r3 */ 'B' + D(73) + 'B' + D(59) + 'B' + D(19) + BB(6),
  /* r4 */ 'B' + D(73) + 'B' + D(59) + 'B' + D(19) + BB(6),
  /* r5 */ 'B' + D(73) + 'B' + D(59) + 'B' + D(19) + BB(6),
  /* r6 */ 'B' + D(56) + 'r' + D(16) + 'B' + D(37) + 'g' + D(21) + 'B' + D(19) + BB(6),
  /* r7 */ 'B' + D(55) + '---' + D(15) + 'B' + D(36) + '---' + D(20) + 'B' + D(19) + BB(6),
  /* r8 */ 'B' + D(73) + 'B' + D(59) + 'B' + D(19) + BB(6),
  /* r9 */ 'B' + D(39) + '*' + D(33) + 'B' + D(12) + '*****' + D(42) + 'B' + D(17) + 'BB' + BB(6),
  /* r10*/ 'B' + D(38) + '---' + D(18) + '---' + D(11) + 'R' + D(11) + '-------' + D(14) + '---' + D(24) + 'G' + D(17) + 'EE' + BB(6),
  /* r11*/ 'B' + D(18) + '*****' + D(11) + '*' + D(9) + '*' + D(28) + 'R' + D(59) + 'G' + D(12) + '*****' + 'EE' + BB(6),
  /* r12*/ 'B' + D(2) + 'P' + D(18) + '1' + D(5) + '3' + D(5) + '---' + D(7) + '---' + D(6) + '2' + D(2) + 'A' + D(2) + '2' + D(14) + 'R' + D(4) + '3' + D(2) + '%' + D(5) + 'SSS' + D(4) + '1' + D(21) + '2' + D(3) + '3' + D(1) + 'H' + D(10) + 'G' + D(3) + '1' + D(3) + '2' + D(1) + 'A' + D(1) + '3' + D(5) + 'EE' + BB(6),
  /* r13*/ BB(13) + D(4) + BB(16) + D(16) + BB(16) + D(4) + BB(32) + D(4) + BB(20) + D(4) + BB(31),
  /* r14*/ XX(13) + D(4) + XX(16) + 'S'.repeat(16) + XX(16) + D(4) + XX(32) + D(4) + XX(20) + D(4) + XX(25) + BB(6),
  /* r15*/ XX(13) + D(4) + XX(48) + D(4) + XX(32) + D(4) + XX(20) + D(4) + XX(25) + BB(6),
  /* r16*/ XX(13) + D(4) + XX(48) + D(4) + XX(32) + D(4) + XX(20) + D(4) + XX(25) + BB(6),
];

// ------------------------------- THEMES -------------------------------------

const LEVELS = [
  {
    name: 'CRASH CANYON',
    subtitle: 'The Star Skipper is toast. The only way home is through.',
    map: L1_MAP,
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
    name: 'REACTOR CORE',
    subtitle: 'Shut it down. Save the candy. Be home by nine.',
    map: L3_MAP,
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
];
