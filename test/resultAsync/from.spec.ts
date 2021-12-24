import { Result } from '@/src/result';
import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('from', () => {
    describe('Result', () => {
      test('constructs a successful ResultAsync from a sucessful Result', async () => {
        const value = 1;

        const sut = ResultAsync.from(Result.success(value));

        const result = await sut.toPromise();

        expect(result).toSucceedWith(value);
      });

      test('constructs a failed ResultAsync from a failed Result', async () => {
        const error = 'error';

        const sut = ResultAsync.from(Result.failure(error));

        const result = await sut.toPromise();

        expect(result).toFailWith(error);
      });
    });

    describe('Promise Result', () => {
      test("constructs a successful ResultAsync from a resolved Promise's successful Result value", async () => {
        const number = 1;

        const sut = ResultAsync.from(Promise.resolve(Result.success(number)));

        const result = await sut.toPromise();

        expect(result).toSucceedWith(number);
      });

      test("constructs a failed ResultAsync from a resolved Promise's failed Result value", async () => {
        const error = 'error';
        const sut = ResultAsync.from(
          Promise.resolve(Result.failure<number>(error))
        );

        const innerResult = await sut.toPromise();

        expect(innerResult).toFailWith(error);
      });
    });

    describe('Promise', () => {
      test("constructs a successful ResultAsync from a resolved Promise's value", async () => {
        const number = 1;

        const sut = ResultAsync.from(Promise.resolve(number));

        const result = await sut.toPromise();

        expect(result).toSucceedWith(number);
      });
    });
  });
});
