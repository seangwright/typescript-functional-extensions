import { Result } from '@/src/result';

describe('Result', () => {
  describe('combine', () => {
    test('fails if one result fails', () => {
      const success = Result.success(1);
      const failure = Result.failure('1st Error');

      const result = Result.combine({ success, failure });

      expect(result.isFailure).toBe(true);
    });

    test('succeeds if one results succeed', () => {
      const success = Result.success(1);

      const result = Result.combine({ success });

      expect(result.isSuccess).toBe(true);
    });

    test('succeeds if all results succeed', () => {
      const success_1 = Result.success(1);
      const success_2 = Result.success(2);

      const result = Result.combine({ success_1, success_2 });

      expect(result.isSuccess).toBe(true);
    });

    test('yields all result values on success', () => {
      const success_1 = Result.success(1);
      const success_2 = Result.success({ name: 'Arthur' });

      const result = Result.combine({ success_1, success_2 });

      const values = result.getValueOrThrow();

      expect(values.success_1).toBe(1);
      expect(values.success_2).toEqual({ name: 'Arthur' });
    });

    test('concatenates error messages', () => {
      const failure_1_message = '1st Error';
      const failure_1 = Result.failure(failure_1_message);
      const failure_2_message = '2nd Error';
      const failure_2 = Result.failure(failure_2_message);

      const expected_message = `${failure_1_message}, ${failure_2_message}`;

      const result = Result.combine({ failure_1, failure_2 });

      expect(result.getErrorOrThrow()).toBe(expected_message);
    });
  });
});
