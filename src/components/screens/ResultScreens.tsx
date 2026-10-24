import { motion } from 'framer-motion';
import type { FinalState } from '../../types/game';

interface GameOverScreenProps {
  onRetry: () => void;
  onQuit: () => void;
}

interface FinalResultScreenProps {
  state: FinalState;
  screensUsed: number;
  onPlayAgain: () => void;
  onQuit: () => void;
}

const THEME_ICONS: Record<string, string> = {
  Animaux: '🐾', Arts: '🎨', 'Bandes dessinées': '📚', Célébrités: '⭐',
  Chimie: '⚗️', Cinéma: '🎬', 'Dessins animés': '🎠', Gastronomie: '🍽️',
  Géographie: '🌍', Histoire: '📜', Internet: '💻', 'Jeux vidéos': '🎮',
  'Langue française': '🇫🇷', 'Langues étrangères': '🌐', Littérature: '📖',
  Musique: '🎵', Mythologie: '⚡', Philosophie: '🧠', Physique: '🔬',
  Politique: '🏛️', 'Séries TV': '📺', Sport: '⚽', Télévision: '📡',
};

export function GameOverScreen({ onRetry, onQuit }: GameOverScreenProps) {
  return (
    <div className="screen screen-center">
      <div className="container" style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
          style={{ fontSize: '6rem', marginBottom: 16 }}
        >
          💔
        </motion.div>
        <motion.h1
          className="title-display"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: 'clamp(2rem, 8vw, 3.5rem)',
            background: 'linear-gradient(135deg, #FF1744, #FF6B6B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 12,
          }}
        >
          GAME OVER
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: 'var(--color-text-dim)', marginBottom: 32, fontSize: '1.1rem' }}
        >
          Vous avez perdu tous vos écrans.<br />
          La partie est terminée.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 300, margin: '0 auto' }}
        >
          <button className="btn btn-gold btn-lg btn-full" onClick={onRetry}>
            🔄 Rejouer
          </button>
          <button className="btn btn-full" onClick={onQuit}>
            Quitter
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export function FinalResultScreen({ state, screensUsed, onPlayAgain, onQuit }: FinalResultScreenProps) {
  const correct = state.results.filter(r => r.correct).length;
  const bonusCorrect = state.results.filter(r => r.correct && r.chancesUsed > 0).length;
  const score = state.totalScore;

  let medal = '🥉';
  let message = 'Bonne tentative !';
  if (score >= 6000) { medal = '🏆'; message = 'LÉGENDAIRE ! Score parfait !'; }
  else if (score >= 4000) { medal = '🥇'; message = 'Excellent ! Magnifique performance !'; }
  else if (score >= 2000) { medal = '🥈'; message = 'Très bien joué !'; }

  return (
    <div className="screen">
      <div className="container" style={{ paddingTop: 20 }}>

        {/* Célébration */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: 24 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 150 }}
        >
          <div style={{ fontSize: '4rem', marginBottom: 8 }}>{medal}</div>
          <h1 className="title-display" style={{
            fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
            background: 'var(--gradient-gold)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}>
            RÉSULTAT FINAL
          </h1>
          <p style={{ color: 'var(--color-text-dim)' }}>{message}</p>
        </motion.div>

        {/* Score principal */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            textAlign: 'center',
            padding: '24px',
            marginBottom: 16,
            border: '2px solid var(--color-gold)',
            boxShadow: 'var(--shadow-glow-gold)',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Score total</div>
          <motion.div
            className="font-mono"
            style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--color-gold)' }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
          >
            {score.toLocaleString('fr-FR')}
          </motion.div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>points</div>
        </motion.div>

        {/* Stats rapides */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}
        >
          {[
            { label: 'Bonnes réponses', value: `${correct}/8`, icon: '✅' },
            { label: 'Bonus réussis', value: bonusCorrect, icon: '🎯' },
            { label: 'Écrans utilisés', value: screensUsed, icon: '📺' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '12px 8px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{stat.icon}</div>
              <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary-glow)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Récapitulatif des questions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ marginBottom: 24 }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-dim)', marginBottom: 10 }}>
            Récapitulatif
          </div>
          {state.results.map((result, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + idx * 0.06 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 14px',
                background: result.correct ? 'rgba(0,230,118,0.05)' : 'rgba(255,23,68,0.05)',
                border: `1px solid ${result.correct ? 'rgba(0,230,118,0.2)' : 'rgba(255,23,68,0.2)'}`,
                borderRadius: 'var(--radius-md)',
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                {THEME_ICONS[result.theme] ?? '❓'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{result.theme}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {result.question.question}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: result.correct ? 'var(--color-gold)' : 'var(--color-text-muted)' }}>
                  {result.correct ? `+${result.pointsEarned}` : '+0'}
                </div>
                {result.chancesUsed > 0 && <div style={{ fontSize: '0.65rem', color: 'var(--color-gold)' }}>🎯</div>}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          className="btn btn-gold btn-full btn-lg"
          onClick={onPlayAgain}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          style={{ marginBottom: 16 }}
        >
          🔄 Rejouer
        </motion.button>
        <motion.button
          className="btn btn-full"
          onClick={onQuit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Quitter
        </motion.button>
      </div>
    </div>
  );
}
