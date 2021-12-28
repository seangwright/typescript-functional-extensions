import { Maybe } from './maybe';
import { MaybeAsync } from './maybeAsync';
import { FunctionOfTtoK, isPromise, Some } from './utilities';

export type MaybeAsyncOpFn<A, B> = FunctionOfTtoK<MaybeAsync<A>, MaybeAsync<B>>;

export function map<TValue, TNewValue>(
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
