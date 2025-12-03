import SearchCommand from "@/components/SearchCommand";

export default function SearchPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-100 mb-4">Search Stocks</h1>
        <p className="text-gray-400 mb-6">
          Use the search below or press <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Cmd+K</kbd> (Mac) or <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Ctrl+K</kbd> (Windows) to quickly search for stocks.
        </p>
        <SearchCommand renderAs="button" label="Open Search" initialStocks={[]} />
      </div>
    </div>
  );
}

