import React from 'react';
import { Volume2, VolumeX, RotateCcw, Pause, Play, Trophy, HelpCircle, Wind, ArrowLeft, Grid } from 'lucide-react';
import { LevelConfig } from '../types';

interface GameHUDProps {
  currentLevel: LevelConfig;
  score: number;
  combo: number;
  arrowsLeft: number;
  targetsLeft: number;
  totalTargets: number;
  isPaused: boolean;
  isMuted: boolean;
  lang: 'bn' | 'en';
  onGoToMenu: () => void;
  onOpenLevelSelect: () => void;
  onTogglePause: () => void;
  onRestartLevel: () => void;
  onToggleMute: () => void;
  onOpenLeaderboard: () => void;
  onOpenHelp: () => void;
  onToggleLang: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentLevel,
  score,
  combo,
  arrowsLeft,
  targetsLeft,
  totalTargets,
  isPaused,
  isMuted,
  lang,
  onGoToMenu,
  onOpenLevelSelect,
  onTogglePause,
  onRestartLevel,
  onToggleMute,
  onOpenLeaderboard,
  onOpenHelp,
  onToggleLang,
}) => {
  const isBn = lang === 'bn';
  const windDir = currentLevel.wind >= 0 ? '→' : '←';
  const windSpeed = Math.abs(currentLevel.wind * 8).toFixed(0);

  return (
    <div className="w-full max-w-[1200px] mx-auto mb-3 px-2">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-800">
        {/* Left: Back to Menu & Brand */}
        <div className="flex items-center gap-2.5">
          {/* Back to Menu Button */}
          <button
            onClick={onGoToMenu}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 hover:border-amber-500/40 rounded-lg text-xs font-semibold transition-all shadow-xs"
            title={isBn ? 'প্রধান মেনুতে ফিরে যান' : 'Back to Main Menu'}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-medium">{isBn ? 'মেনু' : 'Menu'}</span>
          </button>

          {/* All 40 Levels Button */}
          <button
            onClick={onOpenLevelSelect}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
            title={isBn ? '৪০টি লেভেল দেখুন ও বাছাই করুন' : 'View all 40 levels'}
          >
            <Grid className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isBn ? 'লেভেলসমূহ' : 'Levels'}</span>
          </button>

          {/* Brand Wordmark */}
          <span className="font-cinzel text-amber-400 font-bold tracking-wider text-base md:text-lg whitespace-nowrap hidden md:inline ml-1">
            {isBn ? 'তীরন্দাজ' : 'TIRANDAZ'}
          </span>
        </div>

        {/* Mid Stats: Wind & Targets & Combo */}
        <div className="flex items-center gap-3 text-xs md:text-sm text-slate-300">
          {/* Wind gauge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono tabular-nums text-cyan-300">
              {windSpeed} km/h {windDir}
            </span>
          </div>

          {/* Targets left */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded">
            <span className="text-slate-400">{isBn ? 'লক্ষ্য:' : 'Targets:'}</span>
            <span className="font-mono tabular-nums text-amber-300 font-bold">
              {totalTargets - targetsLeft}/{totalTargets}
            </span>
          </div>

          {/* Combo Multiplier */}
          {combo > 1 && (
            <div className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-xs font-semibold animate-pulse hidden sm:block">
              {combo}x {isBn ? 'কম্বো!' : 'Combo!'}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language switch */}
          <button
            onClick={onToggleLang}
            className="px-2 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
            title="ভাষা পরিবর্তন / Switch Language"
          >
            {isBn ? 'EN' : 'বাং'}
          </button>

          {/* Leaderboard button */}
          <button
            onClick={onOpenLeaderboard}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded transition-colors"
            title={isBn ? 'লিডারবোর্ড' : 'Leaderboard'}
          >
            <Trophy className="w-4 h-4" />
          </button>

          {/* Help button */}
          <button
            onClick={onOpenHelp}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
            title={isBn ? 'সাহায্য / নির্দেশনা' : 'Instructions'}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Mute button */}
          <button
            onClick={onToggleMute}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
            title={isMuted ? 'সাউন্ড চালু' : 'সাউন্ড বন্ধ'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause button */}
          <button
            onClick={onTogglePause}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
            title={isPaused ? 'চালিয়ে যান' : 'বিরতি'}
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Restart button */}
          <button
            onClick={onRestartLevel}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
            title={isBn ? 'পুনরায় চেষ্টা' : 'Restart Level'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary In-Game Status Ribbon */}
      <div className="flex items-center justify-between mt-2 px-1 text-sm">
        {/* Level description */}
        <div className="text-slate-400 text-xs flex items-center gap-1.5">
          <span className="text-amber-300 font-semibold">
            {isBn ? `লেভেল ${currentLevel.levelNumber} / ৪০` : `Level ${currentLevel.levelNumber} / 40`}
          </span>
          <span className="text-slate-600">·</span>
          <span className="truncate max-w-[200px] sm:max-w-md">
            {isBn ? currentLevel.subtitleBn : currentLevel.subtitleEn}
          </span>
        </div>

        {/* Quiver (Arrows left) & Current Score */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Arrow Quiver */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 hidden xs:inline">{isBn ? 'তীর:' : 'Arrows:'}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: arrowsLeft }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-4 bg-amber-400 rounded-xs shadow-xs"
                  title={`${arrowsLeft} arrows left`}
                />
              ))}
              {Array.from({ length: Math.max(0, currentLevel.arrowsAllowed - arrowsLeft) }).map((_, i) => (
                <div key={`spent_${i}`} className="w-1.5 h-4 bg-slate-700/60 rounded-xs" />
              ))}
            </div>
            <span className="font-mono tabular-nums text-xs text-amber-300 ml-1 font-semibold">
              {arrowsLeft}
            </span>
          </div>

          {/* Score Counter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">{isBn ? 'পয়েন্ট:' : 'Score:'}</span>
            <span className="font-cinzel text-lg sm:text-xl font-bold tabular-nums text-amber-400 tracking-wider">
              {score.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
