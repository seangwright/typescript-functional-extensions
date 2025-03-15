import { Maybe } from '@/src/maybe';
import { MaybeAsync } from '@/src/maybeAsync';

describe('MaybeAsync', () => {
  describe('from', () => {
    test('constructs with a Maybe.some value', async () => {
      const value = 'one';
      const some = Maybe.some(value);
      const sut = MaybeAsync.from(some);

      await expect(sut.toPromise()).resolves.toHaveValue(value);
    });

    test('constructs with a Maybe.none value', async () => {
      const none = Maybe.none();
      const sut = MaybeAsync.from(none);

      await expect(sut.toPromise()).resolves.toHaveNoValue();
    });

    test('constructs with a Promise Maybe.some value', async () => {
      const value = 'one';
      const some = Maybe.some(value);
      const sut = MaybeAsync.from(Promise.resolve(some));

      await expect(sut.toPromise()).resolves.toHaveValue(value);
    });

    test('constructs with a Promise Maybe.none value', async () => {
      const none = Maybe.none();
      const sut = MaybeAsync.from(Promise.resolve(none));

      await expect(sut.toPromise()).resolves.toHaveNoValue();
    });

    test('constructs with a rejected Promise Maybe.some value', async () => {
      const error = 'boom!';
      const sut = MaybeAsync.from(Promise.reject<Maybe<string>>(error));

      await expect(sut.toPromise()).rejects.toMatch(error);
    });

    test('constructs with a Promise undefined value', async () => {
      const sut = MaybeAsync.from(
        Promise.resolve<string | undefined>(undefined)
      );

      await expect(sut.toPromise()).resolves.toHaveNoValue();
    });
  });

  describe('some', () => {
    test('constructs with a value', async () => {
      const value = 1;
      const sut = MaybeAsync.some(value);

      await expect(sut.toPromise()).resolves.toHaveValue(value);
    });
  });

  describe('none', () => {
    test('constructs with no value', async () => {
      const sut = MaybeAsync.none();

      await expect(sut.toPromise()).resolves.toHaveNoValue();
    });
  });

  describe('hasValue', () => {
    test('returns a resolved Promise of true when there is a value', async () => {
      const sut = MaybeAsync.some(1);

      await expect(sut.hasValue).resolves.toBe(true);
    });

    test('returns a resolved Promise of false when there is no value', async () => {
      const sut = MaybeAsync.none();

      await expect(sut.hasValue).resolves.toBe(false);
    });
  });

  describe('hasNoValue', () => {
    test('returns a resolved Promise of false when there is a value', async () => {
      const sut = MaybeAsync.some(1);

      await expect(sut.hasNoValue).resolves.toBe(false);
    });

    test('returns a resolved Promise of true when there is no value', async () => {
      const sut = MaybeAsync.none();

      await expect(sut.hasNoValue).resolves.toBe(true);
    });
  });

  describe('getValueOrDefault', () => {
    test('returns the inner value for a MaybeAsync with a value', async () => {
      const value = 1;
      const defaultValue = 10;
      const sut = MaybeAsync.some(value);

      await expect(sut.getValueOrDefault(defaultValue)).resolves.toBe(value);
    });

    test('returns the default value for a MaybeAsync with no value', async () => {
      const defaultValue = 10;
      const sut = MaybeAsync.none<number>();

      await expect(sut.getValueOrDefault(defaultValue)).resolves.toBe(
        defaultValue
      );
    });

    test('returns the result of the default value creator for a MaybeAsync with no value', async () => {
      const defaultValueCreator = () => 10;
      const sut = MaybeAsync.none<number>();

      await expect(sut.getValueOrDefault(defaultValueCreator)).resolves.toBe(
        defaultValueCreator()
      );
    });
  });

  describe('getValueOrThrow', () => {
    test('returns the inner value for a MaybeAsync with a value', async () => {
      const value = 1;
      const sut = MaybeAsync.some(value);

      await expect(sut.getValueOrThrow()).resolves.toBe(value);
    });

    test('throw an error for a MaybeAsync with no value', async () => {
      const sut = MaybeAsync.none();

      await expect(() => sut.getValueOrThrow()).rejects.toThrowError(
        'No value'
      );
    });
  });
});
