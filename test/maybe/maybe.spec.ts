import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  test('some creates a Maybe with a value', () => {
    const value = 'val';
    const sut = Maybe.some(value);

    expect(sut).toHaveValue(value);
  });

  test('none constructs with no value', () => {
    const sut = Maybe.none<string>();

    expect(sut).toHaveNoValue();
  });

  describe('from', () => {
    test('creates a Maybe with a value when supplied a value', () => {
      const value = 'val';
      const sut = Maybe.from(value);

      expect(sut).toHaveValue(value);
    });

    test('creates a Maybe with no value when supplied null', () => {
      const value: string | null = null;
      const sut = Maybe.from<string>(value);

      expect(sut).toHaveNoValue();
    });

    test('creates a Maybe with no value when supplied undefined', () => {
      const sut = Maybe.from<string>(undefined);

      expect(sut).toHaveNoValue();
    });

    test('creates a Maybe with no value when supplied no value', () => {
      const sut = Maybe.from<string>();

      expect(sut).toHaveNoValue();
    });
  });

  describe('hasValue', () => {
    test('is true when the Maybe has a value', () => {
      const sut = Maybe.some(1);

      expect(sut.hasValue).toBe(true);
    });

    test('is false when the Maybe has no value', () => {
      const sut = Maybe.none();

      expect(sut.hasValue).toBe(false);
    });

    test('will never equal hasNoValue', () => {
      const sut = Maybe.some(1);

      expect(sut.hasValue).not.toBe(sut.hasNoValue);
    });
  });

  describe('hasNoValue', () => {
    test('is true when the Maybe has no value', () => {
      const sut = Maybe.none();

      expect(sut.hasNoValue).toBe(true);
    });

    test('is false when the Maybe has a value', () => {
      const sut = Maybe.some(1);

      expect(sut.hasNoValue).toBe(false);
    });

    test('will never equal hasValue', () => {
      const sut = Maybe.none();

      expect(sut.hasNoValue).not.toBe(sut.hasValue);
    });
  });

  describe('getValueOrDefault', () => {
    test('returns the inner value for a Maybe with a value', () => {
      const value = 1;
      const defaultValue = 10;
      const sut = Maybe.some(value);

      expect(sut.getValueOrDefault(defaultValue)).toBe(value);
    });

    test('returns the default value for a Maybe with no value', () => {
      const defaultValue = 10;
      const sut = Maybe.none<number>();

      expect(sut.getValueOrDefault(defaultValue)).toBe(defaultValue);
    });

    test('returns the result of the default value creator for a Maybe with no value', () => {
      const defaultValueCreator = () => 10;
      const sut = Maybe.none<number>();

      expect(sut.getValueOrDefault(defaultValueCreator)).toBe(
        defaultValueCreator()
      );
    });
  });

  describe('getValueOrThrow', () => {
    test('returns the inner value for a Maybe with a value', () => {
      const value = 1;
      const sut = Maybe.some(value);

      expect(sut.getValueOrThrow()).toBe(value);
    });

    test('throw an error for a Maybe with no value', () => {
      const sut = Maybe.none();

      expect(() => sut.getValueOrThrow()).toThrowError('No value');
    });
  });

  describe('toString', () => {
    test('returns a simple string expressing the state of the Maybe', () => {
      const some = Maybe.some(1);
      const none = Maybe.none<number>();

      expect(some.toString()).toBe('Maybe.some');
      expect(none.toString()).toBe('Maybe.none');
    });
  });

  describe('equals', () => {
    test('returns true when each Maybe has the same value', () => {
      expect(Maybe.some(1).equals(Maybe.some(1))).toBe(true);
    });

    test('returns false when each Maybe has a different value', () => {
      expect(Maybe.some(1).equals(Maybe.some(2))).toBe(false);
    });

    test('returns false when both Maybes have no value', () => {
      expect(Maybe.none().equals(Maybe.none())).toBe(false);
    });

    test('returns false when one Maybe has a value and the other has no value', () => {
      expect(Maybe.some(1).equals(Maybe.none())).toBe(false);
    });
  });
});
