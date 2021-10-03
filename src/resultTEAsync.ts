import { ResultTE } from './resultTE';
import { isDefined, SelectorTK } from './utilities';

export class ResultTEAsync<TValue, TError> {
  static from<TValue, TError>(
    promise: Promise<ResultTE<TValue, TError>>
  ): ResultTEAsync<TValue, TError> {
    return new ResultTEAsync(promise);
  }

  get isSuccess(): boolean {
    return isDefined(this.value);
  }

  get isFailure(): boolean {
    return !this.isSuccess;
  }

  private value: Promise<ResultTE<TValue, TError>>;

  protected constructor(value: Promise<ResultTE<TValue, TError>>) {
    this.value = value;
  }

  map<U>(selector: SelectorTK<TValue, U>): ResultTEAsync<U, TError> {
    return new ResultTEAsync(this.value.then((r) => r.map(selector)));
  }
}
