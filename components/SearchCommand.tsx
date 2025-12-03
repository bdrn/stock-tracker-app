"use client";

import { useEffect, useState, useRef } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp } from "lucide-react";
import { searchStocks } from "@/lib/actions/finnhub.actions";

export default function SearchCommand({
  renderAs = "button",
  label = "Add stock",
  initialStocks = [],
}: SearchCommandProps) {
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
        setPopularStocks(initialStocks);
        initialStocksLoaded.current = true;
        return;
      }

      setLoading(true);
      try {
        const fetchedStocks = await searchStocks();
        setPopularStocks(fetchedStocks || []);
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
        setSearchResults(results || []);
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

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setSearchResults([]);
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
                      handleSelectStock();
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
                    {/*<Star />*/}
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
