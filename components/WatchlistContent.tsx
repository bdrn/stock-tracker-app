"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WatchlistButton from "@/components/WatchlistButton";
import Link from "next/link";

export default function WatchlistContent({
  initialWatchlist,
}: {
  initialWatchlist: StockWithData[];
}) {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState(initialWatchlist);

  const handleWatchlistChange = (symbol: string, isAdded: boolean) => {
    if (!isAdded) {
      setWatchlist((prev) => prev.filter((stock) => stock.symbol !== symbol));
      router.refresh();
    }
  };

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">Your Watchlist</h1>
        <p className="text-gray-400 mb-8">
          Your watchlist is empty. Start adding stocks to track them!
        </p>
        <p className="text-sm text-gray-500">
          Use the search function (Cmd/Ctrl + K) to find and add stocks to your
          watchlist.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Your Watchlist</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                Company
              </th>
              <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                Symbol
              </th>
              <th className="text-right py-4 px-4 text-gray-300 font-semibold">
                Price
              </th>
              <th className="text-right py-4 px-4 text-gray-300 font-semibold">
                Change
              </th>
              <th className="text-right py-4 px-4 text-gray-300 font-semibold">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map((stock) => (
              <tr
                key={stock.symbol}
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <Link
                    href={`/stocks/${stock.symbol}`}
                    className="text-gray-100 hover:text-yellow-500 transition-colors font-medium"
                  >
                    {stock.company}
                  </Link>
                </td>
                <td className="py-4 px-4">
                  <Link
                    href={`/stocks/${stock.symbol}`}
                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    {stock.symbol}
                  </Link>
                </td>
                <td className="py-4 px-4 text-right text-gray-100">
                  {stock.priceFormatted || "N/A"}
                </td>
                <td
                  className={`py-4 px-4 text-right font-medium ${
                    stock.changePercent !== undefined
                      ? stock.changePercent >= 0
                        ? "text-green-500"
                        : "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {stock.changeFormatted || "N/A"}
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <WatchlistButton
                      symbol={stock.symbol}
                      company={stock.company}
                      isInWatchlist={true}
                      showTrashIcon={true}
                      type="icon"
                      onWatchlistChange={handleWatchlistChange}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

