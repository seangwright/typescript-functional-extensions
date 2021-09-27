type Selector<T, K> = (v: T) => K;
type Predicate<T> = (v: T) => boolean;

type OptionalSelector<T> = T extends Selector<infer U, infer V> ? V : never;

export class maybe<T> {
  private _hasValue: boolean;
  private value?: T;

  static from<T>(value: T): maybe<T> {
    return new maybe(value);
  }

  static none<T>(): maybe<T> {
    return new maybe();
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
  static choose<T, K>(maybes: maybe<T>[], selector: Selector<T, K>): K[];
  static choose<T, K>(
    maybes: maybe<T>[],
    selector?: Selector<T, K>
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

  get hasValue(): boolean {
    return this._hasValue;
  }

  get hasNoValue(): boolean {
    return !this._hasValue;
  }

  constructor(value?: T) {
    if (value !== undefined && value !== null) {
      this.value = value;
      this._hasValue = true;
    } else {
      this.value = undefined;
      this._hasValue = false;
    }
  }

  getValueOrDefault(createDefault: () => T): T {
    return this.hasValue ? this.value : createDefault();
  }

  getValueOrThrow(): T {
    if (this.hasNoValue) {
      throw Error('No value');
    }

    return this.value;
  }

  map<K>(selector: (value: T) => K): maybe<K> {
    return this.hasNoValue ? maybe.none<K>() : maybe.from(selector(this.value));
  }

  bind<K>(selector: (value: T) => maybe<K>): maybe<K> {
    return this.hasNoValue ? maybe.none<K>() : selector(this.value);
  }

  match<K extends unknown>(matcher: {
    some: (value: T) => K;
    none: () => K;
  }): K {
    return this.hasValue ? matcher.some(this.value) : matcher.none();
  }

  execute(func: (value: T) => void): void {
    if (this.hasValue) {
      func(this.value);
    }
  }

  executeMatch(matcher: { some: (value: T) => void; none: () => void }): void {
    if (this.hasValue) {
      matcher.some(this.value);
    } else {
      matcher.none();
    }
  }

  or(fallback: (() => T) | maybe<T> | (() => maybe<T>)): maybe<T> {
    if (this.hasValue) {
      return maybe.from(this.value);
    }

    if (typeof fallback === 'function') {
      const maybeOrValue = fallback();

      return maybeOrValue instanceof maybe
        ? maybeOrValue
        : maybe.from(maybeOrValue);
    } else {
      return this.hasValue ? maybe.from(this.value) : fallback;
    }
  }

  toString(): string {
    return this.hasValue ? this.value.toString() : 'No value';
  }

  equals(maybe: maybe<T>): boolean {
    return (
      this.hasValue && maybe._hasValue && this.value == maybe.getValueOrThrow()
    );
  }
}
