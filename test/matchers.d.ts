export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValue<TValue>(expectedValue: TValue): R;
      toHaveNoValue(): R;
      toSucceed(): R;
      toSucceedWith<TValue>(expectedValue: TValue): R;
      toFail(): R;
      toFailWith<TError>(expectedError: TError): R;
    }
  }
}
