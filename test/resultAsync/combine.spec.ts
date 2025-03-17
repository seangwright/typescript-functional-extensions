import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('combine', () => {
    it('creates a successful ResultAsync out of one successful ResultAsync', async () => {
      const success = ResultAsync.success(1);

      const result = ResultAsync.combine({ success });

      await expect(result.getValueOrThrow()).resolves.toEqual({ success: 1 });
    });
  });
});
