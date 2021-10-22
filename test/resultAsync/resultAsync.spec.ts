import { Result } from '@/src/result';
import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('from', () => {
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
});
