---
layout: "../../../layouts/Article.astro"
title: "Variables & Scope"
part: 5
collection_id: shik-book
---

# Variables & Scope

## Binding: `let`

```shik
let x 10
let name :Alice
let double fn [n] * n 2
```

`let` binds a name in the current scope. If the name already exists in the current scope, it is rebound (shadowed within that scope). Inner scopes can shadow outer ones.


## Naming

Variable names can include any characters: letters, digits, `-`, `.`, `!`, `?`, `+`, `*`, etc. `.` is just part of the name; `!` and `?` are conventional suffixes (not syntax).

```shik
let my-function fn [x] x
let file.reader fn [name] fn [] file.read name
let empty? fn [lst] list.empty? lst
```

## Mutation: `set`

```shik
let x 10
set x 20       ; x is now 20
set x (+ x 5) ; x is now 25
```

`set` modifies an existing binding in the nearest enclosing scope that has it. If the variable does not exist anywhere in scope, it is an error.

Compound assignment shorthands:

```shik
set+ x 5    ; x = x + 5
set- x 3    ; x = x - 3
```

## Destructuring: `let$`

`let$` binds multiple names from a list in one step:

```shik
let$ [a b c] [1 2 3]     ; a=1, b=2, c=3
let$ [head #rest] lst    ; head=first element, rest=remaining list
let$ [x _] [10 20]       ; x=10, _ discarded

; Nested
let$ [KITTY-PATH FISH-PATH] [(make-path :kitty) (make-path :fish)]
```

The pattern syntax inside `let$` is the same as in `match` (see [Control Flow](/articles/shik/control-flow)).

## Scope rules

Shik uses lexical scoping. Free variables in a function are resolved in the scope where the function is written. Closures hold a reference to the variable binding, so `set` mutations are visible:

```shik
let x 100
let f fn [n] + x n

f 5      ; 105
set x 10
f 5      ; 15
```

Each function call gets its own scope for locals; mutations to `let`-bound variables inside a function do not escape:

```shik
let x 0
let counter fn [] '(
  let x 99    ; new binding in this call's scope
  x
)
counter    ; 99
x          ; still 0
```

To share mutable state across calls, capture the variable from an outer scope:

```shik
let x 0
let bump fn [] set x (+ x 1)    ; mutates the outer x
bump   ; x becomes 1
bump   ; x becomes 2
x      ; 2
```

**if and '( blocks**:

Variables are not block-scoped:

```shik
if true
    '(let x 10
      print "I have x: {x}") ;; called
    '(let y 20
      print "I have y: {y}")

print x ;; 10
print y ;; Error: UndefinedVariable
```

## Dynamic variable lookup: `var.get`

```shik
var.get "x"          ; returns the value of variable x, or null
var.get "list.map"   ; works for any name in scope
```

This allows treating variable names as data — an `eval`-like behavior, but sometimes might be useful.
