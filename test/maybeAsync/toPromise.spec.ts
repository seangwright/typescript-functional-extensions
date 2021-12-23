import { MaybeAsync } from '@/src/maybeAsync';

describe('MaybeAsync', () => {
  describe('toPromise', () => {
    test('returns a Maybe with a value when there is a value', async () => {
      const sut = MaybeAsync.some(1);

      const innerMaybe = await sut.toPromise();

      expect(innerMaybe).toHaveValue(1);
    });

    test('returns a Maybe with no value when there is no value', async () => {
      const sut = MaybeAsync.none<number>();

      const innerMaybe = await sut.toPromise();

      expect(innerMaybe).toHaveNoValue();
    });
  });
});
