---
layout: "../../../layouts/Article.astro"
title: "Core Concepts"
part: 3
collection_id: shik-book
---

# Core Concepts

## Everything is function application

There are no operators in the traditional sense. `+ 1 2` is calling the function `+` with arguments `1` and `2`. `list.map`, `file.glob`, `string.upper`, `if`, `let`, `while` — all functions. One rule covers everything.

The dot in `list.map` is part of the name, not a module accessor. `list.map` is one identifier.

## Space as application

```shik
file.glob :./src/**/*.rs    ; apply :./src/**/*.rs to file.glob
+ 1 2                        ; apply 1 and 2 to +
list.at 0 lst                ; apply 0 and lst to list.at
```

Like `f (x)`, without the parentheses.

## Prefix notation

All functions use prefix notation: function name first, then arguments.

```shik
+ 1 2          ; 3
> 5 3          ; true  (is 3 greater than 5? No — see argument order section)
not true       ; false
string.len "hello"    ; 5
```

## The four operators

All four operators are about function application. They differ in direction and precedence.

| Operator | Name | Direction | Precedence |
|----------|------|-----------|------------|
| ` ` | Space / Apply | left→right application | highest |
| `#>` | Flow / Compose | left→right composition | — |
| `$` | Chain | right-to-left | lower |
| `$>` | Pipe | left-to-right | lowest |

**Space — function application:**

```shik
f x           ; f(x)
f x y         ; f(x, y)
list.map (+ 1) [1 2 3]
```

**`#>` — function composition:**

Creates a new function that applies the left function, then the right:

```shik
file.read #> string.lines          ; fn [x] string.lines (file.read x)
file.read #> string.lines #> list.len
let read-lines (file.read #> string.lines)
read-lines :.gitignore             ; ["target" "docs" "releases"]
```

**`$` — chain / right-to-left application:**

Like Haskell's `$`. Eliminates parentheses for right-to-left composition. Right-associative.

```shik
print $ + 1 2                       ; print (+ 1 2)
print $ list.map string.upper $ file.list :./
; same as: print (list.map string.upper (file.list :./))
```

Also extends expressions to the next line:

```shik
if (= shell.os :Darwin) $
  print "macOS" $
  print "other"
```

**`$>` — pipe (lowest precedence):**

Left-to-right application. The result of the left side is passed as the **last argument** to the right side.

```shik
file.read :data.txt $> string.lines $> list.len

; Equivalent to:
list.len (string.lines (file.read :data.txt))

; Multi-line (place $> at end of line):
file.glob :./**/*.txt $>
  list.map file.size $>
  list.sum $>
  print
```

## Operator precedence

From tightest binding to loosest: space > `#>` > `$` > `$>`

```shik
; Example: how does f g #> h parse?
; space binds tighter than #>, so: (f g) #> h
f g #> h        ; = (f g) #> h  — compose the result of (f g) with h

; Example: how does f #> g h parse?
; #> binds tighter than space here at its own level, so right side is g applied to h
f #> g h        ; = f #> (g h)  — compose f with (g applied to h)

; Example: a $> f b
a $> f b        ; b applies to f first (space), then a pipes: (f b) a

; Example: combining all four
file.glob :./src/**/*.rs $>
  list.map (file.read #> string.lines #> list.len) $>
  list.sum $>
  print
; space applies args, #> composes, $> pipes data through the chain
```

## Move application to the next line

You can use operators to move application to the next line, as you've seen before. The rule is: `$`, `$>` or `#>` **must be** on the **end of the line**.

```shik
let x 10

;; Wrong: 5 unrelated applications, if requires at least 2 arguments
if (> x 10)
    (print "x is big")
   (= x 10)
    (print "x is ten")
    (print "x is small")

;; Error: syntax error, $ must have left counterpart
if (> x 10)
   $ (print "x is big)
   $ (= x 10)
   $  (print "x is ten")
   $  (print "x is small")



```

```shik
;; Correct
if (> x 10) $
    (print "x is big") $
    (= x 10) $
     (print "x is ten") $
     (print "x is small")

;; Correct: and beautiful (but not diff friendly)
if (> x 10)               $
    (print "x is big")    $
    (= x 10)              $
     (print "x is ten")   $
     (print "x is small")
```

## Parentheses — grouping only

Parentheses group expressions. They are not function-call syntax.

```shik
(+ 1 2)            ; the value 3
(file.read #> string.lines)    ; a composed function
list.map (+ 1) [1 2 3]         ; (+ 1) is a partial application
```

## Magic symbols — one place to understand them all

There are actually two types of magic symbols: high-born and low-born.

**High-born**:

High-born ones cannot be used in names of variables. True magic beasts. Right now, there is only one of such: `#`.

**Low-born**:

They are trickier. They might appear in the names and non-magic occasions. They are: `$`, `_` and `'`. Poor `>` and `<` just hang around and have nothing to do with magic, they just help out sometimes.

| Prefix | Where | Meaning |
|--------|-------|---------|
| `'(` | Anywhere | Multi-expression block |
| `#>` | Between functions | Composition operator |
| `#rest` | Inside `[...]` pattern | Captures remaining list elements |
| `#name` | Inside `match` block | Captures matched value into `name` |
| `_` | Inside `match` block or pattern | The wildcard, a catch-all option |
| `$>` | Between expressions | Pipe operator |
| `$` | Between expressions | Chain operator |
