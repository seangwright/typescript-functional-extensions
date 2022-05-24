import { Result } from '@/src/result';
import { Unit } from '@/src/unit';

describe('Result', () => {
  describe('success', () => {
    test('with no value constructs with a successful state', () => {
      const sut = Result.success();

      expect(sut).toSucceedWith(Unit.Instance);
    });

    test('with value constructs with a successful state', () => {
      const value = { email: 'test@localhost' };
      const sut = Result.success(value);

      expect(sut).toSucceedWith(value);
    });
  });

  describe('failure', () => {
    test('constructs with a failed state', () => {
      const error = 'error';
      const sut = Result.failure(error);

      expect(sut).toFailWith(error);
    });
  });

  describe('isSuccess/isFailure', () => {
    test('isSuccess returns true and isFailure returns false for a successful Result', () => {
      const sut = Result.success();

      expect(sut.isSuccess).toBe(true);
      expect(sut.isFailure).toBe(false);
    });

    test('isSuccess returns false and isFailure returns true for a failed Result', () => {
      const sut = Result.failure('ouch');

      expect(sut.isSuccess).toBe(false);
      expect(sut.isFailure).toBe(true);
    });
  });

  describe('hasValue', () => {
    test('grants access to value when Result is in success state', () => {
      const value = 'Alan Turing';
      const sut = Result.success(value);

      if (sut.hasValue()) {
        expect(sut.value).toBe(value);
      }
    });
  });

  describe('hasError', () => {
    test('grants access to error when Result is in error state', () => {
      const error = 'Alan Turing';
      const sut = Result.failure(error);

      if (sut.hasError()) {
        expect(sut.error).toBe(error);
      }
    });
  });

  describe('successIf', () => {
    describe('condition', () => {
      test('creates a successful Result if the condition is true', () => {
        const value = 1;
        const error = 'error';
        const sut = Result.successIf(true, { value, error });

        expect(sut).toSucceedWith(value);
      });

      test('creates a failed Result if the condition is false', () => {
        const value = 1;
        const error = 'error';
        const sut = Result.successIf(false, { value, error });

        expect(sut).toFailWith(error);
      });
    });

    describe('predicate', () => {
      test('creates a successful Result if the predicate returns true', () => {
        const value = 1;
        const error = 'error';
        const sut = Result.successIf(() => true, { value, error });

        expect(sut).toSucceedWith(value);
      });

      test('creates a failed Result if the predicate returns false', () => {
        const value = 1;
        const error = 'error';
        const sut = Result.successIf(() => false, { value, error });

        expect(sut).toFailWith(error);
      });
    });
  });

  describe('failureIf', () => {
    describe('condition', () => {
      test('creates a failed Result if the condition is true', () => {
        const value = 1;
        const error = 'error';
        const sut = Result.failureIf(true, { value, error });

        expect(sut).toFailWith(error);
      });

      test('creates a successful Result if the condition is false', () => {
        const value = 1;
        const error = 'error';
        const sut = Result.failureIf(false, { value, error });

        expect(sut).toSucceedWith(value);
      });
    });

    describe('predicate', () => {
      test('creates a failed Result if the predicate returns true', () => {
        const value = 1;
        const error = 'error';
        const sut = Result.failureIf(() => true, { value, error });

        expect(sut).toFailWith(error);
      });

      test('creates a successful Result if the predicate returns false', () => {
        const value = 1;
        const error = 'error';
        const sut = Result.failureIf(() => false, { value, error });

        expect(sut).toSucceedWith(value);
      });
    });
  });

  describe('getValueOrThrow', () => {
    test('returns the inner value when the Result is successful', () => {
      const value = 1;
      const sut = Result.success(value);

      expect(sut.getValueOrThrow()).toBe(value);
    });

    test('throws an error when the Result is a failure', () => {
      const error = 'error';
      const sut = Result.failure(error);

      expect(() => sut.getValueOrThrow()).toThrow('No value');
    });
  });

  describe('getValueOrDefault', () => {
    describe('value', () => {
      test('returns the inner value when the Result is successful', () => {
        const value = 1;
        const sut = Result.success(value);

        expect(sut.getValueOrDefault(2)).toBe(value);
      });

      test('returns the default value when the Result is a failure', () => {
        const error = 'error';
        const defaultValue = 1;
        const sut = Result.failure<number>(error);

        expect(sut.getValueOrDefault(defaultValue)).toBe(defaultValue);
      });
    });

    describe('factory', () => {
      test('returns the inner value when the Result is successful', () => {
        const value = 1;
        const sut = Result.success(value);

        expect(sut.getValueOrDefault(() => 2)).toBe(value);
      });

      test('returns the value returned by the given function when the Result is a failure', () => {
        const error = 'error';
        const defaultValue = 1;
        const sut = Result.failure<number>(error);

        expect(sut.getValueOrDefault(() => defaultValue)).toBe(defaultValue);
      });
    });
  });

  describe('getErrorOrThrow', () => {
    test('returns the inner error when the Result is a failure', () => {
      const error = 'error';
      const sut = Result.failure(error);

      expect(sut.getErrorOrThrow()).toBe(error);
    });

    test('throws an error when the Result is successful', () => {
      const sut = Result.success(1);

      expect(() => sut.getErrorOrThrow()).toThrow('No error');
    });
  });

  describe('getErrorOrDefault', () => {
    describe('error', () => {
      test('returns the inner error when the Result is a failure', () => {
        const error = 'error';
        const defaultValue = 'default';
        const sut = Result.failure<number>(error);

        expect(sut.getErrorOrDefault(defaultValue)).toBe(error);
      });

      test('returns the default value when the Result is successful', () => {
        const defaultValue = 'error';
        const sut = Result.success(1);

        expect(sut.getErrorOrDefault(defaultValue)).toBe(defaultValue);
      });
    });

    describe('factory', () => {
      test('returns the inner error when the Result is a failure', () => {
        const error = 'error';
        const defaultValue = 'default';
        const sut = Result.failure<number>(error);

        expect(sut.getErrorOrDefault(() => defaultValue)).toBe(error);
      });

      test('returns the value returned by the function when the Result is successful', () => {
        const defaultValue = 'error';
        const sut = Result.success(1);

        expect(sut.getErrorOrDefault(() => defaultValue)).toBe(defaultValue);
      });
    });

    describe('toString', () => {
      test('returns success for a successful Result', () => {
        const sut = Result.success(1);

        expect(sut.toString()).toBe('Result.success');
      });

      test('returns failre for a failed Result', () => {
        const sut = Result.failure<number>('error');

        expect(sut.toString()).toBe('Result.failure');
      });
    });
  });
});
