import { useState, useCallback, useEffect } from 'react';
import type {
  GameState, GamePhase, Round1State, Round2State, FinalState,
  RankingQuestion, Challenge2, FinalTheme, FinalQuestion, ThemeAllocation,
} from '../types/game';
import { rankingQuestions } from '../data/rankingQuestions';
import { finalQuestions, questionsByTheme } from '../data/finalQuestions';
import { shuffle, pickRandom, getRank, pointsForRank, computerPickWeighted } from '../utils/gameUtils';
import { saveGameState, loadGameState, clearGameState, loadStats, saveStats } from '../services/storage';
import { fetchFinalQuizQuestions } from '../services/quizApi';
import { fetchRankingQuestions } from '../services/rankingApi';
import { fetchOpenRound2Challenges } from '../services/challengeApi';
import { FINAL_POINTS } from '../types/game';

const ALL_THEMES: FinalTheme[] = [
  'Animaux', 'Arts', 'Bandes dessinées', 'Célébrités', 'Chimie',
  'Cinéma', 'Dessins animés', 'Gastronomie', 'Géographie', 'Histoire',
  'Internet', 'Jeux vidéos', 'Langue française', 'Langues étrangères',
  'Littérature', 'Musique', 'Mythologie', 'Philosophie', 'Physique',
  'Politique', 'Séries TV', 'Sport', 'Télévision',
];

function createInitialRound1(selectedQuestions: RankingQuestion[]): Round1State {
  return {
    questions: selectedQuestions,
    currentQuestionIndex: 0,
    turns: [],
    playerScore: 0,
    computerScore: 0,
    winner: 'none',
    completed: false,
  };
}

function createInitialRound2(
  openApiChallenges: Challenge2[],
): Round2State {
  return {
    challenges: shuffle(openApiChallenges).slice(0, 5),
    currentChallengeIndex: 0,
    screens: Array.from({ length: 8 }, (_, i) => ({
      id: i,
      active: true,
      challengeResults: [],
    })),
    completed: false,
    screensRemaining: 8,
  };
}

function createInitialFinal(screensRemaining: number): FinalState {
  // Sélectionner 8 thèmes qui ont des questions
  const availableThemes = ALL_THEMES.filter(t => (questionsByTheme[t]?.length ?? 0) > 0);
  const selectedThemes = pickRandom(availableThemes, Math.min(8, availableThemes.length)) as FinalTheme[];

  // Pour chaque thème, prendre une question au hasard
  const questionsForTheme: FinalQuestion[] = selectedThemes.map(theme => {
    const pool = questionsByTheme[theme] ?? [];
    return pool[Math.floor(Math.random() * pool.length)] ?? finalQuestions[0];
  });

  const allocations: ThemeAllocation[] = selectedThemes.map((theme, i) => ({
    theme,
    question: questionsForTheme[i],
    chancesAllocated: 0,
  }));

  return {
    selectedThemes,
    questions: questionsForTheme,
    allocations,
    currentQuestionIndex: 0,
    results: [],
    totalScore: 0,
    completed: false,
  };
}

function createFinalFromQuestions(questions: FinalQuestion[]): FinalState {
  const selectedQuestions = shuffle(questions).slice(0, 8);
  const selectedThemes = selectedQuestions.map(question => question.theme);
  const allocations: ThemeAllocation[] = selectedQuestions.map((question, index) => ({
    theme: selectedThemes[index]!,
    question,
    chancesAllocated: 0,
  }));

  return {
    selectedThemes,
    questions: selectedQuestions,
    allocations,
    currentQuestionIndex: 0,
    results: [],
    totalScore: 0,
    completed: false,
  };
}

function selectRound1Questions(availableQuestions: RankingQuestion[]): RankingQuestion[] {
  const featuredCategories = ['Sport', 'Cinéma', 'Musique', 'Livres', 'Arts'];
  const featuredQuestions = shuffle(featuredCategories.flatMap(category => {
    const question = pickRandom(availableQuestions.filter(item => item.category === category), 1)[0];
    return question ? [question] : [];
  }));
  const selectedQuestions = featuredQuestions.slice(0, 2);
  const featuredCategorySet = new Set(featuredCategories);
  const selectedIds = new Set(selectedQuestions.map(question => question.id));
  const remainingQuestions = availableQuestions.filter(question => !selectedIds.has(question.id));
  const generalQuestions = remainingQuestions.filter(question => !featuredCategorySet.has(question.category));

  selectedQuestions.push(...pickRandom(generalQuestions, Math.min(1, generalQuestions.length)));
  if (selectedQuestions.length < 3) {
    const remainingIds = new Set(selectedQuestions.map(question => question.id));
    selectedQuestions.push(...pickRandom(
      availableQuestions.filter(question => !remainingIds.has(question.id)),
      3 - selectedQuestions.length,
    ));
  }

  return shuffle(selectedQuestions);
}

function createNewGameState(
  availableRankingQuestions: RankingQuestion[],
  openApiChallenges: Challenge2[],
): GameState {
  const selectedR1Questions = selectRound1Questions(availableRankingQuestions);
  return {
    phase: 'round1',
    round1: createInitialRound1(selectedR1Questions),
    round2: createInitialRound2(openApiChallenges),
    final: createInitialFinal(8),
    totalScore: 0,
    startedAt: Date.now(),
    savedAt: Date.now(),
  };
}

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [finalQuestionsLoading, setFinalQuestionsLoading] = useState(false);
  const [rankingQuestionsLoading, setRankingQuestionsLoading] = useState(false);
  const [rankingQuestionsError, setRankingQuestionsError] = useState(false);
  const [round2ChallengesError, setRound2ChallengesError] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('8chances_sound') !== 'false';
  });

  // Auto-save
  useEffect(() => {
    if (gameState) saveGameState(gameState);
  }, [gameState]);

  const startNewGame = useCallback(async () => {
    if (rankingQuestionsLoading) return;
    setRankingQuestionsLoading(true);
    setRankingQuestionsError(false);
    setRound2ChallengesError(false);

    let availableQuestions = rankingQuestions;
    let openApiChallenges: Challenge2[] = [];
    const [rankingResult, challengeResult] = await Promise.allSettled([
      fetchRankingQuestions(),
      fetchOpenRound2Challenges(),
    ]);

    if (rankingResult.status === 'fulfilled') {
      availableQuestions = rankingResult.value;
    } else {
      setRankingQuestionsError(true);
      console.warn('[Manche 1 API] Utilisation du catalogue local.', rankingResult.reason);
    }
    if (challengeResult.status === 'fulfilled') {
      openApiChallenges = challengeResult.value;
    } else {
      setRound2ChallengesError(true);
      console.error('[Manche 2 API] Impossible de préparer les défis Wikidata.', challengeResult.reason);
      setRankingQuestionsLoading(false);
      return;
    }

    try {
      clearGameState();
      setGameState(createNewGameState(availableQuestions, openApiChallenges));
    } finally {
      setRankingQuestionsLoading(false);
    }
  }, [rankingQuestionsLoading]);

  const quitGame = useCallback(() => {
    clearGameState();
    setGameState(null);
  }, []);

  const resumeGame = useCallback((): boolean => {
    const saved = loadGameState();
    if (saved) {
      setGameState(saved);
      return true;
    }
    return false;
  }, []);

  const goToPhase = useCallback((phase: GamePhase) => {
    setGameState(prev => prev ? { ...prev, phase } : prev);
  }, []);

  // ==================== MANCHE 1 ====================

  const submitRound1Answer = useCallback((playerChoiceId: string) => {
    setGameState(prev => {
      if (!prev) return prev;
      const r1 = prev.round1;
      const question = r1.questions[r1.currentQuestionIndex];
      if (!question) return prev;

      const sortedOptions = [...question.options].sort((a, b) => b.value - a.value);
      const optionIds = sortedOptions.map(o => o.id);

      const computerChoiceId = computerPickWeighted(optionIds);

      const playerRank = getRank(playerChoiceId, sortedOptions);
      const computerRank = getRank(computerChoiceId, sortedOptions);

      const playerPts = playerChoiceId ? pointsForRank(playerRank) : 0;
      const computerPts = pointsForRank(computerRank);

      const newTurn = {
        questionId: question.id,
        playerChoice: playerChoiceId,
        computerChoice: computerChoiceId,
        playerPoints: playerPts,
        computerPoints: computerPts,
        revealed: true,
      };

      const newTurns = [...r1.turns, newTurn];
      const newPlayerScore = r1.playerScore + playerPts;
      const newComputerScore = r1.computerScore + computerPts;

      const isLastQuestion = r1.currentQuestionIndex >= r1.questions.length - 1;

      let winner: 'player' | 'computer' | 'none' = 'none';
      const nextPhase: GamePhase = prev.phase;

      if (isLastQuestion) {
        if (newPlayerScore > newComputerScore) winner = 'player';
        else if (newComputerScore > newPlayerScore) winner = 'computer';
        else winner = 'none'; // égalité -> départage
      }

      return {
        ...prev,
        phase: nextPhase,
        round1: {
          ...r1,
          turns: newTurns,
          playerScore: newPlayerScore,
          computerScore: newComputerScore,
          currentQuestionIndex: r1.currentQuestionIndex,
          winner,
          completed: isLastQuestion && winner !== 'none',
        },
      };
    });
  }, []);

  const advanceRound1Question = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      const nextQuestionIndex = prev.round1.currentQuestionIndex + 1;
      if (nextQuestionIndex >= prev.round1.questions.length) return prev;
      return {
        ...prev,
        round1: { ...prev.round1, currentQuestionIndex: nextQuestionIndex },
      };
    });
  }, []);

  const proceedToRound2 = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      // Mettre à jour les stats
      const stats = loadStats();
      stats.gamesPlayed += 1;
      if (prev.round1.winner === 'player') stats.round1Wins += 1;
      else stats.round1Losses += 1;
      saveStats(stats);
      return { ...prev, phase: 'round2' };
    });
  }, []);

  // ==================== MANCHE 2 ====================

  const submitRound2Answers = useCallback(async (correctScreenIds: number[]) => {
    if (!gameState || gameState.phase !== 'round2') return;

    const currentRound = gameState.round2;
    const predictedScreens = currentRound.screens.map(screen => ({
      ...screen,
      active: screen.active && correctScreenIds.includes(screen.id),
    }));
    const predictedRemaining = predictedScreens.filter(screen => screen.active).length;
    const completesRound = currentRound.currentChallengeIndex >= currentRound.challenges.length - 1 || predictedRemaining === 0;
    let apiQuestions: FinalQuestion[] | null = null;

    if (completesRound && predictedRemaining > 0) {
      setFinalQuestionsLoading(true);
      try {
        apiQuestions = await fetchFinalQuizQuestions();
      } catch (error) {
        console.warn('Impossible de charger les questions de QuizzAPI, utilisation des questions locales.', error);
      } finally {
        setFinalQuestionsLoading(false);
      }
    }

    setGameState(prev => {
      if (!prev || prev.phase !== 'round2' || prev.round2.currentChallengeIndex !== currentRound.currentChallengeIndex) return prev;
      const r2 = prev.round2;
      const newScreens = r2.screens.map(screen => {
        const won = correctScreenIds.includes(screen.id);
        return {
          ...screen,
          active: screen.active ? won : false,
          challengeResults: [...screen.challengeResults, won],
        };
      });

      const remaining = newScreens.filter(s => s.active).length;
      const isLastChallenge = r2.currentChallengeIndex >= r2.challenges.length - 1;

      const completed = isLastChallenge || remaining === 0;
      const nextPhase: GamePhase = completed
        ? (remaining === 0 ? 'game-over' : 'round2-result')
        : 'round2';

      // Créer la finale avec les screens restants
      const newFinal = completed && remaining > 0
        ? apiQuestions
          ? createFinalFromQuestions(apiQuestions)
          : createInitialFinal(remaining)
        : prev.final;

      // Stats round 2
      if (completed) {
        const stats = loadStats();
        if (remaining > stats.round2BestScreens) stats.round2BestScreens = remaining;
        saveStats(stats);
      }

      return {
        ...prev,
        phase: nextPhase,
        round2: {
          ...r2,
          screens: newScreens,
          currentChallengeIndex: isLastChallenge ? r2.currentChallengeIndex : r2.currentChallengeIndex + 1,
          screensRemaining: remaining,
          completed,
        },
        final: newFinal,
      };
    });
  }, [gameState]);

  // ==================== FINALE ====================

  const updateAllocation = useCallback((themeIndex: number, chancesAllocated: number) => {
    setGameState(prev => {
      if (!prev) return prev;
      const currentAllocation = prev.final.allocations[themeIndex];
      if (!currentAllocation || (chancesAllocated !== 0 && chancesAllocated !== 1)) return prev;
      const allocatedElsewhere = prev.final.allocations.reduce(
        (sum, allocation, index) => sum + (index === themeIndex ? 0 : allocation.chancesAllocated),
        0
      );
      if (chancesAllocated === 1 && allocatedElsewhere >= prev.round2.screensRemaining) return prev;
      const allocations = prev.final.allocations.map((a, i) =>
        i === themeIndex ? { ...a, chancesAllocated } : a
      );
      return { ...prev, final: { ...prev.final, allocations } };
    });
  }, []);

  const startFinal = useCallback(() => {
    setGameState(prev => prev ? { ...prev, phase: 'final' } : prev);
  }, []);

  const submitFinalAnswer = useCallback((answerIndex: number) => {
    setGameState(prev => {
      if (!prev) return prev;
      const fin = prev.final;
      const question = fin.questions[fin.currentQuestionIndex];
      const allocation = fin.allocations[fin.currentQuestionIndex];
      if (!question || !allocation) return prev;

      const correct = answerIndex === question.correctIndex;
      const chancesUsed = allocation.chancesAllocated;
      const isBonus = chancesUsed > 0;
      const pointsEarned = correct ? (isBonus ? FINAL_POINTS.withChance : FINAL_POINTS.classic) : 0;

      const result = {
        theme: question.theme,
        question,
        playerAnswerIndex: answerIndex,
        correct,
        pointsEarned,
        chancesUsed,
      };

      const newResults = [...fin.results, result];
      const newScore = fin.totalScore + pointsEarned;
      const isLastQuestion = fin.currentQuestionIndex >= fin.questions.length - 1;

      if (isLastQuestion) {
        // Mise à jour stats
        const stats = loadStats();
        stats.finalGamesPlayed += 1;
        stats.totalCorrectFinalAnswers += newResults.filter(r => r.correct).length;
        stats.totalFinalQuestions += newResults.length;
        if (newScore > stats.finalBestScore) stats.finalBestScore = newScore;
        saveStats(stats);
      }

      return {
        ...prev,
        phase: isLastQuestion ? 'final-result' : 'final',
        totalScore: prev.totalScore + pointsEarned,
        final: {
          ...fin,
          results: newResults,
          totalScore: newScore,
          currentQuestionIndex: isLastQuestion ? fin.currentQuestionIndex : fin.currentQuestionIndex + 1,
          completed: isLastQuestion,
        },
      };
    });
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('8chances_sound', next ? 'true' : 'false');
      return next;
    });
  }, []);

  const hasSavedGame = useCallback((): boolean => {
    return loadGameState() !== null;
  }, []);

  return {
    gameState,
    finalQuestionsLoading,
    rankingQuestionsLoading,
    rankingQuestionsError,
    round2ChallengesError,
    soundEnabled,
    startNewGame,
    quitGame,
    resumeGame,
    goToPhase,
    submitRound1Answer,
    advanceRound1Question,
    proceedToRound2,
    submitRound2Answers,
    updateAllocation,
    startFinal,
    submitFinalAnswer,
    toggleSound,
    hasSavedGame,
  };
}
