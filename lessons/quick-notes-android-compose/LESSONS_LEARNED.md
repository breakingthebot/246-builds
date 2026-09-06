# Lessons Learned — Quick Notes Android App
**Build #21 | Kotlin / Jetpack Compose | Mobile Apps | 2026-07-05**

---

## What Worked Well

- **Jetpack Compose with Material 3**: Writing the entire UI in Compose (no XML layouts) was the right choice. Composable functions with `@Preview` annotations made UI iteration fast — seeing component previews in Android Studio without running the emulator saved significant time.
- **Room for persistence**: Room's type-safe queries with `@Dao` interfaces and `Flow<List<Note>>` return types made the database layer reactive by default. Any UI change to the notes table automatically updated the list — no manual refresh needed.
- **Tags with many-to-many relationship**: Implementing tags as a many-to-many join table (`NoteTagCrossRef`) with a `NoteWithTags` relation was the right data model for a tag system. Room's `@Relation` annotation handled the JOIN.
- **Archive/restore flows**: Rather than deleting notes, archiving them (setting `isArchived = true`) with a dedicated archive view preserved content while keeping the main list clean. This UX pattern is much better than immediate deletion.
- **Home screen widgets**: `AppWidgetProvider` with a `RemoteViews` layout for a "recent notes" widget required understanding that widgets use a completely different rendering path than Compose — `RemoteViews` is an old XML-based system.

## Challenges Overcome

- **Compose recomposition performance**: A `LazyColumn` of notes with tag chips was recomposing unnecessarily when unrelated state changed. Fixed with `key` parameters on list items and `remember`/`derivedStateOf` to avoid recomputing filtered lists on every recomposition.
- **Room database migrations**: When the `Note` schema changed (added `color` field), a migration was needed. Room's `Migration` class with `addColumn` SQL was straightforward, but forgetting to add a migration caused a crash on upgrade. Added `fallbackToDestructiveMigration()` for development, removed it before release.
- **Background work for auto-archive**: Automatically archiving notes older than a configurable threshold required a `WorkManager` periodic task — Kotlin coroutines work for one-shot background work, but `WorkManager` is the right tool for periodic background tasks that survive device restarts.
- **Automated UI regression coverage**: Compose UI tests with `ComposeTestRule` verified that the note list displayed correctly after DB operations. Getting test isolation right (clearing the database between tests) required an in-memory Room database for tests.

## Key Insights

- Compose recomposition is not free — use `key`, `remember`, and `derivedStateOf` to give the Compose runtime hints about stability. Profile recomposition with the Layout Inspector.
- Room + `Flow` is the correct reactive data pattern for Android. Never use `LiveData` for new Kotlin code — `Flow` with `collectAsStateWithLifecycle()` in Compose is the modern approach.
- `WorkManager` is the only reliable way to schedule periodic background work on Android — services, alarms, and coroutines all have platform restrictions that make them unreliable for background tasks.

## Next Time

- Implement a proper backup/export feature using `FileProvider` and the Storage Access Framework.
- Add rich text support for note content using a Compose-compatible Markdown renderer.
- Use the `Paging 3` library for the notes list when the note count grows large.
- Add proper `@VisibleForTesting` annotations to avoid exposing internal methods in the production API.

## Skills Gained

- Jetpack Compose: composables, `@Preview`, `LazyColumn`, `key`, recomposition optimization
- Room: `@Entity`, `@Dao`, `@Relation`, `Flow` integration, migrations
- `WorkManager` for periodic background tasks
- `AppWidgetProvider` and `RemoteViews` for home screen widgets
- Compose UI testing with `ComposeTestRule`

## Integration Points

- The Compose architecture (ViewModel + Room + Flow) is the Android equivalent of the SwiftUI architecture (`@StateObject` + `SwiftData` + `@Published`) in **Habit Tracker (Build #20)** — same pattern, different platform.
- The archive/restore UX pattern is applicable to any list-based app and was the inspiration for similar "soft delete" patterns in web builds.
- Widget implementation patterns from both this build and Build #20 form a cross-platform reference for home screen widget development.
