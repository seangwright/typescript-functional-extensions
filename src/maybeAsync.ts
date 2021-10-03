import { Matcher, MatcherNoReturn, Maybe } from './maybe';
import { Result } from './result';
import { ResultAsync } from './resultAsync';
import { ResultEAsync } from './resultEAsync';
import { ResultTAsync } from './resultTAsync';
import { ResultTEAsync } from './resultTEAsync';
import { ActionOfT, isPromise, SelectorT, SelectorTK } from './utilities';

export class MaybeAsync<TValue> {
  static from<TValue>(
    promiseOrMaybe: Promise<TValue | Maybe<TValue>> | Maybe<TValue>
  ): MaybeAsync<TValue> {
    if (isPromise(promiseOrMaybe)) {
      return new MaybeAsync(
        promiseOrMaybe
          .then((v) => (v instanceof Maybe ? v : Maybe.from(v)))
          .catch((_) => Maybe.none())
      );
    } else if (promiseOrMaybe instanceof Maybe) {
      return new MaybeAsync(Promise.resolve(promiseOrMaybe));
    }

    throw new Error('Value must be a Promise or Maybe instance');
  }

  static some<TValue>(value: TValue): MaybeAsync<TValue> {
    return new MaybeAsync(Promise.resolve(Maybe.some(value)));
  }

  static none<TValue>(): MaybeAsync<TValue> {
    return new MaybeAsync(Promise.resolve(Maybe.none()));
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

  bind<TNewValue>(
    selector: SelectorTK<TValue, Maybe<TNewValue>>
  ): MaybeAsync<TNewValue> {
    return MaybeAsync.from(this.value.then((m) => m.bind((v) => selector(v))));
  }

  match<TNewValue>(
    matcher: Matcher<TValue, TNewValue> | MatcherNoReturn<TValue>
  ): Promise<TNewValue> | Promise<never> {
    return this.value.then((m) => m.match(matcher));
  }

  async execute(func: ActionOfT<TValue>): Promise<void> {
    await this.value.then((m) => m.execute(func));
  }

  or(
    fallback: SelectorT<TValue> | Maybe<TValue> | SelectorT<Maybe<TValue>>
  ): MaybeAsync<TValue> {
    return MaybeAsync.from(this.value.then((m) => m.or(fallback)));
  }

  toResult(error: string): ResultAsync {
    return ResultAsync.from(this.value.then((m) => m.toResult(error, Result)));
  }

  toResultT(error: string): ResultTAsync<TValue> {
    return ResultTAsync.from(this.value.then((m) => m.toResultT(error)));
  }

  toResultE<TError>(error: TError): ResultEAsync<TError> {
    return ResultEAsync.from(this.value.then((m) => m.toResultE(error)));
  }

  toResultTEAsync<TError>(error: TError): ResultTEAsync<TValue, TError> {
    return ResultTEAsync.from(this.value.then((m) => m.toResultTE(error)));
  }

  async toPromise(): Promise<Maybe<TValue>> {
    return this.value;
  }
}
