import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

// Fallback date formatter if date-fns not avail
const formatDate = (date: Date | string) => {
    if (!date) return "-";
    try {
        return format(new Date(date), 'PP');
    } catch (e) {
        const d = new Date(date);
        return d.toLocaleDateString();
    }
};

interface Trade {
    id: string; // or _id
    date: string | Date;
    market?: string;
    pair?: string;
    type: "profit" | "loss";
    amount: number;
    strategy?: string;
    target?: string;
    notes?: string;
}

interface TradeTableProps {
    trades: Trade[];
    onDelete: (id: string) => void;
    onEdit?: (trade: Trade) => void;
}

export function TradeTable({ trades, onDelete, onEdit }: TradeTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableCaption>A list of your recent trades.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Date</TableHead>
                        <TableHead>Market</TableHead>
                        <TableHead>Pair</TableHead>
                        <TableHead>Strategy</TableHead>
                        <TableHead>Target (TP)</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {trades.map((trade) => (
                        <TableRow key={trade.id}>
                            <TableCell className="font-medium whitespace-nowrap">{formatDate(trade.date)}</TableCell>
                            <TableCell className="capitalize whitespace-nowrap">{trade.market || "-"}</TableCell>
                            <TableCell className="whitespace-nowrap">{trade.pair || "-"}</TableCell>
                            <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">{trade.strategy || "Unknown"}</TableCell>
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{trade.target || "-"}</TableCell>
                            <TableCell>
                                <Badge variant={trade.type === 'profit' ? 'default' : 'destructive'}
                                    className={trade.type === 'profit' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {trade.type.toUpperCase()}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold whitespace-nowrap">
                                ${Number(trade.amount).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right max-w-[200px] truncate" title={trade.notes}>
                                {trade.notes || "-"}
                            </TableCell>
                            <TableCell className="text-right flex justify-end gap-2">
                                {onEdit && (
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(trade)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => onDelete(trade.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
