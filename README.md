# 286 Builds

A public index of daily coding builds, each pulled from the 286-project list and built end-to-end in a single day, then expanded through multiple iterations with a full commit history pushed live. Together, the repos form a broad portfolio spanning multiple languages, problem types, and build depths.

## What's in each build's repo
- Every repo has a full README.
- Every repo has a full changelog.
- Every repo keeps a real sequential commit history on one branch.
- Every repo includes either a live deployment link or exact local run instructions.

## How This Works
- Each build is its own public GitHub repo.
- This repo is the index for the full 286-build series.
- The index is generated from `builds.json` and kept in sync with the tracker workbook.
- Build dates shown here use the public GitHub push date.

## Summary
| Completed | Latest Build | Deep Builds | Expanded Builds | Standard Builds |
| ---: | --- | ---: | ---: | ---: |
| 21 | #21 Quick Notes Android App | 12 | 9 | 0 |

### Jump To
- [Build Index](#build-index)
- [Quick Views](#quick-views)
- [By Category](#by-category)
- [By Technology](#by-technology)
- [Build Pages](#build-pages)
- [CSV Export](exports/builds.csv)
- [Stats JSON](exports/stats.json)

### Distribution
#### By Category
| Label | Count |
| --- | ---: |
| Languages | 21 |

#### By Depth
| Label | Count |
| --- | ---: |
| Deep | 12 |
| Expanded | 9 |

#### By Technology
| Label | Count |
| --- | ---: |
| C# | 1 |
| ES Modules | 1 |
| Go | 1 |
| Java | 1 |
| JS async | 1 |
| JS testing | 1 |
| Kotlin | 1 |
| PHP | 1 |
| Python (async) | 1 |
| Python (automation) | 1 |
| Python (CLI tools) | 1 |
| Python (Core) | 1 |
| Python (data) | 1 |
| Python (ML) | 1 |
| Python (networking) | 1 |
| Python (testing) | 1 |
| Ruby | 1 |
| Rust | 1 |
| Swift | 1 |
| TypeScript | 1 |
| Vanilla JS | 1 |

## Build Index

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 21 | 2026-07-04 | [Quick Notes Android App](builds/021-quick-notes-android-app.md) | Kotlin Android notes app with Jetpack Compose, Room storage, tags, archive flows, search/sort, widgets, and UI test coverage. | [Repo](https://github.com/breakingthebot/quick-notes-android-compose) | Kotlin | Languages | `Deep` |
| 20 | 2026-07-03 | [Habit Tracker iOS App](builds/020-habit-tracker-ios-app.md) | SwiftUI habit tracker with search and filters, streaks, reminder scheduling, a weekly dashboard, home screen widgets, and XCTest coverage. | [Repo](https://github.com/breakingthebot/habit-tracker-ios-swiftui) | Swift | Languages | `Deep` |
| 19 | 2026-07-02 | [Budget Tracker Console App](builds/019-budget-tracker-console-app.md) | A .NET 8 console budget tracker with categories, monthly reports, and CSV export. | [Repo](https://github.com/breakingthebot/budget-tracker-console-app) | C# | Languages | `Expanded` |
| 18 | 2026-06-30 | [Library Catalog](builds/018-library-catalog.md) | Java library catalog with Book and Member classes, checkout flows, file persistence, and JUnit coverage. | [Repo](https://github.com/breakingthebot/library-catalog-java) | Java | Languages | `Expanded` |
| 17 | 2026-06-30 | [Log File Analyzer](builds/017-log-file-analyzer.md) | Ruby CLI for streaming server log analysis with gzip input, thresholds, trend buckets, comparison mode, config, and export support. | [Repo](https://github.com/breakingthebot/log-file-analyzer-ruby) | Ruby | Languages | `Deep` |
| 16 | 2026-06-28 | [File Duplicate Finder](builds/016-file-duplicate-finder.md) | CLI tool that walks a directory tree and finds duplicate files by hash. | [Repo](https://github.com/breakingthebot/file-duplicate-finder-rust) | Rust | Languages | `Expanded` |
| 15 | 2026-06-28 | [URL Shortener API](builds/015-url-shortener-api.md) | Go URL shortener API with PostgreSQL storage and click tracking. | [Repo](https://github.com/breakingthebot/url-shortener-api) | Go | Languages | `Expanded` |
| 14 | 2026-06-28 | [Contact Form Backend](builds/014-contact-form-backend.md) | Modular PHP backend for validating, storing, and emailing contact form submissions. | [Repo](https://github.com/breakingthebot/php-contact-form-backend) | PHP | Languages | `Deep` |
| 13 | 2026-06-28 | [Tested String Utility Library](builds/013-tested-string-utility-library.md) | JavaScript string utility library with 20 modular helpers and a full Jest test suite. | [Repo](https://github.com/breakingthebot/string-utils-jest) | JS testing | Languages | `Expanded` |
| 12 | 2026-06-27 | [GitHub Profile Viewer](builds/012-github-profile-viewer.md) | Vanilla JS GitHub explorer with profile, repo, and activity views plus search, filter, sort, and full E2E coverage. | [Repo](https://github.com/breakingthebot/github-profile-viewer-vanilla-js) | JS async | Languages | `Deep` |
| 11 | 2026-06-26 | [Music Player](builds/011-music-player.md) | No-bundler ES module music player with queue, shuffle/repeat, favorites, local file import, and CI/E2E coverage. | [Repo](https://github.com/breakingthebot/music-player-es-modules) | ES Modules | Languages | `Deep` |
| 10 | 2026-06-20 | [Typed Task Manager](builds/010-typed-task-manager.md) | Strict TypeScript task manager with status-grouped views, import/export, backup history, bulk actions, and browser tests. | [Repo](https://github.com/breakingthebot/Typed-Task-Manager) | TypeScript | Languages | `Deep` |
| 9 | 2026-06-19 | [Kanban Board](builds/009-kanban-board.md) | Dependency-free drag-and-drop Kanban board with labels, due dates, undo/redo, and accessibility-tested E2E coverage. | [Repo](https://github.com/breakingthebot/Kanban-Board-Vanilla-JS) | Vanilla JS | Languages | `Deep` |
| 8 | 2026-06-18 | [Tested Calculator Library](builds/008-tested-calculator-library.md) | Installable Python calculator package with CLI, batch processing, history, precision controls, and full pytest coverage. | [Repo](https://github.com/breakingthebot/Python-testing) | Python (testing) | Languages | `Deep` |
| 7 | 2026-06-17 | [Dev Toolkit](builds/007-dev-toolkit.md) | Click-based Python CLI bundling UUID, password, base64, hashing, timestamp, and file/clipboard utilities. | [Repo](https://github.com/breakingthebot/Dev-toolkit) | Python (CLI tools) | Languages | `Expanded` |
| 6 | 2026-06-12 | [House Price Predictor](builds/006-house-price-predictor.md) | California housing prediction toolkit with selectable models, batch validation, model cards, and a Streamlit UI. | [Repo](https://github.com/breakingthebot/House-price-predictor) | Python (ML) | Languages | `Deep` |
| 5 | 2026-06-10 | [Chat Server](builds/005-chat-server.md) | Multi-user TCP socket chat server with slash commands, audit logging, and integration-tested protocol flows. | [Repo](https://github.com/breakingthebot/chat-server) | Python (networking) | Languages | `Deep` |
| 4 | 2026-06-09 | [Folder Organizer](builds/004-folder-organizer.md) | Standard-library-only file watcher that auto-sorts downloads by type with reports and config support. | [Repo](https://github.com/breakingthebot/file-organizer) | Python (automation) | Languages | `Expanded` |
| 3 | 2026-06-09 | [Sales Dashboard](builds/003-sales-dashboard.md) | CSV-driven sales analytics tool with pandas and matplotlib reporting, exports, and a Streamlit app. | [Repo](https://github.com/breakingthebot/Sales-Dashboard) | Python (data) | Languages | `Deep` |
| 2 | 2026-06-07 | [Async News Aggregator](builds/002-async-news-aggregator.md) | Async Python CLI that fetches and merges headlines from 5 live news sources concurrently. | [Repo](https://github.com/breakingthebot/Async-News-Aggregator) | Python (async) | Languages | `Expanded` |
| 1 | 2026-06-06 | [Expense Tracker](builds/001-expense-tracker.md) | Standard-library-only expense tracker with budgets, recurring templates, monthly reports, and CSV export. | [Repo](https://github.com/breakingthebot/expense-tracker) | Python (Core) | Languages | `Expanded` |

## Quick Views
<details>
<summary>Most Recent 10 (10)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 21 | 2026-07-04 | [Quick Notes Android App](builds/021-quick-notes-android-app.md) | Kotlin Android notes app with Jetpack Compose, Room storage, tags, archive flows, search/sort, widgets, and UI test coverage. | [Repo](https://github.com/breakingthebot/quick-notes-android-compose) | Kotlin | Languages | `Deep` |
| 20 | 2026-07-03 | [Habit Tracker iOS App](builds/020-habit-tracker-ios-app.md) | SwiftUI habit tracker with search and filters, streaks, reminder scheduling, a weekly dashboard, home screen widgets, and XCTest coverage. | [Repo](https://github.com/breakingthebot/habit-tracker-ios-swiftui) | Swift | Languages | `Deep` |
| 19 | 2026-07-02 | [Budget Tracker Console App](builds/019-budget-tracker-console-app.md) | A .NET 8 console budget tracker with categories, monthly reports, and CSV export. | [Repo](https://github.com/breakingthebot/budget-tracker-console-app) | C# | Languages | `Expanded` |
| 18 | 2026-06-30 | [Library Catalog](builds/018-library-catalog.md) | Java library catalog with Book and Member classes, checkout flows, file persistence, and JUnit coverage. | [Repo](https://github.com/breakingthebot/library-catalog-java) | Java | Languages | `Expanded` |
| 17 | 2026-06-30 | [Log File Analyzer](builds/017-log-file-analyzer.md) | Ruby CLI for streaming server log analysis with gzip input, thresholds, trend buckets, comparison mode, config, and export support. | [Repo](https://github.com/breakingthebot/log-file-analyzer-ruby) | Ruby | Languages | `Deep` |
| 16 | 2026-06-28 | [File Duplicate Finder](builds/016-file-duplicate-finder.md) | CLI tool that walks a directory tree and finds duplicate files by hash. | [Repo](https://github.com/breakingthebot/file-duplicate-finder-rust) | Rust | Languages | `Expanded` |
| 15 | 2026-06-28 | [URL Shortener API](builds/015-url-shortener-api.md) | Go URL shortener API with PostgreSQL storage and click tracking. | [Repo](https://github.com/breakingthebot/url-shortener-api) | Go | Languages | `Expanded` |
| 14 | 2026-06-28 | [Contact Form Backend](builds/014-contact-form-backend.md) | Modular PHP backend for validating, storing, and emailing contact form submissions. | [Repo](https://github.com/breakingthebot/php-contact-form-backend) | PHP | Languages | `Deep` |
| 13 | 2026-06-28 | [Tested String Utility Library](builds/013-tested-string-utility-library.md) | JavaScript string utility library with 20 modular helpers and a full Jest test suite. | [Repo](https://github.com/breakingthebot/string-utils-jest) | JS testing | Languages | `Expanded` |
| 12 | 2026-06-27 | [GitHub Profile Viewer](builds/012-github-profile-viewer.md) | Vanilla JS GitHub explorer with profile, repo, and activity views plus search, filter, sort, and full E2E coverage. | [Repo](https://github.com/breakingthebot/github-profile-viewer-vanilla-js) | JS async | Languages | `Deep` |

</details>

<details>
<summary>Deep Builds (12)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 21 | 2026-07-04 | [Quick Notes Android App](builds/021-quick-notes-android-app.md) | Kotlin Android notes app with Jetpack Compose, Room storage, tags, archive flows, search/sort, widgets, and UI test coverage. | [Repo](https://github.com/breakingthebot/quick-notes-android-compose) | Kotlin | Languages | `Deep` |
| 20 | 2026-07-03 | [Habit Tracker iOS App](builds/020-habit-tracker-ios-app.md) | SwiftUI habit tracker with search and filters, streaks, reminder scheduling, a weekly dashboard, home screen widgets, and XCTest coverage. | [Repo](https://github.com/breakingthebot/habit-tracker-ios-swiftui) | Swift | Languages | `Deep` |
| 17 | 2026-06-30 | [Log File Analyzer](builds/017-log-file-analyzer.md) | Ruby CLI for streaming server log analysis with gzip input, thresholds, trend buckets, comparison mode, config, and export support. | [Repo](https://github.com/breakingthebot/log-file-analyzer-ruby) | Ruby | Languages | `Deep` |
| 14 | 2026-06-28 | [Contact Form Backend](builds/014-contact-form-backend.md) | Modular PHP backend for validating, storing, and emailing contact form submissions. | [Repo](https://github.com/breakingthebot/php-contact-form-backend) | PHP | Languages | `Deep` |
| 12 | 2026-06-27 | [GitHub Profile Viewer](builds/012-github-profile-viewer.md) | Vanilla JS GitHub explorer with profile, repo, and activity views plus search, filter, sort, and full E2E coverage. | [Repo](https://github.com/breakingthebot/github-profile-viewer-vanilla-js) | JS async | Languages | `Deep` |
| 11 | 2026-06-26 | [Music Player](builds/011-music-player.md) | No-bundler ES module music player with queue, shuffle/repeat, favorites, local file import, and CI/E2E coverage. | [Repo](https://github.com/breakingthebot/music-player-es-modules) | ES Modules | Languages | `Deep` |
| 10 | 2026-06-20 | [Typed Task Manager](builds/010-typed-task-manager.md) | Strict TypeScript task manager with status-grouped views, import/export, backup history, bulk actions, and browser tests. | [Repo](https://github.com/breakingthebot/Typed-Task-Manager) | TypeScript | Languages | `Deep` |
| 9 | 2026-06-19 | [Kanban Board](builds/009-kanban-board.md) | Dependency-free drag-and-drop Kanban board with labels, due dates, undo/redo, and accessibility-tested E2E coverage. | [Repo](https://github.com/breakingthebot/Kanban-Board-Vanilla-JS) | Vanilla JS | Languages | `Deep` |
| 8 | 2026-06-18 | [Tested Calculator Library](builds/008-tested-calculator-library.md) | Installable Python calculator package with CLI, batch processing, history, precision controls, and full pytest coverage. | [Repo](https://github.com/breakingthebot/Python-testing) | Python (testing) | Languages | `Deep` |
| 6 | 2026-06-12 | [House Price Predictor](builds/006-house-price-predictor.md) | California housing prediction toolkit with selectable models, batch validation, model cards, and a Streamlit UI. | [Repo](https://github.com/breakingthebot/House-price-predictor) | Python (ML) | Languages | `Deep` |
| 5 | 2026-06-10 | [Chat Server](builds/005-chat-server.md) | Multi-user TCP socket chat server with slash commands, audit logging, and integration-tested protocol flows. | [Repo](https://github.com/breakingthebot/chat-server) | Python (networking) | Languages | `Deep` |
| 3 | 2026-06-09 | [Sales Dashboard](builds/003-sales-dashboard.md) | CSV-driven sales analytics tool with pandas and matplotlib reporting, exports, and a Streamlit app. | [Repo](https://github.com/breakingthebot/Sales-Dashboard) | Python (data) | Languages | `Deep` |

</details>

## By Category
<details>
<summary>Languages (21)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 21 | 2026-07-04 | [Quick Notes Android App](builds/021-quick-notes-android-app.md) | Kotlin Android notes app with Jetpack Compose, Room storage, tags, archive flows, search/sort, widgets, and UI test coverage. | [Repo](https://github.com/breakingthebot/quick-notes-android-compose) | Kotlin | Languages | `Deep` |
| 20 | 2026-07-03 | [Habit Tracker iOS App](builds/020-habit-tracker-ios-app.md) | SwiftUI habit tracker with search and filters, streaks, reminder scheduling, a weekly dashboard, home screen widgets, and XCTest coverage. | [Repo](https://github.com/breakingthebot/habit-tracker-ios-swiftui) | Swift | Languages | `Deep` |
| 19 | 2026-07-02 | [Budget Tracker Console App](builds/019-budget-tracker-console-app.md) | A .NET 8 console budget tracker with categories, monthly reports, and CSV export. | [Repo](https://github.com/breakingthebot/budget-tracker-console-app) | C# | Languages | `Expanded` |
| 18 | 2026-06-30 | [Library Catalog](builds/018-library-catalog.md) | Java library catalog with Book and Member classes, checkout flows, file persistence, and JUnit coverage. | [Repo](https://github.com/breakingthebot/library-catalog-java) | Java | Languages | `Expanded` |
| 17 | 2026-06-30 | [Log File Analyzer](builds/017-log-file-analyzer.md) | Ruby CLI for streaming server log analysis with gzip input, thresholds, trend buckets, comparison mode, config, and export support. | [Repo](https://github.com/breakingthebot/log-file-analyzer-ruby) | Ruby | Languages | `Deep` |
| 16 | 2026-06-28 | [File Duplicate Finder](builds/016-file-duplicate-finder.md) | CLI tool that walks a directory tree and finds duplicate files by hash. | [Repo](https://github.com/breakingthebot/file-duplicate-finder-rust) | Rust | Languages | `Expanded` |
| 15 | 2026-06-28 | [URL Shortener API](builds/015-url-shortener-api.md) | Go URL shortener API with PostgreSQL storage and click tracking. | [Repo](https://github.com/breakingthebot/url-shortener-api) | Go | Languages | `Expanded` |
| 14 | 2026-06-28 | [Contact Form Backend](builds/014-contact-form-backend.md) | Modular PHP backend for validating, storing, and emailing contact form submissions. | [Repo](https://github.com/breakingthebot/php-contact-form-backend) | PHP | Languages | `Deep` |
| 13 | 2026-06-28 | [Tested String Utility Library](builds/013-tested-string-utility-library.md) | JavaScript string utility library with 20 modular helpers and a full Jest test suite. | [Repo](https://github.com/breakingthebot/string-utils-jest) | JS testing | Languages | `Expanded` |
| 12 | 2026-06-27 | [GitHub Profile Viewer](builds/012-github-profile-viewer.md) | Vanilla JS GitHub explorer with profile, repo, and activity views plus search, filter, sort, and full E2E coverage. | [Repo](https://github.com/breakingthebot/github-profile-viewer-vanilla-js) | JS async | Languages | `Deep` |
| 11 | 2026-06-26 | [Music Player](builds/011-music-player.md) | No-bundler ES module music player with queue, shuffle/repeat, favorites, local file import, and CI/E2E coverage. | [Repo](https://github.com/breakingthebot/music-player-es-modules) | ES Modules | Languages | `Deep` |
| 10 | 2026-06-20 | [Typed Task Manager](builds/010-typed-task-manager.md) | Strict TypeScript task manager with status-grouped views, import/export, backup history, bulk actions, and browser tests. | [Repo](https://github.com/breakingthebot/Typed-Task-Manager) | TypeScript | Languages | `Deep` |
| 9 | 2026-06-19 | [Kanban Board](builds/009-kanban-board.md) | Dependency-free drag-and-drop Kanban board with labels, due dates, undo/redo, and accessibility-tested E2E coverage. | [Repo](https://github.com/breakingthebot/Kanban-Board-Vanilla-JS) | Vanilla JS | Languages | `Deep` |
| 8 | 2026-06-18 | [Tested Calculator Library](builds/008-tested-calculator-library.md) | Installable Python calculator package with CLI, batch processing, history, precision controls, and full pytest coverage. | [Repo](https://github.com/breakingthebot/Python-testing) | Python (testing) | Languages | `Deep` |
| 7 | 2026-06-17 | [Dev Toolkit](builds/007-dev-toolkit.md) | Click-based Python CLI bundling UUID, password, base64, hashing, timestamp, and file/clipboard utilities. | [Repo](https://github.com/breakingthebot/Dev-toolkit) | Python (CLI tools) | Languages | `Expanded` |
| 6 | 2026-06-12 | [House Price Predictor](builds/006-house-price-predictor.md) | California housing prediction toolkit with selectable models, batch validation, model cards, and a Streamlit UI. | [Repo](https://github.com/breakingthebot/House-price-predictor) | Python (ML) | Languages | `Deep` |
| 5 | 2026-06-10 | [Chat Server](builds/005-chat-server.md) | Multi-user TCP socket chat server with slash commands, audit logging, and integration-tested protocol flows. | [Repo](https://github.com/breakingthebot/chat-server) | Python (networking) | Languages | `Deep` |
| 4 | 2026-06-09 | [Folder Organizer](builds/004-folder-organizer.md) | Standard-library-only file watcher that auto-sorts downloads by type with reports and config support. | [Repo](https://github.com/breakingthebot/file-organizer) | Python (automation) | Languages | `Expanded` |
| 3 | 2026-06-09 | [Sales Dashboard](builds/003-sales-dashboard.md) | CSV-driven sales analytics tool with pandas and matplotlib reporting, exports, and a Streamlit app. | [Repo](https://github.com/breakingthebot/Sales-Dashboard) | Python (data) | Languages | `Deep` |
| 2 | 2026-06-07 | [Async News Aggregator](builds/002-async-news-aggregator.md) | Async Python CLI that fetches and merges headlines from 5 live news sources concurrently. | [Repo](https://github.com/breakingthebot/Async-News-Aggregator) | Python (async) | Languages | `Expanded` |
| 1 | 2026-06-06 | [Expense Tracker](builds/001-expense-tracker.md) | Standard-library-only expense tracker with budgets, recurring templates, monthly reports, and CSV export. | [Repo](https://github.com/breakingthebot/expense-tracker) | Python (Core) | Languages | `Expanded` |

</details>

## By Technology
<details>
<summary>C# (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 19 | 2026-07-02 | [Budget Tracker Console App](builds/019-budget-tracker-console-app.md) | A .NET 8 console budget tracker with categories, monthly reports, and CSV export. | [Repo](https://github.com/breakingthebot/budget-tracker-console-app) | C# | Languages | `Expanded` |

</details>

<details>
<summary>ES Modules (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 11 | 2026-06-26 | [Music Player](builds/011-music-player.md) | No-bundler ES module music player with queue, shuffle/repeat, favorites, local file import, and CI/E2E coverage. | [Repo](https://github.com/breakingthebot/music-player-es-modules) | ES Modules | Languages | `Deep` |

</details>

<details>
<summary>Go (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 15 | 2026-06-28 | [URL Shortener API](builds/015-url-shortener-api.md) | Go URL shortener API with PostgreSQL storage and click tracking. | [Repo](https://github.com/breakingthebot/url-shortener-api) | Go | Languages | `Expanded` |

</details>

<details>
<summary>Java (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 18 | 2026-06-30 | [Library Catalog](builds/018-library-catalog.md) | Java library catalog with Book and Member classes, checkout flows, file persistence, and JUnit coverage. | [Repo](https://github.com/breakingthebot/library-catalog-java) | Java | Languages | `Expanded` |

</details>

<details>
<summary>JS async (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 12 | 2026-06-27 | [GitHub Profile Viewer](builds/012-github-profile-viewer.md) | Vanilla JS GitHub explorer with profile, repo, and activity views plus search, filter, sort, and full E2E coverage. | [Repo](https://github.com/breakingthebot/github-profile-viewer-vanilla-js) | JS async | Languages | `Deep` |

</details>

<details>
<summary>JS testing (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 13 | 2026-06-28 | [Tested String Utility Library](builds/013-tested-string-utility-library.md) | JavaScript string utility library with 20 modular helpers and a full Jest test suite. | [Repo](https://github.com/breakingthebot/string-utils-jest) | JS testing | Languages | `Expanded` |

</details>

<details>
<summary>Kotlin (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 21 | 2026-07-04 | [Quick Notes Android App](builds/021-quick-notes-android-app.md) | Kotlin Android notes app with Jetpack Compose, Room storage, tags, archive flows, search/sort, widgets, and UI test coverage. | [Repo](https://github.com/breakingthebot/quick-notes-android-compose) | Kotlin | Languages | `Deep` |

</details>

<details>
<summary>PHP (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 14 | 2026-06-28 | [Contact Form Backend](builds/014-contact-form-backend.md) | Modular PHP backend for validating, storing, and emailing contact form submissions. | [Repo](https://github.com/breakingthebot/php-contact-form-backend) | PHP | Languages | `Deep` |

</details>

<details>
<summary>Python (async) (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 2026-06-07 | [Async News Aggregator](builds/002-async-news-aggregator.md) | Async Python CLI that fetches and merges headlines from 5 live news sources concurrently. | [Repo](https://github.com/breakingthebot/Async-News-Aggregator) | Python (async) | Languages | `Expanded` |

</details>

<details>
<summary>Python (automation) (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | 2026-06-09 | [Folder Organizer](builds/004-folder-organizer.md) | Standard-library-only file watcher that auto-sorts downloads by type with reports and config support. | [Repo](https://github.com/breakingthebot/file-organizer) | Python (automation) | Languages | `Expanded` |

</details>

<details>
<summary>Python (CLI tools) (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 7 | 2026-06-17 | [Dev Toolkit](builds/007-dev-toolkit.md) | Click-based Python CLI bundling UUID, password, base64, hashing, timestamp, and file/clipboard utilities. | [Repo](https://github.com/breakingthebot/Dev-toolkit) | Python (CLI tools) | Languages | `Expanded` |

</details>

<details>
<summary>Python (Core) (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-06-06 | [Expense Tracker](builds/001-expense-tracker.md) | Standard-library-only expense tracker with budgets, recurring templates, monthly reports, and CSV export. | [Repo](https://github.com/breakingthebot/expense-tracker) | Python (Core) | Languages | `Expanded` |

</details>

<details>
<summary>Python (data) (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | 2026-06-09 | [Sales Dashboard](builds/003-sales-dashboard.md) | CSV-driven sales analytics tool with pandas and matplotlib reporting, exports, and a Streamlit app. | [Repo](https://github.com/breakingthebot/Sales-Dashboard) | Python (data) | Languages | `Deep` |

</details>

<details>
<summary>Python (ML) (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 6 | 2026-06-12 | [House Price Predictor](builds/006-house-price-predictor.md) | California housing prediction toolkit with selectable models, batch validation, model cards, and a Streamlit UI. | [Repo](https://github.com/breakingthebot/House-price-predictor) | Python (ML) | Languages | `Deep` |

</details>

<details>
<summary>Python (networking) (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | 2026-06-10 | [Chat Server](builds/005-chat-server.md) | Multi-user TCP socket chat server with slash commands, audit logging, and integration-tested protocol flows. | [Repo](https://github.com/breakingthebot/chat-server) | Python (networking) | Languages | `Deep` |

</details>

<details>
<summary>Python (testing) (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 8 | 2026-06-18 | [Tested Calculator Library](builds/008-tested-calculator-library.md) | Installable Python calculator package with CLI, batch processing, history, precision controls, and full pytest coverage. | [Repo](https://github.com/breakingthebot/Python-testing) | Python (testing) | Languages | `Deep` |

</details>

<details>
<summary>Ruby (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 17 | 2026-06-30 | [Log File Analyzer](builds/017-log-file-analyzer.md) | Ruby CLI for streaming server log analysis with gzip input, thresholds, trend buckets, comparison mode, config, and export support. | [Repo](https://github.com/breakingthebot/log-file-analyzer-ruby) | Ruby | Languages | `Deep` |

</details>

<details>
<summary>Rust (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 16 | 2026-06-28 | [File Duplicate Finder](builds/016-file-duplicate-finder.md) | CLI tool that walks a directory tree and finds duplicate files by hash. | [Repo](https://github.com/breakingthebot/file-duplicate-finder-rust) | Rust | Languages | `Expanded` |

</details>

<details>
<summary>Swift (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 20 | 2026-07-03 | [Habit Tracker iOS App](builds/020-habit-tracker-ios-app.md) | SwiftUI habit tracker with search and filters, streaks, reminder scheduling, a weekly dashboard, home screen widgets, and XCTest coverage. | [Repo](https://github.com/breakingthebot/habit-tracker-ios-swiftui) | Swift | Languages | `Deep` |

</details>

<details>
<summary>TypeScript (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | 2026-06-20 | [Typed Task Manager](builds/010-typed-task-manager.md) | Strict TypeScript task manager with status-grouped views, import/export, backup history, bulk actions, and browser tests. | [Repo](https://github.com/breakingthebot/Typed-Task-Manager) | TypeScript | Languages | `Deep` |

</details>

<details>
<summary>Vanilla JS (1)</summary>

| Build # | Date | Project | Description | Repo | Technology | Category | Depth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 9 | 2026-06-19 | [Kanban Board](builds/009-kanban-board.md) | Dependency-free drag-and-drop Kanban board with labels, due dates, undo/redo, and accessibility-tested E2E coverage. | [Repo](https://github.com/breakingthebot/Kanban-Board-Vanilla-JS) | Vanilla JS | Languages | `Deep` |

</details>

## Build Pages
Every build also gets a generated detail page under `builds/` for cleaner per-build reading.

## Stack
- Node.js
- Built-in `node:test` for automation coverage
- JSON as the source of truth for published build entries
- Generated CSV, stats JSON, and per-build markdown pages for secondary views

## Setup
1. Install Node.js 22 or newer.
2. Clone this repo.
3. Run `npm test` to verify the automation.

## Environment Variables
No environment variables are required. See `.env.example`.

## Depth Guide
- `Standard`: solid completion close to the original prompt.
- `Expanded`: clear scope expansion beyond the base prompt.
- `Deep`: larger build depth through extra interfaces, stronger QA, broader feature scope, or deployment polish.

## Running Locally
Run `npm test`.
Run `npm run generate-readme` to rebuild the README from `builds.json`.
Run `node add-build.js --num <number> --name "..." --desc "..." --url "https://github.com/breakingthebot/..." --tech "Technology" --category "Category" --date YYYY-MM-DD --depth Deep --notes "Optional tracker note"` to add a published build, regenerate the README, and update the tracker workbook in one step.
Run `node release-day.js --num <number> --name "..." --desc "..." --url "https://github.com/breakingthebot/..." --tech "Technology" --category "Category" --date YYYY-MM-DD --depth Deep --notes "Optional tracker note"` to run the full release-day sequence: repo check, add build, regenerate README, update tracker, audit locally, and reconcile GitHub.
Run `npm run audit-builds` to compare `builds.json`, the README table, and the tracker workbook.
Run `npm run sync-github-builds` to compare local build entries against the public GitHub repos under `breakingthebot`.

## Deployed
This repo is an index repo and does not require a live deployment.

## Architecture Notes
This repo is the front door for the full build series. The reference files stay in `reference/`, the published build entries live in `builds.json`, and the README is generated from that JSON so the public index stays consistent. I kept the automation small on purpose: one CLI to add a build, one CLI to regenerate the README, and a handful of focused modules so the data, validation, formatting, and file writes stay separate and easy to audit.

## Notes
- The tracker and README are synced to the 16 public build repos currently published under the `breakingthebot` GitHub account.
- The tracker workbook currently contains 246 build rows even though the PDF is described as a 286-item master list. The automation uses the tracker rows that are actually marked complete.
- The remaining unpublished build slots are intentionally left open for future custom build designs and additional portfolio work.
