import React from 'react';
import { Volume2, VolumeX, Pause, RotateCcw, Shield, Sparkles } from 'lucide-react';

interface GameHUDProps {
  score: number;
  distance: number;
  targetDistance?: number;
  coins: number;
  combo: number;
  comboMultiplier: number;
  shield: number;
  maxShield: number;
  invincibleTimer: number;
  maxInvincibleDuration: number;
  gravityDir: 1 | -1;
  surface: 'floor' | 'ceiling' | 'air';
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
  onTriggerFlip: () => void;
  stageName?: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  distance,
  targetDistance,
  coins,
  combo,
  comboMultiplier,
  shield,
  maxShield,
  invincibleTimer,
  maxInvincibleDuration,
  gravityDir,
  isMuted,
  onToggleMute,
  onPause,
  onRestart,
  onTriggerFlip,
  stageName,
}) => {
  const isInvincible = invincibleTimer > 0;
  const invinciblePercent = Math.min(100, Math.max(0, (invincibleTimer / maxInvincibleDuration) * 100));
  const stageProgress = targetDistance
    ? Math.min(100, Math.max(0, (distance / targetDistance) * 100))
    : ((distance % 500) / 500) * 100;
  const currentSector = Math.floor(distance / 500) + 1;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 font-['Plus_Jakarta_Sans']">
      {/* Top HUD Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Distance, Score, and Jade Tomoe Coins */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">DIST</span>
            <span className="font-['Teko'] text-3xl sm:text-4xl font-bold tracking-tight text-white tabular-nums leading-none drop-shadow-md">
              {Math.floor(distance)}
              <span className="text-sm font-sans font-semibold text-slate-400 ml-0.5">m</span>
            </span>
            {targetDistance && (
              <span className="text-xs font-semibold text-slate-400">
                / {targetDistance}m
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SCORE</span>
              <span className="font-mono text-sm sm:text-base font-extrabold text-amber-400 tabular-nums">
                {score.toLocaleString()}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">JADE</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400 tabular-nums">
                {coins}
              </span>
            </div>

            {comboMultiplier > 1 && (
              <div className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-500/80 text-[10px] font-black text-rose-300 uppercase tracking-wider animate-pulse">
                x{comboMultiplier} COMBO
              </div>
            )}
          </div>

          {stageName && (
            <div className="text-[11px] font-bold tracking-wider text-sky-400 uppercase drop-shadow">
              {stageName}
            </div>
          )}
        </div>

        {/* Center Makimono Scroll Bar HUD with tiny running ninja */}
        <div className="flex flex-col items-center pointer-events-none gap-1.5 max-w-[280px] sm:max-w-md w-full mx-2">
          {isInvincible ? (
            /* Invincibility countdown bar */
            <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest text-amber-200">
                  SHADOW SLICER INVINCIBILITY
                </span>
                <span className="font-mono text-xs font-bold text-white tabular-nums">
                  {invincibleTimer.toFixed(1)}s
                </span>
              </div>
              <div className="w-full max-w-xs h-2.5 mt-1 rounded-full bg-slate-900/90 border border-amber-400/60 overflow-hidden shadow-inner relative">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all duration-75 ease-linear shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                  style={{ width: `${invinciblePercent}%` }}
                />
              </div>
            </div>
          ) : (
            /* Makimono Scroll Bar with tiny running ninja */
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center w-full max-w-xs drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {/* Left spindle */}
                <div className="w-2 sm:w-2.5 h-6 rounded-sm bg-gradient-to-b from-amber-900 via-amber-600 to-amber-950 border border-amber-400/70 shadow-sm flex-shrink-0" />

                {/* Central unfurled scroll track */}
                <div className="relative flex-1 h-5 sm:h-6 mx-0.5 rounded-sm bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-y border-amber-500/40 overflow-hidden flex items-center px-1">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />

                  {/* Progress fill */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-rose-900/80 via-rose-600/70 to-amber-500/80 transition-all duration-100 ease-out border-r border-amber-300"
                    style={{ width: `${stageProgress}%` }}
                  />

                  {/* Track distance marks */}
                  <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none opacity-30 text-[8px] text-amber-200 font-mono">
                    <span>|</span>
                    <span>|</span>
                    <span>|</span>
                    <span>|</span>
                  </div>

                  {/* Tiny running ninja avatar sliding across the scroll bar */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-100 ease-out z-10 flex items-center justify-center pointer-events-none"
                    style={{ left: `${Math.min(94, Math.max(6, stageProgress))}%` }}
                  >
                    <div className="w-4 h-4 rounded-full bg-slate-900 border border-amber-300 flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse">
                      <span className="text-[9px] text-amber-300 leading-none">忍</span>
                    </div>
                  </div>

                  {/* Text overlay */}
                  <div className="relative z-10 w-full flex items-center justify-between text-[9px] sm:text-[10px] font-bold tracking-wider px-1 text-slate-200">
                    <span className="text-amber-300 drop-shadow">
                      {targetDistance ? `${Math.floor(stageProgress)}%` : `SEC ${currentSector}`}
                    </span>
                    <span className="text-slate-300 font-mono text-[9px] drop-shadow">
                      {targetDistance ? `${Math.floor(distance)}m / ${targetDistance}m` : `${Math.floor(distance)}m`}
                    </span>
                  </div>
                </div>

                {/* Right spindle with torii gate goal icon */}
                <div className="w-2 sm:w-2.5 h-6 rounded-sm bg-gradient-to-b from-amber-900 via-amber-600 to-amber-950 border border-amber-400/70 shadow-sm flex-shrink-0 flex items-center justify-center">
                  <span className="text-[7px] text-amber-300">⛩</span>
                </div>
              </div>

              {/* Gravity surface status indicator */}
              <div className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-[10px] font-semibold text-slate-300 shadow">
                <span className="text-slate-400 text-[9px]">GRAVITY:</span>
                <span className={`font-bold flex items-center gap-1 ${gravityDir === 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {gravityDir === 1 ? 'FLOOR ⤓' : 'CEILING ⤒'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Vitality Shields & Game Controls */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Shield Sockets */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 shadow">
            {Array.from({ length: maxShield }).map((_, idx) => {
              const socketIndex = idx + 1;
              const isFull = shield >= socketIndex;
              const isCracked = shield === socketIndex - 1 && shield > 0;

              return (
                <div key={idx} className="relative flex items-center justify-center">
                  <Shield
                    className={`w-5 h-5 transition-all ${
                      isFull
                        ? 'text-sky-400 fill-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]'
                        : isCracked
                        ? 'text-amber-500/80 fill-amber-500/30'
                        : 'text-slate-700 fill-transparent opacity-40'
                    }`}
                  />
                  {!isFull && (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                      ✕
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            aria-label={isMuted ? 'Unmute audio [M]' : 'Mute audio [M]'}
            className="w-9 h-9 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            aria-label="Pause game [P or Esc]"
            className="w-9 h-9 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            aria-label="Quick restart [R]"
            className="w-9 h-9 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Bar: Touch / Tap Controls */}
      <div className="flex items-end justify-between w-full pointer-events-auto">
        <div className="hidden sm:block text-[11px] font-semibold text-slate-400/80 tracking-wider">
          <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">SPACE</kbd> or{' '}
          <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">CLICK</kbd> TO INVERT GRAVITY
        </div>

        <button
          type="button"
          onClick={onTriggerFlip}
          className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border-2 border-red-500/80 text-white font-black text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-transform"
        >
          <span>FLIP GRAVITY</span>
          <span className="text-xs text-amber-400">↕</span>
        </button>
      </div>
    </div>
  );
};
