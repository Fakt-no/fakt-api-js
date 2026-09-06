export declare const BASE_URL = "https://fakt.no/api/v1";

export declare class FaktError extends Error {
  status?: number;
  response?: Response;
  constructor(message: string, status?: number, response?: Response);
}
export declare class FaktAuthError extends FaktError {}
export declare class FaktPermissionError extends FaktError {}
export declare class FaktNotFoundError extends FaktError {}
export declare class FaktRateLimitError extends FaktError {}

export type QueryParams = Record<string, string | number | boolean | undefined>;

export declare class FaktClient {
  apiKey?: string;
  baseUrl: string;
  timeout: number;
  lastHeaders: Record<string, string>;
  constructor(apiKey?: string, baseUrl?: string, timeout?: number);
  quotaRemaining: string | undefined;
  quotaLimit: string | undefined;
  dailyRemaining: string | undefined;
  rateLimitRemaining: string | undefined;
  jobs(o?: QueryParams): Promise<any>;
  job(id: string): Promise<any>;
  similarJobs(id: string): Promise<any>;
  employers(o?: QueryParams): Promise<any>;
  employer(name: string): Promise<any>;
  recruitment(o?: QueryParams): Promise<any>;
  recruitmentAudit(): Promise<any>;
  events(o?: QueryParams): Promise<any>;
  stream(): Promise<any>;
  watchlists(): Promise<any>;
  createWatchlist(o?: QueryParams): Promise<any>;
  watchlist(id: string): Promise<any>;
  deleteWatchlist(id: string): Promise<any>;
  market(): Promise<any>;
  marketSalary(o?: QueryParams): Promise<any>;
  marketHistory(o?: QueryParams): Promise<any>;
  marketTimetofill(o?: QueryParams): Promise<any>;
  usage(): Promise<any>;
  exportJobs(o?: QueryParams): Promise<any>;
  exportEmployers(o?: QueryParams): Promise<any>;
  exportEvents(o?: QueryParams): Promise<any>;
}
