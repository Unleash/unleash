import sinon from 'sinon';

import rbacMiddleware from './rbac-middleware';
import ffStore from '../../test/fixtures/fake-feature-toggle-store';
import User from '../user';
import perms from '../permissions';
import { IUnleashConfig } from '../types/option';
import { createTestConfig } from '../../test/config/test-config';

let config: IUnleashConfig;
let featureToggleStore: any;

beforeEach(() => {
    featureToggleStore = ffStore();
    config = createTestConfig();
});

test('should add checkRbac to request', () => {
    const accessService = {
        hasPermission: sinon.fake(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = sinon.fake();

    const req = sinon.fake();

    func(req, undefined, cb);

    expect(req.checkRbac).toBeTruthy();
    expect(typeof req.checkRbac).toBe('function');
});

test('should give api-user ADMIN permission', async () => {
    const accessService = {
        hasPermission: sinon.fake(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = sinon.fake();
    const req: any = {
        user: new User({
            username: 'api',
            permissions: [perms.ADMIN],
            isAPI: true,
        }),
    };

    func(req, undefined, cb);

    const hasAccess = await req.checkRbac(perms.ADMIN);

    expect(hasAccess).toBe(true);
});

test('should not give api-user ADMIN permission', async () => {
    const accessService = {
        hasPermission: sinon.fake(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = sinon.fake();
    const req: any = {
        user: new User({
            username: 'api',
            permissions: [perms.CLIENT],
            isAPI: true,
        }),
    };

    func(req, undefined, cb);

    const hasAccess = await req.checkRbac(perms.ADMIN);

    expect(hasAccess).toBe(false);
    expect(accessService.hasPermission.callCount).toBe(0);
});

test('should not allow user to miss userId', async () => {
    const accessService = {
        hasPermission: sinon.fake(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = sinon.fake();
    const req: any = {
        user: new User({
            username: 'user',
            permissions: [perms.ADMIN],
        }),
    };

    func(req, undefined, cb);

    const hasAccess = await req.checkRbac(perms.ADMIN);

    expect(hasAccess).toBe(false);
});

test('should return false for missing user', async () => {
    const accessService = {
        hasPermission: sinon.fake(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = sinon.fake();
    const req: any = {};

    func(req, undefined, cb);

    const hasAccess = await req.checkRbac(perms.ADMIN);

    expect(hasAccess).toBe(false);
    expect(accessService.hasPermission.callCount).toBe(0);
});

test('should verify permission for root resource', async () => {
    const accessService = {
        hasPermission: sinon.fake(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = sinon.fake();
    const req: any = {
        user: new User({
            username: 'user',
            id: 1,
        }),
        params: {},
    };

    func(req, undefined, cb);

    await req.checkRbac(perms.ADMIN);

    expect(accessService.hasPermission.calledOnce).toBe(true);
    expect(accessService.hasPermission.firstArg).toBe(req.user);
    expect(accessService.hasPermission.args[0][1]).toBe(perms.ADMIN);
    expect(accessService.hasPermission.args[0][2]).toBe(undefined);
});

test('should lookup projectId from params', async () => {
    const accessService = {
        hasPermission: sinon.fake(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = sinon.fake();
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

    expect(accessService.hasPermission.args[0][2]).toBe(req.params.projectId);
});

test('should lookup projectId from feature toggle', async () => {
    const projectId = 'some-project-33';
    const featureName = 'some-feature-toggle';

    const accessService = {
        hasPermission: sinon.fake(),
    };

    featureToggleStore.getProjectId = sinon.fake.returns(projectId);

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = sinon.fake();
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

    expect(accessService.hasPermission.args[0][2]).toBe(projectId);
    expect(featureToggleStore.getProjectId.firstArg).toBe(featureName);
});

test('should lookup projectId from data', async () => {
    const projectId = 'some-project-33';
    const featureName = 'some-feature-toggle';

    const accessService = {
        hasPermission: sinon.fake(),
    };

    const func = rbacMiddleware(config, { featureToggleStore }, accessService);

    const cb = sinon.fake();
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

    expect(accessService.hasPermission.args[0][2]).toBe(projectId);
});
