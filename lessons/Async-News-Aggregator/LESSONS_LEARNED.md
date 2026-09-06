# Lessons Learned — Async News Aggregator
**Build #2 | Python (async) | CLI Tools | 2026-06-07**

---

## What Worked Well

- **`asyncio` + `aiohttp` for concurrent fetching** was the core insight of this build. Fetching from 5 news sources sequentially would have taken 5× as long; `asyncio.gather()` brought that to roughly the slowest single request. The performance difference was immediately visible and motivating.
- **Structured `NewsItem` dataclass** as the common schema across all 5 sources made merging and deduplication trivial — each source adapter just had to produce this shape.
- **Deduplication by headline similarity** (rather than exact URL match) handled the common case where multiple sources pick up the same story with slightly different URLs.
- **CLI flag for source selection** made the tool immediately practical for daily use — `--sources bbc,hn` vs. the full default set.

## Challenges Overcome

- **Rate limits and timeouts**: Different news APIs have different rate limits and latency profiles. Solved with `asyncio.timeout()` per request and graceful degradation — a failed source is logged but doesn't kill the run.
- **RSS vs. JSON APIs**: Some sources return RSS/XML, others return JSON. Built a thin adapter layer so the core aggregation logic never sees raw HTTP responses.
- **Pagination awareness**: HN's API requires separate requests per story ID; naively fetching 30 stories meant 30 serial requests. Fixed with `asyncio.gather()` on the story-detail requests too.

## Key Insights

- `asyncio` is not magic — it only helps when tasks are I/O-bound. Learned to identify where the bottleneck actually is before reaching for async.
- An adapter pattern (one class per news source, all implementing a common interface) made adding a 6th source trivial — just drop in a new adapter file.
- Async error handling requires explicit `try/except` inside each coroutine; an unhandled exception in one `gather()` task doesn't surface cleanly without it.

## Next Time

- Use `httpx` instead of `aiohttp` — better error messages, easier to test with `respx`, and a cleaner API overall.
- Cache results to disk with a TTL so repeated runs within the same hour don't re-fetch everything.
- Add `--format json|table|markdown` output modes rather than a single hardcoded print format.
- Add a persistent "read later" list so interesting articles can be saved and reviewed offline.

## Skills Gained

- `asyncio` fundamentals: event loop, coroutines, `gather()`, `timeout()`
- `aiohttp` for async HTTP including session management and connection pooling
- Adapter/strategy pattern for normalizing heterogeneous data sources
- XML/RSS parsing with `feedparser`

## Integration Points

- The async fetch-and-merge pattern here was the direct predecessor of the **GitHub Dashboard (Build #28)**, which does the same thing for GitHub API calls (parallel queries for repo details, languages, and commits).
- The CLI output formatting experience carried forward into **Dev Toolkit (Build #7)** and the **Log File Analyzer (Build #17)**.
- Timeout and graceful-degradation logic was reused conceptually in the **Chat Server (Build #5)** for client disconnection handling.
