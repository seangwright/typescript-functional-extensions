import { Maybe } from '@/src/maybe';

describe('Maybe', () => {
  describe('scenarios', () => {
    test('nothing is done when there is no value', async () => {
      let functionCalls = 0;

      const user = await Maybe.tryFirst(
        getUsers(),
        (u) => u.hasConfirmedAccount
      )
        .tapAsync(sendPromotionalEmail)
        .bind(({ referralAccount }) => referralAccount)
        .tap(sendPromotionalEmail)
        .toPromise();

      function sendPromotionalEmail(user: User): Promise<void> {
        functionCalls++;
        return Promise.resolve();
      }

      expect(functionCalls).toBe(0);
      expect(user).toHaveNoValue();
    });
  });
});

type User = {
  email: string;
  firstName: string;
  lastName: string;
  id: string;
  roles: string[];
  hasConfirmedAccount: boolean;
  referralAccount: Maybe<User>;
};

function getUsers(): User[] {
  return [
    {
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      hasConfirmedAccount: false,
      referralAccount: Maybe.none(),
      id: '1234',
      roles: ['user'],
    },
  ];
}
