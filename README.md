# Finnhub MCP Server

A remote MCP (Model Context Protocol) server for [Finnhub](https://finnhub.io/) financial data, deployed on Cloudflare Workers.

## Setup

```bash
npm install
```

Create `.dev.vars`:
```
FINNHUB_API_KEY=your_api_key_here
```

## Development

```bash
npm run dev
```

## Deploy

```bash
npx wrangler secret put FINNHUB_API_KEY
npx wrangler deploy
```

## MCP Endpoint

`https://finnhub-mcp.<your-subdomain>.workers.dev/mcp`

## Available Tools

| Tool | Description |
|------|-------------|
| `stock_quote` | Real-time stock price, change, high/low |
| `company_profile` | Company name, industry, market cap, IPO date |
| `symbol_search` | Search for stock symbols by name |
| `company_news` | Recent news articles for a company |
| `market_news` | General/forex/crypto/merger market news |
| `basic_financials` | P/E, 52-week range, EPS, dividends |
| `company_peers` | Similar companies in the same industry |
| `company_earnings` | Historical EPS actual vs estimate |
| `earnings_calendar` | Upcoming earnings releases |
| `stock_candles` | Historical OHLCV candlestick data |
| `market_status` | Exchange open/closed status |
| `recommendation_trends` | Analyst buy/hold/sell recommendations |
| `insider_transactions` | Executive and board member trades |
| `forex_rates` | Currency exchange rates |
