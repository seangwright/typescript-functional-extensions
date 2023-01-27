import { fetchJsonResponse } from '@/src/api';

describe('api', () => {
  describe('fetchJsonResponse', () => {
    test('returns the Response on success', async () => {
      const responseName = 'Beebo';
      const resp = new Response(JSON.stringify({ name: responseName }));

      const sut = await fetchJsonResponse<{ name: string }>(
        Promise.resolve(resp),
        (err) => 'Error'
      )
        .map(({ name }) => name)
        .toPromise();

      expect(sut).toSucceedWith(responseName);
    });

    test('returns the error on rejected promises', async () => {
      const error = 'error';

      const sut = await fetchJsonResponse<{ name: string }>(
        Promise.reject(error),
        (err) => err as string
      )
        .map(({ name }) => name)
        .toPromise();

      expect(sut).toFailWith(error);
    });

    test('returns the error on Responses with non-ok status codes', async () => {
      const error = 'kaboom';
      const resp = new Response(error, {
        status: 400,
        statusText: 'bad request',
      });

      const sut = await fetchJsonResponse<{ name: string }>(
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
        .map(({ name }) => name)
        .toPromise();

      expect(sut).toFailWith(error);
    });
  });
});
