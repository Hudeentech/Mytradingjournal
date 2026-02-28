import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Award, Zap, PartyPopper } from "lucide-react";
import confetti from 'canvas-confetti';
import { useEffect } from "react";

interface MilestoneDialogProps {
    isOpen: boolean;
    onClose: () => void;
    milestone: {
        title: string;
        description: string;
        icon: 'trophy' | 'star' | 'award' | 'zap';
        reward: string; // e.g., "🔥 Fire Streak Badge"
    } | null;
}

export const MilestoneDialog: React.FC<MilestoneDialogProps> = ({ isOpen, onClose, milestone }) => {

    useEffect(() => {
        if (isOpen) {
            // Trigger confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!milestone) return null;

    const Icon = () => {
        switch (milestone.icon) {
            case 'trophy': return <Trophy className="h-24 w-24 text-yellow-500 animate-bounce" />;
            case 'star': return <Star className="h-24 w-24 text-yellow-400 animate-spin-slow" />;
            case 'award': return <Award className="h-24 w-24 text-gray-800 animate-pulse" />;
            case 'zap': return <Zap className="h-24 w-24 text-orange-500 animate-ping-slow" />;
            default: return <PartyPopper className="h-24 w-24 text-purple-500" />;
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] text-center flex flex-col items-center justify-center border-yellow-500/50 bg-gradient-to-b from-background to-yellow-500/10">
                <DialogHeader className="flex flex-col items-center space-y-4">
                    <div className="p-6 rounded-full bg-secondary/50 shadow-xl border-4 border-yellow-500/20">
                        <Icon />
                    </div>
                    <DialogTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500">
                        {milestone.title}
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                        {milestone.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="my-6 p-4 rounded-lg bg-secondary/80 w-full flex flex-col items-center border border-primary/20">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Reward Unlocked</span>
                    <span className="text-xl font-bold flex items-center gap-2">
                        {milestone.reward}
                    </span>
                </div>

                <DialogFooter className="w-full">
                    <Button onClick={onClose} className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-6">
                        Claim Reward
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
