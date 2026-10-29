import React from 'react';
import { Star, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { LevelConfig } from '../types';

interface LevelClearedModalProps {
  level: LevelConfig;
  score: number;
  arrowsLeft: number;
  accuracy: number;
  isLastLevel: boolean;
  lang: 'bn' | 'en';
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onGoToMenu: () => void;
}

export const LevelClearedModal: React.FC<LevelClearedModalProps> = ({
  level,
  score,
  arrowsLeft,
  accuracy,
  isLastLevel,
  lang,
  onNextLevel,
  onReplayLevel,
  onGoToMenu,
}) => {
  const isBn = lang === 'bn';

  // Calculate stars
  let stars = 1;
  if (arrowsLeft >= 2 && accuracy >= 70) stars = 2;
  if (arrowsLeft >= 4 && accuracy >= 85) stars = 3;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-2xl text-center">
        {/* Star Rating Display */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3].map((starIndex) => (
            <Star
              key={starIndex}
              className={`w-10 h-10 transition-transform transform ${
                starIndex <= stars
                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Level Name */}
        <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-amber-300">
          {isBn ? 'লেভেল সম্পন্ন!' : 'Level Completed!'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isBn ? level.nameBn : level.nameEn}
        </p>

        {/* Stats Grid */}
        <div className="my-6 p-4 bg-slate-800/80 border border-slate-700/60 rounded-xl grid grid-cols-2 gap-4 text-left">
          <div>
            <div className="text-xs text-slate-400">{isBn ? 'মোট পয়েন্ট' : 'Total Score'}</div>
            <div className="font-cinzel text-xl font-bold text-amber-300 tabular-nums">
              {score.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">{isBn ? 'নিখুঁত নিশানা' : 'Accuracy'}</div>
            <div className="font-mono text-xl font-bold text-emerald-400 tabular-nums">
              {accuracy}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">{isBn ? 'অবশিষ্ট তীর' : 'Arrows Left'}</div>
            <div className="font-mono text-lg font-semibold text-sky-400 tabular-nums">
              {arrowsLeft} <span className="text-xs text-slate-500">(+{arrowsLeft * 75} বোনাস)</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">{isBn ? 'লেভেল রেটিং' : 'Rating'}</div>
            <div className="text-lg font-bold text-amber-400">
              {stars === 3 ? (isBn ? 'অসাধারণ!' : 'Master!') : stars === 2 ? (isBn ? 'দারুণ!' : 'Great!') : (isBn ? 'উত্তীর্ণ!' : 'Passed!')}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onNextLevel}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
          >
            <span>
              {isLastLevel
                ? isBn
                  ? 'চূড়ান্ত বিজয় দেখুন!'
                  : 'See Final Victory!'
                : isBn
                ? 'পরবর্তী লেভেল'
                : 'Next Level'}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={onReplayLevel}
              className="flex items-center justify-center gap-1.5 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isBn ? 'পুনরায় খেলুন' : 'Replay'}</span>
            </button>
            <button
              onClick={onGoToMenu}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            >
              {isBn ? 'মেনু' : 'Menu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
