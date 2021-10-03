import { Result } from '@/src/result';
import { ResultAsync } from '@/src/resultAsync';

describe('Result', () => {
  test('success constructs with a successful state', () => {
    const sut = Result.success();

    expect(sut.isFailure).toBe(false);
    expect(sut.isSuccess).toBe(true);
  });

  test('none constructs with no string value', () => {
    const sut = Result.failure('error!');

    expect(sut.isFailure).toBe(true);
    expect(sut.getErrorOrThrow()).toBe('error!');
  });

  test('bind maps one result to another', () => {
    const resultNumber = Result.success(2);
    const sut = Result.success();

    const newResult = sut.bind(() => resultNumber);

    expect(newResult.isSuccess).toBe(true);
    expect(newResult.getValueOrThrow()).toBe(2);
  });

  test('bindAsync maps one result to an async result', async () => {
    const sut = Result.success();

    const resultAsync = ResultAsync.from(Promise.resolve(Result.success(2)));

    const newResult = await sut.bindAsync(() => resultAsync).toPromise();

    expect(newResult.isSuccess).toBe(true);
    expect(newResult.getValueOrThrow()).toBe(2);
  });
});
