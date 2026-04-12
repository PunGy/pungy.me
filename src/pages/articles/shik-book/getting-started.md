---
layout: "../../../layouts/Article.astro"
title: "Shik Book"
description: A functional, dynamically-typed scripting language for shell automation — with a minimalist syntax designed to be written left-to-right in the terminal.
part: 1
date: 12/04/2026
collection_id: shik-book
---

# Getting Started

Shik is a scripting language built around one idea: the thought in your head and the code you type should be the same shape. Data flows left to right through function pipelines. Everything is function application — no operators, no special syntax, no imports. A full standard library for files, strings, lists, objects, and shell commands is available from the first line.

Shik is for people who write small automation scripts every few days — moving files, counting things, pulling shell output into structured data — and who are tired of fighting the tools instead of solving the problem. Read the [origin story](https://blog.pungy.me/articles/shik).

![Demo](https://raw.githubusercontent.com/pungy/shik/main/shik-demo.gif)

---

## Installation

```bash
# macOS / Linux
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/pungy/shik/releases/latest/download/shik-installer.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://github.com/pungy/shik/releases/latest/download/shik-installer.ps1 | iex"

# From crates.io (requires Rust toolchain)
cargo install shik

# From source
git clone https://github.com/pungy/shik
cd shik && cargo build --release
```

Pre-built binaries for all platforms are on the [Releases](https://github.com/pungy/shik/releases) page.

Verify the installation:

```bash
shik --version
```

---

## Quick Start

### REPL

```bash
shik
```

```
> + 1 2
3

> let greet fn [name] "Hello, {name}!"
> greet :world
Hello, world!

> file.glob :./src/**/*.rs $> list.map (file.read #> string.lines #> list.len) $> list.sum $> print
9823
```

### Running a script

```bash
shik script.shk
```

### Built-in help

```
> help
-- Type modules
- number.: arithmetic, rounding, comparison, math functions, random
- string.: string manipulation, conversion, iteration
- list.: list operations, higher-order functions
- object.: object operations, iteration
- file.: file system operations
- shell.: shell commands, environment
...

> help list.map
native-lambda: list.map
[function list]: applies function to each element, returns new list

> help list.
-- list. module
- list.map
- list.filter
- list.fold
...
```
