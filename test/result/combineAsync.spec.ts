import { Result } from '@/src/result';

describe('Result', () => {
  describe('combineAsync', () => {
    test('fails if one result fails', async () => {
      const success = Result.success(1);
      const failure = Result.failure('1st Error');

      const sut = await Result.combineAsync({ success, failure }).toPromise();

      expect(sut).toFailWith('Failure in "failure": 1st Error');
    });

    test('succeeds if one results succeed', async () => {
      const success = Result.success(1);

      const sut = await Result.combineAsync({ success }).toPromise();

      expect(sut).toSucceed();
    });

    test('concatenates error messages', async () => {
      const failure_1_message = '1st Error';
      const failure_1 = Result.failure(failure_1_message);
      const failure_2_message = '2nd Error';
      const failure_2 = Result.failure(failure_2_message);

      const sut = await Result.combineAsync({
        failure_1,
        failure_2,
      }).toPromise();

      expect(sut).toFailWith(
        `Failure in "failure_1": 1st Error, Failure in "failure_2": 2nd Error`
      );
    });
  });
});
