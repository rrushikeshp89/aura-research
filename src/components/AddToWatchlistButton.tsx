import { Button } from "@/components/ui/button";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import type { ResearchReport } from "@/types/research";

interface AddToWatchlistButtonProps {
    report: ResearchReport;
    isInWatchlist: boolean;
    onAdd: (report: ResearchReport) => void;
}

export function AddToWatchlistButton({ report, isInWatchlist, onAdd }: AddToWatchlistButtonProps) {
    return (
        <Button
            variant={isInWatchlist ? "secondary" : "default"}
            size="sm"
            className="gap-2"
            onClick={() => !isInWatchlist && onAdd(report)}
            disabled={isInWatchlist}
        >
            {isInWatchlist ? (
                <>
                    <BookmarkCheck className="h-4 w-4" />
                    In Watchlist
                </>
            ) : (
                <>
                    <BookmarkPlus className="h-4 w-4" />
                    Add to Watchlist
                </>
            )}
        </Button>
    );
}
