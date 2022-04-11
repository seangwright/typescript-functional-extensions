import { Result } from '@/src/result';

describe('Result', () => {
  describe('combine', () => {
    test('fails if one result fails', () => {
      const success = Result.success(1);
      const failure = Result.failure('1st Error');

      const result = Result.combine([success, failure]);

      expect(result.isFailure).toBe(true);
    });

    test('succeeds if all results succeed', () => {
      const success = Result.success(1);

      const result = Result.combine([success]);

      expect(result.isSuccess).toBe(true);
    });

    test('concatenates error messages', () => {
      const failure_1_message = '1st Error';
      const failure_1 = Result.failure(failure_1_message);
      const failure_2_message = '2st Error';
      const failure_2 = Result.failure(failure_2_message);

      const expected_message = `${failure_1_message}, ${failure_2_message}`;

      const result = Result.combine([failure_1, failure_2]);

      expect(result.getErrorOrThrow()).toBe(expected_message);
    });
  });
});
