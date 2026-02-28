import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays, eachDayOfInterval, getDay, startOfYear } from 'date-fns';

interface ActivityHeatmapProps {
    trades: any[];
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ trades }) => {
    // Generate dates for the last 365 days
    const today = new Date();
    const startDate = subDays(today, 364);

    const dates = eachDayOfInterval({
        start: startDate,
        end: today
    });

    // Group trades by date
    const activityMap = new Map<string, number>();
    trades.forEach(trade => {
        // Ensure we handle Date objects or strings
        const dateObj = new Date(trade.date);
        if (!isNaN(dateObj.getTime())) {
            const dateStr = format(dateObj, 'yyyy-MM-dd');
            activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
        }
    });

    const getColor = (count: number) => {
        if (count === 0) return 'bg-muted/50';
        if (count <= 2) return 'bg-green-300 dark:bg-green-900';
        if (count <= 5) return 'bg-green-400 dark:bg-green-700';
        if (count <= 8) return 'bg-green-500 dark:bg-green-500';
        return 'bg-green-600 dark:bg-green-300';
    };

    // Months labels logic (simplified)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <Card className="col-span-1 lg:col-span-7">
            <CardHeader>
                <CardTitle>Trading Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] flex flex-col gap-2">
                        <div className="flex text-xs text-muted-foreground ml-8 gap-12">
                            {/* Simplified month labels, rendered statically or based on date range (omitted for brevity in v1) */}
                        </div>
                        <div className="flex gap-2">
                            <div className="flex flex-col gap-1 text-[10px] text-muted-foreground mr-2 h-[88px] justify-between py-1">
                                <span>Mon</span>
                                <span>Wed</span>
                                <span>Fri</span>
                            </div>

                            {/* The Grid */}
                            <div className="grid grid-rows-7 grid-flow-col gap-1 w-full">
                                {dates.map((date) => {
                                    const dateStr = format(date, 'yyyy-MM-dd');
                                    const count = activityMap.get(dateStr) || 0;
                                    return (
                                        <div
                                            key={dateStr}
                                            title={`${dateStr}: ${count} trades`}
                                            className={`w-3 h-3 rounded-sm transition-colors hover:ring-1 hover:ring-ring ${getColor(count)}`}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 ml-8">
                            <span>Less</span>
                            <div className="w-3 h-3 rounded-sm bg-muted/50" />
                            <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-900" />
                            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
                            <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500" />
                            <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-300" />
                            <span>More</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ActivityHeatmap;
