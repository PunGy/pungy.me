---
layout: "../../layouts/Article.astro"
title: "Type variance clearly"
description:
  Type Variance is quite tricky topic in type theory. Let's try to crack each type of variance with clear and natural examples.
date: 21/12/2024
---

# Variance

In type theory, variance is describing a relationship between two generic types.

## Covariance

The `covariance` relationship represents a general subtyping.

```
I can pass a Cat where an Animal is expected
But I can't pass an Animal where the Cat is expected
```

```typescript
class Animal {
    genus: string;
}
class Cat extends Animal {
    clawSize: number;
}

function move(animal: Animal) {}
function meow(cat: Cat) {}

move(cat) // Any cat can move
meow(animal) // Not every animal can meow
```

Precise: `You can use B where A is expected, if B < A`

```typescript
type Co<V> = () => V;
function covariance<A, B extends A>(t: B, b: A, coB: Co<B>, coA: Co<A>) {
  b = a; // okay
  a = b; // error!

  coA = coB; // okay
  coB = coA; // error!
}
```

## Contravariace

Contravariance relationship is represented in opposite direction of Covariance.

```
I can process Cat food in the same way how any Animal is processed
But I can't process Animal food in the same way how Cat food is processed
```

```typescript
class AnimalFood {
    //
}
class CatFood extends AnimalFood {
    //
}
function processCatFood(catFood: CatFood): void {
  // Make it fishy //
}
function processAnimalFood(animalFood: AnimalFood): void {
  // Add some protein //
}

function serveAnimalFood(processor: (food: AnimalFood) => void): void {}
function serveCatFood(processor: (food: CatFood) => void): void {}

// We can't use Cat food processor to serve an animal food!
// Not all animals like fishy food!
serveAnimalFood(processCatFood);

// You can use Animal food processor to serve a cat food.
// Protein would be good for a cat
serveCatFood(processAnimalFood);
```

Precise: `You can use handler for A where handler for B is expected, if B < A`

```typescript
type Contra<V> = (v: V) => void;
function contravariance<A, B extends A>(t: B, u: A, contraB: Contra<B>, contraA: Contra<A>) {
  u = t; // okay
  t = u; // error!

  contraA = contraB; // error!
  contraB = contraA; // okay
}
```

## Invariance

Invariance relationship tells that some type can be used only with the exact same type.

```
In waste sorting, you can't put in GeneralWaste bin a waste, that can be sorted
And you can only put a waste in a bin of appropriate type
```

```typescript
class Waste {
  readonly type = 'unrecycable';
}
class FoodWaste {
  readonly type = 'organyc';
}

function unrecycledBin(waste: Waste) {}
function organycBin(waste: FoodWaste) {}

unrecycledBin(new FoodWaste()); // You can't pass FoodWaste to unrecycled bin, are you criminal?
organycBin(new Waste()); // You can't pass unclassified waste to organyc bin, are you criminal???
```
