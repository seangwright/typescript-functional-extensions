import { Maybe } from './maybe';
import { isDefined, None, Some } from './utilities';

/**
 * Converts string, null, or undefined values into a Maybe<string>. Throws an error for defined, non-string values.
 * @param value
 * @returns Maybe.some when value is defined and non-empty, Maybe.none otherwise.
 */
export function emptyStringAsNone(value: Some<string> | None): Maybe<string> {
  if (!isDefined(value)) {
    return Maybe.none();
  }

  if (typeof value !== 'string') {
    throw Error('Value must be a string');
  }

  if (value === '') {
    return Maybe.none();
  }

  return Maybe.some(value);
}

const whiteSpaceRegex = /^\s*$/g;

/**
 * Converts string, null, or undefined values into a Maybe<string>. Throws an error for defined, non-string values.
 * @param value
 * @returns Maybe.some when value is defined, non-empty, and non-whitespace, Maybe.none otherwise.
 */
export function emptyOrWhiteSpaceStringAsNone(
  value: Some<string> | None
): Maybe<string> {
  if (!isDefined(value)) {
    return Maybe.none();
  }

  if (typeof value !== 'string') {
    throw Error('Value must be a string');
  }

  if (whiteSpaceRegex.test(value)) {
    return Maybe.none();
  }

  return Maybe.some(value);
}

/**
 * Converts number, null, or undefined values into a Maybe<number>. Throws an error for defined, non-number values.
 * @param value
 * @returns Maybe.some when value is defined and non-zero, Maybe.none otherwise.
 */
export function zeroAsNone(value: Some<number> | None): Maybe<number> {
  if (!isDefined(value)) {
    return Maybe.none();
  }

  if (typeof value !== 'number') {
    throw Error('Value must be a number');
  }

  if (value === 0) {
    return Maybe.none();
  }

  return Maybe.some(value);
}
