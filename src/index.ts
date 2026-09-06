export const BASE_URL = "https://fakt.no/api/v1";

export class FaktError extends Error {
  status?: number; response?: Response;
  constructor(message: string, status?: number, response?: Response) {
    super(message); this.name = this.constructor.name; this.status = status; this.response = response;
  }
}
export class FaktAuthError extends FaktError {}
export class FaktPermissionError extends FaktError {}
export class FaktNotFoundError extends FaktError {}
export class FaktRateLimitError extends FaktError {}

export type QueryParams = Record<string, string | number | boolean | undefined>;

export class FaktClient {
  apiKey?: string; baseUrl: string; timeout: number; lastHeaders: Record<string, string> = {};
  constructor(apiKey?: string, baseUrl: string = BASE_URL, timeout = 30000) {
    this.apiKey = apiKey; this.baseUrl = (baseUrl || BASE_URL).replace(/\/+$/, ""); this.timeout = timeout;
  }
  private clean(q: QueryParams): Record<string, string | number | boolean> {
    const o: Record<string, string | number | boolean> = {};
    for (const k in q) if (q[k] !== undefined && q[k] !== null) o[k] = q[k]!;
    return o;
  }
  private async request(method: string, path: string, params?: QueryParams, body?: unknown): Promise<any> {
    const url = new URL(this.baseUrl + path);
    for (const [k, v] of Object.entries(this.clean(params || {}))) url.searchParams.set(k, String(v));
    const headers: Record<string, string> = {};
    if (this.apiKey) headers["X-API-Key"] = this.apiKey;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const res = await fetch(url.toString(), { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(this.timeout) });
    this.lastHeaders = Object.fromEntries(res.headers.entries());
    if (!res.ok) {
      let msg: string | null = null;
      try { const d = await res.json(); msg = d.error || d.message || d.detail || d.reason || null; } catch { /* ignore */ }
      const m = msg || `${res.status} ${res.statusText}`;
      if (res.status === 401) throw new FaktAuthError(m, res.status, res);
      if (res.status === 403) throw new FaktPermissionError(m, res.status, res);
      if (res.status === 404) throw new FaktNotFoundError(m, res.status, res);
      if (res.status === 429) throw new FaktRateLimitError(m, res.status, res);
      throw new FaktError(m, res.status, res);
    }
    if (res.status === 204) return null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("ndjson")) return (await res.text()).split("\n").filter(Boolean);
    if (ct.includes("event-stream")) return await res.text();
    return res.json();
  }
  get quotaRemaining() { return this.lastHeaders["x-quota-remaining"]; }
  get quotaLimit() { return this.lastHeaders["x-quota-limit"]; }
  get dailyRemaining() { return this.lastHeaders["x-daily-remaining"]; }
  get rateLimitRemaining() { return this.lastHeaders["x-ratelimit-remaining"]; }

  jobs(o: QueryParams = {}) { return this.request("GET", "/jobs", o); }
  job(id: string) { return this.request("GET", `/jobs/${id}`); }
  similarJobs(id: string) { return this.request("GET", `/jobs/${id}/similar`); }
  employers(o: QueryParams = {}) { return this.request("GET", "/employers", o); }
  employer(name: string) { return this.request("GET", `/employers/${encodeURIComponent(name)}`); }
  recruitment(o: QueryParams = {}) { return this.request("GET", "/recruitment", o); }
  recruitmentAudit() { return this.request("GET", "/recruitment/audit"); }
  events(o: QueryParams = {}) { return this.request("GET", "/events", o); }
  stream() { return this.request("GET", "/stream"); }
  watchlists() { return this.request("GET", "/watchlists"); }
  createWatchlist(o: QueryParams = {}) { return this.request("POST", "/watchlists", undefined, o); }
  watchlist(id: string) { return this.request("GET", `/watchlists/${id}`); }
  deleteWatchlist(id: string) { return this.request("DELETE", `/watchlists/${id}`); }
  market() { return this.request("GET", "/market"); }
  marketSalary(o: QueryParams = {}) { return this.request("GET", "/market/salary", o); }
  marketHistory(o: QueryParams = {}) { return this.request("GET", "/market/history", o); }
  marketTimetofill(o: QueryParams = {}) { return this.request("GET", "/market/timetofill", o); }
  usage() { return this.request("GET", "/usage"); }
  exportJobs(o: QueryParams = {}) { return this.request("GET", "/export/jobs", o); }
  exportEmployers(o: QueryParams = {}) { return this.request("GET", "/export/employers", o); }
  exportEvents(o: QueryParams = {}) { return this.request("GET", "/export/events", o); }
}
