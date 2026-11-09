import type { ITestDb } from './database-init.js';
import {
    type FeatureToggle,
    type ISegment,
    WeightType,
} from '../../../lib/types/model.js';
import type { ClientFeatureSchema } from '../../../lib/openapi/spec/client-feature-schema.js';
import type { SegmentSchema } from '../../../lib/openapi/spec/segment-schema.js';

const mapSegmentSchemaToISegment = (
    segment: SegmentSchema,
    index?: number,
): ISegment => ({
    ...segment,
    name: segment.name || `test-segment ${index ?? 'unnumbered'}`,
    createdAt: new Date(),
    description: '',
    project: undefined,
});

export const seedDatabaseForPlaygroundTest = async (
    database: ITestDb,
    features: ClientFeatureSchema[],
    environment: string,
    segments?: SegmentSchema[],
): Promise<FeatureToggle[]> => {
    if (segments) {
        await Promise.all(
            segments.map(async (segment, index) =>
                database.stores.segmentStore.create(
                    mapSegmentSchemaToISegment(segment, index),
                    { username: 'test' },
                ),
            ),
        );
    }

    return Promise.all(
        features.map(async (feature) => {
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

            // create feature
            const toggle = await database.stores.featureToggleStore.create(
                feature.project!,
                {
                    ...feature,
                    createdAt: undefined,
                    variants: [],
                    description: undefined,
                    impressionData: false,
                    createdByUserId: 9999,
                },
            );

            // enable/disable the feature in environment
            await database.stores.featureEnvironmentStore.addEnvironmentToFeature(
                feature.name,
                environment,
                feature.enabled,
            );

            await database.stores.featureEnvironmentStore.addVariantsToFeatureEnvironment(
                feature.name,
                environment,
                [
                    ...(feature.variants ?? []).map((variant) => ({
                        ...variant,
                        weightType: WeightType.VARIABLE,
                        stickiness: 'default',
                    })),
                ],
            );

            // assign strategies
            await Promise.all(
                (feature.strategies || []).map(
                    async ({ segments: strategySegments, ...strategy }) => {
                        await database.stores.featureStrategiesStore.createStrategyFeatureEnv(
                            {
                                parameters: {},
                                constraints: [],
                                ...strategy,
                                featureName: feature.name,
                                environment,
                                strategyName: strategy.name,
                                projectId: feature.project!,
                            },
                        );

                        if (strategySegments) {
                            await Promise.all(
                                strategySegments.map((segmentId) =>
                                    database.stores.segmentStore.addToStrategy(
                                        segmentId,
                                        strategy.id!,
                                    ),
                                ),
                            );
                        }
                    },
                ),
            );

            return toggle;
        }),
    );
};
