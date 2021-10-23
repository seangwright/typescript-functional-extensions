import { isPromise, MaybeAsync } from '.';
import { Result } from './result';
import {
  ActionOfT,
  FunctionOfT,
  FunctionOfTtoK,
  isDefined,
  isFunction,
  MaybeMatcher,
  MaybeMatcherNoReturn,
  PredicateOfT,
} from './utilities';

/**
 * Represents a value that might not exist
 */
export class Maybe<TValue> {
  /**
   * Creates a new maybe with a value
   * @param value The value of the new maybe
   * @returns
   */
  static some<TValue>(value: TValue): Maybe<TValue> {
    return new Maybe(value);
  }

  /**
   * Creates a new maybe with no value
   * @returns {Maybe}
   */
  static none<TValue>(): Maybe<TValue> {
    return new Maybe();
  }

  /**
   * Creates a new maybe. If no value is provided, it is equivalent to calling maybe.none(), and
   * if a value is provided, it is equivalent to calling maybe.some(val)
   * @param value The value of the new maybe.
   * @returns {Maybe}
   */
  static from<TValue>(value: TValue | undefined | null): Maybe<TValue> {
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
    values: TValue[],
    predicate: PredicateOfT<TValue>
  ): Maybe<TValue>;
  static tryFirst<TValue>(
    values: TValue[],
    predicate?: PredicateOfT<TValue>
  ): Maybe<TValue> {
    if (typeof predicate === 'function') {
      return Maybe.from(values.find(predicate));
    } else {
      return Maybe.from(values[0]);
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
   * passing each value to the given mapper to be transformed to a new
   * value
   * @param maybes
   * @param mapper
   */
  static choose<TValue, TNewValue>(
    maybes: Maybe<TValue>[],
    mapper: FunctionOfTtoK<TValue, TNewValue>
  ): TNewValue[];
  static choose<TValue, TNewValue>(
    maybes: Maybe<TValue>[],
    mapper?: FunctionOfTtoK<TValue, TNewValue>
  ): TValue[] | TNewValue[] {
    if (typeof mapper === 'function') {
      const values: TNewValue[] = [];

      for (const m of maybes) {
        if (m.hasNoValue) {
          continue;
        }

        const original = m.getValueOrThrow();

        values.push(mapper(original));
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

  private value: TValue | undefined;

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

  protected constructor(value?: TValue | null) {
    this.value = isDefined(value) ? value : undefined;
  }

  /**
   * Returns the value of the Maybe if it has one,
   * and the default value if there is none
   * @param defaultValue
   */
  getValueOrDefault(defaultValue: TValue): TValue;
  /**
   * Returns the value of the Maybe if it has one,
   * and returns the result of the factory function if
   * there is none
   * @param factory
   */
  getValueOrDefault(factory: FunctionOfT<TValue>): TValue;
  getValueOrDefault(
    defaultValueOrFactory: TValue | FunctionOfT<TValue>
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
  getValueOrThrow(): TValue {
    if (isDefined(this.value)) {
      return this.value;
    }

    throw Error('No value');
  }

  /**
   * Converts the value of the Maybe, if there is one, to a new value
   * as defined by the provided mapper function
   * @param mapper
   * @returns
   */
  map<TNewValue>(mapper: FunctionOfTtoK<TValue, TNewValue>): Maybe<TNewValue> {
    return this.hasValue
      ? new Maybe(mapper(this.getValueOrThrow()))
      : Maybe.none();
  }

  /**
   * Converts the value of the Maybe, if there is one, to a new value
   * as defined by the provided mapper, wrapping the asynchronous result in a MaybeAsync
   * @param mapper
   * @returns
   */
  mapAsync<TNewValue>(
    mapper: FunctionOfTtoK<TValue, Promise<TNewValue>>
  ): MaybeAsync<TNewValue> {
    return this.hasValue
      ? MaybeAsync.from(mapper(this.getValueOrThrow()))
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
    if (this.hasValue) {
      return MaybeAsync.from(
        new Promise<TValue>((resolve) => {
          const value = this.getValueOrThrow();
          asyncAction(value).then(() => resolve(value));
        })
      );
    }

    return MaybeAsync.none();
  }

  /**
   * Converts the value of the Maybe, if it has one, to a new Maybe
   * @param mapper
   * @returns
   */
  bind<TNewValue>(
    mapper: FunctionOfTtoK<TValue, Maybe<TNewValue>>
  ): Maybe<TNewValue> {
    return this.hasValue ? mapper(this.getValueOrThrow()) : Maybe.none();
  }

  /**
   * Converts the value of the Maybe, if it has one, to a new
   * MaybeAsync
   * @param mapper
   * @returns
   */
  bindAsync<TNewValue>(
    mapper: FunctionOfTtoK<TValue, MaybeAsync<TNewValue>>
  ): MaybeAsync<TNewValue> {
    return this.hasValue ? mapper(this.getValueOrThrow()) : MaybeAsync.none();
  }

  /**
   * Executes the some function of the given matcher if the Maybe has a value,
   * and the none function if there is no value
   * @param matcher
   * @returns
   */
  match(matcher: MaybeMatcherNoReturn<TValue>): void;
  /**
   * Maps the value of the Maybe, if it has one, using the given mapper some function,
   * and the none function otherwise
   * @param mapper
   */
  match<TNewValue>(mapper: MaybeMatcher<TValue, TNewValue>): TNewValue;
  match<TNewValue>(
    matcherOrMapper:
      | MaybeMatcher<TValue, TNewValue>
      | MaybeMatcherNoReturn<TValue>
  ): TNewValue | void {
    return this.hasValue
      ? matcherOrMapper.some(this.getValueOrThrow())
      : matcherOrMapper.none();
  }

  /**
   * Executes the given action if the Maybe has a value
   * @param action
   */
  execute(action: ActionOfT<TValue>): void {
    if (this.hasValue) {
      action(this.getValueOrThrow());
    }
  }

  /**
   * Returns the Maybe if it has a value, otherwise it returns
   * the fallbackValue returned in a Maybe
   * @param fallbackValue
   */
  or(fallbackValue: TValue): Maybe<TValue>;
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
  or(fallbackfactory: FunctionOfT<TValue>): Maybe<TValue>;
  /**
   * Returns the Maybe if it has a value, otherwise executes the fallbackMaybeFactory
   * and returns its result
   * @param fallbackMaybefactory
   */
  or(fallbackMaybefactory: FunctionOfT<Maybe<TValue>>): Maybe<TValue>;
  or(
    fallback:
      | TValue
      | Maybe<TValue>
      | FunctionOfT<TValue>
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
  orAsync(fallbackPromise: Promise<TValue>): MaybeAsync<TValue>;
  orAsync(fallback: MaybeAsync<TValue> | Promise<TValue>): MaybeAsync<TValue> {
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
  toResult<TError>(error: TError): Result<TValue, TError> {
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
