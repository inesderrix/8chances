import { useState } from 'react';
import { motion } from 'framer-motion';
import type { FinalState } from '../../types/game';

interface FinalAllocationProps {
  state: FinalState;
  screensRemaining: number;
  onUpdateAllocation: (index: number, value: number) => void;
  onStart: () => void;
}

const THEME_ICONS: Record<string, string> = {
  Animaux: '🐾', Arts: '🎨', 'Bandes dessinées': '📚', Célébrités: '⭐',
  Chimie: '⚗️', Cinéma: '🎬', 'Dessins animés': '🎠', Gastronomie: '🍽️',
  Géographie: '🌍', Histoire: '📜', Internet: '💻', 'Jeux vidéos': '🎮',
  'Langue française': '🇫🇷', 'Langues étrangères': '🌐', Littérature: '📖',
  Musique: '🎵', Mythologie: '⚡', Philosophie: '🧠', Physique: '🔬',
  Politique: '🏛️', 'Séries TV': '📺', Sport: '⚽', Télévision: '📡',
};

export function FinalAllocation({ state, screensRemaining, onUpdateAllocation, onStart }: FinalAllocationProps) {
  const totalAllocated = state.allocations.reduce((sum, a) => sum + a.chancesAllocated, 0);
  const remaining = screensRemaining - totalAllocated;

  function toggleTheme(index: number) {
    const selected = state.allocations[index]!.chancesAllocated > 0;
    if (selected) {
      onUpdateAllocation(index, 0);
    } else if (remaining > 0) {
      onUpdateAllocation(index, 1);
    }
  }

  return (
    <div className="screen">
      <div className="container" style={{ paddingTop: 16 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 24 }}
        >
          <div className="tag tag-gold" style={{ marginBottom: 12 }}>🏆 Finale</div>
          <h1 className="title-display" style={{ fontSize: 'clamp(1.4rem, 5vw, 2rem)', marginBottom: 8 }}>
            <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Répartition des chances
            </span>
          </h1>
          <p style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem', marginBottom: 16 }}>
            Vous avez <strong style={{ color: 'var(--color-gold)' }}>{screensRemaining} chance{screensRemaining > 1 ? 's' : ''}</strong> à répartir sur les 8 thèmes.
            Cliquez sur les thèmes pour placer une chance. Chaque thème ne peut recevoir qu'une chance.
          </p>

          {/* Compteur restant */}
          <div className="card" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 24px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Chances restantes</span>
            <span className={`font-mono`} style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: remaining === 0 ? 'var(--color-success)' : 'var(--color-gold)',
            }}>
              {remaining}
            </span>
          </div>
        </motion.div>

        {/* Liste des thèmes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 24 }}>
          {state.allocations.map((alloc, idx) => {
            const icon = THEME_ICONS[alloc.theme] ?? '❓';
            const hasChance = alloc.chancesAllocated > 0;
            const unavailable = !hasChance && remaining <= 0;

            return (
              <motion.button
                key={alloc.theme}
                type="button"
                onClick={() => toggleTheme(idx)}
                disabled={unavailable}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  minWidth: 0,
                  minHeight: 104,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '12px 8px',
                  color: hasChance ? '#513b00' : '#252525',
                  background: hasChance ? 'rgba(255,215,0,0.28)' : '#ffffff',
                  border: `2px solid ${hasChance ? 'var(--color-gold)' : 'rgba(20,20,20,0.18)'}`,
                  borderRadius: 6,
                  cursor: unavailable ? 'not-allowed' : 'pointer',
                  opacity: unavailable ? 0.45 : 1,
                  textAlign: 'center',
                  transition: 'background 180ms ease, border-color 180ms ease, transform 180ms ease',
                }}
                whileHover={!unavailable ? { y: -2 } : undefined}
                whileTap={!unavailable ? { scale: 0.97 } : undefined}
              >
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', overflowWrap: 'anywhere' }}>{alloc.theme}</span>
                <span style={{ fontSize: '0.7rem', color: hasChance ? '#684d00' : '#666' }}>
                  {hasChance ? '✓ 1 chance · 1 000 pts' : '100 pts si correct'}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Bouton de démarrage */}
        <motion.button
          className="btn btn-gold btn-full btn-lg"
          onClick={onStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: 16 }}
        >
          🚀 Commencer la Finale !
        </motion.button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {remaining > 0
            ? `Il vous reste ${remaining} chance${remaining > 1 ? 's' : ''} à placer — vous pouvez commencer sans tout miser`
            : 'Toutes vos chances sont placées !'}
        </p>
      </div>
    </div>
  );
}
