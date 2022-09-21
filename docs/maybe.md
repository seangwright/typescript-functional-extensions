# Maybe

## Some/None/From

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
console.log(maybe.hasNoValue); // true
console.log(maybe.getValueOrDefault('banana')); // 'banana'
console.log(maybe.getValueOrThrow()); // throws Error 'No value'
```

```typescript
const maybe = Maybe.from(undefined);

console.log(maybe.hasValue); // false
console.log(maybe.hasNoValue); // true
console.log(maybe.getValueOrDefault('banana')); // 'banana'
console.log(maybe.getValueOrThrow()); // throws Error 'No value'
```

## TryFirst

```typescript
const maybe = Maybe.tryFirst(['apple', 'banana']);

console.log(maybe.getValueOrThrow()); // 'apple'
```

```typescript
const maybe = Maybe.tryFirst(['apple', 'banana'], (fruit) => fruit.length > 6);

console.log(maybe.getValueOrThrow()); // throws Error 'No value'
```

## TryLast

```typescript
const maybe = Maybe.tryLast(
  ['apple', 'banana', 'mango'],
  (fruit) => fruit.length === 5
);

console.log(maybe.getValueOrThrow()); // 'mango'
```

```typescript
const maybe = Maybe.tryLast(
  ['apple', 'banana', 'mango'],
  (fruit) => fruit === 'pear'
);

console.log(maybe.getValueOrThrow()); // throws Error 'No value'
```

## Map

```typescript
const maybe = Maybe.some({ type: 'fruit', name: 'apple' })
  .map(({ type }) => ({ type, name: 'banana' }))
  .map((food) => food.name)
  .map((name) => name.length);

console.log(maybe.getValueOrThrow()); // 6
```

```typescript
type Food = {
  type: string;
  name: string;
};

const maybe = Maybe.none<Food>()
  .map(({ type }) => ({ type, name: 'banana' }))
  .map((food) => food.name)
  .map((name) => name.length);

console.log(maybe.getValueOrThrow()); // throws Error 'No value'
```

## Match

```typescript
const maybe = Maybe.some({ type: 'fruit', name: 'apple' })
  .map(({ type }) => ({ type, name: 'banana' }))
  .map((food) => food.name)
  .map((name) => name.length)
  .match({
    some: (number) => console.log(number),
    none: () => console.log('None!'),
  }); // 6
```

```typescript
type Food = {
  type: string;
  name: string;
};

const maybe = Maybe.none<Food>()
  .map(({ type }) => ({ type, name: 'banana' }))
  .map((food) => food.name)
  .map((name) => name.length)
  .match({
    some: (number) => console.log(number),
    none: () => console.log('None!'),
  }); // None!
```

## Pipe

```typescript
// custom-operators.ts
import { logger, LogLevel } from 'logger';

export function log<TValue>(
  messageCreator: FunctionOfTtoK<TValue, string>,
  logLevel: LogLevel = 'debug'
): MaybeOpFn<TValue, TValue> {
  return (maybe) => {
    if (maybe.hasValue) {
      logger.log(messageCreator(maybe.getValueOrThrow()), logLevel);
    } else {
      logger.error('No value found!');
    }

    return maybe;
  };
}

// app.ts
import { log } from './custom-operators.ts';

const maybe = Maybe.some('apple')
  .pipe(log((f) => `My fruit is ${f}`, 'information'))
  .map((f) => `${f} and banana`)
  .pipe(log((f) => `Now I have ${f}`));
```
