import { Result } from './result';
import { Unit } from './unit';
import { isDefined, isPromise, SelectorTK } from './utilities';

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

  map<TNewValue>(
    selector: SelectorTK<TValue, TNewValue>
  ): ResultAsync<TNewValue, TError> {
    return new ResultAsync(this.value.then((r) => r.map(selector)));
  }

  bind<TNewValue>(
    selector: SelectorTK<TValue, Result<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError> {
    return ResultAsync.from(this.value.then((r) => r.bind(selector)));
  }

  toPromise(): Promise<Result<TValue, TError>> {
    return this.value;
  }
}
