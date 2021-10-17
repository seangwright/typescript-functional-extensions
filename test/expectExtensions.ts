import { Result } from '@/src/result';
import { isDefined } from '@/src/utilities';

expect.extend({
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
    if (received.isFailure) {
      return r(
        false,
        `expected [${received}] to be successful, but it failed with error [${received.getErrorOrThrow()}]`
      );
    }

    if (!isDefined(expectedValue)) {
      return r(
        true,
        `expected [${received}] to be a failure but it was successful with value [${received.getValueOrThrow()}]`
      );
    }

    const value = received.getValueOrThrow();

    if (expectedValue === value) {
      return r(
        true,
        `expected [${received}] to be successful but not have value [${expectedValue}] but it did`
      );
    }

    return r(
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

    if (expectedError === error) {
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

function r(pass: boolean, message: string): MatchResponse {
  return {
    pass,
    message: () => message,
  };
}

export default {};
