import { Result } from './result';
import {
  ActionOfT,
  isDefined,
  isFunction,
  MaybeMatcher,
  MaybeMatcherNoReturn,
  Predicate,
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
  static from<TValue>(value: TValue | undefined): Maybe<TValue> {
    return new Maybe(value);
  }

  static tryFirst<TValue>(values: TValue[]): Maybe<TValue>;
  static tryFirst<TValue>(
    values: TValue[],
    predicate: Predicate<TValue>
  ): Maybe<TValue>;
  static tryFirst<TValue>(
    values: TValue[],
    predicate?: Predicate<TValue>
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

  protected constructor(value?: TValue) {
    this.value = value;
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
      ? Maybe.from(selector(this.getValueOrThrow()))
      : Maybe.none<TNewValue>();
  }

  bind<TNewValue>(
    selector: SelectorTK<TValue, Maybe<TNewValue>>
  ): Maybe<TNewValue> {
    return this.hasValue
      ? selector(this.getValueOrThrow())
      : Maybe.none<TNewValue>();
  }

  match<TNewValue>(
    matcher: MaybeMatcher<TValue, TNewValue> | MaybeMatcherNoReturn<TValue>
  ): TNewValue | never {
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
    fallback: SelectorT<TValue> | Maybe<TValue> | SelectorT<Maybe<TValue>>
  ): Maybe<TValue> {
    if (this.hasValue) {
      return Maybe.from(this.getValueOrThrow());
    }

    if (typeof fallback === 'function') {
      const maybeOrValue = fallback();

      return maybeOrValue instanceof Maybe
        ? maybeOrValue
        : Maybe.from(maybeOrValue);
    } else {
      return fallback;
    }
  }

  toResult<TError>(error: TError): Result<TValue, TError> {
    return this.hasValue
      ? Result.success(this.getValueOrThrow())
      : Result.failure(error);
  }

  toString(): string {
    return this.hasValue ? `${this.getValueOrThrow()}` : 'No value';
  }

  equals(maybe: Maybe<TValue>): boolean {
    return (
      this.hasValue &&
      maybe.hasValue &&
      this.getValueOrThrow() == maybe.getValueOrThrow()
    );
  }
}
