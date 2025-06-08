
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useBalance } from '../../contexts/BalanceContext';
import { CURRENCY_SYMBOL } from '../../constants';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const { withdraw, profile } = useBalance();

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(`Пожалуйста, введите корректную сумму больше 0 ${CURRENCY_SYMBOL}.`);
      return;
    }
    if (numAmount > profile.balance) {
      setError('Недостаточно средств для этого вывода.');
      return;
    }
    setError('');
    const success = withdraw(numAmount);
    if (success) {
      setAmount('');
      onClose();
    } else {
        setError('Ошибка вывода. Пожалуйста, попробуйте еще раз.'); // Should not happen if checks are correct
    }
  };
  
  const quickWithdrawPercentage = (percentage: number) => {
    setAmount( (profile.balance * (percentage / 100)).toFixed(2) );
  }
  const quickWithdrawAmounts = [0.25, 0.50, 0.75, 1.0];


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Вывести средства">
      <div className="space-y-6">
        <p className="text-sm text-scrazino-gray-600 dark:text-scrazino-gray-300">
            Доступный баланс: <span className="font-semibold text-scrazino-yellow">{profile.balance.toLocaleString()} {CURRENCY_SYMBOL}</span>
        </p>
        <div>
          <label htmlFor="withdraw-amount" className="block text-sm font-medium text-scrazino-gray-700 dark:text-scrazino-gray-300 mb-1">
            Сумма ({CURRENCY_SYMBOL})
          </label>
          <input
            type="number"
            id="withdraw-amount"
            name="withdraw-amount"
            value={amount}
            onChange={(e) => {
                setAmount(e.target.value);
                if(error) setError('');
            }}
            className="w-full px-3 py-2 border border-scrazino-gray-300 dark:border-scrazino-gray-600 rounded-lg shadow-sm focus:ring-scrazino-yellow focus:border-scrazino-yellow dark:bg-scrazino-gray-700 dark:text-white"
            placeholder="например, 100"
          />
        </div>
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {quickWithdrawAmounts.map(qa => (
                <Button key={qa} variant="secondary" size="sm" onClick={() => quickWithdrawPercentage(qa * 100)}>
                    {qa * 100}%
                </Button>
            ))}
        </div>
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Отмена
          </Button>
          <Button onClick={handleWithdraw} className="w-full sm:w-auto">
            Вывести {amount && parseFloat(amount) > 0 ? `${parseFloat(amount).toLocaleString()} ${CURRENCY_SYMBOL}` : ''}
          </Button>
        </div>
         <p className="text-xs text-center text-scrazino-gray-500 dark:text-scrazino-gray-400">
            Это симуляция. Реальные деньги не используются.
        </p>
      </div>
    </Modal>
  );
};

export default WithdrawModal;
