import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "./ui/Toast";
import { CheckCircle2, AlertCircle, Loader2, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConnectAccountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSync: (trades: any[], startBalance: number) => void;
}

export const ConnectAccountDialog: React.FC<ConnectAccountDialogProps> = ({ isOpen, onClose, onSync }) => {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionMethod, setConnectionMethod] = useState("auto"); // auto or ea

    // Form states
    const [accountId, setAccountId] = useState("");
    const [server, setServer] = useState("");
    const [password, setPassword] = useState("");

    const handleConnect = async () => {
        if (!accountId || !server) {
            showToast("Please fill in all required fields", "error");
            return;
        }

        setIsLoading(true);

        // 1. Attempt Real Fetch
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mytradingjournal-api.vercel.app/api';
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/mt5/trades`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const realTrades = await res.json();
                if (Array.isArray(realTrades) && realTrades.length > 0) {
                    setIsLoading(false);
                    setIsConnected(true);
                    localStorage.setItem('mt5_connected', 'true');
                    onSync(realTrades, 0);
                    showToast(`Synced ${realTrades.length} trades from MT5 Account.`, "success");
                    return;
                }
            }
        } catch (error) {
            console.warn("Failed to fetch real MT5 data, using demo.", error);
        }

        // 2. Fallback to Simulation
        setTimeout(() => {
            setIsLoading(false);
            setIsConnected(true);
            showToast("MT5 Account Connected (Demo Data)", undefined);
            localStorage.setItem('mt5_connected', 'true');

            // Generate Mock History for the MT5 View
            const pairs = ['EURUSD', 'GBPUSD', 'XAUUSD', 'US30', 'BTCUSD', 'ETHUSD', 'NAS100'];
            const strategies = ['Price Action', 'Smart Money Concepts', 'Scalping', 'Breakout'];

            // Simulating a $50,000 Funded Account
            const startBalance = 50000;

            const mockTrades = Array.from({ length: 50 }).map((_, i) => {
                const isProfit = Math.random() > 0.45; // 55% winrate simulated
                const amount = isProfit ? Math.floor(Math.random() * 500) + 50 : Math.floor(Math.random() * 300) + 50;
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // Last 90 days

                return {
                    id: `mt5_${Date.now()}_${i}`,
                    date: date,
                    pair: pairs[Math.floor(Math.random() * pairs.length)],
                    market: 'forex',
                    strategy: strategies[Math.floor(Math.random() * strategies.length)],
                    type: isProfit ? 'profit' : 'loss',
                    amount: amount,
                    notes: 'Imported from MT5'
                };
            });

            onSync(mockTrades, startBalance);
            showToast(`Synced ${mockTrades.length} trades to MT5 View.`, "success");

        }, 2000);
    };

    const handleDisconnect = () => {
        setIsConnected(false);
        setAccountId("");
        setPassword("");
        setServer("");
        localStorage.removeItem('mt5_connected');
        showToast("Account Disconnected", undefined);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Connect Trading Account</DialogTitle>
                    <DialogDescription>
                        Sync your trades automatically from MetaTrader 4/5.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="auto" className="w-full" onValueChange={setConnectionMethod}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="auto">Auto-Sync (Cloud)</TabsTrigger>
                        <TabsTrigger value="ea">Expert Advisor (EA)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="auto" className="space-y-4 py-4">
                        {!isConnected ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="platform">Platform</Label>
                                        <Select defaultValue="mt5">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Platform" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mt4">MetaTrader 4</SelectItem>
                                                <SelectItem value="mt5">MetaTrader 5</SelectItem>
                                                <SelectItem value="ctrader">cTrader</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="broker">Broker / Server</Label>
                                        <Input
                                            id="broker"
                                            placeholder="e.g. ICMarkets-Live"
                                            value={server}
                                            onChange={(e) => setServer(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login">Login ID</Label>
                                    <Input
                                        id="login"
                                        placeholder="Account Number"
                                        type="number"
                                        value={accountId}
                                        onChange={(e) => setAccountId(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Investor Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Read-only password recommended"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        We only use read-only access to fetch trade history. Your funds are safe.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <CheckCircle2 className="h-16 w-16 text-green-500" />
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold">Connection Active</h3>
                                    <p className="text-muted-foreground">Syncing with Account #{accountId}</p>
                                </div>
                                <div className="w-full bg-muted p-4 rounded-md text-sm">
                                    <div className="flex justify-between mb-2">
                                        <span>Status:</span>
                                        <span className="text-green-500 font-medium">Online</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Last Sync:</span>
                                        <span>Just now</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="ea" className="space-y-4 py-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Manual Sync via EA</CardTitle>
                                <CardDescription>
                                    Download our Expert Advisor and drop it on any chart to sync trades instantly.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-secondary/50 p-4 rounded-md border flex items-center justify-between">
                                    <code className="text-sm font-mono">https://api.tradingjournal.pro/webhook/user_8829</code>
                                    <Button variant="ghost" size="icon" onClick={() => showToast("Webhook URL copied", "success")}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-2">
                                    <p>1. Open MT5 {'>'} Tools {'>'} Options {'>'} Expert Advisors.</p>
                                    <p>2. Enable "Allow WebRequest" and add the URL above.</p>
                                    <p>3. Attach the "JournalSync" EA to any chart.</p>
                                </div>
                                <Button className="w-full" variant="outline">
                                    Download EA (.ex5)
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="sm:justify-between">
                    {isConnected ? (
                        <Button variant="destructive" onClick={handleDisconnect} className="w-full sm:w-auto">
                            Disconnect
                        </Button>
                    ) : (
                        connectionMethod === 'auto' && (
                            <Button onClick={handleConnect} disabled={isLoading} className="w-full sm:w-auto ml-auto">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    "Connect Account"
                                )}
                            </Button>
                        )
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
