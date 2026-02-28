import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Goals {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
}

interface GoalsSettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentGoals: Goals;
    onSave: (goals: Goals) => void | Promise<void>;
}

export const GoalsSettingsDialog: React.FC<GoalsSettingsDialogProps> = ({ isOpen, onClose, currentGoals, onSave }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [goals, setGoals] = useState<Goals>(currentGoals);

    useEffect(() => {
        if (isOpen) {
            setGoals(currentGoals);
        }
    }, [isOpen, currentGoals]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(goals);
        setIsSaving(false);
        onClose();
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Set Trading Goals</SheetTitle>
                    <SheetDescription>
                        Define your profit targets to stay motivated and disciplined.
                        Break down your yearly vision into actionable steps.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-6">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="daily" className="text-orange-500 font-semibold">Daily Target ($)</Label>
                            <Input
                                id="daily"
                                type="number"
                                value={goals.daily}
                                onChange={(e) => setGoals({ ...goals, daily: Number(e.target.value) })}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">Focus on small, consistent wins.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="weekly" className="text-gray-800 font-semibold">Weekly Target ($)</Label>
                            <Input
                                id="weekly"
                                type="number"
                                value={goals.weekly}
                                onChange={(e) => setGoals({ ...goals, weekly: Number(e.target.value) })}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">One good week can change your month.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="monthly" className="text-purple-500 font-semibold">Monthly Target ($)</Label>
                            <Input
                                id="monthly"
                                type="number"
                                value={goals.monthly}
                                onChange={(e) => setGoals({ ...goals, monthly: Number(e.target.value) })}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">Consistency builds empires.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="yearly" className="text-green-500 font-semibold">Yearly Target ($)</Label>
                            <Input
                                id="yearly"
                                type="number"
                                value={goals.yearly}
                                onChange={(e) => setGoals({ ...goals, yearly: Number(e.target.value) })}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">Think big. You are capable.</p>
                        </div>
                    </div>

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </SheetClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Goals
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
};
