import { Result } from './result';
import { ResultTAsync } from './resultTAsync';
import { SelectorT } from './utilities';

export class ResultAsync {
  static from(promise: Promise<Result>): ResultAsync {
    return new ResultAsync(promise);
  }

  private value: Promise<Result>;

  protected constructor(value: Promise<Result>) {
    this.value = value;
  }

  map<TValue>(selector: SelectorT<TValue>): ResultTAsync<TValue> {
    return ResultTAsync.from(this.value.then((r) => r.map(selector)));
  }

  bind(selector: SelectorT<Result>): ResultAsync {
    return ResultAsync.from(this.value.then(_ => selector()));
  }
}
