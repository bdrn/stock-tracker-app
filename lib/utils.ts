import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDateRange(days: number): { from: number; to: number } {
  const now = Date.now()
  const daysAgo = now - days * 24 * 60 * 60 * 1000
  return {
    from: Math.floor(daysAgo / 1000),
    to: Math.floor(now / 1000),
  }
}

export function validateArticle(article: RawNewsArticle): boolean {
  return !!(
    article.id &&
    article.headline &&
    article.url &&
    article.datetime &&
    article.summary
  )
}

export function formatArticle(
  article: RawNewsArticle,
  isCompanyNews: boolean = false,
  symbol?: string,
  index?: number
): MarketNewsArticle {
  return {
    id: article.id!,
    headline: article.headline!,
    summary: article.summary || "",
    source: article.source || "Unknown",
    url: article.url!,
    datetime: article.datetime!,
    category: article.category || (isCompanyNews ? "company" : "general"),
    related: symbol || article.related || "",
    image: article.image,
  }
}
