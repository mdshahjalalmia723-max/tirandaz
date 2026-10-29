import React, { useState } from 'react';
import { X, Lock, CheckCircle2, Wind, Target, ArrowRight, ShieldAlert } from 'lucide-react';
import { LEVELS } from '../data/levels';

interface LevelSelectModalProps {
  currentLevelIndex: number;
  highestLevelUnlocked: number;
  lang: 'bn' | 'en';
  onSelectLevel: (levelIndex: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelIndex,
  highestLevelUnlocked,
  lang,
  onSelectLevel,
  onClose,
}) => {
  const isBn = lang === 'bn';
  const [activeChapter, setActiveChapter] = useState<number>(Math.floor(highestLevelUnlocked / 10));

  const chapters = [
    {
      index: 0,
      range: '১ - ১০',
      rangeEn: '1 - 10',
      titleBn: 'শিক্ষানবিশ উপত্যকা',
      titleEn: 'Novice Valley',
      descBn: 'শান্ত আবহাওয়া ও মৌলিক নিশানা',
      descEn: 'Calm winds and foundational target practice',
    },
    {
      index: 1,
      range: '১১ - ২০',
      rangeEn: '11 - 20',
      titleBn: 'রাজকীয় প্রহরা ও দুর্গ',
      titleEn: 'Royal Citadel Guard',
      descBn: 'চলমান বাধা ও দোদুল্যমান তারা',
      descEn: 'Moving stone pillars and swinging stars',
    },
    {
      index: 2,
      range: '২১ - ৩০',
      rangeEn: '21 - 30',
      titleBn: 'ঝড়ো গিরিখাত ও লৌহ ফটক',
      titleEn: 'Storm Chasm & Portcullis',
      descBn: 'তীব্র বাতাস ও দ্রুত ৫টি নিশানা',
      descEn: 'High-speed 5 targets with heavy winds',
    },
    {
      index: 3,
      range: '৩১ - ৪০',
      rangeEn: '31 - 40',
      titleBn: 'মহারথী অন্তিম লড়াই',
      titleEn: 'Grandmaster Apex Arena',
      descBn: 'ক্ষুদ্রতম নিশানা ও চরম গতিবেগ',
      descEn: 'Micro targets and lightning velocities',
    },
  ];

  const currentChapterLevels = LEVELS.slice(activeChapter * 10, (activeChapter + 1) * 10);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-amber-400" />
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-300">
                {isBn ? '৪০টি লেভেলের পূর্ণাঙ্গ তালিকা' : 'All 40 Archery Levels'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isBn
                ? `আপনার আনলক করা লেভেল: ${highestLevelUnlocked + 1} / ৪০`
                : `Unlocked progress: ${highestLevelUnlocked + 1} / 40`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title={isBn ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 shrink-0">
          {chapters.map((ch) => {
            const isSelected = activeChapter === ch.index;
            const isUnlocked = highestLevelUnlocked >= ch.index * 10;
            return (
              <button
                key={ch.index}
                onClick={() => setActiveChapter(ch.index)}
                className={`p-2.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 shadow-sm'
                    : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {isBn ? `লেভেল ${ch.range}` : `Levels ${ch.rangeEn}`}
                  </span>
                  {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-600" />}
                </div>
                <div className="text-xs font-semibold truncate mt-0.5">
                  {isBn ? ch.titleBn : ch.titleEn}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Chapter Details */}
        <div className="bg-slate-800/40 border border-slate-800/80 rounded-xl p-3 mb-4 shrink-0 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-amber-300">
              {isBn ? chapters[activeChapter].titleBn : chapters[activeChapter].titleEn}
            </span>
            <span className="mx-2 text-slate-600">·</span>
            <span className="text-slate-400">
              {isBn ? chapters[activeChapter].descBn : chapters[activeChapter].descEn}
            </span>
          </div>
          <span className="font-mono text-slate-500 hidden sm:inline">
            {isBn ? `১০টি পর্যায়` : `10 stages`}
          </span>
        </div>

        {/* Levels Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {currentChapterLevels.map((lvl) => {
            const idx = lvl.levelNumber - 1;
            const isUnlocked = idx <= highestLevelUnlocked;
            const isCurrent = idx === currentLevelIndex;
            const windSpeed = Math.abs(lvl.wind * 8).toFixed(0);

            return (
              <div
                key={lvl.levelNumber}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/40'
                    : isUnlocked
                    ? 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                    : 'bg-slate-900/40 border-slate-800/50 opacity-60'
                }`}
              >
                {/* Level Index and Info */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : isUnlocked
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    {isUnlocked ? lvl.levelNumber : <Lock className="w-4 h-4 text-slate-500" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-200">
                        {isBn ? lvl.nameBn : lvl.nameEn}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded">
                          {isBn ? 'চলমান' : 'Current'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{lvl.targets.length} {isBn ? 'লক্ষ্যবস্তু' : 'targets'}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Wind className="w-3 h-3 text-cyan-400" />
                        <span className="font-mono">{windSpeed} km/h</span>
                      </span>
                      {lvl.obstacles.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-amber-400/90">{lvl.obstacles.length} {isBn ? 'বাধা' : 'wall'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Play Button */}
                {isUnlocked ? (
                  <button
                    onClick={() => {
                      onSelectLevel(idx);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <span>{isBn ? 'খেলুন' : 'Play'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs text-slate-600 font-mono flex items-center gap-1 shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isBn ? 'লকড' : 'Locked'}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            {isBn
              ? 'যেকোনো আনলক করা লেভেলে ক্লিক করে সরাসরি খেলতে পারবেন'
              : 'Click any unlocked level to play instantly'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
          >
            {isBn ? 'ফিরে যান' : 'Back'}
          </button>
        </div>
      </div>
    </div>
  );
};
