# Typescript Functional Extensions

[![NPM](https://nodei.co/npm/typescript-functional-extensions.png)](https://nodei.co/npm/typescript-functional-extensions/)

A TypeScript implementation of <https://github.com/vkhorikov/CSharpFunctionalExtensions>, including `Maybe` and `Result` monads.

## Further Reading

- [Functional Extensions for C#](https://github.com/vkhorikov/CSharpFunctionalExtensions)
- [Functors, Applicatives, And Monads In Pictures](https://adit.io/posts/2013-04-17-functors,_applicatives,_and_monads_in_pictures.html)
- [Modeling Missing Data - The Maybe Monad](https://dev.to/seangwright/kentico-xperience-design-patterns-modeling-missing-data-the-maybe-monad-2c7i)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)

## Monads

Below are the monads included in this package and examples of their use.

### Maybe

`Maybe` represents a value that might or might not exist.

```typescript
const maybe = Maybe.some('apple');

console.log(maybe.hasValue); // true
console.log(maybe.hasNoValue); // false
console.log(maybe.getValueOrDefault('banana')); // 'apple'
console.log(maybe.getValueOrThrow()); // 'apple'
```

```typescript
const maybe = Maybe.none();

console.log(maybe.hasValue); // false
console.log(maybe.hasNoValue); // false
console.log(maybe.getValueOrDefault('banana')); // 'banana'
console.log(maybe.getValueOrThrow()); // throws Error 'No value'
```

### MaybeAsync

`MaybeAsync` represents a future value (`Promise`) that might or might not exist.

```typescript
function getFruit(day): Promise<string> {
  return Promise.resolve('apple');
}

const maybeAsync = MaybeAsync.from(getFruit());

const maybe = maybeAsync.toPromise();

console.log(maybe.getValueOrThrow()); // 'apple'
```

### Result

`Result` represents a successful or failed operation.

```typescript
const successfulResult = Result.success('apple');

console.log(successfulResult.getValueOrThrow()); // 'apple'

const failedResult = Result.failure('no fruit');

console.log(failedResult.getErrorOrThrow()); // 'no fruit'
```

### ResultAsync

`ResultAsync` represents a future result of an operation that either succeeds or fails.

```typescript
function getLatestInventory(): Promise<{ apples: number }> {
  return Promise.reject('connection failure');
}

const resultAsync = ResultAsync.from(async () => {
  try {
    const value = await getLatestInventory();
    return Result.success(value);
  } catch (error: unknown) {
    return Result.failure(`Could not retrieve inventory: ${error}`);
  }
});

const result = await resultAsync.toPromise();

console.log(result.getErrorOrThrow()); // 'Could not retrieve inventory: connection failure
```
