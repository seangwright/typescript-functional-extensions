import { Result } from '@/src/result';
import { ResultAsync } from '@/src/resultAsync';

describe('Result', () => {
  describe('bindAsync', () => {
    describe('promise', () => {
      test('will call the projection function when the original Result succeeds', async () => {
        const sut = Result.success(1);

        const result = await sut
          .bindAsync((number) => Promise.resolve(Result.success(1 + number)))
          .toPromise();

        expect(result).toSucceedWith(2);
      });

      test('will not call the projection function when the original Result fails', async () => {
        const error = 'error';
        let wasCalled = false;
        const sut = Result.failure<number>(error);

        const result = await sut
          .bindAsync((number) => {
            wasCalled = true;
            return Promise.resolve(Result.success(1 + number));
          })
          .toPromise();

        expect(result).toFailWith(error);
        expect(wasCalled).toBe(false);
      });
    });

    describe('ResultAsync', () => {
      test('will call the projection function when the original Result succeeds', async () => {
        const sut = Result.success(1);

        const result = await sut
          .bindAsync((number) => ResultAsync.success(1 + number))
          .toPromise();

        expect(result).toSucceedWith(2);
      });

      test('will not call the projection function when the original Result fails', async () => {
        const error = 'error';
        let wasCalled = false;
        const sut = Result.failure<number>(error);

        const result = await sut
          .bindAsync((number) => {
            wasCalled = true;
            return ResultAsync.success(1 + number);
          })
          .toPromise();

        expect(result).toFailWith(error);
        expect(wasCalled).toBe(false);
      });
    });
  });
});
