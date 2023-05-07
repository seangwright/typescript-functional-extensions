import { Result } from '@/src/result';

describe('Result', () => {
  describe('bindFailure', () => {
    test('takes the result from the second result, when previous result fails', () => {
      const sut = Result.failure('💥');

      expect(sut.bindFailure(() => Result.success('✅'))).toSucceedWith('✅');
    });

    test('takes the result from the first result, when it succeeds', () => {
      const sut = Result.success('✅');

      expect(sut.bindFailure(() => Result.failure('💥'))).toSucceedWith('✅');
    });

    test('takes the failure from the second result, when both fail', () => {
      const sut = Result.failure('💥');

      expect(sut.bindFailure(() => Result.failure('💥💥'))).toFailWith('💥💥');
    });
  });
});
