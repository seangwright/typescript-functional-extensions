import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  describe('toResult', () => {
    test('creates a successful Result with the inner value', () => {
      const value = 1;
      const sut = Maybe.some(value);

      expect(sut.toResult('error')).toSucceedWith(value);
    });

    test('creates a failed Result when there is no value', () => {
      const error = 'error';
      const sut = Maybe.none<number>();

      expect(sut.toResult(error)).toFailWith(error);
    });
  });
});
