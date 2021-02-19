import test from 'ava';

import sinon from 'sinon';

import rbacMiddleware from './rbac-middleware';
import getLogger from '../../test/fixtures/no-logger';
import ffStore from '../../test/fixtures/fake-feature-toggle-store';
import User from '../user';
import perms from '../permissions';

let config: any;
let featureToggleStore: any;

test.beforeEach(() => {
    featureToggleStore = ffStore();
    config = {
        getLogger,
        stores: {
            featureToggleStore,
        },
        experimental: {
            rbac: false,
        },
    };
});

test('should be disabled if rbac is disabled', t => {
    const accessService = {};

    const func = rbacMiddleware(config, { accessService });

    const cb = sinon.fake();

    func(undefined, undefined, cb);

    t.true(cb.calledOnce);
});

test('should add checkRbac to request if enabled', t => {
    config.experimental.rbac = true;

    const accessService = {};

    const func = rbacMiddleware(config, { accessService });

    const cb = sinon.fake();

    const req = sinon.fake();

    func(req, undefined, cb);

    t.truthy(req.checkRbac);
    t.is(typeof req.checkRbac, 'function');
});

test('should give api-user ADMIN permission', async t => {
    config.experimental.rbac = true;

    const accessService = {};

    const func = rbacMiddleware(config, { accessService });

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

    t.true(hasAccess);
});

test('should not give api-user ADMIN permission', async t => {
    config.experimental.rbac = true;

    const accessService = {};

    const func = rbacMiddleware(config, { accessService });

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

    t.false(hasAccess);
});

test('should not allow user to miss userId', async t => {
    config.experimental.rbac = true;

    const accessService = {};

    const func = rbacMiddleware(config, { accessService });

    const cb = sinon.fake();
    const req: any = {
        user: new User({
            username: 'user',
            permissions: [perms.ADMIN],
        }),
    };

    func(req, undefined, cb);

    const hasAccess = await req.checkRbac(perms.ADMIN);

    t.false(hasAccess);
});

test('should return false for missing user', async t => {
    config.experimental.rbac = true;

    const accessService = {};

    const func = rbacMiddleware(config, { accessService });

    const cb = sinon.fake();
    const req: any = {};

    func(req, undefined, cb);

    const hasAccess = await req.checkRbac(perms.ADMIN);

    t.false(hasAccess);
});

test('should verify permission for root resource', async t => {
    config.experimental.rbac = true;

    const accessService = {
        hasPermission: sinon.fake(),
    };

    const func = rbacMiddleware(config, { accessService });

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

    t.true(accessService.hasPermission.calledOnce);
    t.is(accessService.hasPermission.firstArg, req.user);
    t.is(accessService.hasPermission.args[0][1], perms.ADMIN);
    t.is(accessService.hasPermission.args[0][2], undefined);
});

test('should lookup projectId from params', async t => {
    config.experimental.rbac = true;

    const accessService = {
        hasPermission: sinon.fake(),
    };

    const func = rbacMiddleware(config, { accessService });

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

    t.is(accessService.hasPermission.args[0][2], req.params.projectId);
});

test('should lookup projectId from feature toggle', async t => {
    const projectId = 'some-project-33';
    const featureName = 'some-feature-toggle';
    config.experimental.rbac = true;

    const accessService = {
        hasPermission: sinon.fake(),
    };

    featureToggleStore.getProjectId = sinon.fake.returns(projectId);

    const func = rbacMiddleware(config, { accessService });

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

    t.is(accessService.hasPermission.args[0][2], projectId);
    t.is(featureToggleStore.getProjectId.firstArg, featureName);
});

test('should lookup projectId from data', async t => {
    const projectId = 'some-project-33';
    const featureName = 'some-feature-toggle';
    config.experimental.rbac = true;

    const accessService = {
        hasPermission: sinon.fake(),
    };

    const func = rbacMiddleware(config, { accessService });

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

    t.is(accessService.hasPermission.args[0][2], projectId);
});
