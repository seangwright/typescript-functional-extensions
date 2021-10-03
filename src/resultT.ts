import { IResult } from './iresult';
import { isDefined, isFunction, SelectorT, SelectorTK } from './utilities';

/**
 * Represents an operation that has either succeeded or failed
 * The value produced by failed operation is a string
 * @template TValue The type of value produced by a successful operation
 */
export class ResultT<TValue> implements IResult<TValue, string> {
  static success<TValue>(value: TValue): ResultT<TValue> {
    return new ResultT({ value, isSuccess: true });
  }

  static failure<TValue>(error: string): ResultT<TValue> {
    return new ResultT({ error, isSuccess: false });
  }

  get isSuccess(): boolean {
    return isDefined(this.value);
  }

  get isFailure(): boolean {
    return !this.isSuccess;
  }

  private value: TValue | undefined;
  private error: string | undefined;

  protected constructor({
    value,
    error,
    isSuccess,
  }: {
    value?: TValue;
    error?: string;
    isSuccess: boolean;
  }) {
    if (isDefined(value) && !isSuccess) {
      throw new Error('Value cannot be set for failed ResultT');
    } else if (isDefined(error) && isSuccess) {
      throw new Error('Error cannot be defined for successful ResultT');
    } else if (!isDefined(error) && !isDefined(value)) {
      throw new Error('Value or Error must be defined');
    }

    this.value = value;
    this.error = error;
  }
  failure(error: string): IResult<TValue, string> {
    throw new Error('Method not implemented.');
  }
  success(value: TValue): IResult<TValue, string> {
    throw new Error('Method not implemented.');
  }

  getValueOrDefault(valueOrFactory: string | SelectorT<string>): string {
    if (isDefined(this.error)) {
      return this.error;
    }

    if (isFunction(valueOrFactory)) {
      return valueOrFactory();
    }

    return valueOrFactory;
  }

  getValueOrThrow(): TValue {
    if (isDefined(this.value)) {
      return this.value;
    }

    throw Error('No value');
  }

  map<TNewValue>(selector: SelectorTK<TValue, TNewValue>): ResultT<TNewValue> {
    return isDefined(this.value)
      ? ResultT.success(selector(this.value))
      : ResultT.failure(this.error!);
  }
}
