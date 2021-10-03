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

export class Result<TValue = Unit, TError = string> {
  static success<TError = string>(): Result<Unit, TError>;
  static success<TValue, TError = string>(
    value: TValue
  ): Result<TValue, TError>;
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

  static failure<TValue = Unit, TError = string>(
    error: TError
  ): Result<TValue, TError> {
    return new Result({ error, isSuccess: false });
  }

  get isSuccess(): boolean {
    return isDefined(this.state.value);
  }

  get isFailure(): boolean {
    return !this.isSuccess;
  }

  private state: ResultState<TValue, TError> = {
    value: undefined,
    error: undefined,
  };

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
      throw new Error('Value cannot be defined for failed ResultAll');
    } else if (isDefined(error) && isSuccess) {
      throw new Error('Error cannot be defined for successful ResultAll');
    } else if (!isDefined(value) && !isDefined(error)) {
      throw new Error('Value or Error must be defined');
    }

    this.state.value = value;
    this.state.error = error;
  }

  getValueOrDefault(createDefault: TValue | SelectorT<TValue>): TValue {
    if (isDefined(this.state.value)) {
      return this.state.value;
    }

    if (isFunction(createDefault)) {
      return createDefault();
    }

    return createDefault;
  }

  getValueOrThrow(): TValue {
    if (isDefined(this.state.value)) {
      return this.state.value;
    }

    throw Error('No value');
  }

  getErrorOrDefault(defaultOrFactory: TError | SelectorT<TError>): TError {
    if (isDefined(this.state.error)) {
      return this.state.error;
    }

    if (isFunction(defaultOrFactory)) {
      return defaultOrFactory();
    }

    return defaultOrFactory;
  }

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

const rsu = Result.success();
const rss = Result.success('a');

const rfu = Result.failure('');
const rfs = Result.failure<string>('');
const rfn = Result.failure<boolean, number>(3);
