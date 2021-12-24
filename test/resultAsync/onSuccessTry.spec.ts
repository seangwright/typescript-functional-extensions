import { ResultAsync } from '@/src/resultAsync';

describe('ResultAsync', () => {
  describe('onSuccessTry', () => {
    test('does not call the action with a failed ResultAsync', async () => {
      let wasCalled = false;
      const sut = ResultAsync.failure('error');

      const result = await sut
        .onSuccessTry(
          () => (wasCalled = true),
          (e) => 'handled'
        )
        .toPromise();

      expect(result).toFailWith('error');
      expect(wasCalled).toBe(false);
    });
  });
});
