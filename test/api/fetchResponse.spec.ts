import { fetchResponse } from '@/src/api';
import { Response } from 'cross-fetch';

describe('api', () => {
  describe('fetchResponse', () => {
    test('returns the Response on success', async () => {
      const resp = new Response('2');

      const sut = await fetchResponse(Promise.resolve(resp), (err) => 'Error')
        .map(async (resp) => await resp.text())
        .map((n) => parseInt(n, 10) + 1)
        .toPromise();

      expect(sut).toSucceedWith(3);
    });

    test('returns the error on rejected promises', async () => {
      const error = 'error';

      const sut = await fetchResponse(
        Promise.reject(error),
        (err) => err as string
      )
        .map(async (resp) => await resp.text())
        .map((n) => parseInt(n, 10) + 1)
        .toPromise();

      expect(sut).toFailWith(error);
    });

    test('returns the error on Responses with non-ok status codes', async () => {
      const error = 'kaboom';
      const resp = new Response(error, {
        status: 400,
        statusText: 'bad request',
      });

      const sut = await fetchResponse<string>(
        Promise.resolve(resp),
        async (err) => {
          if (typeof err === 'string') {
            return err;
          }

          if (err instanceof Response) {
            return await err.text();
          }

          return 'error';
        }
      )
        .map(async (resp) => await resp.text())
        .map((n) => parseInt(n, 10) + 1)
        .toPromise();

      expect(sut).toFailWith(error);
    });
  });
});
