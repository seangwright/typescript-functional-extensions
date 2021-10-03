import { Result } from '@/src/result';
import { ResultT } from '@/src/resultT';
import { ResultTAsync } from '@/src/resultTAsync';

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
    const resultNumber = ResultT.success(2);
    const sut = Result.success();

    const newResult = sut.bind(() => resultNumber, ResultT.failure);

    expect(newResult.isSuccess).toBe(true);
    expect(newResult.getValueOrThrow()).toBe(2);
  });

  test('bindAsync maps one result to an async result', async () => {
    const sut = Result.success();

    const resultAsync = ResultTAsync.from(Promise.resolve(ResultT.success(2)));

    const newResult = await sut
      .bindAsync(() => resultAsync, ResultTAsync.failure)
      .toPromise();

    expect(newResult.isSuccess).toBe(true);
    expect(newResult.getValueOrThrow()).toBe(2);
  });
});
