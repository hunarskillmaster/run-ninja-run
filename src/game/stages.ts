import { StageConfig } from './types.ts';

// Stage progression targets, speeds, and themed color palettes
export const STAGES: StageConfig[] = [
  {
    id: 1,
    name: 'Stage 1: Neon Rooftops',
    subtitle: 'Learn the sacred art of gravity inversion',
    targetDistance: 1200,
    baseSpeed: 420,
    maxSpeed: 520,
    theme: {
      skyTop: '#0a0d18',
      skyBottom: '#181e36',
      moonColor: '#fef08a',
      accentColor: '#38bdf8',
      lanternColor: '#f97316',
    },
  },
  {
    id: 2,
    name: 'Stage 2: Laser Fortress',
    subtitle: 'Bypass lethal electric barrier gates',
    targetDistance: 1600,
    baseSpeed: 460,
    maxSpeed: 580,
    theme: {
      skyTop: '#100b1d',
      skyBottom: '#28133f',
      moonColor: '#c084fc',
      accentColor: '#ec4899',
      lanternColor: '#a855f7',
    },
  },
  {
    id: 3,
    name: 'Stage 3: Shuriken Storm',
    subtitle: 'Dodge the deadly barrage of flying blades',
    targetDistance: 2000,
    baseSpeed: 500,
    maxSpeed: 640,
    theme: {
      skyTop: '#1a0d0d',
      skyBottom: '#3b1414',
      moonColor: '#f87171',
      accentColor: '#ef4444',
      lanternColor: '#e11d48',
    },
  },
  {
    id: 4,
    name: 'Stage 4: Emperor\'s Citadel',
    subtitle: 'Master the ultimate shinobi trial',
    targetDistance: 2500,
    baseSpeed: 540,
    maxSpeed: 700,
    theme: {
      skyTop: '#0d1512',
      skyBottom: '#133527',
      moonColor: '#6ee7b7',
      accentColor: '#10b981',
      lanternColor: '#059669',
    },
  },
];
