import type { GameState, GameStats } from '../types/game';

const GAME_STATE_KEY = '8chances_game_state';
const STATS_KEY = '8chances_stats';

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
  } catch (e) {
    console.warn('Impossible de sauvegarder la partie:', e);
  }
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  localStorage.removeItem(GAME_STATE_KEY);
}

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return JSON.parse(raw) as GameStats;
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Impossible de sauvegarder les stats:', e);
  }
}

function defaultStats(): GameStats {
  return {
    gamesPlayed: 0,
    round1Wins: 0,
    round1Losses: 0,
    round2BestScreens: 0,
    finalBestScore: 0,
    finalGamesPlayed: 0,
    totalCorrectFinalAnswers: 0,
    totalFinalQuestions: 0,
    lastPlayed: 0,
  };
}
