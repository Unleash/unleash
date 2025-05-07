import { createApiToken } from './api-token-schema';

test('should allow for embedded proxy (frontend) key', async () => {
    const token = await createApiToken.validateAsync({
        tokenName: 'test',
        type: 'frontend',
    });
    expect(token.error).toBeUndefined();
});

test('should set environment to default for frontend key', async () => {
    const token = await createApiToken.validateAsync({
        tokenName: 'test',
        type: 'frontend',
    });
    expect(token.environment).toEqual('default');
});
