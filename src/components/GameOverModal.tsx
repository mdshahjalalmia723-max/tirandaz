import React, { useState } from 'react';
import { RotateCcw, Trophy, Check, ArrowLeft } from 'lucide-react';
import { saveLeaderboardEntry } from '../utils/leaderboard';

interface GameOverModalProps {
  score: number;
  levelNumber: number;
  accuracy: number;
  lang: 'bn' | 'en';
  onRestartLevel: () => void;
  onGoToMenu: () => void;
  onOpenLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  levelNumber,
  accuracy,
  lang,
  onRestartLevel,
  onGoToMenu,
  onOpenLeaderboard,
}) => {
  const isBn = lang === 'bn';
  const [playerName, setPlayerName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSaved) return;

    const today = new Date().toISOString().split('T')[0];
    saveLeaderboardEntry({
      name: playerName.trim(),
      score,
      levelReached: levelNumber,
      accuracy,
      date: today,
    });
    setIsSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-red-500/30 rounded-2xl p-6 md:p-8 shadow-2xl text-center">
        {/* Skull or Target Emblem */}
        <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-3">
          <RotateCcw className="w-7 h-7 text-red-400" />
        </div>

        {/* Title */}
        <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-red-400">
          {isBn ? 'তীর শেষ!' : 'Out of Arrows!'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isBn
            ? `লেভেল ${levelNumber} সম্পন্ন করতে আরও তীরের প্রয়োজন ছিল`
            : `Level ${levelNumber} was not cleared. Try again!`}
        </p>

        {/* Score & Level Banner */}
        <div className="my-5 p-4 bg-slate-800/80 border border-slate-700/60 rounded-xl grid grid-cols-2 gap-2 text-left">
          <div>
            <div className="text-xs text-slate-400">{isBn ? 'অর্জিত স্কোর' : 'Final Score'}</div>
            <div className="font-cinzel text-xl font-bold text-amber-300 tabular-nums">
              {score.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">{isBn ? 'লেভেল পর্যন্ত' : 'Reached Level'}</div>
            <div className="font-mono text-xl font-bold text-slate-200 tabular-nums">
              {levelNumber} / 40
            </div>
          </div>
        </div>

        {/* Leaderboard Submission */}
        {score > 0 && (
          <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700/40 rounded-xl">
            <h3 className="text-xs font-semibold text-slate-300 mb-2 text-left">
              {isBn ? 'লিডারবোর্ডে আপনার নাম যোগ করুন:' : 'Add your name to Leaderboard:'}
            </h3>
            {isSaved ? (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-400 font-medium">
                <Check className="w-4 h-4" />
                <span>{isBn ? 'লিডারবোর্ডে সংরক্ষিত হয়েছে!' : 'Saved to Leaderboard!'}</span>
              </div>
            ) : (
              <form onSubmit={handleSaveScore} className="flex gap-2">
                <input
                  type="text"
                  maxLength={18}
                  placeholder={isBn ? 'আপনার নাম লিখুন' : 'Enter your name'}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!playerName.trim()}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
                >
                  {isBn ? 'সংরক্ষণ' : 'Save'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onRestartLevel}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isBn ? 'এই লেভেল আবার খেলুন' : 'Retry This Level'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={onOpenLeaderboard}
              className="flex items-center justify-center gap-1.5 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-sm transition-colors"
            >
              <Trophy className="w-4 h-4" />
              <span>{isBn ? 'লিডারবোর্ড' : 'Leaderboard'}</span>
            </button>
            <button
              onClick={onGoToMenu}
              className="flex items-center justify-center gap-1.5 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isBn ? 'প্রধান মেনু' : 'Main Menu'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
