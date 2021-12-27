import { ResultAsync } from '@/src/resultAsync';
import { ActionOfT } from '@/src/utilities';

describe('ResultAsync', () => {
  describe('onSuccessTry', () => {
    test('does not call the action with a failed ResultAsync', async () => {
      let wasCalled = false;
      const sut = ResultAsync.failure('error');

      const result = await sut
        .onSuccessTry(
          () => (wasCalled = true),
          (e) => `handled: ${e}`
        )
        .toPromise();

      expect(result).toFailWith('error');
      expect(wasCalled).toBe(false);
    });

    describe('action', () => {
      test('calls the action and returns a successful ResultAsync when the action does not throw', async () => {
        let wasCalled = false;
        const sut = ResultAsync.success(1);

        const result = await sut
          .onSuccessTry(
            () => (wasCalled = true),
            (e) => `handled: ${e}`
          )
          .toPromise();

        expect(result).toSucceedWith(1);
        expect(wasCalled).toBe(true);
      });

      test('calls the action and returns a failed ResultAsync when the action throws', async () => {
        let wasCalled = false;
        const sut = ResultAsync.success(1);

        // the thrown error confuses the type system, so we use an explicitly typed function to select the correct overload
        const action: ActionOfT<number> = () => {
          wasCalled = true;
          throw new Error('error');
        };

        const result = await sut
          .onSuccessTry(action, (e) =>
            e instanceof Error ? `handled: ${e.message}` : 'handled'
          )
          .toPromise();

        expect(result).toFailWith('handled: error');
        expect(wasCalled).toBe(true);
      });
    });

    describe('async action', () => {
      test('calls the async action and returns a successful ResultAsync when the action does not throw', async () => {
        let wasCalled = false;
        const sut = ResultAsync.success(1);

        const result = await sut
          .onSuccessTry(
            () => {
              wasCalled = true;

              return Promise.resolve();
            },
            (e) => `handled: ${e}`
          )
          .toPromise();

        expect(result).toSucceedWith(1);
        expect(wasCalled).toBe(true);
      });

      test('calls the async action and returns a failed ResultAsync when the Promise rejects', async () => {
        let wasCalled = false;
        const sut = ResultAsync.success(1);

        const result = await sut
          .onSuccessTry(
            () => {
              wasCalled = true;

              return Promise.reject('error');
            },
            (e) => `handled: ${e}`
          )
          .toPromise();

        expect(result).toFailWith('handled: error');
        expect(wasCalled).toBe(true);
      });
    });
  });
});
