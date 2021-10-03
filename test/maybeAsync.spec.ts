import { Maybe } from '@/src/maybe';
import { MaybeAsync } from '@/src/maybeAsync';

describe('MaybeAsync', () => {
  test('from constructs with a string value', async () => {
    const promise = createPromise({ value: Maybe.some('val') });

    const sut = MaybeAsync.from(promise);

    const innerMaybe = await sut.toPromise();

    expect(innerMaybe.hasNoValue).toBe(false);
    expect(innerMaybe.hasValue).toBe(true);
  });

  test('map transforms when there is a value', async () => {
    const promise = createPromise({ value: Maybe.some('val') });

    const sut = MaybeAsync.from(promise);

    const innerMaybe = await sut.map((s) => 2).toPromise();

    expect(innerMaybe.getValueOrThrow()).toBe(2);
  });
});

function createPromise<T>({
  value,
  error,
}: {
  value?: T;
  error?: string;
}): Promise<T> {
  return new Promise((resolve, reject) => {
    if (value) {
      resolve(value);
    } else if (error) {
      reject(error);
    }
  });
}
