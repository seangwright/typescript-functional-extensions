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

      test('will return a rejected Promise if the Result is successful and the asyncAction rejects', async () => {
        const sut = Result.success(1);

        const asyncAction = () => {
          return Promise.reject('error');
        };

        const result = await sut.tapAsync(asyncAction).toPromise();

        expect(result).toFailWith('error');
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
