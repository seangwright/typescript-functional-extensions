import { ResultT } from './resultT';
import { isPromise } from './utilities';

export class ResultTAsync<TValue> {
  static from<TValue>(
    promiseOrResultOrValue: Promise<ResultT<TValue>> | ResultT<TValue> | TValue
  ): ResultTAsync<TValue> {
    if (isPromise(promiseOrResultOrValue)) {
      return new ResultTAsync(promiseOrResultOrValue);
    } else if (promiseOrResultOrValue instanceof ResultT) {
      return new ResultTAsync(Promise.resolve(promiseOrResultOrValue));
    } else {
      return new ResultTAsync(
        Promise.resolve(ResultT.success(promiseOrResultOrValue))
      );
    }
  }

  static success<TValue>(value: TValue): ResultTAsync<TValue> {
    return ResultTAsync.from(value);
  }

  static failure<TValue>(error: string): ResultTAsync<TValue> {
    return new ResultTAsync(Promise.resolve(ResultT.failure(error)));
  }

  private value: Promise<ResultT<TValue>>;

  protected constructor(promise: Promise<ResultT<TValue>>) {
    this.value = promise;
  }

  toPromise(): Promise<ResultT<TValue>> {
    return this.value;
  }
}
