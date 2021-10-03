import { ResultAsync } from './resultAsync';
import { Unit } from './unit';
import {
  ActionOfT,
  isDefined,
  isFunction,
  never,
  Predicate,
  SelectorT,
  SelectorTK,
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
   * @param defaultOrValueCreator A value or value creator function
   * @returns {TValue} The Result's value or a default value if the Result failed
   */
  getValueOrDefault(defaultOrValueCreator: TValue | SelectorT<TValue>): TValue {
    if (isDefined(this.state.value)) {
      return this.state.value;
    }

    if (isFunction(defaultOrValueCreator)) {
      return defaultOrValueCreator();
    }

    return defaultOrValueCreator;
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

  /**
   * Gets the Result's inner error
   * @param defaultOrErrorCreator An error or error creator function
   * @returns {TError} The Result's error or a default error if the Result succeeded
   */
  getErrorOrDefault(defaultOrErrorCreator: TError | SelectorT<TError>): TError {
    if (isDefined(this.state.error)) {
      return this.state.error;
    }

    if (isFunction(defaultOrErrorCreator)) {
      return defaultOrErrorCreator();
    }

    return defaultOrErrorCreator;
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

  ensure(
    predicate: Predicate<TValue>,
    errorOrErrorCreator: TError | SelectorTK<TValue, TError>
  ): Result<TValue, TError> {
    if (isDefined(this.state.error)) {
      return this;
    }

    if (isDefined(this.state.value) && !predicate(this.state.value)) {
      return isFunction(errorOrErrorCreator)
        ? Result.failure(errorOrErrorCreator(this.state.value))
        : Result.failure(errorOrErrorCreator);
    }

    return this;
  }

  map<TNewValue>(
    selector: SelectorTK<TValue, TNewValue>
  ): Result<TNewValue, TError> {
    return isDefined(this.state.value)
      ? Result.success(selector(this.state.value))
      : Result.failure(this.state.error!);
  }

  mapError<TNewError>(
    selector: SelectorTK<TError, TNewError>
  ): Result<TValue, TNewError> {
    return isDefined(this.state.error)
      ? Result.failure(selector(this.getErrorOrThrow()))
      : Result.success(this.state.value!);
  }

  bind<TNewValue>(
    selector: SelectorTK<TValue, Result<TNewValue, TError>>
  ): Result<TNewValue, TError> {
    return isDefined(this.state.value)
      ? selector(this.state.value)
      : Result.failure(this.state.error!);
  }

  bindAsync<TNewValue>(
    selector: SelectorTK<TValue, ResultAsync<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError> {
    return isDefined(this.state.value)
      ? selector(this.state.value)
      : ResultAsync.failure(this.getErrorOrThrow());
  }

  tap(action: ActionOfT<TValue>): Result<TValue, TError> {
    if (isDefined(this.state.value)) {
      action(this.state.value);
    }

    return this;
  }

  tapIf(
    conditionOrPredicate: boolean | Predicate<TValue>,
    action: ActionOfT<TValue>
  ): Result<TValue, TError> {
    if (!isDefined(this.state.value)) {
      return this;
    }

    if (isFunction(conditionOrPredicate)) {
      conditionOrPredicate(this.state.value) && action(this.state.value);
    } else {
      conditionOrPredicate && action(this.state.value);
    }

    return this;
  }

  match<TNewValue>(
    matcher:
      | ResultMatcher<TValue, TError, TNewValue>
      | ResultMatcherNoReturn<TValue, TError>
  ): TNewValue | never {
    if (isDefined(this.state.value)) {
      return matcher.success(this.state.value);
    }
    if (isDefined(this.state.error)) {
      return matcher.error(this.state.error);
    }

    return never();
  }

  finally<TNewValue>(
    selector: SelectorTK<Result<TValue, TError>, TNewValue>
  ): TNewValue {
    return selector(this);
  }

  onFailure(action: ActionOfT<TError>): Result<TValue, TError> {
    if (isDefined(this.state.error)) {
      action(this.state.error);
    }

    return this;
  }
}

type ResultState<TValue, TError> = {
  value?: TValue;
  error?: TError;
};

type ResultMatcher<TValue, TError, TNewValue> = {
  success: SelectorTK<TValue, TNewValue>;
  error: SelectorTK<TError, TNewValue>;
};

type ResultMatcherNoReturn<T, E> = {
  success: ActionOfT<T>;
  error: ActionOfT<E>;
};
