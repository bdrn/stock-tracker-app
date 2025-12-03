"use server";

import { connectToDatabase } from "@/app/database/mongoose";
import { Watchlist } from "@/app/database/models/watchlist.model";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";

export const getWatchlistSymbolsByEmail = async (
  email: string
): Promise<string[]> => {
  try {
    await connectToDatabase();

    const mongoose = await import("mongoose");
    const db = mongoose.default.connection.db;
    if (!db) throw new Error("MongoDB connection not established");

    const user = await db.collection("user").findOne({ email });

    if (!user) {
      return [];
    }

    const userId = user.id || user._id?.toString();
    if (!userId) {
      return [];
    }

    const watchlistItems = await Watchlist.find({ userId }, { symbol: 1 })
      .lean()
      .exec();

    return watchlistItems.map((item) => item.symbol);
  } catch (e) {
    console.error("Error getting watchlist symbols by email", e);
    return [];
  }
};

export const isStockInWatchlist = async (
  symbol: string
): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return false;
    }

    await connectToDatabase();
    const watchlistItem = await Watchlist.findOne({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
    })
      .lean()
      .exec();

    return !!watchlistItem;
  } catch (e) {
    console.error("Error checking if stock is in watchlist", e);
    return false;
  }
};

export const addStockToWatchlist = async (
  symbol: string,
  company: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    await connectToDatabase();

    await Watchlist.create({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
      company: company.trim(),
      addedAt: new Date(),
    });

    return { success: true };
  } catch (e: unknown) {
    const error = e as { code?: number; message?: string };
    if (error.code === 11000) {
      return { success: false, error: "Stock already in watchlist" };
    }
    console.error("Error adding stock to watchlist", e);
    return { success: false, error: "Failed to add stock to watchlist" };
  }
};

export const removeStockFromWatchlist = async (
  symbol: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    await connectToDatabase();

    await Watchlist.deleteOne({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
    });

    return { success: true };
  } catch (e) {
    console.error("Error removing stock from watchlist", e);
    return { success: false, error: "Failed to remove stock from watchlist" };
  }
};

export const getUserWatchlist = async (): Promise<StockWithData[]> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return [];
    }

    await connectToDatabase();

    const watchlistItems = await Watchlist.find({ userId: session.user.id })
      .lean()
      .exec();

    if (watchlistItems.length === 0) {
      return [];
    }

    const { getQuote } = await import("@/lib/actions/finnhub.actions");

    const watchlistWithData = await Promise.all(
      watchlistItems.map(async (item) => {
        const quote = await getQuote(item.symbol);
        const currentPrice = quote?.c;
        const changePercent = quote?.dp;

        return {
          userId: item.userId,
          symbol: item.symbol,
          company: item.company,
          addedAt: item.addedAt,
          currentPrice: currentPrice || undefined,
          changePercent: changePercent || undefined,
          priceFormatted: currentPrice
            ? `$${currentPrice.toFixed(2)}`
            : undefined,
          changeFormatted: changePercent
            ? `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`
            : undefined,
        };
      })
    );

    return watchlistWithData;
  } catch (e) {
    console.error("Error getting user watchlist", e);
    return [];
  }
};
