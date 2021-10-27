import { Result } from '@/src/result';

describe('Result', () => {
  describe('checkIf', () => {
    describe('condition', () => {
      test('will return the original Result without executing the check if the condition is false', () => {
        let wasCalled = false;
        const check = (num: number) => {
          wasCalled = true;
          return Result.success(num + 1);
        };
        const sut = Result.success(1);

        expect(sut.checkIf(false, check)).toSucceedWith(1);
        expect(wasCalled).toBe(false);
      });

      test('will return the original Result and execute the check if the condition is true', () => {
        let wasCalled = false;
        const check = (num: number) => {
          wasCalled = true;
          return Result.success(num + 1);
        };
        const sut = Result.success(1);

        expect(sut.checkIf(true, check)).toSucceedWith(1);
        expect(wasCalled).toBe(true);
      });
    });

    describe('factory', () => {
      test('will return the original Result without executing the check if the factory returns false', () => {
        let wasCalled = false;
        const check = (num: number) => {
          wasCalled = true;
          return Result.success(num + 1);
        };
        const sut = Result.success(1);

        expect(sut.checkIf(() => false, check)).toSucceedWith(1);
        expect(wasCalled).toBe(false);
      });

      test('will return the original Result and execute the check if the factory returns true', () => {
        let wasCalled = false;
        const check = (num: number) => {
          wasCalled = true;
          return Result.success(num + 1);
        };
        const sut = Result.success(1);

        expect(sut.checkIf(() => true, check)).toSucceedWith(1);
        expect(wasCalled).toBe(true);
      });
    });
  });
});
