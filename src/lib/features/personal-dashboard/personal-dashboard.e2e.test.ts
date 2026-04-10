import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import {
    setupAppWithAuth,
    type IUnleashTest,
} from '../../../test/e2e/helpers/test-helper.js';
import { type MinimalUser, RoleName } from '../../server-impl.js';

const userEmail = 'some-user@getunleash.io';
const enterpriseProjectId = 'enterprise-only-project';
const favoritedEnterpriseProjectId = 'favorited-enterprise-project';

let db: ITestDb;
let user: MinimalUser;

const startApp = ({ isOss }: { isOss: boolean }): Promise<IUnleashTest> =>
    setupAppWithAuth(
        db.stores,
        { isOss, experimental: { flags: {} } },
        db.rawDatabase,
    );

const loginUser = (app: IUnleashTest, email: string) =>
    app.request.post('/auth/demo/login').send({ email }).expect(200);

beforeAll(async () => {
    db = await dbInit('personal_dashboard_oss_downgrade', getLogger);

    user = await db.stores.userStore.insert({
        name: 'downgraded-user',
        email: userEmail,
    });

    await db.rawDatabase('projects').insert([
        {
            id: enterpriseProjectId,
            name: 'Enterprise Only Project',
            description: '',
            health: 100,
        },
        {
            id: favoritedEnterpriseProjectId,
            name: 'Favorited Enterprise Only Project',
            description: '',
            health: 100,
        },
    ]);

    await db.rawDatabase('favorite_projects').insert({
        project: favoritedEnterpriseProjectId,
        user_id: user.id,
    });
});

afterAll(async () => {
    await db.destroy();
});

test('personal dashboard should not return enterprise-only projects after downgrade to OSS', async () => {
    // in Enterprise
    const enterpriseApp = await startApp({ isOss: false });
    const editorRole = (
        await enterpriseApp.services.accessService.getRootRoles()
    ).find((role) => role.name === RoleName.EDITOR)!;

    await enterpriseApp.services.accessService.addUserToRole(
        user.id,
        editorRole.id,
        'default',
    );

    await enterpriseApp.services.accessService.addUserToRole(
        user.id,
        editorRole.id,
        enterpriseProjectId,
    );

    await loginUser(enterpriseApp, userEmail);

    const { body: enterpriseDashboardBody } = await enterpriseApp.request
        .get('/api/admin/personal-dashboard')
        .expect(200);

    const enterpriseProjectIds = enterpriseDashboardBody.projects.map(
        (p: { id: string }) => p.id,
    );
    expect(enterpriseProjectIds).toContain('default');
    expect(enterpriseProjectIds).toContain(enterpriseProjectId);
    expect(enterpriseProjectIds).toContain(favoritedEnterpriseProjectId);

    await enterpriseApp.destroy();

    // in OSS
    const ossApp = await startApp({ isOss: true });

    await loginUser(ossApp, userEmail);
    const { body } = await ossApp.request
        .get('/api/admin/personal-dashboard')
        .expect(200);

    const projectIds = body.projects.map((p: { id: string }) => p.id);
    expect(projectIds).toContain('default');
    expect(projectIds).not.toContain(enterpriseProjectId);
    expect(projectIds).not.toContain(favoritedEnterpriseProjectId);

    await ossApp.destroy();
});
