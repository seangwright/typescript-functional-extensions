import { Maybe } from '@/src/maybe';
import { map as asyncMap } from '@/src/maybeAsyncFns';
import { map, mapAsync, tap } from '@/src/maybeFns';

describe('Maybe', () => {
  describe('pipe', () => {
    test('executes all operator functions', () => {
      const sut = Maybe.some(1);

      const maybe = sut.pipe(
        map((n) => n + 1),
        map((n) => n * 2),
        map((n) => `Calculation: ${n}`)
      );

      expect(sut).toHaveValue(1);
      expect(maybe).toHaveValue('Calculation: 4');
    });

    test('handles side-effect operator functions', () => {
      let callCount = 0;

      const sut = Maybe.some(1);

      const maybe = sut.pipe(
        tap((n) => callCount++),
        tap((n) => callCount++),
        tap((n) => callCount++),
        tap((n) => callCount++)
      );

      expect(maybe).toHaveValue(1);
      expect(callCount).toBe(4);
    });

    test('handles transitioning to a MaybeAsync', async () => {
      const sut = Maybe.some(1);

      const maybe = await sut
        .pipe(
          map((n) => n + 1),
          mapAsync((n) => Promise.resolve(n * 2))
        )
        .pipe(asyncMap((n) => n + 3))
        .toPromise();

      expect(maybe).toHaveValue(7);
    });
  });
});
