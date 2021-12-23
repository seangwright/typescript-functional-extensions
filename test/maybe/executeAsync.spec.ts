import { Maybe } from '@/src/maybe';
import { Unit } from '@/src/unit';

describe('Maybe', () => {
  describe('executeAsync', () => {
    test('calls the provided function when the Maybe has a value', async () => {
      const sut = Maybe.some(1);
      let wasCalled = false;

      const result = await sut.executeAsync((_) => {
        wasCalled = true;

        return Promise.resolve();
      });

      expect(wasCalled).toBe(true);
      expect(result).toBe(Unit.Instance);
    });

    test('performs no action when the Maybe has no value', async () => {
      const sut = Maybe.none<number>();
      let wasCalled = false;

      const result = await sut.executeAsync((_) => {
        wasCalled = true;

        return Promise.resolve();
      });

      expect(wasCalled).toBe(false);
      expect(result).toBe(Unit.Instance);
    });
  });
});
