# 🥷 Run Ninja Run

A fast-paced precision gravity platformer where **you cannot jump — you can only flip gravity** upside down between the ceiling and floor.

### 🕹️ [**▶ PLAY LIVE DEMO ON GITHUB PAGES**](https://hunarskillmaster.github.io/run-ninja-run/)

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## 🎮 Concept & Gameplay

Most endless runners are all about jumping over pits. In **Run Ninja Run**, jumping is disabled entirely. Your ninja runs along ceilings and rooftops of an ancient citadel, and your only defense is inverting gravity mid-stride with pixel-perfect timing.

### Key Mechanics

- **Gravity Inversion (Zero Jumping)**: Flip gravity between floor and ceiling instantly with `Space`, `W`/`S`, `Arrow Keys`, or touch/click. Flipping mid-air redirects your vertical momentum with an acrobatic spin.
- **Makimono Scroll Bar HUD**: A traditional Japanese parchment scroll bar mounted at the top of the HUD tracks your progress in real time with an animated mini running ninja (`忍`) sliding along the scroll.
- **Ninjutsu Invincibility Phase**: Pick up glowing golden scrolls to trigger a 6-second invincibility phase. Instead of dodging hazards, you slice through spikes, laser barriers, and shurikens for massive bonus points (`SHADOW SLICE!`, `LASER CUT!`, `PARRIED!`) complete with hitstop impact freeze and screen shake.
- **Dynamic Cloth Physics**: A 7-segment red shinobi scarf trails behind you, dynamically floating and reacting to inverted gravity and speed ramps.
- **Jade Tomoe Coins & Combo Chain**: Collect strings of jade coins placed along risky trajectories to build up to a **5x score multiplier**.
- **Procedural Feudal Web Audio**: 100% synthesized procedural sound effects and music using the Web Audio API — pitch-swept swooshes, wooden footsteps, crystal coin pings, high-frequency katana strikes, and a taiko drum beat that accelerates during invincibility.
- **Game Modes & Difficulty**:
  - **Stage Infiltration**: 4 stages (Neon Rooftops, Laser Fortress, Shuriken Storm, Emperor's Citadel) with clear distance goals.
  - **Endless Mastery**: Infinite procedural hazard generation with progressive speed ramps.
  - **Difficulty Modes**: Shinobi (3 Shield talismans) or Hardcore (1-hit sudden death).

---

## 🕹️ Controls

| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Invert Gravity** | `Space`, `W`, `S`, `↑`, `↓` | Tap screen or **FLIP GRAVITY ↕** button |
| **Pause / Resume** | `P` or `Escape` | Tap Pause button in HUD |
| **Quick Restart** | `R` | Tap Restart button in HUD |
| **Mute / Unmute** | `M` | Tap Volume button in HUD |

---

## 🤖 AI Usage Disclosure

> **Note on AI assistance**: I used AI in fixing bugs and designing during the development of this game.
>
> Specifically, generative AI tools helped brainstorm the feudal Japanese aesthetic, troubleshoot Web Audio oscillator scheduling quirks, and refine mathematical curve functions for the sine-wave shuriken flight paths. The core game mechanics, custom physics engine, Canvas 2D rendering pipeline, and procedural chunk generator were structured, tuned, and rebuilt by hand.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation & Local Run

1. Clone the repository:
   ```bash
   git clone https://github.com/hunarskillmaster/run-ninja-run.git
   cd run-ninja-run
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:3000`.

### Building for Production

```bash
npm run build
npm run preview
```

### Running Tests

Run the deterministic physics and scoring unit test suite:
```bash
npm test
```

---

## 📂 Project Architecture

```
run-ninja-run/
├── .github/workflows/
│   └── deploy.yml               # Automated GitHub Pages CI deployment
├── src/
│   ├── components/
│   │   ├── GameHUD.tsx          # HUD with Makimono scroll bar & running ninja marker
│   │   ├── GameModals.tsx       # Pause, Game Over, and Stage Victory modals
│   │   └── TitleScreen.tsx      # Main menu, stage selector, difficulty toggles
│   ├── game/
│   │   ├── audio.ts             # Web Audio API sound synthesizer & dynamic taiko BGM
│   │   ├── levelGenerator.ts    # Procedural chunk generator for hazards/collectibles
│   │   ├── renderer.ts          # 60 FPS Canvas 2D renderer with parallax & particles
│   │   ├── rules.ts             # Gravity flip physics, collision detection & scoring
│   │   ├── rules.test.ts        # Unit test suite for game rules and mechanics
│   │   ├── stages.ts            # Stage themes, targets, and speed ramps
│   │   └── types.ts             # TypeScript entity interfaces and game state types
│   ├── App.tsx                  # Main game loop, hitstop freeze, input orchestration
│   ├── index.css                # Tailwind styling, Google Fonts, and custom scrollbars
│   └── main.tsx                 # React DOM mount point
├── index.html                   # HTML shell and canvas viewport setup
├── package.json                 # Dependencies and npm scripts
├── tsconfig.json                # TypeScript strict configuration
└── vite.config.ts               # Vite bundler configuration
```

---

## 📜 License

This project is licensed under the Apache License 2.0.
