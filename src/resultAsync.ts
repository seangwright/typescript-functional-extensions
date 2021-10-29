import { Result } from './result';
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
  PredicateOfT,
  ResultMatcher,
  ResultMatcherNoReturn,
  Some,
} from './utilities';

/**
 * Represents and asynchronous Result that could succeed with a value or fail with an error
 */
export class ResultAsync<TValue = Unit, TError = string> {
  /**
   * Creates a new ResultAsync from the given Result
   * @param value a successful or failed Result
   * @returns
   */
  static from<TValue, TError>(
    value: Result<TValue, TError>
  ): ResultAsync<TValue, TError>;
  /**
   * Creates a new ResultAsync from the given Promise
   * @param value a Promise returning a value which will be wrapped in a successful Result
   */
  static from<TValue, TError>(
    value: Promise<Some<TValue>>
  ): ResultAsync<TValue, TError>;
  /**
   * Creates a new ResultAsync from the given Promise
   * @param value a Promise returning a Result, if it resolves
   */
  static from<TValue, TError>(
    value: Promise<Result<TValue, TError>>
  ): ResultAsync<TValue, TError>;
  static from<TValue, TError>(
    value:
      | Promise<Some<TValue>>
      | Promise<Result<TValue, TError>>
      | Result<TValue, TError>
  ): ResultAsync<TValue, TError> {
    if (isPromise(value)) {
      return new ResultAsync(
        value.then((v) => (v instanceof Result ? v : Result.success(v)))
      );
    } else if (value instanceof Result) {
      return new ResultAsync(Promise.resolve(value));
    }

    throw new Error('Value must be a Promise or Result instance');
  }

  static try<TValue, TError = string>(
    func: FunctionOfT<Promise<Some<TValue>>>,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<TValue, TError>;
  static try<TError = string>(
    func: FunctionOfT<Promise<void>>,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<Unit, TError>;
  /**
   * Creates a new successful Result with the inner value
   * of the given Promise. If the Promise rejects, a failed Result will
   * be returned with an error created by the provided errorHandler
   * @param promise
   * @param errorHandler
   */
  static try<TValue, TError = string>(
    promise: Promise<Some<TValue>>,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<TValue, TError>;
  /**
   * Creates a new successful Result with a Unit value.
   * If the Promise rejects, a failed Result will
   * be returned with an error created by the provided errorHandler
   * @param promise
   * @param errorHandler
   */
  static try<TError = string>(
    promise: Promise<void>,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<Unit, TError>;
  /**
   * Creates a new successful Result with the inner value
   * of the given Promise (or Unit if no value).
   * If the Promise rejects, a failed Result will
   * be returned with an error created by the provided errorHandler
   * @param promiseOrFunction
   * @param errorHandler
   */
  static try<TValue = Unit, TError = string>(
    promiseOrFunction:
      | Promise<Some<TValue>>
      | Promise<void>
      | FunctionOfT<Promise<Some<TValue>>>
      | FunctionOfT<Promise<void>>,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<TValue, TError> {
    if (isPromise(promiseOrFunction)) {
      return new ResultAsync(
        promiseOrFunction
          .then((value) => Result.success<TValue, TError>(value!))
          .catch((error) => Result.failure(errorHandler(error)))
      );
    }

    try {
      return new ResultAsync(
        promiseOrFunction()
          .then((value) => Result.success<TValue, TError>(value!))
          .catch((error) => Result.failure(errorHandler(error)))
      );
    } catch (error: unknown) {
      return new ResultAsync(
        Promise.resolve(Result.failure(errorHandler(error)))
      );
    }
  }

  /**
   * Creates a new successful ResultAsync with a Unit value
   */
  static success<TError = string>(): ResultAsync<Unit, TError>;
  /**
   * Creates a new successful ResultAsync with the given value
   * @param value
   */
  static success<TValue, TError = string>(
    value: Some<TValue>
  ): ResultAsync<TValue, TError>;
  /**
   * Creates a new successful ResultAsync with the given value (or Unit if no value is provided)
   * @param value
   * @returns
   */
  static success<TValue, TError = string>(
    value?: Some<TValue>
  ): ResultAsync<TValue, TError> {
    const result = isDefined(value)
      ? Result.success<TValue, TError>(value)
      : (Result.success<Unit, TError>(Unit.Instance) as Result<TValue, TError>);

    return new ResultAsync(Promise.resolve(result));
  }

  /**
   * Creates a new failed ResultAsync with the given error
   * @param error
   * @returns
   */
  static failure<TValue = Unit, TError = string>(
    error: Some<TError>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(Promise.resolve(Result.failure(error)));
  }

  private value: Promise<Result<TValue, TError>>;

  protected constructor(value: Promise<Result<TValue, TError>>) {
    this.value = value.catch((error) => Result.failure(error));
  }

  /**
   * True if the Result was successful
   */
  get isSuccess(): Promise<boolean> {
    return this.value.then((r) => r.isSuccess);
  }

  /**
   * True if the Result failed
   */
  get isFailure(): Promise<boolean> {
    return this.value.then((r) => r.isFailure);
  }

  /**
   * Will return the inner value created from executing the Result
   * if it was successful, otherwise it will throw an Error
   * @returns the result of a successful Result
   */
  getValueOrThrow(): Promise<Some<TValue>> {
    return this.value.then((r) => r.getValueOrThrow());
  }

  /**
   *
   * @param defaultValue returned if the Result was not successful
   */
  getValueOrDefault(defaultValue: Some<TValue>): Promise<Some<TValue>>;
  /**
   *
   * @param valueFactory executed and returned if the Result was not successful
   */
  getValueOrDefault(
    valueFactory: FunctionOfT<Some<TValue>>
  ): Promise<Some<TValue>>;
  getValueOrDefault(
    defaultOrValueFactory: Some<TValue> | FunctionOfT<Some<TValue>>
  ): Promise<Some<TValue>> {
    return this.value.then((r) =>
      isFunction(defaultOrValueFactory)
        ? r.getValueOrDefault(defaultOrValueFactory)
        : r.getValueOrDefault(defaultOrValueFactory)
    );
  }

  /**
   * Will return the inner error value of the Result
   * if it failed, otherwise it will throw and Error
   * @returns the error ofa failed Result
   */
  getErrorOrThrow(): Promise<Some<TError>> {
    return this.value.then((r) => r.getErrorOrThrow());
  }

  /**
   *
   * @param defaultError returned if the Result was successful
   */
  getErrorOrDefault(defaultError: Some<TError>): Promise<Some<TError>>;
  /**
   *
   * @param errorCreator
   */
  getErrorOrDefault(
    errorCreator: FunctionOfT<Some<TError>>
  ): Promise<Some<TError>>;
  getErrorOrDefault(
    defaultOrErrorCreator: Some<TError> | FunctionOfT<Some<TError>>
  ): Promise<Some<TError>> {
    return this.value.then((r) => {
      if (isFunction(defaultOrErrorCreator)) {
        return r.getErrorOrDefault(defaultOrErrorCreator);
      }

      return r.getErrorOrDefault(defaultOrErrorCreator);
    });
  }

  /**
   * Checks the value of a given predicate against the Result's inner value,
   * if the Result already succeeded
   * @param predicate check against the Result's inner value
   * @param errorOrErrorCreator either an error value or a function to create an error from the Result's inner value
   * @returns {Result} succeeded if the predicate is true, failed if not
   */
  ensure(
    predicate: PredicateOfT<TValue>,
    errorOrErrorCreator: Some<TError> | FunctionOfTtoK<TValue, Some<TError>>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then((result) => {
        if (result.isFailure) {
          return result;
        }

        const value = result.getValueOrThrow();

        if (!predicate(value)) {
          return isFunction(errorOrErrorCreator)
            ? Result.failure(errorOrErrorCreator(value))
            : Result.failure(errorOrErrorCreator);
        }

        return result;
      })
    );
  }

  /**
   * Converts the inner value of a successful Result to a new value.
   * If the Result failed, no action is taken
   * @param projection function which accepts the current value as a parameter and returns a new value
   */
  map<TNewValue>(
    projection: FunctionOfTtoK<TValue, Some<TNewValue>>
  ): ResultAsync<TNewValue, TError>;
  /**
   * Converts the inner value of a successful Result to a new value.
   * @param projection function which accepts the current value as a parameter and returns a Promise containing
   * the new value
   */
  map<TNewValue>(
    projection: FunctionOfTtoK<TValue, Promise<Some<TNewValue>>>
  ): ResultAsync<TNewValue, TError>;
  map<TNewValue>(
    projection:
      | FunctionOfTtoK<TValue, Some<TNewValue>>
      | FunctionOfTtoK<TValue, Promise<Some<TNewValue>>>
  ): ResultAsync<TNewValue, TError> {
    return new ResultAsync(
      this.value.then((r) => {
        if (r.isFailure) {
          return Result.failure(r.getErrorOrThrow());
        }

        const promiseOrValue = projection(r.getValueOrThrow());

        if (isPromise(promiseOrValue)) {
          return promiseOrValue.then((v) => Result.success(v));
        }

        return Result.success(promiseOrValue);
      })
    );
  }

  mapError<TNewError>(
    projection: FunctionOfTtoK<TError, Some<TNewError>>
  ): ResultAsync<TValue, TNewError>;
  mapError<TNewError>(
    projection: FunctionOfTtoK<TError, Promise<Some<TNewError>>>
  ): ResultAsync<TValue, TNewError>;
  mapError<TNewError>(
    projection:
      | FunctionOfTtoK<TError, Some<TNewError>>
      | FunctionOfTtoK<TError, Promise<Some<TNewError>>>
  ): ResultAsync<TValue, TNewError> {
    return new ResultAsync(
      this.value.then((r) => {
        if (r.isSuccess) {
          return Result.success(r.getValueOrThrow());
        }

        const promiseOrError = projection(r.getErrorOrThrow());

        if (isPromise(promiseOrError)) {
          return promiseOrError.then((e) => Result.failure(e));
        }

        return Result.failure(promiseOrError);
      })
    );
  }

  bind<TNewValue>(
    projection: FunctionOfTtoK<TValue, Result<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError>;
  bind<TNewValue>(
    projection: FunctionOfTtoK<TValue, ResultAsync<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError>;
  bind<TNewValue>(
    projection:
      | FunctionOfTtoK<TValue, Result<TNewValue, TError>>
      | FunctionOfTtoK<TValue, ResultAsync<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError> {
    return new ResultAsync(
      this.value.then((r) => {
        if (r.isFailure) {
          return Result.failure(r.getErrorOrThrow());
        }

        const resultOrResultAsync = projection(r.getValueOrThrow());

        if (resultOrResultAsync instanceof Result) {
          return resultOrResultAsync;
        }

        return resultOrResultAsync.toPromise();
      })
    );
  }

  tap(action: ActionOfT<TValue>): ResultAsync<TValue, TError>;
  tap(
    asyncAction: FunctionOfTtoK<TValue, Promise<void>>
  ): ResultAsync<TValue, TError>;
  tap<TOtherValue>(
    asyncAction: FunctionOfTtoK<TValue, ResultAsync<TOtherValue, TError>>
  ): ResultAsync<TValue, TError>;
  tap<TOtherValue>(
    action:
      | ActionOfT<TValue>
      | FunctionOfTtoK<TValue, Promise<void>>
      | FunctionOfTtoK<TValue, ResultAsync<TOtherValue, TError>>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then(async (originalResult) => {
        if (originalResult.isFailure) {
          return originalResult;
        }

        const voidOrPromise = action(originalResult.getValueOrThrow());

        if (isPromise(voidOrPromise)) {
          await voidOrPromise;
        } else if (voidOrPromise instanceof ResultAsync) {
          const result = await voidOrPromise.toPromise();

          if (result.isFailure) {
            throw new Error(`${result.getErrorOrThrow()}`);
          }
        }

        return originalResult;
      })
    );
  }

  tapIf(
    conditionOrPredicate: boolean | PredicateOfT<TValue>,
    action: ActionOfT<TValue>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then((r) => {
        if (isFunction(conditionOrPredicate)) {
          return r.tapIf(conditionOrPredicate, action);
        }

        return r.tapIf(conditionOrPredicate, action);
      })
    );
  }

  match<TNewValue>(
    matcher: ResultMatcher<TValue, TError, TNewValue>
  ): Promise<Some<TNewValue>>;
  match(matcher: ResultMatcherNoReturn<TValue, TError>): Promise<Unit>;
  match<TNewValue>(
    matcher:
      | ResultMatcher<TValue, TError, TNewValue>
      | ResultMatcherNoReturn<TValue, TError>
  ): Promise<Some<TNewValue> | Unit> {
    return this.value.then((r) => r.match(matcher));
  }

  finally<TNewValue>(
    projection: FunctionOfTtoK<Result<TValue, TError>, Some<TNewValue>>
  ): Promise<Some<TNewValue>> {
    return this.value.then((r) => r.finally(projection));
  }

  onFailure(action: ActionOfT<TError>): ResultAsync<TValue, TError>;
  onFailure(action: AsyncActionOfT<TError>): ResultAsync<TValue, TError>;
  onFailure(
    action: ActionOfT<TError> | AsyncActionOfT<TError>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then(async (r) => {
        if (r.isSuccess) {
          return r;
        }

        const error = r.getErrorOrThrow();

        const result = action(error);

        if (isPromise(result)) {
          await result;
        }

        return Result.failure(error);
      })
    );
  }

  convertFailure<TNewValue>(): ResultAsync<TNewValue, TError> {
    return new ResultAsync(this.value.then((r) => r.convertFailure()));
  }

  onSuccessTry(
    action: Action,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<TValue, TError>;
  onSuccessTry(
    action: ActionOfT<TValue>,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<TValue, TError>;
  onSuccessTry(
    action: FunctionOfTtoK<TValue, Promise<void>>,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<TValue, TError>;
  onSuccessTry(
    action: Action | ActionOfT<TValue> | FunctionOfTtoK<TValue, Promise<void>>,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then((r) => {
        if (r.isFailure) {
          return r;
        }

        const value = r.getValueOrThrow();

        try {
          const result = action(value);

          if (isPromise(result)) {
            return result.then(() => Result.success(value));
          }

          return Result.success(value);
        } catch (error: unknown) {
          return Result.failure(errorHandler(error));
        }
      })
    );
  }

  /**
   * Returns the inner Promise, wrapping a failed Result for a rejected Promise with the
   * given errorHandler if provided, othewise rejected Promise handling
   * is left to the caller.
   * @param errorHandler
   * @returns
   */
  toPromise(
    errorHandler?: FunctionOfTtoK<unknown, Some<TError>>
  ): Promise<Result<TValue, TError>> {
    return isDefined(errorHandler)
      ? this.value.catch((error) => Result.failure(errorHandler(error)))
      : this.value;
  }
}
