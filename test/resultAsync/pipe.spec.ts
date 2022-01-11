import { Result } from '@/src/result';
import { ResultAsync, ResultAsyncOpFn } from '@/src/resultAsync';
import {
  ActionOfT,
  AsyncActionOfT,
  FunctionOfTtoK,
  isPromise,
  Some,
} from '@/src/utilities';

describe('ResultAsync', () => {
  describe('pipe', () => {
    test('executes all operator functions', async () => {
      const sut = ResultAsync.success(1);

      const innerResult = await sut
        .pipe(
          map((n) => n + 1),
          map((n) => n * 2),
          map((n) => `Calculation: ${n}`)
        )
        .toPromise();

      expect(innerResult).toHaveValue('Calculation: 4');
    });

    test('handles side-effect operator functions', async () => {
      let callCount = 0;

      const sut = ResultAsync.success(1);

      const innerResult = await sut
        .pipe(
          tap((n) => callCount++),
          tap((n) => callCount++),
          tap((n) => callCount++),
          tap((n) => callCount++)
        )
        .toPromise();

      expect(innerResult).toHaveValue(1);
      expect(callCount).toBe(4);
    });
  });
});

function map<TValue, TError, TNewValue>(
  projection:
    | FunctionOfTtoK<TValue, Promise<Some<TNewValue>>>
    | FunctionOfTtoK<TValue, Some<TNewValue>>
): ResultAsyncOpFn<TValue, TError, TNewValue, TError> {
  return (result) => {
    return ResultAsync.from(
      result.toPromise().then((r) => {
        if (r.isFailure) {
          return Result.failure<TNewValue, TError>(r.getErrorOrThrow());
        }

        const promiseOrValue = projection(r.getValueOrThrow());

        if (isPromise(promiseOrValue)) {
          return promiseOrValue.then((v) =>
            Result.success<TNewValue, TError>(v)
          );
        }

        return Result.success<TNewValue, TError>(promiseOrValue);
      })
    );
  };
}

function tap<TValue, TError>(
  action: ActionOfT<TValue> | AsyncActionOfT<TValue>
): ResultAsyncOpFn<TValue, TError, TValue, TError> {
  return (result) => {
    return ResultAsync.from(
      result.toPromise().then(async (m) => {
        if (m.isFailure) {
          return m;
        }

        const result = action(m.getValueOrThrow());

        if (isPromise(result)) {
          await result;
        }

        return m;
      })
    );
  };
}
