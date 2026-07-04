# 🚀 Commander Comet: Escape from Grexon-7

A Commander Keen–style side-scrolling platformer, built from scratch in plain
HTML5 / JavaScript / Canvas. No frameworks, no external assets — every sprite
is hand-placed pixel art, every sound is synthesized live with WebAudio, and
every background is drawn procedurally.

![Genre](https://img.shields.io/badge/genre-retro%20platformer-blueviolet)
![Tech](https://img.shields.io/badge/tech-vanilla%20JS%20%2B%20canvas-orange)
![Deps](https://img.shields.io/badge/dependencies-zero-brightgreen)

---

## 📖 The Backstory

> **The year is 2087.**
>
> Eight-year-old genius **Madison "Comet" Carter** was halfway through her math
> homework when every candy store on Earth was beamed into space in a single
> flash of lime-green light.
>
> The culprit: the **Gloopian Empire**, a civilization of single-eyed goo
> creatures from **Planet Grexon-7**. Their terrible machine — the
> **MEGA GOO REACTOR** — runs on pure refined sugar, and when it reaches full
> power it will convert every planet in the sector into lukewarm,
> lime-flavored goo. *Earth is next on the menu.*
>
> The world's governments held emergency meetings. The world's militaries
> scrambled jets. None of it mattered.
>
> But in a backyard in Ohio, Madison finished her homework early, then built the
> **STAR SKIPPER** — a one-kid starship assembled from a vacuum cleaner, her
> go-kart, and her mom's blender (she left a note). Armed with her homemade
> **Neural Zapper** and her trusty **Pogo Stick**, she blasted off, punched a
> hole through hyperspace, and crash-landed in the canyons of Grexon-7.
>
> Her mission: fight across the planet, shut down the Mega Goo Reactor, and
> save Earth's candy supply.
>
> Oh — and bedtime is at 9:00 PM. **Better hurry.**

### The Cast

| Who | What |
| --- | --- |
| **Madison "Comet" Carter** | 8-year-old genius, hero, owner of one (1) pogo stick |
| **Gloops** | Green one-eyed goo grunts. Slow, squishy, everywhere |
| **Boingers** | Coiled crimson spring-beasts that never stop bouncing |
| **Krawlers** | Purple fanged crawlers that charge when they smell candy |
| **The Mega Goo Reactor** | Doomsday appliance. Runs on stolen sugar |

### The Worlds

The fight across Grexon-7 spans **six zones**, each meaner than the last —
enemies get faster, jumps get thinner, and the goo gets angrier:

1. **Crash Canyon** — sun-baked alien mesas under a violet sky and two moons
2. **The Goo Caverns** — dripping underground tunnels lit by glowing slime
3. **Reactor Annex** — the humming steel outskirts of the war machine
4. **The Slime Sewers** — purple sludge pipes deep beneath the surface
5. **The Junk Fleet** — wrecked starships floating over a bottomless sky
6. **The Goo Throne** — the reactor's green beating heart. Shut it down

---

## 🎮 How to Play

Open `index.html` in any modern browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

### Playing on iPad / touch devices

The game detects touch screens and shows on-screen controls automatically:
a left/right pad, **JUMP**, **ZAP**, and **POGO** buttons, and a pause
button. Tap the screen to advance menus. Serve the folder from any machine
on your network (`python3 -m http.server 8000`) and open
`http://<your-computer>:8000` in Safari — or host it on GitHub Pages and
play from anywhere. Add it to your Home Screen for a full-screen app feel.

### Controls (keyboard)

| Key | Action |
| --- | --- |
| **← / →** or **A / D** | Run |
| **Z** / **Space** / **↑** / **W** | Jump (hold to jump higher) |
| **X** | Fire the Neural Zapper (uses ammo) |
| **C** | Toggle the Pogo Stick |
| **Enter** | Start / advance story / pause |

### The Rules of Grexon-7

- **Candy** = 100 pts, **Soda** = 250 pts. Score big for extra lives.
- The **Neural Zapper** *stuns* Gloopians — it never destroys them.
  (Madison is eight. She's not a monster.)
- **Stomping** an enemy — especially with the pogo — also stuns it.
- **Keycards** open the matching colored security doors.
- **Green goo spikes** hurt. Falling off the planet hurts more.
- You have **3 hearts** per life and **3 lives**. Reach the **EXIT** door
  at the end of each zone.
- On the pogo stick, **hold jump** as you land for a mega-bounce.

---

## 🛠 Tech Notes

- `js/sprites.js` — all pixel art, defined as ASCII pixel-maps and rendered
  to offscreen canvases at load (including mirrored frames)
- `js/levels.js` — six handcrafted ASCII tile maps + per-world themes
  and difficulty ratings (later zones spawn faster, meaner aliens)
- `js/audio.js` — a tiny WebAudio synth: jump blips, zapper pews, goo squishes
- `js/game.js` — fixed-timestep engine: AABB tile collision, one-way
  platforms, camera, particles, HUD, and the full state machine
  (title → story → levels → victory)

No build step. No dependencies. Just open it and play.
