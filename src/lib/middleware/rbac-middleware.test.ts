import rbacMiddleware, { type PermissionChecker } from './rbac-middleware.js';
import User from '../types/user.js';
import * as perms from '../types/permissions.js';
import type { IUnleashConfig } from '../types/option.js';
import { createTestConfig } from '../../test/config/test-config.js';
import ApiUser from '../types/api-user.js';
import type { IFeatureToggleStore } from '../features/feature-toggle/types/feature-toggle-store-type.js';
import FakeFeatureToggleStore from '../features/feature-toggle/fakes/fake-feature-toggle-store.js';
import { ApiTokenType } from '../types/model.js';
import { type ISegmentStore, SYSTEM_USER_ID } from '../types/index.js';
import FakeSegmentStore from '../../test/fixtures/fake-segment-store.js';

import { vi } from 'vitest';

let config: IUnleashConfig;
let featureToggleStore: IFeatureToggleStore;
let segmentStore: ISegmentStore;

beforeEach(() => {
    featureToggleStore = new FakeFeatureToggleStore();
    segmentStore = new FakeSegmentStore();
    config = createTestConfig();
});

test('should add checkRbac to request', () => {
    const accessService = {
        hasPermission: vi.fn(),
    } as PermissionChecker;

    const func = rbacMiddleware(
        config,
        { featureToggleStore, segmentStore },
        accessService,
    );

    const cb = vi.fn();

    const req = vi.fn();

    func(req, undefined, cb);

    // @ts-expect-error
    expect(req.checkRbac).toBeTruthy();
    // @ts-expect-error
    expect(typeof req.checkRbac).toBe('function');
});

test('should give api-user ADMIN permission', async () => {
    const accessService = {
        hasPermission: vi.fn(),
    } as PermissionChecker;

    const func = rbacMiddleware(
        config,
        { featureToggleStore, segmentStore },
        accessService,
    );

    const cb = vi.fn();
    const req: any = {
        user: new ApiUser({
            tokenName: 'api',
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

describe('ADMIN tokens should have user id -1337 when only passed through rbac-middleware', () => {
    /// Will be -42 (ADMIN_USER.id) when we have the api-token-middleware run first
    test('Should give ADMIN api-user userid -1337 (SYSTEM_USER_ID)', async () => {
        const accessService = {
            hasPermission: vi.fn(),
        } as PermissionChecker;

        const func = rbacMiddleware(
            config,
            { featureToggleStore, segmentStore },
            accessService,
        );

        const cb = vi.fn();
        const req: any = {
            user: new ApiUser({
                tokenName: 'api',
                permissions: [perms.ADMIN],
                project: '*',
                environment: '*',
                type: ApiTokenType.ADMIN,
                secret: 'a',
            }),
        };
        func(req, undefined, cb);
        const hasAccess = await req.checkRbac(perms.ADMIN);
        expect(req.user.id).toBe(SYSTEM_USER_ID);
        expect(hasAccess).toBe(true);
    });
    /// Will be -42 (ADMIN_USER.id) when we have the api-token-middleware run first
    test('Also when checking against permission NONE, userid should still be -1337', async () => {
        const accessService = {
            hasPermission: vi.fn(),
        } as PermissionChecker;

        const func = rbacMiddleware(
            config,
            { featureToggleStore, segmentStore },
            accessService,
        );

        const cb = vi.fn();
        const req: any = {
            user: new ApiUser({
                tokenName: 'api',
                permissions: [perms.ADMIN],
                project: '*',
                environment: '*',
                type: ApiTokenType.ADMIN,
                secret: 'a',
            }),
        };
        func(req, undefined, cb);
        const hasAccess = await req.checkRbac(perms.NONE);
        expect(req.user.id).toBe(SYSTEM_USER_ID);
        expect(hasAccess).toBe(true);
    });
});

test.each([
    ApiTokenType.BACKEND,
    ApiTokenType.CLIENT,
    ApiTokenType.FRONTEND,
])('should not give api-user ADMIN permission to token %s', async (tokenType) => {
    const accessService = {
        hasPermission: vi.fn(),
    } as PermissionChecker;

    const func = rbacMiddleware(
        config,
        { featureToggleStore, segmentStore },
        accessService,
    );

    const cb = vi.fn();
    const req: any = {
        user: new ApiUser({
            tokenName: `api_${tokenType}`,
            permissions: [perms.CLIENT],
            project: '*',
            environment: '*',
            type: tokenType,
            secret: 'a',
        }),
    };

    func(req, undefined, cb);

    const hasAccess = await req.checkRbac(perms.ADMIN);

    expect(hasAccess).toBe(false);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(0);
});

test('should not allow user to miss userId', async () => {
    vi.spyOn(global.console, 'error').mockImplementation(() => vi.fn());
    const accessService = {
        hasPermission: vi.fn(),
    } as PermissionChecker;

    const func = rbacMiddleware(
        config,
        { featureToggleStore, segmentStore },
        accessService,
    );

    const cb = vi.fn();
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
    vi.spyOn(global.console, 'error').mockImplementation(() => vi.fn());
    const accessService = {
        hasPermission: vi.fn(),
    } as PermissionChecker;

    const func = rbacMiddleware(
        config,
        { featureToggleStore, segmentStore },
        accessService,
    );

    const cb = vi.fn();
    const req: any = {};

    func(req, undefined, cb);

    const hasAccess = await req.checkRbac(perms.ADMIN);

    expect(hasAccess).toBe(false);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(0);
});

test('should verify permission for root resource', async () => {
    const accessService = {
        hasPermission: vi.fn(),
    } as PermissionChecker;

    const func = rbacMiddleware(
        config,
        { featureToggleStore, segmentStore },
        accessService,
    );

    const cb = vi.fn();
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
        [perms.ADMIN],
        undefined,
        undefined,
    );
});

test('should lookup projectId from params', async () => {
    const accessService = {
        hasPermission: vi.fn(),
    } as PermissionChecker;

    const func = rbacMiddleware(
        config,
        { featureToggleStore, segmentStore },
        accessService,
    );

    const cb = vi.fn();
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
        [perms.UPDATE_PROJECT],
        req.params.projectId,
        undefined,
    );
});

test('should lookup projectId from feature flag', async () => {
    const projectId = 'some-project-33';
    const featureName = 'some-feature-flag';

    const accessService = {
        hasPermission: vi.fn(),
    } as PermissionChecker;

    featureToggleStore.getProjectId = vi.fn().mockReturnValue(projectId);

    const func = rbacMiddleware(
        config,
        { featureToggleStore, segmentStore },
        accessService,
    );

    const cb = vi.fn();
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
        [perms.UPDATE_FEATURE],
        projectId,
        undefined,
    );
});

test('should lookup projectId from data', async () => {
    const projectId = 'some-project-33';
    const featureName = 'some-feature-flag';

    const accessService = {
        hasPermission: vi.fn(),
    } as PermissionChecker;

    const func = rbacMiddleware(
        config,
        { featureToggleStore, segmentStore },
        accessService,
    );

    const cb = vi.fn();
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
        [perms.CREATE_FEATURE],
        projectId,
        undefined,
    );
});

test('Does not double check permission if not changing project when updating flag', async () => {
    const oldProjectId = 'some-project-34';
    const featureName = 'some-feature-flag';
    const accessService = {
        hasPermission: vi.fn().mockReturnValue(true),
    } as PermissionChecker;
    featureToggleStore.getProjectId = vi.fn().mockReturnValue(oldProjectId);

    const func = rbacMiddleware(
        config,
        { featureToggleStore, segmentStore },
        accessService,
    );
    const cb = vi.fn();
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
        [perms.UPDATE_FEATURE],
        oldProjectId,
        undefined,
    );
});

test('CREATE_TAG_TYPE does not need projectId', async () => {
    const accessService = {
        hasPermission: vi.fn().mockReturnValue(true),
    } as PermissionChecker;

    const func = rbacMiddleware(
        config,
        { featureToggleStore, segmentStore },
        accessService,
    );
    const cb = vi.fn();
    const req: any = {
        user: new User({ username: 'user', id: 1 }),
        params: {},
        body: { name: 'new-tag-type', description: 'New tag type for testing' },
    };
    func(req, undefined, cb);

    await req.checkRbac(perms.CREATE_TAG_TYPE);
    expect(accessService.hasPermission).toHaveBeenCalledTimes(1);
    expect(accessService.hasPermission).toHaveBeenCalledWith(
        req.user,
        [perms.CREATE_TAG_TYPE],
        undefined,
        undefined,
    );
});

test('UPDATE_TAG_TYPE does not need projectId', async () => {
    const accessService = {
        hasPermission: vi.fn().mockReturnValue(true),
    } as PermissionChecker;

    const func = rbacMiddleware(
        config,
        { featureToggleStore, segmentStore },
        accessService,
    );
    const cb = vi.fn();
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
        [perms.UPDATE_TAG_TYPE],
        undefined,
        undefined,
    );
});

test('DELETE_TAG_TYPE does not need projectId', async () => {
    const accessService = {
        hasPermission: vi.fn().mockReturnValue(true),
    } as PermissionChecker;

    const func = rbacMiddleware(
        config,
        { featureToggleStore, segmentStore },
        accessService,
    );
    const cb = vi.fn();
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
        [perms.DELETE_TAG_TYPE],
        undefined,
        undefined,
    );
});

test('should not expect featureName for UPDATE_FEATURE when projectId specified', async () => {
    const projectId = 'some-project-33';

    const accessService = {
        hasPermission: vi.fn(),
    } as PermissionChecker;

    const func = rbacMiddleware(
        config,
        { featureToggleStore, segmentStore },
        accessService,
    );

    const cb = vi.fn();
    const req: any = {
        user: new User({
            username: 'user',
            id: 1,
        }),
        params: {},
        body: {
            project: projectId,
        },
    };

    func(req, undefined, cb);

    await req.checkRbac(perms.UPDATE_FEATURE);

    expect(accessService.hasPermission).toHaveBeenCalledWith(
        req.user,
        [perms.UPDATE_FEATURE],
        projectId,
        undefined,
    );
});
