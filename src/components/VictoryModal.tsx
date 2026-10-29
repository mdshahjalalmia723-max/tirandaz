import React, { useState } from 'react';
import { Crown, Trophy, Check, ArrowLeft, RotateCcw } from 'lucide-react';
import { saveLeaderboardEntry } from '../utils/leaderboard';

interface VictoryModalProps {
  score: number;
  accuracy: number;
  lang: 'bn' | 'en';
  onRestartGame: () => void;
  onGoToMenu: () => void;
  onOpenLeaderboard: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  accuracy,
  lang,
  onRestartGame,
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
      levelReached: 40,
      accuracy,
      date: today,
    });
    setIsSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500 rounded-2xl p-6 md:p-8 shadow-2xl text-center">
        {/* Crown Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-4 animate-bounce">
          <Crown className="w-10 h-10 text-amber-400" />
        </div>

        {/* Victory Title */}
        <h2 className="font-cinzel text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
          {isBn ? 'অভিনন্দন! আপনি মহারাজ তীরন্দাজ!' : 'Congratulations! Royal Grandmaster!'}
        </h2>
        <p className="text-slate-300 text-sm md:text-base mt-2">
          {isBn
            ? 'আপনি সফলভাবে সমস্ত ৪০টি লেভেলের কঠিন চলমান লক্ষ্যবস্তু ও বাধা অতিক্রম করেছেন!'
            : 'You have conquered all 40 intense levels of moving targets and obstacles!'}
        </p>

        {/* Total Score Display */}
        <div className="my-6 p-4 bg-slate-800/90 border border-amber-500/40 rounded-xl grid grid-cols-2 gap-4 text-left">
          <div>
            <div className="text-xs text-slate-400">{isBn ? 'চূড়ান্ত স্কোর' : 'Grand Total Score'}</div>
            <div className="font-cinzel text-2xl font-bold text-amber-300 tabular-nums">
              {score.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">{isBn ? 'গড় নির্ভুলতা' : 'Average Accuracy'}</div>
            <div className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
              {accuracy}%
            </div>
          </div>
        </div>

        {/* Save to Leaderboard */}
        <div className="mb-6 p-4 bg-slate-800/60 border border-slate-700 rounded-xl">
          <h3 className="text-xs font-semibold text-amber-300 mb-2 text-left">
            {isBn ? 'সেরা তীরন্দাজদের তালিকায় নাম লিখুন:' : 'Record your name in Royal Hall of Fame:'}
          </h3>
          {isSaved ? (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-400 font-medium">
              <Check className="w-4 h-4" />
              <span>{isBn ? 'চ্যাম্পিয়ন তালিকায় যুক্ত করা হয়েছে!' : 'Enshrined in Leaderboard!'}</span>
            </div>
          ) : (
            <form onSubmit={handleSaveScore} className="flex gap-2">
              <input
                type="text"
                maxLength={18}
                placeholder={isBn ? 'চ্যাম্পিয়নের নাম' : 'Champion Name'}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="flex-1 bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
              >
                {isBn ? 'সংরক্ষণ' : 'Save'}
              </button>
            </form>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onRestartGame}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{isBn ? 'আবার প্রথম থেকে শুরু করুন' : 'Play Again from Level 1'}</span>
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
