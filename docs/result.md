# Result

## Success/Failure

```typescript
const successfulResult = Result.success('apple');

console.log(successfulResult.getValueOrThrow()); // 'apple'

const failedResult = Result.failure('no fruit');

console.log(failedResult.getErrorOrThrow()); // 'no fruit'
```
