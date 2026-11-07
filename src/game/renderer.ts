import { CoinCollectible, FloatingText, Hazard, LaserGrid, Particle, Pitfall, Player, ScrollCollectible, Shuriken, Spike, StageConfig } from './types.ts';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;

  // Background floating sakura petals
  private petals: Array<{ x: number; y: number; size: number; speed: number; rot: number; rotSpeed: number }> = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.initPetals();
  }

  private initPetals() {
    this.petals = Array.from({ length: 30 }, () => ({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      size: 4 + Math.random() * 5,
      speed: 40 + Math.random() * 80,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 3,
    }));
  }

  public resize(width: number, height: number, dpr: number = window.devicePixelRatio || 1) {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
  }

  public render(
    player: Player,
    cameraX: number,
    floorY: number,
    ceilingY: number,
    hazards: Hazard[],
    scrolls: ScrollCollectible[],
    coins: CoinCollectible[],
    particles: Particle[],
    floatingTexts: FloatingText[],
    shakeTrauma: number,
    stage: StageConfig,
    dt: number
  ) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();

    // Screen Shake based on trauma squared
    if (shakeTrauma > 0) {
      const shakeAmount = shakeTrauma * shakeTrauma * 16;
      const ox = (Math.random() * 2 - 1) * shakeAmount;
      const oy = (Math.random() * 2 - 1) * shakeAmount;
      ctx.translate(ox, oy);
    }

    // 1. Sky & Backdrop with luminous moon
    this.renderBackdrop(ctx, w, h, cameraX, stage, dt);

    // 2. Parallax Mountain range, Pagodas, and Torii gates
    this.renderParallaxScenery(ctx, w, h, cameraX, stage, floorY, ceilingY);

    // 3. Falling Sakura petals
    this.renderPetals(ctx, w, h, cameraX, dt);

    // 4. Floor & Ceiling Architecture with pitfall cutouts
    this.renderArchitecture(ctx, w, h, cameraX, floorY, ceilingY, hazards);

    // 5. In-World Collectibles (Scrolls & Jade Tomoe Coins)
    this.renderCollectibles(ctx, cameraX, scrolls, coins);

    // 6. Hazards (Spikes, Laser Grids, Shurikens)
    this.renderHazards(ctx, cameraX, hazards);

    // 7. Particle system
    this.renderParticles(ctx, cameraX, particles);

    // 8. Player Ninja Character
    this.renderNinja(ctx, cameraX, player);

    // 9. Floating Combat texts
    this.renderFloatingTexts(ctx, cameraX, floatingTexts);

    // 10. Vignette & low HP warning pulse
    this.renderVignette(ctx, w, h, player);

    ctx.restore();
  }

  private renderBackdrop(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    cameraX: number,
    stage: StageConfig,
    dt: number
  ) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, stage.theme.skyTop);
    grad.addColorStop(1, stage.theme.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Luminous Moon with parallax
    const moonX = w * 0.75 - (cameraX * 0.02) % (w * 1.5);
    const moonY = h * 0.28;
    const moonR = 64;

    // Moon Glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 2.5);
    moonGlow.addColorStop(0, `${stage.theme.moonColor}55`);
    moonGlow.addColorStop(0.6, `${stage.theme.moonColor}18`);
    moonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Moon Disc
    ctx.fillStyle = stage.theme.moonColor;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    // Crater shadows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.arc(moonX - 16, moonY - 12, 22, 0, Math.PI * 2);
    ctx.arc(moonX + 24, moonY + 16, 18, 0, Math.PI * 2);
    ctx.arc(moonX + 8, moonY - 26, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderParallaxScenery(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    cameraX: number,
    stage: StageConfig,
    floorY: number,
    ceilingY: number
  ) {
    // Distant mountain silhouettes (0.05x speed)
    ctx.fillStyle = '#0f1422cc';
    ctx.beginPath();
    ctx.moveTo(0, h);
    const mtnStep = 180;
    const mtnOffset = -(cameraX * 0.05) % mtnStep;
    for (let x = -mtnStep; x < w + mtnStep * 2; x += mtnStep) {
      const px = x + mtnOffset;
      const peakY = h * 0.45 + Math.sin(x * 0.01) * 60;
      ctx.lineTo(px, peakY);
      ctx.lineTo(px + mtnStep * 0.5, peakY - 45);
      ctx.lineTo(px + mtnStep, peakY);
    }
    ctx.lineTo(w, h);
    ctx.fill();

    // Midground Japanese Pagoda roofs & Torii Gates (0.15x speed)
    ctx.fillStyle = '#090c14ee';
    const pagodaStep = 450;
    const pagodaOffset = -(cameraX * 0.15) % pagodaStep;
    for (let x = -pagodaStep; x < w + pagodaStep * 2; x += pagodaStep) {
      const px = x + pagodaOffset;
      const py = floorY - 60;
      ctx.beginPath();
      ctx.moveTo(px - 60, py);
      ctx.quadraticCurveTo(px, py - 35, px + 60, py);
      ctx.lineTo(px + 45, py + 25);
      ctx.lineTo(px - 45, py + 25);
      ctx.closePath();
      ctx.fill();

      // Torii gate silhouette
      const tx = px + 220;
      const ty = floorY - 70;
      ctx.fillRect(tx - 35, ty, 70, 8);
      ctx.fillRect(tx - 40, ty - 6, 80, 5);
      ctx.fillRect(tx - 20, ty, 7, 70);
      ctx.fillRect(tx + 13, ty, 7, 70);
      ctx.fillRect(tx - 22, ty + 18, 44, 5);

      // Hanging lantern with glow
      const lx = tx;
      const ly = ty + 30;
      ctx.fillStyle = stage.theme.lanternColor;
      ctx.beginPath();
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `${stage.theme.lanternColor}22`;
      ctx.beginPath();
      ctx.arc(lx, ly, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#090c14ee';
    }
  }

  private renderPetals(ctx: CanvasRenderingContext2D, w: number, h: number, cameraX: number, dt: number) {
    ctx.save();
    this.petals.forEach(p => {
      p.x -= (p.speed + 120) * dt;
      p.y += Math.sin(p.x * 0.02) * 20 * dt + 30 * dt;
      p.rot += p.rotSpeed * dt;

      if (p.x < -20) p.x = w + 40;
      if (p.y > h + 20) p.y = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = 'rgba(251, 113, 133, 0.75)'; // Soft sakura pink
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }

  private renderArchitecture(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    cameraX: number,
    floorY: number,
    ceilingY: number,
    hazards: Hazard[]
  ) {
    // Floor deck
    ctx.fillStyle = '#111522';
    ctx.fillRect(0, floorY, w, h - floorY);

    // Floor trim
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, floorY, w, 3);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, floorY + 3, w, 2);

    // Floor seams
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const plankW = 60;
    const fOffset = -(cameraX % plankW);
    for (let x = fOffset; x < w; x += plankW) {
      ctx.fillRect(x, floorY + 5, 2, h - floorY);
    }

    // Ceiling rafters
    ctx.fillStyle = '#111522';
    ctx.fillRect(0, 0, w, ceilingY);

    // Ceiling trim
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, ceilingY - 3, w, 3);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, ceilingY - 5, w, 2);

    // Hanging lanterns on ceiling
    const lanternStep = 240;
    const cOffset = -(cameraX % lanternStep);
    for (let x = cOffset; x < w; x += lanternStep) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(x + 10, ceilingY, 3, 16);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(x + 5, ceilingY + 16, 13, 18, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.beginPath();
      ctx.arc(x + 11.5, ceilingY + 25, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pitfall cutouts
    hazards.forEach(hItem => {
      if (hItem.type === 'pitfall') {
        const pit = hItem as Pitfall;
        const screenX = pit.x - cameraX;
        if (screenX + pit.width > 0 && screenX < w) {
          if (pit.surface === 'floor') {
            ctx.fillStyle = '#08090d';
            ctx.fillRect(screenX, floorY, pit.width, h - floorY);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(screenX, floorY, 6, 8);
            ctx.fillRect(screenX + pit.width - 6, floorY, 6, 8);
          } else {
            ctx.fillStyle = '#08090d';
            ctx.fillRect(screenX, 0, pit.width, ceilingY);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(screenX, ceilingY - 8, 6, 8);
            ctx.fillRect(screenX + pit.width - 6, ceilingY - 8, 6, 8);
          }
        }
      }
    });
  }

  private renderCollectibles(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    scrolls: ScrollCollectible[],
    coins: CoinCollectible[]
  ) {
    // Ninjutsu Scrolls
    scrolls.forEach(s => {
      if (s.collected) return;
      const screenX = s.x - cameraX;
      if (screenX < -50 || screenX > this.width + 50) return;

      const time = performance.now() * 0.004;
      const hoverY = s.y + Math.sin(time) * 6;

      ctx.save();
      ctx.translate(screenX, hoverY);

      // Shimmering aura
      const auraGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 36);
      auraGrad.addColorStop(0, 'rgba(250, 204, 21, 0.6)');
      auraGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.3)');
      auraGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();

      // Rotating runic seal
      ctx.save();
      ctx.rotate(time * 0.8);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const px = Math.cos(a) * 22;
        const py = Math.sin(a) * 22;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Scroll body
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-12, -18, 24, 36);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-14, -3, 28, 6);
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(-16, -22, 32, 6, 2);
      ctx.roundRect(-16, 16, 32, 6, 2);
      ctx.fill();

      // Shinobi Kanji
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('忍', 0, -9);
      ctx.fillText('術', 0, 8);

      ctx.restore();
    });

    // Jade Tomoe Coins
    coins.forEach(c => {
      if (c.collected) return;
      const screenX = c.x - cameraX;
      if (screenX < -30 || screenX > this.width + 30) return;

      const time = performance.now() * 0.005 + c.hoverOffset;
      const hoverY = c.y + Math.sin(time) * 3;
      const scaleX = Math.cos(time * 2); // 3D spin effect

      ctx.save();
      ctx.translate(screenX, hoverY);
      ctx.scale(Math.abs(scaleX) * 0.8 + 0.2, 1);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, 0, c.radius - 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#064e3b';
      ctx.fillRect(-3, -3, 6, 6);

      ctx.restore();
    });
  }

  private renderHazards(ctx: CanvasRenderingContext2D, cameraX: number, hazards: Hazard[]) {
    hazards.forEach(h => {
      if (h.type === 'spike') {
        const spike = h as Spike;
        if (spike.destroyed) return;
        const sx = spike.x - cameraX;
        if (sx < -spike.width || sx > this.width + spike.width) return;

        ctx.save();
        ctx.translate(sx, spike.y);

        ctx.beginPath();
        if (spike.surface === 'floor') {
          ctx.moveTo(0, spike.height);
          ctx.lineTo(spike.width * 0.5, 0);
          ctx.lineTo(spike.width, spike.height);
        } else {
          ctx.moveTo(0, 0);
          ctx.lineTo(spike.width * 0.5, spike.height);
          ctx.lineTo(spike.width, 0);
        }
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, spike.width, spike.height);
        grad.addColorStop(0, '#ef4444');
        grad.addColorStop(0.5, '#475569');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      } else if (h.type === 'laser') {
        const laser = h as LaserGrid;
        if (laser.destroyed) return;
        const lx = laser.x - cameraX;
        if (lx < -laser.width || lx > this.width + laser.width) return;

        ctx.save();
        ctx.translate(lx, laser.y);

        // Mounts
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, laser.width, 8);
        ctx.fillRect(0, 0, laser.width, 8);
        ctx.strokeRect(0, laser.height - 8, laser.width, 8);
        ctx.fillRect(0, laser.height - 8, laser.width, 8);

        // Laser beam
        const time = performance.now() * 0.01;
        const pulse = Math.sin(time) * 0.2 + 0.8;

        ctx.fillStyle = `rgba(56, 189, 248, ${0.4 * pulse})`;
        ctx.fillRect(2, 8, laser.width - 4, laser.height - 16);

        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * pulse})`;
        ctx.fillRect(laser.width * 0.35, 8, laser.width * 0.3, laser.height - 16);

        // Electric lightning sparks
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let y = 10; y < laser.height - 16; y += 14) {
          const jitter = (Math.random() - 0.5) * 8;
          ctx.lineTo(laser.width * 0.5 + jitter, y);
        }
        ctx.stroke();

        ctx.restore();
      } else if (h.type === 'shuriken') {
        const shuriken = h as Shuriken;
        if (shuriken.destroyed) return;
        const sx = shuriken.x - cameraX;
        if (sx < -40 || sx > this.width + 40) return;

        ctx.save();
        ctx.translate(sx, shuriken.y);
        ctx.rotate(shuriken.rotation);

        // Motion blur ring
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, shuriken.radius * 0.9, 0, Math.PI * 2);
        ctx.stroke();

        // 4 blades
        ctx.fillStyle = '#e2e8f0';
        for (let i = 0; i < 4; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI) / 2);
          ctx.beginPath();
          ctx.moveTo(0, -shuriken.radius);
          ctx.lineTo(shuriken.radius * 0.35, -shuriken.radius * 0.3);
          ctx.lineTo(0, 0);
          ctx.lineTo(-shuriken.radius * 0.35, -shuriken.radius * 0.3);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }

        // Center hub
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f87171';
        ctx.stroke();

        ctx.restore();
      }
    });
  }

  private renderNinja(ctx: CanvasRenderingContext2D, cameraX: number, player: Player) {
    if (!player.alive) return;

    const screenX = player.x - cameraX;
    const isInvincible = player.invincibleTimer > 0;
    const isHitFlashed = player.hitInvulnerableTimer > 0 && Math.floor(performance.now() / 60) % 2 === 0;

    ctx.save();
    ctx.translate(screenX + player.width / 2, player.y + player.height / 2);

    ctx.rotate(player.rotation);

    // Invincibility afterimages & flame corona
    if (isInvincible) {
      ctx.save();
      for (let i = 1; i <= 3; i++) {
        ctx.fillStyle = i === 1 ? 'rgba(250, 204, 21, 0.35)' : 'rgba(56, 189, 248, 0.25)';
        ctx.fillRect(
          -player.width / 2 - i * 12,
          -player.height / 2,
          player.width,
          player.height
        );
      }

      ctx.strokeStyle = 'rgba(250, 204, 21, 0.9)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.ellipse(0, 0, player.width * 0.9, player.height * 0.65, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (isHitFlashed) {
      ctx.globalAlpha = 0.4;
    }

    // Ninja Body
    const w = player.width;
    const h = player.height;
    const legSwing = Math.sin(player.runAnimTime) * 12;

    // Back Leg
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-w * 0.25 - legSwing * 0.4, h * 0.1, 7, h * 0.4, 3);
    ctx.fill();

    // Torso / Shozoku
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-w * 0.4, -h * 0.3, w * 0.8, h * 0.45, 4);
    ctx.fill();

    // Red Obi Belt
    ctx.fillStyle = isInvincible ? '#f59e0b' : '#ef4444';
    ctx.fillRect(-w * 0.4, -h * 0.05, w * 0.8, 5);

    // Katana on Back
    ctx.save();
    ctx.rotate(0.35);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-w * 0.1, -h * 0.48, 4, h * 0.8);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-w * 0.2, -h * 0.3, 10, 3);
    ctx.restore();

    // Masked Head
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -h * 0.32, 11, 0, Math.PI * 2);
    ctx.fill();

    // Headband with Silver Leaf Plate
    ctx.fillStyle = isInvincible ? '#f59e0b' : '#ef4444';
    ctx.fillRect(-9, -h * 0.32 - 7, 18, 5);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-4, -h * 0.32 - 6, 8, 3);

    // Glowing Eyes
    ctx.fillStyle = isInvincible ? '#ffffff' : '#38bdf8';
    ctx.shadowColor = isInvincible ? '#fef08a' : '#38bdf8';
    ctx.shadowBlur = 6;
    ctx.fillRect(2, -h * 0.32 - 1, 5, 2.5);
    ctx.shadowBlur = 0;

    // Front Leg
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-w * 0.1 + legSwing * 0.4, h * 0.1, 7, h * 0.4, 3);
    ctx.fill();

    // Arms
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(-w * 0.2 - legSwing * 0.3, -h * 0.2, 7, h * 0.32, 3);
    ctx.fill();

    ctx.restore();

    // Trailing Cloth Scarf
    if (player.scarfSegments.length > 1) {
      ctx.save();
      ctx.strokeStyle = isInvincible ? '#f59e0b' : '#ef4444';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (isInvincible) {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
      }
      ctx.beginPath();
      const first = player.scarfSegments[0];
      ctx.moveTo(first.x - cameraX, first.y);
      for (let i = 1; i < player.scarfSegments.length; i++) {
        const seg = player.scarfSegments[i];
        ctx.lineTo(seg.x - cameraX, seg.y);
      }
      ctx.stroke();

      const last = player.scarfSegments[player.scarfSegments.length - 1];
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(last.x - cameraX, last.y, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D, cameraX: number, particles: Particle[]) {
    particles.forEach(p => {
      const sx = p.x - cameraX;
      if (sx < -20 || sx > this.width + 20) return;

      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.translate(sx, p.y);

      if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * (1 - alpha * 0.5), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'slash') {
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size * 0.5);
        ctx.lineTo(p.size, p.size * 0.5);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D, cameraX: number, texts: FloatingText[]) {
    texts.forEach(ft => {
      const sx = ft.x - cameraX;
      if (sx < -100 || sx > this.width + 100) return;

      const progress = 1 - ft.life / ft.maxLife;
      const alpha = Math.max(0, ft.life / ft.maxLife);
      const curY = ft.y - progress * 40;

      ctx.save();
      ctx.font = `bold ${Math.round(18 * ft.scale)}px var(--font-display, sans-serif)`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, sx, curY);
      ctx.restore();
    });
  }

  private renderVignette(ctx: CanvasRenderingContext2D, w: number, h: number, player: Player) {
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.4, w * 0.5, h * 0.5, w * 0.75);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Red warning pulse at 1 shield remaining
    if (player.alive && player.shield === 1) {
      const pulse = Math.sin(performance.now() * 0.008) * 0.15 + 0.15;
      const redVignette = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.35, w * 0.5, h * 0.5, w * 0.75);
      redVignette.addColorStop(0, 'transparent');
      redVignette.addColorStop(1, `rgba(239, 68, 68, ${pulse})`);
      ctx.fillStyle = redVignette;
      ctx.fillRect(0, 0, w, h);
    }
  }
}
