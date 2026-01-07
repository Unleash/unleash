import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import metricsExample from '../../../examples/client-metrics.json' with {
    type: 'json',
};
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { ApiTokenType } from '../../../../lib/types/model.js';
import { vi } from 'vitest';
let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('metrics_api_e2e_access_client', getLogger);
    app = await setupAppWithAuth(db.stores, undefined, db.rawDatabase);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should enrich metrics with environment from api-token', async () => {
    const { apiTokenService } = app.services;
    const { environmentStore, clientMetricsStoreV2 } = db.stores;

    await environmentStore.create({
        name: 'some',
        type: 'test',
    });

    const token = await apiTokenService.createApiTokenWithProjects({
        type: ApiTokenType.BACKEND,
        tokenName: 'test',
        environment: 'some',
        projects: ['*'],
    });

    const featureName = Object.keys(metricsExample.bucket.toggles)[0];
    // @ts-expect-error - cachedFeatureNames is a private property in ClientMetricsServiceV2
    app.services.clientMetricsServiceV2.cachedFeatureNames = vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue([featureName]);

    await app.request
        .post('/api/client/metrics')
        .set('Authorization', token.secret)
        .send(metricsExample)
        .expect(202);

    await app.services.clientMetricsServiceV2.bulkAdd();
    const all = await clientMetricsStoreV2.getAll();
    expect(all[0].environment).toBe('some');
});
