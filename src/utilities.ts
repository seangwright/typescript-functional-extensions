export type SelectorTK<T, K> = (v: T) => K;
export type SelectorT<T> = () => T;
export type Predicate<T> = (v: T) => boolean;
export type ActionOfT<T> = (v: T) => never;
export type Action = () => never;

export const never: Action = () => {
  throw Error('This error should be unreachable');
};

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}
export function isPromise<TValue>(value: unknown): value is Promise<TValue> {
  return value instanceof Promise;
}

export type MaybeMatcher<TValue, TNewValue> = {
  some: SelectorTK<TValue, TNewValue>;
  none: SelectorT<TNewValue>;
};
export type MaybeMatcherNoReturn<TValue> = {
  some: ActionOfT<TValue>;
  none: Action;
};

export type ResultMatcher<TValue, TError, TNewValue> = {
  success: SelectorTK<TValue, TNewValue>;
  error: SelectorTK<TError, TNewValue>;
};

export type ResultMatcherNoReturn<T, E> = {
  success: ActionOfT<T>;
  error: ActionOfT<E>;
};
