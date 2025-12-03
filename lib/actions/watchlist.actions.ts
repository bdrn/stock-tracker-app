"use server";

import { connectToDatabase } from "@/app/database/mongoose";
import { Watchlist } from "@/app/database/models/watchlist.model";

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
