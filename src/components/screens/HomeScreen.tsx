import { motion } from 'framer-motion';
import type { GameStats } from '../../types/game';
import { loadStats } from '../../services/storage';
import { useState } from 'react';

interface HomeScreenProps {
  onNewGame: () => void;
  onResumeGame: () => void;
  onShowRules: () => void;
  onShowStats: () => void;
  hasSavedGame: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  rankingQuestionsLoading: boolean;
  rankingQuestionsError: boolean;
  round2ChallengesError: boolean;
}

const starPositions = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 3,
  duration: Math.random() * 3 + 2,
}));

export function HomeScreen({
  onNewGame,
  onResumeGame,
  onShowRules,
  onShowStats,
  hasSavedGame,
  soundEnabled,
  onToggleSound,
  rankingQuestionsLoading,
  rankingQuestionsError,
  round2ChallengesError,
}: HomeScreenProps) {
  const [showStats, setShowStats] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const stats: GameStats = loadStats();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  if (showRules) {
    return (
      <div className="screen screen-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="container"
        >
          <div className="card" style={{ maxWidth: 560, margin: '0 auto', padding: '28px' }}>
            <h2 style={{ fontFamily: 'Orbitron, sans-serif', color: 'var(--color-gold)', marginBottom: 20 }}>
              🎮 Règles du jeu
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--color-text-dim)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>⚔️ Manche 1 – Le classement</strong>
                <p>Affrontez l'ordinateur sur 3 questions de classement. Chaque question propose 8 choix à classer. Plus votre réponse est proche du sommet, plus vous marquez de points (1re = 8 pts, 8e = 1 pt). Gagnez le duel pour accéder à la Manche 2.</p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>📺 Manche 2 – Les 8 écrans</strong>
                <p>Vous avez 8 écrans (vos chances). Relevez jusqu’à 5 défis successifs. Pour chaque défi, identifiez ou citez 8 réponses. Chaque mauvaise réponse éteint un écran. Conservez au moins 1 écran pour accéder à la Finale.</p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text)' }}>🏆 Finale – Les 8 thèmes</strong>
                <p>8 questions, 8 thèmes différents. Répartissez vos écrans restants sur les thèmes. Une bonne réponse classique = 100 pts. Une bonne réponse avec une chance misée = 1 000 pts !</p>
              </div>
            </div>
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: 24 }}
              onClick={() => setShowRules(false)}
            >
              ← Retour
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showStats) {
    const winRate = stats.gamesPlayed > 0 ? Math.round((stats.round1Wins / stats.gamesPlayed) * 100) : 0;
    const finalAccuracy = stats.totalFinalQuestions > 0
      ? Math.round((stats.totalCorrectFinalAnswers / stats.totalFinalQuestions) * 100)
      : 0;

    return (
      <div className="screen screen-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="container"
        >
          <div className="card" style={{ maxWidth: 480, margin: '0 auto', padding: '28px' }}>
            <h2 style={{ fontFamily: 'Orbitron, sans-serif', color: 'var(--color-gold)', marginBottom: 20 }}>
              📊 Statistiques
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Parties jouées', value: stats.gamesPlayed },
                { label: 'Victoires M1', value: stats.round1Wins },
                { label: 'Taux de victoire', value: `${winRate}%` },
                { label: 'Meilleur score final', value: stats.finalBestScore.toLocaleString('fr-FR') },
                { label: 'Record Écrans', value: stats.round2BestScreens },
                { label: 'Précision finale', value: `${finalAccuracy}%` },
              ].map(stat => (
                <div key={stat.label} style={{
                  padding: '16px',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.8rem', fontFamily: 'Orbitron, sans-serif', fontWeight: 700, color: 'var(--color-primary-glow)' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: 24 }}
              onClick={() => setShowStats(false)}
            >
              ← Retour
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="screen screen-center" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Étoiles de fond */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        {starPositions.map(star => (
          <motion.div
            key={star.id}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: '50%',
              background: 'white',
            }}
            animate={{ opacity: [0.1, 0.8, 0.1] }}
            transition={{ duration: star.duration, delay: star.delay, repeat: Infinity }}
          />
        ))}
      </div>

      <motion.div
        className="container"
        style={{ textAlign: 'center', padding: '24px 16px' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} style={{ marginBottom: 12 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80, height: 80,
            borderRadius: '50%',
            background: 'var(--gradient-gold)',
            fontSize: '2.5rem',
            marginBottom: 8,
            boxShadow: 'var(--shadow-glow-gold)',
          }}>
            🎰
          </div>
        </motion.div>

        {/* Titre */}
        <motion.div variants={itemVariants}>
          <div style={{ fontSize: '0.85rem', letterSpacing: '0.3em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
            Le grand jeu
          </div>
          <h1 className="title-display" style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)', marginBottom: 4 }}>
            <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.5))' }}>
              8 CHANCES
            </span>
          </h1>
          <h1 className="title-display" style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.6rem)', color: 'var(--color-text-dim)' }}>
            DE TOUT GAGNER
          </h1>
        </motion.div>

        {/* Indicateurs de manche */}
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 32 }}>
          {['⚔️ Classement', '📺 8 Écrans', '🏆 Finale'].map((label, i) => (
            <div key={i} style={{
              padding: '6px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              color: 'var(--color-text-dim)',
              fontWeight: 600,
            }}>
              {label}
            </div>
          ))}
        </motion.div>

        {/* Boutons */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360, margin: '0 auto' }}>
          <motion.button
            className="btn btn-gold btn-lg btn-full"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNewGame}
            disabled={rankingQuestionsLoading}
            aria-busy={rankingQuestionsLoading}
          >
            {rankingQuestionsLoading ? '⏳ Préparation des classements...' : '🎮 Nouvelle partie'}
          </motion.button>

          {rankingQuestionsError && (
            <p role="status" style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
              Banque mondiale indisponible : la partie utilise les questions hors ligne.
            </p>
          )}

          {round2ChallengesError && (
            <p role="alert" style={{ margin: 0, color: 'var(--color-error)', fontSize: '0.8rem' }}>
              Wikidata est indisponible : impossible de préparer la manche 2. Réessaie dans un instant.
            </p>
          )}

          {hasSavedGame && (
            <motion.button
              className="btn btn-primary btn-lg btn-full"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onResumeGame}
              disabled={rankingQuestionsLoading}
            >
              ▶️ Reprendre la partie
            </motion.button>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
            <motion.button
              className="btn btn-ghost btn-full"
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowRules(true)}
            >
              📖 Règles
            </motion.button>
            <motion.button
              className="btn btn-ghost btn-full"
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowStats(true)}
            >
              📊 Stats
            </motion.button>
          </div>

          <motion.button
            className="btn btn-ghost btn-full btn-sm"
            whileTap={{ scale: 0.97 }}
            onClick={onToggleSound}
          >
            {soundEnabled ? '🔊 Son activé' : '🔇 Son désactivé'}
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} style={{ marginTop: 40, color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
          Jeu inspiré de l'émission TV — Usage personnel uniquement
        </motion.div>
      </motion.div>
    </div>
  );
}
