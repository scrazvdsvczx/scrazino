
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import GamePage from './pages/GamePage';
import { useTheme } from './contexts/ThemeContext';

const App: React.FC = () => {
  const { theme } = useTheme();

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
    