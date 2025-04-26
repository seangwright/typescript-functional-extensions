import { Result } from '@/src/result';

describe('Result', () => {
  describe('tapFailure', () => {
    test('will execute the action with a failed Result', () => {
      const error = 'error';
      let wasCalled = false;
      const sut = Result.failure(error);

      expect(
        sut.tapFailure((e) => {
          wasCalled = true;
        })
      ).toFailWith(error);
      expect(wasCalled).toBe(true);
    });

    test('will not execute the action with a successful Result', () => {
      let wasCalled = false;
      const sut = Result.success(1);

      expect(
        sut.tapFailure((e) => {
          wasCalled = true;
        })
      ).toSucceedWith(1);
      expect(wasCalled).toBe(false);
    });
  });
});
