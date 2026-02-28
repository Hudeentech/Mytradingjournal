import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

const sessions = [
    { name: 'Sydney', start: 21, end: 6, timezone: 'Australia/Sydney' }, // UTC start/end approx
    { name: 'Tokyo', start: 0, end: 9, timezone: 'Asia/Tokyo' },
    { name: 'London', start: 8, end: 17, timezone: 'Europe/London' },
    { name: 'New York', start: 13, end: 22, timezone: 'America/New_York' },
];

const SessionTracker: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getSessionStatus = (start: number, end: number) => {
        const utcHour = currentTime.getUTCHours();

        // Handle crossing midnight (e.g. Sydney 21:00 - 06:00)
        if (start > end) {
            if (utcHour >= start || utcHour < end) return 'active';
        } else {
            if (utcHour >= start && utcHour < end) return 'active';
        }

        // Check if upcoming (within 1 hour)
        const nextHour = (utcHour + 1) % 24;
        if (start > end) {
            if (nextHour >= start || nextHour < end) return 'upcoming';
        } else {
            if (nextHour === start) return 'upcoming';
        }

        return 'closed';
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Market Sessions (UTC)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="text-center font-mono text-xl mb-4">
                        {currentTime.toUTCString().slice(17, 25)} UTC
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {sessions.map((session) => {
                            const status = getSessionStatus(session.start, session.end);
                            return (
                                <div key={session.name} className="flex flex-col items-center justify-between p-3 rounded-lg bg-muted/50 border gap-1">
                                    <span className="font-semibold text-sm">{session.name}</span>
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                        {String(session.start).padStart(2, '0')}:00 - {String(session.end).padStart(2, '0')}:00
                                    </span>
                                    <div className="mt-1">
                                        {status === 'active' && <Badge variant="default" className="bg-green-500 hover:bg-green-600">Open</Badge>}
                                        {status === 'upcoming' && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Soon</Badge>}
                                        {status === 'closed' && <Badge variant="outline" className="text-muted-foreground">Closed</Badge>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SessionTracker;
