import { Result } from '@/src/result';
import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('compensate', () => {
    test('takes the result from the second result, when previous result fails', async () => {
      const sut = ResultAsync.failure('💥');

      const innerResult = await sut
        .compensate(() => Result.success('✅'))
        .toPromise();

      return expect(innerResult).toSucceedWith('✅');
    });

    test('takes the result from the first result, when it succeeds', async () => {
      const sut = ResultAsync.success('✅');

      const innerResult = await sut
        .compensate(() => Result.failure('💥'))
        .toPromise();

      return expect(innerResult).toSucceedWith('✅');
    });

    test('takes the failure from the second result, when both fail', async () => {
      const sut = ResultAsync.failure('💥');

      const innerResult = await sut
        .compensate(() => Result.failure('💥💥'))
        .toPromise();

      return expect(innerResult).toFailWith('💥💥');
    });

    test('takes the result from the second result, when previous result fails', async () => {
      const sut = ResultAsync.failure('💥');

      const innerResult = await sut
        .compensate(() => ResultAsync.success('✅'))
        .toPromise();

      return expect(innerResult).toSucceedWith('✅');
    });

    test('takes the result from the first result, when it succeeds', async () => {
      const sut = ResultAsync.success('✅');

      const innerResult = await sut
        .compensate(() => ResultAsync.failure('💥'))
        .toPromise();

      return expect(innerResult).toSucceedWith('✅');
    });

    test('takes the failure from the second result, when both fail', async () => {
      const sut = ResultAsync.failure('💥');

      const innerResult = await sut
        .compensate(() => ResultAsync.failure('💥💥'))
        .toPromise();

      return expect(innerResult).toFailWith('💥💥');
    });

    test('calls projection with first result error', async () => {
      const sut = ResultAsync.failure('💥');
      const projection = vi.fn(() => ResultAsync.success('✅'));

      await sut.compensate(projection).toPromise();
      expect(projection).toBeCalledWith('💥');
    });
  });
});
