---
layout: "../../../layouts/Article.astro"
title: "Examples & Performance"
part: 10
collection_id: shik-book
---

# Examples

Runnable scripts are in the [`demo/`](https://github.com/pungy/shik/tree/main/demo) directory.

### [Sort by size](https://github.com/pungy/shik/blob/main/demo/files-new-demo.shk)

List `.docx` files sorted by size with human-readable byte counts. Shows list destructuring in `list.sort` comparators and `string.bytes`.

### [Pattern matching](https://github.com/pungy/shik/blob/main/demo/match.shk)

Some examples of using pattern matching.

### [XO kata](https://github.com/pungy/shik/blob/main/demo/xo.shk)

[Codewars kata](https://www.codewars.com/kata/55908aad6620c066bc00002a): check whether a string has equal numbers of `x` and `o`. Shows `string.iterate` with mutable closure state and `if` as a multi-branch expression.

### [Dice game](https://github.com/pungy/shik/blob/main/demo/dice-game.shk)

[Codewars kata](https://www.codewars.com/kata/5270d0d18625160ada0000e4): score a five-dice throw by the Greed rules. Shows `list.fold` building a frequency object, `match` dispatching on dice face, and curried scoring helpers.

### [Scoping](https://github.com/pungy/shik/blob/main/demo/nested-scope.shk)

Counter factory: `counter n` returns a `bump` function that closes over its own `x`. Three independent counters, outer `x` untouched. Shows lexical closures and mutable captured state.

### [Chain list](https://github.com/pungy/shik/blob/main/demo/chainer.shk)

Recursion+pattern matching. Format a list as `[a-b-c-d]` via recursion and `match` on length. Includes a one-liner equivalent using `string.join` to show the contrast.

---

# Performance

Shik is written in Rust with a tree-walk interpreter, Rc/RefCell memory management (no tracing GC), and all built-in functions implemented in native Rust. IO-bound workloads are fast. CPU-bound algorithmic work (heavy branching, deep recursion) is slower.

**Benchmark: count lines across ~9,800 lines of Rust source (37 files).** Via `hyperfine --warmup 3 -N`, macOS, Apple Silicon.

**Shik:**

```shik
file.glob :./src/**/*.rs $>
  list.map (file.read-lines #> list.len) $>
  list.sum $> print
```

**Bash:**

```bash
find ./src -name '*.rs' -exec cat {} + | wc -l
```

**Python:**

```python
from pathlib import Path
print(sum(len(f.read_text().splitlines()) for f in Path('./src').rglob('*.rs')))
```

| Tool | Time | Memory |
|------|------|--------|
| **Shik** | 4.4 ms | 2.6 MB |
| Bash | 9.1 ms | 2.1 MB |
| Python | 30.3 ms | 12 MB |

---

For CPU-bound algorithmic work (e.g. a dice game win probability calculator), Shik is roughly **10× slower than Python**. Optimization is planned, but ergonomics come first.

**Shik:** [Dice game](https://github.com/pungy/shik/blob/main/demo/dice-game.shk)

But replaced in the end with

```shik
list.range 1000 $> list.iterate fn [_] '(
  dice-game [5 1 3 4 1]
  dice-game [1 1 1 3 1]
  dice-game [2 4 4 5 4]
)
```

**Python:**

```python
from collections import Counter

def dice_game(throw):
    bucket = Counter(throw)

    def count_accumulative(triple_mod, single_mod, count):
        if count == 3:
            return triple_mod
        elif count > 3:
            return triple_mod + (count % 3) * single_mod
        else:
            return (count % 3) * single_mod

    score = 0
    for dice, count in bucket.items():
        if dice == 1:
            score += count_accumulative(1000, 100, count)
        elif dice == 5:
            score += count_accumulative(500, 50, count)
        elif count >= 3:
            score += dice * 100

    return score

for _ in range(1000):
    dice_game([5, 1, 3, 4, 1])
    dice_game([1, 1, 1, 3, 1])
    dice_game([2, 4, 4, 5, 4])
```

**Result:**

```
Benchmark 1: shik dice-game.shk
  Time (mean ± σ):     335.2 ms ±   5.8 ms    [User: 312.1 ms, System: 17.5 ms]
  Range (min … max):   326.2 ms … 341.6 ms    10 runs
 
Benchmark 2: python3 dice-game.py
  Time (mean ± σ):      30.9 ms ±   3.1 ms    [User: 23.3 ms, System: 5.2 ms]
  Range (min … max):    28.5 ms …  45.1 ms    89 runs

Summary
  python3 dice-game.py ran
   10.84 ± 1.10 times faster than shik dice-game.shk
```

Shik is positioned for IO-bound shell automation, not complex lifetime applications or servers.

---

# Roadmap

Current version: **v0.7.1**

Planned, roughly in priority order:

- Shebang support (`#!/usr/bin/env shik`)
- Object destructuring
- Regular expressions
- Multiple statements per line with `,`
- Networking
- Lambda shorthand (`#(- #1 #2)` instead of `fn [a b] - a b`)
- JSON parsing
- User-facing error handling (`try`/`catch` or similar)
- Threading

---

# Contributing

Shik is in active development. The codebase is a Rust project; see [`CLAUDE.md`](https://github.com/pungy/shik/blob/main/CLAUDE.md) (named after one nice fella, he is a great contributor) for architecture notes and conventions for adding native functions.

Issues and PRs welcome at [github.com/pungy/shik](https://github.com/pungy/shik).

**License:** MIT
