import { ALL } from '../types/models/api-token';
import { createApiToken } from './api-token-schema';

test('should reject token with projects and project', async () => {
    expect.assertions(1);
    try {
        await createApiToken.validateAsync({
            username: 'test',
            type: 'admin',
            project: 'default',
            projects: ['default'],
        });
    } catch (error) {
        expect(error.details[0].message).toEqual(
            '"project" must not exist simultaneously with [projects]',
        );
    }
});

test('should not have default project set if projects is present', async () => {
    let token = await createApiToken.validateAsync({
        username: 'test',
        type: 'admin',
        projects: ['default'],
    });
    expect(token.project).not.toBeDefined();
});

test('should have project set to default if projects is missing', async () => {
    let token = await createApiToken.validateAsync({
        username: 'test',
        type: 'admin',
    });
    expect(token.project).toBe(ALL);
});

test('should not have projects set if project is present', async () => {
    let token = await createApiToken.validateAsync({
        username: 'test',
        type: 'admin',
        project: 'default',
    });
    expect(token.projects).not.toBeDefined();
});

test('should allow for embedded proxy (frontend) key', async () => {
    let token = await createApiToken.validateAsync({
        username: 'test',
        type: 'frontend',
        project: 'default',
    });
    expect(token.error).toBeUndefined();
});

test('should set environment to default for frontend key', async () => {
    let token = await createApiToken.validateAsync({
        username: 'test',
        type: 'frontend',
        project: 'default',
    });
    expect(token.environment).toEqual('default');
});
