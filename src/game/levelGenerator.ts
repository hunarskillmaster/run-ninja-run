import { CoinCollectible, Hazard, LaserGrid, Pitfall, ScrollCollectible, Shuriken, Spike } from './types.ts';

export interface GeneratedChunk {
  hazards: Hazard[];
  scrolls: ScrollCollectible[];
  coins: CoinCollectible[];
  width: number;
}

export class LevelGenerator {
  private nextX: number = 700; // 700px running room at start
  private floorY: number;
  private ceilingY: number;
  private stageId: number;
  private scrollCounter: number = 0;

  constructor(floorY: number, ceilingY: number, stageId: number = 1) {
    this.floorY = floorY;
    this.ceilingY = ceilingY;
    this.stageId = stageId;
  }

  public setBounds(floorY: number, ceilingY: number) {
    this.floorY = floorY;
    this.ceilingY = ceilingY;
  }

  public reset(startX: number = 700, stageId: number = 1) {
    this.nextX = startX;
    this.stageId = stageId;
    this.scrollCounter = 0;
  }

  // Generates new chunks forward ahead of the camera viewport
  public generateUpTo(targetX: number): {
    hazards: Hazard[];
    scrolls: ScrollCollectible[];
    coins: CoinCollectible[];
  } {
    const newHazards: Hazard[] = [];
    const newScrolls: ScrollCollectible[] = [];
    const newCoins: CoinCollectible[] = [];

    while (this.nextX < targetX) {
      const chunk = this.createRandomChunk(this.nextX);
      newHazards.push(...chunk.hazards);
      newScrolls.push(...chunk.scrolls);
      newCoins.push(...chunk.coins);
      this.nextX += chunk.width;
    }

    return {
      hazards: newHazards,
      scrolls: newScrolls,
      coins: newCoins,
    };
  }

  private createRandomChunk(startX: number): GeneratedChunk {
    this.scrollCounter++;
    // Spawn an invincibility scroll every 4 chunks (or chunk 2 on stage 1 for intro)
    const shouldSpawnScroll = this.scrollCounter % 4 === 0 || (this.scrollCounter === 2 && this.stageId === 1);

    const patterns = [
      'floor_spikes',
      'ceiling_spikes',
      'alternating_spikes',
      'laser_bottom',
      'laser_top',
      'shuriken_wave',
      'pitfall_crossing',
      'gauntlet',
    ];

    // Filter pattern availability based on stage progression
    let eligible = ['floor_spikes', 'ceiling_spikes', 'alternating_spikes'];
    if (this.stageId >= 2) {
      eligible.push('laser_bottom', 'laser_top');
    }
    if (this.stageId >= 3) {
      eligible.push('shuriken_wave');
    }
    if (this.stageId >= 4 || this.stageId === 0) {
      eligible = patterns;
    }

    const pattern = eligible[Math.floor(Math.random() * eligible.length)];
    const chunk = this.buildPattern(pattern, startX);

    if (shouldSpawnScroll) {
      const scrollY = Math.random() > 0.5 ? this.floorY - 60 : this.ceilingY + 60;
      chunk.scrolls.push({
        id: `scroll_${Math.random().toString(36).substring(2, 9)}`,
        x: startX + 60,
        y: scrollY,
        radius: 16,
        collected: false,
        hoverOffset: 0,
      });
    }

    return chunk;
  }

  private buildPattern(type: string, startX: number): GeneratedChunk {
    const hazards: Hazard[] = [];
    const coins: CoinCollectible[] = [];
    const scrolls: ScrollCollectible[] = [];
    let width = 600;

    const playHeight = this.floorY - this.ceilingY;

    switch (type) {
      case 'floor_spikes': {
        width = 550;
        const spikeCount = Math.floor(Math.random() * 2) + 2;
        const spikeW = 28;
        const spikeH = 36;
        for (let i = 0; i < spikeCount; i++) {
          hazards.push({
            id: `spike_f_${startX}_${i}`,
            type: 'spike',
            x: startX + 180 + i * (spikeW + 4),
            y: this.floorY - spikeH,
            width: spikeW,
            height: spikeH,
            surface: 'floor',
          });
        }
        // Coins on ceiling prompt player to flip upwards
        for (let i = 0; i < 4; i++) {
          coins.push({
            id: `coin_${startX}_${i}`,
            x: startX + 140 + i * 40,
            y: this.ceilingY + 28,
            radius: 11,
            collected: false,
            value: 1,
            hoverOffset: i * 0.5,
          });
        }
        break;
      }

      case 'ceiling_spikes': {
        width = 550;
        const spikeCount = Math.floor(Math.random() * 2) + 2;
        const spikeW = 28;
        const spikeH = 38;
        for (let i = 0; i < spikeCount; i++) {
          hazards.push({
            id: `spike_c_${startX}_${i}`,
            type: 'spike',
            x: startX + 180 + i * (spikeW + 6),
            y: this.ceilingY,
            width: spikeW,
            height: spikeH,
            surface: 'ceiling',
          });
        }
        // Coins along floor prompt player to stay grounded
        for (let i = 0; i < 4; i++) {
          coins.push({
            id: `coin_${startX}_${i}`,
            x: startX + 140 + i * 40,
            y: this.floorY - 28,
            radius: 11,
            collected: false,
            value: 1,
            hoverOffset: i * 0.5,
          });
        }
        break;
      }

      case 'alternating_spikes': {
        width = 750;
        // Floor spike followed by ceiling spike requires double flip timing
        hazards.push({
          id: `spike_alt_1_${startX}`,
          type: 'spike',
          x: startX + 180,
          y: this.floorY - 38,
          width: 32,
          height: 38,
          surface: 'floor',
        });
        hazards.push({
          id: `spike_alt_2_${startX}`,
          type: 'spike',
          x: startX + 420,
          y: this.ceilingY,
          width: 32,
          height: 38,
          surface: 'ceiling',
        });
        // Sine wave arc of coins weaving between floor and ceiling
        for (let i = 0; i < 6; i++) {
          const t = i / 5;
          const coinY = this.ceilingY + 30 + Math.sin(t * Math.PI) * (playHeight - 60);
          coins.push({
            id: `coin_arc_${startX}_${i}`,
            x: startX + 150 + i * 70,
            y: coinY,
            radius: 11,
            collected: false,
            value: 1,
            hoverOffset: i * 0.4,
          });
        }
        break;
      }

      case 'laser_bottom': {
        width = 650;
        const laserH = playHeight * 0.58;
        hazards.push({
          id: `laser_b_${startX}`,
          type: 'laser',
          x: startX + 260,
          y: this.floorY - laserH,
          width: 22,
          height: laserH,
          active: true,
          zone: 'bottom',
        });
        for (let i = 0; i < 4; i++) {
          coins.push({
            id: `coin_l_${startX}_${i}`,
            x: startX + 200 + i * 45,
            y: this.ceilingY + 28,
            radius: 11,
            collected: false,
            value: 1,
            hoverOffset: i * 0.5,
          });
        }
        break;
      }

      case 'laser_top': {
        width = 650;
        const laserH = playHeight * 0.58;
        hazards.push({
          id: `laser_t_${startX}`,
          type: 'laser',
          x: startX + 260,
          y: this.ceilingY,
          width: 22,
          height: laserH,
          active: true,
          zone: 'top',
        });
        for (let i = 0; i < 4; i++) {
          coins.push({
            id: `coin_lt_${startX}_${i}`,
            x: startX + 200 + i * 45,
            y: this.floorY - 28,
            radius: 11,
            collected: false,
            value: 1,
            hoverOffset: i * 0.5,
          });
        }
        break;
      }

      case 'shuriken_wave': {
        width = 700;
        hazards.push({
          id: `shuriken_1_${startX}`,
          type: 'shuriken',
          x: startX + 350,
          y: this.floorY - 32,
          radius: 16,
          vx: -180,
          vy: 0,
          rotation: 0,
          pattern: 'straight',
          baseY: this.floorY - 32,
          timeAlive: 0,
        });
        hazards.push({
          id: `shuriken_2_${startX}`,
          type: 'shuriken',
          x: startX + 560,
          y: this.ceilingY + 36,
          radius: 16,
          vx: -200,
          vy: 0,
          rotation: 0,
          pattern: 'sine',
          baseY: this.ceilingY + 36,
          timeAlive: 0,
        });
        break;
      }

      case 'pitfall_crossing': {
        width = 650;
        const pitW = 160;
        hazards.push({
          id: `pit_f_${startX}`,
          type: 'pitfall',
          x: startX + 220,
          width: pitW,
          surface: 'floor',
        });
        for (let i = 0; i < 5; i++) {
          coins.push({
            id: `coin_pit_${startX}_${i}`,
            x: startX + 180 + i * 45,
            y: this.ceilingY + 28,
            radius: 11,
            collected: false,
            value: 1,
            hoverOffset: i * 0.5,
          });
        }
        break;
      }

      case 'gauntlet':
      default: {
        width = 850;
        const laserH = playHeight * 0.55;
        hazards.push({
          id: `laser_g_${startX}`,
          type: 'laser',
          x: startX + 220,
          y: this.floorY - laserH,
          width: 22,
          height: laserH,
          active: true,
          zone: 'bottom',
        });
        hazards.push({
          id: `spike_g_${startX}`,
          type: 'spike',
          x: startX + 520,
          y: this.ceilingY,
          width: 32,
          height: 38,
          surface: 'ceiling',
        });
        for (let i = 0; i < 6; i++) {
          coins.push({
            id: `coin_g_${startX}_${i}`,
            x: startX + 320 + i * 40,
            y: this.ceilingY + 28,
            radius: 11,
            collected: false,
            value: 1,
            hoverOffset: i * 0.4,
          });
        }
        break;
      }
    }

    return { hazards, scrolls, coins, width };
  }
}
