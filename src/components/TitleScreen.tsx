import React from 'react';
import { STAGES } from '../game/stages.ts';
import { Difficulty, GameMode } from '../game/types.ts';
import { Volume2, VolumeX, Shield, Skull, Zap } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: (mode: GameMode, stageId: number, difficulty: Difficulty) => void;
  selectedMode: GameMode;
  setSelectedMode: (mode: GameMode) => void;
  selectedStageId: number;
  setSelectedStageId: (stageId: number) => void;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  highScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  selectedMode,
  setSelectedMode,
  selectedStageId,
  setSelectedStageId,
  difficulty,
  setDifficulty,
  isMuted,
  onToggleMute,
  highScore,
}) => {
  return (
    <div className="fixed inset-0 z-30 flex min-h-0 flex-col justify-between overflow-y-auto p-6 sm:p-10 pointer-events-auto bg-gradient-to-b from-black/60 via-transparent to-black/85">
      {/* Top Header / High Score & Mute Button */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 shadow-lg text-xs font-semibold tracking-wider text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>BEST RUN:</span>
          <span className="font-mono text-amber-400 font-bold">{highScore.toLocaleString()} PTS</span>
        </div>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>
      </div>

      {/* Centerpiece Title & Mode Selection */}
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-auto py-4">
        {/* Mitsudomoe crest emblem */}
        <div className="relative mb-3 flex items-center justify-center">
          <svg className="w-20 h-20 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="3" opacity="0.8" />
            <circle cx="50" cy="50" r="41" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 4" />
            <path
              d="M50 20 C60 20 70 30 70 42 C70 54 58 62 48 56 C38 50 42 36 50 20 Z"
              fill="currentColor"
            />
            <path
              d="M76 65 C71 74 59 80 47 77 C35 74 32 60 41 52 C50 44 63 52 76 65 Z"
              fill="currentColor"
            />
            <path
              d="M24 65 C19 56 21 44 31 37 C41 30 52 38 49 48 C46 58 33 60 24 65 Z"
              fill="currentColor"
            />
            <circle cx="50" cy="50" r="5" fill="#fef08a" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-amber-200 to-rose-400 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] font-['Cinzel']">
          RUN NINJA RUN
        </h1>

        <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-400/90 font-['Cinzel']">
          <span>PRECISION GRAVITY PLATFORMER</span>
          <span className="text-slate-500">•</span>
          <span>NO JUMPING • ONLY INVERT GRAVITY</span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedMode('stage')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wider uppercase transition-all cursor-pointer ${
              selectedMode === 'stage'
                ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)] border border-rose-400'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            Stage Infiltration
          </button>
          <button
            type="button"
            onClick={() => setSelectedMode('endless')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wider uppercase transition-all cursor-pointer ${
              selectedMode === 'endless'
                ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)] border border-amber-400'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            Endless Mastery
          </button>
        </div>

        {/* Stage selection chips (in Stage Mode) */}
        {selectedMode === 'stage' && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-xl">
            {STAGES.map(st => {
              const active = selectedStageId === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStageId(st.id)}
                  className={`p-2.5 rounded-lg text-left transition-all cursor-pointer border ${
                    active
                      ? 'bg-slate-800/90 border-amber-400/80 shadow-md ring-1 ring-amber-400/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Stage {st.id}
                  </div>
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {st.name.replace(`Stage ${st.id}: `, '')}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Difficulty Selector */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Difficulty:</span>
          <button
            type="button"
            onClick={() => setDifficulty('normal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              difficulty === 'normal'
                ? 'bg-sky-950 border border-sky-400 text-sky-200'
                : 'bg-slate-900/60 border border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Shinobi (3 Shields)</span>
          </button>
          <button
            type="button"
            onClick={() => setDifficulty('hardcore')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              difficulty === 'hardcore'
                ? 'bg-rose-950 border border-rose-500 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                : 'bg-slate-900/60 border border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-rose-400" />
            <span>Hardcore (1-Hit Death)</span>
          </button>
        </div>

        {/* Start Game Button */}
        <div className="mt-7">
          <button
            type="button"
            data-start="true"
            onClick={() => onStartGame(selectedMode, selectedStageId, difficulty)}
            className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-black text-lg tracking-widest uppercase shadow-[0_0_30px_rgba(225,29,72,0.6)] hover:shadow-[0_0_45px_rgba(225,29,72,0.8)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-6 h-6 text-amber-300 animate-bounce" />
            <span>START SHINOBI RUN</span>
            <span className="text-xs font-normal text-rose-200 bg-black/30 px-2 py-0.5 rounded border border-rose-300/40">
              SPACE / TAP
            </span>
          </button>
        </div>
      </div>

      {/* Control hints bar */}
      <div className="text-center text-xs sm:text-sm text-slate-400 tracking-wider">
        <span>[Space] or [Tap Screen] Flip Gravity</span>
        <span className="mx-2 text-slate-600">•</span>
        <span>Collect Glowing Scrolls for Invincibility</span>
        <span className="mx-2 text-slate-600">•</span>
        <span>[P] Pause</span>
        <span className="mx-2 text-slate-600">•</span>
        <span>[M] Mute</span>
      </div>
    </div>
  );
};
