---
layout: "../../../layouts/Article.astro"
title: "Functions"
part: 4
collection_id: shik-book
---

# Functions

Functions are first-class values. The `fn` literal (see [Literals](/articles/shik/literals#functions)) produces a function; `let` binds it to a name.

```shik
let greet fn [name] "Hello, {name}!"
greet :Alice      ; Hello, Alice!

let add fn [x y] + x y
add 3 4           ; 7
```

Arguments can be destructured directly in the argument list:

```shik
fn [[x y]] + x y        ; expects a two-element list, binds x and y
fn [[head #rest]] head  ; expects a list, binds head and rest

; Common in higher-order functions:
list.iterate (fn [[key val]] print "{key}: {val}") (object.entries obj)
list.sort (fn [[_ a] [_ b]] - a b) pairs
```

The same `#rest` pattern used in `match` works here: `[x #rest]` binds the first element to `x` and the remainder to `rest`.

## Multi-expression body with `'(...)`

When a function body needs multiple statements, wrap them in `'(...)`. The `'` prefix distinguishes a block from a parenthesized expression. The last expression is the return value.

```shik
let fac fn [x] '(
  if (< x 2) $
    1 $
    (* x (fac (- 1 x)))
)

let counter fn [base] '(
  let x base
  let bump fn [much] set x (+ much x)
  bump             ; returned: a function that mutates x
)
```

`'(...)` can also be used standalone, outside a function, to sequence expressions.

## Currying

Every function supports partial application. Provide fewer arguments than expected — get a new function waiting for the rest.

```shik
let add-one (+ 1)            ; function: add 1 to its argument
add-one 5                    ; 6

let write-to (file.write :out.txt)   ; function: write to out.txt
write-to "hello"             ; writes "hello" to out.txt

let inc (+ 1)
[1 2 3] $> list.map inc      ; [2 3 4]

let has-todo (string.has :TODO)
file.glob :./src/**/*.rs $> list.filter (file.read #> has-todo)

let subtract-one (- 1)       ; function: subtract 1 from argument
[10 20 30] $> list.map subtract-one   ; [9 19 29]
```

Currying makes `#>` and `$>` pipelines possible without lambdas in most cases.

Functions that cannot be curried (variadic / special forms): `if`, `help`, `number.rand`, `list.range`, `shell.ask`.

## Argument order philosophy

Argument order is designed to maximize the usefulness of partial application. The convention: **fix what you know, receive what varies last.**

**Arithmetic**: _MODIFIER_ first, _BASE_ last.

`- 1 5` = `4` (subtract 1 from 5). `/ 2 10` = `5` (divide 10 by 2). `^ 3 5` = `125` (raise 5 to power 3).

This is unconventional but makes currying uniform:

```shik
lst $> list.map (+ 1)    ; add 1 to each
lst $> list.map (- 1)    ; subtract 1 from each
lst $> list.map (* 2)    ; multiply each by 2
lst $> list.map (^ 2)    ; square each
```

All four lines follow the same pattern. If `-` worked as "first minus second," `(- 1)` would mean "1 minus something," breaking the symmetry. You would need `fn [x] - x 1` instead.

**Read**: _SPECIFIER_ first, then _TARGET_.

```shik
list.at 0 lst            ; which index, from which list
list.map (+ 1) lst       ; which function, on which list
string.has :a :banana    ; what to find, in what string
object.get :name obj     ; which key, from which object
```

**Write/mutation**: _DESTINATION_ first, then _CONTENT_.

```shik
file.write :out.txt "content"    ; where, then what
file.copy :dest :source          ; where to, then from
list.set 0 lst 10                ; index, list, value
object.set :key obj val          ; key, object, value
```

This allows:

```shik
files $> list.iterate (file.copy :backup/)   ; copy each file to backup/
```

## Composition with `#>`

`f #> g` creates `fn [x] g (f x)`.

```shik
let read-lines (file.read #> string.lines)
let count-lines (file.read #> string.lines #> list.len)

; Point-free predicate
let has-todo (file.read #> string.has :TODO)
file.glob :./src/**/*.rs $> list.filter has-todo

; In a pipeline
file.glob :./src/**/*.rs $>
  list.map (file.read #> string.lines #> list.len) $>
  list.sum $>
  print
```
