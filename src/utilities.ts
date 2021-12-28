export type FunctionOfTtoK<T, K> = (v: T) => K;
export type AsyncFunctionOfTtoK<T, K> = (v: T) => Promise<K>;
export type FunctionOfT<T> = () => T;
export type AsyncFunctionOfT<T> = () => Promise<T>;
export type Predicate = () => boolean;
export type PredicateOfT<T> = (v: T) => boolean;
export type ActionOfT<T> = (v: T) => void;
export type AsyncActionOfT<T> = (v: T) => Promise<void>;
export type Action = () => void;
export type AsyncAction = () => Promise<void>;
export type ActionNever = () => never;
export type Some<T> = T extends None ? never : T;
export type None = null | undefined | void;
export type Known<TValue> = Exclude<unknown, TValue>;

export type ErrorHandler<TError> = FunctionOfTtoK<unknown, Some<TError>>;

export const never: ActionNever = () => {
  throw Error('This error should be unreachable');
};

export function isDefined<T>(value: T | None): value is T {
  return value !== undefined && value !== null;
}
export function isSome<T>(value: Some<T> | None): value is Some<T> {
  return value !== undefined && value !== null;
}
export function isNone<T>(value: Some<T> | None): value is None {
  return !isDefined(value);
}
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}
export function isPromise<TValue>(value: unknown): value is Promise<TValue> {
  return value instanceof Promise;
}

export type MaybeMatcher<TValue, TNewValue> = {
  some: FunctionOfTtoK<TValue, Some<TNewValue>>;
  none: FunctionOfT<Some<TNewValue>>;
};
export type MaybeMatcherNoReturn<TValue> = {
  some: ActionOfT<TValue>;
  none: Action;
};

export type ResultMatcher<TValue, TError, TNewValue> = {
  success: FunctionOfTtoK<TValue, Some<TNewValue>>;
  failure: FunctionOfTtoK<TError, Some<TNewValue>>;
};

export type ResultMatcherNoReturn<TValue, TError> = {
  success: ActionOfT<TValue>;
  failure: ActionOfT<TError>;
};

function identity<T>(x: T): T {
  return x;
}

export function pipeFromArray<T, R>(
  fns: Array<FunctionOfTtoK<T, R>>
): FunctionOfTtoK<T, R> {
  if (fns.length === 0) {
    return identity as FunctionOfTtoK<any, any>;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return function piped(input: T): R {
    return fns.reduce(
      (prev: any, fn: FunctionOfTtoK<T, R>) => fn(prev),
      input as any
    );
  };
}
