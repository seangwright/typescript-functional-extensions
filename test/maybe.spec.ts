import { maybe } from 'src/maybe';

test('maybe constructs with no string value', () => {
    const sut = new maybe<string>();

    expect(sut.hasNoValue).toBe(true);
    expect(sut.hasValue).toBe(false);
});