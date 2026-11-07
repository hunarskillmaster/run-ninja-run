import React from 'react';
import { Play, RotateCcw, Home, Trophy, Skull, Award } from 'lucide-react';
import { RunStats } from '../game/types.ts';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart, onTitle }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto p-4 bg-black/75 pointer-events-auto">
      <div className="w-full max-w-sm p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-center">
        <h2 className="text-2xl font-black uppercase tracking-wider text-slate-100 font-['Cinzel']">
          GAME PAUSED
        </h2>
        <p className="mt-1 text-xs text-slate-400">Take a breath, then continue the run</p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            data-start="true"
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm tracking-wider uppercase transition-all shadow-lg cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume [Esc / P]</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Run [R]</span>
          </button>

          <button
            type="button"
            onClick={onTitle}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Title</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  stats: RunStats;
  highScore: number;
  onRestart: () => void;
  onTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, highScore, onRestart, onTitle }) => {
  const isNewHigh = stats.score >= highScore && stats.score > 0;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto p-4 bg-black/85 pointer-events-auto animate-in fade-in duration-300">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-slate-950 border border-red-950/80 shadow-[0_0_50px_rgba(239,68,68,0.25)] text-center">
        {/* Defeat Icon */}
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center">
          <Skull className="w-7 h-7 text-red-500" />
        </div>

        <h2 className="text-3xl font-black uppercase tracking-wider text-rose-500 font-['Cinzel']">
          SHINOBI DEFEATED
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">Keep running, sharpen your reflexes!</p>

        {isNewHigh && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/80 text-amber-300 text-xs font-black tracking-wider animate-bounce">
            <Trophy className="w-3.5 h-3.5" />
            <span>NEW HIGH SCORE RECORD!</span>
          </div>
        )}

        {/* Run Metrics Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SCORE</span>
            <div className="text-base font-black text-amber-400 tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DISTANCE</span>
            <div className="text-base font-black text-white tabular-nums">
              {Math.floor(stats.distance)}m
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SCROLLS</span>
            <div className="text-base font-black text-amber-300 tabular-nums">
              {stats.scrollsCollected}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SLICED</span>
            <div className="text-base font-black text-rose-400 tabular-nums">
              {stats.slashes}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            data-start="true"
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(225,29,72,0.5)] cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN [SPACE]</span>
          </button>

          <button
            type="button"
            onClick={onTitle}
            className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
          >
            Title
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  stageName: string;
  stats: RunStats;
  hasNextStage: boolean;
  onNextStage: () => void;
  onRestart: () => void;
  onTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stageName,
  stats,
  hasNextStage,
  onNextStage,
  onRestart,
  onTitle,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto p-4 bg-black/85 pointer-events-auto animate-in fade-in duration-300">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-slate-950 border border-emerald-900/80 shadow-[0_0_50px_rgba(16,185,129,0.25)] text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center">
          <Award className="w-7 h-7 text-emerald-400" />
        </div>

        <h2 className="text-3xl font-black uppercase tracking-wider text-emerald-400 font-['Cinzel']">
          STAGE CLEARED!
        </h2>
        <p className="mt-0.5 text-xs text-slate-300">{stageName}</p>

        {/* Stats Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SCORE</span>
            <div className="text-base font-black text-amber-400 tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TIME</span>
            <div className="text-base font-black text-white tabular-nums">
              {stats.timeSurvived.toFixed(1)}s
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SCROLLS</span>
            <div className="text-base font-black text-emerald-400 tabular-nums">
              {stats.scrollsCollected}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HAZARDS CUT</span>
            <div className="text-base font-black text-rose-400 tabular-nums">
              {stats.slashes}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          {hasNextStage ? (
            <button
              type="button"
              data-start="true"
              onClick={onNextStage}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer transition-all"
            >
              <span>NEXT STAGE [SPACE]</span>
            </button>
          ) : (
            <button
              type="button"
              data-start="true"
              onClick={onRestart}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 text-white font-black text-sm tracking-widest uppercase shadow-lg cursor-pointer"
            >
              <span>PLAY AGAIN</span>
            </button>
          )}

          <button
            type="button"
            onClick={onTitle}
            className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
          >
            Title
          </button>
        </div>
      </div>
    </div>
  );
};
