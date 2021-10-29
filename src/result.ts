import { isSome } from '.';
import { ResultAsync } from './resultAsync';
import { Unit } from './unit';
import {
  Action,
  ActionOfT,
  AsyncActionOfT,
  FunctionOfT,
  FunctionOfTtoK,
  isDefined,
  isFunction,
  isPromise,
  never,
  None,
  Predicate,
  PredicateOfT,
  ResultMatcher,
  ResultMatcherNoReturn,
  Some,
} from './utilities';

/**
 * Represents a successful or failed operation
 */
export class Result<TValue = Unit, TError = string> {
  /**
   * Creates a new successful Result with a string error type
   * and Unit value type
   */
  static success(): Result<Unit, string>;
  /**
   * Creates a new successful Result with the given value
   * @param value the result of the successful operation
   */
  static success<TValue, TError = string>(
    value: Some<TValue>
  ): Result<TValue, TError>;
  /**
   * Creates a new successful Result with the given value
   * @param value the result of the successful operation
   * @returns new successful Result
   */
  static success<TValue, TError = string>(
    value?: Some<TValue> | None
  ): Result<TValue, TError> {
    return isSome(value)
      ? new Result<TValue, TError>({ value, error: undefined, isSuccess: true })
      : (new Result<Unit, TError>({
          value: Unit.Instance,
          error: undefined,
          isSuccess: true,
        }) as Result<TValue, TError>);
  }

  static successIf<TValue = Unit, TError = string>(
    condition: boolean,
    state: { value: Some<TValue>; error: Some<TError> }
  ): Result<TValue, TError>;
  static successIf<TValue = Unit, TError = string>(
    predicate: Predicate,
    state: { value: Some<TValue>; error: Some<TError> }
  ): Result<TValue, TError>;
  static successIf<TValue = Unit, TError = string>(
    conditionOrPredicate: boolean | Predicate,
    state: { value: Some<TValue>; error: Some<TError> }
  ): Result<TValue, TError> {
    const condition = isFunction(conditionOrPredicate)
      ? conditionOrPredicate()
      : conditionOrPredicate;

    return condition
      ? Result.success(state.value)
      : Result.failure(state.error);
  }

  /**
   * Creates a new failed Result
   * @param error the error of the failed operation
   * @returns new failed Result
   */
  static failure<TValue = Unit, TError = string>(
    error: Some<TError>
  ): Result<TValue, TError> {
    return new Result<TValue, TError>({
      value: undefined,
      error,
      isSuccess: false,
    });
  }

  static failureIf<TValue = Unit, TError = string>(
    condition: boolean,
    state: { value: Some<TValue>; error: Some<TError> }
  ): Result<TValue, TError>;
  static failureIf<TValue = Unit, TError = string>(
    predicate: Predicate,
    state: { value: Some<TValue>; error: Some<TError> }
  ): Result<TValue, TError>;
  static failureIf<TValue = Unit, TError = string>(
    conditionOrPredicate: boolean | Predicate,
    state: { value: Some<TValue>; error: Some<TError> }
  ): Result<TValue, TError> {
    const condition = isFunction(conditionOrPredicate)
      ? conditionOrPredicate()
      : conditionOrPredicate;

    return condition
      ? Result.failure(state.error)
      : Result.success(state.value);
  }

  /**
   * Returns only the values of successful Results
   * @param results
   */
  static choose<TValue, TError>(results: Result<TValue, TError>[]): TValue[];
  /**
   * Returns only the values of successful Results, mapped to new values
   * with the given selector function
   * @param results
   * @param projection
   */
  static choose<TValue, TNewValue, TError>(
    results: Result<TValue, TError>[],
    projection: FunctionOfTtoK<TValue, TNewValue>
  ): TNewValue[];
  /**
   * Returns only the values of successful Results. If a selector function
   * is provided, it will be used to map the values to new ones before they
   * are returned
   * @param results
   * @param projection
   * @returns
   */
  static choose<TValue, TNewValue, TError>(
    results: Result<TValue, TError>[],
    projection?: FunctionOfTtoK<TValue, TNewValue>
  ): TValue[] | TNewValue[] {
    if (typeof projection === 'function') {
      const values: TNewValue[] = [];

      for (const r of results) {
        if (r.isFailure) {
          continue;
        }

        const original = r.getValueOrThrow();

        values.push(projection(original));
      }

      return values;
    } else {
      const values: TValue[] = [];
      for (const r of results) {
        if (r.isFailure) {
          continue;
        }

        const original = r.getValueOrThrow();

        values.push(original);
      }

      return values;
    }
  }

  /**
   * Creates a new successful Result with the return value
   * of the given factory function. If the function throws, a failed Result will
   * be returned with an error created by the provided errorHandler
   * @param factory
   * @param errorHandler
   */
  static try<TValue, TError = string>(
    factory: FunctionOfT<Some<TValue>>,
    errorHandler: FunctionOfTtoK<unknown, TError>
  ): Result<TValue, TError>;
  /**
   * Creates a new successful Result with a Unit value.
   * If the function throws, a failed Result will
   * be returned with an error created by the provided errorHandler
   * @param action
   * @param errorHandler
   */
  static try<TError = string>(
    action: Action,
    errorHandler: FunctionOfTtoK<unknown, TError>
  ): Result<Unit, TError>;
  /**
   * Creates a new successful Result with the return value
   * of the give function (or Unit if no value is returned).
   * If the function throws, a failed Result will
   * be returned with an error created by the provided errorHandler
   * @param actionOrFactory
   * @param errorHandler
   */
  static try<TValue = Unit, TError = string>(
    actionOrFactory: FunctionOfT<Some<TValue>> | Action,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): Result<TValue, TError> {
    try {
      const value = actionOrFactory();

      return isDefined(value)
        ? Result.success(value)
        : (Result.success<Unit, TError>(Unit.Instance) as Result<
            TValue,
            TError
          >);
    } catch (error: unknown) {
      return Result.failure(errorHandler(error));
    }
  }

  /**
   * True if the result operation succeeded
   */
  get isSuccess(): boolean {
    return isDefined(this.state.value);
  }

  /**
   * True if the result operation failed.
   */
  get isFailure(): boolean {
    return !this.isSuccess;
  }

  /**
   * The internal state of the Result
   */
  private state: ResultState<TValue, TError> = {
    value: undefined,
    error: undefined,
  };

  /**
   * Creates a new Result instance in a guaranteed valid state
   * @param {{ value?: TValue, error?: TError, isSuccess: boolean }} state the initial state of the Result
   * @throws {Error} if the provided initial state is invalid
   */
  protected constructor(state: {
    value: Some<TValue> | None;
    error: Some<TError> | None;
    isSuccess: boolean;
  }) {
    const { value, error, isSuccess } = state;

    if (isSome(value) && !isSuccess) {
      throw new Error('Value cannot be defined for failed ResultAll');
    } else if (isSome(error) && isSuccess) {
      throw new Error('Error cannot be defined for successful ResultAll');
    } else if (!isSome(value) && !isSome(error)) {
      throw new Error('Value or Error must be defined');
    }

    this.state.value = value ?? undefined;
    this.state.error = error ?? undefined;
  }

  /**
   * Gets the Result's inner value
   * @returns {TValue} the inner value if the result suceeded
   * @throws {Error} if the result failed
   */
  getValueOrThrow(): Some<TValue> {
    if (isDefined(this.state.value)) {
      return this.state.value;
    }

    throw Error('No value');
  }

  getValueOrDefault(defaultValue: Some<TValue>): Some<TValue>;
  getValueOrDefault(factory: FunctionOfT<Some<TValue>>): Some<TValue>;
  /**
   * Gets the Result's inner value
   * @param defaultOrValueFactory A value or value factory function
   * @returns {TValue} The Result's value or a default value if the Result failed
   */
  getValueOrDefault(
    defaultOrValueFactory: Some<TValue> | FunctionOfT<Some<TValue>>
  ): Some<TValue> {
    if (this.isSuccess) {
      return this.getValueOrThrow();
    }

    if (isFunction(defaultOrValueFactory)) {
      return defaultOrValueFactory();
    }

    return defaultOrValueFactory;
  }

  /**
   * Gets the Result's inner error
   * @returns {TError} the inner error if the operation failed
   * @throws {Error} if the result succeeded
   */
  getErrorOrThrow(): Some<TError> {
    if (isDefined(this.state.error)) {
      return this.state.error;
    }

    throw Error('No error');
  }

  /**
   * Gets the Result's inner error
   * @param defaultOrErrorFactory An error or error creator function
   * @returns {TError} The Result's error or a default error if the Result succeeded
   */
  getErrorOrDefault(error: Some<TError>): Some<TError>;
  getErrorOrDefault(errorFactory: FunctionOfT<Some<TError>>): Some<TError>;
  getErrorOrDefault(
    errorOrErrorFactory: Some<TError> | FunctionOfT<Some<TError>>
  ): Some<TError> {
    if (this.isFailure) {
      return this.getErrorOrThrow();
    }

    if (isFunction(errorOrErrorFactory)) {
      return errorOrErrorFactory();
    }

    return errorOrErrorFactory;
  }

  /**
   *
   * @param predicate
   * @param error
   */
  ensure(
    predicate: PredicateOfT<TValue>,
    error: Some<TError>
  ): Result<TValue, TError>;
  /**
   *
   * @param predicate
   * @param errorFactory
   */
  ensure(
    predicate: PredicateOfT<TValue>,
    errorFactory: FunctionOfTtoK<TValue, Some<TError>>
  ): Result<TValue, TError>;
  /**
   * Checks the value of a given predicate against the Result's inner value,
   * if the Result already succeeded
   * @param predicate check against the Result's inner value
   * @param errorOrErrorFactory either an error value or a function to create an error from the Result's inner value
   * @returns {Result} succeeded if the predicate is true, failed if not
   */
  ensure(
    predicate: PredicateOfT<TValue>,
    errorOrErrorFactory: Some<TError> | FunctionOfTtoK<TValue, Some<TError>>
  ): Result<TValue, TError> {
    if (this.isFailure) {
      return this;
    }

    const value = this.getValueOrThrow();

    if (predicate(value)) {
      return this;
    }

    return isFunction(errorOrErrorFactory)
      ? Result.failure(errorOrErrorFactory(value))
      : Result.failure(errorOrErrorFactory);
  }

  /**
   *
   * @param projection
   * @returns
   */
  check<TOtherValue>(
    projection: FunctionOfTtoK<TValue, Result<TOtherValue, TError>>
  ): Result<TValue, TError> {
    return this.bind(projection).map((_) => this.getValueOrThrow());
  }

  /**
   *
   * @param condition
   * @param projection
   */
  checkIf<TOtherValue>(
    condition: boolean,
    projection: FunctionOfTtoK<TValue, Result<TOtherValue, TError>>
  ): Result<TValue, TError>;
  /**
   *
   * @param predicate
   * @param projection
   */
  checkIf<TOtherValue>(
    predicate: PredicateOfT<TValue>,
    projection: FunctionOfTtoK<TValue, Result<TOtherValue, TError>>
  ): Result<TValue, TError>;
  /**
   *
   * @param conditionOrPredicate
   * @param projection
   * @returns
   */
  checkIf<TOtherValue>(
    conditionOrPredicate: boolean | PredicateOfT<TValue>,
    projection: FunctionOfTtoK<TValue, Result<TOtherValue, TError>>
  ): Result<TValue, TError> {
    if (this.isFailure) {
      return this;
    }

    const condition = isFunction(conditionOrPredicate)
      ? conditionOrPredicate(this.getValueOrThrow())
      : conditionOrPredicate;

    return condition ? this.check(projection) : this;
  }

  /**
   *
   * @param projection
   * @returns
   */
  map<TNewValue>(
    projection: FunctionOfTtoK<TValue, Some<TNewValue>>
  ): Result<TNewValue, TError> {
    return this.isSuccess
      ? Result.success(projection(this.getValueOrThrow()))
      : Result.failure(this.getErrorOrThrow());
  }

  /**
   *
   * @param projection
   * @returns
   */
  mapError<TNewError>(
    projection: FunctionOfTtoK<TError, Some<TNewError>>
  ): Result<TValue, TNewError> {
    return this.isFailure
      ? Result.failure(projection(this.getErrorOrThrow()))
      : Result.success(this.getValueOrThrow());
  }

  /**
   *
   * @param projection
   * @returns
   */
  mapAsync<TNewValue>(
    projection: FunctionOfTtoK<TValue, Promise<Some<TNewValue>>>
  ): ResultAsync<TNewValue, TError> {
    return this.isSuccess
      ? ResultAsync.from(projection(this.getValueOrThrow()))
      : ResultAsync.failure(this.getErrorOrThrow());
  }

  /**
   *
   * @param projection
   * @returns
   */
  bind<TNewValue>(
    projection: FunctionOfTtoK<TValue, Result<TNewValue, TError>>
  ): Result<TNewValue, TError> {
    return this.isSuccess
      ? projection(this.getValueOrThrow())
      : Result.failure(this.getErrorOrThrow());
  }

  /**
   *
   * @param projection
   */
  bindAsync<TNewValue>(
    projection: FunctionOfTtoK<TValue, Promise<Result<TNewValue, TError>>>
  ): ResultAsync<TNewValue, TError>;
  /**
   *
   * @param projection
   */
  bindAsync<TNewValue>(
    projection: FunctionOfTtoK<TValue, ResultAsync<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError>;
  /**
   *
   * @param projection
   * @returns
   */
  bindAsync<TNewValue>(
    projection:
      | FunctionOfTtoK<TValue, Promise<Result<TNewValue, TError>>>
      | FunctionOfTtoK<TValue, ResultAsync<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError> {
    if (this.isFailure) {
      return ResultAsync.failure(this.getErrorOrThrow());
    }

    const resultAsyncOrPromise = projection(this.getValueOrThrow());

    return isPromise(resultAsyncOrPromise)
      ? ResultAsync.from<TNewValue, TError>(resultAsyncOrPromise)
      : resultAsyncOrPromise;
  }

  /**
   *
   * @param action
   * @returns
   */
  tap(action: ActionOfT<TValue>): Result<TValue, TError> {
    if (this.isSuccess) {
      action(this.getValueOrThrow());
    }

    return this;
  }

  tapAsync<TOtherValue>(
    action: FunctionOfTtoK<TValue, ResultAsync<TOtherValue, TError>>
  ): ResultAsync<TValue, TError>;
  tapAsync(action: AsyncActionOfT<TValue>): ResultAsync<TValue, TError>;
  tapAsync<TOtherValue>(
    action:
      | FunctionOfTtoK<TValue, ResultAsync<TOtherValue, TError>>
      | AsyncActionOfT<TValue>
  ): ResultAsync<TValue, TError> {
    if (this.isFailure) {
      return ResultAsync.failure(this.getErrorOrThrow());
    }

    const value = this.getValueOrThrow();
    const result = action(value);

    return isPromise(result)
      ? ResultAsync.from(result.then(() => value))
      : ResultAsync.from(result.toPromise().then(() => value));
  }

  /**
   *
   * @param condition
   * @param action
   */
  tapIf(condition: boolean, action: ActionOfT<TValue>): Result<TValue, TError>;
  /**
   *
   * @param predicate
   * @param action
   */
  tapIf(
    predicate: PredicateOfT<TValue>,
    action: ActionOfT<TValue>
  ): Result<TValue, TError>;
  /**
   *
   * @param conditionOrPredicate
   * @param action
   * @returns
   */
  tapIf(
    conditionOrPredicate: boolean | PredicateOfT<TValue>,
    action: ActionOfT<TValue>
  ): Result<TValue, TError> {
    if (this.isFailure) {
      return this;
    }

    const value = this.getValueOrThrow();

    if (isFunction(conditionOrPredicate)) {
      conditionOrPredicate(value) && action(value);
    } else {
      conditionOrPredicate && action(value);
    }

    return this;
  }

  /**
   *
   * @param matcher
   */
  match<TNewValue>(
    matcher: ResultMatcher<TValue, TError, Some<TNewValue>>
  ): TNewValue;
  /**
   *
   * @param matcher
   */
  match(matcher: ResultMatcherNoReturn<TValue, TError>): Unit;
  /**
   *
   * @param matcher
   * @returns
   */
  match<TNewValue>(
    matcher:
      | ResultMatcher<TValue, TError, Some<TNewValue>>
      | ResultMatcherNoReturn<TValue, TError>
  ): TNewValue | Unit {
    if (this.isSuccess) {
      const successValue = matcher.success(this.getValueOrThrow());

      return isDefined(successValue) ? successValue : Unit.Instance;
    }

    if (this.isFailure) {
      const failureValue = matcher.failure(this.getErrorOrThrow());

      return isDefined(failureValue) ? failureValue : Unit.Instance;
    }

    return never();
  }

  /**
   *
   * @param projection
   * @returns
   */
  finally<TNewValue>(
    projection: FunctionOfTtoK<Result<TValue, TError>, Some<TNewValue>>
  ): Some<TNewValue> {
    return projection(this);
  }

  /**
   *
   * @param action
   * @returns
   */
  onFailure(action: ActionOfT<TError>): Result<TValue, TError> {
    if (this.isFailure) {
      action(this.getErrorOrThrow());
    }

    return this;
  }

  /**
   *
   * @returns
   */
  convertFailure<TNewValue>(): Result<TNewValue, TError> {
    if (this.isSuccess) {
      throw new Error('Cannot convert a failure for a successful Result');
    }

    return Result.failure(this.getErrorOrThrow());
  }

  /**
   *
   * @param action
   * @param errorCreator
   * @returns
   */
  onSuccessTry(
    action: Action,
    errorCreator: FunctionOfTtoK<unknown, Some<TError>>
  ): Result<TValue, TError>;
  /**
   *
   * @param action
   * @param errorCreator
   */
  onSuccessTry(
    action: ActionOfT<TValue>,
    errorCreator: FunctionOfTtoK<unknown, Some<TError>>
  ): Result<TValue, TError>;
  /**
   *
   * @param action
   * @param errorCreator
   * @returns
   */
  onSuccessTry(
    action: Action | ActionOfT<TValue>,
    errorCreator: FunctionOfTtoK<unknown, Some<TError>>
  ): Result<TValue, TError> {
    if (this.isFailure) {
      return this;
    }

    const value = this.getValueOrThrow();

    try {
      action(value);

      return Result.success(value);
    } catch (error: unknown) {
      return Result.failure(errorCreator(error));
    }
  }

  /**
   *
   * @param asyncAction
   * @param errorHander
   * @returns
   */
  onSuccessTryAsync(
    asyncAction:
      | FunctionOfT<Promise<void>>
      | FunctionOfTtoK<TValue, Promise<void>>,
    errorHander: FunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<TValue, TError> {
    if (this.isFailure) {
      return ResultAsync.failure(this.getErrorOrThrow());
    }

    const result = async () => {
      const value = this.getValueOrThrow();

      try {
        await asyncAction(value);

        return Result.success<TValue, TError>(value);
      } catch (error: unknown) {
        return Result.failure<TValue, TError>(errorHander(error));
      }
    };

    return ResultAsync.from<TValue, TError>(result());
  }

  onSuccessTryMap<TNewValue>(
    projection: FunctionOfTtoK<TValue, Some<TNewValue>>,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): Result<TNewValue, TError>;
  onSuccessTryMap<TNewValue>(
    projection: FunctionOfT<Some<TNewValue>>,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): Result<TNewValue, TError>;
  onSuccessTryMap<TNewValue>(
    selector:
      | FunctionOfT<Some<TNewValue>>
      | FunctionOfTtoK<TValue, Some<TNewValue>>,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): Result<TNewValue, TError> {
    if (this.isFailure) {
      return Result.failure(this.getErrorOrThrow());
    }

    try {
      const value = selector(this.getValueOrThrow());

      return Result.success(value);
    } catch (error: unknown) {
      return Result.failure(errorHandler(error));
    }
  }

  toString(): string {
    return this.isSuccess ? 'Result.success' : 'Result.failure';
  }

  debug(): string {
    return this.isFailure
      ? `{ Result error: [${this.getErrorOrThrow()}] }`
      : `{ Result value: [${this.getValueOrThrow()}] }`;
  }

  equals(result: Result<TValue, TError>): boolean {
    return (
      (this.isSuccess &&
        result.isSuccess &&
        this.getValueOrThrow() === result.getValueOrThrow()) ||
      (this.isFailure &&
        result.isFailure &&
        this.getErrorOrThrow() === result.getErrorOrThrow())
    );
  }
}

type ResultState<TValue, TError> = {
  value: Some<TValue> | undefined;
  error: Some<TError> | undefined;
};
