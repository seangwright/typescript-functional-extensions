import { IResult } from './iresult';
import { isDefined, isFunction, SelectorT, SelectorTK } from './utilities';

export class ResultE<TError> implements IResult<never, TError> {
  static success<TError>(): ResultE<TError> {
    return new ResultE({ isSuccess: true });
  }

  static failure<TError>(error: TError): ResultE<TError> {
    return new ResultE({ error, isSuccess: false });
  }

  get isSuccess(): boolean {
    return !this.isFailure;
  }

  get isFailure(): boolean {
    return isDefined(this.error);
  }

  private error: TError | undefined;

  protected constructor({
    error,
    isSuccess,
  }: {
    error?: TError;
    isSuccess: boolean;
  }) {
    if (isDefined(error) && isSuccess) {
      throw new Error('Error cannot be set for successful ResultE');
    } else if (!isDefined(error) && !isSuccess) {
      throw new Error('Error must be set for failed ResultE');
    }

    this.error = error;
  }
  failure(error: TError): ResultE<TError> {
    return ResultE.failure(error);
  }
  success(value: never): ResultE<TError> {
    return ResultE.success();
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

  mapError<TNewError>(
    selector: SelectorTK<TError, TNewError>
  ): ResultE<TNewError> {
    return isDefined(this.error)
      ? ResultE.failure(selector(this.error))
      : ResultE.success();
  }
}
