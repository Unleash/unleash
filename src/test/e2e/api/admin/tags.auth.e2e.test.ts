import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';
import {
    DELETE_TAG_TYPE,
    RoleName,
    SYSTEM_USER_AUDIT,
    SYSTEM_USER_ID,
    UPDATE_TAG_TYPE,
} from '../../../../lib/types/index.js';
import type { PermissionRef } from '../../../../lib/services/access-service.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('tag_api_auth_serial', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    tagManagementViaUi: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

const loginAsViewer = async (email: string, permissions?: PermissionRef[]) => {
    const { accessService, userService } = app.services;
    const viewerRole = (await accessService.getPredefinedRole(
        RoleName.VIEWER,
    ))!;
    const user = await userService.createUser(
        { email, rootRole: viewerRole.id },
        SYSTEM_USER_AUDIT,
    );
    if (permissions) {
        const role = await accessService.createRole(
            {
                name: `role_${email}`,
                description: `${email} role`,
                permissions,
                type: 'root-custom',
                createdByUserId: SYSTEM_USER_ID,
            },
            SYSTEM_USER_AUDIT,
        );
        await accessService.addUserToRole(user.id, role.id, 'default');
    }
    await app.login({ email });
};

test('renaming a tag requires UPDATE_TAG_TYPE', async () => {
    await db.stores.tagStore.createTag({ type: 'simple', value: 'to-rename' });

    await loginAsViewer('rename-viewer@example.com');
    await app.request
        .post('/api/admin/tags/simple/to-rename/rename')
        .send({ value: 'renamed' })
        .expect(403);

    await loginAsViewer('rename-tag-type@example.com', [
        { name: UPDATE_TAG_TYPE },
    ]);
    await app.request
        .post('/api/admin/tags/simple/to-rename/rename')
        .send({ value: 'renamed' })
        .expect(200);
});

test('deleting a tag is allowed with DELETE_TAG_TYPE', async () => {
    await db.stores.tagStore.createTag({ type: 'simple', value: 'to-delete' });

    await loginAsViewer('delete-viewer@example.com');
    await app.request.delete('/api/admin/tags/simple/to-delete').expect(403);

    await loginAsViewer('delete-tag-type@example.com', [
        { name: DELETE_TAG_TYPE },
    ]);
    await app.request.delete('/api/admin/tags/simple/to-delete').expect(200);
});
