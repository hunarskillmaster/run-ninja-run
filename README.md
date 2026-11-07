# Run Ninja Run

Run Ninja Run is a small Canvas game about a ninja who can only move forward and
flip gravity. There is no jump button: tap, click, or press a key to move
between the floor and ceiling, then try to survive the next obstacle.

**Play it:** [hunarskillmaster.github.io/run-ninja-run](https://hunarskillmaster.github.io/run-ninja-run/)

## How to play

- Press `Space`, `W`, `S`, `Up`, or `Down` to flip gravity.
- Press `P` or `Escape` to pause.
- Press `R` to restart and `M` to mute.
- On a phone, tap the game or use the on-screen controls.

Collect jade coins for points and golden scrolls for a short invincibility
window. In the invincibility window, hitting a spike, laser, or shuriken slices
it instead of hurting you. Stage mode has four handcrafted difficulty ramps;
Endless mode keeps generating obstacle patterns.

## What is in the game

- A lightweight Canvas 2D renderer with parallax scenery, particles, screen
  shake, and a running ninja marker in the HUD.
- Gravity, collision, shield, combo, and scoring rules kept separate from the
  React UI.
- Procedural chunks that introduce spikes first, then lasers, shurikens,
  pitfalls, and mixed gauntlets as the stage increases.
- Web Audio effects and a simple taiko-inspired background loop generated in
  the browser, so there are no audio assets to download.

## Run locally

You need Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. To check a production build and the rules:

```bash
npm run build
npm test
```

## Project layout

```text
src/
  App.tsx                 game loop and input wiring
  components/             title screen, HUD, and modal UI
  game/
    audio.ts              procedural Web Audio effects
    levelGenerator.ts     obstacle and collectible chunks
    renderer.ts           Canvas drawing and particles
    rules.ts              physics, collisions, damage, and score
    stages.ts             stage settings and colour themes
    types.ts              shared game data types
```

## AI use

I used AI while designing the game and fixing bugs. It helped me explore
ideas for the visual style, find mistakes in the Web Audio scheduling, and
review the gravity and collision maths. I then tested the changes locally and
rewrote the game structure and documentation myself rather than treating
generated output as a finished submission.

## License

Apache-2.0
