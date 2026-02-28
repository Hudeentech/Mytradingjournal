import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timeline } from "react-ts-tradingview-widgets";

const ForexNews: React.FC = () => {
    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Market News</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] p-0 overflow-hidden relative">
                <div className="absolute inset-0">
                    <Timeline
                        colorTheme="light"
                        feedMode="market"
                        market="forex"
                        height={400}
                        width="100%"
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default ForexNews;
