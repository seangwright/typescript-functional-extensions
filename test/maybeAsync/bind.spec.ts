import { Maybe } from '@/src/maybe';
import { MaybeAsync } from '@/src/maybeAsync';

describe('MaybeAsync', () => {
  describe('bind', () => {
    describe('Maybe', () => {
      test('transforms to a new MaybeAsync when there is a value', async () => {
        const value = 2;
        const sut = MaybeAsync.some('val');

        const innerMaybe = await sut.bind((s) => Maybe.some(value)).toPromise();

        expect(innerMaybe.getValueOrThrow()).toBe(2);
      });

      test('does nothing when there is no value', async () => {
        const sut = MaybeAsync.none<number>();

        let wasCalled = false;

        const innerMaybe = await sut
          .bind((s) => {
            wasCalled = true;
            return Maybe.from(1);
          })
          .toPromise();

        expect(innerMaybe).toHaveNoValue();
        expect(wasCalled).toBe(false);
      });
    });

    describe('MaybeAsync', () => {
      test('transforms to a new MaybeAsync when there is a value', async () => {
        const value = 2;
        const sut = MaybeAsync.some('val');

        const innerMaybe = await sut
          .bind((s) => MaybeAsync.some(value))
          .toPromise();

        expect(innerMaybe.getValueOrThrow()).toBe(2);
      });

      test('does nothing when there is no value', async () => {
        const sut = MaybeAsync.none<number>();

        let wasCalled = false;

        const innerMaybe = await sut
          .bind((s) => {
            wasCalled = true;
            return MaybeAsync.some(1);
          })
          .toPromise();

        expect(innerMaybe).toHaveNoValue();
        expect(wasCalled).toBe(false);
      });
    });
  });
});
