import { ResultTE } from './resultTE';
import { SelectorTK } from './utilities';

export class ResultTEAsync<TValue, TError> {
  static from<TValue, TError>(
    promise: Promise<ResultTE<TValue, TError>>
  ): ResultTEAsync<TValue, TError> {
    return new ResultTEAsync(promise);
  }

  private value: Promise<ResultTE<TValue, TError>>;

  protected constructor(value: Promise<ResultTE<TValue, TError>>) {
    this.value = value;
  }

  map<TNewValue>(selector: SelectorTK<TValue, TNewValue>): ResultTEAsync<TNewValue, TError> {
    return new ResultTEAsync(this.value.then((r) => r.map(selector)));
  }
}
