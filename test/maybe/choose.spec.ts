import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  describe('choose', () => {
    test('creates an empty array if no Maybes have values', () => {
      const items = [Maybe.none(), Maybe.none(), Maybe.none()];

      const sut = Maybe.choose(items);

      expect(sut).toHaveLength(0);
    });

    test('creates an array of values from all Maybes with values', () => {
      const items = [Maybe.none<number>(), Maybe.some(1), Maybe.some(2)];

      const sut = Maybe.choose(items);

      expect(sut).toEqual([1, 2]);
    });

    test('creates an array of values created from the ', () => {
      const items = [Maybe.none<number>(), Maybe.some(1), Maybe.some(2)];

      const sut = Maybe.choose(items, (i) => i.toString());

      expect(sut).toEqual(['1', '2']);
    });
  });
});
