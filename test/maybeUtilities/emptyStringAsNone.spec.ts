import { emptyStringAsNone } from '@/src/maybe.utilities';

describe('maybeUtilities', () => {
  describe('emptyStringAsNone', () => {
    test('creates a Maybe with no value with undefined', () => {
      const sut = emptyStringAsNone(undefined);

      expect(sut).toHaveNoValue();
    });

    test('creates a Maybe with no value with null', () => {
      const sut = emptyStringAsNone(null);

      expect(sut).toHaveNoValue();
    });

    test('creates a Maybe with no value with empty string', () => {
      const sut = emptyStringAsNone('');

      expect(sut).toHaveNoValue();
    });

    test('throws with a non string value', () => {
      /* @ts-ignore */
      const value: string = 10;
      const sut = () => emptyStringAsNone(value);

      expect(sut).toThrowError('Value must be a string');
    });

    test('creates a Maybe with a value with a whitespace string', () => {
      const value = '  \t';
      const sut = emptyStringAsNone(value);

      expect(sut).toHaveValue(value);
    });

    test('creates a Maybe with a value with a non-empty, non-whitespace string', () => {
      const value = 'apple';
      const sut = emptyStringAsNone(value);

      expect(sut).toHaveValue(value);
    });
  });
});
