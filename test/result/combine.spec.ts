import { Result } from '@/src/result';

describe('Result', () => {
  describe('combine', () => {
    test('fails if one result fails', () => {
      const success = Result.success(1);
      const failure = Result.failure('1st Error');

      const result = Result.combine({ success, failure });

      expect(result).toFailWith('1st Error');
    });

    test('succeeds if one results succeed', () => {
      const success = Result.success(1);

      const result = Result.combine({ success });

      expect(result).toSucceed();
    });

    test('succeeds if all results succeed', () => {
      const success_1 = Result.success(1);
      const success_2 = Result.success(2);

      const result = Result.combine({ success_1, success_2 });

      expect(result).toSucceed();
    });

    test('yields all result values on success', () => {
      const success_1 = Result.success(1);
      const success_2 = Result.success({ name: 'Arthur' });

      const result = Result.combine({ success_1, success_2 });

      expect(result).toSucceedWith({
        success_1: 1,
        success_2: { name: 'Arthur' },
      });
    });

    test('concatenates error messages', () => {
      const failure_1_message = '1st Error';
      const failure_1 = Result.failure(failure_1_message);
      const failure_2_message = '2nd Error';
      const failure_2 = Result.failure(failure_2_message);

      const result = Result.combine({ failure_1, failure_2 });

      expect(result).toFailWith(`${failure_1_message}, ${failure_2_message}`);
    });
  });
});
