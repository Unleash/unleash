import fc from 'fast-check';
import { generateToggles } from '../../../../lib/routes/admin-api/playground.test';
import { generate } from '../../../../lib/openapi/spec/playground-request-schema.test';
import dbInit, { ITestDb } from '../../helpers/database-init';
import { IUnleashTest, setupAppWithAuth } from '../../helpers/test-helper';
import { WeightType } from '../../../../lib/types/model';
import getLogger from '../../../fixtures/no-logger';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('playground_api_serial', getLogger);
    app = await setupAppWithAuth(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

describe('Playground API E2E', () => {
    test('Returned toggles should be a subset of the provided toggles', async () => {
        await fc.assert(
            fc
                .asyncProperty(
                    generateToggles({ minLength: 1 }),
                    generate(),
                    async (toggles, request) => {
                        // seed the database
                        await Promise.all(
                            toggles.map((t) =>
                                db.stores.featureToggleStore.create(t.project, {
                                    ...t,
                                    createdAt: undefined,
                                    variants: [
                                        ...(t.variants ?? []).map(
                                            (variant) => ({
                                                ...variant,
                                                weightType: WeightType.VARIABLE,
                                                stickiness: 'default',
                                            }),
                                        ),
                                    ],
                                }),
                            ),
                        );

                        const { body } = await app.request
                            .post('/api/admin/playground')
                            .send(request)
                            .expect(200);

                        // the returned list should always be a subset of the provided list
                        expect(toggles.map((x) => x.name)).toEqual(
                            expect.arrayContaining(
                                body.toggles.map((x) => x.name),
                            ),
                        );
                    },
                )
                .afterEach(async () => {
                    await db.stores.featureToggleStore.deleteAll();
                }),
        );
    });

    test('Returned toggles should be filtered according to input params', async () => {});
});
