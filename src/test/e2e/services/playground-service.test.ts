import { PlaygroundService } from '../../../lib/services/playground-service';
import { clientFeatures } from '../../arbitraries.test';
import { generate as generateContext } from '../../../lib/openapi/spec/sdk-context-schema.test';
import fc from 'fast-check';
import { createTestConfig } from '../../config/test-config';
import dbInit, { ITestDb } from '../helpers/database-init';
import { IUnleashStores } from '../../../lib/types/stores';
import FeatureToggleService from '../../../lib/services/feature-toggle-service';
import { SegmentService } from '../../../lib/services/segment-service';
import { FeatureToggleDTO, IVariant } from '../../../lib/types/model';
import { PlaygroundFeatureSchema } from '../../../lib/openapi/spec/playground-feature-schema';
import { offlineUnleashClient } from '../../../lib/util/offline-unleash-client';
import { ClientFeatureSchema } from '../../../lib/openapi/spec/client-feature-schema';

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

    const toFeatureToggleDTO = (
        feature: ClientFeatureSchema,
    ): FeatureToggleDTO => ({
        ...feature,
        // the arbitrary generator takes care of this
        variants: feature.variants as IVariant[] | undefined,
        createdAt: undefined,
    });

    test('should return the same enabled toggles as the raw SDK correctly mapped', async () => {
        await fc.assert(
            fc
                .asyncProperty(
                    clientFeatures({ minLength: 1 }),
                    generateContext(),
                    async (toggles, context) => {
                        await Promise.all(
                            toggles.map((feature) =>
                                stores.featureToggleStore.create(
                                    feature.project,
                                    toFeatureToggleDTO(feature),
                                ),
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

                        return serviceToggles.every((feature) => {
                            const enabledStateMatches =
                                feature.isEnabled ===
                                client.isEnabled(feature.name, clientContext);

                            // if x.isEnabled then variant should === variant.name. Otherwise it should be null

                            // if x is disabled, then the variant will be the
                            // disabled variant.
                            if (!feature.isEnabled) {
                                return (
                                    enabledStateMatches &&
                                    isDisabledVariant(feature.variant)
                                );
                            }

                            const clientVariant = client.getVariant(
                                feature.name,
                                clientContext,
                            );

                            // if x is enabled, but its variant is the disabled
                            // variant, then the source does not have any
                            // variants
                            if (
                                feature.isEnabled &&
                                isDisabledVariant(feature.variant)
                            ) {
                                return (
                                    enabledStateMatches &&
                                    isDisabledVariant(clientVariant)
                                );
                            }

                            return (
                                enabledStateMatches &&
                                clientVariant.name === feature.variant.name &&
                                clientVariant.enabled ===
                                    feature.variant.enabled &&
                                clientVariant.payload ===
                                    feature.variant.payload
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

    test('output toggles should have the same variants as input toggles', async () => {
        await fc.assert(
            fc
                .asyncProperty(
                    clientFeatures({ minLength: 1 }),
                    generateContext(),
                    async (toggles, context) => {
                        await Promise.all(
                            toggles.map((feature) =>
                                stores.featureToggleStore.create(
                                    feature.project,
                                    toFeatureToggleDTO(feature),
                                ),
                            ),
                        );

                        const projects = '*';
                        const env = 'default';

                        const serviceToggles: PlaygroundFeatureSchema[] =
                            await service.evaluateQuery(projects, env, context);

                        const variantsMap = toggles.reduce(
                            (acc, feature) => ({
                                ...acc,
                                [feature.name]: feature.variants,
                            }),
                            {},
                        );

                        serviceToggles.forEach((feature) => {
                            if (variantsMap[feature.name]) {
                                expect(feature.variants).toEqual(
                                    expect.arrayContaining(
                                        variantsMap[feature.name],
                                    ),
                                );
                                expect(variantsMap[feature.name]).toEqual(
                                    expect.arrayContaining(feature.variants),
                                );
                            } else {
                                expect(feature.variants).toStrictEqual([]);
                            }
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
