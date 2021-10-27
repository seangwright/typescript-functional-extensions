import { Result } from '@/src/result';

describe('Result', () => {
  describe('try', () => {
    describe('action', () => {
      test('will return a failed Result from a thrown Error', () => {
        const errorMessage = 'ouch';
        const action = () => {
          throw new Error(errorMessage);
        };

        const sut = Result.try(action, (e) =>
          e instanceof Error ? e.message : `${e}`
        );

        expect(sut).toFailWith(errorMessage);
      });

      test('will return a successful Result from an action', () => {
        let wasCalled = false;
        const action = () => {
          wasCalled = true;
        };

        const sut = Result.try(action, (e) => 'error');

        expect(sut).toSucceed();
        expect(wasCalled).toBe(true);
      });
    });

    describe('factory', () => {
      test('will return a failed Result from a thrown Error', () => {
        const errorMessage = 'ouch';
        const throwError = () => {
          throw new Error(errorMessage);
        };
        const factory = () => {
          throwError();

          return 1;
        };

        const sut = Result.try(factory, (e) =>
          e instanceof Error ? e.message : `${e}`
        );

        expect(sut).toFailWith(errorMessage);
      });

      test('will create a successful Result with the given value', () => {
        const factory = () => 1;

        const sut = Result.try(factory, (e) => `${e}`);

        expect(sut).toSucceedWith(1);
      });
    });
  });
});
