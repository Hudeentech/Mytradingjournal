import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface NewTradeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (trade: any) => void;
}

export const NewTradeDialog: React.FC<NewTradeDialogProps> = ({ isOpen, onClose, onSave }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        type: "profit",
        market: "forex",
        pair: "",
        strategy: "Price Action", // Default strategy
        target: "",
        notes: "",
        date: new Date().toISOString().split('T')[0]
    });

    const strategies = [
        "Price Action",
        "ICT Silver Bullet",
        "Smart Money Concepts",
        "Support & Resistance",
        "Breakout",
        "Trend Following",
        "Scalping",
        "News Trading"
    ];

    // reset form on open
    useEffect(() => {
        if (isOpen) {
            setFormData({
                amount: "",
                type: "profit",
                market: "forex",
                pair: "",
                strategy: "Price Action",
                target: "",
                notes: "",
                date: new Date().toISOString().split('T')[0]
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({
            ...formData,
            amount: parseFloat(formData.amount),
        });
        setIsSaving(false);
        onClose();
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:w-[540px] max-w-full overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Add New Trade</SheetTitle>
                    <SheetDescription>
                        Log a new trade entry to your journal.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="market">Market</Label>
                        <Select
                            value={formData.market}
                            onValueChange={(val) => setFormData({ ...formData, market: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select market" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="forex">Forex</SelectItem>
                                <SelectItem value="synthetics">Synthetics</SelectItem>
                                <SelectItem value="crypto">Crypto</SelectItem>
                                <SelectItem value="stocks">Stocks</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="pair">Pair/Instrument</Label>
                        <Input
                            id="pair"
                            placeholder="e.g. EURUSD, V75"
                            value={formData.pair}
                            onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="strategy">Strategy</Label>
                        <Select
                            value={formData.strategy}
                            onValueChange={(val) => setFormData({ ...formData, strategy: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select strategy" />
                            </SelectTrigger>
                            <SelectContent>
                                {strategies.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount ($)</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="target">Target (TP)</Label>
                        <Input
                            id="target"
                            placeholder="e.g. 1.0950 or 50 pips"
                            value={formData.target}
                            onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Result</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={formData.type === 'profit' ? 'default' : 'outline'}
                                className={formData.type === 'profit' ? 'flex-1 bg-green-600 hover:bg-green-700' : 'flex-1'}
                                onClick={() => setFormData({ ...formData, type: 'profit' })}
                            >
                                Profit
                            </Button>
                            <Button
                                type="button"
                                variant={formData.type === 'loss' ? 'destructive' : 'outline'}
                                className="flex-1"
                                onClick={() => setFormData({ ...formData, type: 'loss' })}
                            >
                                Loss
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                            className="h-32"
                        />
                    </div>

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </SheetClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Trade
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
};
