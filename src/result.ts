import { Predicate } from '.';
import { ResultAsync } from './resultAsync';
import { Unit } from './unit';
import {
  Action,
  ActionOfT,
  FunctionOfT,
  FunctionOfTtoK,
  isDefined,
  isFunction,
  never,
  PredicateOfT,
  ResultMatcher,
  ResultMatcherNoReturn,
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
    value: TValue
  ): Result<TValue, TError>;
  /**
   * Creates a new successful Result with the given value
   * @param value the result of the successful operation
   * @returns new successful Result
   */
  static success<TValue, TError = string>(
    value?: never | TValue
  ): Result<TValue, TError> {
    return isDefined(value)
      ? new Result({ value, isSuccess: true })
      : (new Result<Unit, TError>({
          value: Unit.Instance,
          isSuccess: true,
        }) as Result<TValue, TError>);
  }

  static successIf<TValue = Unit, TError = string>(
    condition: boolean,
    state: { value: TValue; error: TError }
  ): Result<TValue, TError>;
  static successIf<TValue = Unit, TError = string>(
    predicate: Predicate,
    state: { value: TValue; error: TError }
  ): Result<TValue, TError>;
  static successIf<TValue = Unit, TError = string>(
    conditionOrPredicate: boolean | Predicate,
    state: { value: TValue; error: TError }
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
    error: TError
  ): Result<TValue, TError> {
    return new Result({ error, isSuccess: false });
  }

  static failureIf<TValue = Unit, TError = string>(
    condition: boolean,
    state: { value: TValue; error: TError }
  ): Result<TValue, TError>;
  static failureIf<TValue = Unit, TError = string>(
    predicate: Predicate,
    state: { value: TValue; error: TError }
  ): Result<TValue, TError>;
  static failureIf<TValue = Unit, TError = string>(
    conditionOrPredicate: boolean | Predicate,
    state: { value: TValue; error: TError }
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
   * @param selector
   */
  static choose<TValue, TNewValue, TError>(
    results: Result<TValue, TError>[],
    selector: FunctionOfTtoK<TValue, TNewValue>
  ): TNewValue[];
  /**
   * Returns only the values of successful Results. If a selector function
   * is provided, it will be used to map the values to new ones before they
   * are returned
   * @param results
   * @param selector
   * @returns
   */
  static choose<TValue, TNewValue, TError>(
    results: Result<TValue, TError>[],
    selector?: FunctionOfTtoK<TValue, TNewValue>
  ): TValue[] | TNewValue[] {
    if (typeof selector === 'function') {
      const values: TNewValue[] = [];

      for (const r of results) {
        if (r.isFailure) {
          continue;
        }

        const original = r.getValueOrThrow();

        values.push(selector(original));
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
   * of the given function. If the function throws, a failed Result will
   * be returned with an error created by the provided errorHandler
   * @param selector
   * @param errorHandler
   */
  static try<TValue, TError = string>(
    selector: FunctionOfT<TValue>,
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
   * @param actionOrSelector
   * @param errorHandler
   */
  static try<TValue = Unit, TError = string>(
    actionOrSelector: FunctionOfT<TValue> | Action,
    errorHandler: FunctionOfTtoK<unknown, TError>
  ): Result<TValue, TError> {
    try {
      const value = actionOrSelector();

      return Result.success(value!);
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
    value?: TValue;
    error?: TError;
    isSuccess: boolean;
  }) {
    const { value, error, isSuccess } = state;

    if (isDefined(value) && !isSuccess) {
      throw new Error('Value cannot be defined for failed ResultAll');
    } else if (isDefined(error) && isSuccess) {
      throw new Error('Error cannot be defined for successful ResultAll');
    } else if (!isDefined(value) && !isDefined(error)) {
      throw new Error('Value or Error must be defined');
    }

    this.state.value = value;
    this.state.error = error;
  }

  /**
   * Gets the Result's inner value
   * @returns {TValue} the inner value if the result suceeded
   * @throws {Error} if the result failed
   */
  getValueOrThrow(): TValue {
    if (isDefined(this.state.value)) {
      return this.state.value;
    }

    throw Error('No value');
  }

  getValueOrDefault(defaultValue: TValue): TValue;
  getValueOrDefault(creator: FunctionOfT<TValue>): TValue;
  /**
   * Gets the Result's inner value
   * @param defaultOrValueCreator A value or value creator function
   * @returns {TValue} The Result's value or a default value if the Result failed
   */
  getValueOrDefault(
    defaultOrValueCreator: TValue | FunctionOfT<TValue>
  ): TValue {
    if (this.isSuccess) {
      return this.getValueOrThrow();
    }

    if (isFunction(defaultOrValueCreator)) {
      return defaultOrValueCreator();
    }

    return defaultOrValueCreator;
  }

  /**
   * Get's the Result's inner error
   * @returns {TError} the inner error if the operation failed
   * @throws {Error} if the result succeeded
   */
  getErrorOrThrow(): TError {
    if (isDefined(this.state.error)) {
      return this.state.error;
    }

    throw Error('No error');
  }

  /**
   * Gets the Result's inner error
   * @param defaultOrErrorCreator An error or error creator function
   * @returns {TError} The Result's error or a default error if the Result succeeded
   */
  getErrorOrDefault(
    defaultOrErrorCreator: TError | FunctionOfT<TError>
  ): TError {
    if (this.isFailure) {
      return this.getErrorOrThrow();
    }

    if (isFunction(defaultOrErrorCreator)) {
      return defaultOrErrorCreator();
    }

    return defaultOrErrorCreator;
  }

  ensure(
    predicate: PredicateOfT<TValue>,
    error: TError
  ): Result<TValue, TError>;
  ensure(
    predicate: PredicateOfT<TValue>,
    errorCreator: FunctionOfTtoK<TValue, TError>
  ): Result<TValue, TError>;
  /**
   * Checks the value of a given predicate against the Result's inner value,
   * if the Result already succeeded
   * @param predicate check against the Result's inner value
   * @param errorOrErrorCreator either an error value or a function to create an error from the Result's inner value
   * @returns {Result} succeeded if the predicate is true, failed if not
   */
  ensure(
    predicate: PredicateOfT<TValue>,
    errorOrErrorCreator: TError | FunctionOfTtoK<TValue, TError>
  ): Result<TValue, TError> {
    if (this.isFailure) {
      return this;
    }

    const value = this.getValueOrThrow();

    if (predicate(value)) {
      return this;
    }

    return isFunction(errorOrErrorCreator)
      ? Result.failure(errorOrErrorCreator(value))
      : Result.failure(errorOrErrorCreator);
  }

  check<TOtherValue>(
    selector: FunctionOfTtoK<TValue, Result<TOtherValue, TError>>
  ): Result<TValue, TError> {
    return this.bind(selector).map((_) => this.getValueOrThrow()!);
  }

  checkIf<TOtherValue>(
    conditionOrPredicate: boolean | PredicateOfT<TValue>,
    selector: FunctionOfTtoK<TValue, Result<TOtherValue, TError>>
  ): Result<TValue, TError> {
    if (this.isFailure) {
      return this;
    }

    const condition = isFunction(conditionOrPredicate)
      ? conditionOrPredicate(this.getValueOrThrow())
      : conditionOrPredicate;

    return condition ? this.check(selector) : this;
  }

  map<TNewValue>(
    selector: FunctionOfTtoK<TValue, TNewValue>
  ): Result<TNewValue, TError> {
    return this.isSuccess
      ? Result.success(selector(this.getValueOrThrow()))
      : Result.failure(this.getErrorOrThrow());
  }

  mapError<TNewError>(
    selector: FunctionOfTtoK<TError, TNewError>
  ): Result<TValue, TNewError> {
    return this.isFailure
      ? Result.failure(selector(this.getErrorOrThrow()))
      : Result.success(this.getValueOrThrow());
  }

  mapAsync<TNewValue>(
    selector: FunctionOfTtoK<TValue, Promise<TNewValue>>
  ): ResultAsync<TNewValue, TError> {
    return this.isSuccess
      ? ResultAsync.from(selector(this.getValueOrThrow()))
      : ResultAsync.failure(this.getErrorOrThrow());
  }

  bind<TNewValue>(
    selector: FunctionOfTtoK<TValue, Result<TNewValue, TError>>
  ): Result<TNewValue, TError> {
    return this.isSuccess
      ? selector(this.getValueOrThrow())
      : Result.failure(this.getErrorOrThrow());
  }

  bindAsync<TNewValue>(
    selector: FunctionOfTtoK<TValue, ResultAsync<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError> {
    return this.isSuccess
      ? selector(this.getValueOrThrow())
      : ResultAsync.failure(this.getErrorOrThrow());
  }

  tap(action: ActionOfT<TValue>): Result<TValue, TError> {
    if (this.isSuccess) {
      action(this.getValueOrThrow());
    }

    return this;
  }

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

  match<TNewValue>(
    matcher:
      | ResultMatcher<TValue, TError, TNewValue>
      | ResultMatcherNoReturn<TValue, TError>
  ): TNewValue | void {
    if (this.isSuccess) {
      return matcher.success(this.getValueOrThrow());
    }
    if (this.isFailure) {
      return matcher.failure(this.getErrorOrThrow());
    }

    return never();
  }

  finally<TNewValue>(
    selector: FunctionOfTtoK<Result<TValue, TError>, TNewValue>
  ): TNewValue {
    return selector(this);
  }

  onFailure(action: ActionOfT<TError>): Result<TValue, TError> {
    if (this.isFailure) {
      action(this.getErrorOrThrow());
    }

    return this;
  }

  convertFailure<TNewValue>(): Result<TNewValue, TError> {
    if (this.isSuccess) {
      throw new Error('Cannot convert a failure for a successful Result');
    }

    return Result.failure(this.getErrorOrThrow());
  }

  onSuccessTry(
    action: Action | ActionOfT<TValue>,
    errorHandler: FunctionOfTtoK<unknown, TError>
  ): Result<TValue, TError> {
    if (this.isFailure) {
      return this;
    }

    const value = this.getValueOrThrow();

    try {
      action(value);

      return Result.success(value);
    } catch (error: unknown) {
      return Result.failure(errorHandler(error));
    }
  }

  onSuccessTryAsync(
    action: FunctionOfTtoK<TValue, Promise<void>>,
    errorHander: FunctionOfTtoK<unknown, TError>
  ): ResultAsync<TValue, TError> {
    if (this.isFailure) {
      return ResultAsync.failure(this.getErrorOrThrow());
    }

    const value = this.getValueOrThrow();

    const result = async () => {
      try {
        await action(value);

        return Result.success<TValue, TError>(value);
      } catch (error: unknown) {
        return Result.failure<TValue, TError>(errorHander(error));
      }
    };

    return ResultAsync.from<TValue, TError>(result());
  }

  onSuccessTryMap<TNewValue>(
    selector: FunctionOfT<TNewValue>,
    errorHandler: FunctionOfTtoK<unknown, TError>
  ): Result<TNewValue, TError>;
  onSuccessTryMap<TNewValue>(
    selector: FunctionOfT<TNewValue> | FunctionOfTtoK<TValue, TNewValue>,
    errorHandler: FunctionOfTtoK<unknown, TError>
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
}

type ResultState<TValue, TError> = {
  value?: TValue;
  error?: TError;
};
