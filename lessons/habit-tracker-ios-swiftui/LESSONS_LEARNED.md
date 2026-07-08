# Lessons Learned — Habit Tracker iOS App
**Build #20 | Swift / SwiftUI | Mobile Apps | 2026-07-03**

---

## What Worked Well

- **SwiftUI for the entire UI**: Building the entire app in SwiftUI (rather than UIKit) meant 100% declarative UI code. `@State`, `@StateObject`, and `@EnvironmentObject` handled all UI reactivity — no imperative `viewDidLoad` patterns.
- **Search and filters**: A searchable habit list with filters (category, streak length, active/archived) used SwiftUI's `.searchable()` modifier — one of SwiftUI's best quality-of-life additions that previously required significant UIKit boilerplate.
- **Streak calculation**: Computing current and longest streaks required careful date arithmetic with `Calendar.current` — using `Calendar` (rather than raw `TimeInterval` math) correctly handled daylight saving time transitions and different locale calendars.
- **Reminder scheduling with `UNUserNotificationCenter`**: Per-habit notification scheduling with custom times and days of the week worked well once the permission request flow was handled properly.
- **WidgetKit home screen widgets**: Adding a small widget showing today's habits and completion status was the most technically challenging feature — WidgetKit's `TimelineProvider` model is different from regular SwiftUI views.
- **XCTest coverage**: Unit tests for streak calculation and integration tests for the persistence layer caught real bugs, especially in the edge cases around timezone changes.

## Challenges Overcome

- **WidgetKit `TimelineProvider` model**: WidgetKit widgets don't run continuously — they render snapshots at provider-specified intervals. Getting the widget to reflect habit completions immediately required a shared `App Group` container (shared `UserDefaults`) between the app and the widget extension.
- **`Calendar`-based date comparison**: "Is today a completion day?" required `Calendar.current.isDateInToday(date)` rather than comparing `Date` objects directly — the latter fails near midnight due to time components.
- **SwiftUI `@AppStorage` vs. `UserDefaults`**: `@AppStorage` is a SwiftUI binding to `UserDefaults`, but it doesn't support complex types like arrays of `Habit` objects. Used `Codable` + `Data` storage with `@AppStorage` for simple values and `FileManager` + JSON for the full habit list.
- **Notification permission UX**: The system notification permission dialog is shown once and cannot be shown again if denied. Had to add a custom explanation screen before requesting permission, and a settings-redirect if permission was denied.

## Key Insights

- SwiftUI's `@State`/`@StateObject`/`@EnvironmentObject` hierarchy is not arbitrary — `@State` is local view state, `@StateObject` is owned reference type state, `@EnvironmentObject` is injected shared state. Misusing these causes subtle bugs.
- WidgetKit is a fundamentally different programming model from UIKit/SwiftUI apps. The `Timeline` + `Entry` + `Provider` pattern needs to be understood from scratch, not intuited from app development.
- Always use `Calendar` for date comparisons in Swift. Raw `Date` arithmetic ignores DST, leap seconds, and locale-specific week start days.

## Next Time

- Use `SwiftData` (iOS 17+) instead of manual `Codable` + `FileManager` for persistence — it's the modern SwiftUI-native persistence layer.
- Add iCloud sync via `CloudKit` so habits persist across devices.
- Add a weekly review screen with charts using Swift Charts (native SwiftUI charting).
- Add accessibility audit with VoiceOver testing.

## Skills Gained

- SwiftUI: property wrappers (`@State`, `@StateObject`, `@AppStorage`), `.searchable()`, navigation
- WidgetKit: `TimelineProvider`, `App Groups`, shared container storage
- `UNUserNotificationCenter` for local notification scheduling
- `Calendar`-based date arithmetic and DST-safe comparisons
- XCTest: unit and integration testing for iOS

## Integration Points

- The notification scheduling patterns from this build carry directly into **Quick Notes Android App (Build #21)** — same concept, different platform API.
- WidgetKit `App Groups` shared storage is the iOS equivalent of Android's `AppWidgetProvider` shared preferences used in Build #21.
- The streak calculation logic (with calendar-aware date comparison) is directly reusable in any habit/gamification feature.
