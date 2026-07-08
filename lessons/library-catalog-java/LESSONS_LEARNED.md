# Lessons Learned — Library Catalog
**Build #18 | Java | Desktop & Console Apps | 2026-06-30**

---

## What Worked Well

- **Object-oriented design with `Book` and `Member` classes**: Java's OOP model was well-suited for a library domain. `Book` (ISBN, title, author, available copies) and `Member` (ID, name, checkout history) mapped cleanly to real-world entities, and `instanceof` checks + polymorphism handled different item types naturally.
- **Checkout flow with business rules**: Encoding rules like "max 5 books per member," "cannot check out an already-checked-out copy," and "overdue detection" as methods on the `Catalog` service class kept business logic centralized and testable.
- **File persistence with serialization**: Using Java's `ObjectOutputStream`/`ObjectInputStream` for save/load kept the code simple while providing full state persistence between runs.
- **JUnit test coverage**: JUnit 5 with AssertJ assertions produced readable, maintainable tests. Testing checkout/return flows with specific preconditions (member with 4 books, overdue item, etc.) validated the business rules rigorously.

## Challenges Overcome

- **Java serialization versioning**: When the `Book` class schema changed (added a `genre` field), existing serialized files became unreadable. Added a `serialVersionUID` constant and a migration path — learned this lesson the hard way.
- **Overdue date calculation**: Computing "days overdue" with `java.time.LocalDate.until()` was straightforward, but timezone handling for libraries that span midnight boundaries required `ZonedDateTime`.
- **Console UI without a framework**: Building an interactive menu (`1. Check out book / 2. Return book / 3. Search`) with `Scanner` required careful input validation and loop management. Every `nextInt()` needed a `nextLine()` consume after it to avoid skipping the next prompt.
- **JUnit test isolation**: Tests that modified the shared `Catalog` instance leaked state into subsequent tests. Fixed by instantiating a fresh `Catalog` in `@BeforeEach`.

## Key Insights

- `serialVersionUID` is not optional — set it explicitly on every `Serializable` class from the first commit, or schema evolution becomes a breaking change.
- Java's `java.time` API (`LocalDate`, `ZonedDateTime`, `Duration`) is far better than the old `java.util.Date`. There is no reason to use `Date` in new code.
- The `Scanner` stdin buffering issue (mixing `nextInt()` and `nextLine()`) is a classic Java pitfall. Using only `nextLine()` and parsing manually is simpler.
- Writing tests for business rule violations (check out past limit, return an item not checked out) is more valuable than testing the happy path.

## Next Time

- Use a proper file format (JSON via Jackson, or SQLite via JDBC) instead of Java serialization for persistence — more portable, easier to debug.
- Add a proper exception hierarchy (`BookNotFoundException`, `MemberLimitExceededException`) rather than generic `RuntimeException`.
- Add a REST API layer (Spring Boot) so the catalog is accessible over HTTP, not just via the console.
- Explore Java records (Java 14+) for the `Book` and `Member` value objects.

## Skills Gained

- Java OOP: inheritance, interfaces, polymorphism
- `java.time` API: `LocalDate`, `ZonedDateTime`, period/duration calculations
- Java serialization and `serialVersionUID`
- JUnit 5 with `@BeforeEach`, `@Test`, AssertJ assertions
- Console UI design with `Scanner`

## Integration Points

- The business-rule-in-service-layer pattern is the same architecture as the checkout flow in **Budget Tracker (Build #19)**.
- Java serialization versioning lessons informed the data schema migration thinking in **Kanban Board (Build #9)**.
- JUnit testing patterns are structurally identical to the C# xUnit patterns used in **Budget Tracker (Build #19)**.
