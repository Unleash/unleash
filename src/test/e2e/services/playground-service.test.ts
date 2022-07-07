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

                        const client = offlineUnleashClient(
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

                            const variant = client.getVariant(
                                x.name,
                                clientContext,
                            ).name;

                            const b = x.variant
                                ? x.variant === variant
                                : variant === null;

                            return a && b;
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

                        const createDict = (xs: { name: string }[]) =>
                            xs.reduce(
                                (acc, next) => ({ ...acc, [next.name]: next }),
                                {},
                            );

                        expect(serviceToggles.length).toEqual(toggles.length);

                        const serviceDict = createDict(serviceToggles);

                        return toggles.every((x) => {
                            const mapped = serviceDict[x.name];
                            const enabledIsValid = !(
                                x.strategies.length === 0 && mapped.isEnabled
                            );
                            // ^ if the original has no strategies, then the mapped
                            // version should never be enabled
                            const variants = x.variants ?? [];
                            const variantIsValid =
                                variants.length > 0
                                    ? variants
                                          .map((v) => v.name)
                                          .includes(mapped.variant)
                                    : mapped.variant === null;
                            // ^ the mapped variant must be one of the original variants
                            // if they exist. If they do not exist, then the mapped
                            // variant must be null.
                            return (
                                x.name === mapped.name &&
                                // ^ the mapped name must be the same as the original name.
                                enabledIsValid &&
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
