// ---------------------------------------------------------------------------
// audio.js — tiny WebAudio synthesizer. All sound effects are generated live;
// there are no audio files. The context is created lazily on the first user
// input (browser autoplay policy).
// ---------------------------------------------------------------------------
'use strict';

const Sfx = (() => {
  let ctx = null;
  let master = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }

  // One synthesized voice: a frequency sweep with an amplitude envelope.
  function tone({ type = 'square', from = 440, to = 440, dur = 0.1,
                  vol = 1, delay = 0, curve = 'exp' }) {
    if (muted || !ensure()) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(1, from), t0);
    if (curve === 'exp') {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
    } else {
      osc.frequency.linearRampToValueAtTime(Math.max(1, to), t0 + dur);
    }
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // Short burst of filtered noise (impacts, thuds).
  function noise({ dur = 0.15, vol = 0.5, freq = 800, delay = 0 }) {
    if (muted || !ensure()) return;
    const t0 = ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filt); filt.connect(gain); gain.connect(master);
    src.start(t0);
  }

  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; return muted; },

    jump()   { tone({ type: 'square', from: 260, to: 620, dur: 0.14, vol: 0.5 }); },
    pogo()   { tone({ type: 'square', from: 180, to: 520, dur: 0.12, vol: 0.5 });
               tone({ type: 'triangle', from: 90, to: 260, dur: 0.12, vol: 0.6 }); },
    megaPogo(){ tone({ type: 'square', from: 160, to: 900, dur: 0.22, vol: 0.55 }); },
    shoot()  { tone({ type: 'sawtooth', from: 1400, to: 180, dur: 0.13, vol: 0.4 }); },
    zapHit() { tone({ type: 'square', from: 900, to: 120, dur: 0.18, vol: 0.5 });
               noise({ dur: 0.1, vol: 0.25, freq: 2500 }); },
    stomp()  { noise({ dur: 0.12, vol: 0.5, freq: 500 });
               tone({ type: 'triangle', from: 300, to: 80, dur: 0.15, vol: 0.6 }); },
    pickup() { tone({ type: 'square', from: 660, to: 660, dur: 0.06, vol: 0.4 });
               tone({ type: 'square', from: 990, to: 990, dur: 0.09, vol: 0.4, delay: 0.06 }); },
    soda()   { tone({ type: 'square', from: 523, to: 523, dur: 0.06, vol: 0.4 });
               tone({ type: 'square', from: 784, to: 784, dur: 0.06, vol: 0.4, delay: 0.06 });
               tone({ type: 'square', from: 1046, to: 1046, dur: 0.1, vol: 0.4, delay: 0.12 }); },
    key()    { tone({ type: 'triangle', from: 880, to: 880, dur: 0.08, vol: 0.5 });
               tone({ type: 'triangle', from: 1174, to: 1174, dur: 0.14, vol: 0.5, delay: 0.09 }); },
    door()   { tone({ type: 'sawtooth', from: 140, to: 560, dur: 0.35, vol: 0.35 });
               noise({ dur: 0.3, vol: 0.2, freq: 900 }); },
    ammo()   { tone({ type: 'square', from: 440, to: 880, dur: 0.12, vol: 0.4 }); },
    heart()  { tone({ type: 'triangle', from: 523, to: 1046, dur: 0.2, vol: 0.5 }); },
    hurt()   { tone({ type: 'sawtooth', from: 500, to: 90, dur: 0.25, vol: 0.55 }); },
    die()    { tone({ type: 'sawtooth', from: 700, to: 60, dur: 0.7, vol: 0.55 });
               tone({ type: 'square', from: 350, to: 40, dur: 0.7, vol: 0.4, delay: 0.05 }); },
    oneUp()  { [523, 659, 784, 1046].forEach((f, i) =>
                 tone({ type: 'square', from: f, to: f, dur: 0.11, vol: 0.45, delay: i * 0.09 })); },
    levelClear() { [392, 523, 659, 784, 1046].forEach((f, i) =>
                 tone({ type: 'square', from: f, to: f, dur: 0.14, vol: 0.45, delay: i * 0.11 })); },
    win()    { [261, 329, 392, 523, 659, 784, 1046].forEach((f, i) =>
                 tone({ type: 'triangle', from: f, to: f, dur: 0.22, vol: 0.5, delay: i * 0.14 })); },
    select() { tone({ type: 'square', from: 700, to: 1100, dur: 0.08, vol: 0.35 }); },
    gameOver() { [523, 466, 392, 311, 261, 130].forEach((f, i) =>
                 tone({ type: 'sawtooth', from: f, to: f, dur: 0.2, vol: 0.4, delay: i * 0.16 })); },
  };
})();
