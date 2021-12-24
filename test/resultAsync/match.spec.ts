import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('match', () => {
    describe('map', () => {
      test('will execute the success function with a successful ResultAsync', async () => {
        const sut = ResultAsync.success(1);

        const value = await sut.match({
          success: (_num) => 10,
          failure: (_e) => -10,
        });

        expect(value).toBe(10);
      });

      test('will execute the failure function with a failed ResultAsync', async () => {
        const sut = ResultAsync.failure<number>('error');

        const value = await sut.match({
          success: (num) => 10,
          failure: (_e) => -10,
        });

        expect(value).toBe(-10);
      });
    });

    describe('execute', () => {
      test('will execute the success function with a successful ResultAsync', async () => {
        const sut = ResultAsync.success(1);

        let successWasCalled = false;
        let errorWasCalled = false;

        await sut.match({
          success: (_num) => (successWasCalled = true),
          failure: (_e) => (errorWasCalled = true),
        });

        expect(successWasCalled).toBe(true);
        expect(errorWasCalled).toBe(false);
      });

      test('will execute the failure function with a failed ResultAsync', async () => {
        const sut = ResultAsync.failure<number>('error');

        let successWasCalled = false;
        let errorWasCalled = false;

        await sut.match({
          success: (_num) => (successWasCalled = true),
          failure: (_e) => (errorWasCalled = true),
        });

        expect(successWasCalled).toBe(false);
        expect(errorWasCalled).toBe(true);
      });
    });
  });
});
