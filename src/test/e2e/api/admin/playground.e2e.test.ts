import fc from 'fast-check';
import { generateToggles } from '../../../../lib/routes/admin-api/playground.test';
import { generate as generateRequest } from '../../../../lib/openapi/spec/playground-request-schema.test';
import dbInit, { ITestDb } from '../../helpers/database-init';
import { IUnleashTest, setupAppWithAuth } from '../../helpers/test-helper';
import { WeightType } from '../../../../lib/types/model';
import getLogger from '../../../fixtures/no-logger';
import {
    ApiTokenType,
    IApiToken,
} from '../../../../lib/types/models/api-token';
import { PlaygroundFeatureSchema } from 'lib/openapi/spec/playground-feature-schema';

let app: IUnleashTest;
let db: ITestDb;
let token: IApiToken;

beforeAll(async () => {
    db = await dbInit('playground_api_serial', getLogger);
    app = await setupAppWithAuth(db.stores);
    const { apiTokenService } = app.services;
    token = await apiTokenService.createApiTokenWithProjects({
        type: ApiTokenType.ADMIN,
        username: 'tester',
        environment: '*',
        projects: ['*'],
    });
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
                    generateRequest(),
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
                            .set('Authorization', token.secret)
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

    jest.setTimeout(20000); // this test might take a while to complete due
    // to its property-based nature.
    test('should filter the list according to the input parameters', async () => {
        await fc.assert(
            fc
                .asyncProperty(
                    generateRequest(),
                    generateToggles({ minLength: 1 }),
                    async (payload, toggles) => {
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

                        // get a subset of projects that exist among the toggles
                        const [projects] = fc.sample(
                            fc.oneof(
                                fc.constant('*' as '*'),
                                fc.uniqueArray(
                                    fc.constantFrom(
                                        ...toggles.map((t) => t.project),
                                    ),
                                ),
                            ),
                        );

                        payload.projects = projects;

                        // create a list of features that can be filtered
                        // pass in args that should filter the list

                        const { body } = await app.request
                            .post('/api/admin/playground')
                            .set('Authorization', token.secret)
                            .send(payload)
                            .expect(200);

                        switch (projects) {
                            case '*':
                                // no toggles have been filtered out
                                return body.toggles.length === toggles.length;
                            case []:
                                // no toggle should be without a project
                                return body.toggles.length === 0;
                            default:
                                // every toggle should be in one of the prescribed projects
                                return body.toggles.every((x) =>
                                    projects.includes(x.projectId),
                                );
                        }
                    },
                )
                .afterEach(async () => {
                    await db.stores.featureToggleStore.deleteAll();
                }),
        );
    });

    test('should map toggles correctly', async () => {
        await fc.assert(
            fc
                .asyncProperty(generateToggles(), async (toggles) => {
                    await Promise.all(
                        toggles.map((t) =>
                            db.stores.featureToggleStore.create(t.project, {
                                ...t,
                                createdAt: undefined,
                                variants: [
                                    ...(t.variants ?? []).map((variant) => ({
                                        ...variant,
                                        weightType: WeightType.VARIABLE,
                                        stickiness: 'default',
                                    })),
                                ],
                            }),
                        ),
                    );

                    const { body } = await app.request
                        .post('/api/admin/playground')
                        .set('Authorization', token.secret)
                        .send({
                            projects: '*',
                            environment: 'default',
                            context: {},
                        })
                        .expect(200);

                    const createDict = (xs: { name: string }[]) =>
                        xs.reduce(
                            (acc, next) => ({ ...acc, [next.name]: next }),
                            {},
                        );

                    // const unmapped = createDict(toggles)
                    const mappedToggles = createDict(body.toggles);

                    return toggles.every((x) => {
                        const mapped: PlaygroundFeatureSchema =
                            mappedToggles[x.name];

                        expect(mapped).toBeTruthy();

                        const variantIsCorrect =
                            x.variants && mapped.isEnabled
                                ? x.variants.some(
                                      ({ name, payload }) =>
                                          name === mapped.variant.name &&
                                          payload === mapped.variant.payload,
                                  )
                                : mapped.variant.name === 'disabled' &&
                                  mapped.variant.enabled === false;

                        return (
                            x.name === mapped.name &&
                            x.project === mapped.projectId &&
                            variantIsCorrect
                        );
                    });
                })
                .afterEach(async () => {
                    await db.stores.featureToggleStore.deleteAll();
                }),
        );
    });
});
