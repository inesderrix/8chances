import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Round1State, RankingQuestion, Round1PlayerTurn } from '../../types/game';
import { shuffle } from '../../utils/gameUtils';

interface Round1ScreenProps {
  state: Round1State;
  onAnswer: (optionId: string) => void;
  onNextQuestion: () => void;
  onContinue: () => void;
}

function getRankPoints(rank: number): number {
  return Math.max(1, 9 - rank);
}

function QuestionPhase({
  question,
  turnIndex,
  onAnswer,
}: {
  question: RankingQuestion;
  turnIndex: number;
  onAnswer: (id: string) => void;
}) {

  const [selected, setSelected] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [expired, setExpired] = useState(false);

  // Chrono 30s
  useEffect(() => {
    if (selected || expired) return;
    if (timer === 0) {
      setExpired(true);
      setTimeout(() => onAnswer(''), 600); // Réponse vide si temps écoulé
      return;
    }
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, selected, expired, onAnswer]);

  const [shuffledOptions] = useState(() => shuffle(question.options));

  function handleSelect(id: string) {
    if (selected || expired) return;
    setSelected(id);
    setTimeout(() => onAnswer(id), 600);
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header + Chrono */}
      <div style={{ marginBottom: 20 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <div className="tag tag-primary">⚔️ Manche 1</div>
          <div className="tag">Question {turnIndex + 1} / 3</div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((turnIndex) / 3) * 100}%` }} />
        </div>
        <div style={{ marginTop: 8, textAlign: 'right', fontSize: '0.9rem', color: timer <= 5 ? 'var(--color-error)' : 'var(--color-text-dim)', fontWeight: 600 }}>
          ⏰ {timer}s
        </div>
      </div>

      {/* Question */}
      <div className="card" style={{ marginBottom: 16, padding: '20px' }}>
        <div className="tag tag-primary" style={{ marginBottom: 12 }}>🏷️ {question.category}</div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{question.question}</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Classez du {question.criterion}
        </p>
      </div>

      {/* Consigne */}
      <p style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '0.85rem', marginBottom: 16 }}>
        Choisissez l'option qui arrive <strong style={{ color: 'var(--color-gold)' }}>en tête du classement</strong>
      </p>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shuffledOptions.map((opt, i) => (
          <motion.button
            key={opt.id}
            className={`answer-btn ${selected === opt.id ? 'selected' : ''}`}
            onClick={() => handleSelect(opt.id)}
            disabled={selected !== null}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            whileHover={selected === null ? { scale: 1.02 } : {}}
            whileTap={selected === null ? { scale: 0.98 } : {}}
          >
            <span style={{
              minWidth: 28, height: 28,
              background: selected === opt.id ? 'var(--color-primary)' : 'var(--color-surface)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700,
              border: '1px solid var(--color-border)',
              transition: 'all 0.2s',
            }}>
              {String.fromCharCode(65 + shuffledOptions.indexOf(opt))}
            </span>
            <span style={{ flex: 1 }}>{opt.label}</span>
            {selected === opt.id && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ color: 'var(--color-primary-glow)', fontSize: '1.2rem' }}
              >
                ✓
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function RevealPhase({
  question,
  turn,
  playerScore,
  computerScore,
  onNext,
  isLast,
}: {
  question: RankingQuestion;
  turn: Round1PlayerTurn;
  playerScore: number;
  computerScore: number;
  onNext: () => void;
  isLast: boolean;
}) {
  const sortedOptions = [...question.options].sort((a, b) => b.value - a.value);
  const [animateScores, setAnimateScores] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimateScores(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Scores */}
      <div className="card" style={{ marginBottom: 16, padding: '16px' }}>
        <div className="flex items-center justify-between" style={{ gap: 12 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Vous</div>
            <motion.div
              className="font-mono"
              style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-gold)' }}
              animate={animateScores ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              {playerScore}
            </motion.div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>
              +{turn.playerPoints} pts
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>⚔️</div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Ordinateur</div>
            <motion.div
              className="font-mono"
              style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-accent)' }}
              animate={animateScores ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {computerScore}
            </motion.div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>
              +{turn.computerPoints} pts
            </div>
          </div>
        </div>
      </div>

      {/* Classement réel */}
      <div style={{ marginBottom: 8, fontSize: '0.85rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>
        Classement réel
      </div>
      <div className="ranking-list" style={{ marginBottom: 16 }}>
        {sortedOptions.map((opt, idx) => {
          const rank = idx + 1;
          const pts = getRankPoints(rank);
          const isPlayerChoice = opt.id === turn.playerChoice;
          const isComputerChoice = opt.id === turn.computerChoice;
          return (
            <motion.div
              key={opt.id}
              className={`ranking-item rank-${rank} ${isPlayerChoice ? 'player-choice' : ''} ${isComputerChoice ? 'computer-choice' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.35 }}
            >
              <div className="rank-badge">{rank}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{opt.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{opt.displayValue}</div>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gold)' }}>{pts} pts</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {isPlayerChoice && <span title="Votre choix" style={{ fontSize: '1rem' }}>🧑</span>}
                {isComputerChoice && <span title="Choix ordi" style={{ fontSize: '1rem' }}>🤖</span>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {question.sourceYear && (
        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 16 }}>
          Source : {question.source} ({question.sourceYear})
        </div>
      )}

      <motion.button
        className="btn btn-primary btn-full btn-lg"
        onClick={onNext}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {isLast ? '📊 Voir le résultat' : 'Question suivante →'}
      </motion.button>
    </motion.div>
  );
}

export function Round1Screen({ state, onAnswer, onNextQuestion, onContinue }: Round1ScreenProps) {
  const currentQ = state.questions[state.currentQuestionIndex];
  const currentTurn = state.turns[state.currentQuestionIndex];
  const isRevealing = !!currentTurn;
  const isLast = state.currentQuestionIndex >= state.questions.length - 1;

  if (!currentQ) return null;

  return (
    <div className="screen">
      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 16 }}>
        <AnimatePresence mode="wait">
          {!isRevealing ? (
            <QuestionPhase
              key={`q-${state.currentQuestionIndex}`}
              question={currentQ}
              turnIndex={state.currentQuestionIndex}
              onAnswer={onAnswer}
            />
          ) : (
            <RevealPhase
              key={`r-${state.currentQuestionIndex}`}
              question={currentQ}
              turn={currentTurn}
              playerScore={state.playerScore}
              computerScore={state.computerScore}
              onNext={isLast ? onContinue : onNextQuestion}
              isLast={isLast}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
