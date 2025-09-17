---
layout: "../../layouts/Article.astro"
title: "Type variance clearly"
description:
  Type Variance is quite tricky topic in type theory. Let's try to crack each type of variance with clear and natural examples.
date: 21/12/2024
---

# Variance

In type theory, variance describes the relationship between two generic types. For example, it defines the circumstances under which a parent type can be replaced by a child type, and when it cannot, and so on.

You can find many resources on this topic, especially ones that are lengthy and written in a complex, formal, and architectural language. I wanted to create a short and simple cheat sheet (with a few sprinklings of formalism) that you can easily refer back to if you happen to forget the details.

## Covariance

A covariant relationship represents the usual subtype relationship, where a narrower/child type can be used where a wider/parent type is expected. For example:

> I can place a **Cat** where any **Animal** can be.
> But I cannot place any **Animal** where only a **Cat** can be.

```typescript
class Animal {
    genus: string;
}
class Cat extends Animal {
    clawSize: number;
}

function move(animal: Animal) {}
function meow(cat: Cat) {}

move(new Cat()); // Any cat can move
meow(new Animal()); // Not every animal can meow
```

Formally: You can use `B` where `A` is expected if `B` is a subtype of `A` (`B < A`).

```typescript
// V is in the return value position (output)
type Covariant<V> = () => V;

// Where Animal is the wider type (W), and Cat is the narrower type (N)
function covariance(
    covW: Covariant<Animal>,
    covN: Covariant<Cat>,
) {
  covW = covN; // OK. A function that returns a Cat can replace a function that returns an Animal.
  covN = covW; // Error! You can't be sure that a function returning an Animal will return a Cat.
}
```

## Contravariance

Contravariance is the opposite of covariance. It is, perhaps, the most difficult type of variance to understand. In the case of contravariance, a wider/parent type can be used where a narrower/child type is expected.

Under what circumstances might this happen? Imagine a processor. For example, a processor for general animal food that enriches it with protein (let's assume this is beneficial for any animal). And a processor for cat food that gives it a fishier taste (silly, but it doesn't matter).

So, can you process cat food with a general animal food processor? Of course, more protein won't harm a cat.
And can you process any animal food with a cat food processor? I think not—not everyone likes a fishy taste.

Let's repeat:

> I can process **Cat** food in the same way that any **Animal** food is processed.
> But I cannot process **Animal** food in the same way that **Cat** food is processed.

```typescript
class AnimalFood {
  protein: number = 0
}
class CatFood extends AnimalFood {
  fishness: number = 0
}

function processAnimalFood(animalFood: AnimalFood): void {
  // Add some protein //
}
function processCatFood(catFood: CatFood): void {
  // Give it a fishy taste //
}

/**
 * We process the food before serving
 */
function serveAnimalFood(processor: (food: AnimalFood) => void): void {
    const food = new AnimalFood();
    processor(food);
}
function serveCatFood(processor: (food: CatFood) => void): void {
    const food = new CatFood();
    processor(food);
}

// We can't use the cat food processor to serve animal food!
// Not all animals like a fishy taste!
serveAnimalFood(processCatFood);

// You can use the general animal food processor to serve cat food.
// The protein will be good for the cat.
serveCatFood(processAnimalFood);
```

In type theory: You can use a processor for `A` where a processor for `B` is expected if `B` is a subtype of `A` (`B < A`).

```typescript
// V is in the parameter position (input)
type Contravariant<V> = (v: V) => void;

// Where Animal is the wider type (W), and Cat is the narrower type (N)
function contravariance(
    contraW: Contravariant<Animal>,
    contraN: Contravariant<Cat>,
) {
  contraW = contraN; // Error! A processor for cat food cannot process any food.
  contraN = contraW; // OK! A general food processor can also handle cat food.
}
```

## Invariance

Invariance is simpler. It represents a lack of interchangeability. In nominative type systems, like in C, this is the only kind of variance. A real-world example of this relationship can be found in waste sorting.

There is the general concept of **Waste** and its specific varieties, such as **Paper Waste**, **Food Waste**, etc.
And if your waste is classified and there is a suitable container for it, you must use that container and only that one.

```typescript
class Waste {
  readonly type = 'non-recyclable';
}
class FoodWaste extends Waste {
  readonly type = 'organic';
}

function unrecycledBin(waste: Waste) {}
function organicBin(waste: FoodWaste) {}

unrecycledBin(new FoodWaste()); // You can't throw food waste into the container for non-recyclables! Do the right thing!
organicBin(new Waste()); // You can't throw unsorted waste into the organic container, are you a criminal???
```

Formally: You can only use `A` where `A` is expected.

```typescript
// V is in both an input and output position
type Invariant<V> = (v: V) => V;

function invariance(
    inW: Invariant<Animal>,
    inN: Invariant<Cat>,
) {
  inW = inN; // Error! The types are not interchangeable.
  inN = inW; // Error! Same thing.
}
```

## Bivariance

The opposite of invariance. Bivariance is complete interchangeability, where type `A` can be replaced by `B` and vice versa.

In TypeScript, bivariance isn't common, but it does exist. For example, as we found out earlier, function parameters are contravariant. But there are exceptions: method parameters are bivariant.

```typescript
type Bivariant<V> = {
    process(v: V): void;
}

function bivariance(
    biW: Bivariant<Animal>,
    biN: Bivariant<Cat>,
) {
  biW = biN; // OK!
  biN = biW; // OK!
}
```

This behavior was chosen by the creators of TypeScript for greater flexibility, although it is theoretically less sound. It can be changed using explicit variance annotations.

```typescript
// The `in` keyword in generics makes the type Contravariant
type ContravariantMethod<in V> = {
    process(v: V): void;
}

function contravariance(
    contraW: ContravariantMethod<Animal>,
    contraN: ContravariantMethod<Cat>,
) {
  contraW = contraN; // Error! This is now strict contravariance.
  contraN = contraW; // OK!
}
```

## Cheat sheet

| Variance | Rule | Type | Example |
| :--- | :--- | :--- | :--- |
| **Covariance** | `Child -> Parent` | Output | `() => T` |
| **Contravariance** | `Parent -> Child` | Input | `(arg: T) => void` |
| **Invariance**| `Type -> Type` | Output and Input | `(arg: T) => T` |
| **Bivariance** | `Child <-> Parent` | Input (method) | `{ method(arg: T) }` |

## References:

- [Stack Overflow: Difference between variance, covariance, contravariance, bivariance and invariance](https://stackoverflow.com/questions/66410115/difference-between-variance-covariance-contravariance-bivariance-and-invarian)
- [TypeScript Docs: Variance Annotations](https://www.typescriptlang.org/docs/handbook/2/generics.html#variance-annotations)

