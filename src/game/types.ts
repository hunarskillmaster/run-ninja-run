export type GameState = 'title' | 'playing' | 'paused' | 'gameover' | 'victory';

export type GameMode = 'stage' | 'endless';
export type Difficulty = 'normal' | 'hardcore';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  gravityDir: 1 | -1; // 1 = floor, -1 = ceiling
  grounded: boolean;
  surface: 'floor' | 'ceiling' | 'air';
  rotation: number;
  flipAnimTime: number;
  runAnimTime: number;
  scarfSegments: Array<{ x: number; y: number }>;
  invincibleTimer: number;
  hitInvulnerableTimer: number;
  shield: number;
  maxShield: number;
  alive: boolean;
}

export type HazardType = 'spike' | 'laser' | 'shuriken' | 'pitfall';

export interface Spike {
  id: string;
  type: 'spike';
  x: number;
  y: number;
  width: number;
  height: number;
  surface: 'floor' | 'ceiling';
  destroyed?: boolean;
}

export interface LaserGrid {
  id: string;
  type: 'laser';
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  zone: 'top' | 'bottom';
  destroyed?: boolean;
}

export interface Shuriken {
  id: string;
  type: 'shuriken';
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  rotation: number;
  pattern: 'straight' | 'sine';
  baseY: number;
  timeAlive: number;
  destroyed?: boolean;
}

export interface Pitfall {
  id: string;
  type: 'pitfall';
  x: number;
  width: number;
  surface: 'floor' | 'ceiling';
}

export type Hazard = Spike | LaserGrid | Shuriken | Pitfall;

export interface ScrollCollectible {
  id: string;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  hoverOffset: number;
}

export interface CoinCollectible {
  id: string;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  value: number;
  hoverOffset: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'dust' | 'spark' | 'petal' | 'ring' | 'slash' | 'trail' | 'coin';
  rotation?: number;
  rotSpeed?: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
}

export interface RunStats {
  score: number;
  distance: number;
  coins: number;
  scrollsCollected: number;
  slashes: number;
  maxCombo: number;
  timeSurvived: number;
}

export interface StageConfig {
  id: number;
  name: string;
  subtitle: string;
  targetDistance: number;
  baseSpeed: number;
  maxSpeed: number;
  theme: {
    skyTop: string;
    skyBottom: string;
    moonColor: string;
    accentColor: string;
    lanternColor: string;
  };
}
