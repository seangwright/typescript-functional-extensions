import { IResult } from './iresult';
import {
  Action,
  ActionOfT,
  isDefined,
  isFunction,
  never,
  SelectorT,
  SelectorTK,
} from './utilities';

/**
 * Represents an operation that has either succeeded or failed
 * @template TValue The type of value produced by a successful operation
 * @template TError The type of value produced by a failed operation
 */
export class ResultTE<TValue, TError> implements IResult<TValue, TError> {
  static success<TValue, TError>(value: TValue): ResultTE<TValue, TError> {
    return new ResultTE({ value, isSuccess: true });
  }

  static failure<TValue, TError>(error: TError): ResultTE<TValue, TError> {
    return new ResultTE({ error, isSuccess: false });
  }

  static try<TValue, TError>(
    action: Action | SelectorT<TValue>,
    errorOrSelector: TError | SelectorTK<unknown, TError>
  ): ResultTE<TValue, TError> {
    try {
      const val = action();

      return ResultTE.success(val);
    } catch (error: unknown) {
      if (isFunction(errorOrSelector)) {
        return ResultTE.failure(errorOrSelector(error));
      } else {
        return ResultTE.failure(errorOrSelector);
      }
    }
  }

  private value: TValue | undefined;
  private error: TError | undefined;

  get isSuccess(): boolean {
    return isDefined(this.value);
  }

  get isFailure(): boolean {
    return !this.isSuccess;
  }

  protected constructor({
    value,
    error,
    isSuccess,
  }: {
    value?: TValue;
    error?: TError;
    isSuccess: boolean;
  }) {
    if (isDefined(value) && !isSuccess) {
      throw new Error('Value cannot be defined for failed ResultTE');
    } else if (isDefined(error) && isSuccess) {
      throw new Error('Error cannot be defined for successful ResultTE');
    } else if (!isDefined(value) && !isDefined(error)) {
      throw new Error('Value or Error must be defined');
    }

    this.value = value;
    this.error = error;
  }
  failure(error: TError): ResultTE<TValue, TError> {
    return ResultTE.failure(error);
  }
  success(value: TValue): IResult<TValue, TError> {
    return ResultTE.success(value);
  }

  getValueOrDefault(createDefault: TValue | SelectorT<TValue>): TValue {
    if (isDefined(this.value)) {
      return this.value;
    }

    if (isFunction(createDefault)) {
      return createDefault();
    }

    return createDefault;
  }

  getValueOrThrow(): TValue {
    if (isDefined(this.value)) {
      return this.value;
    }

    throw Error('No value');
  }

  getErrorOrDefault(defaultOrFactory: TError | SelectorT<TError>): TError {
    if (isDefined(this.error)) {
      return this.error;
    }

    if (isFunction(defaultOrFactory)) {
      return defaultOrFactory();
    }

    return defaultOrFactory;
  }

  getErrorOrThrow(): TError {
    if (isDefined(this.error)) {
      return this.error;
    }

    throw Error('No error');
  }

  map<TNewValue>(
    selector: SelectorTK<TValue, TNewValue>
  ): ResultTE<TNewValue, TError> {
    return isDefined(this.value)
      ? ResultTE.success(selector(this.value))
      : ResultTE.failure(this.error!);
  }

  bind<TNewValue>(
    selector: SelectorTK<TValue, ResultTE<TNewValue, TError>>
  ): ResultTE<TNewValue, TError> {
    return isDefined(this.value)
      ? selector(this.value)
      : ResultTE.failure(this.error!);
  }

  tap(action: ActionOfT<TValue>): ResultTE<TValue, TError> {
    if (isDefined(this.value)) {
      action(this.value);
    }

    return this;
  }

  match<TNewValue>(
    matcher:
      | Matcher<TValue, TError, TNewValue>
      | MatcherNoReturn<TValue, TError>
  ): TNewValue | never {
    if (isDefined(this.value)) {
      return matcher.success(this.value);
    }
    if (isDefined(this.error)) {
      return matcher.error(this.error);
    }

    return never();
  }
}

type Matcher<TValue, TError, TNewValue> = {
  success: SelectorTK<TValue, TNewValue>;
  error: SelectorTK<TError, TNewValue>;
};

type MatcherNoReturn<T, E> = {
  success: ActionOfT<T>;
  error: ActionOfT<E>;
};
