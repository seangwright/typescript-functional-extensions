import { AsyncActionOfT, isSome } from '.';
import { MaybeAsync } from './maybeAsync';
import { Result } from './result';
import { Unit } from './unit';
import {
  ActionOfT,
  FunctionOfT,
  FunctionOfTtoK,
  isDefined,
  isFunction,
  isPromise,
  MaybeMatcher,
  MaybeMatcherNoReturn,
  None,
  PredicateOfT,
  Some,
} from './utilities';

/**
 * Represents a value that might not exist
 */
export class Maybe<TValue> {
  /**
   * Creates a new Maybe with a value
   * @param value The value of the new maybe
   * @returns
   */
  static some<TValue>(value: Some<TValue>): Maybe<TValue> {
    return new Maybe<TValue>(value);
  }

  /**
   * Creates a new Maybe with no value
   * @returns {Maybe}
   */
  static none<TValue>(): Maybe<TValue> {
    return new Maybe();
  }

  /**
   * Creates a new Maybe. If no value is provided, it is equivalent to calling Maybe.none(), and
   * if a value is provided, it is equivalent to calling Maybe.some(val)
   * @param value The value of the new Maybe.
   * @returns {Maybe}
   */
  static from<TValue>(value: Some<TValue>): Maybe<TValue> {
    return new Maybe(value);
  }

  /**
   * Returns a Maybe containing the first value of the array,
   * and a Maybe.none if the array is empty
   * @param values
   */
  static tryFirst<TValue>(values: TValue[]): Maybe<TValue>;
  /**
   * Returns a Maybe containing the value of the first element
   * of the array matching the condition of the predicate, and
   * a Maybe.none if there are no matches
   * @param values
   * @param predicate
   */
  static tryFirst<TValue>(
    values: Some<TValue>[],
    predicate: PredicateOfT<Some<TValue>>
  ): Maybe<TValue>;
  static tryFirst<TValue>(
    values: Some<TValue>[],
    predicate?: PredicateOfT<Some<TValue>>
  ): Maybe<TValue> {
    if (isFunction(predicate)) {
      return new Maybe(values.find(predicate));
    } else {
      return new Maybe(values[0]);
    }
  }

  /**
   * Returns only the Maybe instances of the array that have
   * values
   * @param maybes
   */
  static choose<TValue>(maybes: Maybe<TValue>[]): TValue[];
  /**
   * Returns only the Maybe instances of the array that have values,
   * passing each value to the given projection to be transformed to a new
   * value
   * @param maybes
   * @param projection
   */
  static choose<TValue, TNewValue>(
    maybes: Maybe<TValue>[],
    projection: FunctionOfTtoK<TValue, Some<TNewValue>>
  ): TNewValue[];
  static choose<TValue, TNewValue>(
    maybes: Maybe<TValue>[],
    projection?: FunctionOfTtoK<TValue, Some<TNewValue>>
  ): TValue[] | TNewValue[] {
    if (typeof projection === 'function') {
      const values: TNewValue[] = [];

      for (const m of maybes) {
        if (m.hasNoValue) {
          continue;
        }

        const original = m.getValueOrThrow();

        values.push(projection(original));
      }

      return values;
    } else {
      const values: TValue[] = [];
      for (const m of maybes) {
        if (m.hasNoValue) {
          continue;
        }

        const original = m.getValueOrThrow();

        values.push(original);
      }

      return values;
    }
  }

  private value: Some<TValue> | undefined;

  /**
   * Returns true if the Maybe contains a value
   */
  get hasValue(): boolean {
    return isDefined(this.value);
  }

  /**
   * Returns true if the Maybe has no value
   */
  get hasNoValue(): boolean {
    return !this.hasValue;
  }

  protected constructor(value: Some<TValue> | None) {
    this.value = isDefined(value) ? value : undefined;
  }

  /**
   * Returns the value of the Maybe if it has one,
   * and the default value if there is none
   * @param defaultValue
   */
  getValueOrDefault(defaultValue: Some<TValue>): TValue;
  /**
   * Returns the value of the Maybe if it has one,
   * and returns the result of the factory function if
   * there is none
   * @param factory
   */
  getValueOrDefault(factory: FunctionOfT<Some<TValue>>): TValue;
  getValueOrDefault(
    defaultValueOrFactory: Some<TValue> | FunctionOfT<Some<TValue>>
  ): TValue {
    if (isDefined(this.value)) {
      return this.value;
    }

    if (isFunction(defaultValueOrFactory)) {
      return defaultValueOrFactory();
    }

    return defaultValueOrFactory;
  }

  /**
   * Returns the value of the Maybe and throws
   * and Error if there is none
   * @returns
   */
  getValueOrThrow(): Some<TValue> {
    if (isSome(this.value)) {
      return this.value;
    }

    throw Error('No value');
  }

  /**
   * Converts the value of the Maybe, if there is one, to a new value
   * as defined by the provided projection function
   * @param projection
   * @returns
   */
  map<TNewValue>(
    projection: FunctionOfTtoK<TValue, Some<TNewValue>>
  ): Maybe<TNewValue> {
    return this.hasValue
      ? new Maybe(projection(this.getValueOrThrow()))
      : Maybe.none();
  }

  /**
   * Converts the value of the Maybe, if there is one, to a new value
   * as defined by the provided projection, wrapping the asynchronous result in a MaybeAsync
   * @param projection
   * @returns
   */
  mapAsync<TNewValue>(
    projection: FunctionOfTtoK<TValue, Promise<Some<TNewValue>>>
  ): MaybeAsync<TNewValue> {
    return this.hasValue
      ? MaybeAsync.from(projection(this.getValueOrThrow()))
      : MaybeAsync.none();
  }

  /**
   * Executes the given action if the Maybe has a value
   * @param action
   * @returns
   */
  tap(action: ActionOfT<TValue>): Maybe<TValue> {
    if (this.hasValue) {
      action(this.getValueOrThrow());
    }

    return this;
  }

  /**
   * Executes the given asynchronous action if the Maybe has a
   * value and retursn a new MaybeAsync
   * @param asyncAction
   * @returns
   */
  tapAsync(
    asyncAction: FunctionOfTtoK<TValue, Promise<void>>
  ): MaybeAsync<TValue> {
    if (this.hasNoValue) {
      return MaybeAsync.none();
    }

    const promise = new Promise<Some<TValue>>((resolve) => {
      const value = this.getValueOrThrow();
      asyncAction(value).then(() => resolve(value));
    });

    return MaybeAsync.from(promise);
  }

  /**
   * Converts the value of the Maybe, if it has one, to a new Maybe
   * @param projection
   * @returns
   */
  bind<TNewValue>(
    projection: FunctionOfTtoK<TValue, Maybe<Some<TNewValue>>>
  ): Maybe<TNewValue> {
    return this.hasValue ? projection(this.getValueOrThrow()) : Maybe.none();
  }

  /**
   * Converts the value of the Maybe, if it has one, to a new
   * MaybeAsync
   * @param projection
   * @returns
   */
  bindAsync<TNewValue>(
    projection: FunctionOfTtoK<TValue, MaybeAsync<Some<TNewValue>>>
  ): MaybeAsync<TNewValue> {
    return this.hasValue
      ? projection(this.getValueOrThrow())
      : MaybeAsync.none();
  }

  /**
   * Maps the value of the Maybe, if it has one, using the given projection some function,
   * and the none function otherwise
   * @param projection
   */
  match<TNewValue>(projection: MaybeMatcher<TValue, TNewValue>): TNewValue;
  /**
   * Executes the some function of the given matcher if the Maybe has a value,
   * and the none function if there is no value
   * @param matcher
   * @returns
   */
  match(matcher: MaybeMatcherNoReturn<TValue>): Unit;
  match<TNewValue>(
    matcherOrprojection:
      | MaybeMatcher<TValue, TNewValue>
      | MaybeMatcherNoReturn<TValue>
  ): TValue | Unit {
    if (this.hasValue) {
      const someResult = matcherOrprojection.some(this.getValueOrThrow());

      return isDefined(someResult) ? someResult : Unit.Instance;
    }

    const noneResult = matcherOrprojection.none();

    return isDefined(noneResult) ? noneResult : Unit.Instance;
  }

  /**
   * Executes the given action if the Maybe has a value
   * @param action
   */
  execute(action: ActionOfT<TValue>): Unit {
    if (this.hasValue) {
      action(this.getValueOrThrow());
    }

    return Unit.Instance;
  }

  /**
   * Executes the given async action if the Maybe has a value
   * @param action A void Promise returning function
   * @returns A Promise containing Unit
   */
  executeAsync(action: AsyncActionOfT<TValue>): Promise<Unit> {
    if (this.hasValue) {
      return action(this.getValueOrThrow()).then(() => Unit.Instance);
    }

    return Promise.resolve(Unit.Instance);
  }

  /**
   * Returns the Maybe if it has a value, otherwise it returns
   * the fallbackValue returned in a Maybe
   * @param fallbackValue
   */
  or(fallbackValue: Some<TValue>): Maybe<TValue>;
  /**
   * Returns the Maybe if it has a value, otherwise it returns the fallbackMaybe
   * @param fallbackMaybe
   */
  or(fallbackMaybe: Maybe<TValue>): Maybe<TValue>;
  /**
   * Returns the Maybe if it has a value, otherwise executes and
   * returns the value of the fallbackFactory wrapped in a Maybe
   * @param fallbackfactory
   */
  or(fallbackfactory: FunctionOfT<Some<TValue>>): Maybe<TValue>;
  /**
   * Returns the Maybe if it has a value, otherwise executes the fallbackMaybeFactory
   * and returns its result
   * @param fallbackMaybefactory
   */
  or(fallbackMaybefactory: FunctionOfT<Maybe<TValue>>): Maybe<TValue>;
  or(
    fallback:
      | Some<TValue>
      | Maybe<TValue>
      | FunctionOfT<Some<TValue>>
      | FunctionOfT<Maybe<TValue>>
  ): Maybe<TValue> {
    if (this.hasValue) {
      return new Maybe(this.getValueOrThrow());
    }

    if (isFunction(fallback)) {
      const maybeOrValue = fallback();

      return maybeOrValue instanceof Maybe
        ? maybeOrValue
        : new Maybe(maybeOrValue);
    } else if (fallback instanceof Maybe) {
      return fallback;
    }

    return new Maybe(fallback);
  }

  /**
   * Returns the Maybe, wrapped in a MaybeAsync, if it has a value, otherwise
   * returns the fallbackMaybeAsync
   * @param fallbackPromise
   * @returns
   */
  orAsync(fallbackMaybeAsync: MaybeAsync<TValue>): MaybeAsync<TValue>;
  /**
   * Returns the Maybe, wrapped in a MaybeAsync, if it has a value, otherwise
   * returns the fallbackPromise, wrapped in a MaybeAsync
   * @param fallbackPromise
   */
  orAsync(fallbackPromise: Promise<Some<TValue>>): MaybeAsync<TValue>;
  orAsync(
    fallback: MaybeAsync<TValue> | Promise<Some<TValue>>
  ): MaybeAsync<TValue> {
    if (this.hasValue) {
      return MaybeAsync.some(this.getValueOrThrow());
    }

    if (isPromise(fallback)) {
      return MaybeAsync.from(fallback);
    }

    return fallback;
  }

  /**
   * Converts the Maybe into a Result. The Result is successful if there is a value
   * and a failure, with the given error, if there is not
   * @param error
   * @returns
   */
  toResult<TError>(error: Some<TError>): Result<TValue, TError> {
    return this.hasValue
      ? Result.success(this.getValueOrThrow())
      : Result.failure(error);
  }

  /**
   * Returns the string representation of the Maybe (either some or none)
   * @returns
   */
  toString(): string {
    return this.hasValue ? `Maybe.some` : 'Maybe.none';
  }

  /**
   * Returns true if the Maybes both have values and the values are strictly equal
   * @param maybe
   * @returns
   */
  equals(maybe: Maybe<TValue>): boolean {
    return (
      this.hasValue &&
      maybe.hasValue &&
      this.getValueOrThrow() === maybe.getValueOrThrow()
    );
  }
}
