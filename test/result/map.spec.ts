import { Result } from '@/src/result';

describe('Result', () => {
  describe('map', () => {
    test('will execute the projection with a successful Result', () => {
      const sut = Result.success(1);

      expect(sut.map((num) => num + 1)).toSucceedWith(2);
    });

    test('will not execute the projection with a failed Result', () => {
      const error = 'error';
      let wasCalled = false;
      const sut = Result.failure<number>(error);

      expect(
        sut.map((num) => {
          wasCalled = true;

          return num + 1;
        })
      ).toFailWith(error);
      expect(wasCalled).toBe(false);
    });
  });
});
