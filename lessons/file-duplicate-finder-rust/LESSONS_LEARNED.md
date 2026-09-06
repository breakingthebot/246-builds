# Lessons Learned — File Duplicate Finder
**Build #16 | Rust | CLI Tools | 2026-06-28**

---

## What Worked Well

- **Rust for file system operations**: Rust's ownership model and zero-cost abstractions made the recursive directory walk both memory-safe and fast. No garbage collector pauses meant consistent performance on large directory trees.
- **Two-phase deduplication (size first, then hash)**: Hashing every file is expensive. First grouping by file size and only hashing files that share a size with at least one other file reduced hash computations by ~90% on typical file systems.
- **`blake3` for hashing**: Blake3 is dramatically faster than SHA-256 for file hashing (often 2-4× on modern hardware) while providing the same collision resistance for this use case. The perfect choice for a duplicate-detection tool.
- **`walkdir` crate for directory traversal**: The `walkdir` crate handled symlink loops, permission errors, and cross-device boundaries gracefully — exactly the edge cases that a hand-rolled `std::fs::read_dir` recursive call gets wrong.

## Challenges Overcome

- **Symlink cycles**: Directory trees with symlinks that form cycles would loop infinitely without proper detection. `walkdir`'s `follow_links(false)` by default, with `same_file::is_same_file` checks, prevented this.
- **Permission-denied errors**: On macOS/Linux, some system directories deny read access. Wrapping each directory entry in a `match` and logging permission errors (rather than panicking) kept the tool useful even without root access.
- **Large file streaming**: Loading an entire file into memory to hash it is fine for small files but problematic for multi-GB video files. Implemented chunked reading (`BufReader` with `Read::read` in 64KB chunks) fed into the hasher.
- **Parallel hashing**: The single-threaded implementation was CPU-bottlenecked on directories with many medium-sized files. Added `rayon` parallel iteration over the hash phase, reducing wall time by ~3× on an 8-core machine.

## Key Insights

- Rust's `Result` type makes error handling explicit in a way that prevents "works on my machine" issues from shipping. Every `?` propagation is a deliberate choice about where errors surface.
- Two-pass deduplication (size filter → hash) is a universally applicable optimization for any duplicate-detection algorithm over content-addressable systems.
- `rayon` is one of Rust's killer features for CPU-bound workloads — replacing `.iter()` with `.par_iter()` took one line and gave ~3× speedup.

## Next Time

- Add an `--interactive` mode that prompts which duplicate to keep before deleting.
- Implement `--delete` with a confirmation step and a dry-run mode — deleting files is destructive and needs safeguards.
- Add progress reporting via `indicatif` progress bars for large directory scans.
- Explore using `mmap` instead of `BufReader` for large file hashing on platforms where it's faster.

## Skills Gained

- Rust: ownership, borrowing, `Result`/`Option` propagation, pattern matching
- `walkdir` for robust directory traversal
- `blake3` hashing: streaming API for large files
- `rayon` for data-parallel iteration
- Rust error handling with `thiserror` for typed error variants

## Integration Points

- The two-phase size-then-hash approach is directly applicable to any content-deduplication system, including build artifact caches and backup systems.
- The chunked file reading pattern is a prerequisite for the streaming log file processing in **Log File Analyzer (Build #17)**.
- The `rayon` parallelism experience informed performance thinking in later data-heavy builds.
