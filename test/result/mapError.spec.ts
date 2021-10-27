import { Result } from '@/src/result';

describe('Result', () => {
  describe('mapError', () => {
    test('maps a failed Result error to a new value', () => {
      const error = 'error';
      const sut = Result.failure(error);

      expect(sut.mapError((e) => 1)).toFailWith(1);
    });

    test('does not for a successful Result', () => {
      let wasCalled = false;
      const sut = Result.success(1);

      expect(
        sut.mapError((_) => {
          wasCalled = true;
          return 10;
        })
      ).toSucceedWith(1);
      expect(wasCalled).toBe(false);
    });
  });
});
