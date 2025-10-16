---
layout: "../../layouts/Article.astro"
title: "REROI: reactivity with maximum control"
description:
    Zero-dependency library for creating reactive systems with maximum control.
date: 10/07/2025
---

# Introducing REROI: Explicit and Robust Reactivity for Modern JavaScript

## Motivation

Reactivity is one of the most influential concepts in modern front-end development. Applications are expected to update promptly, propagate changes through complex data relationships, and remain reliable as they evolve.

Most established reactive libraries—such as `MobX`, `Vue`'s reactivity system, and `Svelte`—offer developers tremendous convenience and power. I have used them extensively, and the convenience they offer is impressive. For example, MobX can make your values "magically" reactive with minimal boilerplate.

However, while using them for the development of complex systems, I've encountered issues like layers of implicit behavior, syntax restrictions, and a lack of control. Other solutions, like `RxJS`, offer granular control but come with the steep learning curve of Functional-Reactive Programming, which developers **must** fully adopt. Improper use can often lead to chaotic, hard-to-debug code.

[reroi](https://github.com/PunGy/reroi) was created out of a desire to rebalance reactivity in favor of clarity, predictability, and a greater level of control, even if it comes at the cost of some convenience. It aims to reveal the entire path of state change, so that every mutation, every dependency, every notification, and the order of execution are plainly visible and subject to the developer’s intent.

Why would you need this? For real-time applications with large and complex codebases, the "simplicity" of tools like MobX can lead to difficult questions: _"What is the full list of dependencies for this computed property?"_, _"What would happen if I make this getter a computed property?"_, or _"How do I ensure the reaction `C` executes **after** reaction `A` but **before** reaction `B`?"_. In such cases, perceived simplicity becomes a bottleneck.

---

## Overview

`reroi` achieves its goals through a set of core principles:

1. Every reactive object is a **type-constructor**(like a `Promise`).
2. Everything is **explicit**.
3. Everything can be **controlled**.
4. Everything is **synchronous**.
5. No `Proxy` is used; only **plain objects and functions**.
6. **Performance**: due to lack of huge computation on side and plain data
   structures, `reroi` is very fast and easy on memory.

```typescript
import { val, deriveAll, listen. write, read } from 'reroi'

const _name_ = val("Alice")
const _surname_ = val("Liddell")
const _fullName_ = deriveAll(
    [_name_, _surname_],
    ([name, surname]) => `${name} ${surname}`
)

// Explicit subscription:
listen(
    _fullName_,
    name => console.log("User's full name:", name)
)

write(_name_, "Jane") // User's full name: Jane Liddell
read(_fullName_) // "Jane Liddell"
```

The core concepts here will be familiar from other reactive systems:

- **Reactive Values**: `val` (Read-Write).
- **Derivations**: `derive`/`deriveAll` (Read-only).
- **Listeners**: `listen`/`listenAll` (Fires an effect on change).
- **Reading**: `read` (Returns the current state of a reactive object).
- **Writing**: `write` (Sets a new state for a reactive value).

## What Makes reroi Unique

From the example above, one might think `reroi` is just another syntax for the same concepts. However, it provides unique capabilities:

### 1. Controlling evaluation order

[Priorities API](https://github.com/PunGy/reroi?tab=readme-ov-file#priorities)

Typically, synchronous libraries build a dependency tree, detect and resolve circular dependencies, and rebalance the execution order automatically.

Let's imagine the following cart store, which calculates `price`, `shipping` fees, and `tax` to display a total. Code here is written with MobX library:

```typescript
import { makeObservable, observable, computed } from 'mobx'

class Cart {
  price = 0

  constructor() {
    makeObservable(this, {
      price: observable,
      shipping: computed,
      tax: computed,
      showTotal: computed,
    })
  }

  get shipping() {
    return this.price > 50 ? 0 : 5.00
  }
  get tax() {
    return this.price * 0.08 // 8%
  }

  get showTotal() {
    const total = this.price + this.tax + this.shipping
    return `Final price: $${total.toFixed(2)} (incl. tax: $${this.tax.toFixed(2)}, shipping: $${this.shipping.toFixed(2)})`
  }
}

const cart = new Cart()

cart.price = 20
console.log(cart.showTotal) // Final price: $26.60 (incl. tax: $1.60, shipping: $5.00)
```

Here, `showTotal` computed has three dependencies: `price`, `tax`, and `shipping`. `shipping` and `tax` depend on the single observable `price`, and it also understands that `showTotal` should be re-evaluated only after `shipping` and `tax` have been updated. An abstract dependency graph would looks like this:


```
   _price_
 /    |    \
⌄     |     ⌄
tax   |  shipping
 \    |    /
  ⌄   ⌄   ⌄
  showTotal
```

Most importantly, after updating `price`, `showTotal` should be updated only **once**! If each dependency triggered its own update, `showTotal` would re-evaluate multiple times unnecessarily!

Does `reroi` solve this diamond dependency problem automatically? No, it doesn't! But instead, it gives you a powerful tool to solve it yourself: `priorities`.

You declare these relationships explicitly:

```typescript
const _price_ = val(0)

const _tax_ = derive(
  _price_,
  price => price * 0.08, // 8% tax
)
const _shipping_ = derive(
  _price_,
  price => price > 50 ? 0 : 5.00, // free shipping over $50
)

const _totalSummary_ = derive(
  _price_, // We only need to subscribe to the root dependency.
  (price) => {
    // We read the latest values of other derivations inside.
    const tax = read(_tax_)
    const shipping = read(_shipping_)
    const total = price + tax + shipping
    return `Final price: $${total.toFixed(2)} (incl. tax: $${tax.toFixed(2)}, shipping: $${shipping.toFixed(2)})`
  },
  // Set priority: execute this derivation *after* the base level.
  { priority: priorities.after(priorities.base) },
)

write(_price_, 20.00)

console.log(read(_totalSummary_)) // Final price: $26.60 (incl. tax: $1.60, shipping: $5.00)
```

Resolved graph of dependencies above would build a following timeline of updates:

```
_price_
 |
 +---> _tax_
 +---> _shipping_
 |
 +---> _totalSummary_
```

Every `derive` and `listen` accepts a `priority` option. This allows you to declare the order of execution. Here, `_totalSummary_` depends on `_price_`, and its update is scheduled after the `base` priority pool, where dependencies like `_tax_` and `_shipping_` are placed by default.

Priority is simply a number. `priorities.after(priorities.base)` is a readable helper for `-1`. The execution order looks like this:

```
HIGHER
 0: [_tax_, _shipping_]
-1: [_totalSummary_]
LOWER
```

And yeah, it is really just a number, the higher the number, the higher the priority:

```typescript
const _msg_ = val("")
const log = console.log

listen(_msg_, (msg) => log("3: " + msg), { priority: 3 })
listen(_msg_, (msg) => log("2: " + msg), { priority: 2 })
listen(_msg_, (msg) => log("4: " + msg), { priority: 4 })
listen(_msg_, (msg) => log("1: " + msg), { priority: 1 })

write(_msg_, "Hi?")

// 4: Hi?
// 3: Hi?
// 2: Hi?
// 1: Hi?
```

### 2. Transactions

[Transactions API](https://github.com/PunGy/reroi?tab=readme-ov-file#transactions)

Batching changes is a common feature in reactive systems. In `reroi`, the approach might look different at first, but it is highly controllable and powerful.

#### Lazy write

A `reroi` transaction is essentially a delayed write.

```typescript
const _name_ = val('Mike')

const transaction = transaction.write(_name_, 'MIKE')
read(_name_) // Mike

transaction.run()
read(_name_) // MIKE
```

Are there other differences from a standard write? Yes—we can also reject a write, preventing the state from changing.

```typescript
const _counter_ = val(1)

const inc = () => transaction.write(
    _counter_,
    count => {
        if (count < 3)
            return transaction.success(count + 1)
        else
            return transaction.error() 
    },
)

let result = inc().run()
console.log(read(_counter_), transaction.isSuccess(result)) // 2, true

result = inc().run()
console.log(read(_counter_), transaction.isSuccess(result)) // 3, true

result = inc().run()
console.log(read(_counter_), transaction.isSuccess(result)) // 3, false
```

This is an incredibly useful concept. You can pass transactions around as objects and operate on them without needing to know *what* they write to—you only need to deal with the transaction itself!

Here is an example with graphics redrawing on transaction success!

```typescript
import { val, read, transaction, ReactiveTransaction, ReactiveValue } from 'reroi'

class Graphics {
    // ...
    addObject(object: ReactiveValue<{ x: number; y: number }>): void
    redraw(): void
}
const graphics = new Graphics()

/**
 * Execute transaction and redraw graphics on success
 */
function update(transaction: ReactiveTransaction) {
    const res = transaction.run()
    if (transaction.isSuccess(res)) {
        graphics.redraw();
    }
}

const player = val({ x: 0, y: 0 })
const enemy = val({ x: 10, y: 0 })

// register objects
graphics.addObject(player)
graphics.addObject(enemy)

const movePlayer = transaction.write(_player_, player => {
    player.x += 10;
    return transaction.success(player)
}

// if moving would be successful - scene would be redrawed!
update(movePlayer)
```

#### Composing Writes

But the core of transaction is **batching** changes together! How does a lazy write help here? The answer is: we can `compose` multiple writes into a single, atomic transaction.

```typescript
const _name_ = val("Alice")
const _surname_ = val("Liddell")
const _fullName_ = deriveAll(
    [_name_, _surname_],
    ([name, surname]) => `${name} ${surname}`
)

listen(
    _fullName_,
    (full) => console.log(`The full name is: ${full}`),
)

const nameTransaction = transaction.compose(
    transaction.write(_name_, "Mark"),
    transaction.write(_surname_, "Smith"),
)

nameTransaction.run()
// The full name is: Mark Smith
```

If we would make this writes one by one, the listener would be triggered twice. With a composed transaction - only once!

##### Canceling Transactions

Another important aspect of transactions is atomicity: all changes are rejected if any single part of the transaction is an error. This prevents the application from entering a broken or inconsistent state. `reroi` follows this principle with the `error()` state.

```typescript
const _name_ = val("Alice")
const _surname_ = val("Liddell")
const _age_ = val(22)
const _userinfo_ = deriveAll(
    [_name_, _surname_, _age_],
    ([name, surname, age]) => `${name} ${surname}, ${age}`
)

listen(
    _userinfo_,
    (info) => console.log(`user info: ${info}`),
)

const update = transaction.compose(
    transaction.write(_name_, "Mark"),
    transaction.write(_surname_, () => transaction.error("NOT FOUND")),
    transaction.write(_age_, 30),
)

update.run() // listener wasn't triggered
read(_userinfo_) // "Alice Liddell, 22" (state remains unchanged)
```

That's not all about transactions. Important questions might appear: how can I see updated value of previously succeeded transactions in composition list? How can I read updated state of dependended computed?

If you are interested in answers, you can find them in [Composing Transactions](https://github.com/PunGy/reroi?tab=readme-ov-file#composing-transactions) section in README!

### 3. No Hidden Memoization

As you've seen, `reroi` does nothing behind your back. If you call `write`, it writes the new value and notifies all its listeners, period. This also means you are not forced to use **immutable** data structures.

```typescript
const _cart_ = val<Array<number>>([])
const _cartSum_ = derive(
    _cart_,
    cart => cart.reduce((acc, item) => acc + item, 0)
)

// This function mutates the array directly.
const pushToCart = (item: number) => {
    write(_cart_, cart => {
        cart.push(item)
        // We must return the mutated array to signal a change.
        return cart
    })
}

pushToCart(5)
pushToCart(5)
pushToCart(5)

read(_cartSum_) // 15
```

### 4. Dynamic Dependencies

Because reactive objects in `reroi` are first-class citizens, they can be nested inside one another. This powerful feature allows you to create **dynamic dependencies**, where a derived value can switch its underlying sources based on application state.

Imagine a scenario where a `_son_` reactive value reflects different sources based on his `_age_`. When under 18, his "voice" is derived from his parents (`_mommy_` and `_daddy_`). Once he turns 18, his voice becomes his own, represented by a separate, writable reactive source (`_matureSon_`).

```typescript
const _mommy_ = val("Eat your breakfast");
const _daddy_ = val("Go to school");

const _age_ = val(10);

const _matureSon_ = val("...");
const _youngSon_ = derive(
    [_mommy_, _daddy_],
    (mommy, daddy) => `Mommy said: "${mommy}", Daddy said: "${daddy}"`
);

// This derivation returns another reactive object, not a simple value.
const _son_ = derive(
    _age_,
    age => (age >= 18 ? _matureSon_ : _youngSon_)
);

// To get the final value, you must 'unwrap' it twice:
// 1. read(_son_) -> returns either _matureSon_ or _youngSon_
// 2. read( ... ) -> reads the value from that inner object
console.log(read(read(_son_))); // Mommy said: "Eat your breakfast", Daddy said: "Go to school"

write(_age_, 20);

// Now, _son_ points to _matureSon_
console.log(read(read(_son_))); // "..."

// We can now write directly to the new source
const currentSonSource = read(_son_);
write(currentSonSource, "I want to be a musician");

console.log(read(read(_son_))); // "I want to be a musician"
```

While this example is intentionally simple, this pattern requires careful consideration in real-world applications. When a dependency is switched (e.g., from `_youngSon_` to `_matureSon_`), the old source (`_youngSon_`) is no longer tracked by `_son_`, and all subscribes to old source is still active. So, for more complex objects, you should be mindful of memory management and may need to use tools like `destroy` to properly unsubscribe and clean up unused reactive objects, preventing potential memory leaks.

## Summary

If you are looking for a robust, low-overhead, and easy-to-adopt reactive library that isn't tightly coupled to a specific framework like React, `reroi` might be a great fit for you. It trades implicit convenience for explicit control, giving you the power to build predictable and highly performant state management systems.

### Links

- Source code and documentation: [GitHub](https://github.com/PunGy/reroi).
- Use in your project: [NPM](https://www.npmjs.com/package/reroi).

