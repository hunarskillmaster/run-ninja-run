import React, { useEffect, useRef, useState } from 'react';
import { audio } from './game/audio.ts';
import { LevelGenerator } from './game/levelGenerator.ts';
import { GameRenderer } from './game/renderer.ts';
import {
  calculateRunScore,
  createInitialPlayer,
  flipGravity,
  INVINCIBLE_DURATION,
  resolveHazard,
  updateCombo,
  updatePlayerPhysics,
} from './game/rules.ts';
import { STAGES } from './game/stages.ts';
import {
  CoinCollectible,
  Difficulty,
  FloatingText,
  GameMode,
  GameState,
  Hazard,
  Particle,
  Pitfall,
  Player,
  RunStats,
  ScrollCollectible,
  StageConfig,
} from './game/types.ts';
import { TitleScreen } from './components/TitleScreen.tsx';
import { GameHUD } from './components/GameHUD.tsx';
import { GameOverModal, PauseModal, VictoryModal } from './components/GameModals.tsx';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>('title');
  const [gameMode, setGameMode] = useState<GameMode>('stage');
  const [selectedStageId, setSelectedStageId] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [isMuted, setIsMuted] = useState<boolean>(() => audio.isMuted());
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ninja_highscore');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // HUD-synced state (updated at throttled intervals from 60fps loop)
  const [hudState, setHudState] = useState({
    score: 0,
    distance: 0,
    coins: 0,
    combo: 1,
    comboMultiplier: 1,
    shield: 3,
    maxShield: 3,
    invincibleTimer: 0,
    gravityDir: 1 as 1 | -1,
    surface: 'floor' as 'floor' | 'ceiling' | 'air',
  });

  const [finalStats, setFinalStats] = useState<RunStats>({
    score: 0,
    distance: 0,
    coins: 0,
    scrollsCollected: 0,
    slashes: 0,
    maxCombo: 1,
    timeSurvived: 0,
  });

  // Game Engine Mutable State Refs (avoids React re-render overhead inside requestAnimationFrame)
  const engineRef = useRef<{
    renderer: GameRenderer | null;
    levelGen: LevelGenerator | null;
    player: Player;
    stage: StageConfig;
    hazards: Hazard[];
    scrolls: ScrollCollectible[];
    coins: CoinCollectible[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    cameraX: number;
    distance: number;
    score: number;
    coinsCount: number;
    scrollsCount: number;
    slashesCount: number;
    combo: number;
    comboTimer: number;
    comboMultiplier: number;
    maxCombo: number;
    timeSurvived: number;
    hitstopTimer: number;
    shakeTrauma: number;
    speed: number;
    floorY: number;
    ceilingY: number;
    lastTime: number;
    animFrameId: number | null;
  }>({
    renderer: null,
    levelGen: null,
    player: createInitialPlayer(500, 100, 'normal'),
    stage: STAGES[0],
    hazards: [],
    scrolls: [],
    coins: [],
    particles: [],
    floatingTexts: [],
    cameraX: 0,
    distance: 0,
    score: 0,
    coinsCount: 0,
    scrollsCount: 0,
    slashesCount: 0,
    combo: 1,
    comboTimer: 0,
    comboMultiplier: 1,
    maxCombo: 1,
    timeSurvived: 0,
    hitstopTimer: 0,
    shakeTrauma: 0,
    speed: 420,
    floorY: 500,
    ceilingY: 100,
    lastTime: 0,
    animFrameId: null,
  });

  const stateRef = useRef<GameState>('title');
  stateRef.current = gameState;

  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Support ?autostart=1 query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      startGame('stage', 1, 'normal');
    }
  }, []);

  const spawnParticles = (
    x: number,
    y: number,
    color: string,
    count: number,
    type: Particle['type'] = 'spark'
  ) => {
    const p = engineRef.current.particles;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 260 + 60;
      p.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.5,
        color,
        size: 3 + Math.random() * 4,
        type,
      });
    }
  };

  const addFloatingText = (x: number, y: number, text: string, color: string = '#fbbf24', scale: number = 1.0) => {
    engineRef.current.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      text,
      color,
      life: 0.8,
      maxLife: 0.8,
      scale,
    });
  };

  // Flip gravity trigger (Space, Up/Down, W/S, or Tap)
  const handleTriggerFlip = () => {
    if (stateRef.current !== 'playing') {
      if (stateRef.current === 'title' || stateRef.current === 'gameover') {
        startGame(gameMode, selectedStageId, difficulty);
      }
      return;
    }

    const eng = engineRef.current;
    if (!eng.player.alive) return;

    eng.player = flipGravity(eng.player);
    audio.playFlip();

    // Spawn flip shockwave ring
    eng.particles.push({
      x: eng.player.x + eng.player.width / 2,
      y: eng.player.y + eng.player.height / 2,
      vx: 0,
      vy: 0,
      life: 0.22,
      maxLife: 0.22,
      color: eng.player.invincibleTimer > 0 ? '#fbbf24' : '#38bdf8',
      size: 42,
      type: 'ring',
    });
  };

  const startGame = (mode: GameMode, stageId: number, diff: Difficulty) => {
    const stage = STAGES.find(s => s.id === stageId) || STAGES[0];
    const eng = engineRef.current;

    const canvas = canvasRef.current;
    const h = canvas ? canvas.clientHeight : window.innerHeight;
    const floorY = h - 90;
    const ceilingY = 90;

    eng.floorY = floorY;
    eng.ceilingY = ceilingY;
    eng.stage = stage;
    eng.player = createInitialPlayer(floorY, ceilingY, diff);
    eng.levelGen = new LevelGenerator(floorY, ceilingY, mode === 'endless' ? 0 : stage.id);
    eng.levelGen.reset(700, mode === 'endless' ? 0 : stage.id);

    eng.hazards = [];
    eng.scrolls = [];
    eng.coins = [];
    eng.particles = [];
    eng.floatingTexts = [];
    eng.cameraX = 0;
    eng.distance = 0;
    eng.score = 0;
    eng.coinsCount = 0;
    eng.scrollsCount = 0;
    eng.slashesCount = 0;
    eng.combo = 1;
    eng.comboTimer = 0;
    eng.comboMultiplier = 1;
    eng.maxCombo = 1;
    eng.timeSurvived = 0;
    eng.hitstopTimer = 0;
    eng.shakeTrauma = 0;
    eng.speed = stage.baseSpeed;
    eng.lastTime = performance.now();

    // Pre-generate initial chunks ahead of player
    const initialChunks = eng.levelGen.generateUpTo(2400);
    eng.hazards = initialChunks.hazards;
    eng.scrolls = initialChunks.scrolls;
    eng.coins = initialChunks.coins;

    setGameState('playing');
    audio.startBgm();
    audio.setInvincibleBgm(false);
  };

  const handlePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  const handleRestart = () => {
    startGame(gameMode, selectedStageId, difficulty);
  };

  const handleTitle = () => {
    setGameState('title');
    audio.stopBgm();
  };

  const handleToggleMute = () => {
    const newMuted = audio.toggleMute();
    setIsMuted(newMuted);
  };

  const handleNextStage = () => {
    const nextId = selectedStageId + 1;
    if (nextId <= STAGES.length) {
      setSelectedStageId(nextId);
      startGame('stage', nextId, difficulty);
    } else {
      setGameMode('endless');
      startGame('endless', 1, difficulty);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'KeyS' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.preventDefault();
        handleTriggerFlip();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        handlePause();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleRestart();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, gameMode, selectedStageId, difficulty]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new GameRenderer(ctx);
    engineRef.current.renderer = renderer;

    const handleResize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      renderer.resize(width, height, dpr);

      const floorY = height - 90;
      const ceilingY = 90;
      engineRef.current.floorY = floorY;
      engineRef.current.ceilingY = ceilingY;
      if (engineRef.current.levelGen) {
        engineRef.current.levelGen.setBounds(floorY, ceilingY);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let hudThrottle = 0;

    const loop = (time: number) => {
      const eng = engineRef.current;
      const rawDt = (time - (eng.lastTime || time)) / 1000;
      eng.lastTime = time;

      // Clamp dt to avoid physics tunnelling
      const dt = Math.min(rawDt, 0.05);

      if (stateRef.current === 'playing') {
        eng.timeSurvived += dt;

        // Hitstop freeze simulation
        let simDt = dt;
        if (eng.hitstopTimer > 0) {
          eng.hitstopTimer -= dt;
          simDt = 0;
        }

        if (simDt > 0) {
          // Speed ramp based on distance covered
          const speedRamp = Math.min(
            eng.stage.maxSpeed,
            eng.stage.baseSpeed + (eng.distance / 100) * 12
          );
          eng.speed = speedRamp;

          const forwardMove = eng.speed * simDt;
          eng.player.x += forwardMove;
          eng.cameraX = eng.player.x - 160;
          eng.distance = eng.player.x / 10;

          // Physics update
          const pits = eng.hazards.filter(h => h.type === 'pitfall') as Pitfall[];
          const physicsRes = updatePlayerPhysics(eng.player, simDt, eng.floorY, eng.ceilingY, pits);
          eng.player = physicsRes.player;

          if (physicsRes.landed) {
            audio.playLand();
            spawnParticles(
              eng.player.x + eng.player.width / 2,
              eng.player.surface === 'floor' ? eng.floorY : eng.ceilingY,
              '#94a3b8',
              5,
              'dust'
            );
          }

          if (physicsRes.fellInPit && eng.player.alive) {
            eng.player.alive = false;
            eng.player.shield = 0;
            audio.playHit();
            audio.playDefeat();
            eng.shakeTrauma = 1.0;
            triggerGameOver();
          }

          // Shurikens motion update
          eng.hazards.forEach(h => {
            if (h.type === 'shuriken') {
              const sh = h;
              sh.timeAlive += simDt;
              sh.x += (sh.vx - eng.speed * 0.2) * simDt;
              sh.rotation += 14 * simDt;
              if (sh.pattern === 'sine') {
                sh.y = sh.baseY + Math.sin(sh.timeAlive * 5) * 35;
              }
            }
          });

          // Hazard collision check
          for (let i = 0; i < eng.hazards.length; i++) {
            const h = eng.hazards[i];
            const res = resolveHazard(eng.player, h);

            if (res.hit) {
              if (res.destroyed) {
                if ('destroyed' in h) {
                  (h as { destroyed?: boolean }).destroyed = true;
                }
                eng.slashesCount++;
                eng.score += res.bonusScore * eng.comboMultiplier;
                eng.hitstopTimer = res.hitstop;
                eng.shakeTrauma = 0.45;

                const hazardY = 'y' in h ? (h as { y: number }).y : eng.floorY;
                audio.playSlash();
                spawnParticles(h.x + 15, hazardY + 15, '#fbbf24', 16, 'slash');
                addFloatingText(h.x, hazardY - 20, res.message || 'SLICED!', '#fbbf24', 1.2);

                const cRes = updateCombo(eng.combo, eng.comboTimer, 0, 'slice');
                eng.combo = cRes.combo;
                eng.comboTimer = cRes.comboTimer;
                eng.comboMultiplier = cRes.comboMultiplier;
                eng.maxCombo = Math.max(eng.maxCombo, eng.combo);
              } else if (res.isFatal) {
                eng.player.alive = false;
                eng.player.shield = 0;
                eng.hitstopTimer = res.hitstop;
                eng.shakeTrauma = 1.0;
                audio.playHit();
                audio.playDefeat();
                spawnParticles(eng.player.x + 15, eng.player.y + 20, '#ef4444', 24, 'spark');
                triggerGameOver();
                break;
              } else {
                eng.player.shield--;
                eng.player.hitInvulnerableTimer = 1.2;
                eng.hitstopTimer = res.hitstop;
                eng.shakeTrauma = 0.65;
                audio.playHit();
                spawnParticles(eng.player.x + 15, eng.player.y + 20, '#ef4444', 12, 'spark');
                addFloatingText(eng.player.x, eng.player.y - 20, 'SHIELD BROKEN!', '#ef4444', 1.1);
              }
            }
          }

          // Scrolls collision check
          for (let i = 0; i < eng.scrolls.length; i++) {
            const scroll = eng.scrolls[i];
            if (!scroll.collected) {
              const dx = scroll.x - (eng.player.x + eng.player.width / 2);
              const dy = scroll.y - (eng.player.y + eng.player.height / 2);
              if (dx * dx + dy * dy < (scroll.radius + 20) * (scroll.radius + 20)) {
                scroll.collected = true;
                eng.player.invincibleTimer = INVINCIBLE_DURATION;
                eng.scrollsCount++;
                eng.score += 300 * eng.comboMultiplier;
                eng.shakeTrauma = 0.3;

                audio.playScrollPickup();
                audio.setInvincibleBgm(true);

                spawnParticles(scroll.x, scroll.y, '#f59e0b', 24, 'ring');
                addFloatingText(scroll.x, scroll.y - 30, 'INVINCIBLE PHASE!', '#fef08a', 1.4);
              }
            }
          }

          if (eng.player.invincibleTimer <= 0) {
            audio.setInvincibleBgm(false);
          }

          // Coins collision check
          for (let i = 0; i < eng.coins.length; i++) {
            const coin = eng.coins[i];
            if (!coin.collected) {
              const dx = coin.x - (eng.player.x + eng.player.width / 2);
              const dy = coin.y - (eng.player.y + eng.player.height / 2);
              if (dx * dx + dy * dy < (coin.radius + 20) * (coin.radius + 20)) {
                coin.collected = true;
                eng.coinsCount++;
                eng.score += coin.value * 25 * eng.comboMultiplier;

                audio.playCoin();
                spawnParticles(coin.x, coin.y, '#10b981', 8, 'coin');

                const cRes = updateCombo(eng.combo, eng.comboTimer, 0, 'coin');
                eng.combo = cRes.combo;
                eng.comboTimer = cRes.comboTimer;
                eng.comboMultiplier = cRes.comboMultiplier;
                eng.maxCombo = Math.max(eng.maxCombo, eng.combo);
              }
            }
          }

          // Combo decay
          const cDecay = updateCombo(eng.combo, eng.comboTimer, simDt, 'none');
          eng.combo = cDecay.combo;
          eng.comboTimer = cDecay.comboTimer;
          eng.comboMultiplier = cDecay.comboMultiplier;

          // Distance score increment
          eng.score += Math.round(forwardMove * 0.2);

          // Chunk generation ahead of camera
          if (eng.levelGen) {
            const forwardHorizon = eng.cameraX + window.innerWidth + 800;
            const newChunk = eng.levelGen.generateUpTo(forwardHorizon);
            eng.hazards.push(...newChunk.hazards);
            eng.scrolls.push(...newChunk.scrolls);
            eng.coins.push(...newChunk.coins);
          }

          // Cleanup entities behind camera
          const cMin = eng.cameraX - 400;
          eng.hazards = eng.hazards.filter(h => h.x > cMin);
          eng.scrolls = eng.scrolls.filter(s => s.x > cMin && !s.collected);
          eng.coins = eng.coins.filter(c => c.x > cMin && !c.collected);

          // Stage Victory condition
          if (gameMode === 'stage' && eng.stage.targetDistance && eng.distance >= eng.stage.targetDistance) {
            triggerVictory();
          }
        }

        // Screen shake decay
        eng.shakeTrauma = Math.max(0, eng.shakeTrauma - dt * 2.5);

        // Update particles
        eng.particles.forEach(p => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
        });
        eng.particles = eng.particles.filter(p => p.life > 0);

        eng.floatingTexts.forEach(ft => {
          ft.life -= dt;
        });
        eng.floatingTexts = eng.floatingTexts.filter(ft => ft.life > 0);

        // Throttle HUD state updates to ~12 FPS
        hudThrottle += dt;
        if (hudThrottle > 0.08) {
          hudThrottle = 0;
          setHudState({
            score: eng.score,
            distance: eng.distance,
            coins: eng.coinsCount,
            combo: eng.combo,
            comboMultiplier: eng.comboMultiplier,
            shield: eng.player.shield,
            maxShield: eng.player.maxShield,
            invincibleTimer: eng.player.invincibleTimer,
            gravityDir: eng.player.gravityDir,
            surface: eng.player.surface,
          });
        }
      }

      // Render frame
      renderer.render(
        eng.player,
        eng.cameraX,
        eng.floorY,
        eng.ceilingY,
        eng.hazards,
        eng.scrolls,
        eng.coins,
        eng.particles,
        eng.floatingTexts,
        eng.shakeTrauma,
        eng.stage,
        dt
      );

      eng.animFrameId = requestAnimationFrame(loop);
    };

    engineRef.current.animFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (engineRef.current.animFrameId) {
        cancelAnimationFrame(engineRef.current.animFrameId);
      }
    };
  }, [gameMode]);

  const triggerGameOver = () => {
    const eng = engineRef.current;
    const finalScore = calculateRunScore(eng.distance, eng.coinsCount, eng.slashesCount, eng.score);
    const stats: RunStats = {
      score: finalScore,
      distance: eng.distance,
      coins: eng.coinsCount,
      scrollsCollected: eng.scrollsCount,
      slashes: eng.slashesCount,
      maxCombo: eng.maxCombo,
      timeSurvived: eng.timeSurvived,
    };

    setFinalStats(stats);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('ninja_highscore', String(finalScore));
    }

    setGameState('gameover');
    audio.stopBgm();
  };

  const triggerVictory = () => {
    const eng = engineRef.current;
    const finalScore = calculateRunScore(eng.distance, eng.coinsCount, eng.slashesCount, eng.score);
    const stats: RunStats = {
      score: finalScore,
      distance: eng.distance,
      coins: eng.coinsCount,
      scrollsCollected: eng.scrollsCount,
      slashes: eng.slashesCount,
      maxCombo: eng.maxCombo,
      timeSurvived: eng.timeSurvived,
    };

    setFinalStats(stats);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('ninja_highscore', String(finalScore));
    }

    setGameState('victory');
    audio.stopBgm();
  };

  const currentStage = STAGES.find(s => s.id === selectedStageId) || STAGES[0];

  return (
    <div
      className="relative w-full min-h-screen overflow-x-hidden overflow-y-auto select-none bg-[#08090d]"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        handleTriggerFlip();
      }}
    >
      <canvas ref={canvasRef} className="fixed inset-0 block w-full h-full" />

      {gameState === 'title' && (
        <TitleScreen
          onStartGame={startGame}
          selectedMode={gameMode}
          setSelectedMode={setGameMode}
          selectedStageId={selectedStageId}
          setSelectedStageId={setSelectedStageId}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          highScore={highScore}
        />
      )}

      {gameState === 'playing' && (
        <GameHUD
          score={hudState.score}
          distance={hudState.distance}
          targetDistance={gameMode === 'stage' ? currentStage.targetDistance : undefined}
          coins={hudState.coins}
          combo={hudState.combo}
          comboMultiplier={hudState.comboMultiplier}
          shield={hudState.shield}
          maxShield={hudState.maxShield}
          invincibleTimer={hudState.invincibleTimer}
          maxInvincibleDuration={INVINCIBLE_DURATION}
          gravityDir={hudState.gravityDir}
          surface={hudState.surface}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onRestart={handleRestart}
          onTriggerFlip={handleTriggerFlip}
          stageName={gameMode === 'stage' ? currentStage.name : 'Endless Run'}
        />
      )}

      {gameState === 'paused' && (
        <PauseModal
          onResume={handlePause}
          onRestart={handleRestart}
          onTitle={handleTitle}
        />
      )}

      {gameState === 'gameover' && (
        <GameOverModal
          stats={finalStats}
          highScore={highScore}
          onRestart={handleRestart}
          onTitle={handleTitle}
        />
      )}

      {gameState === 'victory' && (
        <VictoryModal
          stageName={currentStage.name}
          stats={finalStats}
          hasNextStage={selectedStageId < STAGES.length}
          onNextStage={handleNextStage}
          onRestart={handleRestart}
          onTitle={handleTitle}
        />
      )}
    </div>
  );
}
