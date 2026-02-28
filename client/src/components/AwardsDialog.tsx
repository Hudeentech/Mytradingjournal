import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Star, Award, Zap, Lock, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

interface AwardsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    unlockedMilestones: string[];
}

const ALL_MILESTONES = [
    {
        id: 'first_trade',
        title: "First Steps Taken!",
        description: "Log your first trade.",
        icon: 'star',
        reward: "🌱 Novice Badge"
    },
    {
        id: 'streak_3',
        title: "On Fire!",
        description: "Maintain a 3-day winning streak.",
        icon: 'zap',
        reward: "🔥 Streak Warrior"
    },
    {
        id: 'trades_10',
        title: "Getting Serious",
        description: "Log 10 trades in your journal.",
        icon: 'award',
        reward: "📊 Data Collector"
    },
    {
        id: 'profit_1k',
        title: "Profitable Trader",
        description: "Achieve $1,000 in net profit.",
        icon: 'trophy',
        reward: "💰 1K Club"
    },
    {
        id: 'streak_7',
        title: "Unstoppable",
        description: "Maintain a 7-day winning streak.",
        icon: 'zap',
        reward: "⚡ Godlike Streak"
    },
    {
        id: 'profit_10k',
        title: "High Roller",
        description: "Achieve $10,000 in net profit.",
        icon: 'trophy',
        reward: "💎 Diamond Hands"
    }
];

export const AwardsDialog: React.FC<AwardsDialogProps> = ({ isOpen, onClose, unlockedMilestones }) => {

    const getIcon = (iconName: string, isUnlocked: boolean) => {
        const className = cn("h-8 w-8", isUnlocked ? "text-yellow-500" : "text-muted-foreground");
        switch (iconName) {
            case 'trophy': return <Trophy className={className} />;
            case 'star': return <Star className={className} />;
            case 'award': return <Award className={className} />;
            case 'zap': return <Zap className={className} />;
            default: return <PartyPopper className={className} />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        Achievements & Awards
                    </DialogTitle>
                    <DialogDescription>
                        Track your milestones and unlock exclusive badges.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4 mt-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ALL_MILESTONES.map((milestone) => {
                            const isUnlocked = unlockedMilestones.includes(milestone.id);

                            return (
                                <div
                                    key={milestone.id}
                                    className={cn(
                                        "relative p-4 rounded-xl border flex flex-col gap-3 transition-all",
                                        isUnlocked
                                            ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                                            : "bg-muted/40 border-border grayscale opacity-70"
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className={cn("p-2 rounded-full", isUnlocked ? "bg-yellow-500/20" : "bg-muted")}>
                                            {getIcon(milestone.icon, isUnlocked)}
                                        </div>
                                        {isUnlocked ? (
                                            <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-500/20 text-green-500">Unlocked</span>
                                        ) : (
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-sm">{milestone.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                                    </div>

                                    {isUnlocked && (
                                        <div className="mt-auto pt-2 text-xs font-semibold text-orange-500 flex items-center gap-1">
                                            <span>Reward:</span> {milestone.reward}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground pt-4 border-t">
                    <p>{unlockedMilestones.length} of {ALL_MILESTONES.length} Unlocked</p>
                    <div className="h-2 w-32 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-yellow-500"
                            style={{ width: `${(unlockedMilestones.length / ALL_MILESTONES.length) * 100}%` }}
                        />
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};
