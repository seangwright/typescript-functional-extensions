import { isDefined } from '.';
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

/**
 * Represents an asynchronous value that might or might not exist
 */
export class MaybeAsync<TValue> {
  /**
   * Creates a new MaybeAsync from the given value
   * @param value Can be a Promise or Maybe
   * @returns MaybeAsync
   */
  static from<TValue>(
    value: Promise<TValue | Maybe<TValue>> | Maybe<TValue>
  ): MaybeAsync<TValue> {
    if (isPromise(value)) {
      return new MaybeAsync(
        value.then((v) => (v instanceof Maybe ? v : Maybe.from(v)))
      );
    } else if (value instanceof Maybe) {
      return new MaybeAsync(Promise.resolve(value));
    }

    throw new Error('Value must be a Promise or Maybe');
  }

  /**
   * Creates a new MaybeAsync from the given value
   * @param value
   * @returns
   */
  static some<TValue>(value: TValue): MaybeAsync<TValue> {
    return new MaybeAsync(Promise.resolve(Maybe.some(value)));
  }

  /**
   * Creates a new MaybeAsync with no value
   * @returns
   */
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
    return new MaybeAsync(this.value.then((m) => m.map(selector)));
  }

  mapAsync<TNewValue>(
    selector: SelectorTK<TValue, Promise<TNewValue>>
  ): MaybeAsync<TNewValue> {
    return new MaybeAsync(
      this.value.then((m) => m.mapAsync(selector).toPromise())
    );
  }

  bind<TNewValue>(
    selector: SelectorTK<TValue, Maybe<TNewValue>>
  ): MaybeAsync<TNewValue> {
    return new MaybeAsync(this.value.then((m) => m.bind(selector)));
  }

  bindAsync<TNewValue>(
    selector: SelectorTK<TValue, MaybeAsync<TNewValue>>
  ): MaybeAsync<TNewValue> {
    return new MaybeAsync(
      this.value.then((m) => m.bindAsync(selector).toPromise())
    );
  }

  match<TNewValue>(
    matcher: MaybeMatcher<TValue, TNewValue> | MaybeMatcherNoReturn<TValue>
  ): Promise<TNewValue | void> {
    return this.value.then((m) => m.match(matcher));
  }

  execute(func: ActionOfT<TValue>): Promise<void> {
    return this.value.then((m) => m.execute(func));
  }

  or(
    fallback:
      | TValue
      | SelectorT<TValue>
      | Maybe<TValue>
      | SelectorT<Maybe<TValue>>
  ): MaybeAsync<TValue> {
    return new MaybeAsync(this.value.then((m) => m.or(fallback)));
  }

  orAsync(fallback: MaybeAsync<TValue>): MaybeAsync<TValue> {
    return new MaybeAsync(
      this.value.then((m) => m.orAsync(fallback).toPromise())
    );
  }

  toResult(error: string): ResultAsync {
    return ResultAsync.from(this.value.then((m) => m.toResult(error)));
  }

  /**
   * Returns the inner Promise, wrapping Maybe.none if handleError is true
   * for a rejected Promise, otherwise rejected Promise handling is left up to the caller.
   * @param handleError
   * @returns
   */
  toPromise(handleError: boolean = false): Promise<Maybe<TValue>> {
    return isDefined(handleError) && handleError
      ? this.value.catch((_) => Maybe.none())
      : this.value;
  }
}
