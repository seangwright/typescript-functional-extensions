import { ResultAsync } from '@/src/resultAsync';
import { Unit } from '@/src/unit';

describe('ResultAsync', () => {
  describe('success', () => {
    test('success creates a successful Unit Result from no value', async () => {
      const sut = ResultAsync.success();

      const result = await sut.toPromise();

      expect(result.isSuccess).toBe(true);

      expect(result).toSucceedWith(Unit.Instance);
    });

    test('success creates a successful Result from a value', async () => {
      const sut = ResultAsync.success(1);

      const result = await sut.toPromise();

      expect(result).toSucceedWith(1);
    });
  });

  describe('failure', () => {
    test('failure creates a failed Result', async () => {
      const error = { message: 'A problem' };
      const sut = ResultAsync.failure(error);

      const result = await sut.toPromise();

      expect(result).toFailWith(error);
    });
  });

  describe('isSuccess/isFailure', () => {
    test('isSuccess returns true and isFailure returns false for a successful Result', async () => {
      const sut = ResultAsync.success();

      await expect(sut.isSuccess).resolves.toBe(true);
      await expect(sut.isFailure).resolves.toBe(false);
    });

    test('isSuccess returns false and isFailure returns true for a failed Result', async () => {
      const sut = ResultAsync.failure('ouch');

      await expect(sut.isSuccess).resolves.toBe(false);
      await expect(sut.isFailure).resolves.toBe(true);
    });
  });

  describe('getValueOrThrow', () => {
    test('will return the inner value for a successful Result', async () => {
      const sut = ResultAsync.success();

      await expect(sut.getValueOrThrow()).resolves.toBe(Unit.Instance);
    });

    test('will throw an error for a failed Result', async () => {
      const sut = ResultAsync.failure('error');

      await expect(sut.getValueOrThrow()).rejects.toThrow();
    });
  });

  describe('getValueOrDefault', () => {
    test('will return the inner value for a successful Result', async () => {
      const sut = ResultAsync.success(1);

      await expect(sut.getValueOrDefault(2)).resolves.toBe(1);
    });

    test('will return the default value for a failed Result', async () => {
      const sut = ResultAsync.failure<number>('error');

      await expect(sut.getValueOrDefault(2)).resolves.toBe(2);
    });

    test('will return the default value factory value for a failed Result', async () => {
      const sut = ResultAsync.failure<number>('error');

      await expect(sut.getValueOrDefault(() => 2)).resolves.toBe(2);
    });
  });

  describe('getErrorOrThrow', () => {
    test('will return the inner error for a failed Result', async () => {
      const sut = ResultAsync.failure<number>('error');

      await expect(sut.getErrorOrThrow()).resolves.toBe('error');
    });

    test('will throw for a successful Result', async () => {
      const sut = ResultAsync.success(1);

      await expect(sut.getErrorOrThrow()).rejects.toThrow();
    });
  });

  describe('getErrorOrDefault', () => {
    test('will return the inner error for a failed Result', async () => {
      const sut = ResultAsync.failure<number>('error');

      await expect(sut.getErrorOrDefault('default')).resolves.toBe('error');
    });

    test('will throw for a successful Result', async () => {
      const sut = ResultAsync.success(1);

      await expect(sut.getErrorOrDefault('default')).resolves.toBe('default');
    });

    test('will return the default value factory value for a successful Result', async () => {
      const sut = ResultAsync.success(1);

      await expect(sut.getErrorOrDefault(() => 'default')).resolves.toBe(
        'default'
      );
    });
  });
});
