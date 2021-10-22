import { MaybeAsync } from '@/src/maybeAsync';

describe('MaybeAsync', () => {
  describe('match:void', () => {
    test('will call the some callback when there is a value', async () => {
      const value = 1;
      const sut = MaybeAsync.some(value);

      let capturedValue = 0;

      await sut.match({
        some: (number) => {
          capturedValue = number;
        },
        none: () => {
          capturedValue = 10;
        },
      });

      expect(capturedValue).toBe(value);
    });

    test('will call the none callback when there is no value', async () => {
      const value = 10;
      const sut = MaybeAsync.none<number>();

      let capturedValue = 0;

      await sut.match({
        some: (_) => {
          capturedValue = 1;
        },
        none: () => {
          capturedValue = value;
        },
      });

      expect(capturedValue).toBe(value);
    });
  });

  describe('match:value', () => {
    test('will return the value from the some callback when there is a value', async () => {
      const sut = MaybeAsync.some(1);

      const result = await sut.match({
        some: (_) => 'some',
        none: () => 'none',
      });

      expect(result).toBe('some');
    });

    test('will return the value from the non callback when there is no value', async () => {
      const sut = MaybeAsync.none<number>();

      const result = await sut.match({
        some: (_) => 'some',
        none: () => 'none',
      });

      expect(result).toBe('none');
    });
  });
});
