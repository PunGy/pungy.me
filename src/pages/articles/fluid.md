---
layout: "../../layouts/Article.astro"
title: "Fluid: reactivity with maximum control"
description:
  Library which reveals the entire path of state change, so that every mutations, every dependency, every notification and order of execution, is plainly visible and subject to the developer’s intent
date: 10/07/2025
---

# Introducing Fluid: Explicit and Robust Reactivity for Modern JavaScript

## Motivation

Reactivity is one of the most influential concepts in modern frontend
development. Applications are expected to update promptly, propagate
changes through complex data relationships, and remain reliable as they evolve.
Most established reactive libraries — MobX, Vue’s reactivity system, Svelte, and
similar — offer developers tremendous convenience and power. I use them a lot
and it's really nice how the Mobx makes your values **magically** reactive! But
during using it for development of complex systems, I faced some issues: layers
of implicit behavior, syntax restrictions, lack of control.

Fluid was created out of a desire to rebalance reactivity in favor of clarity,
predictability, and the level of control, even if it may affect convenience of
usage and simplicity. It aims to reveal the entire path of state change, so
that every mutations, every dependency, every notification and order of
execution, is plainly visible and subject to the developer’s intent. Why would you need it?
Some real-time applications, for example content editing tools like rich-text
editors or spreadsheets might have a large and complex network of dependencies. In this cases "simplicity" of tools like Mobx can 

What do I mean by "level of control"? Even in Mobx you can just restrict usage
of `autorun` and `computed`, and enlisting all your dependencies with
`reaction`. But Fluid goes far, far ahead of that!

---

## Overview

In order to make Fluid the way it works, it has three ground principles:

1. Every reactive object is `type-constructor`(just like `Promise`)
2. Everything is explicit.
3. Everything can be controlled.

```typescript
const _name_ = Fluid.val("Alice");
const _surname_ = Fluid.val("Liddell");
const _fullName_ = Fluid.derive(
    [_name_, _surname_],
    (name, surname) => `${name} ${surname}`
);

// Explicit subscription:
Fluid.listen(
    _fullName_,
    name => console.log("User full name:", name)
);

Fluid.write(_name_, "Jane");
// logs: Jane Liddel
```

So here everything is just as in every reactive system:

- Reactive values: `Fluid.val` (Read-Write).
- Derivation: `Fluid.derive` (Readonly).
- Listener: `Fluid.listen` (fire effect on change).

## What Makes Fluid Unique

As I said before, Fluid have a lot more than just control

### Controling evaluation order


### **1. Explicit and Transparent Data Flow**

A core aspect of Fluid is its refusal to rely on implicit or automatic
subscriptions. Every dependency and every listener must be explicitly
declared. By inspecting your code, it is always possible to tell what will
update in response to a state change, and why.

This contrasts with systems like MobX, where simply reading a value inside
a computed or observer can create a dynamic (and sometimes invisible)
dependency. While this pattern can be convenient, it can also lead to
subtle bugs if a dependency is read conditionally or only in certain code
paths.

```typescript 
const _name_ = Fluid.val("Alice");
const _surname_ = Fluid.val("Liddell");
const _fullName_ = Fluid.derive(
    [_name_, _surname_],
    (name, surname) => `${name} ${surname}`
);

// Explicit subscription:
Fluid.listen(_fullName_, name => console.log("User full name:", name));
```

Fluid brings all relationships into the open, which encourages code that
is straightforward to audit and maintain.

### **2. Predictable Evaluation and Transactionality**

Fluid makes the order of updates a matter of clear intent, not an
implementation detail. It allows you to assign explicit priorities to
computations and listeners, and supports atomic transactions where
multiple values are updated together—all or nothing—ensuring complete
consistency.

This differs from MobX, in which actions and reactions are batched, but
order can still surprise developers, especially with nested actions,
observer hierarchies, or when using asynchronous flows.

With Fluid, you can author multi-step updates confidently, knowing that
only after all changes succeed will any effects be broadcast, and all
listeners will fire in a defined sequence.

```typescript 
const transaction = Fluid.transaction.compose(
    Fluid.transaction.write(_a_, 100),
    Fluid.transaction.write(_b_, (b, ) => b * 2)
);

transaction.run(); // Every change, then all listeners—no partial state.
```

### **3. Absence of Side Effects and Implicit Observers**

In MobX and similar libraries, simply reading a value in a function can
have far-reaching consequences—causing components or computations to
subscribe in a way that isn’t always intended or obvious. Fluid makes a
clear distinction: reading a value is always side-effect-free, and
listeners are always opt-in.

This predictability reduces the risk of unintentional cyclic updates,
“ghost” subscriptions, or memory leaks that can result from orphaned
observers.

---

## Comparison: Fluid vs. MobX

To appreciate the differences, it is helpful to compare the two directly:

|                        | **Fluid**
| **MobX**
|
|------------------------|-----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| **Dependencies**       | Always explicit: all dependencies are declared
in derives/listeners.                    | Inferred implicitly by tracking
property reads at runtime (dynamic).           | | **Reactivity**
| No implicit observers or subscriptions when reading values.
| Reading state in observers/computeds automatically creates dependencies.
| | **Transactions**       | Supports fully atomic transactions out of the
box, with clear rollback on failure.      | Transactions batch updates,
but handling of nested/async rollbacks is limited. | | **Evaluation
Order**   | Priorities and explicit control over update sequences.
| Update order is less explicit; relies on dependency graph and observer
order.  | | **Debuggability**      | Audit and predict the entire reactive
graph from the code itself.                       | Dependency relations
may be hidden, requiring devtools or runtime inspection.  | | **Usage
Overhead**     | Requires more explicit declarations; encourages
transparency and maintainability.       | Less boilerplate to get started,
but more hidden magic as systems grow.        |

MobX is valued for its low friction in small and medium apps, but in
large, evolving codebases, its reliance on implicit dependency tracking
can obscure dataflow and make debugging or maintenance
challenging—especially as teams change over time or requirements shift.

Fluid, by contrast, asks for greater explicitness in exchange for code
that is inherently more stable, auditable, and self-explanatory—qualities
that pay dividends in demanding projects.

---

## When to Consider Fluid

Fluid is especially well-suited to scenarios where:

- **Complex relationships exist between pieces of state**, and it is
  important to reason clearly about how and when updates propagate.
- **Transactional consistency is essential**: if updating multiple values,
  one failure should prevent partial state.
- **Debuggability and auditability are valuable**: teams need to trace
  causes and effects, or prove correctness to others.
- **Performance and ordering must be tightly managed**, such as in
  simulation engines, collaborative applications, or extensible platforms.

For smaller projects, or where convenience outweighs the need for
traceable stateflow, libraries like MobX, Zustand, or Vue may remain
preferable. But if your application tends to accumulate hidden
dependencies, unexplained updates, or challenging edge-cases over time,
the sustained clarity offered by Fluid will likely lead to simpler
maintenance and fewer surprises.

---

## Example Usage

Here is how Fluid can be used in practice:

```typescript import { Fluid } from 'reactive-fluid';

const _first_ = Fluid.val("Ada"); const _last_ = Fluid.val("Lovelace");

const _displayName_ = Fluid.derive([_first_, _last_], (f, l) => `${f}
${l}`);

Fluid.listen(_displayName_, name => { console.log("User logged in:",
name); });

Fluid.write(_first_, "Alan");    // User logged in: Alan Lovelace
Fluid.write(_last_, "Turing");   // User logged in: Alan Turing ```

Working with transactions:

```typescript const _score_ = Fluid.val(50); const _highScore_ =
Fluid.val(100);

const tx = Fluid.transaction.compose( Fluid.transaction.write(_score_,
120), Fluid.transaction.write(_highScore_, hs => Math.max(hs, 120)));

tx.run(); // State is consistent, listeners run after entire transaction.
```

With every connection and effect declared, the flow of data remains clear
at every step.

---

## Philosophy

Fluid’s philosophy is that code is easiest to reason about when dataflow
is never hidden. By keeping all relationships explicit and all mutations
predictable, Fluid encourages long-term maintainability and supports
applications whose requirements may change or scale dramatically.

The up-front explicitness is a deliberate tradeoff. Instead of relying on
inference, Fluid ensures that as your system grows, it does so
transparently—integral for large teams or applications with long
lifespans.

---

## Additional Resources

To explore Fluid in greater depth, learn about its advanced features, or
integrate it with existing frameworks such as React (via a custom hook),
please visit the [Fluid repository](https://github.com/your/repo-url).
Contributions and questions are warmly welcomed.

Fluid is designed to help your reactive codebase remain robust and
intelligible, regardless of scale or complexity.

---


You may object that there is already a library with low-level explicit
reactivity: `Rx.js`. And you would be right! But Fluid takes a different
approach. Rx.js provide it's own, very objective way to organize reactivity,
which might not suite every project, have steep learning curve, and have very
specific "taste". I admire how easely `Mobx` can be integrated to most of
projects, and the entire idea is very simple: every variable can now be
observed! That is what I want to put in Fluid - clarity of usage.

