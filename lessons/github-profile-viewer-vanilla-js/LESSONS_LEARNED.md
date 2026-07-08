# Lessons Learned — GitHub Profile Viewer (Vanilla JS)
**Build #12 | JS async | Web Frontend | 2026-06-27**

---

## What Worked Well

- **GitHub REST API with `fetch`**: Hitting the GitHub API directly from the browser with `fetch` and no backend proxy worked well for a public-data tool. The response structure is consistent and well-documented.
- **Profile, repo, and activity views as separate "pages"**: Simulating routing by showing/hiding sections with `display: none` kept the single-file simplicity while providing a multi-page feel.
- **Search, filter, and sort**: Client-side filtering of fetched repos by language, topic, and name with sort by stars/forks/updated let users find what they needed without additional API calls.
- **Full E2E coverage with Playwright**: Testing the actual rendered DOM against the GitHub API responses (with mocked API responses via Playwright's route interception) gave high confidence.

## Challenges Overcome

- **GitHub API rate limiting (60 req/hour unauthenticated)**: Running E2E tests consumed rate limit quickly. Solved by mocking API responses in Playwright tests (`page.route('/api.github.com/*', ...)`) — tests ran instantly and weren't flaky.
- **Pagination via `Link` header**: GitHub's API uses HTTP `Link` response headers for pagination, not a simple `page` query param. Had to parse the `Link` header manually: `rel="next"` URL extraction.
- **Activity feed data shape**: The `/users/:user/events` endpoint returns a heterogeneous array of event types (`PushEvent`, `PullRequestEvent`, `IssueEvent`, etc.). Built a type-dispatch table to render each type appropriately.
- **Debouncing the search input**: Without debouncing, typing quickly triggered a filter re-render on every keystroke. Added a 200ms debounce with `setTimeout`/`clearTimeout`.

## Key Insights

- Parsing the GitHub `Link` header for pagination is a recurring pattern — any project that consumes the GitHub API paginated endpoints will need this exact logic. Worth extracting as a utility.
- Debounce any input that triggers filtering/searching. 200ms is the sweet spot that feels instant but doesn't overwhelm.
- Mocking HTTP in E2E tests (via `page.route`) is strictly better than hitting real APIs in tests — deterministic, fast, no rate limits.

## Next Time

- Add OAuth authentication (GitHub Apps or personal access token input) to increase rate limits and access private repos.
- Add a `localStorage` cache for profile data with a 5-minute TTL to reduce redundant requests.
- Extract the `Link` header parser as a reusable utility — it was reimplemented in **GitHub Dashboard (Build #28)**.
- Add a "compare profiles" view to show two users side-by-side.

## Skills Gained

- GitHub REST API pagination via `Link` header parsing
- Vanilla JS async patterns: `fetch`, Promise chaining, `async/await`
- Playwright HTTP route mocking
- Client-side search/filter/sort without a library
- Debounce implementation from scratch

## Integration Points

- The `Link` header parser was rediscovered and improved in **GitHub Dashboard (Build #28)** — would have saved time to package it as a utility after this build.
- E2E with mocked routes became the standard for all API-dependent frontend builds.
- The activity feed type-dispatch pattern is the same concept as the adapter pattern in **Async News Aggregator (Build #2)**.
