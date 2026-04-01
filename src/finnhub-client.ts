/**
 * Finnhub API Client — typed wrapper for the Finnhub REST API.
 * Free-tier endpoints only. Auth via `token` query parameter.
 */

const BASE_URL = "https://finnhub.io/api/v1";

export class FinnhubClient {
  constructor(private apiKey: string) {}

  private async request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set("token", this.apiKey);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Finnhub API error ${res.status}: ${body}`);
    }
    return res.json() as Promise<T>;
  }

  async quote(symbol: string): Promise<StockQuote> { return this.request<StockQuote>("/quote", { symbol }); }
  async companyProfile(symbol: string): Promise<CompanyProfile> { return this.request<CompanyProfile>("/stock/profile2", { symbol }); }
  async symbolSearch(query: string): Promise<SymbolSearchResult> { return this.request<SymbolSearchResult>("/search", { q: query }); }
  async companyNews(symbol: string, from: string, to: string): Promise<NewsItem[]> { return this.request<NewsItem[]>("/company-news", { symbol, from, to }); }
  async marketNews(category: string = "general"): Promise<NewsItem[]> { return this.request<NewsItem[]>("/news", { category }); }
  async basicFinancials(symbol: string, metric: string = "all"): Promise<BasicFinancials> { return this.request<BasicFinancials>("/stock/metric", { symbol, metric }); }
  async companyPeers(symbol: string): Promise<string[]> { return this.request<string[]>("/stock/peers", { symbol }); }
  async companyEarnings(symbol: string, limit: string = "4"): Promise<EarningResult[]> { return this.request<EarningResult[]>("/stock/earnings", { symbol, limit }); }
  async earningsCalendar(from: string, to: string): Promise<EarningsCalendar> { return this.request<EarningsCalendar>("/calendar/earnings", { from, to }); }
  async stockCandles(symbol: string, resolution: string, from: string, to: string): Promise<StockCandles> { return this.request<StockCandles>("/stock/candle", { symbol, resolution, from, to }); }
  async marketStatus(exchange: string = "US"): Promise<MarketStatus> { return this.request<MarketStatus>("/stock/market-status", { exchange }); }
  async forexRates(base: string = "USD"): Promise<ForexRates> { return this.request<ForexRates>("/forex/rates", { base }); }
  async recommendationTrends(symbol: string): Promise<RecommendationTrend[]> { return this.request<RecommendationTrend[]>("/stock/recommendation", { symbol }); }
  async insiderTransactions(symbol: string): Promise<InsiderTransactions> { return this.request<InsiderTransactions>("/stock/insider-transactions", { symbol }); }
}

export interface StockQuote { c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; t: number; }
export interface CompanyProfile { country: string; currency: string; exchange: string; finnhubIndustry: string; ipo: string; logo: string; marketCapitalization: number; name: string; phone: string; shareOutstanding: number; ticker: string; weburl: string; }
export interface SymbolSearchResult { count: number; result: Array<{ description: string; displaySymbol: string; symbol: string; type: string; }>; }
export interface NewsItem { category: string; datetime: number; headline: string; id: number; image: string; related: string; source: string; summary: string; url: string; }
export interface BasicFinancials { metric: Record<string, number | string | null>; metricType: string; series: Record<string, unknown>; symbol: string; }
export interface EarningResult { actual: number | null; estimate: number | null; period: string; quarter: number; surprise: number | null; surprisePercent: number | null; symbol: string; year: number; }
export interface EarningsCalendar { earningsCalendar: Array<{ date: string; epsActual: number | null; epsEstimate: number | null; hour: string; quarter: number; revenueActual: number | null; revenueEstimate: number | null; symbol: string; year: number; }>; }
export interface StockCandles { c: number[]; h: number[]; l: number[]; o: number[]; s: string; t: number[]; v: number[]; }
export interface MarketStatus { exchange: string; holiday: string | null; isOpen: boolean; session: string; t: number; timezone: string; }
export interface ForexRates { base: string; quote: Record<string, number>; }
export interface RecommendationTrend { buy: number; hold: number; period: string; sell: number; strongBuy: number; strongSell: number; symbol: string; }
export interface InsiderTransactions { data: Array<{ name: string; share: number; change: number; filingDate: string; transactionDate: string; transactionCode: string; transactionPrice: number; }>; symbol: string; }
