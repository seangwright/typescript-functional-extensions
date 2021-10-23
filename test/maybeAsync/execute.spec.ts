import { MaybeAsync } from '@/src/maybeAsync';

describe('MaybeAsync', () => {
  describe('execute', () => {
    describe('Action', () => {
      test('will be called when there is a value', async () => {
        const value = 1;
        const sut = MaybeAsync.some(value);

        let capturedNumber = 0;

        await sut.execute((number) => {
          capturedNumber = number;
        });

        expect(capturedNumber).toBe(value);
      });

      test('will not be called when there is no value', async () => {
        const sut = MaybeAsync.none<number>();

        let capturedNumber = 0;

        await sut.execute((_) => {
          capturedNumber = 10;
        });

        expect(capturedNumber).toBe(0);
      });
    });

    describe('AsyncAction', () => {
      test('will be called when there is a value', async () => {
        const value = 1;
        const sut = MaybeAsync.some(value);

        let capturedNumber = 0;

        await sut.execute((number) => {
          capturedNumber = number;

          return Promise.resolve();
        });

        expect(capturedNumber).toBe(value);
      });

      test('will not be called when there is no value', async () => {
        const sut = MaybeAsync.none<number>();

        let capturedNumber = 0;

        await sut.execute((_) => {
          capturedNumber = 10;

          return Promise.resolve();
        });

        expect(capturedNumber).toBe(0);
      });
    });
  });
});
