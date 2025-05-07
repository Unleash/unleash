import { ALL } from '../types/models/api-token';
import { createApiToken } from './api-token-schema';

test('should ignore token extra project field', async () => {
    expect.assertions(0);
    try {
        await createApiToken.validateAsync({
            tokenName: 'test',
            type: 'client',
            project: 'default',
            projects: ['default'],
        });
    } catch (error) {
        expect(error.details[0].message).toBeUndefined();
    }
});

test('should not have default project set if projects is present', async () => {
    const token = await createApiToken.validateAsync({
        tokenName: 'test',
        type: 'client',
        projects: ['default'],
    });
    expect(token.project).not.toBeDefined();
});

test('should have project set to default if projects is missing', async () => {
    const token = await createApiToken.validateAsync({
        tokenName: 'test',
        type: 'client',
    });
    expect(token.projects).toMatchObject([ALL]);
});

test('should not have project set if project is present', async () => {
    const token = await createApiToken.validateAsync({
        tokenName: 'test',
        type: 'client',
    });
    expect(token.project).not.toBeDefined();
    expect(token.projects).toBeDefined();
});

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
