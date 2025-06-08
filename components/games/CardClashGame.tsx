
import React, { useState, useCallback, useEffect } from 'react';
import { GameProps, PlayingCard } from '../../types';
import Button from '../ui/Button';
import { CURRENCY_SYMBOL, FULL_DECK, CARD_CLASH_PAYOUT_MULTIPLIER } from '../../constants';
import Spinner from '../ui/Spinner';

const CardDisplay: React.FC<{ card: PlayingCard | null; hidden?: boolean }> = ({ card, hidden }) => {
  const suitColor = card && (card.suit === '♥' || card.suit === '♦') ? 'text-red-500 dark:text-red-400' : 'text-scrazino-gray-800 dark:text-scrazino-gray-200';
  
  if (hidden || !card) {
    return (
      <div className="w-20 h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 bg-scrazino-gray-300 dark:bg-scrazino-gray-700 rounded-md sm:rounded-lg shadow-xl border-2 border-scrazino-gray-400 dark:border-scrazino-gray-600 flex items-center justify-center">
        <span className="text-3xl sm:text-4xl text-scrazino-gray-500 dark:text-scrazino-gray-400">?</span>
      </div>
    );
  }

  return (
    <div className={`w-20 h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 bg-white dark:bg-scrazino-gray-100 rounded-md sm:rounded-lg shadow-xl border-2 border-scrazino-gray-300 dark:border-scrazino-gray-500 p-1 sm:p-2 flex flex-col justify-between items-center ${suitColor}`}>
      <div className="self-start text-lg sm:text-xl md:text-2xl font-bold">{card.rank}</div>
      <div className="text-2xl sm:text-3xl md:text-4xl">{card.suit}</div>
      <div className="self-end text-lg sm:text-xl md:text-2xl font-bold transform rotate-180">{card.rank}</div>
    </div>
  );
};

const CardClashGame: React.FC<GameProps> = ({ onWin, onBet, currentBalance }) => {
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [currentCard, setCurrentCard] = useState<PlayingCard | null>(null);
  const [nextCard, setNextCard] = useState<PlayingCard | null>(null); 
  const [betAmount, setBetAmount] = useState(10); 
  const [currentStreakWinnings, setCurrentStreakWinnings] = useState(0); 
  const [gameState, setGameState] = useState<'idle' | 'bet_placed' | 'revealed' | 'lost'>('idle');
  const [error, setError] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const shuffleDeck = useCallback(() => {
    let shuffled = [...FULL_DECK];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  useEffect(() => {
    if (gameState === 'idle') {
      const newDeck = shuffleDeck();
      setDeck(newDeck);
      setCurrentCard(newDeck[0]); 
      setNextCard(null);
      setCurrentStreakWinnings(0);
    }
  }, [gameState, shuffleDeck]);

  const handleStartRound = () => {
    if (betAmount <= 0) {
      setError('Сумма ставки должна быть положительной.');
      return;
    }
    if (betAmount > currentBalance) {
      setError('Недостаточно средств для этой ставки.');
      return;
    }
    if (!onBet(betAmount, "Card Clash (Hi-Lo)")) { // English Name
        setError("Не удалось сделать ставку.");
        return;
    }

    setError('');
    setMessage(null);
    setGameState('bet_placed');
    setCurrentStreakWinnings(0); 
  };

  const handleGuess = (guess: 'higher' | 'lower') => {
    if (gameState !== 'bet_placed' && gameState !== 'revealed') return; 
    if (deck.length < 2) { 
        setMessage("Колода закончилась. Пожалуйста, начните новую игру.");
        setGameState('idle');
        return;
    }

    setIsProcessing(true);
    setMessage(null);

    const revealedNextCard = deck[1]; 
    setNextCard(revealedNextCard);
    
    const effectiveBetForThisRound = betAmount + currentStreakWinnings;

    setTimeout(() => {
        let correctGuess = false;
        if (revealedNextCard.value > currentCard!.value) correctGuess = guess === 'higher';
        else if (revealedNextCard.value < currentCard!.value) correctGuess = guess === 'lower';

        if (correctGuess) {
            const winningsThisRound = effectiveBetForThisRound * (CARD_CLASH_PAYOUT_MULTIPLIER - 1); 
            const newTotalStreakWinnings = currentStreakWinnings + winningsThisRound;
            
            setCurrentStreakWinnings(newTotalStreakWinnings);
            setMessage(`Правильно! Следующая карта: ${revealedNextCard.rank}${revealedNextCard.suit}. Вы выиграли ${winningsThisRound.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} ${CURRENCY_SYMBOL} в этом раунде.`);
            setGameState('revealed'); 
            
            const newDeck = deck.slice(1);
            setDeck(newDeck);
            setCurrentCard(revealedNextCard);
            setNextCard(null); 

        } else {
            setMessage(`Неправильно. Следующая карта: ${revealedNextCard.rank}${revealedNextCard.suit}. Вы проиграли ${effectiveBetForThisRound.toLocaleString()} ${CURRENCY_SYMBOL}.`);
            setGameState('lost');
        }
        setIsProcessing(false);
    }, 1000); 
  };

  const handleCashOut = () => {
    if (gameState !== 'revealed' || currentStreakWinnings <=0) return;
    const totalReturn = betAmount + currentStreakWinnings; 
    onWin(totalReturn, "Card Clash (Hi-Lo)"); // English Name
    setMessage(`Выигрыш забран! Вы выиграли в сумме ${currentStreakWinnings.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} ${CURRENCY_SYMBOL} (плюс ваша начальная ставка ${betAmount} ${CURRENCY_SYMBOL}).`);
    setGameState('idle'); 
  };

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setBetAmount(isNaN(val) || val < 1 ? 1 : val);
    if (error) setError('');
  };

  const quickBetAmounts = [10, 25, 50, 100, 250];

  return (
    <div className="flex flex-col items-center space-y-3 sm:space-y-4 p-2 sm:p-4">
      <div className="flex space-x-2 sm:space-x-4 mb-2 sm:mb-4">
        <div className="flex flex-col items-center">
            <p className="text-xs sm:text-sm text-scrazino-gray-400 mb-1">Текущая карта</p>
            <CardDisplay card={currentCard} />
        </div>
        <div className="flex flex-col items-center">
             <p className="text-xs sm:text-sm text-scrazino-gray-400 mb-1">Следующая карта</p>
            <CardDisplay card={nextCard} hidden={gameState !== 'revealed' && !nextCard && !isProcessing} />
        </div>
      </div>

      {message && <p className={`text-center text-sm sm:text-base font-semibold ${gameState === 'revealed' ? 'text-green-400' : (gameState === 'lost' ? 'text-red-400' : 'text-scrazino-yellow')}`}>{message}</p>}
      {isProcessing && <Spinner size="md"/>}

      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md space-y-2 sm:space-y-3">
        {gameState === 'idle' || gameState === 'lost' ? (
          <>
            <div className="flex items-center space-x-2">
              <label htmlFor="betAmountCards" className="text-xs sm:text-sm font-medium text-scrazino-gray-300 whitespace-nowrap">Начальная ставка:</label>
              <input
                type="number"
                id="betAmountCards"
                value={betAmount}
                onChange={handleBetChange}
                min="1"
                max={currentBalance}
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base border border-scrazino-gray-600 rounded-lg shadow-sm focus:ring-scrazino-yellow focus:border-scrazino-yellow bg-scrazino-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-1 sm:grid-cols-5 sm:gap-2">
              {quickBetAmounts.map(qb => (
                <Button key={qb} variant="secondary" size="sm" onClick={() => { setBetAmount(qb); if(error) setError(''); }} disabled={qb > currentBalance} className="text-xs sm:text-sm">
                    {qb}
                </Button>
              ))}
            </div>
            {error && <p className="text-xs sm:text-sm text-red-400 text-center">{error}</p>}
            <Button onClick={handleStartRound} size="md" className="w-full !text-base sm:!text-lg" disabled={isProcessing}>
              {gameState === 'idle' ? 'Сделать ставку и Раздать' : 'Играть снова'}
            </Button>
          </>
        ) : (
          <>
            <p className="text-center text-xs sm:text-sm text-scrazino-yellow">
                Потенциальный выигрыш в этом раунде: {((betAmount + currentStreakWinnings) * (CARD_CLASH_PAYOUT_MULTIPLIER -1)).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} {CURRENCY_SYMBOL}<br/>
                Всего при выигрыше сейчас: {(currentStreakWinnings).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} {CURRENCY_SYMBOL} (чистый выигрыш)
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button onClick={() => handleGuess('higher')} size="md" variant="primary" className="!text-sm sm:!text-base" disabled={isProcessing}>Больше</Button>
              <Button onClick={() => handleGuess('lower')} size="md" variant="primary" className="!text-sm sm:!text-base" disabled={isProcessing}>Меньше</Button>
            </div>
            {gameState === 'revealed' && currentStreakWinnings > 0 && (
                 <Button onClick={handleCashOut} size="md" variant="secondary" className="w-full !text-base sm:!text-lg bg-green-600 hover:bg-green-700" disabled={isProcessing}>
                    Забрать {currentStreakWinnings.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} {CURRENCY_SYMBOL}
                </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CardClashGame;