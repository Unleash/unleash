import { v4 as uuidv4 } from 'uuid';
import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import { CreateDependentFeatureSchema } from '../../openapi';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('feature_dependencies', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    dependentFeatures: true,
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

const addFeatureDependency = async (
    parentFeature: string,
    payload: CreateDependentFeatureSchema,
    expectedCode = 200,
) => {
    return app.request
        .post(
            `/api/admin/projects/default/features/${parentFeature}/dependencies`,
        )
        .send(payload)
        .expect(expectedCode);
};

test('should add feature dependency', async () => {
    const parent = uuidv4();
    const child = uuidv4();
    await app.createFeature(parent);
    await app.createFeature(child);

    await addFeatureDependency(parent, {
        feature: child,
    });
});
