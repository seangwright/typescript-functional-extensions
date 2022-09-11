# MaybeAsync

## Some/None/From

```typescript
const maybe = MaybeAsync.some('apple');

console.log(await maybe.hasValue); // true
console.log(await maybe.hasNoValue); // false
console.log(await maybe.getValueOrDefault('banana')); // 'apple'
console.log(await maybe.getValueOrThrow()); // 'apple'
```

```typescript
const maybe = MaybeAsync.none();

console.log(await maybe.hasValue); // false
console.log(await maybe.hasNoValue); // true
console.log(await maybe.getValueOrDefault('banana')); // 'banana'
console.log(await maybe.getValueOrThrow()); // throws Error 'No value'
```

```typescript
const maybe = MaybeAsync.from(Maybe.from('apple'));

console.log(await maybe.getValueOrThrow()); // 'apple'
```

```typescript
const promise = Promise.resolve(Maybe.from('apple'));
const maybe = MaybeAsync.from(promise);

console.log(await maybe.getValueOrThrow()); // 'apple'
```

```typescript
const promise = Promise.resolve('apple');
const maybe = MaybeAsync.from(promise);

console.log(await maybe.getValueOrThrow()); // 'apple'
```

```typescript
const promise = Promise.resolve<string | undefined>(undefined);
const maybe = MaybeAsync.from(promise);

console.log(await maybe.getValueOrThrow()); // 'apple'
```
