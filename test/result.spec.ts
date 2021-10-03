import { Result } from '@/src/result';
import { ResultT } from '@/src/resultT';

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

  test('', () => {
    const resultNumber = ResultT.success(2);
    const sut = Result.success();

    sut.bind(
      () => resultNumber,
      (s) => ResultT.failure<number>(s)
    );
  });
});
