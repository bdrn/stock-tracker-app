"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Star } from "lucide-react";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import {
  addStockToWatchlist,
  removeStockFromWatchlist,
  isStockInWatchlist,
} from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";

export default function SearchCommand({
  renderAs = "button",
  label = "Add stock",
  initialStocks = [],
}: SearchCommandProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [popularStocks, setPopularStocks] = useState<
    StockWithWatchlistStatus[]
  >(initialStocks || []);
  const [searchResults, setSearchResults] = useState<
    StockWithWatchlistStatus[]
  >([]);
  const initialStocksLoaded = useRef(false);

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode
    ? searchResults
    : popularStocks?.slice(0, 10);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      initialStocksLoaded.current = false;
      return;
    }

    if (initialStocksLoaded.current) return;

    const loadInitialStocks = async () => {
      if (initialStocks && initialStocks.length > 0) {
        const stocksWithStatus = await checkWatchlistStatus(initialStocks);
        setPopularStocks(stocksWithStatus);
        initialStocksLoaded.current = true;
        return;
      }

      setLoading(true);
      try {
        const fetchedStocks = await searchStocks();
        const stocksWithStatus = await checkWatchlistStatus(
          fetchedStocks || []
        );
        setPopularStocks(stocksWithStatus);
        initialStocksLoaded.current = true;
      } catch (error) {
        console.error("Error loading initial stocks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialStocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const handleSearch = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        console.log("Searching for:", searchTerm.trim());
        const results = await searchStocks(searchTerm.trim());
        console.log("Search results received:", results);
        const stocksWithStatus = await checkWatchlistStatus(results || []);
        setSearchResults(stocksWithStatus);
      } catch (error) {
        console.error("Error searching stocks:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelectStock = (symbol: string) => {
    setOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    router.push(`/stocks/${symbol}`);
  };

  const handleToggleWatchlist = async (
    e: React.MouseEvent,
    stock: StockWithWatchlistStatus
  ) => {
    e.stopPropagation();

    try {
      if (stock.isInWatchlist) {
        const result = await removeStockFromWatchlist(stock.symbol);
        if (result.success) {
          toast.success(`${stock.name} removed from watchlist`);
          updateWatchlistStatus(stock.symbol, false);
        } else {
          toast.error(result.error || "Failed to remove from watchlist");
        }
      } else {
        const result = await addStockToWatchlist(stock.symbol, stock.name);
        if (result.success) {
          toast.success(`${stock.name} added to watchlist`);
          updateWatchlistStatus(stock.symbol, true);
        } else {
          toast.error(result.error || "Failed to add to watchlist");
        }
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      toast.error("An error occurred");
    }
  };

  const updateWatchlistStatus = (symbol: string, isInWatchlist: boolean) => {
    setPopularStocks((prev) =>
      prev.map((stock) =>
        stock.symbol === symbol ? { ...stock, isInWatchlist } : stock
      )
    );
    setSearchResults((prev) =>
      prev.map((stock) =>
        stock.symbol === symbol ? { ...stock, isInWatchlist } : stock
      )
    );
  };

  const checkWatchlistStatus = async (stocks: StockWithWatchlistStatus[]) => {
    const statusChecks = await Promise.all(
      stocks.map(async (stock) => {
        const isInWatchlist = await isStockInWatchlist(stock.symbol);
        return { ...stock, isInWatchlist };
      })
    );
    return statusChecks;
  };

  return (
    <>
      {renderAs === "hidden" ? null : renderAs === "text" ? (
        <span onClick={() => setOpen(true)} className="search-text">
          {label}
        </span>
      ) : (
        <Button onClick={() => setOpen(true)} className="search-btn">
          {label}
        </Button>
      )}
      <CommandDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setSearchTerm("");
            setSearchResults([]);
          }
        }}
        className="search-dialog"
      >
        <div className="search-field">
          <CommandInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search stocks..."
            className="search-input"
          />
          {loading && <Loader2 className="search-loader" />}
        </div>
        <CommandList className="search-list">
          {loading ? (
            <CommandEmpty className="search-list-empty">
              Loading stocks...
            </CommandEmpty>
          ) : displayStocks?.length === 0 ? (
            <div className="search-list-indicator">
              {isSearchMode ? "No results found" : "No stocks available"}
            </div>
          ) : (
            <ul>
              <div className="search-count">
                {isSearchMode ? "Search results" : "Popular stocks"}
                {` `}({displayStocks?.length || 0})
              </div>
              {displayStocks?.map((stock) => (
                <li key={stock.symbol} className="search-item">
                  <div
                    onClick={() => {
                      console.log(`Selected stock: ${stock.symbol}`);
                      handleSelectStock(stock.symbol);
                    }}
                    className="search-item-link cursor-pointer"
                  >
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <div className="search-item-name">{stock.name}</div>
                      <div className="text-sm text-gray-500">
                        {stock.symbol} | {stock.exchange} | {stock.type}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleToggleWatchlist(e, stock)}
                      className={`ml-2 p-1 rounded hover:bg-gray-800 transition-colors ${
                        stock.isInWatchlist
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-500"
                      }`}
                      aria-label={
                        stock.isInWatchlist
                          ? "Remove from watchlist"
                          : "Add to watchlist"
                      }
                    >
                      <Star
                        className={`h-4 w-4 ${
                          stock.isInWatchlist ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
