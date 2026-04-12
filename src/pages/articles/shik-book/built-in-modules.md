---
layout: "../../../layouts/Article.astro"
title: "Built-in Modules"
part: 9
collection_id: shik-book
---

# Built-in Modules

First of all, I will mention it one more time — there is **NO module system** in Shik. I use the word "modules" to tie different functions together under one specialization, it is just a convention. There is no module `file`, there are just a bunch of functions with the `file.` prefix.

All modules are available without imports. Use `help module.` in the REPL to explore.

---

## `number.` — Arithmetic & math

| Function | Args | Description |
|----------|------|-------------|
| `+` | `a b` | Addition (also: string concatenation when both strings) |
| `-` | `mod base` | Subtraction: `base - mod`. `(- 1)` = "subtract 1" |
| `*` | `mod base` | Multiplication |
| `/` | `mod base` | Division: `base / mod`. `(/ 2)` = "divide by 2" |
| `%` | `mod base` | Modulo: `base % mod` |
| `^` | `exp base` | Exponentiation: `base ^ exp`. `(^ 2)` = "square" |
| `number.abs` | `n` | Absolute value |
| `number.floor` | `n` | Round down |
| `number.ceil` | `n` | Round up |
| `number.round` | `n` | Round to nearest integer |
| `number.sqrt` | `n` | Square root |
| `number.sin` | `n` | Sine (radians) |
| `number.cos` | `n` | Cosine (radians) |
| `number.tan` | `n` | Tangent (radians) |
| `number.log` | `n` | Natural logarithm |
| `number.log10` | `n` | Base-10 logarithm |
| `number.min` | `a b` | Smaller of two numbers |
| `number.max` | `a b` | Larger of two numbers |
| `number.rand` | `[max]` or `[min max]` | Random number (0 args: float 0–1; 1 arg: int 0–max; 2 args: int min–max) |

```shik
- 1 5        ; 4  (5 - 1)
/ 2 10       ; 5  (10 / 2)
^ 3 5        ; 125 (5^3)
[1 2 3 4] $> list.map (* 2)     ; [2 4 6 8]
[1 2 3 4] $> list.map (^ 2)     ; [1 4 9 16]
number.rand 1 7                  ; random integer 1–6
```

---

## `string.` — String manipulation

| Function | Args | Description |
|----------|------|-------------|
| `string` | `val` | Convert any value to string |
| `string.len` | `s` | Character count |
| `string.upper` | `s` | Convert to uppercase |
| `string.lower` | `s` | Convert to lowercase |
| `string.trim` | `s` | Remove leading and trailing whitespace |
| `string.trim-start` | `s` | Remove leading whitespace |
| `string.trim-end` | `s` | Remove trailing whitespace |
| `string.split` | `sep s` | Split `s` by `sep`, return list |
| `string.lines` | `s` | Split into lines (equivalent to `string.split "\n"`) |
| `string.join` | `sep lst` | Join list of strings with `sep` |
| `string.+` | `a b` | Concatenate two strings |
| `string.has` | `needle haystack` | True if `haystack` contains `needle` |
| `string.starts-with` | `prefix s` | True if `s` starts with `prefix` |
| `string.ends-with` | `suffix s` | True if `s` ends with `suffix` |
| `string.index-of` | `needle haystack` | Index of first occurrence, or `-1` |
| `string.replace` | `from to s` | Replace all occurrences of `from` with `to` in `s` |
| `string.at` | `i s` | Character at index `i`, or `null` |
| `string.slice` | `start end s` | Substring from `start` to `end` |
| `string.bytes` | `n` | Format number of bytes as human-readable (e.g. `"1.5 KiB"`) |
| `string.iterate` | `fn s` | Call `fn` for each character (left to right) |
| `string.iterate-backward` / `string.<iterate` | `fn s` | Call `fn` for each character (right to left) |
| `string.push` / `string.push>` / `string.push-right` | `s char` | Append `char` to `s` (mutates `s`) |
| `string.push-left` / `string.<push` | `s char` | Prepend `char` to `s` (mutates `s`) |
| `string.set` | `i s char` | Replace character at index `i` in `s` with `char` (mutates) |
| `string.=` | `a b` | String equality |

```shik
string.split "," "a,b,c"         ; ["a" "b" "c"]
string.join ", " ["a" "b" "c"]   ; "a, b, c"
string.has :TODO (file.read :main.rs)
"hello" $> string.upper           ; "HELLO"
string.replace "o" "0" "hello"   ; "hell0"
```

---

## `list.` — List operations

| Function | Args | Description |
|----------|------|-------------|
| `list.len` | `lst` | Number of elements |
| `list.head` | `lst` | First element, or `null` |
| `list.tail` | `lst` | List without first element (O(1)) |
| `list.last` | `lst` | Last element, or `null` |
| `list.init` | `lst` | List without last element (O(1)) |
| `list.at` | `i lst` | Element at index `i`, or `null` |
| `list.empty?` | `lst` | True if list is empty |
| `list.sum` | `lst` | Sum all numbers |
| `list.reverse` | `lst` | Reversed list |
| `list.concat` | `a b` | Concatenate two lists |
| `list.take` | `n lst` | First `n` elements |
| `list.drop` | `n lst` | All elements after the first `n` |
| `list.slice` | `start end lst` | Sublist from `start` to `end` |
| `list.choice` | `lst` | Random element, or `null` |
| `list.range` | `[start] end [step]` | Create numeric range (see below) |
| `list.map` | `fn lst` | Apply `fn` to each element, return new list |
| `list.filter` | `pred lst` | Keep elements where `pred` returns true |
| `list.fold` | `init fn lst` | Reduce list to single value |
| `list.iterate` | `fn lst` | Call `fn` for each element (for side effects) |
| `list.iterate-backward` / `list.<iterate` | `fn lst` | Iterate right to left |
| `list.any` | `pred lst` | True if any element matches `pred` |
| `list.all` | `pred lst` | True if all elements match `pred` |
| `list.find` | `pred lst` | First matching element, or `null` |
| `list.find-index` | `pred lst` | Index of first match, or `-1` |
| `list.sort` | `cmp lst` | Sort using comparator `fn [a b] number` (negative = a before b) |
| `list.set` | `i lst val` | Set element at index `i` to `val` (mutates) |
| `list.push` / `list.push>` / `list.push-right` | `lst val` | Append `val` (mutates) |
| `list.push-left` / `list.<push` | `lst val` | Prepend `val` (mutates) |

`list.range`:

```shik
list.range 5        ; [0 1 2 3 4]
list.range 2 5      ; [2 3 4]
list.range 0 10 2   ; [0 2 4 6 8]
```

`list.fold` example:

```shik
; Sum of squares
list.fold 0 (fn [acc x] + acc (* x x)) [1 2 3 4]   ; 30

; Build a frequency map
list.fold {} (fn [acc item] '(
  let key (string item)
  if (object.has key acc) $
    object.set key acc (+ (object.get key acc) 1) $
    object.set key acc 1
  acc
)) [:a :b :a :c :a :b]
; {:a 3 :b 2 :c 1}
```

`list.sort` example:

```shik
; Sort numbers ascending
list.sort (fn [a b] - a b) [3 1 4 1 5 9]    ; [1 1 3 4 5 9]

; Sort descending
list.sort (fn [a b] - b a) [3 1 4 1 5 9]    ; [9 5 4 3 1 1]

; Sort pairs by second element
list.sort (fn [[_ a] [_ b]] - a b) [[:x 3] [:y 1] [:z 2]]
; [[:y 1] [:z 2] [:x 3]]
```

---

## `object.` — Key-value maps

| Function | Args | Description |
|----------|------|-------------|
| `object.get` | `key obj` | Value for `key`, or `null` |
| `object.set` | `key obj val` | Set `key` to `val` (mutates) |
| `object.has` | `key obj` | True if `key` exists |
| `object.remove` | `key obj` | Remove `key` (mutates), returns removed value or `null` |
| `object.keys` | `obj` | List of all keys |
| `object.values` | `obj` | List of all values |
| `object.entries` | `obj` | List of `[key value]` pairs |
| `object.len` | `obj` | Number of keys |
| `object.empty?` | `obj` | True if no keys |
| `object.merge` | `a b` | Merge `a` and `b` (keys in `b` override `a`) |
| `object.clone` | `obj` | Shallow copy |
| `object.pick` | `keys obj` | New object with only the listed keys |
| `object.omit` | `keys obj` | New object without the listed keys |
| `object.from-entries` | `lst` | Create object from list of `[key value]` pairs |
| `object.map` | `fn obj` | Transform values: `fn [key value]` → new value |
| `object.map-entries` | `fn obj` | Transform entries: `fn [key value]` → `[new-key new-value]` |
| `object.filter` | `pred obj` | Keep entries where `pred [key value]` is true |
| `object.fold` | `init fn obj` | Reduce: `fn [acc [key value]]` |
| `object.iterate` | `fn obj` | Call `fn [key value]` for each entry |
| `object.any` | `pred obj` | True if any entry matches |
| `object.all` | `pred obj` | True if all entries match |
| `object.find` | `pred obj` | First matching `[key value]` pair, or `null` |
| `object.find-key` | `pred obj` | Key of first matching entry, or `null` |

```shik
let config {:host :localhost :port 8080}
object.get :host config          ; "localhost"
object.has :port config          ; true
object.keys config               ; ["host" "port"]

object.fold 0 (fn [acc [_ v]] + acc v) {:a 1 :b 2 :c 3}   ; 6
```

---

## `file.` — Filesystem

**Reading:**

| Function | Args | Description |
|----------|------|-------------|
| `file.read` | `path` | Read file as string (error on failure) |
| `file.read?` | `path` | Read file as string, or `null` on failure |
| `file.read-lines` | `path` | Read file as list of lines |
| `file.read-bytes` | `path` | Read file as list of byte values (0–255) |

**Writing:**

| Function | Args | Description |
|----------|------|-------------|
| `file.write` | `path content` | Write string to file (overwrites) |
| `file.append` | `path content` | Append string to file |
| `file.write-bytes` | `path bytes` | Write byte list to file |

**Operations:**

| Function | Args | Description |
|----------|------|-------------|
| `file.copy` / `file.cp` | `dst src` | Copy file or directory |
| `file.move` / `file.mv` | `dst src` | Move or rename file or directory |
| `file.remove` / `file.rm` | `path` | Delete file or directory recursively |
| `file.rmdir` | `path` | Remove empty directory |
| `file.rmdir!` | `path` | Remove directory recursively |
| `file.mkdir` | `path` | Create directory |
| `file.mkdir!` | `path` | Create directory and all parent directories |
| `file.symlink` | `link target` | Create symlink |
| `file.read-link` | `path` | Read symlink target |
| `file.temp-dir` | — | Return system temp directory |

**Information:**

| Function | Args | Description |
|----------|------|-------------|
| `file.exists` | `path` | True if path exists |
| `file.is-file` | `path` | True if path is a file |
| `file.is-dir` | `path` | True if path is a directory |
| `file.is-symlink` | `path` | True if path is a symlink |
| `file.size` | `path` | File size in bytes |
| `file.size.deep` | `path` | Total size of file or directory (recursive) |
| `file.stat` | `path` | Object with `size`, `is_file`, `is_dir`, `is_symlink`, `readonly` |

**Listing:**

| Function | Args | Description |
|----------|------|-------------|
| `file.list` | `path` | List directory contents (names only) |
| `file.list!` | `path` | List directory contents (full paths) |
| `file.glob` | `pattern` | Find files matching glob pattern (full paths) |

---

## `path.` — Path manipulation

| Function | Args | Description |
|----------|------|-------------|
| `path.name` | `path` | File name with extension |
| `path.stem` | `path` | File name without extension |
| `path.ext` | `path` | File extension |
| `path.parent` | `path` | Parent directory |
| `path.join` | `base component` | Join two path components |
| `path.absolute` | `path` | Convert to absolute path |

```shik
path.name :/home/user/file.txt    ; "file.txt"
path.stem :/home/user/file.txt    ; "file"
path.ext  :/home/user/file.txt    ; "txt"
path.parent :/home/user/file.txt  ; "/home/user"
path.join :./src :main.rs         ; "./src/main.rs"
```

---

## `shell.` — Shell commands & environment

**Execution:**

| Function | Args | Description |
|----------|------|-------------|
| `shell` | `cmd` | Run command, return stdout as string. Error on non-zero exit. |
| `shell!` | `cmd` | Run command with output shown, return exit code |
| `shell.code` | `cmd` | Run silently, return exit code |
| `shell.full` | `cmd` | Run, return object `{stdout stderr code ok}` |
| `shell?` | `cmd` | Run, return stdout or `null` on failure |
| `shell.ok?` | `cmd` | True if command exits with code 0 |
| `shell.lines` | `cmd` | Run, return stdout as list of lines |

```shik
shell "git status"                ; stdout string
shell.lines "git branch"          ; ["  main" "* feature"]
shell? "ls /nonexistent"          ; null (no error thrown)
shell.full "make test"            ; {:stdout "..." :stderr "..." :code 0 :ok true}
```

**Environment:**

| Function | Args | Description |
|----------|------|-------------|
| `shell.env` | `name` | Get environment variable, or `null` |
| `shell.env.set` | `name val` | Set environment variable |
| `shell.env.remove` | `name` | Remove environment variable |
| `shell.env.all` | — | All environment variables as object |
| `shell.home` | — | Home directory path |
| `shell.cwd` | — | Current working directory |
| `shell.cd` | `path` | Change current working directory |
| `shell.os` | — | OS name: `"linux"`, `"macos"`, `"windows"` |
| `shell.arch` | — | CPU architecture: `"x86_64"`, `"aarch64"`, etc. |
| `shell.has` | `cmd` | True if command exists in PATH |
| `shell.which` | `cmd` | Full path to command, or `null` |
| `shell.ask` | `[prompt]` | Read a line from stdin (optional prompt) |
| `shell.args` | — | All command-line arguments as list |

**Process:**

| Function | Args | Description |
|----------|------|-------------|
| `process.pid` | — | Current process ID |
| `process.file` | — | Name of executing script file, or `null` in REPL |
| `process.args` | — | Command-line arguments (without `shik` and filename) |
| `process.sleep` | `ms` | Sleep for `ms` milliseconds |
| `process.abort` | — | Abnormal process termination |
| `exit` | `code` | Exit with given code |
| `exit!` | — | Exit with code 0 |

---

## `bool.` — Comparisons & logic

| Function | Args | Description |
|----------|------|-------------|
| `=` | `a b` | Equality (numbers, bools, strings, null) |
| `!=` | `a b` | Inequality |
| `>` | `a b` | `b > a` — "is b greater than a?" |
| `>=` | `a b` | `b >= a` |
| `<` | `a b` | `b < a` — "is b less than a?" |
| `<=` | `a b` | `b <= a` |
| `and` | `a b` | Logical AND (short-circuit) |
| `or` | `a b` | Logical OR (short-circuit) |
| `not` | `a` | Logical negation |
| `bool` | `val` | Convert to bool (0, null, `""`, `[]`, `{}` = false) |

Note the argument order for comparisons: `> a b` asks "is b greater than a?" This is consistent with the modifier-first convention.

```shik
> 5 10        ; true  (is 10 > 5?)
< 10 5        ; true  (is 5 < 10?)
>= 3 3        ; true

; Curried predicates
[1 5 3 8 2] $> list.filter (> 4)     ; [5 8] (elements > 4)
[1 5 3 8 2] $> list.filter (<= 3)    ; [1 3 2] (elements <= 3)
```

---

## `fn.` — Function utilities

| Function | Args | Description |
|----------|------|-------------|
| `fn.invoke` / `invoke` | `fn` | Call `fn` with no arguments |
| `fn.id` | `val` | Identity function — returns `val` |

```shik
[(fn [] print :a) (fn [] print :b)] $> list.iterate fn.invoke
; a
; b
```

---

## `var.` — Dynamic variable access

| Function | Args | Description |
|----------|------|-------------|
| `var.get` | `name` | Look up variable by string name, or `null` |

---

## Polymorphic functions

These functions work across multiple types:

| Function | Types | Description |
|----------|-------|-------------|
| `+` | Number+Number, String+String, String+other | Addition or concatenation |
| `at` | (index, String) or (index, List) | Get element at index |
| `iterate` | (fn, String) or (fn, List) | Iterate over characters or elements |
| `iterate-backward` / `<iterate` | (fn, String) or (fn, List) | Iterate in reverse |
| `print` | any | Print value to stdout |

---

## Utilities

| Function | Args | Description |
|----------|------|-------------|
| `print` | `val` | Print value with newline |
| `help` | `[topic]` | Show help (no args: overview; `"module."`: module list; `"fn.name"`: function info) |
| `or?` | `val default` | Return `default` if `val` is `null` |
