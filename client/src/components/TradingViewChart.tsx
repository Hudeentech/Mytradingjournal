import React from 'react';
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

interface TradingViewChartProps {
    symbol?: string;
    theme?: "light" | "dark";
    autosize?: boolean;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
    symbol = "FX:EURUSD",
    theme = "light",
    autosize = true
}) => {
    return (
        <div className="w-full h-full min-h-[90dvh]">
            <AdvancedRealTimeChart
                symbol={symbol}
                theme={theme}
                autosize={autosize}
                width="100%"
                height="100%"
            />
        </div>
    );
};

export default TradingViewChart;
