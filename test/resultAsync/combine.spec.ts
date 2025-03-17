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

    it('fails with one failed ResultAsync', async () => {
      const failure = ResultAsync.failure('💥');

      const result = ResultAsync.combine({ failure });

      await expect(result.isFailure).resolves.toEqual(true);
    });
  });
});
