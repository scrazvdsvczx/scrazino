
import React, { useState } from 'react';
import { useBalance } from '../contexts/BalanceContext';
import Button from '../components/ui/Button';
import DepositModal from '../components/profile/DepositModal';
import WithdrawModal from '../components/profile/WithdrawModal';
import TransactionList from '../components/profile/TransactionList';
import { CURRENCY_SYMBOL } from '../constants';
import { UserCircleIcon } from '../components/ui/icons/UserCircleIcon';

const ProfilePage: React.FC = () => {
  const { profile } = useBalance();
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
      <div className="bg-white dark:bg-scrazino-gray-800 shadow-xl rounded-xl p-4 sm:p-6 md:p-8 text-center">
        <UserCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-scrazino-yellow mx-auto mb-3 sm:mb-4" />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-scrazino-gray-800 dark:text-scrazino-gray-100 mb-1 sm:mb-2">Мой профиль</h1>
        <p className="text-md sm:text-lg md:text-xl text-scrazino-gray-600 dark:text-scrazino-gray-300">
          Текущий баланс: <span className="font-bold text-scrazino-yellow">{profile.balance.toLocaleString()} {CURRENCY_SYMBOL}</span>
        </p>
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-4">
          <Button onClick={() => setDepositModalOpen(true)} size="md" className="w-full sm:w-auto text-sm sm:text-base">
            Пополнить баланс
          </Button>
          <Button onClick={() => setWithdrawModalOpen(true)} variant="secondary" size="md" className="w-full sm:w-auto text-sm sm:text-base">
            Вывести средства
          </Button>
        </div>
      </div>

      <TransactionList />

      <DepositModal isOpen={isDepositModalOpen} onClose={() => setDepositModalOpen(false)} />
      <WithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} />
    </div>
  );
};

export default ProfilePage;