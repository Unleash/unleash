import rbacMiddleware from './rbac-middleware';
import User from '../types/user';
import * as perms from '../types/permissions';
import { IUnleashConfig } from '../types/option';
import { createTestConfig } from '../../test/config/test-config';
import ApiUser from '../types/api-user';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';
import FakeFeatureToggleStore from '../../test/fixtures/fake-feature-toggle-store';
import { ApiTokenType } from '../types/models/api-token';

let config: IUnleashConfig;
let featureToggleStore: IFeatureToggleStore;

beforeEach(() => {
    featureToggleStore = new FakeFeatureToggleStore();
    config = createTestConfig();
});

test('should add checkRbac to request', () => {
    const accessService = {
        hasPermission: jest.fn(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = jest.fn();

    const req = jest.fn();

    func(req, undefined, cb);

    // @ts-ignore
    expect(req.checkRbac).toBeTruthy();
    // @ts-ignore
    expect(typeof req.checkRbac).toBe('function');
});

test('should give api-user ADMIN permission', async () => {
    const accessService = {
        hasPermission: jest.fn(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = jest.fn();
    const req: any = {
        user: new ApiUser({
            username: 'api',
            permissions: [perms.ADMIN],
            project: '*',
            environment: '*',
            type: ApiTokenType.ADMIN,
            secret: 'a',
        }),
    };

    func(req, undefined, cb);

    const hasAccess = await req.checkRbac(perms.ADMIN);

    expect(hasAccess).toBe(true);
});

test('should not give api-user ADMIN permission', async () => {
    const accessService = {
        hasPermission: jest.fn(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = jest.fn();
    const req: any = {
        user: new ApiUser({
            username: 'api',
            permissions: [perms.CLIENT],
            project: '*',
            environment: '*',
            type: ApiTokenType.CLIENT,
            secret: 'a',
        }),
    };

    func(req, undefined, cb);

    const hasAccess = await req.checkRbac(perms.ADMIN);

    expect(hasAccess).toBe(false);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(0);
});

test('should not allow user to miss userId', async () => {
    jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());
    const accessService = {
        hasPermission: jest.fn(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = jest.fn();
    const req: any = {
        user: {
            username: 'user',
        },
    };

    func(req, undefined, cb);

    const hasAccess = await req.checkRbac(perms.ADMIN);

    expect(hasAccess).toBe(false);
});

test('should return false for missing user', async () => {
    jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());
    const accessService = {
        hasPermission: jest.fn(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = jest.fn();
    const req: any = {};

    func(req, undefined, cb);

    const hasAccess = await req.checkRbac(perms.ADMIN);

    expect(hasAccess).toBe(false);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(0);
});

test('should verify permission for root resource', async () => {
    const accessService = {
        hasPermission: jest.fn(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = jest.fn();
    const req: any = {
        user: new User({
            username: 'user',
            id: 1,
        }),
        params: {},
    };

    func(req, undefined, cb);

    await req.checkRbac(perms.ADMIN);

    expect(accessService.hasPermission).toHaveBeenCalledTimes(1);
    expect(accessService.hasPermission).toHaveBeenCalledWith(
        req.user,
        perms.ADMIN,
        undefined,
        undefined,
    );
});

test('should lookup projectId from params', async () => {
    const accessService = {
        hasPermission: jest.fn(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = jest.fn();
    const req: any = {
        user: new User({
            username: 'user',
            id: 1,
        }),
        params: {
            projectId: 'some-proj',
        },
    };

    func(req, undefined, cb);

    await req.checkRbac(perms.UPDATE_PROJECT);

    expect(accessService.hasPermission).toHaveBeenCalledWith(
        req.user,
        perms.UPDATE_PROJECT,
        req.params.projectId,
        undefined,
    );
});

test('should lookup projectId from feature toggle', async () => {
    const projectId = 'some-project-33';
    const featureName = 'some-feature-toggle';

    const accessService = {
        hasPermission: jest.fn(),
    };

    featureToggleStore.getProjectId = jest.fn().mockReturnValue(projectId);

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = jest.fn();
    const req: any = {
        user: new User({
            username: 'user',
            id: 1,
        }),
        params: {
            featureName,
        },
    };

    func(req, undefined, cb);

    await req.checkRbac(perms.UPDATE_FEATURE);

    expect(accessService.hasPermission).toHaveBeenCalledWith(
        req.user,
        perms.UPDATE_FEATURE,
        projectId,
        undefined,
    );
});

test('should lookup projectId from data', async () => {
    const projectId = 'some-project-33';
    const featureName = 'some-feature-toggle';

    const accessService = {
        hasPermission: jest.fn(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = jest.fn();
    const req: any = {
        user: new User({
            username: 'user',
            id: 1,
        }),
        params: {},
        body: {
            featureName,
            project: projectId,
        },
    };

    func(req, undefined, cb);

    await req.checkRbac(perms.CREATE_FEATURE);

    expect(accessService.hasPermission).toHaveBeenCalledWith(
        req.user,
        perms.CREATE_FEATURE,
        projectId,
        undefined,
    );
});

test('Does not double check permission if not changing project when updating toggle', async () => {
    const oldProjectId = 'some-project-34';
    const featureName = 'some-feature-toggle';
    const accessService = {
        hasPermission: jest.fn().mockReturnValue(true),
    };
    featureToggleStore.getProjectId = jest.fn().mockReturnValue(oldProjectId);

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);
    const cb = jest.fn();
    const req: any = {
        user: new User({ username: 'user', id: 1 }),
        params: { featureName },
        body: { featureName, project: oldProjectId },
    };
    func(req, undefined, cb);

    await req.checkRbac(perms.UPDATE_FEATURE);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(1);
    expect(accessService.hasPermission).toHaveBeenCalledWith(
        req.user,
        perms.UPDATE_FEATURE,
        oldProjectId,
        undefined,
    );
});

test('UPDATE_TAG_TYPE does not need projectId', async () => {
    const accessService = {
        hasPermission: jest.fn().mockReturnValue(true),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);
    const cb = jest.fn();
    const req: any = {
        user: new User({ username: 'user', id: 1 }),
        params: {},
        body: { name: 'new-tag-type', description: 'New tag type for testing' },
    };
    func(req, undefined, cb);

    await req.checkRbac(perms.UPDATE_TAG_TYPE);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(1);
    expect(accessService.hasPermission).toHaveBeenCalledWith(
        req.user,
        perms.UPDATE_TAG_TYPE,
        undefined,
        undefined,
    );
});

test('DELETE_TAG_TYPE does not need projectId', async () => {
    const accessService = {
        hasPermission: jest.fn().mockReturnValue(true),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);
    const cb = jest.fn();
    const req: any = {
        user: new User({ username: 'user', id: 1 }),
        params: {},
        body: { name: 'new-tag-type', description: 'New tag type for testing' },
    };
    func(req, undefined, cb);

    await req.checkRbac(perms.DELETE_TAG_TYPE);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(1);
    expect(accessService.hasPermission).toHaveBeenCalledWith(
        req.user,
        perms.DELETE_TAG_TYPE,
        undefined,
        undefined,
    );
});
