import { Result } from '@/src/result';
import { ResultAsync } from '@/src/resultAsync';
import { Unit } from '@/src/unit';

describe('ResultAsync', () => {
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

  test('from creates a failed result if the Promise rejects', async () => {
    const sut = ResultAsync.from(Promise.reject('failure'));

    const result = await sut.toPromise();

    expect(result.isFailure).toBe(true);
    expect(result.getErrorOrThrow()).toBe('failure');
  });

  test('from creates a successful result if the Promise resolves', async () => {
    const value = { email: 'test@test.com' };
    const sut = ResultAsync.from(Promise.resolve(value));

    const result = await sut.toPromise();

    expect(result).toSucceedWith(value);
  });

  test('bindAsync to a failed ResultAsync will return a failed Result', async () => {
    const sut = Result.success();

    const resultAsync = ResultAsync.from<Unit, string>(Promise.reject('error'));

    const newResult = await sut.bindAsync(() => resultAsync).toPromise();

    expect(newResult.isSuccess).toBe(false);
    expect(newResult.getErrorOrThrow()).toBe('error');
  });
});
