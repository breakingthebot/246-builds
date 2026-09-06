# Lessons Learned — Python Testing (Calculator Library)
**Build #8 | Python (testing) | Libraries & Packages | 2026-06-18**

---

## What Worked Well

- **pytest as the test framework**: pytest's fixture system, parametrize decorator, and readable assertion output made it the clear winner over `unittest`. The `@pytest.mark.parametrize` decorator eliminated dozens of near-identical test functions.
- **Installable package structure**: Organizing as a proper Python package (`pyproject.toml`, `src/` layout) and using `pip install -e .` meant the CLI and library could be imported the same way in tests as they would be by real users.
- **Batch processing mode**: Accepting a file of calculations and producing a results file made the library useful for automated workflows, not just interactive use.
- **History with persistence**: Storing calculation history in a JSON file and providing `--history` and `--clear-history` flags gave the CLI real statefulness that users appreciated.
- **Precision controls (`decimal.Decimal`)**: Using Python's `decimal` module instead of `float` for financial calculations eliminated floating-point errors — `0.1 + 0.2 == 0.3` when done right.

## Challenges Overcome

- **Testing CLI commands with pytest**: Testing Click commands required `click.testing.CliRunner` to invoke commands in a controlled environment without spawning subprocesses.
- **Fixture isolation for history file**: Tests that read/write history needed isolated temp directories. `tmp_path` pytest fixture solved this cleanly — each test got its own directory.
- **Division by zero and edge cases**: The most valuable testing exercise was enumerating every edge case: `0/0`, `float('inf')`, negative square roots, overflow. Many were caught by tests before they became real bugs.
- **Decimal precision in parametrized tests**: Floating-point comparison in tests required `pytest.approx()` for `float` results, but exact equality for `Decimal` results — easy to mix up.

## Key Insights

- Writing the tests first (TDD) for the edge cases (division by zero, overflow) actually shaped the API design. The function signatures changed to make testing easier — and ended up being cleaner as a result.
- `@pytest.mark.parametrize` with a list of `(input, expected)` tuples is the most scalable way to test mathematical functions with many cases.
- Coverage reports (`pytest --cov`) are motivating — watching 73% → 94% → 100% coverage is satisfying and surfaces untested paths.

## Next Time

- Add property-based testing with `hypothesis` — generating random valid inputs and checking invariants (e.g., `add(a, b) == add(b, a)`) would catch edge cases no human would think of.
- Publish to PyPI (even a test PyPI upload) to complete the "real library" experience.
- Add type hints to the entire public API and run `mypy` in CI.
- Write a proper `CHANGELOG.md` and use semantic versioning from `v0.1.0`.

## Skills Gained

- pytest: fixtures, parametrize, `tmp_path`, `CliRunner`, coverage reporting
- Python packaging: `pyproject.toml`, `src/` layout, `pip install -e .`
- `decimal.Decimal` for precision arithmetic
- TDD workflow: writing tests before implementation
- Edge case enumeration for mathematical libraries

## Integration Points

- The pytest patterns established here became the testing baseline for all subsequent Python projects — **SQL Analytics Library (Build #24)** uses the same fixture/parametrize approach.
- The installable package structure was reused directly in **Dev Toolkit (Build #7)** and **Async News Aggregator (Build #2)** (retroactively).
- The `Decimal` precision pattern informed the money/currency handling in **Budget Tracker (Build #19)**.
