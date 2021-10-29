import { Maybe } from './maybe';
import { ResultAsync } from './resultAsync';
import { Unit } from './unit';
import {
  ActionOfT,
  AsyncActionOfT,
  FunctionOfT,
  FunctionOfTtoK,
  isDefined,
  isFunction,
  isPromise,
  MaybeMatcher,
  MaybeMatcherNoReturn,
  Some,
} from './utilities';

/**
 * Represents an asynchronous value that might or might not exist
 */
export class MaybeAsync<TValue> {
  /**
   * Creates a new MaybeAsync from the given value
   * @param value Can be a Promise or Maybe
   * @returns MaybeAsync
   */
  static from<TValue>(maybe: Maybe<TValue>): MaybeAsync<TValue>;
  static from<TValue>(promise: Promise<Some<TValue>>): MaybeAsync<TValue>;
  static from<TValue>(maybePromise: Promise<Maybe<TValue>>): MaybeAsync<TValue>;
  static from<TValue>(
    valueOrPromiseOrMaybePromise:
      | Promise<Some<TValue> | Maybe<TValue>>
      | Maybe<TValue>
  ): MaybeAsync<TValue> {
    if (isPromise(valueOrPromiseOrMaybePromise)) {
      return new MaybeAsync(
        valueOrPromiseOrMaybePromise.then((v) =>
          v instanceof Maybe ? v : Maybe.from(v)
        )
      );
    } else if (valueOrPromiseOrMaybePromise instanceof Maybe) {
      return new MaybeAsync(Promise.resolve(valueOrPromiseOrMaybePromise));
    }

    throw new Error('Value must be a Promise or Maybe');
  }

  /**
   * Creates a new MaybeAsync from the given value
   * @param value
   * @returns
   */
  static some<TValue>(value: Some<TValue>): MaybeAsync<TValue> {
    return new MaybeAsync(Promise.resolve(Maybe.some(value)));
  }

  /**
   * Creates a new MaybeAsync with no value
   * @returns
   */
  static none<TValue>(): MaybeAsync<TValue> {
    return new MaybeAsync(Promise.resolve(Maybe.none()));
  }

  get hasValue(): Promise<boolean> {
    return this.value.then((m) => m.hasValue);
  }

  get hasNoValue(): Promise<boolean> {
    return this.value.then((m) => m.hasNoValue);
  }

  private value: Promise<Maybe<TValue>>;

  protected constructor(value: Promise<Maybe<TValue>>) {
    this.value = value;
  }

  map<TNewValue>(
    projection: FunctionOfTtoK<TValue, Some<TNewValue>>
  ): MaybeAsync<TNewValue>;
  map<TNewValue>(
    projection: FunctionOfTtoK<TValue, Promise<Some<TNewValue>>>
  ): MaybeAsync<TNewValue>;
  map<TNewValue>(
    projection:
      | FunctionOfTtoK<TValue, Some<TNewValue>>
      | FunctionOfTtoK<TValue, Promise<Some<TNewValue>>>
  ): MaybeAsync<TNewValue> {
    return new MaybeAsync(
      this.value.then(async (m) => {
        if (m.hasNoValue) {
          return Maybe.none<TNewValue>();
        }

        const result = projection(m.getValueOrThrow());

        if (isPromise(result)) {
          return result.then((r) => Maybe.some(r));
        }

        return Maybe.some(result);
      })
    );
  }

  tap(action: ActionOfT<TValue>): MaybeAsync<TValue>;
  tap(action: AsyncActionOfT<TValue>): MaybeAsync<TValue>;
  tap(action: ActionOfT<TValue> | AsyncActionOfT<TValue>): MaybeAsync<TValue> {
    return new MaybeAsync(
      this.value.then(async (m) => {
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
  }

  bind<TNewValue>(
    projection: FunctionOfTtoK<TValue, Maybe<TNewValue>>
  ): MaybeAsync<TNewValue>;
  bind<TNewValue>(
    projection: FunctionOfTtoK<TValue, MaybeAsync<TNewValue>>
  ): MaybeAsync<TNewValue>;
  bind<TNewValue>(
    projection:
      | FunctionOfTtoK<TValue, Maybe<TNewValue>>
      | FunctionOfTtoK<TValue, MaybeAsync<TNewValue>>
  ): MaybeAsync<TNewValue> {
    return new MaybeAsync(
      this.value.then((m) => {
        if (m.hasNoValue) {
          return Maybe.none<TNewValue>();
        }

        const result = projection(m.getValueOrThrow());

        if (result instanceof Maybe) {
          return result;
        }

        return result.toPromise();
      })
    );
  }

  match<TNewValue>(
    matcher: MaybeMatcher<TValue, TNewValue>
  ): Promise<TNewValue>;
  match(matcher: MaybeMatcherNoReturn<TValue>): Promise<Unit>;
  match<TNewValue>(
    matcher: MaybeMatcher<TValue, TNewValue> | MaybeMatcherNoReturn<TValue>
  ): Promise<TNewValue | Unit> {
    return this.value.then((m) => m.match(matcher));
  }

  execute(func: ActionOfT<TValue>): Promise<Unit>;
  execute(func: AsyncActionOfT<TValue>): Promise<Unit>;
  execute(func: ActionOfT<TValue> | AsyncActionOfT<TValue>): Promise<Unit> {
    return this.value.then((m) => {
      if (m.hasNoValue) {
        return Unit.Instance;
      }

      const result = func(m.getValueOrThrow());

      return isPromise(result)
        ? result.then(() => Unit.Instance)
        : Unit.Instance;
    });
  }

  or(
    fallback:
      | Some<TValue>
      | FunctionOfT<Some<TValue>>
      | Maybe<TValue>
      | FunctionOfT<Maybe<TValue>>
      | MaybeAsync<TValue>
      | FunctionOfT<MaybeAsync<TValue>>
  ): MaybeAsync<TValue> {
    return new MaybeAsync(
      this.value.then((m) => {
        if (fallback instanceof MaybeAsync) {
          return m.orAsync(fallback).toPromise();
        } else {
          if (m.hasValue) {
            return m;
          }

          if (!isFunction(fallback)) {
            if (fallback instanceof Maybe) {
              return m.or(fallback);
            }

            return m.or(fallback);
          }

          const result = fallback();

          if (result instanceof MaybeAsync) {
            return m.orAsync(result).toPromise();
          }

          if (result instanceof Maybe) {
            return m.or(result);
          }

          return m.or(result);
        }
      })
    );
  }

  toResult(error: string): ResultAsync<Unit, string> {
    return ResultAsync.from(this.value.then((m) => m.toResult(error)));
  }

  /**
   * Returns the inner Promise, wrapping Maybe.none if handleError is true
   * for a rejected Promise, otherwise rejected Promise handling is left up to the caller.
   * @param handleError
   * @returns
   */
  toPromise(handleError: boolean = false): Promise<Maybe<TValue>> {
    return isDefined(handleError) && handleError
      ? this.value.catch((_) => Maybe.none())
      : this.value;
  }
}
