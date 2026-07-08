# Build 28: GitHub Dashboard

GitHub dashboard with cached search, background refetch, loading/error states, and pagination via TanStack Query, plus a per-repo detail view.

## Snapshot
- Date Pushed: 2026-07-08
- Technology: TanStack Query
- Category: Web Frontend
- Depth: Deep
- Repo: https://github.com/breakingthebot/github-dashboard-react-query

## Notes
Every fetch goes through useQuery instead of a hand-rolled useEffect+fetch, giving real caching, a distinct loading-vs-refetching state, and structured error handling for free. Pagination reads GitHub's real Link response header instead of guessing from the current page number. The repo detail route (react-router-dom) fires three independent queries in parallel (details, languages, commits) so one slow or failed query never blocks the rest of the page. Deployed to Vercel with a vercel.json SPA rewrite so deep-linked detail routes survive a refresh.
