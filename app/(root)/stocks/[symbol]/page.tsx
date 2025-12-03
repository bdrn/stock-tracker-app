import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";
import { getCompanyProfile } from "@/lib/actions/finnhub.actions";
import { isStockInWatchlist } from "@/lib/actions/watchlist.actions";
import { notFound } from "next/navigation";

async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  const [companyProfile, isInWatchlist] = await Promise.all([
    getCompanyProfile(upperSymbol),
    isStockInWatchlist(upperSymbol),
  ]);

  if (!companyProfile) {
    notFound();
  }

  const companyName = companyProfile.name;
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <TradingViewWidget
          scriptUrl={`${scriptUrl}ticker.js`}
          config={SYMBOL_INFO_WIDGET_CONFIG(upperSymbol)}
          height={170}
        />
        <TradingViewWidget
          scriptUrl={`${scriptUrl}advanced-chart.js`}
          config={CANDLE_CHART_WIDGET_CONFIG(upperSymbol)}
          height={600}
        />
        <TradingViewWidget
          scriptUrl={`${scriptUrl}advanced-chart.js`}
          config={BASELINE_WIDGET_CONFIG(upperSymbol)}
          height={600}
        />
      </div>
      <div className="space-y-6">
        <WatchlistButton
          symbol={upperSymbol}
          company={companyName}
          isInWatchlist={isInWatchlist}
        />
        <TradingViewWidget
          scriptUrl={`${scriptUrl}technical-analysis.js`}
          config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(upperSymbol)}
          height={400}
        />
        <TradingViewWidget
          scriptUrl={`${scriptUrl}symbol-profile.js`}
          config={COMPANY_PROFILE_WIDGET_CONFIG(upperSymbol)}
          height={440}
        />
        <TradingViewWidget
          scriptUrl={`${scriptUrl}financials.js`}
          config={COMPANY_FINANCIALS_WIDGET_CONFIG(upperSymbol)}
          height={464}
        />
      </div>
    </div>
  );
}

export default StockDetails;


