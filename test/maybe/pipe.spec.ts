import { Maybe, MaybeOpFn, MaybeOpFnAsync } from '@/src/maybe';
import { MaybeAsync, MaybeAsyncOpFn } from '@/src/maybeAsync';
import { ActionOfT, FunctionOfTtoK, isPromise, Some } from '@/src/utilities';

describe('Maybe', () => {
  describe('pipe', () => {
    test('executes all operator functions', () => {
      const sut = Maybe.some(1);

      const maybe = sut.pipe(
        map((n) => n + 1),
        map((n) => n * 2),
        map((n) => `Calculation: ${n}`)
      );

      expect(sut).toHaveValue(1);
      expect(maybe).toHaveValue('Calculation: 4');
    });

    test('handles side-effect operator functions', () => {
      let callCount = 0;

      const sut = Maybe.some(1);

      const maybe = sut.pipe(
        tap((n) => callCount++),
        tap((n) => callCount++),
        tap((n) => callCount++),
        tap((n) => callCount++)
      );

      expect(maybe).toHaveValue(1);
      expect(callCount).toBe(4);
    });

    test('handles transitioning to a MaybeAsync', async () => {
      const sut = Maybe.some(1);

      const maybe = await sut
        .pipe(
          map((n) => n + 1),
          mapAsync((n) => Promise.resolve(n * 2))
        )
        .pipe(asyncMap((n) => n + 3))
        .toPromise();

      expect(maybe).toHaveValue(7);
    });
  });
});

function map<TValue, TNewValue>(
  projection: FunctionOfTtoK<TValue, Some<TNewValue>>
): MaybeOpFn<TValue, TNewValue> {
  return (maybe) => {
    return maybe.hasValue
      ? Maybe.some(projection(maybe.getValueOrThrow()))
      : Maybe.none<TNewValue>();
  };
}

function tap<TValue>(action: ActionOfT<TValue>): MaybeOpFn<TValue, TValue> {
  return (maybe) => {
    if (maybe.hasValue) {
      action(maybe.getValueOrThrow());
    }

    return maybe;
  };
}

function mapAsync<TValue, TNewValue>(
  projection: FunctionOfTtoK<TValue, Promise<Some<TNewValue>>>
): MaybeOpFnAsync<TValue, TNewValue> {
  return (maybe) => {
    return maybe.hasValue
      ? MaybeAsync.from(projection(maybe.getValueOrThrow()))
      : MaybeAsync.none();
  };
}

function asyncMap<TValue, TNewValue>(
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
