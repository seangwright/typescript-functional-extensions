import { MaybeAsync } from '@/src/maybeAsync';

describe('MaybeAsync', () => {
  describe('bindAsync', () => {
    test('transforms to a new MaybeAsync when there is a value', async () => {
      const value = 2;
      const sut = MaybeAsync.some('val');

      const innerMaybe = await sut
        .bindAsync((s) => MaybeAsync.some(value))
        .toPromise();

      expect(innerMaybe.getValueOrThrow()).toBe(2);
    });

    test('does nothing when there is no value', async () => {
      const sut = MaybeAsync.none<number>();

      let wasCalled = false;

      const innerMaybe = await sut
        .bindAsync((s) => {
          wasCalled = true;
          return MaybeAsync.some(1);
        })
        .toPromise();

      expect(innerMaybe).toHaveNoValue();
      expect(wasCalled).toBe(false);
    });
  });
});
