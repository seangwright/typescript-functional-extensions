import { Result } from './result';
import { ResultE } from './resultE';
import { ResultT } from './resultT';
import { ResultTE } from './resultTE';

export type Results =
  | typeof Result
  | typeof ResultT
  | typeof ResultTE
  | typeof ResultE;

export type ResultTType = typeof ResultT;

export type ResultType = typeof Result;
export type ResultEType = typeof ResultE;
export type ResultTEType = typeof ResultTE;

export function isResultTE<TValue, TError>(
  func: unknown
): func is ResultTE<TValue, TError> {
  return func === ResultTE;
}

export function isResultT<TValue>(func: unknown): func is ResultT<TValue> {
  return func === ResultT;
}

export function isResultE<TError>(func: unknown): func is ResultE<TError> {
  return func === ResultE;
}

export function isResult(f: unknown): f is Result {
  return f === Result;
}
