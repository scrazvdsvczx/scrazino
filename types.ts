import React from 'react';

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

export interface UserProfile {
  balance: number;
}

export enum TransactionType {
  DEPOSIT = "Deposit",
  WITHDRAWAL = "Withdrawal",
  GAME_WIN = "Game Win",
  GAME_LOSS = "Game Loss", // Can be used if a game explicitly results in loss without prior bet deduction
  GAME_BET = "Game Bet",
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  timestamp: Date;
  description?: string;
}

export enum GameId {
  SLOTS = "slots",
  COIN_FLIP = "coin-flip",
  // WHEEL_OF_FORTUNE = "wheel-of-fortune", // Removed
  COSMIC_CRASH = "cosmic-crash",
  DIGITAL_DICE_DUEL = "digital-dice-duel",
  // QUANTUM_ROULETTE = "quantum-roulette", // Removed
  DATA_MINE_SWEEPER = "data-mine-sweeper",
  CARD_CLASH = "card-clash",
}

export interface GameModeInfo {
  id: GameId;
  name: string; // Will be English
  description: string; // Will be Russian
  path: string;
  icon?: React.ReactNode;
  rules?: string; // Optional detailed rules
}

export interface GameProps {
  onWin: (amount: number, gameName: string) => void; 
  onBet: (amount: number, gameName: string) => boolean; 
  currentBalance: number;
}

export interface MineSweeperCell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number; 
  prize?: number; // Prize is optional; cell might be empty or just show a number
}

export interface PlayingCard {
  suit: '♠' | '♥' | '♦' | '♣';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  value: number; 
}
