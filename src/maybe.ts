import { Result } from './result';
import { ResultE } from './resultE';
import {
  isResult,
  isResultE,
  isResultT,
  isResultTE,
  ResultEType,
  Results,
  ResultTEType,
  ResultTType,
  ResultType,
} from './results';
import { ResultT } from './resultT';
import { ResultTE } from './resultTE';
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
    return isDefined(this.value)
      ? Maybe.from(selector(this.value))
      : Maybe.none<TNewValue>();
  }

  bind<TNewValue>(
    selector: SelectorTK<TValue, Maybe<TNewValue>>
  ): Maybe<TNewValue> {
    return isDefined(this.value)
      ? selector(this.value)
      : Maybe.none<TNewValue>();
  }

  match<TNewValue>(
    matcher: Matcher<TValue, TNewValue> | MatcherNoReturn<TValue>
  ): TNewValue | never {
    return isDefined(this.value) ? matcher.some(this.value) : matcher.none();
  }

  execute(func: ActionOfT<TValue>): void {
    if (isDefined(this.value)) {
      func(this.value);
    }
  }

  or(
    fallback: SelectorT<TValue> | Maybe<TValue> | SelectorT<Maybe<TValue>>
  ): Maybe<TValue> {
    if (isDefined(this.value)) {
      return Maybe.from(this.value);
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

  toResult<TResult extends Result>(error: string, type: ResultType): TResult;
  toResult<TResult extends ResultT<TValue>>(
    error: string,
    type: ResultTType
  ): TResult;
  toResult<TResult extends ResultE<TError>, TError>(
    error: TError,
    type: ResultEType
  ): TResult;
  toResult<TResult extends ResultTE<TValue, TError>, TError>(
    error: TError,
    type: ResultTEType
  ): TResult;

  toResult<
    TResult extends
      | Result
      | ResultT<TValue>
      | ResultE<TError>
      | ResultTE<TValue, TError>,
    TError
  >(error: string | TError, type: Results): TResult {
    if (isResult(type) && typeof error === 'string') {
      return isDefined(this.value)
        ? (type.success() as TResult)
        : (type.failure(error) as TResult);
    } else if (isResultE<TError>(type) && typeof error !== 'string') {
      return isDefined(this.value)
        ? (type.success() as TResult)
        : (type.failure(error) as TResult);
    } else if (isResultT(type) && typeof error === 'string') {
      return isDefined(this.value)
        ? (type.success(this.value) as TResult)
        : (type.failure(error) as TResult);
    } else if (isResultTE(type) && typeof error !== 'string') {
      return isDefined(this.value)
        ? (type.success(this.value) as TResult)
        : (type.failure(error) as TResult);
    }

    throw new Error('Invalid parameters. Result and error types must match');
  }

  toResultT(error: string): ResultT<TValue> {
    return isDefined(this.value)
      ? ResultT.success(this.value)
      : ResultT.failure(error);
  }

  toResultE<TError>(error: TError): ResultE<TError> {
    return isDefined(this.value) ? ResultE.success() : ResultE.failure(error);
  }

  toResultTE<TError>(error: TError): ResultTE<TValue, TError> {
    return isDefined(this.value)
      ? ResultTE.success(this.value)
      : ResultTE.failure(error);
  }

  toString(): string {
    return isDefined(this.value) ? `${this.value}` : 'No value';
  }

  equals(maybe: Maybe<TValue>): boolean {
    return (
      this.hasValue && maybe.hasValue && this.value == maybe.getValueOrThrow()
    );
  }
}

export type Matcher<TValue, TNewValue> = {
  some: SelectorTK<TValue, TNewValue>;
  none: SelectorT<TNewValue>;
};
export type MatcherNoReturn<TValue> = {
  some: ActionOfT<TValue>;
  none: Action;
};
