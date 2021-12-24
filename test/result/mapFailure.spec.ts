import { Result } from '@/src/result';

describe('Result', () => {
  describe('mapFailure', () => {
    test('will not execute the projection with a successful Result', () => {
      const sut = Result.success(1);

      expect(sut.mapFailure((_error) => 2)).toSucceedWith(1);
    });

    test('will execute the projection with a failed Result', () => {
      const error = 'error';
      let wasCalled = false;
      const sut = Result.failure<number>(error);

      expect(
        sut.mapFailure((_error) => {
          wasCalled = true;

          return 2;
        })
      ).toSucceedWith(2);
      expect(wasCalled).toBe(true);
    });
  });
});
