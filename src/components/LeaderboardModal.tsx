import React, { useEffect, useState } from 'react';
import { Trophy, Medal, X, ArrowLeft, RefreshCw } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { getLeaderboard } from '../utils/leaderboard';

interface LeaderboardModalProps {
  lang: 'bn' | 'en';
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ lang, onClose }) => {
  const isBn = lang === 'bn';
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="font-cinzel text-xl md:text-2xl font-bold text-amber-300">
              {isBn ? 'সেরা তীরন্দাজদের লিডারবোর্ড' : 'Hall of Champions'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table of Entries */}
        <div className="my-5 max-h-[380px] overflow-y-auto space-y-2 pr-1">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              {isBn ? 'এখনো কোনো রেকর্ড নেই!' : 'No entries recorded yet!'}
            </div>
          ) : (
            entries.map((entry, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              return (
                <div
                  key={entry.id || index}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    isFirst
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : isSecond
                      ? 'bg-slate-800/80 border-slate-700/80'
                      : isThird
                      ? 'bg-amber-950/20 border-amber-800/30'
                      : 'bg-slate-900/60 border-slate-800/80'
                  }`}
                >
                  {/* Rank & Name */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isFirst
                          ? 'bg-amber-400 text-slate-950'
                          : isSecond
                          ? 'bg-slate-300 text-slate-950'
                          : isThird
                          ? 'bg-amber-700 text-amber-100'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-200">{entry.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>
                          {isBn ? `লেভেল ${entry.levelReached}` : `Lvl ${entry.levelReached}`}
                        </span>
                        <span>·</span>
                        <span>{entry.accuracy}% {isBn ? 'নির্ভুলতা' : 'acc'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="font-cinzel font-bold text-base md:text-lg text-amber-300 tabular-nums">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">{entry.date}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>{isBn ? 'শীর্ষ ১৫টি সেরা স্কোর সংরক্ষিত' : 'Top 15 scores recorded'}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
