import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  describe('tapNoneAsync', () => {
    test('performs no action when the Maybe has a value', async () => {
      const sut = Maybe.some(10);
      let val = 1;

      await sut
        .tapNoneAsync(() => {
          val = -1;

          return Promise.resolve();
        })
        .toPromise();

      expect(val).toBe(1);
    });

    test('executes the action for Maybes with no value', async () => {
      const sut = Maybe.none<number>();
      let val = 1;

      await sut
        .tapNoneAsync(() => {
          val = -1;

          return Promise.resolve();
        })
        .toPromise();

      expect(val).toBe(-1);
    });
  });
});
