import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/app/database/mongoose";
import { nextCookies } from "better-auth/next-js";

let authInstance: ReturnType<typeof betterAuth> | null = null;

export const getAuth = async () => {
  if (authInstance) return authInstance;

  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;

  if (!db) throw new Error("MongoDB connection not established");

  authInstance = betterAuth({
    database: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
    },
    plugins: [nextCookies()],
  });

  return authInstance;
};

// Lazy-loaded auth object to avoid top-level await
export const auth = {
  api: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSession: async (args: any) => {
      return (await getAuth()).api.getSession(args);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signUpEmail: async (args: any) => {
      return (await getAuth()).api.signUpEmail(args);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signInEmail: async (args: any) => {
      return (await getAuth()).api.signInEmail(args);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signOut: async (args: any) => {
      return (await getAuth()).api.signOut(args);
    },
  },
};
