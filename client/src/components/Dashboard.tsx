import React, { useState, useEffect } from 'react';
// ...existing code...
import { useToast } from './ui/Toast';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faArrowTrendUp, faArrowTrendDown, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import BottomNav from './BottomNav';
import { TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import TradeModal from './TradeModal';
import GeneralTargetModal from './GeneralTargetModal';
import TargetEclipseChart from './TargetEclipseChart';
import TradeList from './TradeList';

interface TradeEntry {
  id?: string; // _id from MongoDB will be mapped to id
  _id?: string;
  amount: number;
  target: string;
  type: 'profit' | 'loss';
  date: Date | string;
  notes?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mytradingjournal-api.vercel.app/api';
const API_URL = `${API_BASE_URL}/trades`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);  
  const username = localStorage.getItem('username');

  // User-specific target
  const [userTarget, setUserTarget] = useState<number>(0);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const { showToast } = useToast ? useToast() : { showToast: () => {} };

  // Fetch user target on mount
  useEffect(() => {
    const fetchTarget = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/settings/target`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            credentials: 'include',
          }
        );
        if (res.ok) {
          const data = await res.json();
          setUserTarget(typeof data.target === 'number' ? data.target : 0);
        }
      } catch (e) {
        // Optionally show a toast
      }
    };
    fetchTarget();
  }, []);

  // Fetch trades from backend on mount
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch trades');
        }

        const data = await res.json();
        setTrades(data.map((t: any) => ({ ...t, id: t._id, date: new Date(t.date) })));
      } catch (error: any) {
        console.error('Error fetching trades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [navigate]);

  // Add a trade to backend (ensure type is always set and valid)
  const addTrade = async (tradeData: { amount: number; target: string; type: 'profit' | 'loss'; notes?: string }) => {
    try {
      // Defensive: ensure type is always 'profit' or 'loss'
      const type = tradeData.type === 'profit' ? 'profit' : 'loss';
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
        body: JSON.stringify({ ...tradeData, type, date: new Date() }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          navigate('/login');
          return;
        }
        throw new Error('Failed to add trade');
      }

      const saved = await res.json();
      setTrades(prevTrades => [{ ...saved, id: saved._id, date: new Date(saved.date) }, ...prevTrades]);
    } catch (error: any) {
      console.error('Error adding trade:', error);
      // You could add a toast notification here
    }
  };

  // Fix: filterTradesByTimeframe for weekly/monthly
  function filterTradesByTimeframe(trades: TradeEntry[], timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    const now = new Date();
    if (timeframe === 'daily') {
      return trades.filter(trade => {
        const d = trade.date instanceof Date ? trade.date : new Date(trade.date);
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    }
    if (timeframe === 'weekly') {
      // Get ISO week number for now
      const getWeek = (date: Date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        return Math.ceil((((d as any) - (yearStart as any)) / 86400000 + 1)/7);
      };
      const nowWeek = getWeek(now);
      return trades.filter(trade => {
        const d = trade.date instanceof Date ? trade.date : new Date(trade.date);
        return (
          d.getFullYear() === now.getFullYear() && getWeek(d) === nowWeek
        );
      });
    }
    if (timeframe === 'monthly') {
      return trades.filter(trade => {
        const d = trade.date instanceof Date ? trade.date : new Date(trade.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    }
    if (timeframe === 'yearly') {
      return trades.filter(trade => {
        const d = trade.date instanceof Date ? trade.date : new Date(trade.date);
        return d.getFullYear() === now.getFullYear();
      });
    }
    return trades;
  }

  const filteredTrades = filterTradesByTimeframe(trades, timeframe);  const chartData = groupTradesForBarChart(filteredTrades);
  const stats = calculateStats(filteredTrades);
  const netProfit = stats.totalProfit - stats.totalLoss;

// groupNetPLPerPeriod is unused and removed to fix TS6133 error

  // Helper to group trades by day and provide target, profit, and loss for each day
  function groupTradesForBarChart(trades: TradeEntry[]) {
    // Days of the week
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Map: day index (0=Mon, 1=Tue, ..., 6=Sun) -> { profit, loss }
    const map = new Map<number, { profit: number, loss: number }>();
    trades.forEach(trade => {
      const date = trade.date instanceof Date ? trade.date : new Date(trade.date);
      // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat. We want 0=Mon, 6=Sun
      const jsDay = date.getDay();
      const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
      const profit = trade.type === 'profit' ? trade.amount : 0;
      const loss = trade.type === 'loss' ? trade.amount : 0;
      if (!map.has(dayIdx)) {
        map.set(dayIdx, { profit: 0, loss: 0 });
      }
      map.get(dayIdx)!.profit += profit;
      map.get(dayIdx)!.loss += loss;
    });
    // Always show all days Mon-Sun
    return weekDays.map((name, idx) => {
      const d = map.get(idx) || { profit: 0, loss: 0 };
      return { name, ...d };
    });
  }

  // Update calculateStats to accept filtered trades
  function calculateStats(tradesList: TradeEntry[] = filteredTrades) {
    return {
      totalProfit: tradesList.reduce((sum, trade) => sum + (trade.type === 'profit' ? trade.amount : 0), 0),
      totalLoss: tradesList.reduce((sum, trade) => sum + (trade.type === 'loss' ? trade.amount : 0), 0),
      winRate: tradesList.length > 0 ? (tradesList.filter(t => t.type === 'profit').length / tradesList.length) * 100 : 0,
    };
  }

  // Fix TradeList type error by filtering out undefined ids and ensuring date is a Date object
  const safeTrades = trades
    .map(t => ({...t, id: t.id || t._id || '', date: t.date instanceof Date ? t.date : new Date(t.date)}))
    .filter(t => t.id);  const handleLogoutClick = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  // Only render after loading is false
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="text-2xl text-blue-600 font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (    <div className="min-h-screen bg-gradient-to-tr from-indigo-200 to-white flex flex-col justify-between">
      {/* Top bar with name and logout */}
      <div className="flex justify-between items-center p-4 w-full max-w-5xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-800">
          Welcome, {username || 'Trader'}
        </h1>
        <div className="relative">
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="p-2 hover:bg-gray-200 rounded-full text-gray-600 hover:text-red-500 transition-colors"
            title="Open menu"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
          {showLogout && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
              <button
                onClick={handleLogoutClick}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>



        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
          <div>
            <h1 className="text-4xl px-2 my-4 font-medium text-gray-900 tracking-tight-lg">Dashboard</h1>
            <div className="flex px-2 gap-2 mt-2">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors duration-150 ${
                    timeframe === period
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white scale-105'
                      : 'bg-white/70 text-gray-700 hover:bg-blue-100 border border-gray-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 p-2 mb-10">
          <div className="glassy-card p-8 flex flex-col items-center">
            <h2 className="text-md lg:text-lg text-gray-500 mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faCircleCheck} className="text-blue-500" /> Win Rate
            </h2>
            <p className="text-xl font-extrabold text-blue-600">{stats.winRate.toFixed(1)}%</p>
          </div>
        <div className="glassy-card p-8 flex flex-col items-center">
          <h2 className="text-md lg:text-lg text-gray-500 mb-2 flex items-center gap-2">
            🎯 Target
          </h2>
          <p className="text-xl font-extrabold text-indigo-600">${userTarget ? userTarget.toFixed(2) : '--'}</p>
        </div>
          <div className="glassy-card p-8 flex flex-col items-center">
            <h2 className="text-md lg:text-lg text-gray-500 mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faArrowTrendUp} className="text-green-500" /> Total Profit
            </h2>
            <p className="text-xl font-extrabold text-green-600">${stats.totalProfit.toFixed(2)}</p>
          </div>
          <div className="glassy-card p-8 flex flex-col items-center">
            <h2 className="text-md lg:text-lg  text-gray-500 mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faArrowTrendDown} className="text-red-500" /> Total Loss
            </h2>
            <p className="text-xl font-extrabold text-red-500">${stats.totalLoss.toFixed(2)}</p>
          </div>
        </div>


              <div className="w-[95%] mx-auto pb-24">
        {/* Target Eclipse Chart */}
        <div className="relative">
          <TargetEclipseChart 
            totalProfit={netProfit} 
            target={userTarget} 
            onEditTarget={() => setShowTargetModal(true)}
          />
        </div>
        <GeneralTargetModal
          isOpen={showTargetModal}
          onClose={() => setShowTargetModal(false)}
          defaultTarget={userTarget}
          onSave={async (newTarget: number) => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/settings/target`,
                {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                  },
                  credentials: 'include',
                  body: JSON.stringify({ target: Number(newTarget) }),
                }
              );
              if (res.ok) {
                setUserTarget(Number(newTarget));
                showToast && showToast('Target updated!', 'success');
              } else {
                showToast && showToast('Failed to update target', 'error');
              }
            } catch (e) {
              showToast && showToast('Failed to update target', 'error');
            }
          }}
        />

        {/* Performance Bar Chart using shadcn/ui Card and Recharts BarChart */}
      
          <Card className="glassy-card mb-10 bg-none border-none shadow-none">
            <CardHeader>
              <CardTitle>Profit & Loss</CardTitle>
              <CardDescription>{/* You can add a date range or summary here */}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartData} 
                    barGap={2}
                    margin={{ top: 0, right: 0, left: -5, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      tickMargin={5} 
                      axisLine={false}
                      fontSize={12}
                    />
                    <Tooltip 
                      cursor={false}
                      contentStyle={{ fontSize: '12px' }}
                    />
                    <Bar dataKey="profit" fill="#00FFD4" radius={[4, 4, 0, 0]} maxBarSize={45} name="Profit" />
                    <Bar dataKey="loss" fill="#187CFF" radius={[4, 4, 0, 0]} maxBarSize={45} name="Loss" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 leading-none font-medium">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground leading-none">
                Showing performance for the selected period
              </div>
            </CardFooter>
          </Card>

        <div className=" p-2 mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Trades</h2>
          {safeTrades.length === 0 ? (
            <p className="text-gray-400 text-center">No trades recorded yet</p>
          ) : (
            <TradeList trades={safeTrades} />
          )}
        </div>
      </div>
      <BottomNav />
      {/* Logout Modal */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-xs w-full flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4">Log out?</h2>
            <p className="mb-6 text-gray-600 text-center">Are you sure you want to log out?</p>
            <div className="flex gap-4">
              <button
                onClick={handleLogoutClick}
                className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition-transform"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogout(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <TradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(trade) => {
          // Add a dummy target to match backend
          addTrade({ ...trade, target: '' });
        }}
      />
    </div>
  );
};

export default Dashboard;
