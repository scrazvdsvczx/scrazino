
import React, { useState, useCallback } from 'react';
import { GameProps } from '../../types';
import Button from '../ui/Button';
import { CURRENCY_SYMBOL } from '../../constants';
import Spinner from '../ui/Spinner';

const Dice: React.FC<{ value: number }> = ({ value }) => {
  const dotPositions: { [key: number]: string[] } = {
    1: ['center'],
    2: ['top-left', 'bottom-right'],
    3: ['top-left', 'center', 'bottom-right'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
  };

  const getDotClass = (pos: string) => {
    let classes = 'w-1.5 h-1.5 sm:w-2 md:w-3 sm:h-2 md:h-3 bg-scrazino-gray-800 dark:bg-white rounded-full absolute';
    if (pos === 'center') classes += ' top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    if (pos === 'top-left') classes += ' top-0.5 sm:top-1 md:top-2 left-0.5 sm:left-1 md:left-2';
    if (pos === 'top-right') classes += ' top-0.5 sm:top-1 md:top-2 right-0.5 sm:right-1 md:right-2';
    if (pos === 'middle-left') classes += ' top-1/2 -translate-y-1/2 left-0.5 sm:left-1 md:left-2';
    if (pos === 'middle-right') classes += ' top-1/2 -translate-y-1/2 right-0.5 sm:right-1 md:right-2';
    if (pos === 'bottom-left') classes += ' bottom-0.5 sm:bottom-1 md:bottom-2 left-0.5 sm:left-1 md:left-2';
    if (pos === 'bottom-right') classes += ' bottom-0.5 sm:bottom-1 md:bottom-2 right-0.5 sm:right-1 md:right-2';
    return classes;
  };

  return (
    <div className="w-10 h-10 sm:w-12 md:w-16 sm:h-12 md:h-16 bg-white dark:bg-scrazino-gray-300 rounded-md sm:rounded-lg shadow-md flex items-center justify-center relative border sm:border-2 border-scrazino-gray-400 dark:border-scrazino-gray-600">
      {dotPositions[value]?.map(pos => <div key={pos} className={getDotClass(pos)}></div>)}
    </div>
  );
};


const DigitalDiceDuelGame: React.FC<GameProps> = ({ onWin, onBet, currentBalance }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [error, setError] = useState('');
  const [playerDice, setPlayerDice] = useState<[number, number] | null>(null);
  const [dealerDice, setDealerDice] = useState<[number, number] | null>(null);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const rollDie = (): number => Math.floor(Math.random() * 6) + 1;

  const handleRoll = useCallback(() => {
    if (rolling) return;
    if (betAmount <= 0) {
      setError('Сумма ставки должна быть положительной.');
      return;
    }
    if (betAmount > currentBalance) {
      setError('Недостаточно средств для этой ставки.');
      return;
    }
    if(!onBet(betAmount, "Digital Dice Duel")){ // English Name
        setError("Не удалось сделать ставку.");
        return;
    }

    setError('');
    setMessage(null);
    setRolling(true);
    setPlayerDice(null); 
    setDealerDice(null);

    let rollCount = 0;
    const rollInterval = setInterval(() => {
        setPlayerDice([rollDie(), rollDie()]);
        setDealerDice([rollDie(), rollDie()]);
        rollCount++;
        if (rollCount >= 10) { 
            clearInterval(rollInterval);
            
            const finalPlayerDice: [number, number] = [rollDie(), rollDie()];
            const finalDealerDice: [number, number] = [rollDie(), rollDie()];
            setPlayerDice(finalPlayerDice);
            setDealerDice(finalDealerDice);

            const playerSum = finalPlayerDice[0] + finalPlayerDice[1];
            const dealerSum = finalDealerDice[0] + finalDealerDice[1];

            if (playerSum > dealerSum) {
              const winAmount = betAmount * 2; 
              onWin(winAmount, "Digital Dice Duel"); // English Name
              setMessage(`Вы победили! ${playerSum} против ${dealerSum}. Вы выиграли ${betAmount.toLocaleString()} ${CURRENCY_SYMBOL}!`);
            } else if (playerSum < dealerSum) {
              setMessage(`Дилер победил. ${playerSum} против ${dealerSum}. Повезет в следующий раз!`);
            } else {
              onWin(betAmount, "Digital Dice Duel"); // English Name (bet returned)
              setMessage(`Ничья! ${playerSum} против ${dealerSum}. Ставка возвращена.`);
            }
            setRolling(false);
        }
    }, 100);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betAmount, currentBalance, onBet, onWin, rolling]);

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setBetAmount(isNaN(val) || val < 1 ? 1 : val);
    if (error) setError('');
  };

  const quickBetAmounts = [10, 25, 50, 100, 250];

  const renderDiceArea = (diceValues: [number, number] | null, title: string) => (
    <div className="text-center">
      <h3 className="text-md sm:text-lg font-semibold text-scrazino-gray-700 dark:text-scrazino-gray-200 mb-1 sm:mb-2">{title}</h3>
      <div className="flex justify-center space-x-1 sm:space-x-2 md:space-x-3">
        {diceValues ? (
          <>
            <Dice value={diceValues[0]} />
            <Dice value={diceValues[1]} />
          </>
        ) : (
          <> 
            <div className="w-10 h-10 sm:w-12 md:w-16 sm:h-12 md:h-16 bg-scrazino-gray-200 dark:bg-scrazino-gray-700 rounded-md sm:rounded-lg shadow-md animate-pulse"></div>
            <div className="w-10 h-10 sm:w-12 md:w-16 sm:h-12 md:h-16 bg-scrazino-gray-200 dark:bg-scrazino-gray-700 rounded-md sm:rounded-lg shadow-md animate-pulse"></div>
          </>
        )}
      </div>
      {diceValues && <p className="mt-1 sm:mt-2 text-lg sm:text-xl font-bold text-scrazino-yellow">Всего: {diceValues[0] + diceValues[1]}</p>}
    </div>
  );


  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-xs sm:max-w-sm md:max-w-lg">
        {renderDiceArea(dealerDice, "Рука дилера")}
        {renderDiceArea(playerDice, "Ваша рука")}
      </div>

      {message && !rolling && (
        <p className={`text-md sm:text-lg font-semibold ${message.includes('Вы победили') ? 'text-green-500 dark:text-green-400' : (message.includes('Дилер победил') ? 'text-red-500 dark:text-red-400' : 'text-scrazino-yellow')}`}>
          {message}
        </p>
      )}
      {rolling && <Spinner size="md"/>}

      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md space-y-3 sm:space-y-4">
        <div className="flex items-center space-x-2">
            <label htmlFor="betAmountDice" className="text-xs sm:text-sm font-medium text-scrazino-gray-700 dark:text-scrazino-gray-300 whitespace-nowrap">Сумма ставки:</label>
            <input
            type="number"
            id="betAmountDice"
            value={betAmount}
            onChange={handleBetChange}
            min="1"
            max={currentBalance}
            disabled={rolling}
            className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base border border-scrazino-gray-300 dark:border-scrazino-gray-600 rounded-lg shadow-sm focus:ring-scrazino-yellow focus:border-scrazino-yellow dark:bg-scrazino-gray-700 dark:text-white"
            />
        </div>
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-5 sm:gap-2">
            {quickBetAmounts.map(qb => (
                <Button key={qb} variant="secondary" size="sm" onClick={() => { setBetAmount(qb); if(error) setError(''); }} disabled={rolling || qb > currentBalance} className="text-xs sm:text-sm">
                    {qb}
                </Button>
            ))}
        </div>
        {error && <p className="text-xs sm:text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}

        <Button
            onClick={handleRoll}
            disabled={rolling || betAmount <=0 || betAmount > currentBalance}
            isLoading={rolling}
            size="md"
            className="w-full !text-base sm:!text-lg md:!text-xl"
        >
            БРОСИТЬ КОСТИ
        </Button>
      </div>
    </div>
  );
};

export default DigitalDiceDuelGame;