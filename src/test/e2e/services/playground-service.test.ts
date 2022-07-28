import { PlaygroundService } from '../../../lib/services/playground-service';
import { clientFeatures, commonISOTimestamp } from '../../arbitraries.test';
import { generate as generateContext } from '../../../lib/openapi/spec/sdk-context-schema.test';
import fc from 'fast-check';
import { createTestConfig } from '../../config/test-config';
import dbInit, { ITestDb } from '../helpers/database-init';
import { IUnleashStores } from '../../../lib/types/stores';
import FeatureToggleService from '../../../lib/services/feature-toggle-service';
import { SegmentService } from '../../../lib/services/segment-service';
import { FeatureToggle, WeightType } from '../../../lib/types/model';
import { PlaygroundFeatureSchema } from '../../../lib/openapi/spec/playground-feature-schema';
import { offlineUnleashClientNode } from '../../../lib/util/offline-unleash-client';
import { ClientFeatureSchema } from 'lib/openapi/spec/client-feature-schema';
import { SdkContextSchema } from 'lib/openapi/spec/sdk-context-schema';

let stores: IUnleashStores;
let db: ITestDb;
let service: PlaygroundService;
let featureToggleService: FeatureToggleService;

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit('playground_service_serial', config.getLogger);
    stores = db.stores;
    featureToggleService = new FeatureToggleService(
        stores,
        config,
        new SegmentService(stores, config),
    );
    service = new PlaygroundService(config, {
        featureToggleServiceV2: featureToggleService,
    });
});

afterAll(async () => {
    await db.destroy();
});

afterEach(async () => {
    await stores.featureToggleStore.deleteAll();
});

const testParams = {
    interruptAfterTimeLimit: 4000, // Default timeout in Jest 5000ms
    markInterruptAsFailure: false, // When set to false, timeout during initial cases will not be considered as a failure
};

export const seedDatabaseForPlaygroundTest = (
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

describe('the playground service (e2e)', () => {
    const isDisabledVariant = ({
        name,
        enabled,
    }: {
        name: string;
        enabled: boolean;
    }) => name === 'disabled' && !enabled;

    const insertAndEvaluateFeatures = async (
        features: ClientFeatureSchema[],
        context: SdkContextSchema,
        env: string = 'default',
    ): Promise<PlaygroundFeatureSchema[]> => {
        await seedDatabaseForPlaygroundTest(db, features, env);

        const projects = '*';

        const serviceFeatures: PlaygroundFeatureSchema[] =
            await service.evaluateQuery(projects, env, context);

        return serviceFeatures;
    };

    test('should return the same enabled toggles as the raw SDK correctly mapped', async () => {
        await fc.assert(
            fc
                .asyncProperty(
                    clientFeatures({ minLength: 1 }),
                    fc
                        .tuple(generateContext(), commonISOTimestamp())
                        .map(([context, currentTime]) => ({
                            ...context,
                            userId: 'constant',
                            sessionId: 'constant2',
                            currentTime,
                        })),
                    fc.context(),
                    async (toggles, context, ctx) => {
                        const serviceToggles = await insertAndEvaluateFeatures(
                            toggles,
                            context,
                        );

                        const [head, ...rest] =
                            await featureToggleService.getClientFeatures();
                        if (!head) {
                            return serviceToggles.length === 0;
                        }

                        const client = await offlineUnleashClientNode({
                            features: [head, ...rest],
                            context,
                            logError: console.log,
                        });

                        const clientContext = {
                            ...context,

                            currentTime: context.currentTime
                                ? new Date(context.currentTime)
                                : undefined,
                        };

                        return serviceToggles.every((feature) => {
                            const enabledStateMatches =
                                feature.isEnabled ===
                                client.isEnabled(feature.name, clientContext);

                            ctx.log(`feature.isEnabled: ${feature.isEnabled}`);
                            ctx.log(
                                `client.isEnabled: ${client.isEnabled(
                                    feature.name,
                                    clientContext,
                                )}`,
                            );

                            // if x is disabled, then the variant will be the
                            // disabled variant.
                            if (!feature.isEnabled) {
                                ctx.log(`${feature.name} is not enabled`);
                                ctx.log(JSON.stringify(feature.variant));
                                ctx.log(JSON.stringify(enabledStateMatches));
                                ctx.log(
                                    JSON.stringify(
                                        feature.variant.name === 'disabled',
                                    ),
                                );
                                ctx.log(
                                    JSON.stringify(
                                        feature.variant.enabled === false,
                                    ),
                                );
                                return (
                                    enabledStateMatches &&
                                    isDisabledVariant(feature.variant)
                                );
                            }
                            ctx.log('feature is enabled');

                            const clientVariant = client.getVariant(
                                feature.name,
                                clientContext,
                            );

                            // if x is enabled, but its variant is the disabled
                            // variant, then the source does not have any
                            // variants
                            if (isDisabledVariant(feature.variant)) {
                                return (
                                    enabledStateMatches &&
                                    isDisabledVariant(clientVariant)
                                );
                            }

                            const allgood =
                                enabledStateMatches &&
                                clientVariant.name === feature.variant.name &&
                                clientVariant.enabled ===
                                    feature.variant.enabled &&
                                clientVariant.payload?.type ===
                                    feature.variant.payload?.type &&
                                clientVariant.payload?.value ===
                                    feature.variant.payload?.value;

                            ctx.log('feature has a variant');
                            ctx.log(JSON.stringify(clientVariant));
                            ctx.log(JSON.stringify(feature.variant));
                            ctx.log(JSON.stringify(enabledStateMatches));
                            ctx.log(JSON.stringify(allgood));

                            return allgood;
                        });
                    },
                )
                .afterEach(async () => {
                    await stores.featureToggleStore.deleteAll();
                }),
            { ...testParams, examples: [] },
        );
    });

    // counterexamples found by fastcheck
    const counterexamples = [
        [
            [
                {
                    name: '-',
                    type: 'release',
                    project: 'A',
                    enabled: true,
                    lastSeenAt: '1970-01-01T00:00:00.000Z',
                    impressionData: null,
                    strategies: [],
                    variants: [
                        {
                            name: '-',
                            weight: 147,
                            weightType: 'variable',
                            stickiness: 'default',
                            payload: { type: 'string', value: '' },
                        },
                        {
                            name: '~3dignissim~gravidaod',
                            weight: 301,
                            weightType: 'variable',
                            stickiness: 'default',
                            payload: {
                                type: 'json',
                                value: '{"Sv7gRNNl=":[true,"Mfs >mp.D","O-jtK","y%i\\"Ub~",null,"J",false,"(\'R"],"F0g+>1X":3.892913121148499e-188,"Fi~k(":-4.882970135331098e+146,"":null,"nPT]":true}',
                            },
                        },
                    ],
                },
            ],
            {
                appName: '"$#',
                currentTime: '9999-12-31T23:59:59.956Z',
                environment: 'r',
            },
            {
                logs: [
                    'feature is enabled',
                    'feature has a variant',
                    '{"name":"-","payload":{"type":"string","value":""},"enabled":true}',
                    '{"name":"~3dignissim~gravidaod","payload":{"type":"json","value":"{\\"Sv7gRNNl=\\":[true,\\"Mfs >mp.D\\",\\"O-jtK\\",\\"y%i\\\\\\"Ub~\\",null,\\"J\\",false,\\"(\'R\\"],\\"F0g+>1X\\":3.892913121148499e-188,\\"Fi~k(\\":-4.882970135331098e+146,\\"\\":null,\\"nPT]\\":true}"},"enabled":true}',
                    'true',
                    'false',
                ],
            },
        ],
        [
            [
                {
                    name: '-',
                    project: '0',
                    enabled: true,
                    strategies: [
                        {
                            name: 'default',
                            constraints: [
                                {
                                    contextName: 'A',
                                    operator: 'NOT_IN',
                                    caseInsensitive: false,
                                    inverted: false,
                                    values: [],
                                    value: '',
                                },
                            ],
                        },
                    ],
                },
            ],
            { appName: ' ', userId: 'constant', sessionId: 'constant2' },
            { logs: [] },
        ],
        [
            [
                {
                    name: 'a',
                    project: 'a',
                    enabled: true,
                    strategies: [
                        {
                            name: 'default',
                            constraints: [
                                {
                                    contextName: '0',
                                    operator: 'NOT_IN',
                                    caseInsensitive: false,
                                    inverted: false,
                                    values: [],
                                    value: '',
                                },
                            ],
                        },
                    ],
                },
                {
                    name: '-',
                    project: 'elementum',
                    enabled: false,
                    strategies: [],
                },
            ],
            { appName: ' ', userId: 'constant', sessionId: 'constant2' },
            {
                logs: [
                    'feature is not enabled',
                    '{"name":"disabled","enabled":false}',
                ],
            },
        ],
        [
            [
                {
                    name: '0',
                    project: '-',
                    enabled: true,
                    strategies: [
                        {
                            name: 'default',
                            constraints: [
                                {
                                    contextName: 'sed',
                                    operator: 'NOT_IN',
                                    caseInsensitive: false,
                                    inverted: false,
                                    values: [],
                                    value: '',
                                },
                            ],
                        },
                    ],
                },
            ],
            { appName: ' ', userId: 'constant', sessionId: 'constant2' },
            {
                logs: [
                    '0 is not enabled',
                    '{"name":"disabled","enabled":false}',
                    'true',
                    'true',
                ],
            },
        ],
        [
            [
                {
                    name: '0',
                    project: 'ac',
                    enabled: true,

                    strategies: [
                        {
                            name: 'default',
                            constraints: [
                                {
                                    contextName: '0',
                                    operator: 'NOT_IN',
                                    caseInsensitive: false,
                                    inverted: false,
                                    values: [],
                                    value: '',
                                },
                            ],
                        },
                    ],
                },
            ],
            { appName: ' ', userId: 'constant', sessionId: 'constant2' },
            {
                logs: [
                    'feature.isEnabled: false',
                    'client.isEnabled: true',
                    '0 is not enabled',
                    '{"name":"disabled","enabled":false}',
                    'false',
                    'true',
                    'true',
                ],
            },
        ],
        [
            [
                {
                    name: '0',
                    project: 'aliquam',
                    enabled: true,
                    strategies: [
                        {
                            name: 'default',
                            constraints: [
                                {
                                    contextName: '-',
                                    operator: 'NOT_IN',
                                    caseInsensitive: false,
                                    inverted: false,
                                    values: [],
                                    value: '',
                                },
                            ],
                        },
                    ],
                },
                {
                    name: '-',
                    project: '-',
                    enabled: false,
                    strategies: [],
                },
            ],
            {
                appName: ' ',
                userId: 'constant',
                sessionId: 'constant2',
                currentTime: '1970-01-01T00:00:00.000Z',
            },
            {
                logs: [
                    'feature.isEnabled: false',
                    'client.isEnabled: true',
                    '0 is not enabled',
                    '{"name":"disabled","enabled":false}',
                    'false',
                    'true',
                    'true',
                ],
            },
        ],
    ];

    // these tests test counterexamples found by fast check. The may seem redundant, but are concrete cases that might break.
    counterexamples.map(async ([features, context], i) => {
        it(`should do the same as the raw SDK: counterexample ${i}`, async () => {
            const serviceFeatures = await insertAndEvaluateFeatures(
                // @ts-expect-error
                features,
                context,
            );

            const [head, ...rest] =
                await featureToggleService.getClientFeatures();
            if (!head) {
                return serviceFeatures.length === 0;
            }

            const client = await offlineUnleashClientNode({
                features: [head, ...rest],
                // @ts-expect-error
                context,
                logError: console.log,
            });

            const clientContext = {
                ...context,

                // @ts-expect-error
                currentTime: context.currentTime
                    ? // @ts-expect-error
                      new Date(context.currentTime)
                    : undefined,
            };

            serviceFeatures.forEach((feature) => {
                expect(feature.isEnabled).toEqual(
                    //@ts-expect-error
                    client.isEnabled(feature.name, clientContext),
                );
            });
        });
    });

    // should it? The order doesn't matter for now. How do you know what the right sort order is?
    // test('should return strategies in the same order as they are listed', () => {});

    const todo = () => Promise.reject();
    test("should return all of a feature's strategies", async () => {
        await fc.assert(
            fc
                .asyncProperty(
                    clientFeatures({ minLength: 1 }),
                    generateContext(),
                    fc.context(),
                    async (generatedFeatures, context, ctx) => {
                        const log = (x: unknown) => ctx.log(JSON.stringify(x));
                        const serviceFeatures = await insertAndEvaluateFeatures(
                            generatedFeatures,
                            context,
                        );

                        const serviceFeaturesDict: {
                            [key: string]: PlaygroundFeatureSchema;
                        } = serviceFeatures.reduce(
                            (acc, feature) => ({
                                ...acc,
                                [feature.name]: feature,
                            }),
                            {},
                        );

                        // for each feature, find the corresponding evaluated feature
                        // and make sure that the evaluated
                        // return genFeat.length === servFeat.length && zip(gen, serv).
                        generatedFeatures.forEach((feature) => {
                            const mappedFeature: PlaygroundFeatureSchema =
                                serviceFeaturesDict[feature.name];

                            // log(feature);
                            log(mappedFeature);

                            const featureStrategies = feature.strategies ?? [];
                            featureStrategies.reverse();

                            expect(mappedFeature.strategies.length).toEqual(
                                featureStrategies.length,
                            );

                            feature.strategies.every((strategy, index) => {
                                const expected = {
                                    ...strategy,
                                    // provide an empty list as fallback because
                                    // the code doesn't know the difference
                                    constraints: strategy.constraints ?? [],
                                };

                                // extract the `result` property, because it
                                // doesn't exist in the input
                                // const remove =
                                //     <T, K extends keyof T>(key: K) =>
                                //     (input: T): Omit<T, K> => {
                                //         delete input[key]
                                //         return input;
                                //     };

                                // remove('result')(
                                //     mappedFeature.strategies[index],
                                // );

                                const removeResult = <T>({
                                    result,
                                    ...rest
                                }: T & {
                                    result: unknown;
                                }) => rest;

                                const mappedStrategy = removeResult(
                                    mappedFeature.strategies[index],
                                );

                                const receivedCleaned = {
                                    ...mappedStrategy,
                                    constraints:
                                        mappedStrategy.constraints?.map(
                                            removeResult,
                                        ),
                                };

                                expect(receivedCleaned).toEqual(expected);
                            });
                        });
                    },
                )
                .afterEach(async () => {
                    await stores.featureToggleStore.deleteAll();
                }),
            testParams,
        );
    });

    // test('should return feature strategies with all their constraints', todo);
    // test('should return feature strategies with all their segments', todo);
    // test("if a strategy isn't found, it should get 'not found' as its status", todo);
    // test("if no strategies are found, it should return 'unknown'", todo);

    // // test that if a feature is enabled it either has no strats OR
    // // _at least_ one strategy with result = true if it is disabled,
    // // it EITHER has enabled = false OR no strats with result = true
    // test('enabled state is reflected in the strats', todo);
});
