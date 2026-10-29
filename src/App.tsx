/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from './types';
import { LEVELS } from './data/levels';
import { sounds } from './utils/audio';
import { getLeaderboard } from './utils/leaderboard';
import { ArcheryCanvas } from './components/ArcheryCanvas';
import { GameHUD } from './components/GameHUD';
import { MenuModal } from './components/MenuModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { LevelClearedModal } from './components/LevelClearedModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { HowToPlayModal } from './components/HowToPlayModal';

export default function App() {
  // Game state
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [highestLevelUnlocked, setHighestLevelUnlocked] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // In-Game Live HUD values
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [currentCombo, setCurrentCombo] = useState<number>(0);
  const [arrowsLeft, setArrowsLeft] = useState<number>(LEVELS[0].arrowsAllowed);
  const [targetsLeft, setTargetsLeft] = useState<number>(LEVELS[0].targets.length);

  // Level Clear / Game Over Results
  const [roundStats, setRoundStats] = useState<{
    score: number;
    arrowsLeft: number;
    accuracy: number;
  }>({ score: 0, arrowsLeft: 0, accuracy: 100 });

  // Load progress and high score from localStorage
  useEffect(() => {
    try {
      const savedUnlocked = localStorage.getItem('tirandaz_unlocked_level');
      if (savedUnlocked) {
        setHighestLevelUnlocked(Math.min(LEVELS.length - 1, parseInt(savedUnlocked, 10)));
      }

      const leaders = getLeaderboard();
      if (leaders.length > 0) {
        setHighScore(leaders[0].score);
      }

      const savedLang = localStorage.getItem('tirandaz_lang') as 'bn' | 'en' | null;
      if (savedLang) {
        setLang(savedLang);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save highest unlocked level
  const unlockLevel = (levelIdx: number) => {
    if (levelIdx > highestLevelUnlocked) {
      setHighestLevelUnlocked(levelIdx);
      localStorage.setItem('tirandaz_unlocked_level', levelIdx.toString());
    }
  };

  // Toggle Language
  const toggleLang = () => {
    const nextLang = lang === 'bn' ? 'en' : 'bn';
    setLang(nextLang);
    localStorage.setItem('tirandaz_lang', nextLang);
  };

  // Toggle Sound Mute
  const toggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Start / Select Game
  const handleStartGame = (levelIndex: number) => {
    setCurrentLevelIndex(levelIndex);
    if (levelIndex === 0) {
      setCurrentScore(0);
    }
    setCurrentCombo(0);
    setArrowsLeft(LEVELS[levelIndex].arrowsAllowed);
    setTargetsLeft(LEVELS[levelIndex].targets.length);
    setIsPaused(false);
    setGameState('PLAYING');
  };

  // Live score update from ArcheryCanvas
  const handleScoreUpdate = useCallback(
    (score: number, combo: number, arrows: number, targetsRemaining: number) => {
      setCurrentScore(score);
      setCurrentCombo(combo);
      setArrowsLeft(arrows);
      setTargetsLeft(targetsRemaining);
      if (score > highScore) {
        setHighScore(score);
      }
    },
    [highScore]
  );

  // Level cleared callback
  const handleLevelComplete = useCallback(
    (stats: { score: number; arrowsLeft: number; accuracy: number }) => {
      setRoundStats(stats);
      setCurrentScore(stats.score);
      if (currentLevelIndex >= LEVELS.length - 1) {
        // Ultimate Victory across all 40 levels
        setGameState('VICTORY');
      } else {
        unlockLevel(currentLevelIndex + 1);
        setGameState('LEVEL_CLEARED');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentLevelIndex, highestLevelUnlocked]
  );

  // Game over callback
  const handleGameOver = useCallback((finalScore: number) => {
    setCurrentScore(finalScore);
    setGameState('GAME_OVER');
  }, []);

  // Go to Next Level
  const handleNextLevel = () => {
    if (currentLevelIndex < LEVELS.length - 1) {
      const nextIdx = currentLevelIndex + 1;
      setCurrentLevelIndex(nextIdx);
      setArrowsLeft(LEVELS[nextIdx].arrowsAllowed);
      setTargetsLeft(LEVELS[nextIdx].targets.length);
      setCurrentCombo(0);
      setIsPaused(false);
      setGameState('PLAYING');
    } else {
      setGameState('VICTORY');
    }
  };

  // Restart current level
  const handleRestartLevel = () => {
    setArrowsLeft(LEVELS[currentLevelIndex].arrowsAllowed);
    setTargetsLeft(LEVELS[currentLevelIndex].targets.length);
    setCurrentCombo(0);
    setIsPaused(false);
    setGameState('PLAYING');
  };

  const currentLevel = LEVELS[currentLevelIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* HUD Bar */}
      <header className="w-full pt-2">
        <GameHUD
          currentLevel={currentLevel}
          score={currentScore}
          combo={currentCombo}
          arrowsLeft={arrowsLeft}
          targetsLeft={targetsLeft}
          totalTargets={currentLevel.targets.length}
          isPaused={isPaused}
          isMuted={isMuted}
          lang={lang}
          onGoToMenu={() => setGameState('MENU')}
          onOpenLevelSelect={() => setGameState('LEVEL_SELECT')}
          onTogglePause={() => setIsPaused((prev) => !prev)}
          onRestartLevel={handleRestartLevel}
          onToggleMute={toggleMute}
          onOpenLeaderboard={() => setGameState('LEADERBOARD')}
          onOpenHelp={() => setGameState('HOW_TO_PLAY')}
          onToggleLang={toggleLang}
        />
      </header>

      {/* Main Interactive Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        <ArcheryCanvas
          key={`canvas_lvl_${currentLevelIndex}_${gameState === 'PLAYING' ? 1 : 0}`}
          levelConfig={currentLevel}
          onLevelComplete={handleLevelComplete}
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
          isPaused={isPaused || gameState !== 'PLAYING'}
          lang={lang}
        />
      </main>

      {/* Footer Info */}
      <footer className="w-full py-2 border-t border-slate-900 text-center text-xs text-slate-500">
        <span>{lang === 'bn' ? 'তীরন্দাজ: রয়্যাল আর্চারি' : 'Tirandaz: Royal Archery'}</span>
        <span className="mx-2">·</span>
        <span>
          {lang === 'bn'
            ? 'মাউস বা স্পর্শ করে টেনে নিশানা করুন ও ছেড়ে দিন'
            : 'Touch or drag back from the bow to aim & release'}
        </span>
      </footer>

      {/* MODALS */}
      {gameState === 'MENU' && (
        <MenuModal
          highScore={highScore}
          highestLevelUnlocked={highestLevelUnlocked}
          lang={lang}
          onStartGame={handleStartGame}
          onOpenLevelSelect={() => setGameState('LEVEL_SELECT')}
          onOpenLeaderboard={() => setGameState('LEADERBOARD')}
          onOpenHelp={() => setGameState('HOW_TO_PLAY')}
          onToggleLang={toggleLang}
        />
      )}

      {gameState === 'LEVEL_SELECT' && (
        <LevelSelectModal
          currentLevelIndex={currentLevelIndex}
          highestLevelUnlocked={highestLevelUnlocked}
          lang={lang}
          onSelectLevel={handleStartGame}
          onClose={() => setGameState(currentScore > 0 ? 'PLAYING' : 'MENU')}
        />
      )}

      {gameState === 'LEVEL_CLEARED' && (
        <LevelClearedModal
          level={currentLevel}
          score={roundStats.score}
          arrowsLeft={roundStats.arrowsLeft}
          accuracy={roundStats.accuracy}
          isLastLevel={currentLevelIndex >= LEVELS.length - 1}
          lang={lang}
          onNextLevel={handleNextLevel}
          onReplayLevel={handleRestartLevel}
          onGoToMenu={() => setGameState('MENU')}
        />
      )}

      {gameState === 'GAME_OVER' && (
        <GameOverModal
          score={currentScore}
          levelNumber={currentLevelIndex + 1}
          accuracy={roundStats.accuracy || 60}
          lang={lang}
          onRestartLevel={handleRestartLevel}
          onGoToMenu={() => setGameState('MENU')}
          onOpenLeaderboard={() => setGameState('LEADERBOARD')}
        />
      )}

      {gameState === 'VICTORY' && (
        <VictoryModal
          score={currentScore}
          accuracy={roundStats.accuracy || 90}
          lang={lang}
          onRestartGame={() => handleStartGame(0)}
          onGoToMenu={() => setGameState('MENU')}
          onOpenLeaderboard={() => setGameState('LEADERBOARD')}
        />
      )}

      {gameState === 'LEADERBOARD' && (
        <LeaderboardModal
          lang={lang}
          onClose={() => setGameState(currentScore > 0 ? 'PLAYING' : 'MENU')}
        />
      )}

      {gameState === 'HOW_TO_PLAY' && (
        <HowToPlayModal
          lang={lang}
          onClose={() => setGameState(currentScore > 0 ? 'PLAYING' : 'MENU')}
        />
      )}
    </div>
  );
}
