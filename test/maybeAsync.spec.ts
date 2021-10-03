import { MaybeAsync } from '@/src/maybeAsync';

describe('MaybeAsync', () => {
  test('from constructs with a string value', async () => {
    const sut = MaybeAsync.some('val');

    const innerMaybe = await sut.toPromise();

    expect(innerMaybe.hasNoValue).toBe(false);
    expect(innerMaybe.hasValue).toBe(true);
  });

  test('map transforms when there is a value', async () => {
    const sut = MaybeAsync.some('val');

    const innerMaybe = await sut.map((s) => 2).toPromise();

    expect(innerMaybe.getValueOrThrow()).toBe(2);
  });
});
