import React from 'react';
import { Play, Trophy, HelpCircle, Target as TargetIcon, ArrowRight, Grid, RotateCcw } from 'lucide-react';
import { LEVELS } from '../data/levels';

interface MenuModalProps {
  highScore: number;
  highestLevelUnlocked: number;
  lang: 'bn' | 'en';
  onStartGame: (levelIndex: number) => void;
  onOpenLevelSelect: () => void;
  onOpenLeaderboard: () => void;
  onOpenHelp: () => void;
  onToggleLang: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  highScore,
  highestLevelUnlocked,
  lang,
  onStartGame,
  onOpenLevelSelect,
  onOpenLeaderboard,
  onOpenHelp,
  onToggleLang,
}) => {
  const isBn = lang === 'bn';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center max-h-[95vh] overflow-y-auto">
        {/* Language switch */}
        <div className="absolute top-4 right-4">
          <button
            onClick={onToggleLang}
            className="px-3 py-1 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
          >
            {isBn ? 'English' : 'বাংলা'}
          </button>
        </div>

        {/* Emblem */}
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
          <TargetIcon className="w-8 h-8 text-amber-400" />
        </div>

        {/* Title */}
        <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 tracking-wider">
          {isBn ? 'তীরন্দাজ' : 'TIRANDAZ'}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
          {isBn
            ? '৪০টি মহাকাব্যিক লেভেলে চলমান বিভিন্ন লক্ষ্যবস্তু ও দেয়ালের বাধা ভেদ করে সেরা তীরন্দাজ হন!'
            : 'Conquer 40 epic levels of moving targets, shifting walls, and crosswinds!'}
        </p>

        {/* High Score Banner */}
        <div className="my-5 py-2 px-4 bg-slate-800/80 border border-slate-700/50 rounded-xl inline-flex items-center gap-3">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400">
            {isBn ? 'আপনার সর্বোচ্চ স্কোর:' : 'Your High Score:'}
          </span>
          <span className="font-cinzel font-bold text-amber-300 text-base sm:text-lg tabular-nums">
            {highScore.toLocaleString()}
          </span>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-4">
          <button
            onClick={() => onStartGame(highestLevelUnlocked)}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>
              {isBn
                ? `লেভেল ${highestLevelUnlocked + 1} খেলুন`
                : `Play Level ${highestLevelUnlocked + 1}`}
            </span>
          </button>

          <button
            onClick={() => onStartGame(0)}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>{isBn ? 'প্রথম থেকে শুরু' : 'Start from Level 1'}</span>
          </button>
        </div>

        {/* Dedicated 40-Level Browser Button */}
        <div className="max-w-md mx-auto mb-5">
          <button
            onClick={onOpenLevelSelect}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 hover:border-amber-400/80 text-amber-300 font-semibold rounded-xl border border-amber-500/40 transition-all text-sm"
          >
            <Grid className="w-4 h-4 text-amber-400" />
            <span>{isBn ? 'সকল ৪০টি লেভেল দেখুন ও বাছাই করুন' : 'View & Select from all 40 Levels'}</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Quick Chapter Overview Preview */}
        <div className="border-t border-slate-800 pt-4 text-left max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isBn ? 'অধ্যায় ভিত্তিক অগ্রগতি' : 'Chapter Progress'}
            </span>
            <span className="text-xs text-amber-400 font-mono">
              {highestLevelUnlocked + 1} / 40
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={onOpenLevelSelect}
              className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 hover:border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold text-slate-200">{isBn ? 'অধ্যায় ১: শিক্ষানবিশ' : 'Ch 1: Novice'}</div>
              <div className="text-[11px] text-slate-500">{isBn ? 'লেভেল ১ - ১০' : 'Levels 1 - 10'}</div>
            </button>
            <button
              onClick={onOpenLevelSelect}
              className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 hover:border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold text-slate-200">{isBn ? 'অধ্যায় ২: প্রহরা ও দুর্গ' : 'Ch 2: Citadel'}</div>
              <div className="text-[11px] text-slate-500">{isBn ? 'লেভেল ১১ - ২০' : 'Levels 11 - 20'}</div>
            </button>
            <button
              onClick={onOpenLevelSelect}
              className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 hover:border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold text-slate-200">{isBn ? 'অধ্যায় ৩: ঝড়ো গিরিখাত' : 'Ch 3: Storm'}</div>
              <div className="text-[11px] text-slate-500">{isBn ? 'লেভেল ২১ - ৩০' : 'Levels 21 - 30'}</div>
            </button>
            <button
              onClick={onOpenLevelSelect}
              className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 hover:border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold text-slate-200">{isBn ? 'অধ্যায় ৪: মহারথী অন্তিম' : 'Ch 4: Apex'}</div>
              <div className="text-[11px] text-slate-500">{isBn ? 'লেভেল ৩১ - ৪০' : 'Levels 31 - 40'}</div>
            </button>
          </div>
        </div>

        {/* Secondary Buttons */}
        <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-slate-800/80 text-xs">
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{isBn ? 'লিডারবোর্ড' : 'Leaderboard'}</span>
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>{isBn ? 'কীভাবে খেলবেন' : 'How to Play'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
