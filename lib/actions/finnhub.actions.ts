"use server";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

async function fetchJSON(
  url: string,
  revalidateSeconds?: number
): Promise<unknown> {
  const fetchOptions: RequestInit & {
    next?: { revalidate?: number };
    cache?: RequestCache;
  } = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (revalidateSeconds) {
    fetchOptions.next = {
      revalidate: revalidateSeconds,
    };
    fetchOptions.cache = "force-cache";
  } else {
    fetchOptions.cache = "no-store";
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

function isValidArticle(article: RawNewsArticle): boolean {
  return !!(
    article.id &&
    article.headline &&
    article.url &&
    article.datetime &&
    article.summary
  );
}

function formatArticle(article: RawNewsArticle): MarketNewsArticle {
  return {
    id: article.id!,
    headline: article.headline!,
    summary: article.summary || "",
    source: article.source || "Unknown",
    url: article.url!,
    datetime: article.datetime!,
    category: article.category || "general",
    related: article.related || "",
    image: article.image,
  };
}

export async function getNews(
  symbols?: string[]
): Promise<MarketNewsArticle[]> {
  try {
    if (!NEXT_PUBLIC_FINNHUB_API_KEY) {
      throw new Error("NEXT_PUBLIC_FINNHUB_API_KEY is not defined");
    }

    // Compute date range for last 5 days
    const now = Date.now();
    const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;
    const fromDate = Math.floor(fiveDaysAgo / 1000);
    const toDate = Math.floor(now / 1000);

    if (symbols && symbols.length > 0) {
      // Clean and uppercase symbols
      const cleanedSymbols = symbols
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0);

      if (cleanedSymbols.length === 0) {
        return [];
      }

      const articles: MarketNewsArticle[] = [];
      const seenIds = new Set<number>();
      const seenUrls = new Set<string>();
      const seenHeadlines = new Set<string>();

      // Round-robin through symbols, max 6 times
      const maxRounds = 6;
      let round = 0;

      while (articles.length < maxRounds && round < maxRounds) {
        const symbolIndex = round % cleanedSymbols.length;
        const symbol = cleanedSymbols[symbolIndex];

        try {
          const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
          const response = (await fetchJSON(url)) as RawNewsArticle[];

          if (Array.isArray(response) && response.length > 0) {
            // Find one valid article per round that we haven't seen
            for (const article of response) {
              if (!isValidArticle(article)) continue;

              const articleId = article.id!;
              const articleUrl = article.url!;
              const articleHeadline = article.headline!.toLowerCase();

              // Deduplicate by id, url, or headline
              if (
                seenIds.has(articleId) ||
                seenUrls.has(articleUrl) ||
                seenHeadlines.has(articleHeadline)
              ) {
                continue;
              }

              seenIds.add(articleId);
              seenUrls.add(articleUrl);
              seenHeadlines.add(articleHeadline);

              articles.push(formatArticle(article));
              break; // Take one valid article per round
            }
          }
        } catch (error) {
          console.error(`Error fetching news for symbol ${symbol}:`, error);
        }

        round++;
      }

      // Sort by datetime (newest first)
      return articles.sort((a, b) => b.datetime - a.datetime);
    } else {
      // No symbols - fetch general market news
      const url = `${FINNHUB_BASE_URL}/news?category=general&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
      const response = (await fetchJSON(url)) as RawNewsArticle[];

      if (!Array.isArray(response)) {
        return [];
      }

      const seenIds = new Set<number>();
      const seenUrls = new Set<string>();
      const seenHeadlines = new Set<string>();

      const validArticles: MarketNewsArticle[] = [];

      for (const article of response) {
        if (!isValidArticle(article)) continue;

        const articleId = article.id!;
        const articleUrl = article.url!;
        const articleHeadline = article.headline!.toLowerCase();

        // Deduplicate by id, url, or headline
        if (
          seenIds.has(articleId) ||
          seenUrls.has(articleUrl) ||
          seenHeadlines.has(articleHeadline)
        ) {
          continue;
        }

        seenIds.add(articleId);
        seenUrls.add(articleUrl);
        seenHeadlines.add(articleHeadline);

        validArticles.push(formatArticle(article));

        // Take top 6
        if (validArticles.length >= 6) {
          break;
        }
      }

      return validArticles;
    }
  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error("Failed to fetch news");
  }
}
