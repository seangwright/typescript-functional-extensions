import { Result } from './result.js';
import { Unit } from './unit.js';
import {
  Action,
  ActionOfT,
  AsyncAction,
  AsyncActionOfT,
  AsyncFunctionOfT,
  AsyncFunctionOfTtoK,
  FunctionOfT,
  FunctionOfTtoK,
  isDefined,
  isFunction,
  isPromise,
  pipeFromArray,
  PredicateOfT,
  ResultMatcher,
  ResultMatcherNoReturn,
  Some,
} from './utilities.js';

/**
 * Allows to extract the Value of the given Result-Type
 * e.g. ResultValueOf<Result<string>> => string
 */
export type ResultAsyncValueOf<T> = T extends ResultAsync<
  infer TResultAsyncValue
>
  ? TResultAsyncValue
  : unknown;

export class PromiseRejection {
  constructor(public reason: string) {}
}

/**
 * Represents and asynchronous Result that could succeed with a value or fail with an error
 */
export class ResultAsync<TValue = Unit, TError = string> {
  /**
   * Combines several results (and any error messages) into a single result.
   * The returned result will be a failure if any of the input results are failures.
   *
   * @param results The Results to be combined.
   * @returns A Result that is a success when all the input results are also successes.
   */
  static combine<T extends Record<string, ResultAsync<unknown>>>(
    results: T
  ): ResultAsync<{ [K in keyof T]: ResultAsyncValueOf<T[K]> }> {
    const promises = Object.values(results).map((result) =>
      result.toPromise().catch((reason) => new PromiseRejection(reason))
    );

    const aggregatedPromise = Promise.all(promises).then((promiseResults) => {
      const errors: string[] = [];

      const mappedResults = Object.keys(results).reduce(
        (resultAsync, key, currentIndex) => {
          const currentResult = promiseResults[currentIndex];

          if (currentResult instanceof PromiseRejection) {
            errors.push(currentResult.reason);
          } else if (currentResult.isSuccess) {
            resultAsync[key] = currentResult.getValueOrThrow();
          } else if (currentResult.isFailure) {
            errors.push(currentResult.getErrorOrThrow());
          }
          return resultAsync;
        },
        {} as { [key: string]: unknown }
      );

      if (errors.length) {
        throw new Error(errors.join(', '));
      }

      return mappedResults;
    });

    return ResultAsync.try(
      aggregatedPromise as Promise<
        Some<{ [K in keyof T]: ResultAsyncValueOf<T[K]> }>
      >,
      (e) => (e instanceof Error ? e.message : 'An unknown error occurred')
    );
  }

  /**
   * Creates a new ResultAsync from the given Result
   * @param value a successful or failed Result
   * @returns
   */
  static from<TValue, TError>(
    value: Result<TValue, TError>
  ): ResultAsync<TValue, TError>;
  /**
   * Creates a new ResultAsync from the given Promise
   * @param value a Promise resolving to a Result
   */
  static from<TValue, TError>(
    value: Promise<Result<TValue, TError>>
  ): ResultAsync<TValue, TError>;
  /**
   * Creates a new ResultAsync from the given Promise
   * @param value a Promise which will be converted into a successful Result if it resolves
   * and a failed Result if it rejects
   */
  static from<TValue, TError>(
    value: Promise<Some<TValue>>
  ): ResultAsync<TValue, TError>;
  static from<TValue, TError>(
    value:
      | Result<TValue, TError>
      | Promise<Result<TValue, TError>>
      | Promise<Some<TValue>>
  ): ResultAsync<TValue, TError> {
    if (isPromise(value)) {
      return new ResultAsync(
        value.then((v) =>
          v instanceof Result ? v : Result.success<TValue, TError>(v)
        )
      );
    } else if (value instanceof Result) {
      return new ResultAsync(Promise.resolve(value));
    }

    throw new Error('Value must be a Promise or Result instance');
  }

  /**
   * Creates a new successful ResultAsync with the inner value
   * of the evaluated async function. If the Promise rejects, a failed ResultAsync will
   * be returned with an error created by the provided errorHandler
   * @param promise
   * @param errorHandler
   */
  static try<TValue, TError = string>(
    func: AsyncFunctionOfT<Some<TValue>>,
    errorHandler:
      | FunctionOfTtoK<unknown, Some<TError>>
      | AsyncFunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<TValue, TError>;
  static try<TError = string>(
    func: AsyncAction,
    errorHandler:
      | FunctionOfTtoK<unknown, Some<TError>>
      | AsyncFunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<Unit, TError>;
  /**
   * Creates a new successful ResultAsync with the inner value
   * of the given Promise. If the Promise rejects, a failed ResultAsync will
   * be returned with an error created by the provided errorHandler
   * @param promise
   * @param errorHandler
   */
  static try<TValue, TError = string>(
    promise: Promise<Some<TValue>>,
    errorHandler:
      | FunctionOfTtoK<unknown, Some<TError>>
      | AsyncFunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<TValue, TError>;
  /**
   * Creates a new successful ResultAsync with a Unit value.
   * If the Promise rejects, a failed ResultAsync will
   * be returned with an error created by the provided errorHandler
   * @param promise
   * @param errorHandler
   */
  static try<TError = string>(
    promise: Promise<void>,
    errorHandler:
      | FunctionOfTtoK<unknown, Some<TError>>
      | AsyncFunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<Unit, TError>;
  static try<TValue = Unit, TError = string>(
    promiseOrFunction:
      | Promise<Some<TValue>>
      | Promise<void>
      | AsyncFunctionOfT<Some<TValue>>
      | AsyncAction,
    errorHandler:
      | FunctionOfTtoK<unknown, Some<TError>>
      | AsyncFunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<TValue, TError> {
    if (isPromise(promiseOrFunction)) {
      return new ResultAsync(
        promiseOrFunction
          .then((value) => Result.success<TValue, TError>(value!))
          .catch(unwrapHandledError(errorHandler))
      );
    }

    try {
      return new ResultAsync(
        promiseOrFunction()
          .then((value) => Result.success<TValue, TError>(value!))
          .catch(unwrapHandledError(errorHandler))
      );
    } catch (error: unknown) {
      return new ResultAsync(
        unwrapHandledError<TValue, TError>(errorHandler)(error)
      );
    }
  }

  /**
   * Creates a new successful ResultAsync with a Unit value
   */
  static success<TError = string>(): ResultAsync<Unit, TError>;
  /**
   * Creates a new successful ResultAsync with the given value
   * @param value
   */
  static success<TValue, TError = string>(
    value: Some<TValue>
  ): ResultAsync<TValue, TError>;
  static success<TValue, TError = string>(
    value?: Some<TValue>
  ): ResultAsync<TValue, TError> {
    const result = isDefined(value)
      ? Result.success<TValue, TError>(value)
      : (Result.success<Unit, TError>(Unit.Instance) as Result<TValue, TError>);

    return new ResultAsync(Promise.resolve(result));
  }

  /**
   * Creates a new failed ResultAsync with the given error
   * @param error
   */
  static failure<TValue = Unit, TError = string>(
    error: Some<TError>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(Promise.resolve(Result.failure(error)));
  }

  private value: Promise<Result<TValue, TError>>;

  protected constructor(value: Promise<Result<TValue, TError>>) {
    this.value = value;
  }

  /**
   * True if the Result was successful
   */
  get isSuccess(): Promise<boolean> {
    return this.value.then((r) => r.isSuccess);
  }

  /**
   * True if the Result failed
   */
  get isFailure(): Promise<boolean> {
    return this.value.then((r) => r.isFailure);
  }

  /**
   * Will return the inner value created from executing the Result
   * if it was successful, otherwise it will throw an Error
   * @returns the result of a successful Result
   */
  getValueOrThrow(): Promise<Some<TValue>> {
    return this.value.then((r) => r.getValueOrThrow());
  }

  /**
   * Gets the value of a successful ResultAsync, and a default value if the ResultAsync failed
   * @param defaultValue returned if the ResultAsync was not successful
   */
  getValueOrDefault(defaultValue: Some<TValue>): Promise<Some<TValue>>;
  /**
   * Gets the value of a successful ResultAsync, and a default value if the ResultAsync failed
   * @param valueFactory executed and returned if the ResultAsync was not successful
   */
  getValueOrDefault(
    valueFactory: FunctionOfT<Some<TValue>>
  ): Promise<Some<TValue>>;
  getValueOrDefault(
    defaultOrValueFactory: Some<TValue> | FunctionOfT<Some<TValue>>
  ): Promise<Some<TValue>> {
    return this.value.then((r) =>
      isFunction(defaultOrValueFactory)
        ? r.getValueOrDefault(defaultOrValueFactory)
        : r.getValueOrDefault(defaultOrValueFactory)
    );
  }

  /**
   * Will return the inner error value of the Result
   * if it failed, otherwise it will throw an Error
   * @returns the error of a failed Result
   */
  getErrorOrThrow(): Promise<Some<TError>> {
    return this.value.then((r) => r.getErrorOrThrow());
  }

  /**
   * Gets the error of a failed ResultAsync, and a default value if the ResultAsync was successful
   * @param defaultError returned if the Result was successful
   */
  getErrorOrDefault(defaultError: Some<TError>): Promise<Some<TError>>;
  /**
   * Gets the error of a failed ResultAsync, and a default value if the ResultAsync was successful
   * @param errorCreator executed and returned if the Result was successful
   */
  getErrorOrDefault(
    errorCreator: FunctionOfT<Some<TError>>
  ): Promise<Some<TError>>;
  getErrorOrDefault(
    defaultOrErrorCreator: Some<TError> | FunctionOfT<Some<TError>>
  ): Promise<Some<TError>> {
    return this.value.then((r) => {
      return isFunction(defaultOrErrorCreator)
        ? r.getErrorOrDefault(defaultOrErrorCreator)
        : r.getErrorOrDefault(defaultOrErrorCreator);
    });
  }

  /**
   * Checks the value of a given predicate against the Result's inner value,
   * if the Result already succeeded
   * @param predicate check against the Result's inner value
   * @param errorOrErrorCreator either an error value or a function to create an error from the Result's inner value
   * @returns a successful ResultAsync if the predicate is true, and a failed one if not
   */
  ensure(
    predicate: PredicateOfT<TValue>,
    errorOrErrorCreator:
      | Some<TError>
      | FunctionOfTtoK<TValue, Some<TError>>
      | AsyncFunctionOfTtoK<TValue, Some<TError>>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then(async (result) => {
        if (result.isFailure) {
          return result;
        }

        const value = result.getValueOrThrow();

        if (predicate(value)) {
          return result;
        }

        if (!isFunction(errorOrErrorCreator)) {
          return Result.failure(errorOrErrorCreator);
        }

        return unwrapHandledError<TValue, TError, TValue>(errorOrErrorCreator)(
          value
        );
      })
    );
  }

  pipe(): ResultAsync<TValue, TError>;
  pipe<A, AE>(op1: ResultAsyncOpFn<TValue, TError, A, AE>): ResultAsync<A, AE>;
  pipe<A, AE, B, BE>(
    op1: ResultAsyncOpFn<TValue, TError, A, AE>,
    op2: ResultAsyncOpFn<A, AE, B, BE>
  ): ResultAsync<B, BE>;
  pipe<A, AE, B, BE, C, CE>(
    op1: ResultAsyncOpFn<TValue, TError, A, AE>,
    op2: ResultAsyncOpFn<A, AE, B, BE>,
    op3: ResultAsyncOpFn<B, BE, C, CE>
  ): ResultAsync<C, CE>;
  pipe<A, AE, B, BE, C, CE, D, DE>(
    op1: ResultAsyncOpFn<TValue, TError, A, AE>,
    op2: ResultAsyncOpFn<A, AE, B, BE>,
    op3: ResultAsyncOpFn<B, BE, C, CE>,
    op4: ResultAsyncOpFn<C, CE, D, DE>
  ): ResultAsync<D, DE>;
  pipe<A, AE, B, BE, C, CE, D, DE, E, EE>(
    op1: ResultAsyncOpFn<TValue, TError, A, AE>,
    op2: ResultAsyncOpFn<A, AE, B, BE>,
    op3: ResultAsyncOpFn<B, BE, C, CE>,
    op4: ResultAsyncOpFn<C, CE, D, DE>,
    op5: ResultAsyncOpFn<D, DE, E, EE>
  ): ResultAsync<E, EE>;
  pipe<A, AE, B, BE, C, CE, D, DE, E, EE, F, FE>(
    op1: ResultAsyncOpFn<TValue, TError, A, AE>,
    op2: ResultAsyncOpFn<A, AE, B, BE>,
    op3: ResultAsyncOpFn<B, BE, C, CE>,
    op4: ResultAsyncOpFn<C, CE, D, DE>,
    op5: ResultAsyncOpFn<D, DE, E, EE>,
    op6: ResultAsyncOpFn<E, EE, F, FE>
  ): ResultAsync<F, FE>;
  pipe<A, AE, B, BE, C, CE, D, DE, E, EE, F, FE, G, GE>(
    op1: ResultAsyncOpFn<TValue, TError, A, AE>,
    op2: ResultAsyncOpFn<A, AE, B, BE>,
    op3: ResultAsyncOpFn<B, BE, C, CE>,
    op4: ResultAsyncOpFn<C, CE, D, DE>,
    op5: ResultAsyncOpFn<D, DE, E, EE>,
    op6: ResultAsyncOpFn<E, EE, F, FE>,
    op7: ResultAsyncOpFn<F, FE, G, GE>
  ): ResultAsync<G, GE>;
  pipe<A, AE, B, BE, C, CE, D, DE, E, EE, F, FE, G, GE, H, HE>(
    op1: ResultAsyncOpFn<TValue, TError, A, AE>,
    op2: ResultAsyncOpFn<A, AE, B, BE>,
    op3: ResultAsyncOpFn<B, BE, C, CE>,
    op4: ResultAsyncOpFn<C, CE, D, DE>,
    op5: ResultAsyncOpFn<D, DE, E, EE>,
    op6: ResultAsyncOpFn<E, EE, F, FE>,
    op7: ResultAsyncOpFn<F, FE, G, GE>,
    op8: ResultAsyncOpFn<G, GE, H, HE>
  ): ResultAsync<H, HE>;
  /**
   * Executes the given operator functions, creating a custom pipeline
   * @param operations ResultAsync operation functions
   * @returns
   */
  pipe(...operations: FunctionOfTtoK<any, any>[]): ResultAsync<any, any> {
    return pipeFromArray(operations)(this);
  }

  /**
   * Converts the value of a successful ResultAsync to a new value.
   * @param projection an async function which accepts the current value as a parameter and returns a new value
   */
  map<TNewValue>(
    projection: AsyncFunctionOfTtoK<TValue, Some<TNewValue>>
  ): ResultAsync<TNewValue, TError>;
  /**
   * Converts the value of a successful ResultAsync to a new value.
   * @param projection function which accepts the current value as a parameter and returns a new value
   */
  map<TNewValue>(
    projection: FunctionOfTtoK<TValue, Some<TNewValue>>
  ): ResultAsync<TNewValue, TError>;
  map<TNewValue>(
    projection:
      | AsyncFunctionOfTtoK<TValue, Some<TNewValue>>
      | FunctionOfTtoK<TValue, Some<TNewValue>>
  ): ResultAsync<TNewValue, TError> {
    return new ResultAsync(
      this.value.then((r) => {
        if (r.isFailure) {
          return Result.failure(r.getErrorOrThrow());
        }

        const promiseOrValue = projection(r.getValueOrThrow());

        if (isPromise(promiseOrValue)) {
          return promiseOrValue.then((v) => Result.success(v));
        }

        return Result.success(promiseOrValue);
      })
    );
  }

  /**
   * Converts the error of a failed ResultAsync to a new error
   * @param projection an async function given the error of a failed ResultAsync which returns a new error
   */
  mapError<TNewError>(
    projection: AsyncFunctionOfTtoK<TError, Some<TNewError>>
  ): ResultAsync<TValue, TNewError>;
  /**
   * Converts the error of a failed ResultAsync to a new error
   * @param projection a function given the error of a failed ResultAsync which returns a new error
   */
  mapError<TNewError>(
    projection: FunctionOfTtoK<TError, Some<TNewError>>
  ): ResultAsync<TValue, TNewError>;
  mapError<TNewError>(
    projection:
      | AsyncFunctionOfTtoK<TError, Some<TNewError>>
      | FunctionOfTtoK<TError, Some<TNewError>>
  ): ResultAsync<TValue, TNewError> {
    return new ResultAsync(
      this.value.then((r) => {
        if (r.isSuccess) {
          return Result.success(r.getValueOrThrow());
        }

        const promiseOrError = projection(r.getErrorOrThrow());

        if (isPromise(promiseOrError)) {
          return promiseOrError.then((e) => Result.failure(e));
        }

        return Result.failure(promiseOrError);
      })
    );
  }

  /**
   * Converts a failed Result into a successful one
   * @param projection an async function that maps the error of the current ResultAsync to a value
   */
  mapFailure(
    projection: AsyncFunctionOfTtoK<TError, Some<TValue>>
  ): ResultAsync<TValue, TError>;
  /**
   * Converts a failed Result into a successful one
   * @param projection a function that maps the error of the current ResultAsync to a value
   */
  mapFailure(
    projection: FunctionOfTtoK<TError, Some<TValue>>
  ): ResultAsync<TValue, TError>;
  mapFailure(
    projection:
      | AsyncFunctionOfTtoK<TError, Some<TValue>>
      | FunctionOfTtoK<TError, Some<TValue>>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then((r) => {
        if (r.isSuccess) {
          return r;
        }

        const valueOrPromise = projection(r.getErrorOrThrow());

        if (isPromise(valueOrPromise)) {
          return valueOrPromise.then((v) => Result.success(v));
        }

        return Result.success(valueOrPromise);
      })
    );
  }

  /**
   * Maps the successful ResultAsync to a new Result, which is wrapped in a ResultAsync
   * @param projection a function given the value of the successful ResultAsync which returns a new Result
   */
  bind<TNewValue>(
    projection: FunctionOfTtoK<TValue, Result<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError>;
  /**
   * Maps the successful ResultAsync to a new ResultAsync
   * @param projection a function given the value of the successful ResultAsync which returns a new ResultAsync
   */
  bind<TNewValue>(
    projection: FunctionOfTtoK<TValue, ResultAsync<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError>;
  bind<TNewValue>(
    projection:
      | FunctionOfTtoK<TValue, Result<TNewValue, TError>>
      | FunctionOfTtoK<TValue, ResultAsync<TNewValue, TError>>
  ): ResultAsync<TNewValue, TError> {
    return new ResultAsync(
      this.value.then((r) => {
        if (r.isFailure) {
          return Result.failure(r.getErrorOrThrow());
        }

        const resultOrResultAsync = projection(r.getValueOrThrow());

        if (resultOrResultAsync instanceof Result) {
          return resultOrResultAsync;
        }

        return resultOrResultAsync.toPromise();
      })
    );
  }

  /**
   * Maps a failed ResultAsync to a new ResultAsync
   * @deprecated Please use `compensate` instead
   * @param projection
   * @returns
   */
  bindFailure(
    projection: FunctionOfTtoK<
      TError,
      Result<TValue, TError> | ResultAsync<TValue, TError>
    >
  ): ResultAsync<TValue, TError> {
    return this.compensate(projection);
  }

  /**
   * Maps a failed ResultAsync to a new ResultAsync
   * @param projection
   * @returns
   */
  compensate(
    projection: FunctionOfTtoK<
      TError,
      Result<TValue, TError> | ResultAsync<TValue, TError>
    >
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then((r) => {
        if (r.isSuccess) {
          return Result.success(r.getValueOrThrow());
        }

        const resultOrResultAsync = projection(r.getErrorOrThrow());

        return resultOrResultAsync instanceof Result
          ? resultOrResultAsync
          : resultOrResultAsync.toPromise();
      })
    );
  }

  /**
   * Executes the given async action if the ResultAsync is successful
   * @param action an async function given the value of the successful ResultAsync
   */
  tap(asyncAction: AsyncActionOfT<TValue>): ResultAsync<TValue, TError>;

  /**
   * Executes the given action if the ResultAsync is successful
   * @param action a function given the value of the successful ResultAsync
   */
  tap(action: ActionOfT<TValue>): ResultAsync<TValue, TError>;
  tap(
    action: ActionOfT<TValue> | AsyncActionOfT<TValue>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then(async (originalResult) => {
        if (originalResult.isFailure) {
          return originalResult;
        }

        const voidOrPromise = action(originalResult.getValueOrThrow());

        if (isPromise(voidOrPromise)) {
          await voidOrPromise;
        }

        return originalResult;
      })
    );
  }

  /**
   * Executes the action if the condition is true and the ResultAsync is successful
   * @param condition a boolean value
   * @param action a function given the inner value of the successful ResultAsync
   * @returns
   */
  tapIf(
    condition: boolean,
    action: ActionOfT<TValue>
  ): ResultAsync<TValue, TError>;
  /**
   * Executes the action if the predicate is true and the ResultAsync is successful
   * @param predicate a function given the inner value of the successful ResultAsync which returns a boolean value
   * @param action a function given the inner value of the successful ResultAsync
   * @returns
   */
  tapIf(
    predicate: PredicateOfT<TValue>,
    action: ActionOfT<TValue>
  ): ResultAsync<TValue, TError>;
  tapIf(
    conditionOrPredicate: boolean | PredicateOfT<TValue>,
    action: ActionOfT<TValue>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then((r) => {
        return isFunction(conditionOrPredicate)
          ? r.tapIf(conditionOrPredicate, action)
          : r.tapIf(conditionOrPredicate, action);
      })
    );
  }

  /**
   * Executes the given async action if the ResultAsync is successful or failed
   * @param action an async function
   * @returns the current ResultAsync wrapping the inner Result
   */
  tapEither(asyncAction: AsyncAction): ResultAsync<TValue, TError>;
  /**
   * Executes the given action if the ResultAsync is successful or failed
   * @param action a function
   * @returns the current ResultAsync wrapping the inner Result
   */
  tapEither(action: Action): ResultAsync<TValue, TError>;
  tapEither(action: Action | AsyncAction): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then(async (originalResult) => {
        const actionResult = action();

        if (actionResult instanceof Promise) {
          await actionResult;
        }

        return originalResult;
      })
    );
  }

  /**
   *
   * @param matcher
   */
  match<TNewValue>(
    matcher: ResultMatcher<TValue, TError, TNewValue>
  ): Promise<Some<TNewValue>>;
  match(matcher: ResultMatcherNoReturn<TValue, TError>): Promise<Unit>;
  match<TNewValue>(
    matcher:
      | ResultMatcher<TValue, TError, TNewValue>
      | ResultMatcherNoReturn<TValue, TError>
  ): Promise<Some<TNewValue> | Unit> {
    return this.value.then((r) => r.match(matcher));
  }

  /**
   * Maps both failed and successful ResultAsync to a new value
   * @param projection a function given the inner Result of the ResultAsync that returns a new value
   * @returns
   */
  finally<TNewValue>(
    projection: FunctionOfTtoK<Result<TValue, TError>, Some<TNewValue>>
  ): Promise<Some<TNewValue>> {
    return this.value.then((r) => r.finally(projection));
  }

  /**
   * Executes the given action when the ResultAsync is failed
   * @param action a function given the inner error of the failed ResultAsync
   */
  tapFailure(action: AsyncActionOfT<TError>): ResultAsync<TValue, TError>;
  /**
   * Executes the given async action with the ResultAsync is failed
   * @param action an async function given the inner error of the failed ResultAsync
   */
  tapFailure(action: ActionOfT<TError>): ResultAsync<TValue, TError>;
  tapFailure(
    action: ActionOfT<TError> | AsyncActionOfT<TError>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then(async (r) => {
        if (r.isSuccess) {
          return r;
        }

        const error = r.getErrorOrThrow();

        const result = action(error);

        if (isPromise(result)) {
          await result;
        }

        return Result.failure(error);
      })
    );
  }

  /**
   * Attemps the given async action if the ResultAsync is successful, converting any rejected Promises into a failed ResultAsync
   * @param action an async function given the inner value of a successful ResultAsync
   * @param errorHandler a function that converts the value of a rejected Promise into an error for the failed ResultAsync
   */
  onSuccessTry(
    action: AsyncActionOfT<TValue>,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<TValue, TError>;
  /**
   * Attempts the given action if the ResultAsync is successful, converting any thrown errors into a failed ResultAsync
   * @param action a function given the inner value of a successful ResultAsync
   * @param errorHandler a function that converts an error thrown by the action into an error for the failed ResultAsync
   */
  onSuccessTry(
    action: ActionOfT<TValue>,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<TValue, TError>;
  onSuccessTry(
    action: ActionOfT<TValue> | AsyncActionOfT<TValue>,
    errorHandler: FunctionOfTtoK<unknown, Some<TError>>
  ): ResultAsync<TValue, TError> {
    return new ResultAsync(
      this.value.then(async (r) => {
        if (r.isFailure) {
          return r;
        }

        const value = r.getValueOrThrow();

        try {
          const result = action(value);

          if (isPromise(result)) {
            await result;
          }

          return Result.success(value);
        } catch (error: unknown) {
          return Result.failure(errorHandler(error));
        }
      })
    );
  }

  /**
   * Returns the inner Promise, wrapping a failed Result for a rejected Promise with the
   * given errorHandler if provided, othewise rejected Promise handling
   * is left to the caller.
   * @param errorHandler a value or Promise returning error handler that converts a rejected Promise
   *  to a failed Result.
   * @returns
   */
  toPromise(
    errorHandler?:
      | FunctionOfTtoK<unknown, Some<TError>>
      | AsyncFunctionOfTtoK<unknown, Some<TError>>
  ): Promise<Result<TValue, TError>> {
    if (!isDefined(errorHandler)) {
      return this.value;
    }

    return this.value.catch(unwrapHandledError(errorHandler));
  }
}

function unwrapHandledError<TValue, TError, TErrorSource = unknown>(
  errorHandler:
    | FunctionOfTtoK<TErrorSource, Some<TError>>
    | AsyncFunctionOfTtoK<TErrorSource, Some<TError>>
): (error: TErrorSource) => Promise<Result<TValue, TError>> {
  return async (error) => {
    const handledResultOrPromise = errorHandler(error);

    if (handledResultOrPromise instanceof Promise) {
      const unwrappedResult = await handledResultOrPromise;
      return Result.failure<TValue, TError>(unwrappedResult);
    }

    return Result.failure<TValue, TError>(handledResultOrPromise);
  };
}

export type ResultAsyncOpFn<A, AE, B, BE> = FunctionOfTtoK<
  ResultAsync<A, AE>,
  ResultAsync<B, BE>
>;
