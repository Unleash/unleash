import {
    offlineUnleashClient,
    PlaygroundService,
} from '../../../lib/services/playground-service';
import { generateToggles } from '../../../lib/routes/admin-api/playground.test';
import { generate as generateContext } from '../../../lib/openapi/spec/sdk-context-schema.test';
import fc from 'fast-check';
import { createTestConfig } from '../../config/test-config';
import dbInit, { ITestDb } from '../helpers/database-init';
import { IUnleashStores } from '../../../lib/types/stores';
import FeatureToggleService from '../../../lib/services/feature-toggle-service';
import { SegmentService } from '../../../lib/services/segment-service';
import { WeightType } from '../../../lib/types/model';
import { PlaygroundFeatureSchema } from '../../../lib/openapi/spec/playground-feature-schema';

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

const testParams = {
    interruptAfterTimeLimit: 4000, // Default timeout in Jest 5000ms
    markInterruptAsFailure: false, // When set to false, timeout during initial cases will not be considered as a failure
};

describe('the playground service (e2e)', () => {
    const isDisabledVariant = ({
        name,
        enabled,
    }: {
        name: string;
        enabled: boolean;
    }) => name === 'disabled' && !enabled;

    test('should return the same enabled toggles as the raw SDK correctly mapped', async () => {
        await fc.assert(
            fc
                .asyncProperty(
                    generateToggles({ minLength: 1 }),
                    generateContext(),
                    async (toggles, context) => {
                        await Promise.all(
                            toggles.map((t) =>
                                stores.featureToggleStore.create(t.project, {
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

                        const projects = '*';
                        const env = 'default';

                        const serviceToggles: PlaygroundFeatureSchema[] =
                            await service.evaluateQuery(projects, env, context);

                        const [head, ...rest] =
                            await featureToggleService.getClientFeatures();
                        if (!head) {
                            return serviceToggles.length === 0;
                        }

                        const client = await offlineUnleashClient(
                            [head, ...rest],
                            context,
                            console.log,
                        );

                        const clientContext = {
                            ...context,

                            currentTime: context.currentTime
                                ? new Date(context.currentTime)
                                : undefined,
                        };

                        return serviceToggles.every((x) => {
                            const a =
                                x.isEnabled ===
                                client.isEnabled(x.name, clientContext);

                            // if x.isEnabled then variant should === variant.name. Otherwise it should be null

                            // if x is disabled, then the variant will be the
                            // disabled variant.
                            if (!x.isEnabled) {
                                return a && isDisabledVariant(x.variant);
                            }

                            const clientVariant = client.getVariant(
                                x.name,
                                clientContext,
                            );

                            // if x is enabled, but its variant is the disabled
                            // variant, then the source does not have any
                            // variants
                            if (x.isEnabled && isDisabledVariant(x.variant)) {
                                return a && isDisabledVariant(clientVariant);
                            }

                            return (
                                a &&
                                clientVariant.name === x.variant.name &&
                                clientVariant.enabled === x.variant.enabled &&
                                clientVariant.payload === x.variant.payload
                            );
                        });
                    },
                )
                .afterEach(async () => {
                    await stores.featureToggleStore.deleteAll();
                }),
            testParams,
        );
    });
});

describe('offline client', () => {
    it('considers enabled variants with a default strategy to be on', async () => {
        const name = 'toggle-name';
        const client = await offlineUnleashClient(
            [
                {
                    name,
                    enabled: true,
                    strategies: [{ name: 'default' }],
                    variants: [],
                    type: '',
                    stale: false,
                },
            ],
            { appName: 'other-app', environment: 'default' },
            console.log,
        );

        expect(client.isEnabled(name)).toBeTruthy();
    });

    it('constrains on appName', async () => {
        const enabledFeature = 'toggle-name';
        const disabledFeature = 'other-toggle';
        const appName = 'app-name';
        const client = await offlineUnleashClient(
            [
                {
                    name: enabledFeature,
                    enabled: true,
                    strategies: [
                        {
                            name: 'default',
                            constraints: [
                                {
                                    contextName: 'appName',
                                    operator: 'IN',
                                    values: [appName],
                                },
                            ],
                        },
                    ],
                    variants: [],
                    type: '',
                    stale: false,
                },
                {
                    name: disabledFeature,
                    enabled: true,
                    strategies: [
                        {
                            name: 'default',
                            constraints: [
                                {
                                    contextName: 'appName',
                                    operator: 'IN',
                                    values: ['otherApp'],
                                },
                            ],
                        },
                    ],
                    variants: [],
                    type: '',
                    stale: false,
                },
            ],
            { appName, environment: 'default' },
            console.log,
        );

        expect(client.isEnabled(enabledFeature)).toBeTruthy();
        expect(client.isEnabled(disabledFeature)).toBeFalsy();
    });

    it('considers disabled variants with a default strategy to be off', async () => {
        const name = 'toggle-name';
        const client = await offlineUnleashClient(
            [
                {
                    strategies: [
                        {
                            name: 'default',
                        },
                    ],
                    stale: false,
                    enabled: false,
                    name,
                    type: 'experiment',
                    variants: [],
                },
            ],
            {},
            console.log,
        );

        expect(client.isEnabled(name)).toBeFalsy();
    });

    it('considers disabled variants with a default strategy and variants to be off', async () => {
        const name = 'toggle-name';
        const client = await offlineUnleashClient(
            [
                {
                    strategies: [
                        {
                            name: 'default',
                        },
                    ],
                    stale: false,
                    enabled: false,
                    name,
                    type: 'experiment',
                    variants: [
                        {
                            name: 'a',
                            weight: 500,
                            weightType: 'variable',
                            stickiness: 'default',
                            overrides: [],
                        },
                        {
                            name: 'b',
                            weight: 500,
                            weightType: 'variable',
                            stickiness: 'default',
                            overrides: [],
                        },
                    ],
                },
            ],
            {},
            console.log,
        );

        expect(client.isEnabled(name)).toBeFalsy();
    });

    it("returns variant {name: 'disabled', enabled: false } if the toggle isn't enabled", async () => {
        const name = 'toggle-name';
        const client = await offlineUnleashClient(
            [
                {
                    strategies: [],
                    stale: false,
                    enabled: false,
                    name,
                    type: 'experiment',
                    variants: [
                        {
                            name: 'a',
                            weight: 500,
                            weightType: 'variable',
                            stickiness: 'default',
                            overrides: [],
                        },
                        {
                            name: 'b',
                            weight: 500,
                            weightType: 'variable',
                            stickiness: 'default',
                            overrides: [],
                        },
                    ],
                },
            ],
            {},
            console.log,
        );

        expect(client.isEnabled(name)).toBeFalsy();
        expect(client.getVariant(name).name).toEqual('disabled');
        expect(client.getVariant(name).enabled).toBeFalsy();
    });

    it('returns the disabled variant if there are no variants', async () => {
        const name = 'toggle-name';
        const client = await offlineUnleashClient(
            [
                {
                    strategies: [
                        {
                            name: 'default',
                            constraints: [],
                        },
                    ],
                    stale: false,
                    enabled: true,
                    name,
                    type: 'experiment',
                    variants: [],
                },
            ],
            {},
            console.log,
        );

        expect(client.getVariant(name, {}).name).toEqual('disabled');
        expect(client.getVariant(name, {}).enabled).toBeFalsy();
        expect(client.isEnabled(name, {})).toBeTruthy();
    });
});
