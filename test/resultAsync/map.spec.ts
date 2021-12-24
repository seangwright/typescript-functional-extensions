import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('map', () => {
    test('calls the projection with a successful ResultAsync', async () => {
      const value = 1;

      const sut = ResultAsync.success(value);

      const result = await sut.map((num) => num + 1).toPromise();

      expect(result).toSucceedWith(2);
    });

    test('does not call the projection with a failed ResultAsync', async () => {
      let wasCalled = false;
      const sut = ResultAsync.failure<number>('error');

      const result = await sut
        .map((num) => {
          wasCalled = true;
          return num + 1;
        })
        .toPromise();

      expect(result).toFailWith('error');
      expect(wasCalled).toBe(false);
    });

    test('calls a Promise returning projection with a successful ResultAsync', async () => {
      const sut = ResultAsync.success(1);

      const result = await sut
        .map((num) => Promise.resolve(num + 1))
        .toPromise();

      expect(result).toSucceedWith(2);
    });
  });
});
