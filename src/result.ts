import { ResultAsync } from './resultAsync.js';
import { Unit } from './unit.js';
import {
  Action,
  ActionOfT,
  AsyncAction,
  AsyncActionOfT,
  ErrorHandler,
  FunctionOfT,
  FunctionOfTtoK,
  isDefined,
  isFunction,
  isPromise,
  isSome,
  never,
  None,
  pipeFromArray,
  Predicate,
  PredicateOfT,
  ResultMatcher,
  ResultMatcherNoReturn,
  Some,
} from './utilities.js';

/**
 * Allows to extract the Value of the given Result-Type
 * e.g. ResultValueOf<Result<string>> => string
 */
export type ResultValueOf<T> = T extends Result<infer TResultValue>
  ? TResultValue
  : unknown;

/**
 * Represents a successful Result operation.
 */
type ResultSuccess<TValue> = Result<TValue> & {
  value: TValue;
};

/**
 * Represents a failed Result operation.
 */
type ResultFailure<TValue, TError> = Result<TValue> & {
  error: TError;
};

/**
 * Represents a successful or failed operation
 */
export class Result<TValue = Unit, TError = string> {
  /**
   * Combines several results (and any error messages) into a single result.
   * The returned result will be a failure if any of the input results are failures.
   *
   * @param results The Results to be combined.
   * @returns A Result that is a success when all the input results are also successes.
   */
  static combine<T extends Record<string, Result<unknown>>>(
    results: T
  ): Result<{ [K in keyof T]: ResultValueOf<T[K]> }> {
    const resultEntries = Object.entries(results);

    const failedResults = resultEntries.filter(
      ([, result]) => result.isFailure
    );
    const succeededResults = resultEntries.filter(
      ([, result]) => result.isSuccess
    );

    if (failedResults.length === 0) {
      const values = succeededResults.reduce((resultValues, [key, result]) => {
        resultValues[key] = result.getValueOrThrow();
        return resultValues;
      }, {} as { [key: string]: unknown });

      return Result.success(
        values as Some<{ [K in keyof T]: ResultValueOf<T[K]> }>
      );
    }

    const errorMessages = failedResults
      .map(([, result]) => result.getErrorOrThrow())
      .join(', ');

    return Result.failure(errorMessages);
  }

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
    errorHandler: ErrorHandler<TError>
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
    errorHandler: ErrorHandler<TError>
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
    errorHandler: ErrorHandler<TError>
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
   * Yields value if the result operation succeeded.
   * Hint: Use hasValue() upfront to be sure that result operation succeeded.
   */
  protected get value() {
    return this.state.value;
  }

  /**
   * Yields error if the result operation failed.
   * Hint: Use hasError() upfront to be sure that result operation failed.
   */
  protected get error() {
    return this.state.error;
  }

  /**
   * Checks if result operation succeeded.
   */
  hasValue(): this is ResultSuccess<TValue> {
    return this.isSuccess;
  }

  /**
   * Checks if result operation failed.
   */
  hasError(): this is ResultFailure<TValue, TError> {
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
      throw new Error('Value cannot be defined for failed Result');
    } else if (isSome(error) && isSuccess) {
      throw new Error('Error cannot be defined for successful Result');
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

  /**
   * Returns the Result's value if it is successful and the default otherwise
   * @param defaultValue a value to return if the Result is failed
   */
  getValueOrDefault(defaultValue: Some<TValue>): Some<TValue>;
  /**
   * Returns the Result's value if it is successful and the evaluation of the factory function otherwise
   * @param factory a function which is executed and returned if the Result is failed
   */
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
   * If the Result has failed, the result is returned.
   * Otherwise, it executes the predicate and returns a failed Result with the given error
   * if the predicate returns false, and the current Result if it returns true
   * @param predicate check against the Result's inner value
   * @param error An error for the returned Result if the predicate returns false
   */
  ensure(
    predicate: PredicateOfT<TValue>,
    error: Some<TError>
  ): Result<TValue, TError>;
  /**
   * If the Result has failed, the result is returned.
   * Otherwise, it executes the predicate and returns a failed Result with an error created from the errorFactory
   * if the predicate returns false, and the current Result if it returns true
   * @param predicate check against the Result's inner value
   * @param errorFactory A function provided the Result's value, used to create an error for the returned Result if the predicate returns false
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
   * Returns a successful Result with the current value if the projection returns a successful Result
   * @param projection a function given the current Result's value and returns a new Result
   * @returns If the Result has failed, it is returned. Otherwise, the projection is executed.
   * If the projection returns a successful Result, a successful Result with the original value is returned.
   * If the projection returns a failed Result it is returned.
   */
  check<TOtherValue>(
    projection: FunctionOfTtoK<TValue, Result<TOtherValue, TError>>
  ): Result<TValue, TError> {
    return this.bind(projection).map((_) => this.getValueOrThrow());
  }

  /**
   * Similar to check, but the projection is only executed if the Result has succeeded and the condition is true
   * @param condition
   * @param projection
   */
  checkIf<TOtherValue>(
    condition: boolean,
    projection: FunctionOfTtoK<TValue, Result<TOtherValue, TError>>
  ): Result<TValue, TError>;
  /**
   * Similiar to check, but the projection is only executed if the Result has succeeded and the predicate returns true
   * @param predicate
   * @param projection
   */
  checkIf<TOtherValue>(
    predicate: PredicateOfT<TValue>,
    projection: FunctionOfTtoK<TValue, Result<TOtherValue, TError>>
  ): Result<TValue, TError>;
  /**
   * Similiar to check, but the projection is only executed if the Result has succeeded and the condition or predicate evaluates to true
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

  pipe(): Result<TValue, TError>;

  pipe<A, AE>(op1: ResultOpFnAsync<TValue, TError, A, AE>): ResultAsync<A, AE>;
  pipe<A, AE>(op1: ResultOpFn<TValue, TError, A, AE>): Result<A, AE>;

  pipe<A, AE, B, BE>(
    op1: ResultOpFn<TValue, TError, A, AE>,
    op2: ResultOpFnAsync<A, AE, B, BE>
  ): ResultAsync<B, BE>;
  pipe<A, AE, B, BE>(
    op1: ResultOpFn<TValue, TError, A, AE>,
    op2: ResultOpFn<A, AE, B, BE>
  ): Result<B, BE>;

  pipe<A, AE, B, BE, C, CE>(
    op1: ResultOpFn<TValue, TError, A, AE>,
    op2: ResultOpFn<A, AE, B, BE>,
    op3: ResultOpFnAsync<B, BE, C, CE>
  ): ResultAsync<C, CE>;
  pipe<A, AE, B, BE, C, CE>(
    op1: ResultOpFn<TValue, TError, A, AE>,
    op2: ResultOpFn<A, AE, B, BE>,
    op3: ResultOpFn<B, BE, C, CE>
  ): Result<C, CE>;

  pipe<A, AE, B, BE, C, CE, D, DE>(
    op1: ResultOpFn<TValue, TError, A, AE>,
    op2: ResultOpFn<A, AE, B, BE>,
    op3: ResultOpFn<B, BE, C, CE>,
    op4: ResultOpFnAsync<C, CE, D, DE>
  ): ResultAsync<D, DE>;
  pipe<A, AE, B, BE, C, CE, D, DE>(
    op1: ResultOpFn<TValue, TError, A, AE>,
    op2: ResultOpFn<A, AE, B, BE>,
    op3: ResultOpFn<B, BE, C, CE>,
    op4: ResultOpFn<C, CE, D, DE>
  ): Result<D, DE>;

  pipe<A, AE, B, BE, C, CE, D, DE, E, EE>(
    op1: ResultOpFn<TValue, TError, A, AE>,
    op2: ResultOpFn<A, AE, B, BE>,
    op3: ResultOpFn<B, BE, C, CE>,
    op4: ResultOpFn<C, CE, D, DE>,
    op5: ResultOpFnAsync<D, DE, E, EE>
  ): ResultAsync<E, EE>;
  pipe<A, AE, B, BE, C, CE, D, DE, E, EE>(
    op1: ResultOpFn<TValue, TError, A, AE>,
    op2: ResultOpFn<A, AE, B, BE>,
    op3: ResultOpFn<B, BE, C, CE>,
    op4: ResultOpFn<C, CE, D, DE>,
    op5: ResultOpFn<D, DE, E, EE>
  ): Result<E, EE>;

  pipe<A, AE, B, BE, C, CE, D, DE, E, EE, F, FE>(
    op1: ResultOpFn<TValue, TError, A, AE>,
    op2: ResultOpFn<A, AE, B, BE>,
    op3: ResultOpFn<B, BE, C, CE>,
    op4: ResultOpFn<C, CE, D, DE>,
    op5: ResultOpFn<D, DE, E, EE>,
    op6: ResultOpFnAsync<E, EE, F, FE>
  ): ResultAsync<F, FE>;
  pipe<A, AE, B, BE, C, CE, D, DE, E, EE, F, FE>(
    op1: ResultOpFn<TValue, TError, A, AE>,
    op2: ResultOpFn<A, AE, B, BE>,
    op3: ResultOpFn<B, BE, C, CE>,
    op4: ResultOpFn<C, CE, D, DE>,
    op5: ResultOpFn<D, DE, E, EE>,
    op6: ResultOpFn<E, EE, F, FE>
  ): Result<F, FE>;

  pipe<A, AE, B, BE, C, CE, D, DE, E, EE, F, FE, G, GE>(
    op1: ResultOpFn<TValue, TError, A, AE>,
    op2: ResultOpFn<A, AE, B, BE>,
    op3: ResultOpFn<B, BE, C, CE>,
    op4: ResultOpFn<C, CE, D, DE>,
    op5: ResultOpFn<D, DE, E, EE>,
    op6: ResultOpFn<E, EE, F, FE>,
    op7: ResultOpFnAsync<F, FE, G, GE>
  ): ResultAsync<G, GE>;
  pipe<A, AE, B, BE, C, CE, D, DE, E, EE, F, FE, G, GE>(
    op1: ResultOpFn<TValue, TError, A, AE>,
    op2: ResultOpFn<A, AE, B, BE>,
    op3: ResultOpFn<B, BE, C, CE>,
    op4: ResultOpFn<C, CE, D, DE>,
    op5: ResultOpFn<D, DE, E, EE>,
    op6: ResultOpFn<E, EE, F, FE>,
    op7: ResultOpFn<F, FE, G, GE>
  ): Result<G, GE>;

  pipe<A, AE, B, BE, C, CE, D, DE, E, EE, F, FE, G, GE, H, HE>(
    op1: ResultOpFn<TValue, TError, A, AE>,
    op2: ResultOpFn<A, AE, B, BE>,
    op3: ResultOpFn<B, BE, C, CE>,
    op4: ResultOpFn<C, CE, D, DE>,
    op5: ResultOpFn<D, DE, E, EE>,
    op6: ResultOpFn<E, EE, F, FE>,
    op7: ResultOpFn<F, FE, G, GE>,
    op8: ResultOpFnAsync<G, GE, H, HE>
  ): ResultAsync<H, HE>;
  pipe<A, AE, B, BE, C, CE, D, DE, E, EE, F, FE, G, GE, H, HE>(
    op1: ResultOpFn<TValue, TError, A, AE>,
    op2: ResultOpFn<A, AE, B, BE>,
    op3: ResultOpFn<B, BE, C, CE>,
    op4: ResultOpFn<C, CE, D, DE>,
    op5: ResultOpFn<D, DE, E, EE>,
    op6: ResultOpFn<E, EE, F, FE>,
    op7: ResultOpFn<F, FE, G, GE>,
    op8: ResultOpFn<G, FE, H, HE>
  ): Result<H, HE>;
  /**
   * Executes the given operator functions, creating a custom pipeline
   * @param operations Result operation functions
   * @returns
   */
  pipe(
    ...operations: FunctionOfTtoK<any, any>[]
  ): Result<any, any> | ResultAsync<any, any> {
    return pipeFromArray(operations)(this);
  }

  /**
   * Maps the value successful Result to a new value
   * @param projection a function given the value of the current Result which returns a new value
   * @returns If the Result has failed, a new one with the same error is returned.
   * Otherwise a new successful Result is returned with the value of the projection.
   */
  map<TNewValue>(
    projection: FunctionOfTtoK<TValue, Some<TNewValue>>
  ): Result<TNewValue, TError> {
    return this.isSuccess
      ? Result.success(projection(this.getValueOrThrow()))
      : Result.failure(this.getErrorOrThrow());
  }

  /**
   * Maps the error of a  failed Result to a new error
   * @param projection a function given the error of the current Result which returns a new error
   * @returns If the Result has succeeded, a new one with the same value is returned.
   * Otherwise a new failed Result is returned with the error created by the projection.
   */
  mapError<TNewError>(
    projection: FunctionOfTtoK<TError, Some<TNewError>>
  ): Result<TValue, TNewError> {
    return this.isFailure
      ? Result.failure(projection(this.getErrorOrThrow()))
      : Result.success(this.getValueOrThrow());
  }

  /**
   * Converts a failed Result into a successful one
   * @param projection a function that maps the error of the current Result to a value
   * @returns A successful Result using the current Result's value if it succeeded and the projection's value if it failed
   */
  mapFailure(
    projection: FunctionOfTtoK<TError, Some<TValue>>
  ): Result<TValue, TError> {
    return this.isSuccess
      ? this
      : Result.success(projection(this.getErrorOrThrow()));
  }

  /**
   * Maps the value successful Result to a new async value wrapped in a ResultAsync
   * @param projection a function given the value of the current Result which returns a Promise of some value
   
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
   * Maps the error of a failed Result to a new async value wrapped in a ResultAsync
   * @param projection a function given the error of the current Result which returns a Promise of some value
   
   * @returns
   */
  mapFailureAsync(
    projection: FunctionOfTtoK<TError, Promise<Some<TValue>>>
  ): ResultAsync<TValue, TError> {
    return this.isSuccess
      ? ResultAsync.from(this)
      : ResultAsync.from(projection(this.getErrorOrThrow()));
  }

  /**
   * Maps a successful Result to a new Result
   * @param projection a function given the value of the current Result which returns a new Result of some value
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
   * Maps a successful Result to a new ResultAsync
   * @param projection
   
   */
  bindAsync<TNewValue>(
    projection: FunctionOfTtoK<TValue, Promise<Result<TNewValue, TError>>>
  ): ResultAsync<TNewValue, TError>;
  /**
   * Maps a successful Result to a new ResultAsync
   * @param projection
   */
  bindAsync<TNewValue>(
    projection: FunctionOfTtoK<TValue, ResultAsync<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError>;
  /**
   * Maps a successful Result to a new ResultAsync
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
   * Maps a failed Result to a new Result
   * @param projection
   * @returns
   */
  bindFailure(
    projection: FunctionOfT<Result<TValue, TError>>
  ): Result<TValue, TError> {
    return this.isSuccess ? this : projection();
  }

  /**
   * Maps a failed Result to a new ResultAsync
   * @param projection
   * @returns
   */
  bindFailureAsync(
    projection:
      | FunctionOfT<Promise<Result<TValue, TError>>>
      | FunctionOfT<ResultAsync<TValue, TError>>
  ): ResultAsync<TValue, TError> {
    if (this.isSuccess) {
      return ResultAsync.success(this.getValueOrThrow());
    }

    const resultAsyncOrPromise = projection();

    return isPromise(resultAsyncOrPromise)
      ? ResultAsync.from<TValue, TError>(resultAsyncOrPromise)
      : resultAsyncOrPromise;
  }

  /**
   * Executes an action if the current Result has succeeded
   * @param action a function given the value of the current Result
   * @returns the current Result
   */
  tap(action: ActionOfT<TValue>): Result<TValue, TError> {
    if (this.isSuccess) {
      action(this.getValueOrThrow());
    }

    return this;
  }

  /**
   * Executes an action if the current Result has failed
   * @param action a function given the error of the current Result
   * @returns the current Result
   */
  tapFailure(action: ActionOfT<TError>): Result<TValue, TError> {
    if (this.isFailure) {
      action(this.getErrorOrThrow());
    }

    return this;
  }

  /**
   * Executes an async action if the Result succeeded
   * @param action a function given the Result's value returns a Promise
   
   * @returns a ResultAsync
   */
  tapAsync(action: AsyncActionOfT<TValue>): ResultAsync<TValue, TError> {
    if (this.isFailure) {
      return ResultAsync.failure(this.getErrorOrThrow());
    }

    const value = this.getValueOrThrow();

    return ResultAsync.from(action(value).then<Some<TValue>>(() => value));
  }

  /**
   * Executes an action if the given condition is true and the Result has succeeded
   * @param condition a boolean value
   * @param action a function given the Result's value
   * @returns the current Result
   */
  tapIf(condition: boolean, action: ActionOfT<TValue>): Result<TValue, TError>;
  /**
   * Executes and action if the given predicate evaluates to true and the Result has succeeded
   * @param predicate a function given the Result's value and returns a boolean
   * @param action a function given the Result's value
   * @returns the current Result
   */
  tapIf(
    predicate: PredicateOfT<TValue>,
    action: ActionOfT<TValue>
  ): Result<TValue, TError>;
  /**
   * Executes and action if the given condition evaluates to true and the Result has succeeded
   * @param conditionOrPredicate a boolean value or predicate
   * @param action a function given the Result's value
   * @returns the current Result
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
   * Executes the action on both success and failure.
   * @param action a function with no parameters returning no value
   * @returns the current Result
   */
  tapEither(action: Action): Result<TValue, TError> {
    action();

    return this;
  }

  /**
   * Executes the asynchronous action on both success and failure.
   * @param action a function
   * @returns the current Result wrapped in a ResultAsync
   */
  tapEitherAsync(action: AsyncAction): ResultAsync<TValue, TError> {
    return ResultAsync.from<TValue, TError>(action().then(() => this));
  }

  /**
   * Maps a successful Result's value to a new value,
   * or a failed Result's error to a new value
   * @param matcher
   */
  match<TNewValue>(
    matcher: ResultMatcher<TValue, TError, TNewValue>
  ): TNewValue;
  /**
   * Executes an action for a Result in either the successful and failed state
   * @param matcher
   */
  match(matcher: ResultMatcherNoReturn<TValue, TError>): Unit;
  /**
   * Executes functions for a Result in either the successful and failed state
   * @param matcher
   * @returns
   */
  match<TNewValue>(
    matcher:
      | ResultMatcher<TValue, TError, TNewValue>
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
   * Executes the same function for both failed and successful Results
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
   * @param errorHandler
   * @returns
   */
  onSuccessTry(
    action: ActionOfT<TValue>,
    errorHandler: ErrorHandler<TError>
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

  /**
   *
   * @param asyncAction
   * @param errorHander
   * @returns
   */
  onSuccessTryAsync(
    asyncAction: FunctionOfTtoK<TValue, Promise<void>>,
    errorHander: ErrorHandler<TError>
  ): ResultAsync<TValue, TError> {
    if (this.isFailure) {
      return ResultAsync.failure(this.getErrorOrThrow());
    }

    const promiseFactory = async () => {
      const value = this.getValueOrThrow();

      try {
        await asyncAction(value);

        return Result.success<TValue, TError>(value);
      } catch (error: unknown) {
        return Result.failure<TValue, TError>(errorHander(error));
      }
    };

    return ResultAsync.from<TValue, TError>(promiseFactory());
  }

  /**
   * Returns a string representation of the Result state (success/failure)
   * @returns
   */
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

export type ResultOpFn<A, AE, B, BE> = FunctionOfTtoK<
  Result<A, AE>,
  Result<B, BE>
>;
export type ResultOpFnAsync<A, AE, B, BE> = FunctionOfTtoK<
  Result<A, AE>,
  ResultAsync<B, BE>
>;
