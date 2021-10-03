import { IResult } from './iresult';
import { ResultAsync } from './resultAsync';
import { ResultT } from './resultT';
import { ResultTAsync } from './resultTAsync';
import { isDefined, isFunction, SelectorT, SelectorTK } from './utilities';

/**
 * Represents an operation that has either succeeded or failed
 * A successful operation produces no value and the failure state is a string
 */
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

  success(): Result {
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

  map<TValue>(selector: SelectorT<TValue>): ResultT<TValue> {
    return isDefined(this.error)
      ? ResultT.failure(this.error)
      : ResultT.success(selector());
  }

  mapError(selector: SelectorTK<string, string>): Result {
    return isDefined(this.error)
      ? Result.failure(selector(this.error))
      : Result.success();
  }

  bind<TResult extends Result | ResultT<TValue>, TValue>(
    selector: SelectorT<TResult>,
    createFailure: (error: string) => TResult
  ): TResult {
    return isDefined(this.error) ? createFailure(this.error) : selector();
  }

  bindAsync<TResultAsync extends ResultAsync | ResultTAsync<TValue>, TValue>(
    selector: SelectorT<TResultAsync>,
    createResultAsync: (error: string) => TResultAsync
  ): TResultAsync {
    return isDefined(this.error) ? createResultAsync(this.error) : selector();
  }
}
