import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Trade {
    id: string;
    date: Date | string;
    type: 'profit' | 'loss';
    amount: number;
    pair?: string;
}

interface TradeCalendarProps {
    trades: Trade[];
}

export const TradeCalendar: React.FC<TradeCalendarProps> = ({ trades }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    // Generate Calendar Grid
    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, dateFormat);

            // Filter trades for this day
            const dayTrades = trades.filter(t => isSameDay(new Date(t.date), day));
            const dayPnL = dayTrades.reduce((acc, t) => acc + (t.type === 'profit' ? t.amount : -t.amount), 0);
            const hasActivity = dayTrades.length > 0;
            const isProfit = dayPnL >= 0;

            days.push(
                <div
                    key={day.toString()}
                    className={cn(
                        "h-24 border p-2 flex flex-col justify-between transition-colors relative group",
                        !isSameMonth(day, monthStart) ? "text-muted-foreground bg-muted/20" : "bg-card",
                        hasActivity && isProfit && "bg-green-500/10 border-green-500/20 hover:bg-green-500/20",
                        hasActivity && !isProfit && "bg-red-500/10 border-red-500/20 hover:bg-red-500/20",
                        isToday(day) && "ring-2 ring-primary ring-inset"
                    )}
                >
                    <span className={cn("text-sm font-medium", !isSameMonth(day, monthStart) && "text-muted-foreground/50")}>
                        {formattedDate}
                    </span>

                    {hasActivity && (
                        <div className="flex flex-col items-end gap-1">
                            <span className={cn("text-xs font-bold", isProfit ? "text-green-500" : "text-red-500")}>
                                {isProfit ? "+" : "-"}${Math.abs(dayPnL).toFixed(0)}
                            </span>
                            <div className="flex gap-1">
                                {dayTrades.length > 3 ? (
                                    <Badge variant="outline" className="text-[10px] h-4 px-1">{dayTrades.length} Trades</Badge>
                                ) : (
                                    dayTrades.map((t, idx) => (
                                        <div
                                            key={idx}
                                            className={cn("w-1.5 h-1.5 rounded-full", t.type === 'profit' ? "bg-green-500" : "bg-red-500")}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );
            day = new Date(day.setDate(day.getDate() + 1));
        }
        rows.push(
            <div className="grid grid-cols-7" key={day.toString()}>
                {days}
            </div>
        );
        days = [];
    }

    // --- Mobile View Logic (List of active days) ---
    // Group active days for mobile list
    const activeDaysInMonth = trades
        .filter(t => isSameMonth(new Date(t.date), currentMonth))
        .reduce((acc, t) => {
            const dateKey = format(new Date(t.date), 'yyyy-MM-dd');
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(t);
            return acc;
        }, {} as Record<string, Trade[]>);

    const sortedActiveDays = Object.keys(activeDaysInMonth).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 bg-muted/30 p-3 rounded-lg border">
                <Button variant="ghost" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex flex-col items-center cursor-pointer" onClick={goToToday}>
                    <span className="text-lg font-bold">
                        {format(currentMonth, "MMMM yyyy")}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline-block">
                        Click to jump to Today
                    </span>
                </div>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Desktop Calendar View */}
            <div className="hidden md:block border rounded-md overflow-hidden shadow-sm">
                <div className="grid grid-cols-7 bg-muted/50 p-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day}>{day}</div>
                    ))}
                </div>
                <div>{rows}</div>
            </div>

            {/* Mobile List View (Non-Calendar Format) */}
            <div className="md:hidden space-y-4">
                <p className="text-sm text-muted-foreground text-center italic">Showing active days for {format(currentMonth, "MMMM")}</p>
                {sortedActiveDays.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No trades found for this month.
                    </div>
                ) : (
                    sortedActiveDays.map(dateKey => {
                        const dayTrades = activeDaysInMonth[dateKey];
                        const dayPnL = dayTrades.reduce((acc, t) => acc + (t.type === 'profit' ? t.amount : -t.amount), 0);
                        const isProfit = dayPnL >= 0;

                        return (
                            <Card key={dateKey} className="overflow-hidden">
                                <CardHeader className="p-4 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("p-2 rounded-full", isProfit ? "bg-green-500/20" : "bg-red-500/20")}>
                                            {isProfit ? <TrendingUp className={cn("h-4 w-4", "text-green-500")} /> : <TrendingDown className={cn("h-4 w-4", "text-red-500")} />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{format(parseISO(dateKey), 'EEEE, MMM do')}</CardTitle>
                                            <CardDescription className="text-xs">{dayTrades.length} Trades</CardDescription>
                                        </div>
                                    </div>
                                    <div className={cn("text-lg font-bold", isProfit ? "text-green-500" : "text-red-500")}>
                                        {isProfit ? "+" : "-"}${Math.abs(dayPnL).toFixed(2)}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {/* Brief list of top trades for the day logic could go here, or just a summary details */}
                                    <div className="divide-y">
                                        {dayTrades.map((trade, idx) => (
                                            <div key={idx} className="flex justify-between p-3 text-sm hover:bg-muted/10">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] font-mono">{trade.pair || 'Unknown'}</Badge>
                                                    <span className={cn("text-xs font-semibold", trade.type === 'profit' ? "text-green-500" : "text-red-500")}>
                                                        {trade.type.toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="font-mono">${trade.amount.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    );
};
