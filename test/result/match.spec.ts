import { Result } from '@/src/result';

describe('Result', () => {
  describe('match', () => {
    describe('map', () => {
      test('will execute the success function with a successful Result', () => {
        const sut = Result.success(1);

        const value = sut.match({
          success: (_num) => 10,
          failure: (_e) => -10,
        });

        expect(value).toBe(10);
      });

      test('will execute the failure function with a failed Result', () => {
        const sut = Result.failure<number>('error');

        const value = sut.match({
          success: (num) => 10,
          failure: (_e) => -10,
        });

        expect(value).toBe(-10);
      });
    });

    describe('execute', () => {
      test('will execute the success function with a successful Result', () => {
        const sut = Result.success(1);

        let successWasCalled = false;
        let errorWasCalled = false;

        sut.match({
          success: (_num) => (successWasCalled = true),
          failure: (_e) => (errorWasCalled = true),
        });

        expect(successWasCalled).toBe(true);
        expect(errorWasCalled).toBe(false);
      });

      test('will execute the failure function with a failed Result', () => {
        const sut = Result.failure<number>('error');

        let successWasCalled = false;
        let errorWasCalled = false;

        sut.match({
          success: (_num) => (successWasCalled = true),
          failure: (_e) => (errorWasCalled = true),
        });

        expect(successWasCalled).toBe(false);
        expect(errorWasCalled).toBe(true);
      });
    });
  });
});
