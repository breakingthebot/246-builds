# Lessons Learned — URL Shortener API
**Build #15 | Go | Backend & Networking | 2026-06-28**

---

## What Worked Well

- **Go's standard library for HTTP**: `net/http` is powerful enough for a production-quality REST API without a framework. The handler-based routing, middleware chaining, and built-in JSON support reduced external dependencies to just the database driver.
- **PostgreSQL for storage**: Using a real relational database (vs. SQLite or in-memory) gave production-realistic behavior: concurrent access, ACID transactions, and real click-tracking with timestamps.
- **Click tracking with analytics**: Storing each redirect as a row (`short_code`, `original_url`, `clicked_at`, `user_agent`, `ip_hash`) enabled aggregate analytics (clicks per day, top referrers) without much additional effort.
- **Short code generation**: Using a base62-encoded counter (rather than random strings) guaranteed uniqueness without collision checking and kept codes short and readable.
- **Context-based request cancellation**: Using `context.WithTimeout` for every database query prevented slow DB queries from blocking HTTP handlers indefinitely.

## Challenges Overcome

- **Database connection pooling**: Go's `database/sql` handles pooling automatically, but tuning `SetMaxOpenConns` and `SetMaxIdleConns` was necessary to avoid exhausting PostgreSQL's connection limit under load.
- **Race conditions in click counting**: Concurrent redirects updating a `click_count` column caused lost updates. Fixed with a PostgreSQL `atomic increment` (`UPDATE ... SET clicks = clicks + 1`) rather than a read-modify-write in application code.
- **Custom short codes (collision handling)**: When users provide a custom code, it might already exist. The API needed a clear error response (`409 Conflict`) with a helpful message.
- **URL validation**: Accepting any string as a long URL led to garbage entries. Added normalization (prepend `https://` if no scheme) and validation via `net/url.Parse` with scheme/host checks.

## Key Insights

- Go's `net/http` middleware pattern (`func(http.Handler) http.Handler`) is elegant and composable. Logging, rate limiting, and auth all fit naturally as middleware.
- `database/sql` is not an ORM — you write SQL. This is a feature: you control exactly what queries run, which matters for performance at the database level.
- Atomic SQL operations (`UPDATE ... SET x = x + 1`) should always be preferred over application-level read-modify-write for counters. This is a concurrent correctness issue, not just a performance one.

## Next Time

- Add Redis for a caching layer so popular short codes are served from memory, not a DB query.
- Implement proper API authentication (API keys or JWT) so users can manage their own short codes.
- Add a `GET /stats/:code` endpoint with time-series click data.
- Use `pgx` instead of the standard `lib/pq` PostgreSQL driver — better performance and a richer API.

## Skills Gained

- Go HTTP server: handlers, middleware, routing with `net/http`
- PostgreSQL driver (`lib/pq`), `database/sql`, connection pool tuning
- Base62 encoding for short ID generation
- Context-based cancellation and timeout propagation
- Atomic SQL operations for concurrent safety

## Integration Points

- The middleware pattern from this build was the reference architecture for any future Go backend.
- Click analytics storage design (event rows with timestamps) is the same pattern used in the **286-builds dashboard** analytics.
- The URL validation logic (`net/url.Parse` + scheme check) is reusable across any Go service that accepts user-provided URLs.
