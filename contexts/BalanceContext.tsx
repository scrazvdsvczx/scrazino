
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { UserProfile, Transaction, TransactionType } from '../types';
import { INITIAL_BALANCE, CURRENCY_SYMBOL } from '../constants';

interface BalanceContextType {
  profile: UserProfile;
  transactions: Transaction[];
  deposit: (amount: number) => void;
  withdraw: (amount: number) => boolean; // Returns true if successful
  addTransaction: (type: TransactionType, amount: number, description?: string) => void;
  updateBalance: (newBalance: number) => void; // Direct balance update for game wins/losses
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const storedBalance = localStorage.getItem('scrazino-balance');
    return { balance: storedBalance ? parseFloat(storedBalance) : INITIAL_BALANCE };
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const storedTransactions = localStorage.getItem('scrazino-transactions');
    return storedTransactions ? JSON.parse(storedTransactions).map((t: Transaction) => ({...t, timestamp: new Date(t.timestamp)})) : [];
  });

  useEffect(() => {
    localStorage.setItem('scrazino-balance', profile.balance.toString());
  }, [profile.balance]);

  useEffect(() => {
    localStorage.setItem('scrazino-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = useCallback((type: TransactionType, amount: number, description?: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substring(2,9),
      type,
      amount,
      timestamp: new Date(),
      description: description || `${type} of ${amount}${CURRENCY_SYMBOL}`,
    };
    setTransactions(prev => [newTransaction, ...prev.slice(0,99)]); // Keep last 100 transactions
  }, []);

  const deposit = useCallback((amount: number) => {
    if (amount <= 0) return;
    setProfile(prev => ({ ...prev, balance: prev.balance + amount }));
    addTransaction(TransactionType.DEPOSIT, amount);
  }, [addTransaction]);

  const withdraw = useCallback((amount: number): boolean => {
    if (amount <= 0 || amount > profile.balance) return false;
    setProfile(prev => ({ ...prev, balance: prev.balance - amount }));
    addTransaction(TransactionType.WITHDRAWAL, amount);
    return true;
  }, [profile.balance, addTransaction]);
  
  const updateBalance = useCallback((newBalance: number) => {
    setProfile(prev => ({ ...prev, balance: newBalance }));
  }, []);


  return (
    <BalanceContext.Provider value={{ profile, transactions, deposit, withdraw, addTransaction, updateBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = (): BalanceContextType => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};
    