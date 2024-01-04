import { IUnleashTest, setupApp } from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { randomId } from '../../../../lib/util';
import { ApiTokenType } from '../../../../lib/types/models/api-token';

let app: IUnleashTest;
let db: ITestDb;
let appErrorLogs: string[] = [];

beforeAll(async () => {
    db = await dbInit('proxy_auth_none', getLogger);
    const baseLogger = getLogger();
    const appLogger = {
        ...baseLogger,
        error: (msg: string, ...args: any[]) => {
            appErrorLogs.push(msg);
            baseLogger.error(msg, ...args);
        },
    };
    app = await setupApp(db.stores);
});

afterEach(() => {
    app.services.proxyService.stopAll();
    jest.clearAllMocks();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {
    appErrorLogs = [];
});

test('calling /frontend with a token works when AuthType=None', async () => {
    const frontendTokenDefault =
        await app.services.apiTokenService.createApiTokenWithProjects({
            type: ApiTokenType.FRONTEND,
            projects: ['default'],
            environment: 'default',
            tokenName: `test-token-${randomId()}`,
        });

    await app.request
        .get('/api/frontend')
        .set('Authorization', frontendTokenDefault.secret)
        .expect('Content-Type', /json/)
        .expect(200);
    expect(appErrorLogs).toHaveLength(0);
});
