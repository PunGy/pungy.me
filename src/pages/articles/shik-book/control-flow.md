---
layout: "../../../layouts/Article.astro"
title: "Control Flow"
part: 6
collection_id: shik-book
---

# Control Flow

## `if`

`if` is a function with a dynamic number of arguments.

```shik
; Two args: condition + then-branch (no else, returns null on false)
if (< x 10) (print :small)

; Three args: condition + then + else
if (< x 10) (print :small) (print :big)

; Even number of args: pairs of (condition, branch)
if
  (< x 0)  (print :negative) $
  (< x 10) (print :small)    $
  (< x 100) (print :medium)

; Odd number of args (> 3): same but last arg is the else-branch
if (< x 0)  (print :negative) $
   (< x 10) (print :small)    $
   (print :big)
```

Combining with `$` to span multiple lines:

```shik
let dice (number.rand 1 7)
if (< dice 3)  $
     :lose     $
   (<= dice 5) $
     :win      $
   :Jackpot!   $> print
```

## `match`

Pattern matching against a value. `match` takes a value and an object-like block of patterns and results.

```shik
match value {
  pattern1   result1
  pattern2   result2
  _          default-result
}
```

**Pattern types:**

| Pattern | Matches | Notes |
|---------|---------|-------|
| `42` | exactly the number 42 | Any literal |
| `:hello` | exactly the string "hello" | Symbol literal |
| `variable` | the current value of `variable` | Variable must be in scope |
| `_` | anything | Wildcard, no binding |
| `#name` | anything | Wildcard, binds matched value to `name` |
| `[x y]` | list with exactly 2 elements | Binds x and y |
| `[x y #rest]` | list with 2+ elements | x=head, y=second, rest=tail |
| `[]` | empty list | |

```shik
let value [1 2 3 4]
let variable 500

match value {
  :literal    :exact-match              ; matches string "literal"
  variable    "exactly 500"             ; matches value of variable (500)
  [x y #rest] "head={x}, rest={rest}"  ; matches list, binds x=1, y=2, rest=[3 4]
  _           :wildcard
} $> print
; Output: head=1, rest=[3 4]

; Wildcard with binding
match value {
  []    :empty
  #v    "got: {v}"    ; captures value in v
}

; Nested list patterns
match pairs {
  [[k v] #rest]   "first key is {k}"
  _               :empty
}
```

`match` returns the result of the matched branch. The last expression in a `'(...)` branch is the return value.

```shik
let score match grade {
  :A  100
  :B  80
  :C  60
  _   0
}
```

## `while`

Loops while a zero-argument function returns `true`:

```shik
let x 10
while (fn [] '(
  set x (- 1 x)
  print "x is {x}"
  > x 0
))
```

The function is called on each iteration. The loop stops when it returns a falsy value.

## Early exit

There is no `break` or `return`. Use recursion, `match`, or mutable state to control flow. For the current process, use `process.abort` to terminate execution.
