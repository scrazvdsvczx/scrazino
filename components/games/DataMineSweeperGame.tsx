
import React, { useState, useEffect, useCallback } from 'react';
import { GameProps, MineSweeperCell } from '../../types';
import Button from '../ui/Button';
import { CURRENCY_SYMBOL, MINESWEEPER_GRID_SIZE, MINESWEEPER_NUM_MINES, MINESWEEPER_PRIZE_VALUES } from '../../constants';
import Spinner from '../ui/Spinner';

const DataMineSweeperGame: React.FC<GameProps> = ({ onWin, onBet, currentBalance }) => {
  const [grid, setGrid] = useState<MineSweeperCell[][]>([]);
  const [betAmount, setBetAmount] = useState(10);
  const [error, setError] = useState('');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost' | 'cashed_out'>('idle');
  const [currentRoundWinnings, setCurrentRoundWinnings] = useState(0);
  const [revealedSafeCellsCount, setRevealedSafeCellsCount] = useState(0);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const totalSafeCells = MINESWEEPER_GRID_SIZE * MINESWEEPER_GRID_SIZE - MINESWEEPER_NUM_MINES;

  const calculateAdjacentMines = (r: number, c: number, currentGrid: MineSweeperCell[][]): number => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const nr = r + i;
        const nc = c + j;
        if (nr >= 0 && nr < MINESWEEPER_GRID_SIZE && nc >= 0 && nc < MINESWEEPER_GRID_SIZE && currentGrid[nr][nc].isMine) {
          count++;
        }
      }
    }
    return count;
  };

  const initializeGrid = useCallback(() => {
    setIsLoading(true);
    setMessage(null); // Clear message on new grid init
    let newGrid: MineSweeperCell[][] = Array(MINESWEEPER_GRID_SIZE).fill(null).map(() =>
      Array(MINESWEEPER_GRID_SIZE).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
        prize: MINESWEEPER_PRIZE_VALUES[Math.floor(Math.random() * MINESWEEPER_PRIZE_VALUES.length)] || 0
      }))
    );

    let minesPlacedCount = 0;
    while (minesPlacedCount < MINESWEEPER_NUM_MINES) {
      const r = Math.floor(Math.random() * MINESWEEPER_GRID_SIZE);
      const c = Math.floor(Math.random() * MINESWEEPER_GRID_SIZE);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        newGrid[r][c].prize = 0; 
        minesPlacedCount++;
      }
    }

    for (let r = 0; r < MINESWEEPER_GRID_SIZE; r++) {
      for (let c = 0; c < MINESWEEPER_GRID_SIZE; c++) {
        if (!newGrid[r][c].isMine) {
          newGrid[r][c].adjacentMines = calculateAdjacentMines(r, c, newGrid);
        }
      }
    }
    setGrid(newGrid);
    setRevealedSafeCellsCount(0);
    setFlagsPlaced(0);
    setCurrentRoundWinnings(0);
    setError('');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (gameState === 'idle' && !isLoading) {
      initializeGrid();
    }
  }, [gameState, initializeGrid, isLoading]);


  const handleStartGame = () => {
    if (betAmount <= 0) {
      setError('Сумма ставки должна быть положительной.');
      return;
    }
    if (betAmount > currentBalance) {
      setError('Недостаточно средств для этой ставки.');
      return;
    }
    if (!onBet(betAmount, "Data Mine Sweeper")) {
      setError("Не удалось сделать ставку. Недостаточно средств или другая проблема.");
      return;
    }
    initializeGrid(); // Re-initialize for the actual game
    setGameState('playing');
  };
  
  const floodFill = (r: number, c: number, currentGrid: MineSweeperCell[][]): MineSweeperCell[][] => {
    let gridCopy = currentGrid.map(row => row.map(cell => ({ ...cell })));
    let revealCountDelta = 0; 
    let prizeDelta = 0;

    function recurse(row: number, col: number) {
        if (row < 0 || row >= MINESWEEPER_GRID_SIZE || col < 0 || col >= MINESWEEPER_GRID_SIZE || gridCopy[row][col].isRevealed || gridCopy[row][col].isFlagged || gridCopy[row][col].isMine) {
            return;
        }

        gridCopy[row][col].isRevealed = true;
        revealCountDelta++;
        
        if (gridCopy[row][col].prize && gridCopy[row][col].prize! > 0) {
           prizeDelta += (gridCopy[row][col].prize || 0);
        }

        if (gridCopy[row][col].adjacentMines === 0 && (!gridCopy[row][col].prize || gridCopy[row][col].prize === 0)) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                     if (i === 0 && j === 0) continue;
                     recurse(row + i, col + j);
                }
            }
        }
    }
    recurse(r,c);
    setRevealedSafeCellsCount(prev => prev + revealCountDelta);
    setCurrentRoundWinnings(prev => prev + prizeDelta);
    return gridCopy;
  };


  const handleCellClick = (r: number, c: number) => {
    if (gameState !== 'playing' || grid[r][c].isRevealed || grid[r][c].isFlagged || isLoading) return;

    const cell = grid[r][c];
    let newGrid = grid.map(row => [...row]); 

    if (cell.isMine) {
      newGrid[r][c] = { ...cell, isRevealed: true };
      const finalGrid = newGrid.map(rg => rg.map(cl => cl.isMine ? {...cl, isRevealed: true} : cl));
      setGrid(finalGrid);
      setGameState('lost');
      setMessage(`БУМ! Вы попали на мину. Игра окончена.`);
      return;
    }
    
    let newlyRevealedCount = 0;
    let newlyFoundPrize = 0;

    if (cell.adjacentMines === 0 && (!cell.prize || cell.prize === 0) ) { 
        newGrid = floodFill(r, c, grid); 
    } else { 
        newGrid[r][c] = { ...cell, isRevealed: true };
        setRevealedSafeCellsCount(prev => prev + 1);
        newlyRevealedCount = 1;
        if(cell.prize && cell.prize > 0) {
            setCurrentRoundWinnings(prev => prev + (cell.prize || 0));
            newlyFoundPrize = cell.prize || 0;
        }
    }
    
    setGrid(newGrid);

    if (newlyFoundPrize > 0) {
       // Message will be handled by useEffect watching currentRoundWinnings
    } else {
        setMessage(null); 
    }
  };
    
  useEffect(() => {
    if (gameState === 'playing') {
        if (revealedSafeCellsCount >= totalSafeCells) {
            setGameState('won');
            onWin(currentRoundWinnings + betAmount, "Data Mine Sweeper");
            setMessage(`Все чисто! Вы выиграли ${currentRoundWinnings.toLocaleString()} ${CURRENCY_SYMBOL}!`);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedSafeCellsCount, totalSafeCells, gameState, currentRoundWinnings, betAmount, onWin]);
  
  useEffect(() => {
    if (gameState === 'playing' && currentRoundWinnings > 0) {
        const lastMessageWasWinOrLoss = message?.includes("Все чисто!") || message?.includes("БУМ!");
        if (!lastMessageWasWinOrLoss) {
            setMessage(`Найден приз! Собрано: ${currentRoundWinnings}${CURRENCY_SYMBOL}`);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoundWinnings, gameState]);


  const handleCellRightClick = (event: React.MouseEvent<HTMLButtonElement>, r: number, c: number) => {
    event.preventDefault();
    if (gameState !== 'playing' || grid[r][c].isRevealed || isLoading) return;

    let newGrid = grid.map(row => [...row]);
    const cell = newGrid[r][c];
    
    if (cell.isFlagged) {
      newGrid[r][c] = { ...cell, isFlagged: false };
      setFlagsPlaced(prev => prev - 1);
    } else {
      if (flagsPlaced < MINESWEEPER_NUM_MINES) {
        newGrid[r][c] = { ...cell, isFlagged: true };
        setFlagsPlaced(prev => prev + 1);
      } else {
        setError("Максимальное количество флажков установлено.");
      }
    }
    setGrid(newGrid);
  };
  
  const handleCashOut = () => {
    if (gameState !== 'playing' || currentRoundWinnings <= 0) return;
    onWin(currentRoundWinnings + betAmount, "Data Mine Sweeper");
    setGameState('cashed_out');
    setMessage(`Забрали ${currentRoundWinnings.toLocaleString()} ${CURRENCY_SYMBOL}!`);
  };

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setBetAmount(isNaN(val) || val < 1 ? 1 : val);
    if (error) setError('');
  };

  const quickBetAmounts = [10, 25, 50, 100, 250];
  
  const getCellContent = (cell: MineSweeperCell) => {
    if (cell.isFlagged) return '🚩';
    if (!cell.isRevealed) return '';
    if (cell.isMine) return '💣';
    if (cell.prize && cell.prize > 0) return `${cell.prize}`; // Removed CURRENCY_SYMBOL for smaller cell
    if (cell.adjacentMines > 0) return cell.adjacentMines.toString();
    return '';
  };

  const getCellClasses = (cell: MineSweeperCell) => {
    let classes = "aspect-square w-full h-full flex items-center justify-center text-xs sm:text-sm font-bold rounded-sm sm:rounded transition-all duration-100 ease-in-out border ";
    
    if (cell.isFlagged) {
      classes += "bg-yellow-400 dark:bg-yellow-600 border-yellow-500 dark:border-yellow-700 text-sm sm:text-base";
    } else if (cell.isRevealed) {
      if (cell.isMine) {
        classes += "bg-red-500 dark:bg-red-700 border-red-600 dark:border-red-800 animate-pulse text-white text-sm sm:text-base";
      } else if (cell.prize && cell.prize > 0) {
        classes += "bg-green-400 dark:bg-green-600 border-green-500 dark:border-green-700 text-black dark:text-white";
        if(cell.prize >= 10) classes += " text-[0.6rem] sm:text-xs"; // Smaller text for two-digit prizes
      } else if (cell.adjacentMines > 0) {
        classes += "bg-scrazino-gray-200 dark:bg-scrazino-gray-600 border-scrazino-gray-300 dark:border-scrazino-gray-500 ";
        const colors = ['text-blue-500', 'text-green-700 dark:text-green-400', 'text-red-500', 'text-purple-700 dark:text-purple-400', 'text-orange-500', 'text-teal-500', 'text-black dark:text-gray-200', 'text-gray-500 dark:text-gray-400'];
        classes += colors[cell.adjacentMines -1] || 'text-scrazino-gray-800 dark:text-scrazino-gray-100';
      } else { 
        classes += "bg-scrazino-gray-300 dark:bg-scrazino-gray-500 border-scrazino-gray-400 dark:border-scrazino-gray-600";
      }
    } else { 
      classes += "bg-scrazino-gray-400 dark:bg-scrazino-gray-700 hover:bg-scrazino-gray-500 dark:hover:bg-scrazino-gray-600 border-scrazino-gray-500 dark:border-scrazino-gray-600";
    }
    return classes;
  };


  return (
    <div className="flex flex-col items-center space-y-2 sm:space-y-4 p-1 sm:p-2 md:p-4">
      {isLoading && (gameState === 'idle' || !grid.length) && (
          <div className="flex flex-col items-center space-y-2 h-64 justify-center">
            <Spinner />
            <p className="text-xs sm:text-sm text-scrazino-gray-400">Подготовка поля...</p>
          </div>
      )}
      
      {grid.length > 0 && (
        <>
        <div className="flex justify-between w-full max-w-xs sm:max-w-sm md:max-w-md mb-1 sm:mb-2 text-xs sm:text-sm text-scrazino-gray-700 dark:text-scrazino-gray-200">
            <span>Мины: {MINESWEEPER_NUM_MINES - flagsPlaced}</span>
            <span>Собрано: {currentRoundWinnings.toLocaleString()}{CURRENCY_SYMBOL}</span>
        </div>
        <div className="w-full overflow-x-auto pb-2"> {/* Wrapper for horizontal scroll */}
            <div
            className={`grid gap-px sm:gap-0.5 bg-scrazino-gray-600 p-px sm:p-1 rounded-md shadow-lg min-w-[280px] sm:min-w-[320px] md:min-w-[400px]`} // min-w to prevent too much squishing before scroll
            style={{ gridTemplateColumns: `repeat(${MINESWEEPER_GRID_SIZE}, minmax(24px, 1fr))` }} // min cell size
            onContextMenu={(e) => e.preventDefault()}
            >
            {grid.map((row, rIndex) =>
                row.map((cell, cIndex) => (
                <button
                    key={`${rIndex}-${cIndex}`}
                    onClick={() => handleCellClick(rIndex, cIndex)}
                    onContextMenu={(e) => handleCellRightClick(e, rIndex, cIndex)}
                    disabled={gameState !== 'playing' || cell.isRevealed || isLoading}
                    className={getCellClasses(cell)}
                    aria-label={`Ячейка ${rIndex}, ${cIndex}${cell.isFlagged ? '. Помечена флажком' : cell.isRevealed ? (cell.isMine ? '. Мина!' : (cell.prize ? `. Приз: ${cell.prize}` : (cell.adjacentMines > 0 ? `. Соседних мин: ${cell.adjacentMines}`: '. Пусто'))) : '. Скрыто'}`}
                >
                    {getCellContent(cell)}
                </button>
                ))
            )}
            </div>
        </div>
        </>
      )}

      {message && <p className={`text-center text-sm sm:text-base font-semibold mt-1 sm:mt-2 ${gameState === 'won' || gameState === 'cashed_out' ? 'text-green-400' : (gameState === 'lost' ? 'text-red-400' : 'text-scrazino-yellow')}`}>{message}</p>}
      
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md space-y-2 sm:space-y-3 mt-2 sm:mt-4">
        {gameState === 'idle' || gameState === 'lost' || gameState === 'won' || gameState === 'cashed_out' ? (
          <>
            <div className="flex items-center space-x-2">
              <label htmlFor="betAmountMines" className="text-xs sm:text-sm font-medium text-scrazino-gray-700 dark:text-scrazino-gray-300 whitespace-nowrap">Сумма ставки:</label>
              <input
                type="number"
                id="betAmountMines"
                value={betAmount}
                onChange={handleBetChange}
                min="1"
                max={currentBalance}
                disabled={isLoading && gameState !== 'idle'}
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base border border-scrazino-gray-300 dark:border-scrazino-gray-600 rounded-lg shadow-sm focus:ring-scrazino-yellow focus:border-scrazino-yellow dark:bg-scrazino-gray-700 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-1 sm:grid-cols-5 sm:gap-2">
              {quickBetAmounts.map(qb => (
                <Button key={qb} variant="secondary" size="sm" onClick={() => { setBetAmount(qb); if (error) setError(''); }} disabled={(isLoading && gameState !== 'idle') || qb > currentBalance} className="text-xs sm:text-sm">
                  {qb}
                </Button>
              ))}
            </div>
            {error && <p className="text-xs sm:text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}
            <Button onClick={handleStartGame} size="md" className="w-full !text-base sm:!text-lg" disabled={isLoading && gameState !== 'idle'}>
              {gameState === 'idle' ? 'Сделать ставку и Начать' : 'Играть снова со ставкой'}
            </Button>
          </>
        ) : ( 
          <>
            <Button onClick={handleCashOut} variant="primary" size="md" className="w-full !text-base sm:!text-lg bg-green-600 hover:bg-green-700" disabled={currentRoundWinnings === 0 || isLoading}>
              Забрать {currentRoundWinnings.toLocaleString()}{CURRENCY_SYMBOL}
            </Button>
            <p className="text-xs text-center text-scrazino-gray-500 dark:text-scrazino-gray-400">
                Открыто безопасных ячеек: {revealedSafeCellsCount} / {totalSafeCells}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default DataMineSweeperGame;