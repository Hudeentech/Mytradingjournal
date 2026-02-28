import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
    equity: {
        label: "Account Equity",
        color: "var(--chart-1)",
    },
    net: {
        label: "Net PnL",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export function InteractiveEquityChart({
    equityCurve,
    timeFilter
}: {
    equityCurve: { date: Date | string, equity: number, net: number }[];
    timeFilter: string;
}) {
    const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("equity")

    const total = React.useMemo(
        () => ({
            equity: equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].equity : 0,
            net: equityCurve.reduce((acc, curr) => acc + curr.net, 0),
        }),
        [equityCurve]
    )

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4 sm:py-0">
                    <CardTitle>Equity Curve ({timeFilter === 'all' ? 'All Time' : timeFilter})</CardTitle>
                    <CardDescription>
                        Showing {activeChart === 'equity' ? 'account balance trajectory' : 'cumulative net profit/loss'}
                    </CardDescription>
                </div>
                <div className="flex">
                    {["equity", "net"].map((key) => {
                        const chart = key as keyof typeof chartConfig
                        return (
                            <button
                                key={chart}
                                data-active={activeChart === chart}
                                className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:even:border-l even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6 transition-colors"
                                onClick={() => setActiveChart(chart)}
                            >
                                <span className="text-muted-foreground text-xs">
                                    {chartConfig[chart].label}
                                </span>
                                <span className={`text-lg leading-none font-bold sm:text-2xl ${chart === 'net' && total.net < 0 ? 'text-red-500' :
                                    chart === 'net' && total.net > 0 ? 'text-green-500' : ''
                                    }`}>
                                    ${Math.abs(total[key as keyof typeof total]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6 flex-1">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[300px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={equityCurve}
                        margin={{
                            top: 10,
                            left: 12,
                            right: 12,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                            width={60}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey={activeChart}
                                    labelFormatter={(value) => {
                                        const date = new Date(value)
                                        return isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    }}
                                />
                            }
                        />
                        <Line
                            dataKey={activeChart}
                            type="linear"
                            stroke={(activeChart === 'net' && total.net < 0) ? "#ef4444" : "hsl(var(--foreground))"}
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: 'hsl(var(--foreground))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
