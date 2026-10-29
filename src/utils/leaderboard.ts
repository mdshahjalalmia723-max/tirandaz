import { LeaderboardEntry } from '../types';

const STORAGE_KEY = 'tirandaz_archery_leaderboard_v1';

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: '1',
    name: 'অর্জুন শ্রেষ্ঠ (Arjun)',
    score: 3450,
    levelReached: 10,
    accuracy: 94,
    date: '২০২৬-১০-২৪',
  },
  {
    id: '2',
    name: 'রবিন হুড (Robin Hood)',
    score: 2980,
    levelReached: 9,
    accuracy: 89,
    date: '২০২৬-১০-২৬',
  },
  {
    id: '3',
    name: 'শাহজালাল (Shahjalal)',
    score: 2620,
    levelReached: 8,
    accuracy: 86,
    date: '২০২৬-১০-২৭',
  },
  {
    id: '4',
    name: 'তীরন্দাজ তানভীর (Tanvir)',
    score: 2150,
    levelReached: 7,
    accuracy: 82,
    date: '২০২৬-১০-২৫',
  },
  {
    id: '5',
    name: 'রয়েল স্নাইপার (Royal Sniper)',
    score: 1840,
    levelReached: 6,
    accuracy: 78,
    date: '২০২৬-১০-২৮',
  },
];

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADERBOARD));
      return INITIAL_LEADERBOARD;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => b.score - a.score);
    }
    return INITIAL_LEADERBOARD;
  } catch {
    return INITIAL_LEADERBOARD;
  }
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): LeaderboardEntry[] {
  const current = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: Date.now().toString(),
  };
  const updated = [...current, newEntry].sort((a, b) => b.score - a.score).slice(0, 15);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}
