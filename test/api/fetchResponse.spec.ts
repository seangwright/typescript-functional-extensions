import { fetchResponse } from '@/src/api';

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
  });
});
