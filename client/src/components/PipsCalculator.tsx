import React, { useState } from 'react';
import { useToast } from './ui/Toast';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calculator, ArrowRight, RefreshCcw } from "lucide-react";

const PipsCalculator: React.FC = () => {
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [lotSize, setLotSize] = useState('1');
  const [currency, setCurrency] = useState('EURUSD');
  const [marketType, setMarketType] = useState<'forex' | 'synthetic'>('forex');
  const [result, setResult] = useState<{ pips: number; profit: number | null; points?: number } | null>(null);

  const { showToast } = useToast ? useToast() : { showToast: () => { } };

  const calculatePips = () => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const lots = parseFloat(lotSize);

    if (
      isNaN(entry) || isNaN(exit) || isNaN(lots) ||
      entryPrice.trim() === '' || exitPrice.trim() === '' || lotSize.trim() === ''
    ) {
      showToast('Please enter valid numbers for all fields.', 'error');
      setResult(null);
      return;
    }

    let pips: number;
    let points: number | undefined;
    let profit: number;

    if (marketType === 'forex') {
      if (currency.includes('JPY')) {
        pips = (exit - entry) * 100;
        profit = (pips * 0.01) * lots * 100;
      } else {
        pips = (exit - entry) * 10000;
        profit = pips * lots * 10;
      }
      points = undefined;
    } else {
      const difference = exit - entry;
      points = Math.abs(difference);
      if (currency.includes('VOLATILITY')) {
        pips = points * 100;
        profit = pips * lots;
      } else if (currency.includes('BOOM') || currency.includes('CRASH')) {
        pips = points * 100;
        profit = pips * lots * 0.2;
      } else {
        pips = points * 100;
        profit = pips * lots;
      }
    }

    setResult({ pips, profit, points });
  };

  const resetCalculator = () => {
    setEntryPrice('');
    setExitPrice('');
    setLotSize('1');
    setResult(null);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Inputs
          </CardTitle>
          <CardDescription>Enter trade details to calculate potential P/L</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={marketType} onValueChange={(val) => setMarketType(val as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="forex">Forex</TabsTrigger>
              <TabsTrigger value="synthetic">Synthetics</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label>Symbol</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {marketType === 'forex' ? (
                  <>
                    <SelectItem value="EURUSD">EUR/USD</SelectItem>
                    <SelectItem value="GBPUSD">GBP/USD</SelectItem>
                    <SelectItem value="USDJPY">USD/JPY</SelectItem>
                    <SelectItem value="AUDUSD">AUD/USD</SelectItem>
                    <SelectItem value="USDCAD">USD/CAD</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="VOLATILITY_10">Volatility 10</SelectItem>
                    <SelectItem value="VOLATILITY_75">Volatility 75</SelectItem>
                    <SelectItem value="BOOM_1000">Boom 1000</SelectItem>
                    <SelectItem value="CRASH_1000">Crash 1000</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Entry</Label>
              <Input
                type="number"
                step="0.00001"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="0.00000"
              />
            </div>
            <div className="space-y-2">
              <Label>Exit</Label>
              <Input
                type="number"
                step="0.00001"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="0.00000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lot Size</Label>
            <Input
              type="number"
              step="0.01"
              value={lotSize}
              onChange={(e) => setLotSize(e.target.value)}
              placeholder="1.00"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="icon" onClick={resetCalculator}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button onClick={calculatePips} className="flex-1">
              Calculate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col justify-center h-full bg-muted/30">
        <CardContent className="text-center space-y-6 pt-6">
          {!result ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center h-48 opacity-50">
              <Calculator className="h-12 w-12 mb-2" />
              <p>Enter values to see results</p>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Estimated P/L</h3>
                <div className={`text-5xl font-bold ${result.profit! >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${Math.abs(result.profit!).toFixed(2)}
                </div>
                <div className={`text-sm font-medium mt-1 ${result.profit! >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.profit! >= 0 ? 'Profit' : 'Loss'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-background p-4 rounded-lg border">
                  <div className="text-2xl font-bold">{Math.abs(result.pips).toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground uppercase">Pips/Ticks</div>
                </div>
                {result.points !== undefined && (
                  <div className="bg-background p-4 rounded-lg border">
                    <div className="text-2xl font-bold">{result.points.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground uppercase">Points</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PipsCalculator;
