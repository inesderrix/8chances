import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FinalState } from '../../types/game';
import { FINAL_POINTS } from '../../types/game';

interface FinalScreenProps {
  state: FinalState;
  onAnswer: (index: number) => void;
}

const THEME_ICONS: Record<string, string> = {
  Animaux: '🐾', Arts: '🎨', 'Bandes dessinées': '📚', Célébrités: '⭐',
  Chimie: '⚗️', Cinéma: '🎬', 'Dessins animés': '🎠', Gastronomie: '🍽️',
  Géographie: '🌍', Histoire: '📜', Internet: '💻', 'Jeux vidéos': '🎮',
  'Langue française': '🇫🇷', 'Langues étrangères': '🌐', Littérature: '📖',
  Musique: '🎵', Mythologie: '⚡', Philosophie: '🧠', Physique: '🔬',
  Politique: '🏛️', 'Séries TV': '📺', Sport: '⚽', Télévision: '📡',
};

export function FinalScreen({ state, onAnswer }: FinalScreenProps) {
  const question = state.questions[state.currentQuestionIndex];
  const allocation = state.allocations[state.currentQuestionIndex];
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  if (!question || !allocation) return null;

  const isBonus = allocation.chancesAllocated > 0;
  const shuffledChoices = question.choices;

  function handleSelect(idx: number) {
    if (selectedIndex !== null) return;
    setSelectedIndex(idx);
    setTimeout(() => setRevealed(true), 500);
  }

  function handleNext() {
    if (selectedIndex === null) return;
    onAnswer(selectedIndex);
    setSelectedIndex(null);
    setRevealed(false);
  }

  const correct = selectedIndex === question.correctIndex;
  const cumulativeScore = state.results.reduce((s, r) => s + r.pointsEarned, 0);

  return (
    <div className="screen">
      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 16 }}>

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <div className="tag tag-gold">🏆 Finale</div>
            <div className="score-badge score-gold">
              {cumulativeScore.toLocaleString('fr-FR')} pts
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{
              width: `${(state.currentQuestionIndex / state.questions.length) * 100}%`,
              background: 'var(--gradient-gold)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
            <span>Question {state.currentQuestionIndex + 1} / {state.questions.length}</span>
            <span>{state.results.filter(r => r.correct).length} bonnes réponses</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`final-q-${state.currentQuestionIndex}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            {/* Thème + Bonus indicator */}
            <div className="card" style={{
              marginBottom: 16,
              padding: '16px 20px',
              border: isBonus ? '2px solid var(--color-gold)' : undefined,
              boxShadow: isBonus ? 'var(--shadow-glow-gold)' : undefined,
            }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '1.5rem' }}>{THEME_ICONS[question.theme] ?? '❓'}</span>
                  <div className={`tag ${isBonus ? 'tag-gold' : 'tag-primary'}`}>
                    {question.theme}
                  </div>
                </div>
                {isBonus && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    style={{
                      padding: '4px 12px',
                      background: 'var(--gradient-gold)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#1a0a00',
                    }}
                  >
                    🎯 {allocation.chancesAllocated}× CHANCE — 1 000 pts !
                  </motion.div>
                )}
              </div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.6 }}>
                {question.question}
              </h2>
            </div>

            {/* Choices */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {shuffledChoices.map((choice, idx) => {
                let className = 'answer-btn';
                if (revealed) {
                  if (idx === question.correctIndex) className += ' correct';
                  else if (idx === selectedIndex) className += ' incorrect';
                } else if (idx === selectedIndex) {
                  className += ' selected';
                }

                return (
                  <motion.button
                    key={idx}
                    className={className}
                    onClick={() => handleSelect(idx)}
                    disabled={selectedIndex !== null}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    whileHover={selectedIndex === null ? { scale: 1.01, x: 4 } : {}}
                    whileTap={selectedIndex === null ? { scale: 0.98 } : {}}
                  >
                    <span style={{
                      minWidth: 32, height: 32,
                      borderRadius: 'var(--radius-sm)',
                      background: revealed && idx === question.correctIndex
                        ? 'var(--color-success)'
                        : revealed && idx === selectedIndex
                        ? 'var(--color-error)'
                        : selectedIndex === idx
                        ? 'var(--color-primary)'
                        : 'var(--color-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 800,
                      color: (revealed && (idx === question.correctIndex || idx === selectedIndex)) || selectedIndex === idx ? 'white' : 'var(--color-text-dim)',
                      border: '1px solid var(--color-border)',
                      transition: 'all 0.3s',
                      flexShrink: 0,
                    }}>
                      {['A', 'B', 'C', 'D'][idx]}
                    </span>
                    <span style={{ flex: 1, textAlign: 'left' }}>{choice}</span>
                    {revealed && idx === question.correctIndex && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{ fontSize: '1.2rem' }}
                      >
                        ✅
                      </motion.span>
                    )}
                    {revealed && idx === selectedIndex && idx !== question.correctIndex && (
                      <span style={{ fontSize: '1.2rem' }}>❌</span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Révélation */}
            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Points gagnés */}
                  <motion.div
                    className="card"
                    style={{
                      padding: '16px 20px',
                      textAlign: 'center',
                      marginBottom: 12,
                      background: correct
                        ? 'rgba(0,230,118,0.1)'
                        : 'rgba(255,23,68,0.1)',
                      border: `1px solid ${correct ? 'var(--color-success)' : 'var(--color-error)'}`,
                    }}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                      {correct ? '🎉 Bonne réponse !' : '😢 Mauvaise réponse'}
                    </div>
                    <div className="font-mono" style={{
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      color: correct ? 'var(--color-gold)' : 'var(--color-text-muted)',
                    }}>
                      {correct ? `+${isBonus ? FINAL_POINTS.withChance : FINAL_POINTS.classic}` : '+0'} pts
                    </div>
                    {correct && isBonus && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', marginTop: 4 }}>
                        🎯 Bonus chance activé !
                      </div>
                    )}
                  </motion.div>

                  {/* Explication */}
                  {question.explanation && (
                    <div className="card" style={{ padding: '12px 16px', marginBottom: 12, fontSize: '0.85rem', color: 'var(--color-text-dim)', lineHeight: 1.6 }}>
                      💡 {question.explanation}
                    </div>
                  )}

                  <motion.button
                    className={`btn btn-full btn-lg ${correct ? 'btn-gold' : 'btn-primary'}`}
                    onClick={handleNext}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {state.currentQuestionIndex >= state.questions.length - 1
                      ? '🏁 Voir les résultats'
                      : 'Question suivante →'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
