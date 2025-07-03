import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChartSimple, faPlus, faCalculator, faCog } from '@fortawesome/free-solid-svg-icons';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 glassy-nav bg-white/60 backdrop-blur-lg border-t border-white/40 shadow-lg flex justify-around items-center py-3 z-50">
      <button
        onClick={() => navigate('/home')}
        className="flex flex-col items-center font-semibold focus:outline-none"
        aria-label="Home"
      >
        <FontAwesomeIcon 
          icon={faHome} 
          size="lg" 
          className={isActive('/home') ? 'text-indigo-500' : 'text-gray-600'} 
        />
        <span className={`text-xs ${isActive('/home') ? 'text-indigo-500' : 'text-gray-600'}`}>
          Home
        </span>
      </button>

      <button
        onClick={() => navigate('/dashboard')}
        className="flex flex-col items-center font-semibold focus:outline-none"
        aria-label="Dashboard"
      >
        <FontAwesomeIcon 
          icon={faChartSimple} 
          size="lg" 
          className={isActive('/dashboard') ? 'text-indigo-500' : 'text-gray-600'} 
        />
        <span className={`text-xs ${isActive('/dashboard') ? 'text-indigo-500' : 'text-gray-600'}`}>
          Dashboard
        </span>
      </button>


      <button
        onClick={() => navigate('/calculator')}
        className="flex flex-col items-center font-semibold focus:outline-none"
        aria-label="Calculator"
      >
        <FontAwesomeIcon 
          icon={faCalculator} 
          size="lg" 
          className={isActive('/calculator') ? 'text-indigo-500' : 'text-gray-600'} 
        />
        <span className={`text-xs ${isActive('/calculator') ? 'text-indigo-500' : 'text-gray-600'}`}>
          Calculator
        </span>
      </button>

      <button
        onClick={() => navigate('/settings')}
        className="flex flex-col items-center font-semibold focus:outline-none"
        aria-label="Settings"
      >
        <FontAwesomeIcon 
          icon={faCog} 
          size="lg" 
          className={isActive('/settings') ? 'text-indigo-500' : 'text-gray-600'} 
        />
        <span className={`text-xs ${isActive('/settings') ? 'text-indigo-500' : 'text-gray-600'}`}>
          Settings
        </span>
      </button>
    </nav>
  );
};

export default BottomNav;
