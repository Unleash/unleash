import rbacMiddleware from './rbac-middleware';
import User from '../types/user';
import * as perms from '../types/permissions';
import { IUnleashConfig } from '../types/option';
import { createTestConfig } from '../../test/config/test-config';
import ApiUser from '../types/api-user';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';
import FakeFeatureToggleStore from '../../test/fixtures/fake-feature-toggle-store';

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
        }),
    };

    func(req, undefined, cb);

    const hasAccess = await req.checkRbac(perms.ADMIN);

    expect(hasAccess).toBe(false);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(0);
});

test('should not allow user to miss userId', async () => {
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
    );
});

test('Need access to UPDATE_FEATURE on the project you change to', async () => {
    const oldProjectId = 'some-project-34';
    const newProjectId = 'some-project-35';
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
        body: { featureName, project: newProjectId },
    };
    func(req, undefined, cb);

    await req.checkRbac(perms.UPDATE_FEATURE);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(2);
    expect(accessService.hasPermission).toHaveBeenNthCalledWith(
        1,
        req.user,
        perms.UPDATE_FEATURE,
        oldProjectId,
    );
    expect(accessService.hasPermission).toHaveBeenNthCalledWith(
        2,
        req.user,
        perms.UPDATE_FEATURE,
        newProjectId,
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
    );
});
