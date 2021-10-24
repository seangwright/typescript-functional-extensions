import { AsyncActionOfT } from '.';
import { Result } from './result';
import { Unit } from './unit';
import {
  Action,
  ActionOfT,
  FunctionOfT,
  FunctionOfTtoK,
  isDefined,
  isFunction,
  isPromise,
  PredicateOfT,
  ResultMatcher,
  ResultMatcherNoReturn,
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
    value: Promise<TValue>
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
      | Promise<TValue>
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
    func: FunctionOfT<Promise<TValue>>,
    errorHandler: FunctionOfTtoK<unknown, TError>
  ): ResultAsync<TValue, TError>;
  static try<TError = string>(
    func: FunctionOfT<Promise<void>>,
    errorHandler: FunctionOfTtoK<unknown, TError>
  ): ResultAsync<Unit, TError>;
  /**
   * Creates a new successful Result with the inner value
   * of the given Promise. If the Promise rejects, a failed Result will
   * be returned with an error created by the provided errorHandler
   * @param promise
   * @param errorHandler
   */
  static try<TValue, TError = string>(
    promise: Promise<TValue>,
    errorHandler: FunctionOfTtoK<unknown, TError>
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
    errorHandler: FunctionOfTtoK<unknown, TError>
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
      | Promise<TValue>
      | Promise<void>
      | FunctionOfT<Promise<TValue>>
      | FunctionOfT<Promise<void>>,
    errorHandler: FunctionOfTtoK<unknown, TError>
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
    value: TValue
  ): ResultAsync<TValue, TError>;
  /**
   * Creates a new successful ResultAsync with the given value (or Unit if no value is provided)
   * @param value
   * @returns
   */
  static success<TValue, TError = string>(
    value?: never | TValue
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
    error: TError
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
  getValueOrThrow(): Promise<TValue> {
    return this.value.then((r) => r.getValueOrThrow());
  }

  /**
   *
   * @param defaultValue returned if the Result was not successful
   */
  getValueOrDefault(defaultValue: TValue): Promise<TValue>;
  /**
   *
   * @param valueFactory executed and returned if the Result was not successful
   */
  getValueOrDefault(valueFactory: FunctionOfT<TValue>): Promise<TValue>;
  getValueOrDefault(
    defaultOrValueFactory: TValue | FunctionOfT<TValue>
  ): Promise<TValue> {
    return this.value.then((r) =>
      r.getValueOrDefault(defaultOrValueFactory as TValue)
    );
  }

  /**
   * Will return the inner error value of the Result
   * if it failed, otherwise it will throw and Error
   * @returns the error ofa failed Result
   */
  getErrorOrThrow(): Promise<TError> {
    return this.value.then((r) => r.getErrorOrThrow());
  }

  /**
   *
   * @param defaultError returned if the Result was successful
   */
  getErrorOrDefault(defaultError: TError): Promise<TError>;
  /**
   *
   * @param errorCreator
   */
  getErrorOrDefault(errorCreator: FunctionOfT<TError>): Promise<TError>;
  getErrorOrDefault(
    defaultOrErrorCreator: TError | FunctionOfT<TError>
  ): Promise<TError> {
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
    errorOrErrorCreator: TError | FunctionOfTtoK<TValue, TError>
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
   * @param mapper function which accepts the current value as a parameter and returns a new value
   */
  map<TNewValue>(
    mapper: FunctionOfTtoK<TValue, TNewValue>
  ): ResultAsync<TNewValue, TError>;
  /**
   * Converts the inner value of a successful Result to a new value.
   * @param mapper function which accepts the current value as a parameter and returns a Promise containing
   * the new value
   */
  map<TNewValue>(
    mapper: FunctionOfTtoK<TValue, Promise<TNewValue>>
  ): ResultAsync<TNewValue, TError>;
  map<TNewValue>(
    mapper:
      | FunctionOfTtoK<TValue, TNewValue>
      | FunctionOfTtoK<TValue, Promise<TNewValue>>
  ): ResultAsync<TNewValue, TError> {
    return new ResultAsync(
      this.value.then((r) => {
        if (r.isFailure) {
          return Result.failure(r.getErrorOrThrow());
        }

        const promiseOrValue = mapper(r.getValueOrThrow());

        if (isPromise(promiseOrValue)) {
          return promiseOrValue.then((v) => Result.success(v));
        }

        return Result.success(promiseOrValue);
      })
    );
  }

  mapError<TNewError>(
    mapper: FunctionOfTtoK<TError, TNewError>
  ): ResultAsync<TValue, TNewError>;
  mapError<TNewError>(
    mapper: FunctionOfTtoK<TError, Promise<TNewError>>
  ): ResultAsync<TValue, TNewError>;
  mapError<TNewError>(
    mapper:
      | FunctionOfTtoK<TError, TNewError>
      | FunctionOfTtoK<TError, Promise<TNewError>>
  ): ResultAsync<TValue, TNewError> {
    return new ResultAsync(
      this.value.then((r) => {
        if (r.isSuccess) {
          return Result.success(r.getValueOrThrow());
        }

        const promiseOrError = mapper(r.getErrorOrThrow());

        if (isPromise(promiseOrError)) {
          return promiseOrError.then((e) => Result.failure(e));
        }

        return Result.failure(promiseOrError);
      })
    );
  }

  bind<TNewValue>(
    mapper: FunctionOfTtoK<TValue, Result<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError>;
  bind<TNewValue>(
    mapper: FunctionOfTtoK<TValue, ResultAsync<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError>;
  bind<TNewValue>(
    mapper:
      | FunctionOfTtoK<TValue, Result<TNewValue, TError>>
      | FunctionOfTtoK<TValue, ResultAsync<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError> {
    return new ResultAsync(
      this.value.then((r) => {
        if (r.isFailure) {
          return Result.failure(r.getErrorOrThrow());
        }

        const resultOrResultAsync = mapper(r.getValueOrThrow());

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
  tap(
    action: ActionOfT<TValue> | FunctionOfTtoK<TValue, Promise<void>>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then(async (r) => {
        if (r.isFailure) {
          return r;
        }

        const voidOrPromise = action(r.getValueOrThrow());

        if (isPromise(voidOrPromise)) {
          await voidOrPromise;
        }

        return r;
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
    matcher:
      | ResultMatcher<TValue, TError, TNewValue>
      | ResultMatcherNoReturn<TValue, TError>
  ): Promise<TNewValue | void> {
    return this.value.then((r) => r.match(matcher));
  }

  finally<TNewValue>(
    mapper: FunctionOfTtoK<Result<TValue, TError>, TNewValue>
  ): Promise<TNewValue> {
    return this.value.then((r) => r.finally(mapper));
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
    errorHandler: FunctionOfTtoK<unknown, TError>
  ): ResultAsync<TValue, TError>;
  onSuccessTry(
    action: ActionOfT<TValue>,
    errorHandler: FunctionOfTtoK<unknown, TError>
  ): ResultAsync<TValue, TError>;
  onSuccessTry(
    action: FunctionOfTtoK<TValue, Promise<void>>,
    errorHandler: FunctionOfTtoK<unknown, TError>
  ): ResultAsync<TValue, TError>;
  onSuccessTry(
    action: Action | ActionOfT<TValue> | FunctionOfTtoK<TValue, Promise<void>>,
    errorHandler: FunctionOfTtoK<unknown, TError>
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
    errorHandler?: FunctionOfTtoK<unknown, TError>
  ): Promise<Result<TValue, TError>> {
    return isDefined(errorHandler)
      ? this.value.catch((error) => Result.failure(errorHandler(error)))
      : this.value;
  }
}
