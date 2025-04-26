import { Result } from '@/src/result';
import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('combine', () => {
    it('succeeds with one successful ResultAsync', async () => {
      const sut = await ResultAsync.combine({
        success: ResultAsync.success('✅'),
      }).toPromise();

      expect(sut).toSucceedWith({
        success: '✅',
      });
    });

    it('succeeds with two successful ResultAsync', async () => {
      const sut = await ResultAsync.combine({
        first: ResultAsync.success('✅'),
        second: ResultAsync.success('✅'),
      }).toPromise();
      expect(sut).toSucceedWith({
        first: '✅',
        second: '✅',
      });
    });

    it('fails with one failed ResultAsync', async () => {
      const sut = await ResultAsync.combine({
        failure: ResultAsync.failure('💥'),
      }).toPromise();

      expect(sut).toFailWith('💥');
    });

    it('fails with one successful and one failed ResultAsync', async () => {
      const sut = await ResultAsync.combine({
        success: ResultAsync.success('✅'),
        failure: ResultAsync.failure('💥'),
      }).toPromise();
      expect(sut).toFailWith('💥');
    });

    it('succeeds with one successful Result', async () => {
      const sut = await ResultAsync.combine({
        success: Result.success('✅'),
      }).toPromise();

      expect(sut).toSucceedWith({
        success: '✅',
      });
    });

    it('succeeds with two successful Results', async () => {
      const sut = await ResultAsync.combine({
        first: Result.success('✅'),
        second: Result.success('✅'),
      }).toPromise();
      expect(sut).toSucceedWith({
        first: '✅',
        second: '✅',
      });
    });

    it('fails with one failed Result', async () => {
      const sut = await ResultAsync.combine({
        failure: Result.failure('💥'),
      }).toPromise();

      expect(sut).toFailWith('💥');
    });

    it('fails with one successful and one failed Result', async () => {
      const sut = await ResultAsync.combine({
        success: Result.success('✅'),
        failure: Result.failure('💥'),
      }).toPromise();
      expect(sut).toFailWith('💥');
    });

    it('fails with mixed types when one fails', async () => {
      const sut = await ResultAsync.combine({
        sut: Result.success('✅'),
        sutAsync: ResultAsync.failure('💥'),
      }).toPromise();

      expect(sut).toFailWith('💥');
    });
  });
});
