import {
  Action,
  ActionOfT,
  isDefined,
  isFunction,
  Predicate,
  SelectorT,
  SelectorTK,
} from './utilities';

/**
 * Represents a value that might not exist
 */
export class maybe<T> {
  /**
   * Creates a new maybe with a value
   * @param value The value of the new maybe
   * @returns
   */
  static some<T>(value: T): maybe<T> {
    return new maybe(value);
  }

  /**
   * Creates a new maybe with no value
   * @returns {maybe}
   */
  static none<T>(): maybe<T> {
    return new maybe();
  }

  /**
   * Creates a new maybe. If no value is provided, it is equivalent to calling maybe.none(), and
   * if a value is provided, it is equivalent to calling maybe.some(val)
   * @param value The value of the new maybe.
   * @returns {maybe}
   */
  static from<T>(value: T | undefined): maybe<T> {
    return new maybe(value);
  }

  static tryFirst<T>(values: T[]): maybe<T>;
  static tryFirst<T>(values: T[], predicate: Predicate<T>): maybe<T>;
  static tryFirst<T>(values: T[], predicate?: Predicate<T>): maybe<T> {
    if (typeof predicate === 'function') {
      return maybe.from(values.find(predicate));
    } else {
      return maybe.from(values[0]);
    }
  }

  static choose<T>(maybes: maybe<T>[]): T[];
  static choose<T, K>(maybes: maybe<T>[], selector: SelectorTK<T, K>): K[];
  static choose<T, K>(
    maybes: maybe<T>[],
    selector?: SelectorTK<T, K>
  ): T[] | K[] {
    if (typeof selector === 'function') {
      const values: K[] = [];

      for (const m of maybes) {
        if (m.hasNoValue) {
          continue;
        }

        const original = m.getValueOrThrow();

        values.push(selector(original));
      }

      return values;
    } else {
      const values: T[] = [];
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

  private value: T | undefined;

  get hasValue(): boolean {
    return isDefined(this.value);
  }

  get hasNoValue(): boolean {
    return !this.hasValue;
  }

  private constructor(value?: T) {
    if (value !== undefined && value !== null) {
      this.value = value;
    } else {
      this.value = undefined;
    }
  }

  getValueOrDefault(createDefault: T | SelectorT<T>): T {
    if (isDefined(this.value)) {
      return this.value;
    }

    if (isFunction(createDefault)) {
      return createDefault();
    }

    return createDefault;
  }

  getValueOrThrow(): T {
    if (isDefined(this.value)) {
      return this.value;
    }

    throw Error('No value');
  }

  map<K>(selector: SelectorTK<T, K>): maybe<K> {
    return isDefined(this.value)
      ? maybe.from(selector(this.value))
      : maybe.none<K>();
  }

  bind<K>(selector: SelectorTK<T, maybe<K>>): maybe<K> {
    return isDefined(this.value) ? selector(this.value) : maybe.none<K>();
  }

  match<K>(matcher: Matcher<T, K> | MatcherNoReturn<T>): K | never {
    return isDefined(this.value) ? matcher.some(this.value) : matcher.none();
  }

  execute(func: ActionOfT<T>): void {
    if (isDefined(this.value)) {
      func(this.value);
    }
  }

  or(fallback: SelectorT<T> | maybe<T> | SelectorT<maybe<T>>): maybe<T> {
    if (isDefined(this.value)) {
      return maybe.from(this.value);
    }

    if (typeof fallback === 'function') {
      const maybeOrValue = fallback();

      return maybeOrValue instanceof maybe
        ? maybeOrValue
        : maybe.from(maybeOrValue);
    } else {
      return fallback;
    }
  }

  toString(): string {
    return isDefined(this.value) ? `${this.value}` : 'No value';
  }

  equals(maybe: maybe<T>): boolean {
    return (
      this.hasValue && maybe.hasValue && this.value == maybe.getValueOrThrow()
    );
  }
}

type Matcher<T, K> = {
  some: SelectorTK<T, K>;
  none: SelectorT<K>;
};
type MatcherNoReturn<T> = {
  some: ActionOfT<T>;
  none: Action;
};
