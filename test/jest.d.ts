export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toSucceed(): R;
      toSucceedWith<TValue>(expectedValue: TValue): R;
      toFail(): R;
      toFailWith<TError>(expectedError: TError): R;
    }
  }
}
