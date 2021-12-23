import { MaybeAsync } from '@/src/maybeAsync';

describe('MaybeAsync', () => {
  describe('tap', () => {
    test('executes the action when there is a value', async () => {
      const sut = MaybeAsync.some('val');
      let wasCalled = false;

      const innerMaybe = await sut
        .tap((s) => {
          wasCalled = true;
        })
        .toPromise();

      expect(innerMaybe).toHaveValue('val');
      expect(wasCalled).toBe(true);
    });

    test('does nothing when there is no value', async () => {
      const sut = MaybeAsync.none<number>();

      let wasCalled = false;

      const innerMaybe = await sut
        .tap((_s) => {
          wasCalled = true;
        })
        .toPromise();

      expect(innerMaybe).toHaveNoValue();
      expect(wasCalled).toBe(false);
    });
  });
});
