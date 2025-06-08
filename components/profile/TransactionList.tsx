
import React from 'react';
import { useBalance } from '../../contexts/BalanceContext';
import { Transaction, TransactionType } from '../../types';
import { CURRENCY_SYMBOL } from '../../constants';

const TransactionList: React.FC = () => {
  const { transactions } = useBalance();

  if (transactions.length === 0) {
    return <p className="text-scrazino-gray-500 dark:text-scrazino-gray-400 text-center py-4">Транзакций пока нет.</p>;
  }

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.GAME_WIN:
        return 'text-green-500 dark:text-green-400';
      case TransactionType.WITHDRAWAL:
      case TransactionType.GAME_LOSS:
      case TransactionType.GAME_BET:
        return 'text-red-500 dark:text-red-400';
      default:
        return 'text-scrazino-gray-700 dark:text-scrazino-gray-200';
    }
  };
  
  const getTransactionSign = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.GAME_WIN:
        return '+';
      case TransactionType.WITHDRAWAL:
      case TransactionType.GAME_LOSS:
      case TransactionType.GAME_BET:
        return '-';
      default:
        return '';
    }
  }

  return (
    <div className="bg-white dark:bg-scrazino-gray-800 shadow-lg rounded-xl overflow-hidden">
      <h3 className="text-lg font-semibold p-4 border-b border-scrazino-gray-200 dark:border-scrazino-gray-700 text-scrazino-gray-800 dark:text-scrazino-gray-100">
        История транзакций
      </h3>
      <ul className="divide-y divide-scrazino-gray-200 dark:divide-scrazino-gray-700 max-h-96 overflow-y-auto">
        {transactions.map((tx: Transaction) => (
          <li key={tx.id} className="p-4 hover:bg-scrazino-gray-50 dark:hover:bg-scrazino-gray-700 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-scrazino-gray-900 dark:text-scrazino-gray-100">{tx.description || tx.type}</p>
                <p className="text-xs text-scrazino-gray-500 dark:text-scrazino-gray-400">
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
              </div>
              <p className={`text-sm font-semibold ${getTransactionColor(tx.type)}`}>
                {getTransactionSign(tx.type)} {tx.amount.toLocaleString()} {CURRENCY_SYMBOL}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;
