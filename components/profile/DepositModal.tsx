
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useBalance } from '../../contexts/BalanceContext';
import { CURRENCY_SYMBOL } from '../../constants';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const { deposit } = useBalance();

  const handleDeposit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(`Пожалуйста, введите корректную сумму больше 0 ${CURRENCY_SYMBOL}.`);
      return;
    }
    if (numAmount > 10000) { // Arbitrary limit for simulation
        setError(`Максимальная сумма пополнения 10,000 ${CURRENCY_SYMBOL}.`);
        return;
    }
    setError('');
    deposit(numAmount);
    setAmount('');
    onClose();
  };

  const quickAmounts = [100, 250, 500, 1000];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Пополнить баланс">
      <div className="space-y-6">
        <div>
          <label htmlFor="deposit-amount" className="block text-sm font-medium text-scrazino-gray-700 dark:text-scrazino-gray-300 mb-1">
            Сумма ({CURRENCY_SYMBOL})
          </label>
          <input
            type="number"
            id="deposit-amount"
            name="deposit-amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (error) setError('');
            }}
            className="w-full px-3 py-2 border border-scrazino-gray-300 dark:border-scrazino-gray-600 rounded-lg shadow-sm focus:ring-scrazino-yellow focus:border-scrazino-yellow dark:bg-scrazino-gray-700 dark:text-white"
            placeholder="например, 500"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {quickAmounts.map(qa => (
                <Button key={qa} variant="secondary" size="sm" onClick={() => setAmount(qa.toString())}>
                    {qa} {CURRENCY_SYMBOL}
                </Button>
            ))}
        </div>
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Отмена
          </Button>
          <Button onClick={handleDeposit} className="w-full sm:w-auto">
            Пополнить {amount && parseFloat(amount) > 0 ? `${parseFloat(amount).toLocaleString()} ${CURRENCY_SYMBOL}` : ''}
          </Button>
        </div>
        <p className="text-xs text-center text-scrazino-gray-500 dark:text-scrazino-gray-400">
            Это симуляция. Реальные деньги не используются.
        </p>
      </div>
    </Modal>
  );
};

export default DepositModal;
