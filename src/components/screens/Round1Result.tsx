import { motion } from 'framer-motion';
import type { Round1State } from '../../types/game';

interface Round1ResultProps {
  state: Round1State;
  onProceedToRound2: () => void;
  onRetry: () => void;
}

export function Round1Result({ state, onProceedToRound2, onRetry }: Round1ResultProps) {
  const { playerScore, computerScore, winner } = state;
  const playerWon = winner === 'player';
  const tie = winner === 'none';

  return (
    <div className="screen screen-center">
      <div className="container" style={{ textAlign: 'center', padding: '24px 16px' }}>

        {/* Icône résultat */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ fontSize: '5rem', marginBottom: 16 }}
        >
          {playerWon ? '🏆' : tie ? '🤝' : '💀'}
        </motion.div>

        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="title-display" style={{
            fontSize: 'clamp(1.8rem, 7vw, 3rem)',
            background: playerWon ? 'var(--gradient-gold)' : tie ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #FF1744, #FF6B6B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}>
            {playerWon ? 'VICTOIRE !' : tie ? 'ÉGALITÉ !' : 'ÉLIMINÉ'}
          </h1>
          <p style={{ color: 'var(--color-text-dim)', marginBottom: 24 }}>
            {playerWon
              ? 'Vous passez à la Manche 2 !'
              : tie
              ? 'Un départage est nécessaire'
              : 'L\'ordinateur a été plus fort cette fois'}
          </p>
        </motion.div>

        {/* Scores */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: 24, padding: '24px' }}
        >
          <div className="flex items-center justify-around">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Vous</div>
              <div className="font-mono" style={{
                fontSize: '3rem',
                fontWeight: 900,
                color: playerWon ? 'var(--color-gold)' : 'var(--color-text)',
              }}>
                {playerScore}
              </div>
              <div className="tag tag-primary" style={{ marginTop: 8 }}>
                {playerWon ? '🥇 Vainqueur' : ''}
              </div>
            </div>

            <div style={{ fontSize: '2rem', color: 'var(--color-text-muted)' }}>⚔️</div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Ordinateur</div>
              <div className="font-mono" style={{
                fontSize: '3rem',
                fontWeight: 900,
                color: !playerWon && !tie ? 'var(--color-gold)' : 'var(--color-text)',
              }}>
                {computerScore}
              </div>
              <div className="tag" style={{ marginTop: 8 }}>
                {!playerWon && !tie ? '🤖 Vainqueur' : ''}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Récap questions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ marginBottom: 24 }}
        >
          {state.turns.map((turn, i) => {
            const question = state.questions[i];
            if (!question) return null;
            const sortedOpts = [...question.options].sort((a, b) => b.value - a.value);
            const playerOpt = question.options.find(o => o.id === turn.playerChoice);
            const playerRank = sortedOpts.findIndex(o => o.id === turn.playerChoice) + 1;
            return (
              <div key={i} className="card" style={{ textAlign: 'left', marginBottom: 8, padding: '12px 16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  Question {i + 1} — {question.category}
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: 6 }}>{question.question}</div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '0.8rem' }}>
                    Votre choix : <strong>{playerOpt?.label}</strong> (#{playerRank})
                  </span>
                  <span className="tag tag-primary">{turn.playerPoints} pts</span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {playerWon && (
            <button className="btn btn-gold btn-lg btn-full" onClick={onProceedToRound2}>
              📺 Passer à la Manche 2 →
            </button>
          )}
          {tie && (
            <button className="btn btn-primary btn-lg btn-full" onClick={onProceedToRound2}>
              🎯 Départage (continuer)
            </button>
          )}
          <button className="btn btn-ghost btn-full" onClick={onRetry}>
            🔄 Recommencer
          </button>
        </motion.div>
      </div>
    </div>
  );
}
