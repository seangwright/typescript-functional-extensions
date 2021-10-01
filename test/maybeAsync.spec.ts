import { maybe } from '@/src/maybe';
import { maybeAsync } from '@/src/maybeAsync';

describe('maybe', () => {
  test('some constructs with a string value', async () => {
    const promise = createPromise('val');

    const sut = maybeAsync.from(promise);

    const maybe = await sut.toPromise();

    expect(maybe.hasNoValue).toBe(false);
    expect(maybe.hasValue).toBe(true);
  });
});

function createPromise<T>(value: T): Promise<maybe<T>> {
  return new Promise((resolve, reject) => {
    resolve(maybe.some(value));
  });
}
