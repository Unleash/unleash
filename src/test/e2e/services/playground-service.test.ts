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

describe('the playground service (e2e)', () => {
    test('should return the same enabled toggles as the raw SDK', async () => {
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

                        const client = await offlineUnleashClient(
                            await featureToggleService.getClientFeatures(),
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
                            if (x.isEnabled) {
                                const variant = client.getVariant(
                                    x.name,
                                    clientContext,
                                ).name;

                                const b = x.variant
                                    ? x.variant === variant
                                    : variant === null;

                                return a && b;
                            }

                            return a;
                        });
                    },
                )
                .afterEach(async () => {
                    await stores.featureToggleStore.deleteAll();
                }),
        );
    });

    test('should map correctly from SDK output to endpoint output', async () => {
        await fc.assert(
            fc
                .asyncProperty(
                    generateToggles({ minLength: 1 }).map((xs) =>
                        xs.map((x) => ({
                            ...x,
                            strategies: x.strategies.map((s) => ({
                                ...s,
                                constraints: [],
                            })),
                        })),
                    ),
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

                        const createDict = (xs: { name: string }[]) =>
                            xs.reduce(
                                (acc, next) => ({ ...acc, [next.name]: next }),
                                {},
                            );

                        expect(serviceToggles.length).toEqual(toggles.length);

                        const serviceDict = createDict(serviceToggles);

                        return toggles.every((x) => {
                            const mapped: PlaygroundFeatureSchema =
                                serviceDict[x.name];

                            const variants = x.variants ?? [];
                            const variantIsValid =
                                mapped.isEnabled && variants.length > 0
                                    ? variants
                                          .map((v) => v.name)
                                          .includes(mapped.variant)
                                    : mapped.variant === null;
                            // ^ the mapped variant must be one of the original variants
                            // if they exist. If they do not exist, then the mapped
                            // variant must be null.

                            return (
                                x.name === mapped.name &&
                                variantIsValid &&
                                x.project === mapped.projectId
                            );
                        });
                    },
                )
                .afterEach(async () => {
                    await stores.featureToggleStore.deleteAll();
                }),
        );
    });
});

describe('offline client', () => {
    it('considers enabled variants with a default strategy to be on', async () => {
        const name = 'toggle-name';
        const client = await offlineUnleashClient(
            [
                {
                    strategies: [
                        {
                            name: 'default',
                            constraints: [],
                            parameters: {},
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

        expect(client.isEnabled(name)).toBeTruthy();
    });

    it("returns variant {name: 'disabled', enabled: false } if the toggle isn't enabled", async () => {
        const name = 'toggle-name';
        const client = await offlineUnleashClient(
            [
                {
                    strategies: [],
                    stale: false,
                    enabled: true,
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
});
