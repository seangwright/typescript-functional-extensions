import { IResult } from './iresult';
import { isDefined, isFunction, SelectorT, SelectorTK } from './utilities';

export class Result implements IResult<never, string> {
  static success(): Result {
    return new Result({ isSuccess: true });
  }

  static failure(error: string): Result {
    return new Result({ error, isSuccess: false });
  }

  get isSuccess(): boolean {
    return !this.isFailure;
  }

  get isFailure(): boolean {
    return isDefined(this.error);
  }

  private error: string | undefined;

  protected constructor({
    error,
    isSuccess,
  }: {
    error?: string;
    isSuccess: boolean;
  }) {
    if (isDefined(error) && isSuccess) {
      throw new Error('Error cannot be defined for successful Result');
    } else if (!isDefined(error) && !isSuccess) {
      throw new Error('Error must be defined for failed Result');
    }

    this.error = error;
  }

  failure(error: string): Result {
    return Result.failure(error);
  }

  success(value: never): Result {
    return Result.success();
  }

  getErrorOrDefault(defaultOrFactory: string | SelectorT<string>): string {
    if (isDefined(this.error)) {
      return this.error;
    }

    if (isFunction(defaultOrFactory)) {
      return defaultOrFactory();
    }

    return defaultOrFactory;
  }

  getErrorOrThrow(): string {
    if (isDefined(this.error)) {
      return this.error;
    }

    throw Error('No error');
  }

  mapError(selector: SelectorTK<string, string>): Result {
    return isDefined(this.error)
      ? Result.failure(selector(this.error))
      : Result.success();
  }

  bind(selector: Result): Result;
  bind<TResult extends Result | IResult<TValue, TError>, TValue, TError>(
    selector: SelectorT<TResult>,
    failureFactory?: SelectorTK<string, TResult>
  ): TResult {
    return !isDefined(this.error) ? selector() : failureFactory(this.error);
  }
}
