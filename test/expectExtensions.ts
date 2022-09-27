import { Maybe } from '@/src/maybe';
import { Result } from '@/src/result';
import { FunctionOfT, isDefined, isFunction } from '@/src/utilities';
import { expect } from 'vitest';

expect.extend({
  toHaveNoValue(received: unknown) {
    if (!(received instanceof Maybe)) {
      throw new Error(
        `${received} must be an instance of Maybe to use this assertion`
      );
    }

    return received.hasNoValue
      ? r(
          true,
          () =>
            `expected ${received} to have no value, but it has a value [${received.getValueOrThrow()}]`
        )
      : r(false, `expected ${received} to have a value, but it has none`);
  },
  toHaveValue(received: unknown, expectedValue: unknown): MatchResponse {
    if (!(received instanceof Maybe)) {
      throw new Error(
        `${received} must be an instance of Maybe to use this assertion`
      );
    }

    if (received.hasNoValue) {
      return r(
        false,
        `expected [${received}] to have a value [${expectedValue}], but it has none`
      );
    }

    const value = received.getValueOrThrow();

    return this.equals(value, expectedValue)
      ? r(
          true,
          `expected [${received}] to have a value [${expectedValue}], but it has a value of [${value}]`
        )
      : r(
          false,
          `expected [${received}] to not have a value [${expectedValue}] but id does`
        );
  },
  toSucceed(received: unknown): MatchResponse {
    if (!(received instanceof Result)) {
      throw new Error(
        `${received} must be an instance of Result to use this assertion`
      );
    }

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
  toSucceedWith(received: unknown, expectedValue?: unknown): MatchResponse {
    if (!(received instanceof Result)) {
      throw new Error(
        `${received} must be an instance of Result to use this assertion`
      );
    }

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

    return this.equals(expectedValue, value)
      ? r(
          true,
          `expected [${received}] to be successful but not have value [${expectedValue}] but it did`
        )
      : r(
          false,
          `expected [${received}] to have value [${expectedValue}], but found value [${value}]`
        );
  },
  toFail(received: unknown) {
    if (!(received instanceof Result)) {
      throw new Error(
        `${received} must be an instance of Result to use this assertion`
      );
    }

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
  toFailWith(received: unknown, expectedError: unknown): MatchResponse {
    if (!(received instanceof Result)) {
      throw new Error(
        `${received} must be an instance of Result to use this assertion`
      );
    }

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

    if (this.equals(error, expectedError)) {
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
