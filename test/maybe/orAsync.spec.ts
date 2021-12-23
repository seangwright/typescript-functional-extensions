import { Maybe } from '@/src/maybe';
import { MaybeAsync } from '@/src/maybeAsync';

describe('Maybe', () => {
  describe('orAsync', () => {
    describe('async value', () => {
      test('will return a Maybe with the fallback when there is no value', async () => {
        const sut = Maybe.none<number>();

        const innerMaybe = await sut.orAsync(Promise.resolve(1)).toPromise();

        expect(innerMaybe).toHaveValue(1);
      });

      test('will return a Maybe with the original value when there is a value', async () => {
        const value = 1;
        const sut = Maybe.some(value);

        const innerMaybe = await sut.orAsync(Promise.resolve(100)).toPromise();

        expect(innerMaybe).toHaveValue(value);
      });
    });

    describe('async value factory', () => {
      test('will return a Maybe with the result of the fallback function when there is no value', async () => {
        const sut = Maybe.none<number>();

        const innerMaybe = await sut
          .orAsync(() => Promise.resolve(1))
          .toPromise();

        expect(innerMaybe).toHaveValue(1);
      });

      test('will return a Maybe with the original value when there is a value', async () => {
        const value = 1;
        const sut = Maybe.some(value);

        const innerMaybe = await sut
          .orAsync(() => Promise.resolve(100))
          .toPromise();

        expect(innerMaybe).toHaveValue(value);
      });
    });

    describe('maybeAsync', () => {
      test('will return the fallback MaybeAsync when there is no value', async () => {
        const sut = Maybe.none<number>();
        const fallback = MaybeAsync.some(1);

        const innerMaybe = await sut.orAsync(fallback).toPromise();

        expect(innerMaybe).toHaveValue(1);
      });

      test('will return a Maybe with the original value when there is no value', async () => {
        const value = 1;
        const sut = Maybe.some(value);
        const fallback = MaybeAsync.some(100);

        const innerMaybe = await sut.orAsync(fallback).toPromise();

        expect(innerMaybe).toHaveValue(value);
      });
    });
  });
});
