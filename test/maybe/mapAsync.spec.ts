import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  describe('mapAsync', () => {
    test('transforms to an Async value when there is a value', async () => {
      const sut = Maybe.some('val');

      const innerMaybe = await sut
        .mapAsync((s) => Promise.resolve(2))
        .toPromise();

      expect(innerMaybe).toHaveValue(2);
    });

    test('transforms to a MaybeAsync with no value when there is no value', async () => {
      const sut = Maybe.none<number>();

      let wasCalled = false;

      const innerMaybe = await sut
        .mapAsync((s) => {
          wasCalled = true;
          return Promise.resolve(s);
        })
        .toPromise();

      expect(innerMaybe).toHaveNoValue();
      expect(wasCalled).toBe(false);
    });
  });
});
