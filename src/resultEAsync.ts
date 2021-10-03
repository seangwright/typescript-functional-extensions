import { ResultE } from './resultE';

export class ResultEAsync<TError> {
    static from<TError>(promise: Promise<ResultE<TError>>): ResultEAsync<TError> {
        return new ResultEAsync(promise);
    }

    private value: Promise<ResultE<TError>>;

    protected constructor(promise: Promise<ResultE<TError>>) {
        this.value = promise;
    }
}