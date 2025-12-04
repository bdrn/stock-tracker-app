# Signalist - Stock Tracker App

A stock market tracking application built with Next.js 15, featuring real-time stock data, advanced charting, personalized news summaries, and watchlist management.

![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-6.20.0-47A248?style=for-the-badge&logo=mongodb)

## Features

### 📊 Real-Time Stock Data & Charts

- **Market Overview**: Interactive charts for major stock indices and sectors
- **Stock Heatmap**: Visual representation of market performance
- **Advanced Charts**: TradingView-powered candlestick charts, baseline charts, and technical analysis
- **Company Profiles**: Detailed company information and financial metrics

### 🔍 Stock Search & Discovery

- **Fast Search**: Real-time stock search with debounced queries
- **Popular Stocks**: Pre-loaded list of popular stocks for quick access
- **Keyboard Shortcuts**: Press `Cmd/Ctrl + K` to open search dialog
- **Watchlist Integration**: See which stocks are already in your watchlist

### ⭐ Watchlist Management

- **Star Stocks**: Add stocks to your watchlist with a single click
- **Watchlist Page**: View all your tracked stocks with real-time prices
- **Price Updates**: See current prices and daily change percentages
- **Quick Navigation**: Click any stock to view detailed information

### 📰 Personalized News

- **Daily News Summary**: AI-powered email summaries of market news
- **Company-Specific News**: Get news relevant to your watchlist
- **Smart Filtering**: News curated based on your investment preferences

### 🔐 User Authentication

- **Secure Sign Up/Sign In**: Built with Better Auth
- **Personalized Experience**: Custom onboarding based on investment goals
- **Welcome Emails**: AI-generated personalized welcome messages

### 📧 Email Notifications

- **Welcome Emails**: Personalized introduction to the platform
- **Daily News Digest**: Automated daily summaries at 12:00 PM
- **Watchlist News**: News specific to stocks in your watchlist

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - High-quality component library
- **Lucide React** - Icon library
- **TradingView Widgets** - Professional stock charts

### Backend & Services

- **Next.js Server Actions** - Server-side API handlers
- **Better Auth** - Authentication solution
- **MongoDB** - Database with Mongoose ODM
- **Inngest** - Background job processing
- **Nodemailer** - Email sending

### APIs & Integrations

- **Finnhub API** - Stock market data and news
- **Google Gemini AI** - AI-powered content generation
- **TradingView** - Charting widgets

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm/yarn/pnpm
- **MongoDB** database (local or cloud instance like MongoDB Atlas)
- API keys for:
  - **Finnhub** - [Get your API key](https://finnhub.io/)
  - **Google Gemini** - [Get your API key](https://ai.google.dev/)
  - **Inngest** - [Get your API key](https://www.inngest.com/)
  - Gmail account for email sending

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd stock-tracker-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory (see Environment Variables section below)

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000

# Stock Market API
FINNHUB_API_KEY=your_finnhub_api_key
# OR
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key

# Email Configuration (Gmail)
NODEMAILER_EMAIL=your_gmail_address
NODEMAILER_PASSWORD=your_gmail_app_password

# AI Services
GEMINI_API_KEY=your_google_gemini_api_key

# Inngest (for background jobs)
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

### Getting API Keys

1. **Finnhub API Key**

   - Sign up at [finnhub.io](https://finnhub.io/)
   - Get your free API key from the dashboard

2. **Google Gemini API Key**

   - Visit [Google AI Studio](https://ai.google.dev/)
   - Create a new API key

3. **MongoDB Connection String**

   - Use MongoDB Atlas or local MongoDB
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

4. **Gmail App Password**

   - Enable 2FA on your Google account
   - Generate an app password at [Google Account Settings](https://myaccount.google.com/apppasswords)

5. **Inngest Keys**
   - Sign up at [inngest.com](https://www.inngest.com/)
   - Get your keys from the dashboard

## Project Structure

```
stock-tracker-app/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (root)/              # Protected pages
│   │   ├── page.tsx         # Dashboard
│   │   ├── watchlist/       # Watchlist page
│   │   ├── stocks/          # Stock detail pages
│   │   │   └── [symbol]/
│   │   └── search/
│   ├── api/
│   │   └── inngest/         # Inngest webhook endpoint
│   ├── database/
│   │   ├── models/          # Mongoose models
│   │   └── mongoose.ts      # Database connection
│   └── types/
│       └── global.d.ts      # TypeScript global types
├── components/
│   ├── forms/               # Form components
│   ├── ui/                  # ShadCN UI components
│   ├── Header.tsx
│   ├── NavItems.tsx
│   ├── SearchCommand.tsx    # Stock search component
│   ├── WatchlistButton.tsx
│   ├── WatchlistContent.tsx
│   └── TradingViewWidget.tsx
├── lib/
│   ├── actions/             # Server actions
│   │   ├── auth.actions.ts
│   │   ├── finnhub.actions.ts
│   │   ├── user.actions.ts
│   │   └── watchlist.actions.ts
│   ├── better-auth/         # Auth configuration
│   ├── inngest/             # Background job functions
│   ├── nodemailer/          # Email templates & sending
│   ├── constants.ts         # App constants
│   └── utils.ts             # Utility functions
└── middleware/              # Next.js middleware
```

## Key Features Explained

### Stock Search (`Cmd/Ctrl + K`)

- Fast, debounced search with real-time results
- Displays popular stocks when dialog opens
- Shows watchlist status for each stock
- Click stock name to view details, click star to add to watchlist

### Watchlist

- Star stocks directly from search results
- View all starred stocks with real-time prices
- Remove stocks with a single click
- Click any stock to view detailed charts and analysis

### Stock Details Page

- **Left Column**: Symbol info, candlestick charts, baseline charts
- **Right Column**: Watchlist button, technical analysis, company profile, financials
- All powered by TradingView widgets

### Daily News Summary

- Automatically sent at 12:00 PM daily
- AI-powered summaries using Google Gemini
- Includes news relevant to your watchlist
- Personalized based on your investment preferences

### Welcome Emails

- AI-generated personalized introductions
- Includes your investment profile details
- Sent automatically on sign-up via Inngest

## API Integration

### Finnhub API

- **Search**: Find stocks by symbol or company name
- **Quotes**: Get real-time stock prices
- **Company Profile**: Fetch company information
- **News**: Get market and company-specific news

### TradingView Widgets

- Market overview charts
- Stock heatmaps
- Candlestick charts
- Technical analysis indicators
- Company profiles

## Development

### Available Scripts

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Code Style

- Uses ESLint for code quality
- TypeScript for type safety
- Server Components by default (Client Components when needed)

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:

- `MONGODB_URI`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (your production URL)
- `FINNHUB_API_KEY`
- `GEMINI_API_KEY`
- `NODEMAILER_EMAIL`
- `NODEMAILER_PASSWORD`
- Inngest keys

### Inngest Setup

1. Add your Inngest signing key to environment variables
2. Configure the webhook endpoint: `/api/inngest`
3. Enable the functions in Inngest dashboard
