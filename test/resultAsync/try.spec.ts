import { ResultAsync } from '@/src/resultAsync';

describe('Result', () => {
  describe('try', () => {
    describe('action', () => {
      test('will return a failed Result from a thrown Error', async () => {
        const errorMessage = 'ouch';
        const action = () => {
          throw new Error(errorMessage);
        };

        const sut = await ResultAsync.try(action, (e) =>
          e instanceof Error ? e.message : `${e}`
        ).toPromise();

        expect(sut).toFailWith(errorMessage);
      });

      test('will return a successful Result from an action', async () => {
        let wasCalled = false;
        const action = () => {
          wasCalled = true;

          return Promise.resolve();
        };

        const sut = await ResultAsync.try(action, (e) => 'error').toPromise();

        expect(sut).toSucceed();
        expect(wasCalled).toBe(true);
      });
    });

    describe('factory', () => {
      test('will return a failed Result from a thrown Error', async () => {
        const errorMessage = 'ouch';
        const throwError = () => {
          throw new Error(errorMessage);
        };
        const factory = () => {
          throwError();

          return Promise.resolve(1);
        };

        const sut = await ResultAsync.try(factory, (e) =>
          e instanceof Error ? e.message : `${e}`
        ).toPromise();

        expect(sut).toFailWith(errorMessage);
      });

      test('will create a successful Result with the given value', async () => {
        const factory = () => Promise.resolve(1);

        const sut = await ResultAsync.try(factory, (e) => `${e}`).toPromise();

        expect(sut).toSucceedWith(1);
      });
    });
  });
});
