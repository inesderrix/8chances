import { AnimatePresence, motion } from 'framer-motion';
import { useGameEngine } from './hooks/useGameEngine';
import { HomeScreen } from './components/screens/HomeScreen';
import { Round1Screen } from './components/screens/Round1Screen';
import { Round1Result } from './components/screens/Round1Result';
import { Round2Screen } from './components/screens/Round2Screen';
import { FinalAllocation } from './components/screens/FinalAllocation';
import { FinalScreen } from './components/screens/FinalScreen';
import { GameOverScreen, FinalResultScreen } from './components/screens/ResultScreens';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};

export default function App() {
  const engine = useGameEngine();
  const { gameState } = engine;

  function handleResumeGame() {
    engine.resumeGame();
  }

  return (
    <>
      {/* Fond animé */}
      <div className="app-bg" />

      <AnimatePresence mode="wait">
        {/* ACCUEIL */}
        {(!gameState || gameState.phase === 'home') && (
          <motion.div key="home" {...pageTransition} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <HomeScreen
              onNewGame={engine.startNewGame}
              onResumeGame={handleResumeGame}
              onShowRules={() => {}}
              onShowStats={() => {}}
              hasSavedGame={engine.hasSavedGame()}
              soundEnabled={engine.soundEnabled}
              onToggleSound={engine.toggleSound}
              rankingQuestionsLoading={engine.rankingQuestionsLoading}
              rankingQuestionsError={engine.rankingQuestionsError}
              round2ChallengesError={engine.round2ChallengesError}
            />
          </motion.div>
        )}

        {/* MANCHE 1 */}
        {gameState?.phase === 'round1' && (
          <motion.div key="round1" {...pageTransition} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Round1Screen
              state={gameState.round1}
              onAnswer={engine.submitRound1Answer}
              onNextQuestion={engine.advanceRound1Question}
              onContinue={() => engine.goToPhase('round1-result')}
            />
          </motion.div>
        )}

        {/* RÉSULTAT MANCHE 1 */}
        {gameState?.phase === 'round1-result' && (
          <motion.div key="round1-result" {...pageTransition} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Round1Result
              state={gameState.round1}
              onProceedToRound2={engine.proceedToRound2}
              onRetry={engine.startNewGame}
            />
          </motion.div>
        )}

        {/* MANCHE 2 */}
        {gameState?.phase === 'round2' && (
          <motion.div key={`round2-${gameState.round2.currentChallengeIndex}`} {...pageTransition} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Round2Screen
              state={gameState.round2}
              onChallengeComplete={engine.submitRound2Answers}
              isLoadingFinalQuestions={engine.finalQuestionsLoading}
            />
          </motion.div>
        )}

        {/* GAME OVER (plus d'écrans) */}
        {gameState?.phase === 'game-over' && (
          <motion.div key="game-over" {...pageTransition} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <GameOverScreen onRetry={engine.startNewGame} onQuit={engine.quitGame} />
          </motion.div>
        )}

        {/* RÉSULTAT MANCHE 2 / RÉPARTITION CHANCES */}
        {(gameState?.phase === 'round2-result' || gameState?.phase === 'final-allocation') && (
          <motion.div key="final-allocation" {...pageTransition} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <FinalAllocation
              state={gameState.final}
              screensRemaining={gameState.round2.screensRemaining}
              onUpdateAllocation={engine.updateAllocation}
              onStart={engine.startFinal}
            />
          </motion.div>
        )}

        {/* FINALE */}
        {gameState?.phase === 'final' && (
          <motion.div key={`final-${gameState.final.currentQuestionIndex}`} {...pageTransition} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <FinalScreen
              state={gameState.final}
              onAnswer={engine.submitFinalAnswer}
            />
          </motion.div>
        )}

        {/* RÉSULTAT FINAL */}
        {gameState?.phase === 'final-result' && (
          <motion.div key="final-result" {...pageTransition} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <FinalResultScreen
              state={gameState.final}
              screensUsed={gameState.round2.screensRemaining}
              onPlayAgain={engine.startNewGame}
              onQuit={engine.quitGame}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
