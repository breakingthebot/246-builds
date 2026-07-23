# Build 29: Next.js Blog Platform

Next.js blog platform: statically generated posts, server-rendered post pages with live comments, and an API route for comments.

## Snapshot
- Date Pushed: 2026-07-11
- Technology: Next.js
- Category: Web Frontend
- Depth: Deep
- Repo: https://github.com/breakingthebot/nextjs-blog-platform

## Notes
Postgres-backed comments (Neon serverless driver) with per-IP rate limiting (hashed IPs, 5 writes/10min), self-service comment deletion via hashed delete tokens, and an admin override checked with a constant-time comparison. Optimistic comment submission via useOptimistic/useTransition. Post tags with a statically generated /tags/[tag] route (not a query param, to preserve SSG). GitHub Actions CI and component tests with jsdom. Deployed to Vercel.
