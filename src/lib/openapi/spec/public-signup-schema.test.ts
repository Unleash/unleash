import { validateSchema } from '../validate.js';
import type { PublicSignupTokenSchema } from './public-signup-token-schema.js';

test('publicSignupTokenSchema', () => {
    const data: PublicSignupTokenSchema = {
        name: 'Default',
        secret: 'some-secret',
        url: 'http://localhost:4242/invite-link/some-secret',
        expiresAt: new Date().toISOString(),
        users: [],
        role: { name: 'Viewer ', type: 'type', id: 1 },
        createdAt: new Date().toISOString(),
        createdBy: 'someone',
        enabled: true,
    };

    expect(
        validateSchema('#/components/schemas/publicSignupTokenSchema', {}),
    ).not.toBeUndefined();

    expect(
        validateSchema('#/components/schemas/publicSignupTokenSchema', data),
    ).toBeUndefined();
});
