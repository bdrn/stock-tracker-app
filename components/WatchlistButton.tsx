"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import {
  addStockToWatchlist,
  removeStockFromWatchlist,
} from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";

export default function WatchlistButton({
  symbol,
  company,
  isInWatchlist: initialIsInWatchlist,
  showTrashIcon = false,
  type = "button",
  onWatchlistChange,
}: WatchlistButtonProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        if (isInWatchlist) {
          const result = await removeStockFromWatchlist(symbol);
          if (result.success) {
            setIsInWatchlist(false);
            onWatchlistChange?.(symbol, false);
            toast.success("Removed from watchlist");
          } else {
            toast.error(result.error || "Failed to remove from watchlist");
          }
        } else {
          const result = await addStockToWatchlist(symbol, company);
          if (result.success) {
            setIsInWatchlist(true);
            onWatchlistChange?.(symbol, true);
            toast.success("Added to watchlist");
          } else {
            toast.error(result.error || "Failed to add to watchlist");
          }
        }
      } catch (error) {
        console.error("Error toggling watchlist:", error);
        toast.error("An error occurred");
      }
    });
  };

  if (type === "icon") {
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`watchlist-icon-btn ${isInWatchlist ? "watchlist-icon-added" : ""}`}
        aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        <div className="watchlist-icon">
          {showTrashIcon && isInWatchlist ? (
            <Trash2 className="trash-icon" />
          ) : (
            <Star className={`star-icon ${isInWatchlist ? "fill-yellow-500 text-yellow-500" : ""}`} />
          )}
        </div>
      </button>
    );
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      className={`watchlist-btn ${isInWatchlist && showTrashIcon ? "watchlist-remove" : ""}`}
    >
      {isPending
        ? "Loading..."
        : isInWatchlist
        ? showTrashIcon
          ? "Remove from Watchlist"
          : "In Watchlist"
        : "Add to Watchlist"}
    </Button>
  );
}


