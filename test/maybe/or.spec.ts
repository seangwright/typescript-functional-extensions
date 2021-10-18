import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  describe('or', () => {
    describe('value', () => {
      test('will return a Maybe with the fallback when there is no value', () => {
        const sut = Maybe.none<number>();

        expect(sut.or(1)).toHaveValue(1);
      });

      test('will return a Maybe with the original value when there is a value', () => {
        const value = 1;
        const sut = Maybe.some(value);

        expect(sut.or(100)).toHaveValue(value);
      });
    });

    describe('value factory', () => {
      test('will return a Maybe with the result of the fallback function when there is no value', () => {
        const sut = Maybe.none<number>();

        expect(sut.or(() => 1)).toHaveValue(1);
      });

      test('will return a Maybe with the original value when there is a value', () => {
        const value = 1;
        const sut = Maybe.some(value);

        expect(sut.or(() => 100)).toHaveValue(value);
      });
    });

    describe('maybe', () => {
      test('will return the fallback Maybe when there is no value', () => {
        const sut = Maybe.none<number>();
        const fallback = Maybe.some(1);

        expect(sut.or(fallback)).toBe(fallback);
      });

      test('will return a Maybe with the original value when there is no value', () => {
        const value = 1;
        const sut = Maybe.some(value);
        const fallback = Maybe.some(100);

        expect(sut.or(fallback)).toHaveValue(value);
      });
    });

    describe('maybe factory', () => {
      test('will return the Maybe result of the fallback function when there is no value', () => {
        const sut = Maybe.none<number>();
        const fallback = Maybe.some(1);

        expect(sut.or(() => fallback)).toBe(fallback);
      });

      test('will return a Maybe with the original value when there is no value', () => {
        const value = 1;
        const sut = Maybe.some(value);
        const fallback = Maybe.some(100);

        expect(sut.or(() => fallback)).toHaveValue(value);
      });
    });
  });
});
