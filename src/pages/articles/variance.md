---
layout: "../../layouts/Article.astro"
title: "Type variance clearly"
description:
  Type Variance is quite tricky topic in type theory. Let's try to crack each type of variance with clear and natural examples.
date: 21/12/2024
---

# Variance

In type theory, variance is describing a relationship between two generic types.
Like, in which circumstances the Parent can be replaced with the Child, in which are not, etc.

You can find a lot of resources on this topic, especially highly mathematic one,
but actually quite a few of them describes it in **short and natural** terms.

I will try to do this here.

## Covariance

The `covariance` relationship represents a general subtyping, when more `Narrow/Child` type
can be used in places where more `Wide/Parent` type is expected. For example:

```
I can use a Cat where an Animal is expected
But I can't use an Animal where the Cat is expected
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

Precise: `You can use B where A is expected, if B < A`.

```typescript
type Co<V> = () => V;
function covariance<Wide, Narrow extends Wide>(
    covarianceW: Co<Wide>,
    covarianceN: Co<Narrow>,
) {
  covarianceW = covarianceN; // Okay! N can replace W (Cat can be used where Animal expected)
  covarianceN = covarianceW; // Error! W cannot replace N (Not any animal can be treated like a cat)
}
```

## Contravariance

Contravariance is an opposite of Covariance. The most tricky one I reckon.
In contravariance, when `Narrow/Child` is expected, the `Wide/Parent` can be used instead.

In which circumstances it can be happed? Well, imagine some `processor` or `handler` of something.
For example, some processor of food, like for `AnimalFood`,
which makes food more protein-rich (I guess it's good for any animal, isn't it?).
And processor for `CatFood`, which makes it taste more **fishy** (silly but whatever).

So, can you process a `CatFood` with an `AnimalFood` processor?
Sure, more protein would not hurt a cat.
But can you process an `AnimalFood` with the `CatFood` processor? I think not,
not everybody loves a fishy taste.

Let's repeat in more strict words:

```
I can process a Cat food in the same way how any Animal food is processed.
But I can't process Animal food in the same way how Cat food is processed.
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

/**
 * Before serving, let's process the food
 */
function serveAnimalFood(processor: (food: AnimalFood) => void): void {
    const food = new AnimalFood();
    processor(food);
    serve(food)
}
function serveCatFood(processor: (food: CatFood) => void): void {
    const food = new CatFood();
    processor(food);
    serve(food)
}

// We can't use Cat food processor to serve an animal food!
// Not all animals like fishy food!
serveAnimalFood(processCatFood);

// You can use Animal food processor to serve a cat food.
// Protein would be good for a cat
serveCatFood(processAnimalFood);
```

Precise: `You can use handler for A where handler for B is expected, if B < A`.

```typescript
type Contra<V> = (v: V) => void;
function contravariance<Wide, Narrow extends Wide>(
    contraW: Contra<Wide>,
    contraN: Contra<Narrow>,
) {
  contraW = contraN; // Error! W cannot be replaced with N
  contraN = contraW; // Okay! N can be replaced with W
}
```

## Invariance

Invariance is easier, especially if you understand already a two above works.
It represents the absense of interchangeablity. In nominal type systems, like in Java, this is the only type of variance.
The real world example of such relationship can be found in waste sorting.

There is a general meaning of `Trash`, and some variances of it, like `PaperWaste`, `FoodWaste`, etc.
And, if your waste is classified, and it has an **appropriate** trash bin, you should use **this and only this** bin.

```
In waste sorting, you can't put a waste in a general bin, if it can be sorted.
You can only put a waste in a bin of an appropriate type.
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

Precise: `You can use A only in places where A is expected`.

```typescript
type Invariant<V> = (v: V) => V;
function invariance<Wide, Narrow extends Wide>(
    inW: Invariant<Wide>,
    inN: Invariant<Narrow>,
) {
  inW = inN; // Error! They are not interchangeable
  inN = inW; // Error! Same here
}
```

## Bivariance

The opposite of `invariance`. I don't think I need to broadly describe it if you got
the point of the previous types. So in short words: **Bivariance** represents **full** interchangeablity.

In TypeScript, the `bivariance` is not so widespread, but you still can find it. For example,
we figured out that function parameters are `contravariant`. But with some exceptions:
methods are parameters are `bivariant`.

```typescript
type Bivariance<V> = { foo(v: V): void; }
function bivariance<Wide, Narrow extends Wide>(
    biW: Bivariance<Wide>,
    biN: Bivariance<Narrow>,
) {
  biW = biN; // Okay!
  biN = biW; // Okay!
}
```

Yeah, TypeScript decided it's okay. But, you can change it using [Variance Annotation](https://www.typescriptlang.org/docs/handbook/2/generics.html#variance-annotations).

```typescript
// `in` keyword in generics makes it Contravariant
type Contra<in V> = { foo(v: V): void; }
function contravariance<Wide, Narrow extends Wide>(
    w: Wide,
    n: Narrow,
    contraW: Contra<Wide>,
    contraN: Contra<Narrow>,
) {
  contraW = contraN; // Error! W cannot be replaced with N
  contraN = contraW; // Okay! N can be replaced with W
}
```

# References

- [Stackoverflow: difference between variances](https://stackoverflow.com/questions/66410115/difference-between-variance-covariance-contravariance-bivariance-and-invarian).
- [TS Doc: TypeScript variance annotation](https://www.typescriptlang.org/docs/handbook/2/generics.html#variance-annotations).

