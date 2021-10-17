import { Result } from '@/src/result';
import { Unit } from '@/src/unit';

describe('Result', () => {
  test('success with no value constructs with a successful state', () => {
    const sut = Result.success();

    expect(sut).toSucceed();
    expect(sut).toSucceedWith(Unit.Instance);
    expect(sut).not.toSucceedWith('three');
    expect(sut).not.toFail();
    expect(sut).not.toFailWith('error');
  });

  test('success with value constructs with a successful state', () => {
    const value = { user: { email: 'test@test.com' } };
    const sut = Result.success(value);

    expect(sut).toSucceed();
    expect(sut).toSucceedWith(value);
    expect(sut).not.toSucceedWith(Unit.Instance);
    expect(sut).not.toFail();
    expect(sut).not.toFailWith('error');
  });

  test('failure constructs with a failed state', () => {
    const error = 'error';
    const sut = Result.failure(error);

    expect(sut).toFail();
    expect(sut).toFailWith(error);
    expect(sut).not.toFailWith('');
    expect(sut).not.toSucceed();
    expect(sut).not.toSucceedWith(Unit.Instance);
  });
});
