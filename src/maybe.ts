import { MaybeAsync } from '.';
import { Result } from './result';
import {
  ActionOfT,
  isDefined,
  isFunction,
  MaybeMatcher,
  MaybeMatcherNoReturn,
  PredicateOfT,
  SelectorT,
  SelectorTK,
} from './utilities';

/**
 * Represents a value that might not exist
 */
export class Maybe<TValue> {
  /**
   * Creates a new maybe with a value
   * @param value The value of the new maybe
   * @returns
   */
  static some<TValue>(value: TValue): Maybe<TValue> {
    return new Maybe(value);
  }

  /**
   * Creates a new maybe with no value
   * @returns {Maybe}
   */
  static none<TValue>(): Maybe<TValue> {
    return new Maybe();
  }

  /**
   * Creates a new maybe. If no value is provided, it is equivalent to calling maybe.none(), and
   * if a value is provided, it is equivalent to calling maybe.some(val)
   * @param value The value of the new maybe.
   * @returns {Maybe}
   */
  static from<TValue>(value: TValue | undefined | null): Maybe<TValue> {
    return new Maybe(value);
  }

  static tryFirst<TValue>(values: TValue[]): Maybe<TValue>;
  static tryFirst<TValue>(
    values: TValue[],
    predicate: PredicateOfT<TValue>
  ): Maybe<TValue>;
  static tryFirst<TValue>(
    values: TValue[],
    predicate?: PredicateOfT<TValue>
  ): Maybe<TValue> {
    if (typeof predicate === 'function') {
      return Maybe.from(values.find(predicate));
    } else {
      return Maybe.from(values[0]);
    }
  }

  static choose<TValue>(maybes: Maybe<TValue>[]): TValue[];
  static choose<TValue, TNewValue>(
    maybes: Maybe<TValue>[],
    selector: SelectorTK<TValue, TNewValue>
  ): TNewValue[];
  static choose<TValue, TNewValue>(
    maybes: Maybe<TValue>[],
    selector?: SelectorTK<TValue, TNewValue>
  ): TValue[] | TNewValue[] {
    if (typeof selector === 'function') {
      const values: TNewValue[] = [];

      for (const m of maybes) {
        if (m.hasNoValue) {
          continue;
        }

        const original = m.getValueOrThrow();

        values.push(selector(original));
      }

      return values;
    } else {
      const values: TValue[] = [];
      for (const m of maybes) {
        if (m.hasNoValue) {
          continue;
        }

        const original = m.getValueOrThrow();

        values.push(original);
      }

      return values;
    }
  }

  private value: TValue | undefined;

  get hasValue(): boolean {
    return isDefined(this.value);
  }

  get hasNoValue(): boolean {
    return !this.hasValue;
  }

  protected constructor(value?: TValue | null) {
    this.value = isDefined(value) ? value : undefined;
  }

  getValueOrDefault(createDefault: TValue | SelectorT<TValue>): TValue {
    if (isDefined(this.value)) {
      return this.value;
    }

    if (isFunction(createDefault)) {
      return createDefault();
    }

    return createDefault;
  }

  getValueOrThrow(): TValue {
    if (isDefined(this.value)) {
      return this.value;
    }

    throw Error('No value');
  }

  map<TNewValue>(selector: SelectorTK<TValue, TNewValue>): Maybe<TNewValue> {
    return this.hasValue
      ? new Maybe(selector(this.getValueOrThrow()))
      : Maybe.none();
  }

  mapAsync<TNewValue>(
    selector: SelectorTK<TValue, Promise<TNewValue>>
  ): MaybeAsync<TNewValue> {
    return this.hasValue
      ? MaybeAsync.from(selector(this.getValueOrThrow()))
      : MaybeAsync.none();
  }

  bind<TNewValue>(
    selector: SelectorTK<TValue, Maybe<TNewValue>>
  ): Maybe<TNewValue> {
    return this.hasValue ? selector(this.getValueOrThrow()) : Maybe.none();
  }

  bindAsync<TNewValue>(
    selector: SelectorTK<TValue, MaybeAsync<TNewValue>>
  ): MaybeAsync<TNewValue> {
    return this.hasValue ? selector(this.getValueOrThrow()) : MaybeAsync.none();
  }

  match<TNewValue>(
    matcher: MaybeMatcher<TValue, TNewValue> | MaybeMatcherNoReturn<TValue>
  ): TNewValue | void {
    return this.hasValue
      ? matcher.some(this.getValueOrThrow())
      : matcher.none();
  }

  execute(func: ActionOfT<TValue>): void {
    if (this.hasValue) {
      func(this.getValueOrThrow());
    }
  }

  or(
    fallback:
      | TValue
      | Maybe<TValue>
      | SelectorT<TValue>
      | SelectorT<Maybe<TValue>>
  ): Maybe<TValue> {
    if (this.hasValue) {
      return new Maybe(this.getValueOrThrow());
    }

    if (isFunction(fallback)) {
      const maybeOrValue = fallback();

      return maybeOrValue instanceof Maybe
        ? maybeOrValue
        : new Maybe(maybeOrValue);
    } else if (fallback instanceof Maybe) {
      return fallback;
    }

    return new Maybe(fallback);
  }

  orAsync(fallback: MaybeAsync<TValue>): MaybeAsync<TValue> {
    return this.hasValue ? MaybeAsync.some(this.getValueOrThrow()) : fallback;
  }

  toResult<TError>(error: TError): Result<TValue, TError> {
    return this.hasValue
      ? Result.success(this.getValueOrThrow())
      : Result.failure(error);
  }

  toString(): string {
    return this.hasValue ? `Maybe.some` : 'Maybe.none';
  }

  equals(maybe: Maybe<TValue>): boolean {
    return (
      this.hasValue &&
      maybe.hasValue &&
      this.getValueOrThrow() == maybe.getValueOrThrow()
    );
  }
}
