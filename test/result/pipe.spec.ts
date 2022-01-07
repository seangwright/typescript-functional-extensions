import { Result, ResultOpFn, ResultOpFnAsync } from '@/src/result';
import { ResultAsync, ResultAsyncOpFn } from '@/src/resultAsync';
import { ActionOfT, FunctionOfTtoK, isPromise, Some } from '@/src/utilities';

describe('Result', () => {
  describe('pipe', () => {
    test('executes all operator functions', () => {
      const sut = Result.success(1);

      const result = sut.pipe(
        map((n) => n + 1),
        map((n) => n * 2),
        map((n) => `Calculation: ${n}`)
      );

      expect(sut).toHaveValue(1);
      expect(result).toHaveValue('Calculation: 4');
    });

    test('handles side-effect operator functions', () => {
      let callCount = 0;

      const sut = Result.success(1);

      const result = sut.pipe(
        tap((n) => callCount++),
        tap((n) => callCount++),
        tap((n) => callCount++),
        tap((n) => callCount++)
      );

      expect(result).toHaveValue(1);
      expect(callCount).toBe(4);
    });

    test('handles transitioning to a ResultAsync', async () => {
      const sut = Result.success(1);

      const result = await sut
        .pipe(
          map((n) => n + 1),
          mapAsync((n) => Promise.resolve(n * 2))
        )
        .pipe(asyncMap((n) => n + 3))
        .toPromise();

      expect(result).toHaveValue(7);
    });
  });
});

function map<TValue, TError, TNewValue>(
  projection: FunctionOfTtoK<TValue, Some<TNewValue>>
): ResultOpFn<TValue, TError, TNewValue, TError> {
  return (result) => {
    return result.isSuccess
      ? Result.success(projection(result.getValueOrThrow()))
      : Result.failure(result.getErrorOrThrow());
  };
}

function tap<TValue, TError>(
  action: ActionOfT<TValue>
): ResultOpFn<TValue, TError, TValue, TError> {
  return (result) => {
    if (result.isSuccess) {
      action(result.getValueOrThrow());
    }

    return result;
  };
}

function mapAsync<TValue, TError, TNewValue>(
  projection: FunctionOfTtoK<TValue, Promise<Some<TNewValue>>>
): ResultOpFnAsync<TValue, TError, TNewValue, TError> {
  return (result) => {
    return result.isSuccess
      ? ResultAsync.from(projection(result.getValueOrThrow()))
      : ResultAsync.failure(result.getErrorOrThrow());
  };
}

function asyncMap<TValue, TError, TNewValue>(
  projection:
    | FunctionOfTtoK<TValue, Promise<Some<TNewValue>>>
    | FunctionOfTtoK<TValue, Some<TNewValue>>
): ResultAsyncOpFn<TValue, TError, TNewValue, TError> {
  return (result) => {
    return ResultAsync.from<TNewValue, TError>(
      result.toPromise().then(async (r) => {
        if (r.isFailure) {
          return Result.failure<TNewValue, TError>(r.getErrorOrThrow());
        }

        const result = projection(r.getValueOrThrow());

        if (isPromise(result)) {
          return result.then((r) => Result.success<TNewValue, TError>(r));
        }

        return Result.success<TNewValue, TError>(result);
      })
    );
  };
}
