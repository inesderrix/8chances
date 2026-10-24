// Types principaux du jeu 8 chances de tout gagner

// ==================== ÉTAT DU JEU ====================

export type GamePhase =
  | 'home'
  | 'round1'
  | 'round1-result'
  | 'round2'
  | 'round2-result'
  | 'final-allocation'
  | 'final'
  | 'game-over'
  | 'final-result';

export interface GameState {
  phase: GamePhase;
  round1: Round1State;
  round2: Round2State;
  final: FinalState;
  totalScore: number;
  startedAt: number;
  savedAt: number;
}

// ==================== MANCHE 1 ====================

export interface RankingOption {
  id: string;
  label: string;
  value: number; // valeur numérique pour le classement
  displayValue?: string; // affichage formaté (ex: "17.098.242 km²")
}

export interface RankingQuestion {
  id: string;
  category: string;
  question: string;
  criterion: string; // "par superficie décroissante"
  options: RankingOption[]; // exactement 8, triées par value décroissante
  sourceYear?: number;
  source?: string;
}

export interface Round1PlayerTurn {
  questionId: string;
  playerChoice: string; // id de l'option choisie
  computerChoice: string;
  playerPoints: number;
  computerPoints: number;
  revealed: boolean;
}

export interface Round1State {
  questions: RankingQuestion[];
  currentQuestionIndex: number;
  turns: Round1PlayerTurn[];
  playerScore: number;
  computerScore: number;
  tiebreaker?: Round1PlayerTurn;
  winner: 'player' | 'computer' | 'none';
  completed: boolean;
}

// ==================== MANCHE 2 ====================

export interface Challenge2Item {
  id: string;
  label: string;
  screenTitle?: string;
  aliases?: string[]; // variantes acceptées
  imageUrl?: string;
  imageCredit?: string;
}

export interface Challenge2 {
  id: string;
  theme: string;
  instruction: string;
  type: 'free-text' | 'image-identify' | 'multiple-choice';
  items: Challenge2Item[]; // au moins 8 réponses possibles
  source?: string;
}

export interface ScreenState {
  id: number; // 0..7
  active: boolean;
  challengeResults: boolean[]; // résultat pour chaque défi
}

export interface Round2State {
  challenges: Challenge2[];
  currentChallengeIndex: number;
  screens: ScreenState[];
  completed: boolean;
  screensRemaining: number;
}

// ==================== FINALE ====================

export type FinalTheme =
  | 'Animaux' | 'Arts' | 'Bandes dessinées' | 'Célébrités' | 'Chimie'
  | 'Cinéma' | 'Dessins animés' | 'Gastronomie' | 'Géographie' | 'Histoire'
  | 'Internet' | 'Jeux vidéos' | 'Langue française' | 'Langues étrangères'
  | 'Littérature' | 'Musique' | 'Mythologie' | 'Philosophie' | 'Physique'
  | 'Politique' | 'Séries TV' | 'Sport' | 'Télévision';

export interface FinalQuestion {
  id: string;
  theme: FinalTheme;
  question: string;
  choices: string[]; // exactement 4
  correctIndex: number; // index de la bonne réponse
  explanation?: string;
}

export interface ThemeAllocation {
  theme: FinalTheme;
  question: FinalQuestion;
  chancesAllocated: number;
}

export interface FinalQuestionResult {
  theme: FinalTheme;
  question: FinalQuestion;
  playerAnswerIndex: number | null;
  correct: boolean;
  pointsEarned: number;
  chancesUsed: number;
}

export interface FinalState {
  selectedThemes: FinalTheme[];
  questions: FinalQuestion[];
  allocations: ThemeAllocation[];
  currentQuestionIndex: number;
  results: FinalQuestionResult[];
  totalScore: number;
  completed: boolean;
}

// ==================== STATISTIQUES ====================

export interface GameStats {
  gamesPlayed: number;
  round1Wins: number;
  round1Losses: number;
  round2BestScreens: number;
  finalBestScore: number;
  finalGamesPlayed: number;
  totalCorrectFinalAnswers: number;
  totalFinalQuestions: number;
  lastPlayed: number;
}

// ==================== POINTS ====================

export const RANKING_POINTS: Record<number, number> = {
  1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1,
};

export const FINAL_POINTS = {
  classic: 100,
  withChance: 1000,
} as const;
