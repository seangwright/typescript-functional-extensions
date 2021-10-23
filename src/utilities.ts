export type FunctionOfTtoK<T, K> = (v: T) => K;
export type FunctionOfT<T> = () => Exclude<T, void>;
export type Predicate = () => boolean;
export type PredicateOfT<T> = (v: T) => boolean;
export type ActionOfT<T> = (v: T) => void;
export type AsyncActionOfT<T> = (v: T) => Promise<void>;
export type Action = () => void;
export type AsyncAction = () => Promise<void>;
export type ActionOfTNever<T> = (v: T) => never;
export type ActionNever = () => never;

export const never: ActionNever = () => {
  throw Error('This error should be unreachable');
};

export function isDefined<T>(value: T | undefined): value is Exclude<T, null> {
  return value !== undefined && value !== null;
}
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}
export function isPromise<TValue>(value: unknown): value is Promise<TValue> {
  return value instanceof Promise;
}

export type MaybeMatcher<TValue, TNewValue> = {
  some: FunctionOfTtoK<TValue, TNewValue>;
  none: FunctionOfT<TNewValue>;
};
export type MaybeMatcherNoReturn<TValue> = {
  some: ActionOfT<TValue>;
  none: Action;
};

export type ResultMatcher<TValue, TError, TNewValue> = {
  success: FunctionOfTtoK<TValue, TNewValue>;
  failure: FunctionOfTtoK<TError, TNewValue>;
};

export type ResultMatcherNoReturn<TValue, TError> = {
  success: ActionOfT<TValue>;
  failure: ActionOfT<TError>;
};
