
import React, { useState } from 'react';
import { useToast } from './ui/Toast';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import BottomNav from './BottomNav';

const PipsCalculator: React.FC = () => {
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [lotSize, setLotSize] = useState('1');
  const [currency, setCurrency] = useState('EURUSD');
  const [marketType, setMarketType] = useState<'forex' | 'synthetic'>('forex');
  const [result, setResult] = useState<{ pips: number; profit: number | null; points?: number } | null>(null);
  // const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const calculatePips = () => {
    // setError(null);
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const lots = parseFloat(lotSize);

    if (
      isNaN(entry) || isNaN(exit) || isNaN(lots) ||
      entryPrice.trim() === '' || exitPrice.trim() === '' || lotSize.trim() === ''
    ) {
      // setError('Please enter valid numbers for all fields.');
      showToast('Please enter valid numbers for all fields.', 'error');
      setResult(null);
      return;
    }
    if (lots <= 0) {
      // setError('Lot size must be greater than 0.');
      showToast('Lot size must be greater than 0.', 'error');
      setResult(null);
      return;
    }
    if (entry <= 0 || exit <= 0) {
      // setError('Entry and exit prices must be greater than 0.');
      showToast('Entry and exit prices must be greater than 0.', 'error');
      setResult(null);
      return;
    }

    let pips: number;
    let points: number | undefined;
    let profit: number;

    if (marketType === 'forex') {
      // For JPY pairs
      if (currency.includes('JPY')) {
        pips = (exit - entry) * 100;
        profit = (pips * 0.01) * lots * 100;
      } else {
        pips = (exit - entry) * 10000;
        profit = pips * lots * 10;
      }
      points = undefined;
    } else {
      // For Deriv synthetics
      const difference = exit - entry;
      points = Math.abs(difference);

      // Calculate pips based on the specific synthetic index
      if (currency.includes('VOLATILITY')) {
        pips = points * 100; // Convert points to pips for Volatility indices
        profit = pips * lots;
      } else if (currency.includes('BOOM') || currency.includes('CRASH')) {
        pips = points * 100;
        profit = pips * lots * 0.2; // Boom/Crash have different pip values
      } else {
        pips = points * 100;
        profit = pips * lots;
      }
    }


    setResult({ pips, profit, points });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 text-gray-900 dark:bg-gradient-to-br p-2 pb-24 transition-colors">
      <div className="mx-auto max-w-md space-y-4">
        <Card className="border-none shadow-none text-gray-900">
          <CardHeader>
            <CardTitle>Pips & Points Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setMarketType('forex')}
                className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  marketType === 'forex'
                    ? 'bg-gradient-to-tl from-indigo-500 to-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 '
                }`}
                aria-pressed={marketType === 'forex'}
              >
                Forex
              </button>
              <button
                onClick={() => setMarketType('synthetic')}
                className={`flex-1 py-2 px-4 w-full rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  marketType === 'synthetic'
                    ? 'bg-gradient-to-tl from-indigo-500 to-blue-500 text-white '
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 '
                }`}
                aria-pressed={marketType === 'synthetic'}
              >
                Deriv Synthetic
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="currency-select">
                Currency Pair
              </label>
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 "
                title="Select market"
                aria-label="Select market"
              >
                {marketType === 'forex' ? (
                  <>
                    <option value="EURUSD">EUR/USD</option>
                    <option value="GBPUSD">GBP/USD</option>
                    <option value="USDJPY">USD/JPY</option>
                    <option value="AUDUSD">AUD/USD</option>
                    <option value="USDCAD">USD/CAD</option>
                    <option value="NZDUSD">NZD/USD</option>
                  </>
                ) : (
                  <>
                    <option value="VOLATILITY_10">Volatility 10 Index</option>
                    <option value="VOLATILITY_25">Volatility 25 Index</option>
                    <option value="VOLATILITY_50">Volatility 50 Index</option>
                    <option value="VOLATILITY_75">Volatility 75 Index</option>
                    <option value="VOLATILITY_100">Volatility 100 Index</option>
                    <option value="BOOM_1000">Boom 1000 Index</option>
                    <option value="CRASH_1000">Crash 1000 Index</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="entry-price">
                Entry Price
              </label>
              <input
                id="entry-price"
                type="number"
                step="0.00001"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 "
                placeholder="Enter entry price"
                inputMode="decimal"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="exit-price">
                Exit Price
              </label>
              <input
                id="exit-price"
                type="number"
                step="0.00001"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 "
                placeholder="Enter exit price"
                inputMode="decimal"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1" htmlFor="lot-size">
                Lot Size
              </label>
              <input
                id="lot-size"
                type="number"
                step="0.01"
                min="0.001"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 "
                placeholder="Enter lot size"
                inputMode="decimal"
                autoComplete="off"
              />
            </div>

            <button
              onClick={calculatePips}
              className="w-full bg-gradient-to-tl from-indigo-500 to-blue-500 text-white py-2 rounded-md hover:bg-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Calculate
            </button>
            {/* Error toast handled globally */}
            {result && (
              <div className="mt-4 p-4 bg-gray-50 text-gray-900 rounded-md space-y-2 dark:bg-[#23242b] dark:text-gray-100" aria-live="polite">
                {marketType === 'synthetic' && result.points !== undefined && (
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Points: {result.points.toFixed(2)}
                    {parseFloat(exitPrice) > parseFloat(entryPrice)
                      ? ' up'
                      : parseFloat(exitPrice) < parseFloat(entryPrice)
                      ? ' down'
                      : ''}
                  </p>
                )}
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {marketType === 'forex' ? 'Pips' : 'Ticks'}: {Math.abs(result.pips).toFixed(1)}
                  {result.pips > 0
                    ? ' profit'
                    : result.pips < 0
                    ? ' loss'
                    : ' (no profit/loss)'}
                </p>
                {result.profit !== null && (
                  <p className="text-md text-gray-600 dark:text-gray-300">
                    Estimated {result.profit > 0
                      ? 'Profit'
                      : result.profit < 0
                      ? 'Loss'
                      : 'Profit/Loss'}: ${Math.abs(result.profit).toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <BottomNav />
      </div>
    </div>
  );
};

export default PipsCalculator;
