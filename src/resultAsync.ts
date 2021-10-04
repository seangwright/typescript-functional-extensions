import { Result } from './result';
import { Unit } from './unit';
import {
  ActionOfT,
  isDefined,
  isPromise,
  Predicate,
  ResultMatcher,
  ResultMatcherNoReturn,
  SelectorT,
  SelectorTK,
} from './utilities';

export class ResultAsync<TValue = Unit, TError = string> {
  static from<TValue, TError>(
    promiseOrResult:
      | Promise<TValue | Result<TValue, TError>>
      | Result<TValue, TError>
  ): ResultAsync<TValue, TError> {
    if (isPromise(promiseOrResult)) {
      return new ResultAsync(
        promiseOrResult.then((v) =>
          v instanceof Result ? v : Result.success(v)
        )
      );
    } else if (promiseOrResult instanceof Result) {
      return new ResultAsync(Promise.resolve(promiseOrResult));
    }

    throw new Error('Value must be a Promise or Result instance');
  }

  static success<TError = string>(): ResultAsync<Unit, TError>;
  static success<TValue, TError = string>(
    value: TValue
  ): ResultAsync<TValue, TError>;
  static success<TValue, TError = string>(
    value?: never | TValue
  ): ResultAsync<TValue, TError> {
    const result = isDefined(value)
      ? Result.success<TValue, TError>(value)
      : (Result.success<Unit, TError>(Unit.Instance) as Result<TValue, TError>);

    return new ResultAsync(Promise.resolve(result));
  }

  static failure<TValue = Unit, TError = string>(
    error: TError
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(Promise.resolve(Result.failure(error)));
  }

  private value: Promise<Result<TValue, TError>>;

  protected constructor(value: Promise<Result<TValue, TError>>) {
    this.value = value;
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

  toPromise(): Promise<Result<TValue, TError>> {
    return this.value;
  }
}
