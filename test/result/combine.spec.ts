import { Result } from '@/src/result';

describe('Result', () => {
  describe('combine', () => {
    test('fails if one result fails', () => {
      const success = Result.success(1);
      const failure = Result.failure('1st Error');

      const result = Result.combine(success, failure);

      expect(result.isFailure).toBe(true);
    });

    test('succeeds if one results succeed', () => {
      const success = Result.success(1);

      const result = Result.combine(success);

      expect(result.isSuccess).toBe(true);
    });

    test('succeeds if all results succeed', () => {
      const success_1 = Result.success(1);
      const success_2 = Result.success(2);

      const result = Result.combine(success_1, success_2);

      expect(result.isSuccess).toBe(true);
    });

    test('yields all result values on success', () => {
      const success_1 = Result.success(1);
      const success_2 = Result.success({ name: 'Arthur' });

      const result = Result.combine(success_1, success_2);

      const [value_1, value_2] = result.getValueOrThrow();

      expect(value_1).toBe(1);
      expect(value_2).toEqual({ name: 'Arthur' });
    });

    test('supports up to eight Results inferring the respective value type', () => {
      const success_1 = Result.success({ a: true });
      const success_2 = Result.success({ b: true });
      const success_3 = Result.success({ c: true });
      const success_4 = Result.success({ d: true });
      const success_5 = Result.success({ e: true });
      const success_6 = Result.success({ f: true });
      const success_7 = Result.success({ g: true });
      const success_8 = Result.success({ h: true });

      const result = Result.combine(
        success_1,
        success_2,
        success_3,
        success_4,
        success_5,
        success_6,
        success_7,
        success_8
      );

      expect(result.getValueOrThrow()).toHaveLength(8);
    });

    test('concatenates error messages', () => {
      const failure_1_message = '1st Error';
      const failure_1 = Result.failure(failure_1_message);
      const failure_2_message = '2st Error';
      const failure_2 = Result.failure(failure_2_message);

      const expected_message = `${failure_1_message}, ${failure_2_message}`;

      const result = Result.combine(failure_1, failure_2);

      expect(result.getErrorOrThrow()).toBe(expected_message);
    });
  });
});
