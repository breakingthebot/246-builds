# Lessons Learned — Portfolio Site
**Build #26 | React / React Router | Web Frontend | 2026-07-07**

---

## What Worked Well

- **Four-page SPA with React Router**: The `Home → Projects → Blog → Contact` navigation structure covered the essential portfolio pages. React Router's `<Outlet>` and `<NavLink>` with active state styling made the navigation component clean.
- **First-party GitHub activity widget**: Building a custom recent-activity widget via the GitHub API (instead of using a third-party contribution chart that undercounted) gave accurate data and full control over the visual presentation.
- **Formspree-backed contact form**: Using Formspree (a form backend as a service) meant no backend server was needed for the contact form. Submissions arrive by email; zero infrastructure to maintain.
- **Per-page SEO metadata**: `react-helmet-async` for per-page `<title>`, `<meta description>`, and Open Graph tags made each page share correctly on social media.
- **Generated sitemap.xml + robots.txt**: `vite-plugin-sitemap` auto-generating the sitemap from React Router routes ensured search engines could crawl all pages.
- **Accessibility pass**: WCAG contrast ratio validation for all text/background color pairs, a skip-to-main-content link, proper heading hierarchy (`h1` → `h2` → `h3` with no skips), and ARIA labels on icon-only buttons — refined through 24 iterative improvements.

## Challenges Overcome

- **Third-party contribution chart undercounting**: The original GitHub Skyline widget didn't count private repo contributions. Replaced with a custom component using `GET /users/:user/events` which showed public events accurately.
- **React Router deep links on Vercel**: SPA routing means `/projects/my-repo` doesn't correspond to a real file. Added a `vercel.json` with a SPA rewrite rule (`"rewrites": [{"source": "/(.*)", "destination": "/"}]`) to make all deep-linked URLs work after a refresh.
- **Accessibility contrast failures**: Several design choices (light gray text on white, brand color on colored backgrounds) failed WCAG AA contrast ratios. Used the browser's DevTools accessibility panel to identify failures and adjusted colors systematically.
- **Blog MDX rendering**: Adding a blog required a decision: static Markdown files + `remark`/`rehype` pipeline, or a headless CMS. Used static MDX files for simplicity — right for a personal blog with infrequent posts.

## Key Insights

- Portfolio sites are deceptively complex if you care about SEO, accessibility, and performance. Treating it as a "simple" project leads to cutting corners that matter.
- A first-party GitHub widget is always better than a third-party badge. Third-party widgets can become stale, unavailable, or inaccurate. The API is right there.
- Accessibility is not a final checklist item — it needs to be part of every design decision. Contrast ratios and heading hierarchy are easy to get wrong and hard to fix retroactively.

## Next Time

- Add a proper CMS (Contentlayer, Sanity, or Notion as a backend) for the blog so posts can be written without deploying.
- Add a `prefers-reduced-motion` media query to disable animations for users who need it.
- Add performance monitoring (Vercel Analytics or Lighthouse CI in GitHub Actions) to catch regressions.
- Add `next/image`-style lazy loading for project screenshots.

## Skills Gained

- React Router v6: nested routes, `<Outlet>`, `<NavLink>`, `useParams`, `useNavigate`
- `react-helmet-async` for SEO metadata
- WCAG contrast ratio analysis and remediation
- GitHub Events API for activity visualization
- Vercel deployment with SPA rewrite rules
- MDX processing pipeline with `remark`/`rehype`

## Integration Points

- The Vercel SPA rewrite rule (`vercel.json`) was reused directly in **GitHub Dashboard (Build #28)**.
- The GitHub Events API widget was the prototype for the more detailed activity view in **GitHub Profile Viewer (Build #12)**.
- The accessibility patterns (skip link, heading hierarchy, ARIA labels) informed all subsequent frontend builds.
