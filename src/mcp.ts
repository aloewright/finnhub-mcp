import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FinnhubClient } from "./finnhub-client";

interface Env {
  FINNHUB_API_KEY: string;
  FINNHUB_MCP: DurableObjectNamespace;
}

export class FinnhubMCP extends McpAgent<Env, {}, {}> {
  server = new McpServer({
    name: "finnhub",
    version: "1.0.0",
  });

  private get client(): FinnhubClient {
    return new FinnhubClient(this.env.FINNHUB_API_KEY);
  }

  async init() {
    this.server.tool(
      "stock_quote",
      "Get real-time stock quote with current price, change, high, low, open, and previous close.",
      { symbol: z.string().describe("Stock ticker symbol (e.g. AAPL, TSLA, MSFT)") },
      async ({ symbol }) => {
        try {
          const quote = await this.client.quote(symbol.toUpperCase());
          return { content: [{ type: "text" as const, text: JSON.stringify({ symbol: symbol.toUpperCase(), currentPrice: quote.c, change: quote.d, changePercent: quote.dp, dayHigh: quote.h, dayLow: quote.l, open: quote.o, previousClose: quote.pc }, null, 2) }] };
        } catch (e) { return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true }; }
      }
    );

    this.server.tool("company_profile", "Get company profile including name, industry, market cap, IPO date, logo, and website.", { symbol: z.string().describe("Stock ticker symbol") },
      async ({ symbol }) => {
        try { const profile = await this.client.companyProfile(symbol.toUpperCase()); return { content: [{ type: "text" as const, text: JSON.stringify(profile, null, 2) }] };
        } catch (e) { return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true }; }
      }
    );

    this.server.tool("symbol_search", "Search for stock symbols by company name or keyword. Returns matching ticker symbols.", { query: z.string().describe("Search query (company name or keyword)") },
      async ({ query }) => {
        try { const results = await this.client.symbolSearch(query); return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
        } catch (e) { return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true }; }
      }
    );

    this.server.tool("company_news", "Get recent news articles for a specific company. Returns headlines, summaries, sources, and URLs.", { symbol: z.string().describe("Stock ticker symbol"), from: z.string().describe("Start date in YYYY-MM-DD format"), to: z.string().describe("End date in YYYY-MM-DD format") },
      async ({ symbol, from, to }) => {
        try { const news = await this.client.companyNews(symbol.toUpperCase(), from, to); return { content: [{ type: "text" as const, text: JSON.stringify(news.slice(0, 10), null, 2) }] };
        } catch (e) { return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true }; }
      }
    );

    this.server.tool("market_news", "Get latest market news. Categories: general, forex, crypto, merger.", { category: z.enum(["general", "forex", "crypto", "merger"]).default("general").describe("News category") },
      async ({ category }) => {
        try { const news = await this.client.marketNews(category); return { content: [{ type: "text" as const, text: JSON.stringify(news.slice(0, 10), null, 2) }] };
        } catch (e) { return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true }; }
      }
    );

    this.server.tool("basic_financials", "Get basic financial metrics: P/E ratio, 52-week high/low, market cap, revenue, EPS, dividends, and more.", { symbol: z.string().describe("Stock ticker symbol") },
      async ({ symbol }) => {
        try { const financials = await this.client.basicFinancials(symbol.toUpperCase()); return { content: [{ type: "text" as const, text: JSON.stringify(financials, null, 2) }] };
        } catch (e) { return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true }; }
      }
    );

    this.server.tool("company_peers", "Get a list of peer companies (similar companies in the same industry).", { symbol: z.string().describe("Stock ticker symbol") },
      async ({ symbol }) => {
        try { const peers = await this.client.companyPeers(symbol.toUpperCase()); return { content: [{ type: "text" as const, text: JSON.stringify({ symbol: symbol.toUpperCase(), peers }, null, 2) }] };
        } catch (e) { return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true }; }
      }
    );

    this.server.tool("company_earnings", "Get historical earnings surprises (actual vs estimate EPS) for a company.", { symbol: z.string().describe("Stock ticker symbol"), limit: z.number().int().min(1).max(20).default(4).describe("Number of quarters to return") },
      async ({ symbol, limit }) => {
        try { const earnings = await this.client.companyEarnings(symbol.toUpperCase(), String(limit)); return { content: [{ type: "text" as const, text: JSON.stringify(earnings, null, 2) }] };
        } catch (e) { return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true }; }
      }
    );

    this.server.tool("earnings_calendar", "Get upcoming earnings releases within a date range.", { from: z.string().describe("Start date (YYYY-MM-DD)"), to: z.string().describe("End date (YYYY-MM-DD)") },
      async ({ from, to }) => {
        try { const calendar = await this.client.earningsCalendar(from, to); return { content: [{ type: "text" as const, text: JSON.stringify(calendar, null, 2) }] };
        } catch (e) { return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true }; }
      }
    );

    this.server.tool("stock_candles", "Get historical OHLCV candlestick data for a stock. Resolution: 1, 5, 15, 30, 60, D, W, M.", { symbol: z.string().describe("Stock ticker symbol"), resolution: z.enum(["1", "5", "15", "30", "60", "D", "W", "M"]).describe("Candle resolution"), from: z.string().describe("Start UNIX timestamp (seconds)"), to: z.string().describe("End UNIX timestamp (seconds)") },
      async ({ symbol, resolution, from, to }) => {
        try { const candles = await this.client.stockCandles(symbol.toUpperCase(), resolution, from, to); return { content: [{ type: "text" as const, text: JSON.stringify(candles, null, 2) }] };
        } catch (e) { return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true }; }
      }
    );

    this.server.tool("market_status", "Check if a stock exchange is currently open or closed.", { exchange: z.string().default("US").describe("Exchange code (default: US)") },
      async ({ exchange }) => {
        try { const status = await this.client.marketStatus(exchange); return { content: [{ type: "text" as const, text: JSON.stringify(status, null, 2) }] };
        } catch (e) { return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true }; }
      }
    );

    this.server.tool("recommendation_trends", "Get analyst recommendation trends (buy/hold/sell/strong buy/strong sell counts) over time.", { symbol: z.string().describe("Stock ticker symbol") },
      async ({ symbol }) => {
        try { const trends = await this.client.recommendationTrends(symbol.toUpperCase()); return { content: [{ type: "text" as const, text: JSON.stringify(trends, null, 2) }] };
        } catch (e) { return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true }; }
      }
    );

    this.server.tool("insider_transactions", "Get insider transactions (buys/sells by executives and board members).", { symbol: z.string().describe("Stock ticker symbol") },
      async ({ symbol }) => {
        try { const insiders = await this.client.insiderTransactions(symbol.toUpperCase()); return { content: [{ type: "text" as const, text: JSON.stringify(insiders, null, 2) }] };
        } catch (e) { return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true }; }
      }
    );

    this.server.tool("forex_rates", "Get current forex exchange rates relative to a base currency.", { base: z.string().default("USD").describe("Base currency code (e.g. USD, EUR, GBP)") },
      async ({ base }) => {
        try { const rates = await this.client.forexRates(base.toUpperCase()); return { content: [{ type: "text" as const, text: JSON.stringify(rates, null, 2) }] };
        } catch (e) { return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true }; }
      }
    );
  }
}
