---
layout: "../../../layouts/Article.astro"
title: "Literals"
part: 2
collection_id: shik-book
---

# Literals

## Numbers

Numbers are 64-bit floats (`f64`). Integer syntax is supported but all values are floats internally.

```shik
42
3.14
-17
0
```

## Strings

Strings are UTF-8, delimited by double quotes.

```shik
"hello world"
"line one\nline two"
"tab\there"
"quote: \""
```

**String interpolation:** any expression inside `{...}` is evaluated and embedded into the string.

```shik
let name :Alice
"Hello, {name}!"         ; Hello, Alice!
"Sum: {+ 10 20}"         ; Sum: 30
"Path: {path.join :src file}"
```

**String shorthand**:  A `:word` is shorthand for the string `"word"`. It is a regular string, just another syntax for string declaration, useful when typing strings without spaces (which is, in practice, most of strings).

```shik
:hello            ; same as "hello"
:./src/**/*.rs    ; same as "./src/**/*.rs"
:Darwin           ; same as "Darwin"
```

Rule of thumb: if the string has no spaces and you don't need interpolation, use `:`.

## Booleans

```shik
true
false
```

## Lists

Ordered sequences, delimited by `[` and `]`, whitespace-separated. Elements can be any type. Lists may span multiple lines.

```shik
[]
[1 2 3]
[:a :b :c]
[[1 2] [3 4]]         ; nested
[1 "two" true null]   ; mixed types

; Multi-line
[
  1
  2
  3
]
```

## Objects

Key-value maps, delimited by `{` and `}`. It might look strange at first — **no separators**? The idea is (not mine, that's a lisp thing, just brilliant) — keys are strings, and each **odd** item in the object is a key. Values can be any type, and each **even** item is a value. Item count must be **even**, so each key is associated with the next **even** item (value). Objects may span multiple lines.

```shik
{}
{:name :Alice :age 30}
{:nested {:x 1 :y 2}}

; Multi-line
{
  :name :Alice
  :age 30
}
```

## Null

```shik
null
```

`null` is the absence of a value. Some functions return `null` to signal "not found" or "failed."

## Functions

`fn [args] body` is a literal that produces a function value. It is a complete syntax construction — not an application of `[args]` to `fn`, so the application operators are no use here. The argument list is part of the syntax, not a list literal being passed as a value.

```shik
fn [x] + x 1
fn [x y] * x y
fn [] :constant       ; zero arguments
```
