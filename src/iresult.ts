export interface IResult<TValue, TError> {
  isSuccess: boolean;
  isFailure: boolean;

  failure(error: TError): IResult<TValue, TError>;
  success(value: TValue): IResult<TValue, TError>;
}
