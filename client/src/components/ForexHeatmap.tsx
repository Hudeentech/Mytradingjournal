import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForexHeatMap } from "react-ts-tradingview-widgets";

const ForexHeatmap: React.FC = () => {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Forex Market Heatmap</CardTitle>
            </CardHeader>
            <CardContent className="h-[600px] p-0 relative overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                    <ForexHeatMap
                        colorTheme="light"
                        autosize
                        width="100%"
                        height="100%"
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default ForexHeatmap;
