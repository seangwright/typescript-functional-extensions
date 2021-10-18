import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  describe('match', () => {
    describe('map', () => {
      test('calls the some function when the Maybe has a value', () => {
        const sut = Maybe.some(1);

        const result = sut.match({
          some: (number) => `some${number}`,
          none: () => 'none',
        });

        expect(result).toBe('some1');
      });

      test('calls the none function when the Mayeb has no value', () => {
        const sut = Maybe.none<number>();

        const result = sut.match({
          some: (number) => `some${number}`,
          none: () => 'none',
        });

        expect(result).toBe('none');
      });
    });

    describe('execute', () => {
      test('executes the some function when the Maybe has a value', () => {
        const sut = Maybe.some(1);
        let someCalled = false;
        let noneCalled = false;

        const result = sut.match({
          some: (_) => {
            someCalled = true;
          },
          none: () => {
            noneCalled = true;
          },
        });

        expect(result).toBeUndefined();
        expect(someCalled).toBe(true);
        expect(noneCalled).toBe(false);
      });

      test('executes the none function when the Maybe has no value', () => {
        const sut = Maybe.none<number>();
        let someCalled = false;
        let noneCalled = false;

        const result = sut.match({
          some: (_) => {
            someCalled = true;
          },
          none: () => {
            noneCalled = true;
          },
        });

        expect(result).toBeUndefined();
        expect(noneCalled).toBe(true);
        expect(someCalled).toBe(false);
      });
    });
  });
});
