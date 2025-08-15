---
layout: "../../layouts/Article.astro"
title: "Fluid: reactivity with maximum control"
description:
    A library that reveals the entire path of state change, ensuring that every mutation, dependency, notification, and order of execution is plainly visible and subject to the developer’s intent
date: 10/07/2025
---

# Introducing Fluid: Explicit and Robust Reactivity for Modern JavaScript

## Motivation

Reactivity is one of the most influential concepts in modern front-end
development. Applications are expected to update promptly, propagate changes
through complex data relationships, and remain reliable as they evolve.

Most established reactive libraries—such as `MobX`, `Vue`'s reactivity system,
and `Svelte`—offer developers tremendous convenience and power. I have used
them extensively, and the convenience they offer is impressive. For example,
MobX can make your values "magically" reactive with minimal boilerplate.

However, while using them for the development of complex systems, I've
encountered issues like layers of implicit behavior, syntax restrictions, and a
lack of control. Other solutions, like `RxJS`, offer granular control but come
with the steep learning curve of Functional-Reactive Programming, which
developers **must** fully adopt. Improper use can often lead to chaotic,
hard-to-debug code.

`Fluid` was created out of a desire to rebalance reactivity in favor of
clarity, predictability, and a greater level of control, even if it comes at
the cost of some convenience. It aims to reveal the entire path of state
change, so that every mutation, every dependency, every notification, and the
order of execution are plainly visible and subject to the developer’s intent.

Why would you need this? For real-time applications with large and complex
codebases, the "simplicity" of tools like MobX can lead to difficult questions:
_"What is the full list of dependencies for this computed property?"_, _"What
would happen if I make this getter a computed property?"_, or _"How do I ensure
the reaction `C` executes **after** reaction `A` but **before** reaction `B`?"_. In such cases, perceived
simplicity becomes a bottleneck.

---

## Overview

`Fluid` achieves its goals through a set of core principles:

1. Every reactive object is a **type-constructor**(like a `Promise`).
2. Everything is **explicit**.
3. Everything can be **controlled**.
4. Everything is **synchronous**.
5. No `Proxy` is used; only **plain objects and functions**.
6. **Performance**: due to lack of huge computation on side and plain data
   structures, `Fluid` is very fast and easy on memory.

```typescript
const _name_ = Fluid.val("Alice")
const _surname_ = Fluid.val("Liddell")
const _fullName_ = Fluid.derive(
    [_name_, _surname_],
    (name, surname) => `${name} ${surname}`
)

// Explicit subscription:
Fluid.listen(
    _fullName_,
    name => console.log("User's full name:", name)
)

Fluid.write(_name_, "Jane") // User's full name: Jane Liddell
Fluid.read(_fullName_) // "Jane Liddell"
```

The core concepts here will be familiar from other reactive systems:

- **Reactive Values**: `Fluid.val` (Read-Write).
- **Derivations**: `Fluid.derive` (Read-only).
- **Listeners**: `Fluid.listen` (Fires an effect on change).
- **Reading**: `Fluid.read` (Returns the current state of a reactive object).
- **Writing**: `Fluid.write` (Sets a new state for a reactive value).

## What Makes Fluid Unique

From the example above, one might think `Fluid` is just another syntax for the
same concepts. However, it provides unique capabilities:

### 1. Controlling evaluation order

Typically, synchronous libraries build a dependency tree, detect and resolve
circular dependencies, and rebalance the execution order automatically.

Let's imagine the following cart store, which calculates `price`, `shipping`
fees, and `tax` to display a total. Code here is written with MobX library:

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

Here, `showTotal` computed has three dependencies: `price`, `tax`,
and `shipping`. `shipping` and `tax` depend on the single observable `price`, and it also
understands that `showTotal` should be re-evaluated only after `shipping` and
`tax` have been updated. An abstract dependency graph would looks like this:


```
   _price_
 /         \
tax      shipping
 \         /
  showTotal
```

Most importantly, after updating `price`, `showTotal` should be updated only
**once**! If each dependency triggered its own update, `showTotal` would
re-evaluate multiple times unnecessarily!

Does `Fluid` solve this diamond dependency problem automatically? No, it
doesn't! But instead, it gives you a powerful tool to solve it yourself:
`priorities`. A solved dependency graph would build the following timeline of
updates:

Resolved graph of dependencies above would build a following timeline of updates:

```
price
 |
 +---> tax
 +---> shipping
     |
     +---> showTotal
```

In `Fluid`, you declare these relationships explicitly:

```typescript
const _price_ = Fluid.val()

const _tax_ = Fluid.derive(
  _price_,
  price => price * 0.08, // 8% tax
)
const _shipping_ = Fluid.derive(
  _price_,
  price => price > 50 ? 0 : 5.00, // free shipping over $50
)

const _totalSummary_ = Fluid.derive(
  _price_, // We only need to subscribe to the root dependency.
  (price) => {
    // We read the latest values of other derivations inside.
    const tax = Fluid.read(_tax_)
    const shipping = Fluid.read(_shipping_)
    const total = price + tax + shipping
    return `Final price: $${total.toFixed(2)} (incl. tax: $${tax.toFixed(2)}, shipping: $${shipping.toFixed(2)})`
  },
  // Set priority: execute this derivation *after* the base level.
  { priority: Fluid.priorities.after(Fluid.priorities.base) },
)

Fluid.write(_price_, 20.00)

console.log(Fluid.read(_totalSummary_)) // Final price: $26.60 (incl. tax: $1.60, shipping: $5.00)
```

Every `derive` and `listen` accepts a `priority` option. This allows you
to declare the order of execution. Here, `_totalSummary_` depends on `_price_`,
and its update is scheduled after the `base` priority pool, where dependencies
like `_tax_` and `_shipping_` are placed by default.

Priority is simply a number. `Fluid.priorities.after(Fluid.priorities.base)` is
a readable helper for `-1`. The execution order looks like this:

```
HIGHER
 0: [_tax_, _shipping_]
-1: [_totalSummary_]
LOWER
```

And yeah, it is really just a number, the higher the number, the higher the priority:

```typescript
const _msg_ = Fluid.val("")
const log = console.log

Fluid.listen(_msg_, (msg) => log("3: " + msg), { priority: 3 })
Fluid.listen(_msg_, (msg) => log("2: " + msg), { priority: 2 })
Fluid.listen(_msg_, (msg) => log("4: " + msg), { priority: 4 })
Fluid.listen(_msg_, (msg) => log("1: " + msg), { priority: 1 })

Fluid.write(_msg_, "Hi?")

// 4: Hi?
// 3: Hi?
// 2: Hi?
// 1: Hi?
```


### 2. Transactions

Batching changes is a common feature in reactive systems. In `Fluid`, the
approach might look different at first, but it is highly controllable and
powerful.

#### Lazy write

A `Fluid` transaction is essentially a delayed write.

```typescript
const _name_ = Fluid.val('Mike')

const transaction = Fluid.transaction.write(_name_, 'MIKE')
Fluid.read(_name_) // Mike

transaction.run()
Fluid.read(_name_) // MIKE
```

Are there other differences from a standard write? Yes—we can also reject a
write, preventing the state from changing.

```typescript
const _counter_ = Fluid.val(1)

const inc = () => Fluid.transaction.write(
    _counter_,
    count => {
        if (count < 3)
            return Fluid.transaction.resolved(count + 1)
        else
            return Fluid.transaction.rejected() 
    },
)

let result = inc().run()
console.log(Fluid.read(_counter_), Fluid.transaction.isResolved(result)) // 2, true

result = inc().run()
console.log(Fluid.read(_counter_), Fluid.transaction.isResolved(result)) // 3, true

result = inc().run()
console.log(Fluid.read(_counter_), Fluid.transaction.isResolved(result)) // 3, false
```

This is an incredibly useful concept. You can pass transactions around as
objects and operate on them without needing to know *what* they write to—you
only need to deal with the transaction itself!

```typescript
import { Fluid, ReactiveTransaction } from 'reactive-fluid'

function runWithWarning(transaction: ReactiveTransaction) {
    const res = transaction.run()
    if (Fluid.transaction.isRejected(res)) {
        console.warn(`transaction rejected with error: ${res.error}`)
    }
}

const _a_ = Fluid.val('a')
const tr1 = Fluid.transaction.write(_a_, () => Fluid.transaction.resolved('A'))
const tr2 = Fluid.transaction.write(_a_, () => Fluid.transaction.rejected('just not'))

runWithWarning(tr1) // No warning, _a_ is now "A"
runWithWarning(tr2) // console.warns 'Transaction rejected with error: just not'
```

#### Composing Writes

But the core of transaction is **batching** changes together! How does a lazy
write help here? The answer is: we can `compose` multiple writes into a single,
atomic transaction.

```typescript
const _name_ = Fluid.val("Alice")
const _surname_ = Fluid.val("Liddell")
const _fullName_ = Fluid.derive(
    [_name_, _surname_],
    (name, surname) => `${name} ${surname}`
)

Fluid.listen(
    _fullName_,
    (full) => console.log(`The full name is: ${full}`),
)

const nameTransaction = Fluid.transaction.compose(
    Fluid.transaction.write(_name_, "Mark"),
    Fluid.transaction.write(_surname_, "Smith"),
)

nameTransaction.run()
// The full name is: Mark Smith
```

If we would make this writes one by one, the listener would be triggered twice.
With a composed transaction - only once!

##### Canceling Transactions

Another important aspect of transactions is atomicity: all changes are rejected
if any single part of the transaction is rejected. This prevents the
application from entering a broken or inconsistent state. `Fluid` follows this
principle with the `rejected()` state.

```typescript
const _name_ = Fluid.val("Alice")
const _surname_ = Fluid.val("Liddell")
const _age_ = Fluid.val(22)
const _userinfo_ = Fluid.derive(
    [_name_, _surname_, _age_],
    (name, surname, age) => `${name} ${surname}, ${age}`
)

Fluid.listen(
    _userinfo_,
    (info) => console.log(`user info: ${info}`),
)

const update = Fluid.transaction.compose(
    Fluid.transaction.write(_name_, "Mark"),
    Fluid.transaction.write(_surname_, () => Fluid.transaction.rejected("NOT FOUND")),
    Fluid.transaction.write(_age_, 30),
)

update.run() // listener wasn't triggered
Fluid.read(_userinfo_) // "Alice Liddell, 22" (state remains unchanged)
```

### 3. No Hidden Memoization

As you've seen, `Fluid` does nothing behind your back. If you call `write`, it
writes the new value and notifies all its listeners, period. This also means
you are not forced to use **immutable** data structures.

```typescript
const _cart_ = Fluid.val<Array<number>>([])
const _cartSum_ = Fluid.derive(
    _cart_,
    cart => cart.reduce((acc, item) => acc + item, 0)
)

// This function mutates the array directly.
const pushToCart = (item: number) => {
    Fluid.write(_cart_, cart => {
        cart.push(item)
        // We must return the mutated array to signal a change.
        return cart
    })
}

pushToCart(5)
pushToCart(5)
pushToCart(5)

Fluid.read(_cartSum_) // 15
```

## Summary

If you are looking for a robust, low-overhead, and easy-to-adopt reactive
library that isn't tightly coupled to a specific framework like React, `Fluid`
might be a great fit for you. It trades implicit convenience for explicit
control, giving you the power to build predictable and highly performant state
management systems.

### Links

- Source code: [GitHub](https://github.com/PunGy/fluid).
- Use in your project: [NPM](https://www.npmjs.com/package/reactive-fluid).

