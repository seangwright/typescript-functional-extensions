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
      test("constructs a successful ResultAsync from a resolved Promise's Result value", async () => {
        const number = 1;

        const sut = ResultAsync.from(
          Promise.resolve(Result.success(number)),
          (e) => 'caught'
        );

        const result = await sut.toPromise();

        expect(result).toSucceedWith(number);
      });

      test("constructs a failed ResultAsync from a resolved Promise's failed Result value", async () => {
        const error = 'error';
        const sut = ResultAsync.from(
          Promise.resolve(Result.failure<number>(error)),
          (e) => 'caught'
        );

        const innerResult = await sut.toPromise();

        expect(innerResult).toFailWith(error);
      });

      test("constructs a failed ResultAsync from a rejected Promise's error", async () => {
        const error = 'caught';
        const sut = ResultAsync.from(
          Promise.reject<Result<number, string>>('error'),
          (e) => error
        );

        const innerResult = await sut.toPromise();

        expect(innerResult).toFailWith(error);
      });
    });

    describe('Promise', () => {
      test("constructs a successful ResultAsync from a resolved Promise's value", async () => {
        const number = 1;

        const sut = ResultAsync.from(Promise.resolve(number), (e) => 'caught');

        const result = await sut.toPromise();

        expect(result).toSucceedWith(number);
      });

      test("constructs a failed ResultAsync from a rejected Promise's error", async () => {
        const error = 'caught';
        const sut = ResultAsync.from<number, string>(
          Promise.reject<number>('error'),
          (e) => error
        );

        const innerResult = await sut.toPromise();

        expect(innerResult).toFailWith(error);
      });
    });
  });

  test('success creates a successful Result', async () => {
    const sut = ResultAsync.success(1);

    const result = await sut.toPromise();

    expect(result.isSuccess).toBe(true);

    expect(result.getValueOrThrow()).toBe(1);
  });

  test('failure creates a failed Result', async () => {
    const error = { message: 'A problem' };
    const sut = ResultAsync.failure(error);

    const result = await sut.toPromise();

    expect(result.isFailure).toBe(true);

    expect(result.getErrorOrThrow()).toBe(error);
  });
});
