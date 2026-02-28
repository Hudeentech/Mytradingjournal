import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface EquityDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
    onSave: (balance: number) => void;
}

export const EquityDialog: React.FC<EquityDialogProps> = ({ isOpen, onClose, currentBalance, onSave }) => {
    const [balance, setBalance] = useState<string>(currentBalance.toString());

    useEffect(() => {
        if (isOpen) {
            setBalance(currentBalance.toString());
        }
    }, [isOpen, currentBalance]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(balance);
        if (!isNaN(val)) {
            onSave(val);
            onClose();
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Update Account Balance</SheetTitle>
                    <SheetDescription>
                        Set your initial account balance or deposit/withdrawal amount. This is the baseline for your equity curve.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-6">
                    <div className="grid gap-2">
                        <Label htmlFor="balance">Initial Balance ($)</Label>
                        <Input
                            id="balance"
                            type="number"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            placeholder="e.g. 10000"
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                            Entering a new balance will recalculate your equity curve from this starting point.
                        </p>
                    </div>

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </SheetClose>
                        <Button type="submit">Update Balance</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
};
