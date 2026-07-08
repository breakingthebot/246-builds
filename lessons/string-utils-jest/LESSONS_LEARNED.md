# Lessons Learned — String Utils (Jest)
**Build #13 | JS testing | Libraries & Packages | 2026-06-28**

---

## What Worked Well

- **20 focused, modular helpers**: Each utility (`truncate`, `slugify`, `camelCase`, `stripHtml`, `countWords`, `maskEmail`, etc.) in its own file with a named export made tree-shaking trivial and kept test files 1:1 with source files.
- **Jest as the test runner**: Jest's watch mode, snapshot testing, and coverage reporting made the TDD cycle fast. `jest --coverage` with the `lcov` reporter produced an HTML coverage report that made gaps visual.
- **100% coverage goal**: Achieving 100% branch coverage was harder than 100% line coverage and more valuable. It forced edge cases for things like `truncate` with a string shorter than the limit, `slugify` with Unicode input, etc.
- **`npm pack` dry run**: Running `npm pack --dry-run` before publishing confirmed the package contents were exactly right (no test files, no `.env`, only compiled/source files).

## Challenges Overcome

- **Unicode in string utilities**: `slugify` needed to handle accented characters (`café` → `cafe`), emoji, and RTL characters. Used `String.prototype.normalize('NFD')` + regex to strip combining characters — more robust than a lookup table.
- **`stripHtml` edge cases**: Stripping HTML tags with a regex (`/<[^>]*>/g`) breaks on malformed HTML, nested quotes in attributes, and `<script>` content. Ended up using `DOMParser` in a jsdom environment for correctness.
- **Jest module mocking**: Some helpers depend on `Date.now()` for timestamp-based operations. Mocking `Date` in Jest required `jest.spyOn(Date, 'now').mockReturnValue(...)` — replacing `Date` globally caused issues.
- **ESM vs CJS**: The library needed to be importable as both `import { slugify } from 'string-utils'` (ESM) and `const { slugify } = require('string-utils')` (CJS). Used the `exports` field in `package.json` with dual-format output.

## Key Insights

- A utility library is only as good as its edge case coverage. The most interesting bugs were in "boring" functions: `truncate` at exact boundary, `padLeft` with a multibyte character, `countWords` with only whitespace.
- Jest's `test.each` (the Jest equivalent of pytest's `parametrize`) is the right tool for data-driven tests. Using it for all 20 functions reduced test boilerplate by ~60%.
- The `exports` field in `package.json` for dual CJS/ESM builds was more complex than expected — worth using a build tool (tsup or Rollup) rather than managing it manually.

## Next Time

- Use TypeScript for the source and ship `.d.ts` type declarations alongside the library — JavaScript library consumers expect types now.
- Add a `CHANGELOG.md` and `CONTRIBUTING.md` from the start to practice open-source maintenance habits.
- Benchmark performance-sensitive helpers (e.g., large string processing) with `Benchmark.js`.
- Add integration tests that import the `npm pack`ed tarball to test the actual published package shape.

## Skills Gained

- Jest: `test.each`, coverage reporting, `jest.spyOn`, module mocking
- JavaScript string manipulation: `normalize`, Unicode handling, regex edge cases
- npm packaging: `exports` field, dual CJS/ESM builds, `npm pack`
- TDD with 100% branch coverage as the target

## Integration Points

- The `slugify` utility from this library was used directly in **FlavorFind (Build #25)** for recipe URL slug generation.
- The `test.each` pattern was adopted in all subsequent JavaScript/TypeScript test suites.
- The dual-format packaging experience informed the module system decisions in **Music Player (Build #11)**.
