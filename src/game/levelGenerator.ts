import {
  CoinCollectible,
  Hazard,
  LaserGrid,
  ScrollCollectible,
  Shuriken,
  Spike,
} from './types.ts';

type Pattern =
  | 'floor_spikes'
  | 'ceiling_spikes'
  | 'alternating_spikes'
  | 'laser_bottom'
  | 'laser_top'
  | 'shuriken_wave'
  | 'pitfall_crossing'
  | 'gauntlet';

export interface GeneratedChunk {
  hazards: Hazard[];
  scrolls: ScrollCollectible[];
  coins: CoinCollectible[];
  width: number;
}

export type RandomSource = () => number;

const ALL_PATTERNS: Pattern[] = [
  'floor_spikes',
  'ceiling_spikes',
  'alternating_spikes',
  'laser_bottom',
  'laser_top',
  'shuriken_wave',
  'pitfall_crossing',
  'gauntlet',
];

const INTRO_PATTERNS: Pattern[] = [
  'floor_spikes',
  'ceiling_spikes',
  'alternating_spikes',
];

export class LevelGenerator {
  private nextX = 700;
  private floorY: number;
  private ceilingY: number;
  private stageId: number;
  private chunkNumber = 0;
  private scrollNumber = 0;

  constructor(
    floorY: number,
    ceilingY: number,
    stageId = 1,
    private readonly random: RandomSource = Math.random
  ) {
    this.floorY = floorY;
    this.ceilingY = ceilingY;
    this.stageId = stageId;
  }

  public setBounds(floorY: number, ceilingY: number) {
    this.floorY = floorY;
    this.ceilingY = ceilingY;
  }

  public reset(startX = 700, stageId = 1) {
    this.nextX = startX;
    this.stageId = stageId;
    this.chunkNumber = 0;
    this.scrollNumber = 0;
  }

  public generateUpTo(targetX: number) {
    const generated = {
      hazards: [] as Hazard[],
      scrolls: [] as ScrollCollectible[],
      coins: [] as CoinCollectible[],
    };

    while (this.nextX < targetX) {
      const chunk = this.createChunk(this.nextX);
      generated.hazards.push(...chunk.hazards);
      generated.scrolls.push(...chunk.scrolls);
      generated.coins.push(...chunk.coins);
      this.nextX += chunk.width;
    }

    return generated;
  }

  private createChunk(startX: number): GeneratedChunk {
    this.chunkNumber++;
    const chunk = this.buildPattern(this.pickPattern(), startX);

    // The first stage offers a scroll early, then settles into one every four chunks.
    const isScrollChunk = this.chunkNumber % 4 === 0;
    const isIntroScroll = this.stageId === 1 && this.chunkNumber === 2;
    if (isScrollChunk || isIntroScroll) {
      chunk.scrolls.push(this.createScroll(startX));
    }

    return chunk;
  }

  private pickPattern(): Pattern {
    const patterns: Pattern[] =
      this.stageId >= 4 || this.stageId === 0
        ? ALL_PATTERNS
        : this.stageId >= 3
          ? [...INTRO_PATTERNS, 'laser_bottom', 'laser_top', 'shuriken_wave']
          : this.stageId >= 2
            ? [...INTRO_PATTERNS, 'laser_bottom', 'laser_top']
            : INTRO_PATTERNS;

    return patterns[Math.floor(this.random() * patterns.length)];
  }

  private createScroll(startX: number): ScrollCollectible {
    this.scrollNumber++;
    const onFloorSide = this.random() > 0.5;

    return {
      id: `scroll_${this.scrollNumber}`,
      x: startX + 60,
      y: onFloorSide ? this.floorY - 60 : this.ceilingY + 60,
      radius: 16,
      collected: false,
      hoverOffset: 0,
    };
  }

  private createCoin(id: string, x: number, y: number, hoverOffset: number): CoinCollectible {
    return {
      id,
      x,
      y,
      radius: 11,
      collected: false,
      value: 1,
      hoverOffset,
    };
  }

  private buildPattern(type: Pattern, startX: number): GeneratedChunk {
    const hazards: Hazard[] = [];
    const coins: CoinCollectible[] = [];
    const playHeight = this.floorY - this.ceilingY;
    let width = 600;

    switch (type) {
      case 'floor_spikes':
        width = 550;
        this.addSpikes(hazards, startX, 'floor');
        for (let i = 0; i < 4; i++) {
          coins.push(this.createCoin(`coin_${startX}_${i}`, startX + 140 + i * 40, this.ceilingY + 28, i * 0.5));
        }
        break;

      case 'ceiling_spikes':
        width = 550;
        this.addSpikes(hazards, startX, 'ceiling');
        for (let i = 0; i < 4; i++) {
          coins.push(this.createCoin(`coin_${startX}_${i}`, startX + 140 + i * 40, this.floorY - 28, i * 0.5));
        }
        break;

      case 'alternating_spikes':
        width = 750;
        hazards.push(
          this.spike(`spike_alt_1_${startX}`, startX + 180, this.floorY - 38, 32, 38, 'floor'),
          this.spike(`spike_alt_2_${startX}`, startX + 420, this.ceilingY, 32, 38, 'ceiling')
        );
        for (let i = 0; i < 6; i++) {
          const progress = i / 5;
          const y = this.ceilingY + 30 + Math.sin(progress * Math.PI) * (playHeight - 60);
          coins.push(this.createCoin(`coin_arc_${startX}_${i}`, startX + 150 + i * 70, y, i * 0.4));
        }
        break;

      case 'laser_bottom':
        width = 650;
        hazards.push(this.laser(`laser_b_${startX}`, startX + 260, this.floorY - playHeight * 0.58, playHeight * 0.58, 'bottom'));
        this.addLineOfCoins(coins, `coin_l_${startX}`, startX + 200, this.ceilingY + 28, 4);
        break;

      case 'laser_top':
        width = 650;
        hazards.push(this.laser(`laser_t_${startX}`, startX + 260, this.ceilingY, playHeight * 0.58, 'top'));
        this.addLineOfCoins(coins, `coin_lt_${startX}`, startX + 200, this.floorY - 28, 4);
        break;

      case 'shuriken_wave':
        width = 700;
        hazards.push(
          this.shuriken(`shuriken_1_${startX}`, startX + 350, this.floorY - 32, 'straight'),
          this.shuriken(`shuriken_2_${startX}`, startX + 560, this.ceilingY + 36, 'sine')
        );
        break;

      case 'pitfall_crossing':
        width = 650;
        hazards.push({
          id: `pit_f_${startX}`,
          type: 'pitfall',
          x: startX + 220,
          width: 160,
          surface: 'floor',
        });
        this.addLineOfCoins(coins, `coin_pit_${startX}`, startX + 180, this.ceilingY + 28, 5);
        break;

      case 'gauntlet':
        width = 850;
        hazards.push(
          this.laser(`laser_g_${startX}`, startX + 220, this.floorY - playHeight * 0.55, playHeight * 0.55, 'bottom'),
          this.spike(`spike_g_${startX}`, startX + 520, this.ceilingY, 32, 38, 'ceiling')
        );
        this.addLineOfCoins(coins, `coin_g_${startX}`, startX + 320, this.ceilingY + 28, 6, 0.4);
        break;
    }

    return { hazards, scrolls: [], coins, width };
  }

  private addSpikes(hazards: Hazard[], startX: number, surface: 'floor' | 'ceiling') {
    const count = Math.floor(this.random() * 2) + 2;
    const width = 28;
    const height = surface === 'floor' ? 36 : 38;
    const y = surface === 'floor' ? this.floorY - height : this.ceilingY;

    for (let i = 0; i < count; i++) {
      hazards.push(this.spike(`spike_${surface[0]}_${startX}_${i}`, startX + 180 + i * (width + (surface === 'floor' ? 4 : 6)), y, width, height, surface));
    }
  }

  private addLineOfCoins(
    coins: CoinCollectible[],
    idPrefix: string,
    startX: number,
    y: number,
    count: number,
    hoverStep = 0.5
  ) {
    for (let i = 0; i < count; i++) {
      coins.push(this.createCoin(`${idPrefix}_${i}`, startX + i * 45, y, i * hoverStep));
    }
  }

  private spike(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    surface: 'floor' | 'ceiling'
  ): Spike {
    return { id, type: 'spike', x, y, width, height, surface };
  }

  private laser(
    id: string,
    x: number,
    y: number,
    height: number,
    zone: 'top' | 'bottom'
  ): LaserGrid {
    return { id, type: 'laser', x, y, width: 22, height, active: true, zone };
  }

  private shuriken(id: string, x: number, y: number, pattern: Shuriken['pattern']): Shuriken {
    return {
      id,
      type: 'shuriken',
      x,
      y,
      radius: 16,
      vx: pattern === 'sine' ? -200 : -180,
      vy: 0,
      rotation: 0,
      pattern,
      baseY: y,
      timeAlive: 0,
    };
  }
}
