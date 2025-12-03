import { getUserWatchlist } from "@/lib/actions/watchlist.actions";
import WatchlistContent from "@/components/WatchlistContent";

async function WatchlistPage() {
  const watchlist = await getUserWatchlist();

  return <WatchlistContent initialWatchlist={watchlist} />;
}

export default WatchlistPage;

