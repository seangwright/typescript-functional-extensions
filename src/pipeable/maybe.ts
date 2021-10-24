import {
  FunctionOfT,
  FunctionOfTtoK,
  isDefined,
  isFunction,
} from '../utilities';
import { identity, UnaryFunction } from './pipe';

interface OperatorFunction<T, R> extends UnaryFunction<Maybe<T>, Maybe<R>> {}

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

  private value: TValue | undefined;

  /**
   * Returns true if the Maybe contains a value
   */
  get hasValue(): boolean {
    return isDefined(this.value);
  }

  /**
   * Returns true if the Maybe has no value
   */
  get hasNoValue(): boolean {
    return !this.hasValue;
  }

  protected constructor(value?: TValue | null) {
    this.value = isDefined(value) ? value : undefined;
  }

  /**
   * Returns the value of the Maybe if it has one,
   * and the default value if there is none
   * @param defaultValue
   */
  getValueOrDefault(defaultValue: TValue): TValue;
  /**
   * Returns the value of the Maybe if it has one,
   * and returns the result of the factory function if
   * there is none
   * @param factory
   */
  getValueOrDefault(factory: FunctionOfT<TValue>): TValue;
  getValueOrDefault(
    defaultValueOrFactory: TValue | FunctionOfT<TValue>
  ): TValue {
    if (isDefined(this.value)) {
      return this.value;
    }

    if (isFunction(defaultValueOrFactory)) {
      return defaultValueOrFactory();
    }

    return defaultValueOrFactory;
  }

  /**
   * Returns the value of the Maybe and throws
   * and Error if there is none
   * @returns
   */
  getValueOrThrow(): TValue {
    if (isDefined(this.value)) {
      return this.value;
    }

    throw Error('No value');
  }
  pipe(): Maybe<TValue>;
  pipe<A>(fn1: OperatorFunction<TValue, A>): Maybe<A>;
  pipe<A, B>(
    fn1: OperatorFunction<TValue, A>,
    fn2: OperatorFunction<A, B>
  ): Maybe<B>;
  pipe<A, B, C>(
    fn1: OperatorFunction<TValue, A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>
  ): Maybe<C>;
  pipe<A, B, C, D>(
    fn1: OperatorFunction<TValue, A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>
  ): Maybe<D>;
  pipe<A, B, C, D, E>(
    fn1: OperatorFunction<TValue, A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>,
    fn5: OperatorFunction<D, E>
  ): Maybe<E>;
  pipe<A, B, C, D, E, F>(
    fn1: OperatorFunction<TValue, A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>,
    fn5: OperatorFunction<D, E>,
    fn6: OperatorFunction<E, F>
  ): Maybe<F>;
  pipe<A, B, C, D, E, F, G>(
    fn1: OperatorFunction<TValue, A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>,
    fn5: OperatorFunction<D, E>,
    fn6: OperatorFunction<E, F>,
    fn7: OperatorFunction<F, G>
  ): Maybe<G>;
  pipe<A, B, C, D, E, F, G, H>(
    fn1: OperatorFunction<TValue, A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>,
    fn5: OperatorFunction<D, E>,
    fn6: OperatorFunction<E, F>,
    fn7: OperatorFunction<F, G>,
    fn8: OperatorFunction<G, H>
  ): Maybe<H>;
  pipe<A, B, C, D, E, F, G, H, I>(
    fn1: OperatorFunction<TValue, A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>,
    fn5: OperatorFunction<D, E>,
    fn6: OperatorFunction<E, F>,
    fn7: OperatorFunction<F, G>,
    fn8: OperatorFunction<G, H>,
    fn9: OperatorFunction<H, I>
  ): Maybe<I>;
  pipe<A, B, C, D, E, F, G, H, I>(
    fn1: OperatorFunction<TValue, A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>,
    fn5: OperatorFunction<D, E>,
    fn6: OperatorFunction<E, F>,
    fn7: OperatorFunction<F, G>,
    fn8: OperatorFunction<G, H>,
    fn9: OperatorFunction<H, I>,
    ...fns: OperatorFunction<any, any>[]
  ): Maybe<unknown>;

  pipe(...fns: Array<OperatorFunction<any, any>>): Maybe<any> {
    return pipeFromArray(fns)(this);
  }
}

export function pipeFromArray<T, R>(
  fns: Array<UnaryFunction<T, R>>
): UnaryFunction<T, R> {
  if (fns.length === 0) {
    return identity as UnaryFunction<any, any>;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return function piped(input: T): R {
    return fns.reduce(
      (prev: any, fn: UnaryFunction<T, R>) => fn(prev),
      input as any
    );
  };
}

export function from<TValue>(value: TValue | undefined | null): Maybe<TValue> {
  return isDefined(value) ? Maybe.some(value) : Maybe.none();
}

export function map<TValue, TNewValue>(
  mapper: FunctionOfTtoK<TValue, TNewValue>
): OperatorFunction<TValue, TNewValue> {
  return (maybe) => {
    if (maybe.hasNoValue) {
      return Maybe.none();
    }

    return Maybe.some(mapper(maybe.getValueOrThrow()));
  };
}
