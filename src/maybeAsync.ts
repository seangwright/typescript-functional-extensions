import { Maybe } from './maybe';
import { ResultAsync } from './resultAsync';
import {
  ActionOfT,
  isPromise,
  MaybeMatcher,
  MaybeMatcherNoReturn,
  SelectorT,
  SelectorTK,
} from './utilities';

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

  get hasValue(): Promise<boolean> {
    return this.value.then((m) => m.hasValue);
  }

  get hasNoValue(): Promise<boolean> {
    return this.value.then((m) => m.hasNoValue);
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
    return MaybeAsync.from(this.value.then((m) => m.bind(selector)));
  }

  match<TNewValue>(
    matcher: MaybeMatcher<TValue, TNewValue> | MaybeMatcherNoReturn<TValue>
  ): Promise<TNewValue> | Promise<never> {
    return this.value.then((m) => m.match(matcher));
  }

  execute(func: ActionOfT<TValue>): Promise<void> {
    return this.value.then((m) => m.execute(func));
  }

  or(
    fallback: SelectorT<TValue> | Maybe<TValue> | SelectorT<Maybe<TValue>>
  ): MaybeAsync<TValue> {
    return MaybeAsync.from(this.value.then((m) => m.or(fallback)));
  }

  toResult(error: string): ResultAsync {
    return ResultAsync.from(this.value.then((m) => m.toResult(error)));
  }

  toPromise(): Promise<Maybe<TValue>> {
    return this.value;
  }
}