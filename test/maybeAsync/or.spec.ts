import { Maybe } from '@/src/maybe';
import { MaybeAsync } from '@/src/maybeAsync';

describe('MaybeAsync', () => {
  describe('or:value', () => {
    test('will not use the fallback value if there is a value', async () => {
      const value = 1;
      const sut = MaybeAsync.some(value);

      const result = await sut.or(2).toPromise();

      expect(result).toHaveValue(value);
    });

    test('will use the fallback value if there is no value', async () => {
      const value = 1;
      const sut = MaybeAsync.none<number>();

      const result = await sut.or(value).toPromise();

      expect(result).toHaveValue(value);
    });
  });

  describe('or:function:value', () => {
    test('will not use the fallback function if there is a value', async () => {
      const value = 1;
      const sut = MaybeAsync.some(value);

      const result = await sut.or(() => value).toPromise();

      expect(result).toHaveValue(value);
    });

    test('will use the fallback value if there is no value', async () => {
      const value = 1;
      const sut = MaybeAsync.none<number>();

      const result = await sut.or(() => value).toPromise();

      expect(result).toHaveValue(value);
    });
  });

  describe('or:Maybe', () => {
    test('will not use the fallback Maybe value if there is a value', async () => {
      const value = 1;
      const fallbackValue = 2;
      const sut = MaybeAsync.some(value);

      const result = await sut.or(Maybe.some(fallbackValue)).toPromise();

      expect(result).toHaveValue(value);
    });

    test('will use the Maybe value if there is no value', async () => {
      const fallbackValue = 1;
      const sut = MaybeAsync.none<number>();

      const result = await sut.or(Maybe.some(fallbackValue)).toPromise();

      expect(result).toHaveValue(fallbackValue);
    });
  });

  describe('or:function:Maybe', () => {
    test('will not use the fallback Maybe function if there is a value', async () => {
      const value = 1;
      const fallbackValue = 2;
      const sut = MaybeAsync.some(value);

      const result = await sut.or(() => Maybe.some(fallbackValue)).toPromise();

      expect(result).toHaveValue(value);
    });

    test('will use the fallback Maybe function if there is no value', async () => {
      const fallbackValue = 1;
      const sut = MaybeAsync.none<number>();

      const result = await sut.or(() => Maybe.some(fallbackValue)).toPromise();

      expect(result).toHaveValue(fallbackValue);
    });
  });
});
