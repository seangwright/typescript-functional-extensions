import { Result } from '@/src/result';
import { ResultAsync } from '../../src';

describe('Result', () => {
  describe('compensateAsync', () => {
    describe('Promise', () => {
      test('takes the result from the second result, when previous result fails', async () => {
        const sut = Result.failure('💥');

        const innerResult = await sut
          .compensateAsync(() => Promise.resolve(Result.success('✅')))
          .toPromise();

        return expect(innerResult).toSucceedWith('✅');
      });

      test('takes the result from the first result, when it succeeds', async () => {
        const sut = Result.success('✅');

        const innerResult = await sut
          .compensateAsync(() => Promise.resolve(Result.failure('💥')))
          .toPromise();

        return expect(innerResult).toSucceedWith('✅');
      });

      test('takes the failure from the second result, when both fail', async () => {
        const sut = Result.failure('💥');

        const innerResult = await sut
          .compensateAsync(() => Promise.resolve(Result.failure('💥💥')))
          .toPromise();

        return expect(innerResult).toFailWith('💥💥');
      });
    });

    describe('ResultAsync', () => {
      test('takes the result from the second result, when previous result fails', async () => {
        const sut = Result.failure('💥');

        const innerResult = await sut
          .compensateAsync(() => ResultAsync.success('✅'))
          .toPromise();

        return expect(innerResult).toSucceedWith('✅');
      });

      test('takes the result from the first result, when it succeeds', async () => {
        const sut = Result.success('✅');

        const innerResult = await sut
          .compensateAsync(() => ResultAsync.failure('💥'))
          .toPromise();

        return expect(innerResult).toSucceedWith('✅');
      });

      test('takes the failure from the second result, when both fail', async () => {
        const sut = Result.failure('💥');

        const innerResult = await sut
          .compensateAsync(() => ResultAsync.failure('💥💥'))
          .toPromise();

        return expect(innerResult).toFailWith('💥💥');
      });
    });

    test('calls projection with first result error', async () => {
      const sut = Result.failure('💥');
      const projection = vi.fn(() => ResultAsync.success('✅'));

      await sut.compensateAsync(projection).toPromise();

      expect(projection).toBeCalledWith('💥');
    });
  });
});
