import { emptyOrWhiteSpaceStringAsNone } from '@/src/maybe.utilities';

describe('maybeUtilities', () => {
  describe('emptyOrWhiteSpaceStringAsNone', () => {
    test('creates a Maybe with no value with undefined', () => {
      const sut = emptyOrWhiteSpaceStringAsNone(undefined);

      expect(sut).toHaveNoValue();
    });

    test('creates a Maybe with no value with null', () => {
      const sut = emptyOrWhiteSpaceStringAsNone(null);

      expect(sut).toHaveNoValue();
    });

    test('creates a Maybe with no value with empty string', () => {
      const sut = emptyOrWhiteSpaceStringAsNone('');

      expect(sut).toHaveNoValue();
    });

    test('creates a Maybe with no value with a whitespace-only string', () => {
      const sut = emptyOrWhiteSpaceStringAsNone('  \t\r\n  ');

      expect(sut).toHaveNoValue();
    });

    test('throws with a non string value', () => {
      /* @ts-ignore */
      const value: string = 10;
      const sut = () => emptyOrWhiteSpaceStringAsNone(value);

      expect(sut).toThrowError('Value must be a string');
    });

    test('creates a Maybe with a value with a non-empty, non-whitespace string', () => {
      const value = 'apple';
      const sut = emptyOrWhiteSpaceStringAsNone(value);

      expect(sut).toHaveValue(value);
    });
  });
});
