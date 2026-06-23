import { expect, test } from 'vitest';
import { anonymizeContext } from './anonymizeContext.js';

test('masks the email but keeps the rest of the context intact', () => {
    const anonymized = anonymizeContext({
        email: 'someone@example.com',
        userId: 42,
        properties: { clientId: 'abc' },
    });

    expect(anonymized).toStrictEqual({
        email: '***',
        userId: 42,
        properties: { clientId: 'abc' },
    });
});
