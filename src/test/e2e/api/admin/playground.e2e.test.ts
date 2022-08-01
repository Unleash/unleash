import fc, { Arbitrary } from 'fast-check';
import { clientFeature, clientFeatures } from '../../../arbitraries.test';
import { generate as generateRequest } from '../../../../lib/openapi/spec/playground-request-schema.test';
import dbInit, { ITestDb } from '../../helpers/database-init';
import { IUnleashTest, setupAppWithAuth } from '../../helpers/test-helper';
import { FeatureToggle, WeightType } from '../../../../lib/types/model';
import getLogger from '../../../fixtures/no-logger';
import {
    ALL,
    ApiTokenType,
    IApiToken,
} from '../../../../lib/types/models/api-token';
import { PlaygroundFeatureSchema } from 'lib/openapi/spec/playground-feature-schema';
import { ClientFeatureSchema } from 'lib/openapi/spec/client-feature-schema';
import { PlaygroundResponseSchema } from 'lib/openapi/spec/playground-response-schema';
import { PlaygroundRequestSchema } from 'lib/openapi/spec/playground-request-schema';

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
        environment: ALL,
        projects: [ALL],
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

const reset = (database: ITestDb) => async () => {
    await database.stores.featureToggleStore.deleteAll();
    await database.stores.featureStrategiesStore.deleteAll();
    await database.stores.environmentStore.deleteAll();
};

const toArray = <T>(x: T): [T] => [x];

const testParams = {
    interruptAfterTimeLimit: 4000, // Default timeout in Jest 5000ms
    markInterruptAsFailure: false, // When set to false, timeout during initial cases will not be considered as a failure
};

const playgroundRequest = async (
    testApp: IUnleashTest,
    secret: string,
    request: PlaygroundRequestSchema,
): Promise<PlaygroundResponseSchema> => {
    const {
        body,
    }: {
        body: PlaygroundResponseSchema;
    } = await testApp.request
        .post('/api/admin/playground')
        .set('Authorization', secret)
        .send(request)
        .expect(200);

    return body;
};

describe('Playground API E2E', () => {
    // utility function for seeding the database before runs
    const seedDatabase = (
        database: ITestDb,
        features: ClientFeatureSchema[],
        environment: string,
    ): Promise<FeatureToggle[]> =>
        Promise.all(
            features.map(async (feature) => {
                // create feature
                const toggle = await database.stores.featureToggleStore.create(
                    feature.project,
                    {
                        ...feature,
                        createdAt: undefined,
                        variants: [
                            ...(feature.variants ?? []).map((variant) => ({
                                ...variant,
                                weightType: WeightType.VARIABLE,
                                stickiness: 'default',
                            })),
                        ],
                    },
                );

                // create environment if necessary
                await database.stores.environmentStore
                    .create({
                        name: environment,
                        type: 'development',
                        enabled: true,
                    })
                    .catch(() => {
                        // purposefully left empty: env creation may fail if the
                        // env already exists, and because of the async nature
                        // of things, this is the easiest way to make it work.
                    });

                // assign strategies
                await Promise.all(
                    (feature.strategies || []).map((strategy) =>
                        database.stores.featureStrategiesStore.createStrategyFeatureEnv(
                            {
                                parameters: {},
                                constraints: [],
                                ...strategy,
                                featureName: feature.name,
                                environment,
                                strategyName: strategy.name,
                                projectId: feature.project,
                            },
                        ),
                    ),
                );

                // enable/disable the feature in environment
                await database.stores.featureEnvironmentStore.addEnvironmentToFeature(
                    feature.name,
                    environment,
                    feature.enabled,
                );

                return toggle;
            }),
        );

    test('Returned features should be a subset of the provided toggles', async () => {
        await fc.assert(
            fc
                .asyncProperty(
                    clientFeatures({ minLength: 1 }),
                    generateRequest(),
                    async (features, request) => {
                        // seed the database
                        await seedDatabase(db, features, request.environment);

                        const body = await playgroundRequest(
                            app,
                            token.secret,
                            request,
                        );

                        // the returned list should always be a subset of the provided list
                        expect(features.map((feature) => feature.name)).toEqual(
                            expect.arrayContaining(
                                body.features.map((feature) => feature.name),
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
                    clientFeatures({ minLength: 1 }),
                    async (request, features) => {
                        await seedDatabase(db, features, request.environment);

                        // get a subset of projects that exist among the features
                        const [projects] = fc.sample(
                            fc.oneof(
                                fc.constant(ALL as '*'),
                                fc.uniqueArray(
                                    fc.constantFrom(
                                        ...features.map(
                                            (feature) => feature.project,
                                        ),
                                    ),
                                ),
                            ),
                        );

                        request.projects = projects;

                        // create a list of features that can be filtered
                        // pass in args that should filter the list
                        const body = await playgroundRequest(
                            app,
                            token.secret,
                            request,
                        );

                        switch (projects) {
                            case ALL:
                                // no features have been filtered out
                                return body.features.length === features.length;
                            case []:
                                // no feature should be without a project
                                return body.features.length === 0;
                            default:
                                // every feature should be in one of the prescribed projects
                                return body.features.every((feature) =>
                                    projects.includes(feature.projectId),
                                );
                        }
                    },
                )
                .afterEach(reset(db)),
            testParams,
        );
    });

    test('should map project and name correctly', async () => {
        // note: we're not testing `isEnabled` and `variant` here, because
        // that's the SDK's responsibility and it's tested elsewhere.
        await fc.assert(
            fc
                .asyncProperty(
                    clientFeatures(),
                    fc.context(),
                    async (features, ctx) => {
                        await seedDatabase(db, features, 'default');

                        const body = await playgroundRequest(
                            app,
                            token.secret,
                            {
                                projects: ALL,
                                environment: 'default',
                                context: {
                                    appName: 'playground-test',
                                },
                            },
                        );

                        const createDict = (xs: { name: string }[]) =>
                            xs.reduce(
                                (acc, next) => ({ ...acc, [next.name]: next }),
                                {},
                            );

                        const mappedToggles = createDict(body.features);

                        if (features.length !== body.features.length) {
                            ctx.log(
                                `I expected the number of mapped toggles (${body.features.length}) to be the same as the number of created toggles (${features.length}), but that was not the case.`,
                            );
                            return false;
                        }

                        return features.every((feature) => {
                            const mapped: PlaygroundFeatureSchema =
                                mappedToggles[feature.name];

                            expect(mapped).toBeTruthy();

                            return (
                                feature.name === mapped.name &&
                                feature.project === mapped.projectId
                            );
                        });
                    },
                )
                .afterEach(reset(db)),
            testParams,
        );
    });

    test('isEnabledInCurrentEnvironment should always match feature.enabled', async () => {
        await fc.assert(
            fc
                .asyncProperty(
                    clientFeatures(),
                    fc.context(),
                    async (features, ctx) => {
                        await seedDatabase(db, features, 'default');

                        const body = await playgroundRequest(
                            app,
                            token.secret,
                            {
                                projects: ALL,
                                environment: 'default',
                                context: {
                                    appName: 'playground-test',
                                },
                            },
                        );

                        const createDict = (xs: { name: string }[]) =>
                            xs.reduce(
                                (acc, next) => ({ ...acc, [next.name]: next }),
                                {},
                            );

                        const mappedToggles = createDict(body.features);

                        ctx.log(JSON.stringify(features));
                        ctx.log(JSON.stringify(mappedToggles));

                        return features.every(
                            (feature) =>
                                feature.enabled ===
                                mappedToggles[feature.name]
                                    .isEnabledInCurrentEnvironment,
                        );
                    },
                )
                .afterEach(reset(db)),
            testParams,
        );
    });

    describe('context application', () => {
        it('applies appName constraints correctly', async () => {
            const appNames = ['A', 'B', 'C'];

            // Choose one of the app names at random
            const appName = () => fc.constantFrom(...appNames);

            // generate a list of features that are active only for a specific
            // app name (constraints). Each feature will be constrained to a
            // random appName from the list above.
            const constrainedFeatures = (): Arbitrary<ClientFeatureSchema[]> =>
                fc.uniqueArray(
                    fc
                        .tuple(
                            clientFeature(),
                            fc.record({
                                name: fc.constant('default'),
                                constraints: fc
                                    .record({
                                        values: appName().map(toArray),
                                        inverted: fc.constant(false),
                                        operator: fc.constant('IN' as 'IN'),
                                        contextName: fc.constant('appName'),
                                        caseInsensitive: fc.boolean(),
                                    })
                                    .map(toArray),
                            }),
                        )
                        .map(([feature, strategy]) => ({
                            ...feature,
                            enabled: true,
                            strategies: [strategy],
                        })),
                    { selector: (feature) => feature.name },
                );

            await fc.assert(
                fc
                    .asyncProperty(
                        fc
                            .tuple(appName(), generateRequest())
                            .map(([generatedAppName, req]) => ({
                                ...req,
                                // generate a context that has appName set to
                                // one of the above values
                                context: {
                                    appName: generatedAppName,
                                    environment: 'default',
                                },
                            })),
                        constrainedFeatures(),
                        async (req, features) => {
                            await seedDatabase(db, features, req.environment);
                            const body = await playgroundRequest(
                                app,
                                token.secret,
                                req,
                            );

                            const shouldBeEnabled = features.reduce(
                                (acc, next) => ({
                                    ...acc,
                                    [next.name]:
                                        next.strategies[0].constraints[0]
                                            .values[0] === req.context.appName,
                                }),
                                {},
                            );

                            return body.features.every(
                                (feature) =>
                                    feature.isEnabled ===
                                    shouldBeEnabled[feature.name],
                            );
                        },
                    )
                    .afterEach(reset(db)),
                {
                    ...testParams,
                    examples: [],
                },
            );
        });

        it('applies dynamic context fields correctly', async () => {
            const contextValue = () =>
                fc.oneof(
                    fc.record({
                        name: fc.constant('remoteAddress'),
                        value: fc.ipV4(),
                        operator: fc.constant('IN' as 'IN'),
                    }),
                    fc.record({
                        name: fc.constant('sessionId'),
                        value: fc.uuid(),
                        operator: fc.constant('IN' as 'IN'),
                    }),
                    fc.record({
                        name: fc.constant('userId'),
                        value: fc.emailAddress(),
                        operator: fc.constant('IN' as 'IN'),
                    }),
                );

            const constrainedFeatures = (): Arbitrary<ClientFeatureSchema[]> =>
                fc.uniqueArray(
                    fc
                        .tuple(
                            clientFeature(),
                            contextValue().map((context) => ({
                                name: 'default',
                                constraints: [
                                    {
                                        values: [context.value],
                                        inverted: false,
                                        operator: context.operator,
                                        contextName: context.name,
                                        caseInsensitive: false,
                                    },
                                ],
                            })),
                        )
                        .map(([feature, strategy]) => ({
                            ...feature,
                            enabled: true,
                            strategies: [strategy],
                        })),
                    { selector: (feature) => feature.name },
                );
            await fc.assert(
                fc
                    .asyncProperty(
                        fc
                            .tuple(contextValue(), generateRequest())
                            .map(([generatedContextValue, req]) => ({
                                ...req,
                                // generate a context that has a dynamic context field set to
                                // one of the above values
                                context: {
                                    ...req.context,
                                    [generatedContextValue.name]:
                                        generatedContextValue.value,
                                },
                            })),
                        constrainedFeatures(),
                        async (req, features) => {
                            await seedDatabase(db, features, 'default');

                            const body = await playgroundRequest(
                                app,
                                token.secret,
                                req,
                            );

                            const contextField = Object.values(req.context)[0];

                            const shouldBeEnabled = features.reduce(
                                (acc, next) => ({
                                    ...acc,
                                    [next.name]:
                                        next.strategies[0].constraints[0]
                                            .values[0] === contextField,
                                }),
                                {},
                            );
                            return body.features.every(
                                (feature) =>
                                    feature.isEnabled ===
                                    shouldBeEnabled[feature.name],
                            );
                        },
                    )
                    .afterEach(reset(db)),
                testParams,
            );
        });

        it('applies custom context fields correctly', async () => {
            const environment = 'default';
            const contextValue = () =>
                fc.record({
                    name: fc.constantFrom('Context field A', 'Context field B'),
                    value: fc.constantFrom(
                        'Context value 1',
                        'Context value 2',
                    ),
                });
            const constrainedFeatures = (): Arbitrary<ClientFeatureSchema[]> =>
                fc.uniqueArray(
                    fc
                        .tuple(
                            clientFeature(),
                            contextValue().map((context) => ({
                                name: 'default',
                                constraints: [
                                    {
                                        values: [context.value],
                                        inverted: false,
                                        operator: 'IN' as 'IN',
                                        contextName: context.name,
                                        caseInsensitive: false,
                                    },
                                ],
                            })),
                        )
                        .map(([feature, strategy]) => ({
                            ...feature,
                            enabled: true,
                            strategies: [strategy],
                        })),
                    { selector: (feature) => feature.name },
                );

            // generate a constraint to be used for the context and a request
            // that contains that constraint value.
            const constraintAndRequest = () =>
                fc
                    .tuple(
                        contextValue(),
                        fc.constantFrom('top', 'nested'),
                        generateRequest(),
                    )
                    .map(([generatedContextValue, placement, req]) => {
                        const request =
                            placement === 'top'
                                ? {
                                      ...req,
                                      environment,
                                      context: {
                                          ...req.context,
                                          [generatedContextValue.name]:
                                              generatedContextValue.value,
                                      },
                                  }
                                : {
                                      ...req,
                                      environment,
                                      context: {
                                          ...req.context,
                                          properties: {
                                              [generatedContextValue.name]:
                                                  generatedContextValue.value,
                                          },
                                      },
                                  };

                        return {
                            generatedContextValue,
                            request,
                        };
                    });

            await fc.assert(
                fc
                    .asyncProperty(
                        constraintAndRequest(),
                        constrainedFeatures(),
                        fc.context(),
                        async (
                            { generatedContextValue, request },
                            features,
                            ctx,
                        ) => {
                            await seedDatabase(db, features, environment);

                            const body = await playgroundRequest(
                                app,
                                token.secret,
                                request,
                            );

                            const shouldBeEnabled = features.reduce(
                                (acc, next) => {
                                    const constraint =
                                        next.strategies[0].constraints[0];

                                    return {
                                        ...acc,
                                        [next.name]:
                                            constraint.contextName ===
                                                generatedContextValue.name &&
                                            constraint.values[0] ===
                                                generatedContextValue.value,
                                    };
                                },
                                {},
                            );

                            ctx.log(
                                `Got these ${JSON.stringify(
                                    body.features,
                                )} and I expect them to be enabled/disabled: ${JSON.stringify(
                                    shouldBeEnabled,
                                )}`,
                            );

                            return body.features.every(
                                (feature) =>
                                    feature.isEnabled ===
                                    shouldBeEnabled[feature.name],
                            );
                        },
                    )
                    .afterEach(reset(db)),
                testParams,
            );
        });

        test('context is applied to variant checks', async () => {
            const environment = 'development';
            const featureName = 'feature-name';
            const customContextFieldName = 'customField';
            const customContextValue = 'customValue';

            const features = [
                {
                    project: 'any-project',
                    strategies: [
                        {
                            name: 'default',
                            constraints: [
                                {
                                    contextName: customContextFieldName,
                                    operator: 'IN' as 'IN',
                                    values: [customContextValue],
                                },
                            ],
                        },
                    ],
                    stale: false,
                    enabled: true,
                    name: featureName,
                    type: 'experiment',
                    variants: [
                        {
                            name: 'a',
                            weight: 1000,
                            weightType: 'variable',
                            stickiness: 'default',
                            overrides: [],
                        },
                    ],
                },
            ];

            await seedDatabase(db, features, environment);

            const request = {
                projects: ALL as '*',
                environment,
                context: {
                    appName: 'playground',
                    [customContextFieldName]: customContextValue,
                },
            };

            const body = await playgroundRequest(app, token.secret, request);

            // when enabled, this toggle should have one of the variants
            expect(body.features[0].variant.name).toBe('a');
        });
    });
});
