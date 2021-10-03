import { Maybe } from './maybe';
import { ResultTEAsync } from './resultTEAsync';
import { SelectorTK } from './utilities';

export class MaybeAsync<TValue> {
  static from<TValue>(promise: Promise<Maybe<TValue>>): MaybeAsync<TValue> {
    return new MaybeAsync(promise);
  }

  private value: Promise<Maybe<TValue>>;

  protected constructor(value: Promise<Maybe<TValue>>) {
    this.value = value;
  }

  map<TNewValue>(
    selector: SelectorTK<TValue, TNewValue>
  ): MaybeAsync<TNewValue> {
    return MaybeAsync.from(this.value.then((m) => m.map(selector)));
  }

  toResult<TError>(error: TError): ResultTEAsync<TValue, TError> {
    return ResultTEAsync.from(this.value.then((m) => m.toResult(error)));
  }

  async toPromise(): Promise<Maybe<TValue>> {
    return this.value;
  }
}
