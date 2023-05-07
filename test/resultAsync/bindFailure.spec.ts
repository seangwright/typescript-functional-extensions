import { Result } from '@/src/result';
import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('bindFailure', () => {
    describe('Result', () => {
      test('takes the result from the second result, when previous result fails', async () => {
        const sut = ResultAsync.failure('💥');

        const innerResult = await sut
          .bindFailure(() => Result.success('✅'))
          .toPromise();

        return expect(innerResult).toSucceedWith('✅');
      });

      test('takes the result from the first result, when it succeeds', async () => {
        const sut = ResultAsync.success('✅');

        const innerResult = await sut
          .bindFailure(() => Result.failure('💥'))
          .toPromise();

        return expect(innerResult).toSucceedWith('✅');
      });

      test('takes the failure from the second result, when both fail', async () => {
        const sut = ResultAsync.failure('💥');

        const innerResult = await sut
          .bindFailure(() => Result.failure('💥💥'))
          .toPromise();

        return expect(innerResult).toFailWith('💥💥');
      });
    });

    describe('ResultAsync', () => {
      test('takes the result from the second result, when previous result fails', async () => {
        const sut = ResultAsync.failure('💥');

        const innerResult = await sut
          .bindFailure(() => ResultAsync.success('✅'))
          .toPromise();

        return expect(innerResult).toSucceedWith('✅');
      });

      test('takes the result from the first result, when it succeeds', async () => {
        const sut = ResultAsync.success('✅');

        const innerResult = await sut
          .bindFailure(() => ResultAsync.failure('💥'))
          .toPromise();

        return expect(innerResult).toSucceedWith('✅');
      });

      test('takes the failure from the second result, when both fail', async () => {
        const sut = ResultAsync.failure('💥');

        const innerResult = await sut
          .bindFailure(() => ResultAsync.failure('💥💥'))
          .toPromise();

        return expect(innerResult).toFailWith('💥💥');
      });
    });
  });
});
