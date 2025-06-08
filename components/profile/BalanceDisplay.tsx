
import React from 'react';
import { useBalance } from '../../contexts/BalanceContext';
import { CURRENCY_SYMBOL } from '../../constants';
import { CurrencyDollarIcon } from '../ui/icons/CurrencyDollarIcon';

const BalanceDisplay: React.FC = () => {
  const { profile } = useBalance();

  return (
    <div className="flex items-center space-x-2 bg-scrazino-gray-100 dark:bg-scrazino-gray-700 px-3 py-1.5 rounded-lg shadow">
      <CurrencyDollarIcon className="w-5 h-5 text-scrazino-yellow" />
      <span className="font-semibold text-sm text-scrazino-gray-700 dark:text-scrazino-gray-200">
        {profile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {CURRENCY_SYMBOL}
      </span>
    </div>
  );
};

export default BalanceDisplay;
    