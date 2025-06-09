import { DEFAULT_ENV } from '../server-impl.js';
import { ALL } from '../types/models/api-token.js';
import { createApiToken } from './api-token-schema.js';

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
        expect(error).toBeUndefined();
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

test('should have a projects entry consisting of ALL if projects is missing', async () => {
    const token = await createApiToken.validateAsync({
        tokenName: 'test',
        type: 'client',
    });
    expect(token.projects).toMatchObject([ALL]);
});

test('should not have project set after validation if project is present', async () => {
    const token = await createApiToken.validateAsync({
        tokenName: 'test',
        type: 'client',
        project: 'default',
    });
    expect(token.project).not.toBeDefined();
    expect(token.projects).toMatchObject([ALL]);
});

test('should allow for embedded proxy (frontend) key', async () => {
    const token = await createApiToken.validateAsync({
        tokenName: 'test',
        type: 'frontend',
        project: 'default',
    });
    expect(token.error).toBeUndefined();
});

test('should set environment to default environment for frontend key', async () => {
    const token = await createApiToken.validateAsync({
        tokenName: 'test',
        type: 'frontend',
    });
    expect(token.environment).toEqual(DEFAULT_ENV);
});
