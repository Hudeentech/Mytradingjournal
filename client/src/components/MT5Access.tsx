import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const MT5Access: React.FC = () => {
    const openWebTerminal = () => {
        window.open("https://trade.mql5.com/trade", "_blank");
    };

    const openApp = () => {
        window.location.href = "mt5://";
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>MetaTrader 5 Access</CardTitle>
                <CardDescription>
                    Quickly access your trading terminal
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Button onClick={openWebTerminal} variant="default" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" /> Open Web Terminal
                </Button>
                <Button onClick={openApp} variant="outline" className="w-full">
                    Open MT5 App (if installed)
                </Button>
            </CardContent>
        </Card>
    );
};
