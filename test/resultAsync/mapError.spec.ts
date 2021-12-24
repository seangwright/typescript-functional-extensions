import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('mapError', () => {
    test('calls the projection with a failed ResultAsync', async () => {
      const sut = ResultAsync.failure(1);

      const result = await sut.mapError((error) => `map: ${error}`).toPromise();

      expect(result).toFailWith(`map: 1`);
    });

    test('does not call the projection with a successful ResultAsync', async () => {
      let wasCalled = false;
      const sut = ResultAsync.success<number, number>(1);

      const result = await sut
        .mapError((num) => {
          wasCalled = true;
          return `map: ${num}`;
        })
        .toPromise();

      expect(result).toSucceedWith(1);
      expect(wasCalled).toBe(false);
    });

    test('calls the projection returning a Promise with a failed ResultAsync', async () => {
      let wasCalled = false;
      const sut = ResultAsync.failure(1);

      const result = await sut
        .mapError((num) => {
          wasCalled = true;
          return Promise.resolve(`map: ${num}`);
        })
        .toPromise();

      expect(result).toFailWith('map: 1');
      expect(wasCalled).toBe(true);
    });
  });
});
