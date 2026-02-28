import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TradeList from './TradeList';
import TradeModal from './TradeModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faPlus, faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons';
import BottomNav from './BottomNav';
import { handleLogout } from '../utils/auth';
import Loader from './Loader';

interface Trade {
  id: string;
  amount: number;
  type: 'profit' | 'loss';
  date: Date;
  notes?: string;
}

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'https://mytradingjournal-api.vercel.app/api') + '/trades';

const Home: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogout] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // const [deleteLoading, setDeleteLoading] = useState(false);
  // const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate(); const username = localStorage.getItem('username');

  useEffect(() => {
    setLoading(true);
    fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setTrades(data.map((t: any) => ({ ...t, id: t._id, date: new Date(t.date) })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addTrade = async (tradeData: { amount: number; type: 'profit' | 'loss'; notes?: string }) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ ...tradeData, date: new Date() }),
    });
    const saved = await res.json();
    setTrades([{ ...saved, id: saved._id, date: new Date(saved.date) }, ...trades]);
  };

  const updateTrade = async (id: string, tradeData: { amount: number; type: 'profit' | 'loss'; notes?: string }) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(tradeData),
    });
    const updated = await res.json();
    setTrades(trades.map(t => t.id === id ? { ...updated, id: updated._id, date: new Date(updated.date) } : t));
  };

  const deleteTrade = async (id: string) => {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    setTrades(trades.filter(t => t.id !== id));
  };

  const handleSave = (trade: { amount: number; type: 'profit' | 'loss'; notes?: string }) => {
    if (editingTrade) {
      updateTrade(editingTrade.id, trade);
      setEditingTrade(null);
    } else {
      addTrade(trade);
    }
    setIsModalOpen(false);
  };

  const calculateTotalPnL = () => {
    return trades.reduce((total, trade) => {
      return total + (trade.type === 'profit' ? trade.amount : -trade.amount);
    }, 0);
  };

  // Calculate P/L trend for the month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const tradesThisMonth = trades.filter(t => t.date >= startOfMonth);
  const pnlThisMonth = tradesThisMonth.reduce((total, trade) => {
    return total + (trade.type === 'profit' ? trade.amount : -trade.amount);
  }, 0);
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  // const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const tradesPrevMonth = trades.filter(t => t.date >= prevMonth && t.date < startOfMonth);
  const pnlPrevMonth = tradesPrevMonth.reduce((total, trade) => {
    return total + (trade.type === 'profit' ? trade.amount : -trade.amount);
  }, 0);
  const trendPercent = pnlPrevMonth !== 0 ? ((pnlThisMonth - pnlPrevMonth) / Math.abs(pnlPrevMonth)) * 100 : 0;
  const trendText = pnlThisMonth >= pnlPrevMonth
    ? `Trending up by ${Math.abs(trendPercent).toFixed(1)}% this month`
    : `Trending down by ${Math.abs(trendPercent).toFixed(1)}% this month`;
  const trendIcon = pnlThisMonth >= pnlPrevMonth ? faArrowTrendUp : faArrowTrendDown;

  const totalPnL = calculateTotalPnL();
  const isProfit = totalPnL >= 0;
  const recentTrades = trades.slice(0, 5);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-200 to-white flex flex-col items-center justify-center">
      <div className="p-4 flex justify-between items-center w-full max-w-lg">
        <h1 className="text-xl font-semibold">
          Welcome, {username || 'Trader'}
        </h1>
        <div className="relative">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-2 hover:bg-gray-200 rounded-full"
            title="Open menu"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
          {showLogout && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md z-20">              <button
              onClick={() => handleLogout(navigate)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Sign out
            </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="backdrop-blur-lg bg-gradient-to-tr from-gray-200 to-white border border-white/20 shadow-lg min-h-svh rounded-3xl p-4 w-full max-w-lg flex flex-col items-center">
          <h1 className="text-2xl font-medium text-gray-900 text-left mb-8 w-full tracking-tight">Trading Performance</h1>
          <div className={`w-full h-[230px] flex justify-center flex-col gap-4 text-left p-4 rounded-2xl border border-white glassy-card relative 
          }`}>
            <div className="relative">
              <button
                onClick={() => {
                  setEditingTrade(null);
                  setIsModalOpen(true);
                }}
                className="absolute -top-18 -right-6 w-14 h-14 flex items-center border-2 border-white justify-center bg-gradient-to-r from-gray-800 to-black text-white rounded-full shadow-lg focus:outline-none hover:scale-105 transition-transform duration-200"
                title="Add Trade"
                aria-label="Add Trade"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <p className="text-base font-medium py-2 text-gray-500 mb-2 flex items-center gap-2">
                Total P/L
                <FontAwesomeIcon icon={trendIcon} className={isProfit ? 'text-green-500' : 'text-red-500'} />
              </p>
              <p className={`text-5xl font-medium tracking-tight ${isProfit ? 'text-green-600' : 'text-red-500'
                }`}>
                {isProfit ? '+' : '-'}${Math.abs(totalPnL).toFixed(2)}
              </p>
              <span className={`absolute left-0 -bottom-10 text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-lg bg-white/40 backdrop-blur-md ${pnlThisMonth >= pnlPrevMonth ? 'text-green-700' : 'text-red-700'}`}
                style={{ pointerEvents: 'none' }}>
                <FontAwesomeIcon icon={trendIcon} className="mr-1" />
                {trendText}
              </span>
            </div>
          </div>
          <div className="w-full my-8 pb-6">
            <h2 className="text-xl font-medium text-gray-900 mb-2">Recent Trades</h2>
            {recentTrades.length === 0 ? (
              <p className="text-gray-400 text-center">No trades yet</p>
            ) : (
              <TradeList
                trades={recentTrades.map(t => ({ ...(t as any), target: (t as any).target || '' }))}
                onEdit={trade => { setEditingTrade({ ...trade, date: new Date(trade.date) }); setIsModalOpen(true); }}
                onDelete={deleteTrade}
              />
            )}
          </div>
        </div>
      </div>
      <BottomNav />
      <TradeModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTrade(null); }}
        onSave={handleSave}
        trade={editingTrade}
      />
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-5 max-w-xs w-[calc(100%-2rem)] sm:w-full flex flex-col items-left">
            <h2 className="text-xl text-left font-bold mb-4 text-red-600">Confirm Logout</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-500 text-left">
              You are about to log out of your account. This will end your current session and you will need to log in again to access your trading journal.<br /><br />
              Are you sure you want to continue?
            </p>
            <div className="flex gap-4 w-full mt-2">
              <button
                onClick={() => handleLogout(navigate)}
                className="bg-gradient-to-r from-gray-900 to-black text-white px-4 py-2 rounded-lg w-full font-semibold shadow hover:scale-105 transition-transform"
              >
                Yes, Log me out
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

/* Add this to index.css or a global CSS file:
.glassy-card {
  background: rgba(255,255,255,0.25);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.18);
}
.glassy-nav {
  background: rgba(255,255,255,0.35) !important;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.17);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255,255,255,0.18);
}
*/
