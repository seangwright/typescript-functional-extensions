import { Maybe } from './maybe';
import { MaybeAsync } from './maybeAsync';
import {
  Action,
  ActionOfT,
  AsyncAction,
  AsyncActionOfT,
  FunctionOfTtoK,
  Some,
} from './utilities';

export type MaybeOpFn<A, B> = FunctionOfTtoK<Maybe<A>, Maybe<B>>;
export type MaybeOpFnAsync<A, B> = FunctionOfTtoK<Maybe<A>, MaybeAsync<B>>;

export function map<TValue, TNewValue>(
  projection: FunctionOfTtoK<TValue, Some<TNewValue>>
): MaybeOpFn<TValue, TNewValue> {
  return (maybe) => {
    return maybe.hasValue
      ? Maybe.some(projection(maybe.getValueOrThrow()))
      : Maybe.none<TNewValue>();
  };
}

export function mapAsync<TValue, TNewValue>(
  projection: FunctionOfTtoK<TValue, Promise<Some<TNewValue>>>
): MaybeOpFnAsync<TValue, TNewValue> {
  return (maybe) => {
    return maybe.hasValue
      ? MaybeAsync.from(projection(maybe.getValueOrThrow()))
      : MaybeAsync.none();
  };
}

export function tap<TValue>(
  action: ActionOfT<TValue>
): MaybeOpFn<TValue, TValue> {
  return (maybe) => {
    if (maybe.hasValue) {
      action(maybe.getValueOrThrow());
    }

    return maybe;
  };
}

export function tapAsync<TValue>(
  asyncAction: AsyncActionOfT<TValue>
): MaybeOpFnAsync<TValue, TValue> {
  return (maybe) => {
    if (maybe.hasNoValue) {
      return MaybeAsync.none();
    }

    const promise = new Promise<Some<TValue>>((resolve) => {
      const value = maybe.getValueOrThrow();
      asyncAction(value).then(() => resolve(value));
    });

    return MaybeAsync.from(promise);
  };
}

export function tapNone<TValue>(action: Action): MaybeOpFn<TValue, TValue> {
  return (maybe) => {
    if (maybe.hasNoValue) {
      action();
    }

    return maybe;
  };
}

export function tapNoneAsync<TValue>(
  action: AsyncAction
): MaybeOpFnAsync<TValue, TValue> {
  return (maybe) => {
    if (maybe.hasValue) {
      return MaybeAsync.some(maybe.getValueOrThrow());
    }

    return MaybeAsync.from(action().then(() => Maybe.none<TValue>()));
  };
}

export function bind<TValue, TNewValue>(
  projection: FunctionOfTtoK<TValue, Maybe<Some<TNewValue>>>
): MaybeOpFn<TValue, TNewValue> {
  return (maybe) => {
    return maybe.hasValue ? projection(maybe.getValueOrThrow()) : Maybe.none();
  };
}

export function bindAsync<TValue, TNewValue>(
  projection: FunctionOfTtoK<TValue, MaybeAsync<Some<TNewValue>>>
): MaybeOpFnAsync<TValue, TNewValue> {
  return (maybe) => {
    return maybe.hasValue
      ? projection(maybe.getValueOrThrow())
      : MaybeAsync.none();
  };
}
