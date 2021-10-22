# Typescript Functional Extensions

A TypeScript implementation of <https://github.com/vkhorikov/CSharpFunctionalExtensions>

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

### Result

`Result` represents a successful or failed operation.

### ResultAsync

`ResultAsync` represents a future result of an operation that either succeeds or fails.
