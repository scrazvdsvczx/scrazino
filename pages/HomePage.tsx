
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { GAME_MODES, APP_NAME } from '../constants';
import { GameModeInfo } from '../types';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-8 sm:space-y-12">
      <section className="text-center py-6 sm:py-8 md:py-12 bg-gradient-to-r from-scrazino-yellow to-amber-500 dark:from-scrazino-yellow-dark dark:to-scrazino-yellow rounded-xl shadow-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 sm:mb-4">
          Добро пожаловать в {APP_NAME}!
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white opacity-90 max-w-xs sm:max-w-md md:max-w-2xl mx-auto px-2">
          Испытайте острые ощущения от наших эксклюзивных игр. Погрузитесь и испытайте свою удачу!
        </p>
      </section>

      <section>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-scrazino-gray-800 dark:text-scrazino-gray-100 mb-6 sm:mb-8 text-center">
          Выберите игру
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {GAME_MODES.map((game: GameModeInfo) => (
            <Link to={game.path} key={game.id} className="block group">
              <Card className="h-full flex flex-col items-center text-center transform transition-all duration-300 group-hover:scale-105 group-hover:ring-4 group-hover:ring-scrazino-yellow dark:group-hover:ring-scrazino-yellow-dark">
                <div className="mb-3 sm:mb-4 text-scrazino-yellow dark:text-scrazino-yellow-light p-2 sm:p-3 bg-scrazino-gray-100 dark:bg-scrazino-gray-700 rounded-full shadow-inner">
                  {React.isValidElement(game.icon) ? React.cloneElement(game.icon as React.ReactElement<{ className?: string }>, { className: "w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" }) : game.icon}
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-scrazino-gray-800 dark:text-scrazino-gray-100 mb-1 sm:mb-2">{game.name}</h3>
                <p className="text-xs sm:text-sm text-scrazino-gray-600 dark:text-scrazino-gray-300 flex-grow px-1">{game.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;