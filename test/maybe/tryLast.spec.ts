import { Maybe } from '@/src/maybe';
describe('Maybe', () => {
  describe('tryLast', () => {
    test('creates a Maybe with a value when the array has a value', () => {
      const items = [1, 2, 3];

      const sut = Maybe.tryLast(items);

      expect(sut).toHaveValue(items[2]);
    });

    test('creates a Maybe with no value when the array is empty', () => {
      const items: number[] = [];

      const sut = Maybe.tryLast(items);

      expect(sut).toHaveNoValue();
    });

    test('creates a Maybe with the last value which matches the predicate', () => {
      const items = [1, 2, 3, 4];

      const sut = Maybe.tryLast(items, (i) => i > 2);

      expect(sut).toHaveValue(4);
    });

    test('creates a Maybe with no value when the predicate has no matches', () => {
      const items = [1, 2, 3, 4];

      const sut = Maybe.tryLast(items, (i) => i > 10);

      expect(sut).toHaveNoValue();
    });
  });
});
