import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Round2State } from '../../types/game';
import { matchesAnswer } from '../../utils/gameUtils';

interface Round2ScreenProps {
  state: Round2State;
  onChallengeComplete: (correctScreenIds: number[]) => void;
  isLoadingFinalQuestions: boolean;
}

export function Round2Screen({ state, onChallengeComplete, isLoadingFinalQuestions }: Round2ScreenProps) {

  const challenge = state.challenges[state.currentChallengeIndex];
  const [answers, setAnswers] = useState<string[]>(Array(8).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [correctScreenIds, setCorrectScreenIds] = useState<number[]>([]);
  const [extraAnswers, setExtraAnswers] = useState<string[]>([]);
  const [timer, setTimer] = useState(60);
  const [expired, setExpired] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const loggedChallengeId = useRef<string | null>(null);

  useEffect(() => {
    setAnswers(Array(8).fill(''));
    setSubmitted(false);
    setResults([]);
    setCorrectScreenIds([]);
    setExtraAnswers([]);
    setTimer(60);
    setExpired(false);
    setEnlargedImage(null);
  }, [state.currentChallengeIndex]);

  useEffect(() => {
    if (!enlargedImage) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setEnlargedImage(null);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enlargedImage]);

  useEffect(() => {
    if (!import.meta.env.DEV || !challenge || loggedChallengeId.current === challenge.id) return;
    loggedChallengeId.current = challenge.id;

    console.groupCollapsed(`[Manche 2] Défi ${state.currentChallengeIndex + 1}/${state.challenges.length} · ${challenge.theme}`);
    console.info('Consigne :', challenge.instruction);
    console.table(challenge.items.map((item, index) => ({
      numero: index + 1,
      reponse: item.label,
      alias: item.aliases?.join(', ') ?? '',
      image: item.imageUrl ?? '',
      creditImage: item.imageCredit ?? '',
    })));
    if (challenge.source) console.info('Source :', challenge.source);
    console.groupEnd();
  }, [challenge, state.currentChallengeIndex, state.challenges.length]);

  // Chrono 60s
  useEffect(() => {
    if (submitted || expired) return;
    if (timer === 0) {
      setExpired(true);
      setTimeout(() => handleSubmit(), 600);
      return;
    }
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, submitted, expired]);


  if (!challenge) return null;

  const activeScreens = state.screens.filter(s => s.active);
  const isOpenChallenge = challenge.items.length > 8;
  const maxExtraAnswers = Math.min(12, Math.max(0, challenge.items.length - 8));

  function handleSubmit() {
    if (!challenge) return;
    const usedItemIndexes = new Set<number>();
    const allAnswers = [...answers, ...extraAnswers];
    const res = allAnswers.map(answer => {
      const matchedItemIndex = challenge.items.findIndex((item, itemIdx) =>
        !usedItemIndexes.has(itemIdx) && matchesAnswer(answer, item.label, item.aliases)
      );
      if (matchedItemIndex === -1) return false;
      usedItemIndexes.add(matchedItemIndex);
      return true;
    });
    setResults(res);
    setSubmitted(true);

    const correctCount = Math.min(res.filter(Boolean).length, activeScreens.length);
    const correctIds = activeScreens.slice(0, correctCount).map(screen => screen.id);
    setCorrectScreenIds(correctIds);
  }

  function handleNext() {
    onChallengeComplete(correctScreenIds);
  }

  const isLastChallenge = state.currentChallengeIndex >= state.challenges.length - 1;

  return (
    <div className="screen">
      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 16 }}>

        {/* Header + Chrono */}
        <div style={{ marginBottom: 16 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <div className="tag tag-primary">📺 Manche 2</div>
            <div className="tag">
              Défi {state.currentChallengeIndex + 1} / {state.challenges.length}
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(state.currentChallengeIndex / state.challenges.length) * 100}%` }} />
          </div>
          <div style={{ marginTop: 8, textAlign: 'right', fontSize: '0.9rem', color: timer <= 10 ? 'var(--color-error)' : 'var(--color-text-dim)', fontWeight: 600 }}>
            ⏰ {timer}s
          </div>
        </div>

        {/* Question en haut, écrans de réponse en dessous */}
        <AnimatePresence mode="wait">
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <div className="card" style={{ marginBottom: 16, padding: '16px 20px' }}>
              <div className="tag tag-primary" style={{ marginBottom: 8 }}>🎯 {challenge.theme}</div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.5 }}>
                {challenge.instruction}
              </h2>
              {challenge.source && (
                <p style={{ margin: '8px 0 0', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  Source : {challenge.source}
                </p>
              )}
            </div>

            <>
              <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Écrans disponibles</span>
                <span className="score-badge">📺 {state.screensRemaining} / 8</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 16 }}>
                {state.screens.map((screen, screenIdx) => {
                  const answerIdx = activeScreens.findIndex(activeScreen => activeScreen.id === screen.id);
                  const active = answerIdx >= 0;
                  const correct = submitted && active && results[answerIdx] === true;
                  const incorrect = submitted && active && results[answerIdx] !== true;
                  const background = !active
                    ? 'rgba(120, 120, 120, 0.2)'
                    : correct
                    ? 'rgba(0, 180, 90, 0.2)'
                    : incorrect
                    ? 'rgba(220, 50, 60, 0.2)'
                    : '#ffffff';
                  const borderColor = !active
                    ? 'rgba(150, 150, 150, 0.35)'
                    : correct
                    ? 'var(--color-success)'
                    : incorrect
                    ? 'var(--color-error)'
                    : 'rgba(20, 20, 20, 0.18)';

                  return (
                    <motion.div
                      key={screen.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: active ? 1 : 0.65, y: 0 }}
                      transition={{ delay: screenIdx * 0.04 }}
                      style={{
                        minWidth: 0,
                        minHeight: 76,
                        padding: '8px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                        background,
                        border: `2px solid ${borderColor}`,
                        borderRadius: 6,
                        transition: 'background 250ms ease, border-color 250ms ease',
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', color: active ? '#555' : '#777', fontWeight: 700 }}>
                        {active ? challenge.items[answerIdx]?.screenTitle ?? `ÉCRAN ${screen.id + 1}` : `ÉCRAN ${screen.id + 1} · ÉTEINT`}
                      </span>
                      {active ? (
                        <>
                        {challenge.type === 'image-identify' && challenge.items[answerIdx]?.imageUrl && (
                          <button
                            type="button"
                            className="round2-image-preview"
                            onClick={() => setEnlargedImage(challenge.items[answerIdx].imageUrl ?? null)}
                            aria-label="Agrandir l’image"
                            title="Cliquer pour agrandir"
                          >
                            <img
                              src={challenge.items[answerIdx].imageUrl}
                              alt="Personne à reconnaître"
                              loading="lazy"
                            />
                          </button>
                        )}
                        <input
                          className="round2-screen-input"
                          type="text"
                          value={answers[answerIdx] ?? ''}
                          onChange={e => {
                            const newAnswers = [...answers];
                            newAnswers[answerIdx] = e.target.value;
                            setAnswers(newAnswers);
                          }}
                          placeholder="Saisir une réponse"
                          disabled={submitted}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              const inputs = document.querySelectorAll<HTMLInputElement>('.round2-screen-input');
                              const currentIndex = Array.from(inputs).indexOf(e.currentTarget);
                              if (inputs[currentIndex + 1]) inputs[currentIndex + 1].focus();
                              else if (!submitted) handleSubmit();
                            }
                          }}
                          style={{
                            width: '100%',
                            minWidth: 0,
                            padding: '5px 0',
                            border: 0,
                            outline: 0,
                            background: 'transparent',
                            color: '#171717',
                            fontSize: '0.88rem',
                            fontWeight: submitted ? 700 : 500,
                          }}
                        />
                        </>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#777' }}>Écran perdu</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {isOpenChallenge && !submitted && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 8, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Réponses supplémentaires (facultatif)
                  </div>
                  {extraAnswers.map((answer, index) => (
                    <input
                      key={`${challenge.id}-extra-${index}`}
                      className="round2-screen-input"
                      type="text"
                      value={answer}
                      onChange={event => setExtraAnswers(current => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))}
                      placeholder={`Autre réponse ${index + 1}`}
                      style={{ width: '100%', marginBottom: 6, padding: '10px 12px', background: '#fff', border: '1px solid rgba(20, 20, 20, 0.18)', borderRadius: 6 }}
                    />
                  ))}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setExtraAnswers(current => [...current, ''])}
                    disabled={extraAnswers.length >= maxExtraAnswers}
                  >
                    + Ajouter une réponse
                  </button>
                </div>
              )}

              {!submitted ? (
                <motion.button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  ✅ Valider mes réponses
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                {/* Résumé */}
                <div className="card" style={{ padding: '12px 16px', marginBottom: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Écrans conservés après ce défi
                  </div>
                  <div className="font-mono" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-gold)' }}>
                    {correctScreenIds.length}
                    <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}> / {activeScreens.length}</span>
                  </div>
                </div>

                <motion.button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleNext}
                  disabled={isLastChallenge && isLoadingFinalQuestions}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {isLastChallenge
                    ? isLoadingFinalQuestions ? 'Chargement des questions…' : '🏁 Vers la Finale →'
                    : 'Défi suivant →'}
                </motion.button>
                </motion.div>
              )}
            </>
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            className="round2-image-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Image agrandie"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEnlargedImage(null)}
          >
            <button
              type="button"
              className="round2-image-modal-close"
              onClick={() => setEnlargedImage(null)}
              aria-label="Fermer l’image agrandie"
              autoFocus
            >
              ×
            </button>
            <img
              src={enlargedImage}
              alt="Personne à reconnaître"
              className="round2-image-modal-content"
              onClick={event => event.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
