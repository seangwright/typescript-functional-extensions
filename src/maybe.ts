import { MaybeAsync } from './maybeAsync';
import {
  bind,
  bindAsync,
  map,
  mapAsync,
  MaybeOpFn,
  MaybeOpFnAsync,
  tap,
  tapAsync,
  tapNone,
  tapNoneAsync,
} from './maybeFns';
import { Result } from './result';
import { Unit } from './unit';
import {
  Action,
  ActionOfT,
  AsyncAction,
  AsyncActionOfT,
  FunctionOfT,
  FunctionOfTtoK,
  isDefined,
  isFunction,
  isPromise,
  isSome,
  MaybeMatcher,
  MaybeMatcherNoReturn,
  None,
  pipeFromArray,
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
  static from<TValue>(value: Some<TValue> | None): Maybe<TValue> {
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
   * Returns a Maybe containing the last value of the array,
   * and a Maybe.none if the array is empty
   * @param values
   */
  static tryLast<TValue>(values: TValue[]): Maybe<TValue>;
  /**
   * Returns a Maybe containing the value of the last element
   * of the array matching the condition of the predicate, and
   * a Maybe.none if there are no matches
   * @param values
   * @param predicate
   */
  static tryLast<TValue>(
    values: Some<TValue>[],
    predicate: PredicateOfT<Some<TValue>>
  ): Maybe<TValue>;
  static tryLast<TValue>(
    values: Some<TValue>[],
    predicate?: PredicateOfT<Some<TValue>>
  ): Maybe<TValue> {
    if (isFunction(predicate)) {
      for (let index = values.length - 1; index >= 0; index--) {
        const value = values[index];

        if (predicate(value)) {
          return new Maybe(value);
        }
      }

      return Maybe.none();
    } else {
      return new Maybe(values[values.length - 1]);
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

  pipe(): Maybe<TValue>;

  pipe<A>(op1: MaybeOpFnAsync<TValue, A>): MaybeAsync<A>;
  pipe<A>(op1: MaybeOpFn<TValue, A>): Maybe<A>;

  pipe<A, B>(
    op1: MaybeOpFn<TValue, A>,
    op2: MaybeOpFnAsync<A, B>
  ): MaybeAsync<B>;
  pipe<A, B>(op1: MaybeOpFn<TValue, A>, op2: MaybeOpFn<A, B>): Maybe<B>;

  pipe<A, B, C>(
    op1: MaybeOpFn<TValue, A>,
    op2: MaybeOpFn<A, B>,
    op3: MaybeOpFn<B, C>
  ): Maybe<C>;
  pipe<A, B, C>(
    op1: MaybeOpFn<TValue, A>,
    op2: MaybeOpFn<A, B>,
    op3: MaybeOpFnAsync<B, C>
  ): Maybe<C>;

  pipe<A, B, C, D>(
    op1: MaybeOpFn<TValue, A>,
    op2: MaybeOpFn<A, B>,
    op3: MaybeOpFn<B, C>,
    op4: MaybeOpFn<C, D>
  ): Maybe<D>;
  pipe<A, B, C, D>(
    op1: MaybeOpFn<TValue, A>,
    op2: MaybeOpFn<A, B>,
    op3: MaybeOpFn<B, C>,
    op4: MaybeOpFnAsync<C, D>
  ): Maybe<D>;

  pipe<A, B, C, D, E>(
    op1: MaybeOpFn<TValue, A>,
    op2: MaybeOpFn<A, B>,
    op3: MaybeOpFn<B, C>,
    op4: MaybeOpFn<C, D>,
    op5: MaybeOpFn<D, E>
  ): Maybe<E>;
  pipe<A, B, C, D, E>(
    op1: MaybeOpFn<TValue, A>,
    op2: MaybeOpFn<A, B>,
    op3: MaybeOpFn<B, C>,
    op4: MaybeOpFn<C, D>,
    op5: MaybeOpFnAsync<D, E>
  ): Maybe<E>;

  pipe<A, B, C, D, E, F>(
    op1: MaybeOpFn<TValue, A>,
    op2: MaybeOpFn<A, B>,
    op3: MaybeOpFn<B, C>,
    op4: MaybeOpFn<C, D>,
    op5: MaybeOpFn<D, E>,
    op6: MaybeOpFn<E, F>
  ): Maybe<F>;
  pipe<A, B, C, D, E, F>(
    op1: MaybeOpFn<TValue, A>,
    op2: MaybeOpFn<A, B>,
    op3: MaybeOpFn<B, C>,
    op4: MaybeOpFn<C, D>,
    op5: MaybeOpFn<D, E>,
    op6: MaybeOpFnAsync<E, F>
  ): Maybe<F>;

  pipe<A, B, C, D, E, F, G>(
    op1: MaybeOpFn<TValue, A>,
    op2: MaybeOpFn<A, B>,
    op3: MaybeOpFn<B, C>,
    op4: MaybeOpFn<C, D>,
    op5: MaybeOpFn<D, E>,
    op6: MaybeOpFn<E, F>,
    op7: MaybeOpFn<F, G>
  ): Maybe<G>;
  pipe<A, B, C, D, E, F, G>(
    op1: MaybeOpFn<TValue, A>,
    op2: MaybeOpFn<A, B>,
    op3: MaybeOpFn<B, C>,
    op4: MaybeOpFn<C, D>,
    op5: MaybeOpFn<D, E>,
    op6: MaybeOpFn<E, F>,
    op7: MaybeOpFnAsync<F, G>
  ): Maybe<G>;

  pipe<A, B, C, D, E, F, G, H>(
    op1: MaybeOpFn<TValue, A>,
    op2: MaybeOpFn<A, B>,
    op3: MaybeOpFn<B, C>,
    op4: MaybeOpFn<C, D>,
    op5: MaybeOpFn<D, E>,
    op6: MaybeOpFn<E, F>,
    op7: MaybeOpFn<F, G>,
    op8: MaybeOpFn<G, H>
  ): Maybe<H>;
  pipe<A, B, C, D, E, F, G, H>(
    op1: MaybeOpFn<TValue, A>,
    op2: MaybeOpFn<A, B>,
    op3: MaybeOpFn<B, C>,
    op4: MaybeOpFn<C, D>,
    op5: MaybeOpFn<D, E>,
    op6: MaybeOpFn<E, F>,
    op7: MaybeOpFn<F, G>,
    op8: MaybeOpFnAsync<G, H>
  ): Maybe<H>;
  pipe(
    ...operations: FunctionOfTtoK<any, any>[]
  ): Maybe<any> | MaybeAsync<any> {
    return pipeFromArray(operations)(this);
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
    return this.pipe(map(projection));
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
    return this.pipe(mapAsync(projection));
  }

  /**
   * Executes the given action if the Maybe has a value
   * @param action
   * @returns
   */
  tap(action: ActionOfT<TValue>): Maybe<TValue> {
    return this.pipe(tap(action));
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
    return this.pipe(tapAsync(asyncAction));
  }

  /**
   * Executes an action if the Maybe has no value
   * @param action
   */
  tapNone(action: Action): Maybe<TValue> {
    return this.pipe(tapNone(action));
  }

  /**
   * Executes an action if the Maybe has no value
   * @param action
   */
  tapNoneAsync(action: AsyncAction): MaybeAsync<TValue> {
    return this.pipe(tapNoneAsync(action));
  }

  /**
   * Converts the value of the Maybe, if it has one, to a new Maybe
   * @param projection
   * @returns
   */
  bind<TNewValue>(
    projection: FunctionOfTtoK<TValue, Maybe<Some<TNewValue>>>
  ): Maybe<TNewValue> {
    return this.pipe(bind(projection));
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
    return this.pipe(bindAsync(projection));
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
  ): TNewValue | Unit {
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
   * returns the fallback MaybeAsync
   * @param fallbackPromise
   * @returns
   */
  orAsync(fallbackMaybeAsync: MaybeAsync<TValue>): MaybeAsync<TValue>;
  /**
   * Returns the Maybe, wrapped in a MaybeAsync, if it has a value, otherwise
   * returns executes the fallbackPromiseFactory and returns its value wrapped in a MaybeAsync
   * @param fallbackPromise
   * @returns
   */
  orAsync(
    fallbackPromiseFactory: FunctionOfT<Promise<Some<TValue>>>
  ): MaybeAsync<TValue>;
  /**
   * Returns the Maybe, wrapped in a MaybeAsync, if it has a value, otherwise
   * returns the fallbackPromise, wrapped in a MaybeAsync
   * @param fallbackPromise
   */
  orAsync(fallbackPromise: Promise<Some<TValue>>): MaybeAsync<TValue>;
  orAsync(
    fallback:
      | MaybeAsync<TValue>
      | Promise<Some<TValue>>
      | FunctionOfT<Promise<Some<TValue>>>
  ): MaybeAsync<TValue> {
    if (this.hasValue) {
      return MaybeAsync.some(this.getValueOrThrow());
    }

    if (isPromise(fallback)) {
      return MaybeAsync.from(fallback);
    }

    if (isFunction(fallback)) {
      return MaybeAsync.from(fallback());
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
