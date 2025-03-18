import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('combine', () => {
    it('succeeds with one successful ResultAsync', async () => {
      const success = ResultAsync.success('✅');

      const result = ResultAsync.combine({ success });

      await expect(result.getValueOrThrow()).resolves.toEqual({
        success: '✅',
      });
    });

    it('succeeds with one successful ResultAsync', async () => {
      const result = ResultAsync.combine({
        first: ResultAsync.success('✅'),
        second: ResultAsync.success('✅'),
      });

      await expect(result.getValueOrThrow()).resolves.toEqual({
        first: '✅',
        second: '✅',
      });
    });

    it('fails with one failed ResultAsync', async () => {
      const failure = ResultAsync.failure('💥');

      const result = ResultAsync.combine({ failure });

      await expect(result.isFailure).resolves.toEqual(true);
    });

    it('fails with one successful and one failed ResultAsync', async () => {
      const result = ResultAsync.combine({
        success: ResultAsync.success('✅'),
        failure: ResultAsync.failure('💥'),
      });

      await expect(result.isFailure).resolves.toEqual(true);
      await expect(result.getErrorOrThrow()).resolves.toEqual(
        'Failure in "failure": 💥'
      );
    });
  });

  it('succeeds with one successful Promise', async () => {
    const success = Promise.resolve('✅');

    const result = ResultAsync.combine({ success });

    await expect(result.getValueOrThrow()).resolves.toEqual({
      success: '✅',
    });
  });

  it('succeeds with one successful Promises', async () => {
    const result = ResultAsync.combine({
      first: Promise.resolve('✅'),
      second: Promise.resolve('✅'),
    });

    await expect(result.getValueOrThrow()).resolves.toEqual({
      first: '✅',
      second: '✅',
    });
  });

  it('fails with one successful and one failed Promise', async () => {
    const result = ResultAsync.combine({
      success: Promise.resolve('✅'),
      failure: Promise.reject('💥'),
    });

    await expect(result.isFailure).resolves.toEqual(true);
    await expect(result.getErrorOrThrow()).resolves.toEqual(
      'Failure in "failure": Unknown error'
    );
  });

  it('fails with one successful and one failed Promise', async () => {
    const result = ResultAsync.combine({
      success: Promise.resolve('✅'),
      failure: Promise.reject(new Error('💥')),
    });

    await expect(result.isFailure).resolves.toEqual(true);
    await expect(result.getErrorOrThrow()).resolves.toEqual(
      'Failure in "failure": 💥'
    );
  });

  it('fails with one successful Promise and one failed Result', async () => {
    const result = ResultAsync.combine({
      success: Promise.resolve('✅'),
      failure: ResultAsync.failure('💥'),
    });

    await expect(result.isFailure).resolves.toEqual(true);
    await expect(result.getErrorOrThrow()).resolves.toEqual(
      'Failure in "failure": 💥'
    );
  });
});
