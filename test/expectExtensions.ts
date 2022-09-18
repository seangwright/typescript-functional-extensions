import { Maybe } from '@/src/maybe';
import { Result } from '@/src/result';
import { FunctionOfT, isDefined, isFunction } from '@/src/utilities';
import { expect } from 'vitest';

expect.extend({
  toHaveNoValue<TValue>(received: Maybe<TValue>) {
    return received.hasNoValue
      ? r(
          true,
          () =>
            `expected ${received} to have no value, but it has a value [${received.getValueOrThrow()}]`
        )
      : r(false, `expected ${received} to have a value, but it has none`);
  },
  toHaveValue<TValue>(
    received: Maybe<TValue>,
    expectedValue: TValue
  ): MatchResponse {
    if (received.hasNoValue) {
      return r(
        false,
        `expected [${received}] to have a value [${expectedValue}], but it has none`
      );
    }

    const value = received.getValueOrThrow();

    // See: https://github.com/vitest-dev/vitest/issues/2054
    return (this as any).equals(value, expectedValue)
      ? r(
          true,
          `expected [${received}] to have a value [${expectedValue}], but it has a value of [${value}]`
        )
      : r(
          false,
          `expected [${received}] to not have a value [${expectedValue}] but id does`
        );
  },
  toSucceed<TValue, TError>(received: Result<TValue, TError>): MatchResponse {
    return received.isFailure
      ? r(
          false,
          `expected [${received}] to be successful, but it failed with error [${received.getErrorOrThrow()}]`
        )
      : r(
          true,
          `expected [${received}] to be a failure, but it succeeded with value [${received.getValueOrThrow()}]`
        );
  },
  toSucceedWith<TValue, TError>(
    received: Result<TValue, TError>,
    expectedValue?: TValue
  ): MatchResponse {
    if (received.hasError()) {
      return r(
        false,
        `expected [${received}] to be successful, but it failed with error [${received.error}]`
      );
    }

    if (!isDefined(expectedValue)) {
      return r(
        true,
        `expected [${received}] to be a failure but it was successful with value [${received.getValueOrThrow()}]`
      );
    }

    const value = received.getValueOrThrow();

    // See: https://github.com/vitest-dev/vitest/issues/2054
    return (this as any).equals(expectedValue, value)
      ? r(
          true,
          `expected [${received}] to be successful but not have value [${expectedValue}] but it did`
        )
      : r(
          false,
          `expected [${received}] to have value [${expectedValue}], but found value [${value}]`
        );
  },
  toFail<TValue, TError>(received: Result<TValue, TError>) {
    return received.isSuccess
      ? r(
          false,
          `expected [${received}] to be a failure, but it succeeded with value [${received.getValueOrThrow()}]`
        )
      : r(
          true,
          `expected [${received}] to be successful, but it failed with error [${received.getErrorOrThrow()}]`
        );
  },
  toFailWith<TValue, TError>(
    received: Result<TValue, TError>,
    expectedError: TError
  ): MatchResponse {
    if (received.isSuccess) {
      return r(
        false,
        `expected [${received}] to be a failure, but it succeeded with value [${received.getValueOrThrow()}]`
      );
    }

    if (!isDefined(expectedError)) {
      return r(
        true,
        `expected [${received}] to be a failure but it was successful with value [${received.getValueOrThrow()}]`
      );
    }

    const error = received.getErrorOrThrow();

    // See: https://github.com/vitest-dev/vitest/issues/2054F
    if ((this as any).equals(error, expectedError)) {
      return r(
        true,
        `expected [${received}] to be failure but not have error [${expectedError}] but it did`
      );
    }

    return r(
      false,
      `expected [${received}] to have error [${expectedError}], but found value [${error}]`
    );
  },
});

type MatchResponse = { pass: boolean; message: () => string };

function r(
  pass: boolean,
  messageOrCreator: FunctionOfT<string> | string
): MatchResponse {
  const message = isFunction(messageOrCreator)
    ? messageOrCreator
    : () => messageOrCreator;

  return {
    pass,
    message,
  };
}

export default {};
