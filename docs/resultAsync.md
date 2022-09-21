# ResultAsync

## Success/Failure/From

```typescript
const successfulResult = ResultAsync.success('apple');

console.log(await successfulResult.getValueOrThrow()); // 'apple'

const failedResult = ResultAsync.failure('no fruit');

console.log(await failedResult.getErrorOrThrow()); // 'no fruit'
```

```typescript
const result = Result.success('apple');
const resultAsync = ResultAsync.from(result);

console.log(await resultAsync.getValueOrThrow()); // 'apple'
```

```typescript
const result = Result.failure('no fruit');
const resultAsync = ResultAsync.from(Promise.resolve(result));

console.log(await resultAsync.getErrorOrThrow()); // 'no fruit'
```
