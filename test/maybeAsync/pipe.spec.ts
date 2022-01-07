import { Maybe } from '@/src/maybe';
import { MaybeAsync, MaybeAsyncOpFn } from '@/src/maybeAsync';
import {
  ActionOfT,
  AsyncActionOfT,
  FunctionOfTtoK,
  isPromise,
  Some,
} from '@/src/utilities';

describe('MaybeAsync', () => {
  describe('pipe', () => {
    test('executes all operator functions', async () => {
      const sut = MaybeAsync.some(1);

      const innerMaybe = await sut
        .pipe(
          map((n) => n + 1),
          map((n) => n * 2),
          map((n) => `Calculation: ${n}`)
        )
        .toPromise();

      expect(innerMaybe).toHaveValue('Calculation: 4');
    });

    test('handles side-effect operator functions', async () => {
      let callCount = 0;

      const sut = MaybeAsync.some(1);

      const innerMaybe = await sut
        .pipe(
          tap((n) => callCount++),
          tap((n) => callCount++),
          tap((n) => callCount++),
          tap((n) => callCount++)
        )
        .toPromise();

      expect(innerMaybe).toHaveValue(1);
      expect(callCount).toBe(4);
    });
  });
});

function map<TValue, TNewValue>(
  projection:
    | FunctionOfTtoK<TValue, Promise<Some<TNewValue>>>
    | FunctionOfTtoK<TValue, Some<TNewValue>>
): MaybeAsyncOpFn<TValue, TNewValue> {
  return (maybe) => {
    return MaybeAsync.from<TNewValue>(
      maybe.toPromise().then(async (m) => {
        if (m.hasNoValue) {
          return Maybe.none<TNewValue>();
        }

        const result = projection(m.getValueOrThrow());

        if (isPromise(result)) {
          return result.then((r) => Maybe.some<TNewValue>(r));
        }

        return Maybe.some(result);
      })
    );
  };
}

function tap<TValue>(
  action: ActionOfT<TValue> | AsyncActionOfT<TValue>
): MaybeAsyncOpFn<TValue, TValue> {
  return (maybe) => {
    return MaybeAsync.from(
      maybe.toPromise().then(async (m) => {
        if (m.hasNoValue) {
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
