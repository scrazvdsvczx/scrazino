
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameProps } from '../../types';
import Button from '../ui/Button';
import { CURRENCY_SYMBOL } from '../../constants';
import Spinner from '../ui/Spinner'; 

const MAX_MULTIPLIER_DISPLAY = 100; 
// const CRASH_CHECK_INTERVAL = 100; // ms - not directly used with requestAnimationFrame, but concept remains
// const MULTIPLIER_INCREMENT_BASE = 0.01;

const CosmicCrashGame: React.FC<GameProps> = ({ onWin, onBet, currentBalance }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [error, setError] = useState('');
  const [gameState, setGameState] = useState<'idle' | 'betting' | 'running' | 'crashed' | 'cashed_out'>('idle');
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [cashedOutMultiplier, setCashedOutMultiplier] = useState<number | null>(null);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const animationFrameRef = useRef<number | null>(null);

  const resetGame = () => {
    setCurrentMultiplier(1.00);
    setCashedOutMultiplier(null);
    setCrashPoint(null);
    setMessage(null);
    setError('');
    setGameState('idle');
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const handleBet = () => {
    if (betAmount <= 0) {
      setError('Сумма ставки должна быть положительной.');
      return;
    }
    if (betAmount > currentBalance) {
      setError('Недостаточно средств для этой ставки.');
      return;
    }
    if(!onBet(betAmount, "Cosmic Crash")) { // English Name
        setError("Не удалось сделать ставку. Недостаточно средств или другая проблема.");
        return;
    }
    
    setError('');
    setMessage(null);
    setGameState('betting'); 
    
    const r = Math.random();
    let determinedCrashPoint: number;
    if (r < 0.3) determinedCrashPoint = 1.00 + Math.random() * 0.5; 
    else if (r < 0.7) determinedCrashPoint = 1.5 + Math.random() * 3.5; 
    else if (r < 0.9) determinedCrashPoint = 5 + Math.random() * 10;   
    else determinedCrashPoint = 15 + Math.random() * 35; 
    setCrashPoint(determinedCrashPoint);

    setTimeout(() => {
        setGameState('running');
    }, 500);
  };

  useEffect(() => {
    if (gameState === 'running' && crashPoint) {
      const startTime = Date.now();
      
      const animate = () => {
        const elapsedTime = Date.now() - startTime;
        // Adjusted growthFactor for faster increase as requested
        const growthFactor = Math.pow(1.0007, elapsedTime / 75); 
        let newMultiplier = parseFloat((1.00 * growthFactor).toFixed(2));

        if (newMultiplier >= crashPoint) {
          newMultiplier = crashPoint; 
          setCurrentMultiplier(newMultiplier);
          setGameState('crashed');
          setMessage(`КРАШ @ ${newMultiplier.toFixed(2)}x!`);
        } else {
          setCurrentMultiplier(newMultiplier);
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };
      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, crashPoint]);


  const handleCashOut = () => {
    if (gameState !== 'running') return;

    const winAmount = betAmount * currentMultiplier;
    onWin(winAmount, "Cosmic Crash"); // English Name
    
    setCashedOutMultiplier(currentMultiplier);
    setGameState('cashed_out');
    setMessage(`Забрали @ ${currentMultiplier.toFixed(2)}x! Вы выиграли ${(winAmount - betAmount).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} ${CURRENCY_SYMBOL}!`);
    
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setBetAmount(isNaN(val) || val < 1 ? 1 : val);
    if (error) setError('');
  };

  const quickBetAmounts = [10, 25, 50, 100, 250];

  const renderMultiplierGraph = () => {
    const displayMultiplier = Math.min(currentMultiplier, MAX_MULTIPLIER_DISPLAY);
    const graphHeight = 180; // Adjusted height for smaller screens
    const pointY = graphHeight - ( (displayMultiplier - 1) / (MAX_MULTIPLIER_DISPLAY -1) * graphHeight );
    
    let color = "text-green-500";
    if (gameState === 'crashed') color = "text-red-500";
    else if (gameState === 'cashed_out') color = "text-scrazino-yellow";

    return (
      <div className="w-full h-48 sm:h-56 bg-scrazino-gray-700 dark:bg-scrazino-gray-900 rounded-lg p-2 sm:p-4 relative overflow-hidden shadow-inner">
        <svg width="100%" height="100%" viewBox={`0 0 100 ${graphHeight}`} preserveAspectRatio="none">
          <text x="5" y="15" fontSize="10" fill="#9ca3af">{MAX_MULTIPLIER_DISPLAY}x</text>
          <text x="5" y={graphHeight/2} fontSize="10" fill="#9ca3af">{(MAX_MULTIPLIER_DISPLAY/2).toFixed(0)}x</text>
          <text x="5" y={graphHeight - 5} fontSize="10" fill="#9ca3af">1x</text>
          
          <polyline
            points={`0,${graphHeight} 50,${pointY} `} 
            stroke={gameState === 'running' ? '#4ade80' : (gameState === 'crashed' ? '#ef4444' : '#eab308')}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="50" cy={pointY} r="5" fill={gameState === 'running' ? '#4ade80' : (gameState === 'crashed' ? '#ef4444' : '#eab308')} />
        </svg>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl md:text-5xl font-bold ${color} transition-colors duration-300`}
             style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
          {currentMultiplier.toFixed(2)}x
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6 p-2 sm:p-4">
      {renderMultiplierGraph()}

      {message && (
        <p className={`text-md sm:text-lg font-semibold ${gameState === 'cashed_out' ? 'text-green-400' : (gameState === 'crashed' ? 'text-red-400' : 'text-scrazino-gray-300')}`}>
          {message}
        </p>
      )}
      {(gameState === 'betting' || (gameState === 'running' && !currentMultiplier)) && <Spinner size="md"/>}


      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md space-y-3 sm:space-y-4">
        {gameState === 'idle' || gameState === 'crashed' || gameState === 'cashed_out' ? (
          <>
            <div className="flex items-center space-x-2">
              <label htmlFor="betAmountCrash" className="text-xs sm:text-sm font-medium text-scrazino-gray-300 whitespace-nowrap">Сумма ставки:</label>
              <input
                type="number"
                id="betAmountCrash"
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
            <Button onClick={gameState === 'idle' ? handleBet : resetGame} size="md" className="w-full !text-base sm:!text-lg md:!text-xl">
              {gameState === 'idle' ? 'Сделать ставку и Запустить' : 'Играть снова'}
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleCashOut} 
            disabled={gameState !== 'running'} 
            isLoading={gameState === 'betting'}
            variant="primary" 
            size="md" 
            className="w-full !text-base sm:!text-lg md:!text-xl bg-green-500 hover:bg-green-600"
          >
            Забрать @ {currentMultiplier.toFixed(2)}x
          </Button>
        )}
      </div>
    </div>
  );
};

export default CosmicCrashGame;
