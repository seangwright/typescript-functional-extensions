import { zeroAsNone } from '@/src/maybe.utilities';

describe('maybeUtilities', () => {
  describe('zeroAsNone', () => {
    test('creates a Maybe with no value with undefined', () => {
      const sut = zeroAsNone(undefined);

      expect(sut).toHaveNoValue();
    });

    test('creates a Maybe with no value with null', () => {
      const sut = zeroAsNone(null);

      expect(sut).toHaveNoValue();
    });

    test('creates a Maybe with no value with zero value', () => {
      const sut = zeroAsNone(0);

      expect(sut).toHaveNoValue();
    });

    test('throws with a non number value', () => {
      /* @ts-ignore */
      const value: number = 'test';
      const sut = () => zeroAsNone(value);

      expect(sut).toThrowError('Value must be a number');
    });

    test('creates a Maybe with a value with a positive number', () => {
      const value = 20000;
      const sut = zeroAsNone(value);

      expect(sut).toHaveValue(value);
    });

    test('creates a Maybe with a value with a negative number', () => {
      const value = -2001;
      const sut = zeroAsNone(value);

      expect(sut).toHaveValue(value);
    });
  });
});
