import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ui/Toast';

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Icons
import {
  CreditCard,
  Activity,
  TrendingUp,
  TrendingDown,
  LogOut,
  Plus,
  LayoutDashboard,
  BookOpen,
  LineChart as LineChartIcon,
  Target,
  Filter,
  Edit,
  Coins,
  Trophy,
  Flame,
  Link,
  Calendar as CalendarIcon,
  List as ListIcon,
  Settings
} from "lucide-react";

// Components
import TradingViewChart from './TradingViewChart';
import { ConnectAccountDialog } from './ConnectAccountDialog';
import { MilestoneDialog } from './MilestoneDialog';
import { AwardsDialog } from './AwardsDialog';
import { TradeTable } from './TradeTable';
import { TradeCalendar } from './TradeCalendar';
import { NewTradeDialog } from './NewTradeDialog';
import PipsCalculator from './PipsCalculator';
import SessionTracker from './SessionTracker';
import ForexNews from './ForexNews';
import ActivityHeatmap from './ActivityHeatmap';
import { ModeToggle } from './ModeToggle';
import ForexHeatmap from './ForexHeatmap';
import { GoalsSettingsDialog } from './GoalsSettingsDialog';
import { EquityDialog } from './EquityDialog';
import Loader from './Loader';
import { InteractiveEquityChart } from './InteractiveEquityChart';

// Utils
import { startOfWeek, startOfMonth, startOfYear, isSameDay, isSameWeek, isSameMonth, isSameYear, subDays, isAfter } from 'date-fns';

// Recharts
import { Line, Bar, BarChart, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ComposedChart, Cell, PieChart, Pie, AreaChart, Area } from 'recharts';

interface TradeEntry {
  id: string; // mapped from _id
  _id?: string;
  amount: number;
  type: 'profit' | 'loss';
  date: Date | string;
  market?: string;
  pair?: string;
  strategy?: string;
  notes?: string;
}

interface Goals {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mytradingjournal-api.vercel.app/api';
const API_URL = `${API_BASE_URL}/trades`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isEquityOpen, setIsEquityOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isMT5Connected, setIsMT5Connected] = useState(() => !!localStorage.getItem('mt5_connected'));
  const [isMilestoneOpen, setIsMilestoneOpen] = useState(false);
  const [isAwardsOpen, setIsAwardsOpen] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<any>(null);

  // View State for Journal (Table vs Calendar)
  const [journalView, setJournalView] = useState<'table' | 'calendar'>('table');

  // Milestones State
  const [unlockedMilestones, setUnlockedMilestones] = useState<string[]>(() => {
    const saved = localStorage.getItem('unlockedMilestones');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter state
  const [timeFilter, setTimeFilter] = useState('all');

  const [initialBalance, setInitialBalance] = useState<number>(() => {
    const saved = localStorage.getItem('initialBalance');
    return saved ? parseFloat(saved) : 10000;
  });

  // MT5 Dedicated State
  const [mt5Trades, setMt5Trades] = useState<TradeEntry[]>([]);
  const [mt5Balance, setMt5Balance] = useState<number>(0);
  const [dataSource, setDataSource] = useState<'journal' | 'mt5'>('journal');

  const username = localStorage.getItem('username');
  const { showToast } = useToast ? useToast() : { showToast: (msg: string) => console.log(msg) };

  // Goals State (Persisted in localStorage in a real app, mock for now)
  const [goals, setGoals] = useState<Goals>(() => {
    const saved = localStorage.getItem('tradingGoals');
    return saved ? JSON.parse(saved) : { daily: 100, weekly: 500, monthly: 2000, yearly: 25000 };
  });

  const saveGoals = async (newGoals: Goals) => {
    // Add artificial delay for UX button progress feeling
    await new Promise(resolve => setTimeout(resolve, 800));
    setGoals(newGoals);
    localStorage.setItem('tradingGoals', JSON.stringify(newGoals));
    showToast("Goals updated successfully!", "success");
    setIsGoalsOpen(false);
  }

  // Fetch Trades
  const fetchTrades = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch trades');
      }
      const data = await res.json();
      setTrades(data.map((t: any) => ({ ...t, id: t._id, date: new Date(t.date) })));
    } catch (error) {
      console.error(error);
      const err = error instanceof Error ? error.message : "Network error";
      if (err.includes("fetch")) {
        showToast("Unable to connect to server. Running in offline mode.", "error");
      } else {
        showToast("Failed to load trades", "error");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleAddTrade = async (tradeData: any) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(tradeData),
      });
      if (res.ok) {
        await fetchTrades(true);
        showToast('Trade added successfully!', 'success');
      } else {
        showToast('Failed to add trade', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error adding trade', 'error');
    }
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        setTrades(trades.filter(t => t.id !== id));
        showToast('Trade deleted', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- Derived Metrics ---
  const today = new Date();

  // Helper to normalize Trade date
  const getTradeDate = (t: TradeEntry) => t.date instanceof Date ? t.date : new Date(t.date);

  // DECIDE DATA SOURCE
  const currentTrades = dataSource === 'journal' ? trades : mt5Trades;
  const currentInitialBalance = dataSource === 'journal' ? initialBalance : mt5Balance;

  // Filter Trades Logic
  const filteredTrades = currentTrades.filter(t => {
    const tDate = getTradeDate(t);
    switch (timeFilter) {
      case 'daily': return isSameDay(tDate, today);
      case 'weekly': return isSameWeek(tDate, today);
      case 'monthly': return isSameMonth(tDate, today);
      case 'yearly': return isSameYear(tDate, today);
      default: return true;
    }
  });

  const totalProfit = currentTrades.filter(t => t.type === 'profit').reduce((acc, t) => acc + t.amount, 0);
  const totalLoss = currentTrades.filter(t => t.type === 'loss').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalProfit - totalLoss;
  const currentEquity = currentInitialBalance + netProfit;

  const totalTrades = currentTrades.length;
  const winRate = totalTrades > 0
    ? (currentTrades.filter(t => t.type === 'profit').length / totalTrades) * 100
    : 0;

  // Drawdown Calculations (Global)
  let maxEquity = initialBalance;
  let maxDrawdown = 0;
  let runningEquity = initialBalance;

  // Filtered Equity Curve (for Chart)
  let filteredRunningEquity = initialBalance;
  // Note: For a true filtered view, we might want to start from the balance at the beginning of the period.
  // But for simplicity and visual clarity of PnL trend, we'll start from base or accumulate.
  // Better approach: Calculate equity just for the visible trades relative to 0 or initial, 
  // effectively showing the PnL curve for that period.

  const equityCurve = filteredTrades
    .sort((a, b) => getTradeDate(a).getTime() - getTradeDate(b).getTime())
    .map(t => {
      const change = t.type === 'profit' ? t.amount : -t.amount;
      filteredRunningEquity += change;
      return { date: t.date, equity: filteredRunningEquity, net: change };
    });

  // Calculate Global Max Drawdown (using all trades to be accurate to account history)
  // Re-calculating properly for the metrics card
  let accountRunningEquity = initialBalance;
  let accountMaxEquity = initialBalance;
  let accountMaxDrawdown = 0;

  trades.sort((a, b) => getTradeDate(a).getTime() - getTradeDate(b).getTime()).forEach(t => {
    const change = t.type === 'profit' ? t.amount : -t.amount;
    accountRunningEquity += change;
    if (accountRunningEquity > accountMaxEquity) accountMaxEquity = accountRunningEquity;
    const dd = accountMaxEquity - accountRunningEquity;
    if (dd > accountMaxDrawdown) accountMaxDrawdown = dd;
  });


  // Calculate Period PnL
  let dailyPnLValue = 0;
  let weeklyPnLValue = 0;
  let monthlyPnLValue = 0;
  let yearlyPnLValue = 0;

  trades.forEach(t => {
    const tDate = getTradeDate(t);
    const net = t.type === 'profit' ? t.amount : -t.amount;

    if (isSameDay(tDate, today)) dailyPnLValue += net;
    if (isSameWeek(tDate, today)) weeklyPnLValue += net;
    if (isSameMonth(tDate, today)) monthlyPnLValue += net;
    if (isSameYear(tDate, today)) yearlyPnLValue += net;
  });

  // Daily Drawdown (simplified)
  const dailyPnLMap = trades.reduce((acc, t) => {
    const dateKey = getTradeDate(t).toLocaleDateString();
    acc[dateKey] = (acc[dateKey] || 0) + (t.type === 'profit' ? t.amount : -t.amount);
    return acc;
  }, {} as Record<string, number>);
  const dailyDrawdown = Math.abs(Math.min(...Object.values(dailyPnLMap), 0));

  // --- Streak Calculations ---
  const calculateStreak = (interval: 'daily' | 'weekly' | 'monthly') => {
    if (trades.length === 0) return 0;

    const sortedTrades = [...trades].sort((a, b) => getTradeDate(b).getTime() - getTradeDate(a).getTime());
    let currentStreak = 0;
    let lastPeriod: string | null = null;

    // Group trades by period
    const periodPnL: Record<string, number> = {};

    trades.forEach(t => {
      const date = getTradeDate(t);
      let key = '';
      if (interval === 'daily') key = date.toDateString();
      else if (interval === 'weekly') key = startOfWeek(date).toDateString();
      else if (interval === 'monthly') key = startOfMonth(date).toDateString();

      const net = t.type === 'profit' ? t.amount : -t.amount;
      periodPnL[key] = (periodPnL[key] || 0) + net;
    });

    // Sort periods descending
    const sortedPeriods = Object.keys(periodPnL).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Check consecutive positive periods starting from the most recent one
    // Note: If today/current week/month is negative, streak might be 0 or we check previous.
    // Let's count consecutive NON-NEGATIVE periods? Or strictly positive. Strictly positive is better for "Winning Streak".

    for (const period of sortedPeriods) {
      if (periodPnL[period] > 0) {
        currentStreak++;
      } else {
        break; // Streak broken
      }
    }

    return currentStreak;
  };

  const dailyStreak = calculateStreak('daily');
  const weeklyStreak = calculateStreak('weekly');
  const monthlyStreak = calculateStreak('monthly');
  // --- Milestone Check System ---
  useEffect(() => {
    if (loading || trades.length === 0) return;

    const checkMilestones = () => {
      const newUnlocked = [...unlockedMilestones];
      let milestoneFound = null;

      // 1. First Trade
      if (!newUnlocked.includes('first_trade') && trades.length >= 1) {
        milestoneFound = {
          id: 'first_trade',
          title: "First Steps Taken!",
          description: "You've logged your first trade. This is the beginning of greatness.",
          icon: 'star',
          reward: "🌱 Novice Badge"
        };
      }
      // 2. 3-Day Streak
      else if (!newUnlocked.includes('streak_3') && dailyStreak >= 3) {
        milestoneFound = {
          id: 'streak_3',
          title: "On Fire!",
          description: "You've maintained a 3-day winning streak. Consistency is key!",
          icon: 'zap',
          reward: "🔥 Streak Warrior"
        };
      }
      // 3. 10 Trades
      else if (!newUnlocked.includes('trades_10') && trades.length >= 10) {
        milestoneFound = {
          id: 'trades_10',
          title: "Getting Serious",
          description: "You've logged 10 trades. You're building a solid database.",
          icon: 'award',
          reward: "📊 Data Collector"
        };
      }
      // 4. $1000 Profit (Net)
      else if (!newUnlocked.includes('profit_1k') && netProfit >= 1000) {
        milestoneFound = {
          id: 'profit_1k',
          title: "Profitable Trader",
          description: "You've crossed $1,000 in net profit. Keep it up!",
          icon: 'trophy',
          reward: "💰 1K Club"
        };
      }

      if (milestoneFound) {
        setCurrentMilestone(milestoneFound);
        setIsMilestoneOpen(true);
        newUnlocked.push(milestoneFound.id);
        setUnlockedMilestones(newUnlocked);
        localStorage.setItem('unlockedMilestones', JSON.stringify(newUnlocked));
      }
    };

    // Small delay to allow render/animation before popping modal
    const timer = setTimeout(checkMilestones, 1000);
    return () => clearTimeout(timer);

  }, [trades, dailyStreak, netProfit, loading, unlockedMilestones]);

  if (loading) {
    return <Loader />
  }

  // Helper for Circular Goal Progress
  const CircularGoalProgress = ({ current, target, label, colorClass = "text-gray-800", strokeColor = "#3b82f6" }: any) => {
    const percentage = Math.min(Math.max((current / target) * 100, 0), 100);
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    const isProfit = current >= 0;
    const displayColor = isProfit ? strokeColor : "#ef4444"; // Red if negative

    return (
      <div className="flex flex-col items-center justify-center p-4">
        {/* Background Circle */}
        <div className="relative h-24 w-24 flex items-center justify-center">
          <svg className="h-full w-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/20"
            />
            {/* Progress Circle */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              fill="none"
              stroke={displayColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={isProfit ? offset : circumference}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={`text-xs md:text-sm font-bold ${isProfit ? colorClass : 'text-red-500'}`}>{percentage.toFixed(0)}%</span>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
          <p className={`text-xs md:text-sm font-bold truncate max-w-[80px] sm:max-w-[none] ${isProfit ? colorClass : 'text-red-500'}`}>${current.toFixed(0)} <span className="text-muted-foreground font-normal text-[10px] md:text-xs">/ ${target}</span></p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">TradingJournal<span className="text-primary">.Pro</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 mr-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Account Balance</p>
              <p className="font-mono font-bold">${currentEquity.toFixed(2)}</p>
            </div>
          </div>
          <ModeToggle className="hidden md:inline-flex" />
          <span className="text-sm text-muted-foreground border-r pr-4 mr-[-10px] hidden md:inline-block">Welcome, {username || 'Trader'}</span>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="hidden md:inline-flex">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 max-w-8xl mx-auto w-full space-y-8">

        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">Overview of your trading performance.</p>
          </div>

          {/* Data Source Toggle */}
          {isMT5Connected && (
            <div className="bg-muted p-1 rounded-lg flex items-center">
              <Button
                variant={dataSource === 'journal' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setDataSource('journal')}
                className="text-xs"
              >
                Manual Journal
              </Button>
              <Button
                variant={dataSource === 'mt5' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setDataSource('mt5')}
                className="text-xs flex gap-1 items-center"
              >
                <Link className="h-3 w-3" /> MT5 Data
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setIsAwardsOpen(true)} title="Achievements">
              <Trophy className="h-4 w-4 text-yellow-500" />
            </Button>
            <Button
              variant={isMT5Connected ? "default" : "outline"}
              className={isMT5Connected ? "bg-green-600 hover:bg-green-700 text-white border-none" : ""}
              onClick={() => setIsConnectOpen(true)}
            >
              <Link className="mr-2 h-4 w-4" /> {isMT5Connected ? "MT5 Connected" : "Connect MT5"}
            </Button>
            <Button variant="outline" onClick={() => setIsGoalsOpen(true)}>
              <Target className="mr-2 h-4 w-4" /> Set Goals
            </Button>
            <Button onClick={() => setIsNewTradeOpen(true)} className="hidden md:flex">
              <Plus className="mr-2 h-4 w-4" /> New Trade
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

            {/* Mobile Bottom Navigation Bar / Desktop Tabs */}
            <TabsList className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t bg-background p-0 rounded-none md:relative md:h-10 md:w-auto md:inline-flex md:rounded-md md:border-none md:justify-start">
              <TabsTrigger value="dashboard" className="flex-1 flex flex-col gap-1 py-1 text-[10px] data-[state=active]:text-primary md:flex-row md:text-sm md:gap-2 md:h-full">
                <LayoutDashboard className="h-5 w-5 md:h-4 md:w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="journal" className="flex-1 flex flex-col gap-1 py-1 text-[10px] data-[state=active]:text-primary md:flex-row md:text-sm md:gap-2 md:h-full">
                <BookOpen className="h-5 w-5 md:h-4 md:w-4" />
                <span>Journal</span>
              </TabsTrigger>
              <TabsTrigger value="chart" className="flex-1 flex flex-col gap-1 py-1 text-[10px] data-[state=active]:text-primary md:flex-row md:text-sm md:gap-2 md:h-full">
                <LineChartIcon className="h-5 w-5 md:h-4 md:w-4" />
                <span>Charts</span>
              </TabsTrigger>
              <TabsTrigger value="news" className="flex-1 flex flex-col gap-1 py-1 text-[10px] data-[state=active]:text-primary md:flex-row md:text-sm md:gap-2 md:h-full">
                <TrendingUp className="h-5 w-5 md:h-4 md:w-4" />
                <span>News</span>
              </TabsTrigger>
              <TabsTrigger value="calculator" className="flex-1 flex flex-col gap-1 py-1 text-[10px] data-[state=active]:text-primary md:flex-row md:text-sm md:gap-2 md:h-full text-muted-foreground">
                <Target className="h-5 w-5 md:h-4 md:w-4" />
                <span>Tools</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="yearly">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile Floating Action Button (FAB) for New Trade */}
          <Button
            className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50 md:hidden"
            onClick={() => setIsNewTradeOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">

            {/* KPI STATS ROW */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {/* Current Equity */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Current Equity</CardTitle>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsEquityOpen(true)}>
                    <Edit className="h-3 w-3 text-muted-foreground hover:text-primary" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className={`text-lg md:text-2xl font-bold truncate ${currentEquity >= initialBalance ? 'text-green-500' : 'text-red-500'}`}>
                    ${currentEquity.toFixed(2)}
                  </div>
                  <div className="flex items-center text-[10px] md:text-xs text-muted-foreground mt-1">
                    {currentEquity >= initialBalance ? <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> : <TrendingDown className="h-3 w-3 mr-1 text-red-500" />}
                    <span className={currentEquity >= initialBalance ? "text-green-500" : "text-red-500"}>
                      {((currentEquity - initialBalance) / initialBalance * 100).toFixed(1)}%
                    </span>
                    <span className="ml-1">from initial</span>
                  </div>
                </CardContent>
              </Card>

              {/* PROFIT FACTOR / WIN RATE KPI */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Win Rate</CardTitle>
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg md:text-2xl font-bold">{winRate.toFixed(1)}%</div>
                  <div className="flex items-center text-[10px] md:text-xs text-muted-foreground mt-1 space-x-2">
                    <span className="text-green-500 flex items-center"><TrendingUp className="h-3 w-3 mr-1" />{trades.filter(t => t.type === 'profit').length} Won</span>
                    <span className="text-red-500 flex items-center"><TrendingDown className="h-3 w-3 mr-1" />{trades.filter(t => t.type === 'loss').length} Lost</span>
                  </div>
                </CardContent>
              </Card>

              {/* STREAKS KPI */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Winning Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg md:text-2xl font-bold">{dailyStreak} Days</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                    Best: {Math.max(dailyStreak, 3)} Days
                  </p>
                </CardContent>
              </Card>

              {/* RECENT PERFORMANCE KPI */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">Avg Return</CardTitle>
                  <Coins className="h-4 w-4 text-gray-800" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg md:text-2xl font-bold truncate">
                    ${trades.length > 0 ? (netProfit / trades.length).toFixed(2) : '0.00'}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Per Trade</p>
                </CardContent>
              </Card>
            </div>

            {/* GOALS & MILESTONES SECTION */}
            <div className="grid gap-4 md:grid-cols-7">
              {/* CIRCULAR GOALS */}
              <Card className="md:col-span-5 bg-muted/20 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Performance Targets
                  </CardTitle>
                  <CardDescription>Visualizing your progress towards financial freedom.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-4 justify-items-center gap-4">
                  <CircularGoalProgress
                    label="Daily"
                    current={dailyPnLValue}
                    target={goals.daily}
                    colorClass="text-orange-500"
                    strokeColor="#f97316"
                  />
                  <CircularGoalProgress
                    label="Weekly"
                    current={weeklyPnLValue}
                    target={goals.weekly}
                    colorClass="text-gray-800"
                    strokeColor="#3b82f6"
                  />
                  <CircularGoalProgress
                    label="Monthly"
                    current={monthlyPnLValue}
                    target={goals.monthly}
                    colorClass="text-purple-500"
                    strokeColor="#a855f7"
                  />
                  <CircularGoalProgress
                    label="Yearly"
                    current={yearlyPnLValue}
                    target={goals.yearly}
                    colorClass="text-green-500"
                    strokeColor="#22c55e"
                  />
                </CardContent>
              </Card>

              {/* DRAWDOWN / RISK METER */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Risk Status</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500">
                      {((accountMaxDrawdown / initialBalance) * 100).toFixed(2)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Max Drawdown</p>
                  </div>
                  <Separator />
                  <div className="text-center w-full">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Daily Loss Limit</span>
                      <span className="font-mono text-red-500">-${dailyDrawdown.toFixed(2)}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${Math.min((dailyDrawdown / (initialBalance * 0.05)) * 100, 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 text-right">Target: &lt; 5%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
              {/* Interactive Equity Curve Chart */}
              <InteractiveEquityChart equityCurve={equityCurve} timeFilter={timeFilter} />

              {/* Pair Performance */}
              <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 h-[300px]">

                    {/* Strategies Distribution (Pie Chart) */}
                    <div className="h-[140px] w-full flex items-center justify-between">
                      <div className="w-1/2 h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(
                                filteredTrades.reduce((acc, t) => {
                                  const s = t.strategy || 'No Strategy';
                                  acc[s] = (acc[s] || 0) + 1; // Count occurance
                                  return acc;
                                }, {} as Record<string, number>)
                              ).map(([name, value]) => ({ name, value }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {Object.entries(filteredTrades.reduce((acc, t) => { const s = t.strategy || 'No Strategy'; acc[s] = (acc[s] || 0) + 1; return acc; }, {} as Record<string, number>)).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#f97316', '#a855f7', '#22c55e'][index % 4]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', zIndex: 100 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-1/2 pl-4 text-xs space-y-1">
                        <p className="font-semibold text-muted-foreground mb-2">Strategy Distribution</p>
                        {Object.entries(filteredTrades.reduce((acc, t) => { const s = t.strategy || 'No Strategy'; acc[s] = (acc[s] || 0) + 1; return acc; }, {} as Record<string, number>))
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 4)
                          .map(([name, val], i) => (
                            <div key={name} className="flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#f97316', '#a855f7', '#22c55e'][i % 4] }}></div>
                                {name}
                              </span>
                              <span className="font-mono">{val}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Top Pairs Volume (Area Chart) */}
                    <div className="h-[120px] w-full">
                      <p className="font-semibold text-xs text-muted-foreground mb-2">Top Pairs (PnL Volume)</p>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={Object.entries(
                            filteredTrades.reduce((acc, t) => {
                              const p = t.pair || 'Unknown';
                              acc[p] = (acc[p] || 0) + (t.type === 'profit' ? t.amount : -t.amount);
                              return acc;
                            }, {} as Record<string, number>)
                          )
                            .map(([name, value]) => ({ name, value }))
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 5)
                          }
                          margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="value" stroke="#22c55e" fillOpacity={1} fill="url(#colorPnL)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                  </div>
                </CardContent>
              </Card>

              <ActivityHeatmap trades={currentTrades} />
            </div>
          </TabsContent>

          <TabsContent value="journal">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Trade Journal</CardTitle>
                    <CardDescription>
                      Review your trade history and performance.
                    </CardDescription>
                  </div>
                  <div className="flex bg-muted p-1 rounded-md">
                    <Button
                      variant={journalView === 'table' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setJournalView('table')}
                      className="h-8 w-8 p-0"
                      title="List View"
                    >
                      <ListIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={journalView === 'calendar' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setJournalView('calendar')}
                      className="h-8 w-8 p-0"
                      title="Calendar View"
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {journalView === 'table' ? (
                  <TradeTable trades={currentTrades} onDelete={handleDeleteTrade} />
                ) : (
                  <TradeCalendar trades={currentTrades} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart" className="h-[calc(100vh-200px)] min-h-[500px]">
            <Card className="h-full border-none shadow-none">
              <CardContent className="p-0 h-full">
                <TradingViewChart theme="dark" autosize />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SessionTracker />
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://www.forexfactory.com/', '_blank')}>
                    <TrendingUp className="mr-2 h-4 w-4" /> Forex Factory News
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://www.investing.com/economic-calendar/', '_blank')}>
                    <Activity className="mr-2 h-4 w-4" /> Economic Calendar
                  </Button>
                </CardContent>
              </Card>
            </div>

            <ForexHeatmap />
            <ForexNews />
          </TabsContent>

          <TabsContent value="calculator">
            <PipsCalculator />
          </TabsContent>

        </Tabs>

        <NewTradeDialog
          isOpen={isNewTradeOpen}
          onClose={() => setIsNewTradeOpen(false)}
          onSave={handleAddTrade}
        />

        <GoalsSettingsDialog
          isOpen={isGoalsOpen}
          onClose={() => setIsGoalsOpen(false)}
          currentGoals={goals}
          onSave={saveGoals}
        />

        <EquityDialog
          isOpen={isEquityOpen}
          onClose={() => setIsEquityOpen(false)}
          currentBalance={currentInitialBalance}
          onSave={(val) => {
            if (dataSource === 'journal') {
              setInitialBalance(val);
              localStorage.setItem('initialBalance', val.toString());
            } else {
              setMt5Balance(val); // In case user wants to manually adjust MT5 balance
            }
            showToast(`Initial balance updated to $${val}`, "success");
          }}
        />

        <ConnectAccountDialog
          isOpen={isConnectOpen}
          onClose={() => setIsConnectOpen(false)}
          onSync={(newTrades: any[], startBalance: number) => {
            // Populate Dedicated MT5 State
            if (newTrades && newTrades.length > 0) {
              const mappedTrades = newTrades.map((t: any) => ({ ...t, date: new Date(t.date) }));
              setMt5Trades(mappedTrades);
            }
            if (startBalance > 0) {
              setMt5Balance(startBalance);
            }
            setIsMT5Connected(true);
            setDataSource('mt5'); // Automatically switch to MT5 view
          }}
        />
        <MilestoneDialog
          isOpen={isMilestoneOpen}
          onClose={() => setIsMilestoneOpen(false)}
          milestone={currentMilestone}
        />
        <AwardsDialog
          isOpen={isAwardsOpen}
          onClose={() => setIsAwardsOpen(false)}
          unlockedMilestones={unlockedMilestones}
        />
      </main>
    </div>

  );
};

export default Dashboard;
