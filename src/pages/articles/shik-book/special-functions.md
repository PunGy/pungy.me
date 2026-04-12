---
layout: "../../../layouts/Article.astro"
title: "Special Functions"
part: 7
collection_id: shik-book
---

# Special Functions

In Lisp known as special forms. Most functions in Shik are uniform: arguments are evaluated left-to-right before the call, the function receives values, currying works automatically. A small set of built-ins breaks some rules. This section documents them and the constraints that follow.

## Non-functions

`fn`, `match`, and `let$` look like function application but are complete syntax constructions parsed by the language itself — not callable values.

```shik
fn [x] + x 1          ; lambda literal
match value { ... }   ; pattern match
let$ [a b] [1 2]      ; destructuring bind
```

**Constraints:**

- Cannot appear on the right-hand side of `$>`, `$`, or `#>`. The operators require an expression that evaluates to a callable value; these constructions are not values.
- Cannot be stored, passed, or returned — they have no runtime representation.
- Cannot be partially applied.

```shik
; All of these are errors:
[1 2] $> match { ... }
[1 2] $> let$ [a b]

let bind (let$ [a b])
```

## Conditionally evaluated arguments

These functions receive some arguments as unevaluated expressions and decide whether to evaluate them at all. The evaluation happens inside the function, not before the call.

| Function | Lazy arguments | Condition |
|----------|---------------|-----------|
| `if` | all branches and predicates | only the matching branch and tested predicate is evaluated |
| `and` | second argument | skipped if first is falsy |
| `or` | second argument | skipped if first is truthy |
| `or?` | default (first argument) | skipped if value (second) is not null |
| `while` | body | re-evaluated on each iteration |
| `let` | name (first argument) | always treated as a symbol, never evaluated as an expression |
| `set`, `set+`, `set-` | name (first argument) | same as `let` |
| `'` and `fn.quote` | its argument | identifiers inside are not resolved |

The practical consequence: side-effecting expressions in skipped branches do not run.

```shik
; The print never executes when x > 0:
if (> x 0) :ok (print "only when x <= 0")

; The second branch is never evaluated when the first is truthy:
or true (print "never runs")
```

`let` and `set` require their first argument to be a plain identifier — it is never evaluated as an expression:

```shik
let x 10     ; x is a name, not looked up
set x 20     ; x is a name, not looked up
```

**Constraints:** None. You can use operators and currying with them (except those in the variadic category).

## Variadic functions

These functions accept a variable number of arguments. Because the arity is not fixed, they cannot be curried — partial application would be ambiguous.

| Function | Accepted argument counts |
|----------|--------------------------|
| `if` | 2 (condition + then), 3 (+ else), or any even/odd count for multi-branch form |
| `number.rand` | 0 (float 0–1), 1 (int 0–max), 2 (int min–max) |
| `list.range` | 1 (end), 2 (start end), 3 (start end step) |
| `shell.ask` | 0 (no prompt), 1 (prompt string) |
| `help` | 0 (overview), 1 (topic) |

**Constraints:** Cannot be curried. Passing fewer arguments than any valid form does not produce a partial function — it is an error or undesired evaluation.

```shik
; This does not create a partially-applied if — it is an error:
let check (if (> x 0))

; Rand would be a number!
let rand number.rand
```

## Polymorphic functions

Shik is a strongly-typed language, and type mismatching would cause a RuntimeError. But there are some functions that work across multiple types:

| Function | Types | Description |
|----------|-------|-------------|
| `+` | Number+Number, String+String, String+other | Addition or concatenation; with String+other, the other value is converted to string |
| `at` | (index, String) or (index, List) | Get element at index |
| `iterate` | (fn, String) or (fn, List) | Iterate over characters or elements |
| `iterate-backward` / `<iterate` | (fn, String) or (fn, List) | Iterate in reverse |
| `print` | any | Print value to stdout |

**Constraints:** None.
