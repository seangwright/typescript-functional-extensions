import { map, Maybe } from '@/src/pipeable/maybe';

describe('Maybe', () => {
  test('can map', () => {
    const sut = Maybe.some(1);

    const result = sut.pipe(map((n) => n + 1));

    expect(result).toHaveValue(2);
  });
});
