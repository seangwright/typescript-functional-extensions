import { MaybeAsync } from '@/src/maybeAsync';

describe('MaybeAsync', () => {
  describe('toResult', () => {
    test('transforms to a ResultAsync with the value when there is a value', async () => {
      const sut = MaybeAsync.some(1);

      const innerResult = await sut.toResult('there is no value').toPromise();

      expect(innerResult).toSucceedWith(1);
    });

    test('transforms to a ResultAsync with the given error when there is no value', async () => {
      const sut = MaybeAsync.none<number>();
      const error = { message: 'there is no value' };

      const innerResult = await sut.toResult(error).toPromise();

      expect(innerResult).toFailWith(error);
    });
  });
});
