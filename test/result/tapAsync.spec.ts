import { Result } from '@/src/result';

describe('Result', () => {
  describe('tapAsync', () => {
    describe('promise', () => {
      test('will execute the asynchronous action if the Result is successful', async () => {
        let wasCalled = false;
        const sut = Result.success(1);

        const asyncAction = () => {
          wasCalled = true;
          return Promise.resolve();
        };

        await sut.tapAsync(asyncAction).toPromise();

        expect(wasCalled).toBe(true);
      });

      test('will not execute the asynchronous action if the Result is a failure', async () => {
        let wasCalled = false;
        const sut = Result.failure<number>('error');

        const asyncAction = () => {
          wasCalled = true;
          return Promise.resolve();
        };

        await sut.tapAsync(asyncAction).toPromise();

        expect(wasCalled).toBe(false);
      });
    });
  });
});
