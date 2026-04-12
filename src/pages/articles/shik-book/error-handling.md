---
layout: "../../../layouts/Article.astro"
title: "Error Handling & Patterns"
part: 8
collection_id: shik-book
---

# Error Handling

## Error types

**Parse errors** — caught before execution:

```
Parsing failed: Unexpected token 'internal-name' at line 1, column 14. Expected: LeftBracket
```

**Runtime errors — undefined variable:**

```shik
let x (blabla 10)
```
```
UndefinedVariable: Variable 'blabla' is not defined
  --> at line 1, column 8
```

**Runtime errors — type mismatch:**

Shik is dynamically but strictly typed. Functions reject wrong types with a runtime error.

**Runtime errors — IO:**

```shik
file.list :nonexistent/
```
```
RuntimeError: cannot read directory: No such file or directory (os error 2)
  --> at line 1, column 1
```

All errors show the line and column of the offending expression.

## Shell command variants

`file.*` functions terminate the script on failure. Shell commands have variants for different error-handling strategies:

| Variant | On failure | Returns |
|---------|------------|---------|
| `shell` | Throws error | stdout string |
| `shell!` | Throws error | exit code (shows output) |
| `shell.code` | Silent | exit code |
| `shell.full` | Silent | `{stdout stderr code ok}` |
| `shell?` | Silent | `null` |
| `shell.ok?` | Silent | `false` |

```shik
; Check if command succeeded
if (shell.ok? "git pull") $
  print "updated" $
  print "pull failed"

; Get output or default
let result $ or? (shell? "some-command") "default output"

; Full control
let res $ shell.full "risky-command"
if (object.get :ok res) $
  print (object.get :stdout res) $
  print "Error: {object.get :stderr res}"
```

## Current limitations

There is no user-facing `try`/`catch`. Error recovery requires using the `?`/`.code`/`.full` shell variants or `file.read?`. Planned for a future version.

---

# Patterns & Idioms

## Pipeline pattern

```shik
data $>
  transform-step-1 $>
  transform-step-2 $>
  output
```

Each `$>` passes the result as the last argument to the next function. Build up complex operations step by step.

## Composition pattern

```shik
let my-fn (f #> g #> h)
; equivalent to: fn [x] h (g (f x))

let count-lines (file.read #> string.lines #> list.len)
let has-todo    (file.read #> string.has :TODO)
```

Use `#>` to build named predicates and transformers for use in `list.filter`, `list.map`, etc.

## Curried predicate pattern

```shik
; Filter list elements greater than 10
list.filter (> 10) numbers      ; elements where x > 10

; Filter strings containing a keyword
list.filter (string.has :error) log-lines

; Map: add prefix to all strings
list.map (+ "prefix-") names
```

## REPL exploration

```
> help list.
-- list. functions: map, filter, fold, sort, ...

> help list.fold
native-lambda: list.fold
[initial reducer list]: reduces list to single value with accumulator

> let f (file.read #> string.lines)
> f :README.md
["# Shik" "" "A functional..." ...]
```
