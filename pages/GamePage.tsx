
import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBalance } from '../contexts/BalanceContext';
import { GameId, GameProps, TransactionType } from '../types';
import { GAME_MODES } from '../constants';

// Import game components
import SlotsGame from '../components/games/SlotsGame';
import CoinFlipGame from '../components/games/CoinFlipGame';
// import WheelOfFortuneGame from '../components/games/WheelOfFortuneGame'; // Removed
import CosmicCrashGame from '../components/games/CosmicCrashGame';
import DigitalDiceDuelGame from '../components/games/DigitalDiceDuelGame';
// import QuantumRouletteGame from '../components/games/QuantumRouletteGame'; // Removed
import DataMineSweeperGame from '../components/games/DataMineSweeperGame';
import CardClashGame from '../components/games/CardClashGame';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const gameComponentMap: Record<GameId, React.FC<GameProps>> = {
  [GameId.SLOTS]: SlotsGame,
  [GameId.COIN_FLIP]: CoinFlipGame,
  // [GameId.WHEEL_OF_FORTUNE]: WheelOfFortuneGame, // Removed
  [GameId.COSMIC_CRASH]: CosmicCrashGame,
  [GameId.DIGITAL_DICE_DUEL]: DigitalDiceDuelGame,
  // [GameId.QUANTUM_ROULETTE]: QuantumRouletteGame, // Removed
  [GameId.DATA_MINE_SWEEPER]: DataMineSweeperGame,
  [GameId.CARD_CLASH]: CardClashGame,
};

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: GameId }>();
  const navigate = useNavigate();
  const { profile, updateBalance, addTransaction } = useBalance();

  const currentGameInfo = GAME_MODES.find(g => g.id === gameId);

  const handleWin = useCallback((amount: number, gameName: string) => {
    const newBalance = profile.balance + amount;
    updateBalance(newBalance);
    addTransaction(TransactionType.GAME_WIN, amount, `Выигрыш в ${gameName}`);
  }, [profile.balance, updateBalance, addTransaction]);

  const handleBet = useCallback((amount: number, gameName: string) => {
    const newBalance = profile.balance - amount;
    if (newBalance < 0) {
        console.error("Bet amount exceeds balance. This should not happen if UI validates.");
        return false; 
    }
    updateBalance(newBalance);
    addTransaction(TransactionType.GAME_BET, amount, `Ставка в ${gameName}`);
    return true; 
  }, [profile.balance, updateBalance, addTransaction]);


  if (!gameId || !gameComponentMap[gameId] || !currentGameInfo) {
    return (
      <Card className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-4">Игра не найдена</h2>
        <p className="text-sm sm:text-basetext-scrazino-gray-600 dark:text-scrazino-gray-300 mb-6">
          Игра, которую вы ищете, не существует или в данный момент недоступна.
        </p>
        <Button onClick={() => navigate('/')}>Вернуться к играм</Button>
      </Card>
    );
  }

  const GameComponent = gameComponentMap[gameId];

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-scrazino-gray-800 dark:text-scrazino-gray-100 mb-1 sm:mb-2">
          {currentGameInfo.name}
        </h1>
        <p className="text-sm sm:text-md md:text-lg text-scrazino-gray-600 dark:text-scrazino-gray-400 max-w-xl md:max-w-2xl mx-auto px-2">
          {currentGameInfo.description}
        </p>
         {currentGameInfo.rules && (
           <details className="mt-3 sm:mt-4 text-xs sm:text-sm text-scrazino-gray-500 dark:text-scrazino-gray-400 bg-scrazino-gray-50 dark:bg-scrazino-gray-800 p-2 sm:p-3 rounded-lg shadow-inner max-w-md sm:max-w-xl mx-auto">
             <summary className="cursor-pointer font-semibold hover:text-scrazino-yellow">Правила игры</summary>
             <p className="mt-2 text-left whitespace-pre-line">{currentGameInfo.rules}</p>
           </details>
         )}
      </header>
      
      <Card className="p-2 sm:p-4 md:p-6 lg:p-8">
        <GameComponent 
            onWin={handleWin} 
            onBet={handleBet} 
            currentBalance={profile.balance} 
        />
      </Card>

      <div className="text-center mt-6 sm:mt-8">
        <Button onClick={() => navigate('/')} variant="secondary">
            Назад в игровое лобби
        </Button>
      </div>
    </div>
  );
};

export default GamePage;