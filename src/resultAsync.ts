import { Result } from './result';
import { Unit } from './unit';
import {
  Action,
  ActionOfT,
  isDefined,
  isFunction,
  isPromise,
  Predicate,
  ResultMatcher,
  ResultMatcherNoReturn,
  SelectorT,
  SelectorTK,
} from './utilities';

/**
 * Represents and asynchronous operation that could succeed with a value or fail with an error
 */
export class ResultAsync<TValue = Unit, TError = string> {
  /**
   * Creates a new ResultAsync from the given value
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

  getValueOrDeafult(
    defaultOrValueCreator: TValue | SelectorT<TValue>
  ): Promise<TValue> {
    return this.value.then((r) => r.getValueOrDefault(defaultOrValueCreator));
  }

  getErrorOrThrow(): Promise<TError> {
    return this.value.then((r) => r.getErrorOrThrow());
  }

  getErrorOrDefault(
    defaultOrErrorCreator: TError | SelectorT<TError>
  ): Promise<TError> {
    return this.value.then((r) => r.getErrorOrDefault(defaultOrErrorCreator));
  }

  /**
   * Checks the value of a given predicate against the Result's inner value,
   * if the Result already succeeded
   * @param predicate check against the Result's inner value
   * @param errorOrErrorCreator either an error value or a function to create an error from the Result's inner value
   * @returns {Result} succeeded if the predicate is true, failed if not
   */
  ensure(
    predicate: Predicate<TValue>,
    errorOrErrorCreator: TError | SelectorTK<TValue, TError>
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
    selector: SelectorTK<TValue, TNewValue>
  ): ResultAsync<TNewValue, TError> {
    return new ResultAsync(this.value.then((r) => r.map(selector)));
  }

  mapAsync<TNewValue>(
    selector: SelectorTK<TValue, Promise<TNewValue>>
  ): ResultAsync<TNewValue, TError> {
    return new ResultAsync(
      this.value.then((r) => r.mapAsync(selector).toPromise())
    );
  }

  mapError<TNewError>(
    selector: SelectorTK<TError, TNewError>
  ): ResultAsync<TValue, TNewError> {
    return new ResultAsync(this.value.then((r) => r.mapError(selector)));
  }

  bind<TNewValue>(
    selector: SelectorTK<TValue, Result<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError> {
    return new ResultAsync(this.value.then((r) => r.bind(selector)));
  }

  tap(action: ActionOfT<TValue>): ResultAsync<TValue, TError> {
    return new ResultAsync(this.value.then((r) => r.tap(action)));
  }

  tapIf(
    conditionOrPredicate: boolean | Predicate<TValue>,
    action: ActionOfT<TValue>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then((r) => r.tapIf(conditionOrPredicate, action))
    );
  }

  match<TNewValue>(
    matcher:
      | ResultMatcher<TValue, TError, TNewValue>
      | ResultMatcherNoReturn<TValue, TError>
  ): Promise<TNewValue | never> {
    return this.value.then((r) => r.match(matcher));
  }

  finally<TNewValue>(
    selector: SelectorTK<Result<TValue, TError>, TNewValue>
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
    errorHandler: SelectorTK<unknown, TError>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then((r) => r.onSuccessTry(action, errorHandler))
    );
  }

  onSuccessTryAsync(
    action: SelectorTK<TValue, Promise<void>>,
    errorHandler: SelectorTK<unknown, TError>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then((r) =>
        r.onSuccessTryAsync(action, errorHandler).toPromise()
      )
    );
  }

  toPromise(): Promise<Result<TValue, TError>> {
    return this.value.catch((error) => Result.failure(error));
  }
}
