import { Maybe } from '@/src/maybe';
import { MaybeAsync } from '@/src/maybeAsync';

describe('Maybe', () => {
  describe('bindAsync', () => {
    test('converts the Maybes inner value to a new MaybeAsync with a value', async () => {
      const value = 1;
      const otherValue = 'hello';

      const sut = Maybe.some(value);

      const innerMaybe = await sut
        .bindAsync((number) => MaybeAsync.some(number + otherValue))
        .toPromise();

      expect(innerMaybe).toHaveValue(`${value}${otherValue}`);
    });

    test('converts the Maybes inner value to a new MaybeAsync with no value', async () => {
      const value = 1;

      const sut = Maybe.some(value);

      const innerMaybe = await sut
        .bindAsync((_) => MaybeAsync.none<string>())
        .toPromise();

      expect(innerMaybe).toHaveNoValue();
    });

    test('performs no action and returns a MaybeAsync with no value for Maybes with no value', async () => {
      const sut = Maybe.none<number>();
      let wasCalled = false;

      const innerMaybe = await sut
        .bindAsync((_) => {
          wasCalled = true;
          return MaybeAsync.some('test');
        })
        .toPromise();

      expect(innerMaybe).toHaveNoValue();
    });
  });
});
