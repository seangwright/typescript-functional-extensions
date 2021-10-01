import {
  ActionOfT,
  isDefined,
  isFunction,
  never,
  SelectorT,
  SelectorTK,
} from './utilities';

export class result<T, E> {
  static success<T, E>(value: T): result<T, E> {
    return new result({ value });
  }

  static failure<T, E>(error: E): result<T, E> {
    return new result({ error });
  }

  private value: T | undefined;
  private error: E | undefined;

  get isSuccess(): boolean {
    return isDefined(this.value);
  }

  get isFailure(): boolean {
    return !this.isSuccess;
  }

  protected constructor({ value, error }: { value?: T; error?: E }) {
    if (value !== null && value !== undefined) {
      this.value = value;
      this.error = undefined;
    } else if (error !== null && error !== undefined) {
      this.value = undefined;
      this.error = error;
    } else {
      throw new Error('Value or Error must be non-null/undefined');
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

  getErrorOrDefault(createDefault: E | SelectorT<E>): E {
    if (isDefined(this.error)) {
      return this.error;
    }

    if (isFunction(createDefault)) {
      return createDefault();
    }

    return createDefault;
  }

  getErrorOrThrow(): E {
    if (isDefined(this.error)) {
      return this.error;
    }

    throw Error('No error');
  }

  map<U>(selector: SelectorTK<T, U>): result<U, E> {
    return isDefined(this.value)
      ? new result<U, E>({ value: selector(this.value) })
      : new result<U, E>({ error: this.error });
  }

  bind<U>(selector: SelectorTK<T, result<U, E>>): result<U, E> {
    return isDefined(this.value)
      ? selector(this.value)
      : new result<U, E>({ error: this.error });
  }

  tap(action: ActionOfT<T>): result<T, E> {
    if (isDefined(this.value)) {
      action(this.value);
    }

    return this;
  }

  match<U, V>(
    matcher: Matcher<T, E, U, V> | MatcherNoReturn<T, E>
  ): U | V | never {
    if (isDefined(this.value)) {
      return matcher.success(this.value);
    }
    if (isDefined(this.error)) {
      return matcher.error(this.error);
    }

    return never();
  }
}

type Matcher<T, E, U, V> = {
  success: SelectorTK<T, U>;
  error: SelectorTK<E, V>;
};

type MatcherNoReturn<T, E> = {
  success: ActionOfT<T>;
  error: ActionOfT<E>;
};
