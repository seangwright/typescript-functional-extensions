import { Result } from './result';
import { ResultAsync } from './resultAsync';
import { Unit } from './unit';
import { Some } from './utilities';

/**
 * Wraps a fetch request generated Promise in a ResultAsync,
 * ensuring both connection errors and Http status code errors
 * are converted into failed Results.
 * The JSON response is unwrapped as object type specified by TValue. Use this for JSON responses.
 * @param request A Promise<Response> generated by a fetch() request
 * @param errorHandler Handles connection and Http status code errors
 * @returns ResultAsync representing the success/failure of the request
 */
export function fetchJsonResponse<TValue, TError = string>(
  request: Promise<Response>,
  errorHandler: (error: unknown) => Some<TError>
): ResultAsync<TValue, TError> {
  return ResultAsync.try<Response, TError>(request, (error: unknown) =>
    errorHandler(error)
  )
    .ensure((resp) => resp.ok, errorHandler)
    .map<TValue>((resp) => resp.json());
}

/**
 * Wraps a fetch request generated Promise in a ResultAsync,
 * ensuring both connection errors and Http status code errors
 * are converted into failed Results.
 * The response body is mapped to Unit. Use this for No Content responses.
 * @param request A Promise<Response> generated by a fetch() request
 * @param errorHandler Handles connection and Http status code errors
 * @returns ResultAsync representing the success/failure of the request
 */
export function fetchResponse<TError = string>(
  request: Promise<Response>,
  errorHandler: (error: unknown) => Some<TError>
): ResultAsync<Unit, TError> {
  return ResultAsync.try<Response, TError>(request, (error: unknown) =>
    errorHandler(error)
  )
    .ensure((resp) => resp.ok, errorHandler)
    .map(() => Result.success());
}
