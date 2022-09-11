import { Maybe } from '@/src/maybe';
import { MaybeAsync } from '@/src/maybeAsync';

describe('MaybeAsync', () => {
  describe('from', () => {
    test('constructs with a Maybe.some value', async () => {
      const value = 'one';
      const some = Maybe.some(value);
      const sut = MaybeAsync.from(some);

      const innerMaybe = await sut.toPromise();

      expect(innerMaybe).toHaveValue(value);
    });

    test('constructs with a Maybe.none value', async () => {
      const none = Maybe.none();
      const sut = MaybeAsync.from(none);

      const innerMaybe = await sut.toPromise();

      expect(innerMaybe).toHaveNoValue();
    });

    test('constructs with a Promise Maybe.some value', async () => {
      const value = 'one';
      const some = Maybe.some(value);
      const sut = MaybeAsync.from(Promise.resolve(some));

      const innerMaybe = await sut.toPromise();

      expect(innerMaybe).toHaveValue(value);
    });

    test('constructs with a Promise Maybe.none value', async () => {
      const none = Maybe.none();
      const sut = MaybeAsync.from(Promise.resolve(none));

      const innerMaybe = await sut.toPromise();

      expect(innerMaybe).toHaveNoValue();
    });

    test('constructs with a rejected Promise Maybe.some value', async () => {
      const error = 'boom!';
      const sut = MaybeAsync.from(Promise.reject<Maybe<string>>(error));

      await expect(sut.toPromise()).rejects.toMatch(error);
    });
  });

  describe('some', () => {
    test('constructs with a value', async () => {
      const value = 1;
      const sut = MaybeAsync.some(value);

      const innerMaybe = await sut.toPromise();

      expect(innerMaybe).toHaveValue(value);
    });
  });

  describe('none', () => {
    test('constructs with no value', async () => {
      const sut = MaybeAsync.none();

      const innerMaybe = await sut.toPromise();

      expect(innerMaybe).toHaveNoValue();
    });
  });

  describe('hasValue', () => {
    test('returns a resolved Promise of true when there is a value', async () => {
      const sut = MaybeAsync.some(1);

      expect(sut.hasValue).resolves.toBe(true);
    });

    test('returns a resolved Promise of false when there is no value', async () => {
      const sut = MaybeAsync.none();

      expect(sut.hasValue).resolves.toBe(false);
    });
  });

  describe('hasNoValue', () => {
    test('returns a resolved Promise of false when there is a value', async () => {
      const sut = MaybeAsync.some(1);

      expect(sut.hasNoValue).resolves.toBe(false);
    });

    test('returns a resolved Promise of true when there is no value', async () => {
      const sut = MaybeAsync.none();

      expect(sut.hasNoValue).resolves.toBe(true);
    });
  });

  describe('getValueOrDefault', () => {
    test('returns the inner value for a MaybeAsync with a value', () => {
      const value = 1;
      const defaultValue = 10;
      const sut = MaybeAsync.some(value);

      expect(sut.getValueOrDefault(defaultValue)).resolves.toBe(value);
    });

    test('returns the default value for a MaybeAsync with no value', () => {
      const defaultValue = 10;
      const sut = MaybeAsync.none<number>();

      expect(sut.getValueOrDefault(defaultValue)).resolves.toBe(defaultValue);
    });

    test('returns the result of the default value creator for a MaybeAsync with no value', () => {
      const defaultValueCreator = () => 10;
      const sut = MaybeAsync.none<number>();

      expect(sut.getValueOrDefault(defaultValueCreator)).resolves.toBe(
        defaultValueCreator()
      );
    });
  });

  describe('getValueOrThrow', () => {
    test('returns the inner value for a MaybeAsync with a value', () => {
      const value = 1;
      const sut = MaybeAsync.some(value);

      expect(sut.getValueOrThrow()).resolves.toBe(value);
    });

    test('throw an error for a MaybeAsync with no value', () => {
      const sut = MaybeAsync.none();

      expect(() => sut.getValueOrThrow()).rejects.toThrowError('No value');
    });
  });
});
