import type { FinalQuestion } from '../types/game';
import { shuffle } from '../utils/gameUtils';

const QUIZ_API_URL = 'https://quizzapi.fr/api/v2/quiz?limit=8&difficulty=normal';

const CATEGORY_LABELS: Record<string, string> = {
  art_litterature: 'Arts et littérature',
  culture_generale: 'Culture générale',
  gastronomie: 'Gastronomie',
  histoire: 'Histoire',
  musique: 'Musique',
  sciences: 'Sciences',
  sport: 'Sport',
  tv_cinema: 'TV et cinéma',
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : null;
}

function toFinalQuestion(value: unknown, index: number): FinalQuestion | null {
  const quiz = asRecord(value);
  if (!quiz || typeof quiz.question !== 'string' || typeof quiz.answer !== 'string') return null;

  const question = quiz.question.trim();
  const answer = quiz.answer.trim();
  const badAnswers = Array.isArray(quiz.badAnswers)
    ? quiz.badAnswers.filter((choice): choice is string => typeof choice === 'string').map(choice => choice.trim())
    : [];
  const choices = [...new Set([answer, ...badAnswers].filter(Boolean))];
  if (!question || choices.length !== 4) return null;

  const shuffledChoices = shuffle(choices);
  const category = typeof quiz.category === 'string' ? quiz.category : '';
    const theme = CATEGORY_LABELS[category] ?? (
      category
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toLocaleUpperCase('fr-FR') + part.slice(1))
        .join(' ') || 'Culture générale'
    );

  return {
    id: String(quiz.id ?? quiz._id ?? `quizzapi-${index}`),
    theme: theme as FinalQuestion['theme'],
    question,
    choices: shuffledChoices,
    correctIndex: shuffledChoices.indexOf(answer),
  };
}

export async function fetchFinalQuizQuestions(): Promise<FinalQuestion[]> {
  const response = await fetch(QUIZ_API_URL, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`QuizzAPI returned HTTP ${response.status}`);

  const rawPayload = await response.json() as unknown;
  if (import.meta.env.DEV) {
    console.groupCollapsed(`[API 8 Chances] QuizzAPI · HTTP ${response.status}`);
    console.info('Réponse JSON complète', rawPayload);
    console.groupEnd();
  }

  const payload = asRecord(rawPayload);
  const quizzes = payload && Array.isArray(payload.quizzes) ? payload.quizzes : [];
  const questions = quizzes
    .map((quiz, index) => toFinalQuestion(quiz, index))
    .filter((question): question is FinalQuestion => question !== null);

  if (questions.length < 8) {
    throw new Error(`QuizzAPI returned only ${questions.length} valid questions`);
  }

  return questions.slice(0, 8);
}