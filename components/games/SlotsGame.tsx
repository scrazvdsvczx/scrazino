
import React, { useState, useEffect, useCallback } from 'react';
import { GameProps, TransactionType } from '../../types';
import Button from '../ui/Button';
import { CURRENCY_SYMBOL, SLOT_SYMBOLS } from '../../constants';
import { ArrowPathIcon } from '../ui/icons/ArrowPathIcon';
import Spinner from '../ui/Spinner';


const REEL_COUNT = 3;
const SPIN_DURATION = 1000; // ms for visual spin
// const SYMBOL_HEIGHT_REM = 4; // Corresponds to h-16, adjust if symbol style changes. Now handled by flex items-center.

const SlotsGame: React.FC<GameProps> = ({ onWin, onBet, currentBalance }) => {
  const [reels, setReels] = useState<string[][]>(() => Array(REEL_COUNT).fill([]).map(() => SLOT_SYMBOLS.slice(0,3)));
  const [spinning, setSpinning] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [error, setError] = useState('');

  const getRandomSymbol = () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];

  const spinReels = useCallback(() => {
    if (spinning) return;
    if (betAmount <= 0) {
        setError('Сумма ставки должна быть положительной.');
        return;
    }
    if (betAmount > currentBalance) {
        setError('Недостаточно средств для этой ставки.');
        return;
    }

    setError('');
    setResultText(null);
    setSpinning(true);
    onBet(betAmount, "Neon Slots"); // English Name
    
    // Visually spin reels
    const spinInterval = setInterval(() => {
      setReels(prevReels => 
        prevReels.map(() => Array(3).fill(null).map(getRandomSymbol))
      );
    }, 100);


    setTimeout(() => {
      clearInterval(spinInterval);
      const finalReels = Array(REEL_COUNT).fill(null).map(() => getRandomSymbol());
      // Set reels to show the final symbol and symbols around it for smooth stop
      setReels(finalReels.map(symbol => {
        const symbolIndex = SLOT_SYMBOLS.indexOf(symbol);
        const prevSymbol = SLOT_SYMBOLS[(symbolIndex - 1 + SLOT_SYMBOLS.length) % SLOT_SYMBOLS.length];
        const nextSymbol = SLOT_SYMBOLS[(symbolIndex + 1) % SLOT_SYMBOLS.length];
        return [prevSymbol, symbol, nextSymbol];
      }));

      // Determine win
      const firstSymbol = finalReels[0];
      const isWin = finalReels.every(s => s === firstSymbol);
      let winAmount = 0;

      if (isWin) {
        if (firstSymbol === '💰') winAmount = betAmount * 10;
        else if (firstSymbol === '👑') winAmount = betAmount * 20;
        else if (firstSymbol === '💎') winAmount = betAmount * 15;
        else winAmount = betAmount * 5;
        
        onWin(winAmount + betAmount, "Neon Slots"); // English Name
        setResultText(`ПОБЕДА! Вы выиграли ${winAmount.toLocaleString()} ${CURRENCY_SYMBOL}!`);
      } else {
        setResultText(`Почти получилось! Попробуйте еще раз.`);
      }
      setSpinning(false);
    }, SPIN_DURATION);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betAmount, currentBalance, onBet, onWin, spinning]);

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setBetAmount(isNaN(val) || val < 1 ? 1 : val);
    if(error) setError('');
  };
  
  const quickBetAmounts = [10, 25, 50, 100, 250];

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6 p-2 sm:p-4 bg-scrazino-gray-50 dark:bg-scrazino-gray-800 rounded-lg shadow-inner">
      {/* Reels Display */}
      <div className="flex space-x-1 sm:space-x-2 md:space-x-4 p-2 sm:p-4 bg-scrazino-gray-900 dark:bg-black rounded-lg shadow-lg overflow-hidden h-36 sm:h-40 md:h-48 items-center justify-center">
        {reels.map((reelSymbols, reelIndex) => (
          <div key={reelIndex} className="w-12 sm:w-16 md:w-20 h-full overflow-hidden relative border-2 border-scrazino-yellow rounded">
            <div 
              className={`flex flex-col items-center justify-center h-full transition-transform duration-100 ease-linear ${spinning ? 'animate-slot-reel-spin' : ''}`}
              style={{ transform: spinning ? `translateY(-${Math.random()*50 + 25}%)` : 'translateY(-33.33%)' }} 
            >
              {(spinning ? [...SLOT_SYMBOLS, ...SLOT_SYMBOLS, ...SLOT_SYMBOLS] : reelSymbols).map((symbol, symbolIndex) => (
                  <span key={symbolIndex} className="text-3xl sm:text-4xl md:text-5xl h-12 sm:h-14 md:h-16 w-full flex items-center justify-center leading-none">
                    {symbol}
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Result Text */}
      {resultText && !spinning && (
        <p className={`text-md sm:text-lg md:text-xl font-semibold ${resultText.includes('ПОБЕДА') ? 'text-green-500 dark:text-green-400' : 'text-scrazino-gray-700 dark:text-scrazino-gray-300'}`}>
          {resultText}
        </p>
      )}
      {spinning && <Spinner size="md" />}


      {/* Controls */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md space-y-3 sm:space-y-4">
         <div className="flex items-center space-x-2">
            <label htmlFor="betAmountSlots" className="text-xs sm:text-sm font-medium text-scrazino-gray-700 dark:text-scrazino-gray-300 whitespace-nowrap">Сумма ставки:</label>
            <input
            type="number"
            id="betAmountSlots"
            value={betAmount}
            onChange={handleBetChange}
            min="1"
            max={currentBalance}
            disabled={spinning}
            className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base border border-scrazino-gray-300 dark:border-scrazino-gray-600 rounded-lg shadow-sm focus:ring-scrazino-yellow focus:border-scrazino-yellow dark:bg-scrazino-gray-700 dark:text-white"
            />
        </div>
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-5 sm:gap-2">
          {quickBetAmounts.map(qb => (
            <Button key={qb} variant="secondary" size="sm" onClick={() => { setBetAmount(qb); if(error) setError(''); }} disabled={spinning || qb > currentBalance} className="text-xs sm:text-sm">
                {qb}
            </Button>
          ))}
        </div>
        {error && <p className="text-xs sm:text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}

        <Button
            onClick={spinReels}
            disabled={spinning || betAmount <= 0 || betAmount > currentBalance}
            isLoading={spinning}
            size="md"
            className="w-full !text-base sm:!text-lg md:!text-xl"
            leftIcon={<ArrowPathIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
        >
            КРУТИТЬ
        </Button>
      </div>
    </div>
  );
};

export default SlotsGame;