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
 * Represents and asynchronous operation that could succeed with a value or fail with an error
 */
export class ResultAsync<TValue = Unit, TError = string> {
  /**
   * Creates a new ResultAsync from the given value.
   * @param value Can be a Promise or Result
   * @returns
   */
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

  /**
   * Creates a new successful Result with the inner value
   * of the given Promise. If the Promise rjects, a failed Result will
   * be returned with an error created by the provided errorHandler
   * @param promise
   * @param errorHandler
   */
  static tryAsync<TValue, TError = string>(
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
  static tryAsync<TError = string>(
    promise: Promise<void>,
    errorHandler: FunctionOfTtoK<unknown, TError>
  ): ResultAsync<Unit, TError>;
  /**
   * Creates a new successful Result with the inner value
   * of the given Promise (or Unit if no value).
   * If the Promise rejects, a failed Result will
   * be returned with an error created by the provided errorHandler
   * @param promise
   * @param errorHandler
   */
  static tryAsync<TValue = Unit, TError = string>(
    promise: Promise<TValue> | Promise<void>,
    errorHandler: FunctionOfTtoK<unknown, TError>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      promise
        .then((value) => Result.success<TValue, TError>(value!))
        .catch((error) => Result.failure(errorHandler(error)))
    );
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

  get isSuccess(): Promise<boolean> {
    return this.value.then((r) => r.isSuccess);
  }

  get isFailure(): Promise<boolean> {
    return this.value.then((r) => r.isFailure);
  }

  getValueOrThrow(): Promise<TValue> {
    return this.value.then((r) => r.getValueOrThrow());
  }

  getValueOrDefault(defaultValue: TValue): Promise<TValue>;
  getValueOrDefault(creator: FunctionOfT<TValue>): Promise<TValue>;
  getValueOrDefault(
    defaultOrValueCreator: TValue | FunctionOfT<TValue>
  ): Promise<TValue> {
    return this.value.then((r) =>
      r.getValueOrDefault(defaultOrValueCreator as TValue)
    );
  }

  getErrorOrThrow(): Promise<TError> {
    return this.value.then((r) => r.getErrorOrThrow());
  }

  getErrorOrDefault(defaultError: TError): Promise<TError>;
  getErrorOrDefault(errorCreator: FunctionOfT<TError>): Promise<TError>;
  getErrorOrDefault(
    defaultOrErrorCreator: TError | FunctionOfT<TError>
  ): Promise<TError> {
    return this.value.then((r) => {
      if (isFunction(defaultOrErrorCreator)){
        return r.getErrorOrDefault(defaultOrErrorCreator)
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

  map<TNewValue>(
    selector: FunctionOfTtoK<TValue, TNewValue>
  ): ResultAsync<TNewValue, TError> {
    return new ResultAsync(this.value.then((r) => r.map(selector)));
  }

  mapAsync<TNewValue>(
    selector: FunctionOfTtoK<TValue, Promise<TNewValue>>
  ): ResultAsync<TNewValue, TError> {
    return new ResultAsync(
      this.value.then((r) => r.mapAsync(selector).toPromise())
    );
  }

  mapError<TNewError>(
    selector: FunctionOfTtoK<TError, TNewError>
  ): ResultAsync<TValue, TNewError> {
    return new ResultAsync(this.value.then((r) => r.mapError(selector)));
  }

  bind<TNewValue>(
    selector: FunctionOfTtoK<TValue, Result<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError> {
    return new ResultAsync(this.value.then((r) => r.bind(selector)));
  }

  tap(action: ActionOfT<TValue>): ResultAsync<TValue, TError> {
    return new ResultAsync(this.value.then((r) => r.tap(action)));
  }

  tapIf(
    conditionOrPredicate: boolean | PredicateOfT<TValue>,
    action: ActionOfT<TValue>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then((r) => {
        if (isFunction(conditionOrPredicate)){
          return r.tapIf(conditionOrPredicate, action);
        }

        return r.tapIf(conditionOrPredicate, action)
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
    selector: FunctionOfTtoK<Result<TValue, TError>, TNewValue>
  ): Promise<TNewValue> {
    return this.value.then((r) => r.finally(selector));
  }

  onFailure(action: ActionOfT<TError>): ResultAsync<TValue, TError> {
    return new ResultAsync(this.value.then((r) => r.onFailure(action)));
  }

  convertFailure<TNewValue>(): ResultAsync<TNewValue, TError> {
    return new ResultAsync(this.value.then((r) => r.convertFailure()));
  }

  onSuccessTry(
    action: Action | ActionOfT<TValue>,
    errorHandler: FunctionOfTtoK<unknown, TError>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then((r) => r.onSuccessTry(action, errorHandler))
    );
  }

  onSuccessTryAsync(
    action: FunctionOfTtoK<TValue, Promise<void>>,
    errorHandler: FunctionOfTtoK<unknown, TError>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then((r) =>
        r.onSuccessTryAsync(action, errorHandler).toPromise()
      )
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
