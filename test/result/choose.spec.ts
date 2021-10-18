import { Result } from '@/src/result';

describe('Result', () => {
  describe('choose', () => {
    test('will return an empty array when there are no Results', () => {
      const sut: Result[] = [];

      expect(Result.choose(sut)).toHaveLength(0);
    });

    test('will return an array of values from successful Results only', () => {
      const sut = [
        Result.failure<number>('error'),
        Result.success(1),
        Result.success(2),
      ];

      expect(Result.choose(sut)).toEqual([1, 2]);
    });

    test('will return an array of values from successful Result, transformed by given selector function', () => {
      const sut = [1, 2, 3, 4].map((number) => Result.success<number>(number));

      expect(Result.choose(sut, (number) => number.toString())).toEqual([
        '1',
        '2',
        '3',
        '4',
      ]);
    });
  });
});
