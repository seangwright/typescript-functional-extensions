import { MaybeAsync } from '@/src/maybeAsync';

describe('MaybeAsync', () => {
  describe('map', () => {
    test('transforms when there is a value', async () => {
      const sut = MaybeAsync.some('val');

      const innerMaybe = await sut.map((s) => 2).toPromise();

      expect(innerMaybe.getValueOrThrow()).toBe(2);
    });

    test('does nothing when there is no value', async () => {
      const sut = MaybeAsync.none<number>();

      let wasCalled = false;

      const innerMaybe = await sut
        .map((s) => {
          wasCalled = true;
          return 2 * s;
        })
        .toPromise();

      expect(innerMaybe).toHaveNoValue();
      expect(wasCalled).toBe(false);
    });
  });
});
