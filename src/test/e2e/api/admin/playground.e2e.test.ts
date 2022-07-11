import fc from 'fast-check';
import {
    // generateFeatureToggle,
    generateToggles,
} from '../../../../lib/routes/admin-api/playground.test';
import { generate as generateRequest } from '../../../../lib/openapi/spec/playground-request-schema.test';
import dbInit, { ITestDb } from '../../helpers/database-init';
import { IUnleashTest, setupAppWithAuth } from '../../helpers/test-helper';
import { FeatureToggle, WeightType } from '../../../../lib/types/model';
import getLogger from '../../../fixtures/no-logger';
import {
    ApiTokenType,
    IApiToken,
} from '../../../../lib/types/models/api-token';
import { PlaygroundFeatureSchema } from 'lib/openapi/spec/playground-feature-schema';
import { ClientFeatureSchema } from 'lib/openapi/spec/client-feature-schema';
import { PlaygroundResponseSchema } from 'lib/openapi/spec/playground-response-schema';

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

const reset = (database: ITestDb) => async () => {
    await database.stores.featureToggleStore.deleteAll();
};

// const toArray = <T>(x: T): [T] => [x]

const testParams = {
    interruptAfterTimeLimit: 4000, // Default timeout in Jest 5000ms
    markInterruptAsFailure: false, // When set to false, timeout during initial cases will not be considered as a failure
};

type ApiResponse = {
    body: PlaygroundResponseSchema;
};

describe('Playground API E2E', () => {
    const seedDatabase = (
        database: ITestDb,
        toggles: ClientFeatureSchema[],
    ): Promise<FeatureToggle[]> =>
        Promise.all(
            toggles.map((t) =>
                database.stores.featureToggleStore.create(t.project, {
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

    test('Returned toggles should be a subset of the provided toggles', async () => {
        await fc.assert(
            fc
                .asyncProperty(
                    generateToggles({ minLength: 1 }),
                    generateRequest(),
                    async (toggles, request) => {
                        // seed the database
                        await seedDatabase(db, toggles);

                        const { body }: ApiResponse = await app.request
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
                .afterEach(reset(db)),
            testParams,
        );
    });

    test('should filter the list according to the input parameters', async () => {
        await fc.assert(
            fc
                .asyncProperty(
                    generateRequest(),
                    generateToggles({ minLength: 1 }),
                    async (payload, toggles) => {
                        await seedDatabase(db, toggles);

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

                        const { body }: ApiResponse = await app.request
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
                .afterEach(reset(db)),
            testParams,
        );
    });

    // property failure:
    // { seed: -138317910, path: "4:2:0:5:3:1:9:1:40:7:1:6:1:3:9:1:2:4:5:1:2:2:3:2:1:1:1:2:1:1:1:11:2:11:2:12:6:10:8:1:1:2:3:1:4:9:3:8:1:1:2:3:1:8", endOnFailure: true }
    // Counterexample: [[{"name":"-","description":"convallis","project":"0","enabled":false,"lastSeenAt":"1941-10-13T21:55:29.193Z","strategies":[],"variants":[{"name":"AH","weight":0,"weightType":"variable","stickiness":"default","payload":null}]}]]
    //
    // Got error: Error: expect(received).toBeTruthy()
    //
    // Received: undefined
    test('should map toggles correctly', async () => {
        await fc.assert(
            fc
                .asyncProperty(
                    generateToggles(),
                    fc.context(),
                    async (toggles, ctx) => {
                        await seedDatabase(db, toggles);

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

                        const mappedToggles = createDict(body.toggles);

                        if (toggles.length !== body.toggles.length) {
                            ctx.log(
                                `I expected the number of mapped toggles (${body.toggles.length}) to be the same as the number of created toggles (${toggles.length}), but that was not the case.`,
                            );
                            return false;
                        }

                        return toggles.every((x) => {
                            const mapped: PlaygroundFeatureSchema =
                                mappedToggles[x.name];

                            ctx.log(
                                `Original: ${x}, mapped: ${mapped}, allmapped (${body.toggles.length}): ${body.toggles}`,
                            );
                            expect(mapped).toBeTruthy();

                            const variantIsCorrect =
                                x.variants && mapped.isEnabled
                                    ? x.variants.some(
                                          ({ name, payload }) =>
                                              name === mapped.variant.name &&
                                              payload ===
                                                  mapped.variant.payload,
                                      )
                                    : mapped.variant.name === 'disabled' &&
                                      mapped.variant.enabled === false;

                            return (
                                x.name === mapped.name &&
                                x.project === mapped.projectId &&
                                variantIsCorrect
                            );
                        });
                    },
                )
                .afterEach(reset(db)),
            testParams,
        );
    });

    describe('context application', () => {
        it('applies static context fields correctly', async () => {
            // const appNames = ['A', 'B', 'C'];
            // // Choose one of the app names at random
            // const appName = () => fc.constantFrom(...appNames);
            // // generate a list of features that are active only for a specific
            // // app name (constraints). Each feature will be constrained to a
            // // random appName from the list above.
            // const constrainedFeatures = (): Arbitrary<ClientFeatureSchema[]> =>
            //     fc.array(
            //         fc
            //             .tuple(
            //                 generateFeatureToggle(),
            //                 fc.record({
            //                     name: fc.constant('default'),
            //                     constraints: fc.array(
            //                         fc.record({
            //                             values: appName().map(toArray),
            //                             inverted: fc.constant(false),
            //                             operator: fc.constant('IN' as 'IN'),
            //                             contextName: fc.constant('appName'),
            //                             caseInsensitive: fc.boolean(),
            //                         }),
            //                         { maxLength: 1, minLength: 1 },
            //                     ),
            //                 }),
            //             )
            //             .map(([toggle, strategy]) => ({
            //                 ...toggle,
            //                 enabled: true,
            //                 strategies: [strategy],
            //             })),
            //     );
            // await fc.assert(
            //     fc
            //         .asyncProperty(
            //             fc
            //                 .tuple(appName(), generateRequest())
            //                 .map(([appName, req]) => ({
            //                     ...req,
            //                     // generate a context that has `appName` set to
            //                     // one of the above values
            //                     context: { appName },
            //                 })),
            //             constrainedFeatures(),
            //             async (req, toggles) => {
            //                 seedDatabase(db, toggles);
            //                 const { body }: ApiResponse =
            //                     await app.request
            //                         .post('/api/admin/playground')
            //                         .set('Authorization', token.secret)
            //                         .send(req)
            //                         .expect(200);
            //                 const shouldBeEnabled = toggles.reduce(
            //                     (acc, next) => ({
            //                         ...acc,
            //                         [next.name]:
            //                             next.strategies[0].constraints[0]
            //                                 .values[0] === req.context.appName,
            //                     }),
            //                     {},
            //                 );
            //                 return body.toggles.every(
            //                     (x) => x.isEnabled === shouldBeEnabled[x.name],
            //                 );
            //             },
            //         )
            //         .afterEach(reset(db)),
            //     testParams,
            // );
        });

        it('applies dynamic context fields correctly', async () => {
            // const dynamicContextField = () => fc.oneof()
            // // generate a list of features that are constrained on a
            // // random dynamic context field.
            // const constrainedFeatures = (): Arbitrary<ClientFeatureSchema[]> =>
            //     fc.array(
            //         fc
            //             .tuple(
            //                 generateFeatureToggle(),
            //                 fc.record({
            //                     name: fc.constant('default'),
            //                     constraints: fc.array(
            //                         fc.record({
            //                             values: appName().map((name) => [name]),
            //                             inverted: fc.constant(false),
            //                             operator: fc.constant('IN' as 'IN'),
            //                             contextName: fc.constant('appName'),
            //                             caseInsensitive: fc.boolean(),
            //                         }),
            //                         { maxLength: 1, minLength: 1 },
            //                     ),
            //                 }),
            //             )
            //             .map(([toggle, strategy]) => ({
            //                 ...toggle,
            //                 enabled: true,
            //                 strategies: [strategy],
            //             })),
            //     );
            //             await fc.assert(
            //     fc
            //         .asyncProperty(
            //             fc
            //                 .tuple(appName(), generateRequest())
            //                 .map(([appName, req]) => ({
            //                     ...req,
            //                     // generate a context that has `appName` set to
            //                     // one of the above values
            //                     context: { appName },
            //                 })),
            //             constrainedFeatures(),
            //             async (req, toggles) => {
            //                 seedDatabase(db, toggles);
            //                 const { body }: ApiResponse =
            //                     await app.request
            //                         .post('/api/admin/playground')
            //                         .set('Authorization', token.secret)
            //                         .send(req)
            //                         .expect(200);
            //                 const shouldBeEnabled = toggles.reduce(
            //                     (acc, next) => ({
            //                         ...acc,
            //                         [next.name]:
            //                             next.strategies[0].constraints[0]
            //                                 .values[0] === req.context.appName,
            //                     }),
            //                     {},
            //                 );
            //                 return body.toggles.every(
            //                     (x) => x.isEnabled === shouldBeEnabled[x.name],
            //                 );
            //             },
            //         )
            //         .afterEach(reset(db)),
            //     testParams,
            // );
        });
    });

    it('applies custom context fields correctly', () => {
        // check both on the top level and on the nested level.
    });
});
