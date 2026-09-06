# fakt-api-js

A thin, typed **JavaScript/TypeScript client for the [fakt.no](https://fakt.no) public job-market API** — jobs, employers, salary, recruitment patterns, market insights and bulk exports.

> fakt continuously observes the official **NAV Arbeidsplassen** feed for job postings and builds historical value over time. Data is combined with **SSB** (salary / income) and the **Brønnøysundregistrene** (company registry).

This package is only a thin HTTP wrapper around the public endpoints — it contains **no backend logic, scoring algorithms or data processing**. It uses the built-in `fetch` API, so it works in **Node.js ≥ 18 and all modern browsers** with no dependencies.

- **API documentation:** [github.com/Fakt-no/fakt-api](https://github.com/Fakt-no/fakt-api)
- **Base URL:** `https://fakt.no/api/v1`
- **OpenAPI 3.0:** [`openapi.yaml`](https://github.com/Fakt-no/fakt-api/blob/main/openapi.yaml)

---

## Install

```bash
npm install @fakt-no/api
```

## Quick start

```js
import { FaktClient } from "@fakt-no/api";

// Demo mode (no key) — read-only, ~50 requests/day per IP
const client = new FaktClient();

// ...or with your API key
const client = new FaktClient("YOUR_API_KEY_HERE");

// Search jobs
const data = await client.jobs({ q: "sykepleier", county: "Oslo", limit: 10 });
console.log(data.total);
for (const job of data.items) console.log(job.title, "—", job.location, "—", job.category);
```

---

## Authentication

Pass an optional `apiKey` to the constructor. If you omit it, the client uses the API's **demo tier** (no `X-API-Key` header), which is read-only and limited to **50 requests/day per IP**. Create a key from [fakt.no/dashboard](https://fakt.no/dashboard). The client sends it automatically as the `X-API-Key` header.

---

## Methods

All methods map 1:1 to the endpoints in [`openapi.yaml`](https://github.com/Fakt-no/fakt-api/blob/main/openapi.yaml).

| Method | Endpoint |
| --- | --- |
| `client.jobs(o)` | `GET /jobs` |
| `client.job(id)` | `GET /jobs/{id}` |
| `client.similarJobs(id)` | `GET /jobs/{id}/similar` |
| `client.employers(o)` | `GET /employers` |
| `client.employer(name)` | `GET /employers/{name}` |
| `client.recruitment(o)` | `GET /recruitment` |
| `client.recruitmentAudit()` | `GET /recruitment/audit` |
| `client.events(o)` | `GET /events` |
| `client.stream()` | `GET /stream` (SSE) |
| `client.watchlists()` | `GET /watchlists` |
| `client.createWatchlist(o)` | `POST /watchlists` |
| `client.watchlist(id)` | `GET /watchlists/{id}` |
| `client.deleteWatchlist(id)` | `DELETE /watchlists/{id}` |
| `client.market()` | `GET /market` |
| `client.marketSalary(o)` | `GET /market/salary` |
| `client.marketHistory(o)` | `GET /market/history` |
| `client.marketTimetofill(o)` | `GET /market/timetofill` |
| `client.usage()` | `GET /usage` |
| `client.exportJobs(o)` | `GET /export/jobs` (NDJSON) |
| `client.exportEmployers(o)` | `GET /export/employers` |
| `client.exportEvents(o)` | `GET /export/events` |

---

## Rate limits & quota

Each response's limit headers are stored on the client:

```js
const data = await client.jobs({ limit: 5 });
console.log("quota remaining:", client.quotaRemaining);        // X-Quota-Remaining
console.log("daily remaining:", client.dailyRemaining);        // X-Daily-Remaining
console.log("rate-limit remaining:", client.rateLimitRemaining); // X-RateLimit-Remaining
```

**Plan limits** (from the [main API README](https://github.com/Fakt-no/fakt-api)):

| Plan | /min | /day | /month |
| --- | --- | --- | --- |
| Demo (no key) | 10 | 50 (per IP) | ~1,500 |
| Free | 10 | 50 | 1,500 |
| Pro | 60 | 1,000 | 30,000 |
| Business | 300 | 10,000 | 300,000 |
| Enterprise | 1,000 | 100,000 | 3,000,000 |

---

## Errors

The client throws specific errors with the API's own message included:

| Error | HTTP | Meaning |
| --- | --- | --- |
| `FaktAuthError` | 401 | Invalid / missing API key |
| `FaktPermissionError` | 403 | Key expired or endpoint not on your plan |
| `FaktNotFoundError` | 404 | Resource not found |
| `FaktRateLimitError` | 429 | Quota exceeded |
| `FaktError` | other | Base error, includes `status` + `response` |

```js
import { FaktClient } from "@fakt-no/api";

const client = new FaktClient("YOUR_API_KEY_HERE");
try {
  await client.marketSalary({ category: "Sykepleier" });
} catch (e) {
  console.log(e.message);           // "This endpoint requires an API key (Pro plan or higher)..."
  console.log(e.status);            // 403
}
```

---

## License

MIT — see [`LICENSE`](./LICENSE).
