import { maybe } from '@/src/maybe';

describe('maybe', () => {
  test('some constructs with a string value', () => {
    const sut = maybe.some('val');

    expect(sut.hasNoValue).toBe(false);
    expect(sut.hasValue).toBe(true);
  });

  test('none constructs with no string value', () => {
    const sut = maybe.none<string>();

    expect(sut.hasNoValue).toBe(true);
    expect(sut.hasValue).toBe(false);
  });

  describe('from', () => {
    test('constructs with a string value', () => {
      const sut = maybe.from('val');

      expect(sut.hasNoValue).toBe(false);
      expect(sut.hasValue).toBe(true);
    });

    test('constructs with undefined', () => {
      const sut = maybe.from<string>(undefined);

      expect(sut.hasNoValue).toBe(true);
      expect(sut.hasValue).toBe(false);
    });
  });
});
