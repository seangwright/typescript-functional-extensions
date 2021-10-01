import { maybe } from './maybe';
import { SelectorTK } from './utilities';

export class maybeAsync<T> {
  static from<T>(promise: Promise<maybe<T>>): maybeAsync<T> {
    return new maybeAsync(promise);
  }

  private value: Promise<maybe<T>>;

  protected constructor(value: Promise<maybe<T>>) {
    this.value = value;
  }

  map<K>(selector: SelectorTK<T, K>): maybeAsync<K> {
    return new maybeAsync(
      this.value.then((m) =>
        m.hasValue ? maybe.some(selector(m.getValueOrThrow())) : maybe.none<K>()
      )
    );
  }

  async toPromise(): Promise<maybe<T>> {
    return this.value;
  }
}
