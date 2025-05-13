import type { SdkContextSchema } from '../../openapi/spec/sdk-context-schema.js';
import {
    InMemStorageProvider,
    FeatureEvaluator,
} from './feature-evaluator/index.js';
import type { FeatureConfigurationClient } from '../../features/feature-toggle/types/feature-toggle-strategies-store-type.js';
import type { Segment } from './feature-evaluator/strategy/strategy.js';
import type { ISegment } from '../../types/model.js';
import { serializeDates } from '../../types/serialize-dates.js';
import type { Operator } from './feature-evaluator/constraint.js';
import type { PayloadType } from 'unleash-client';
import type { FeatureInterface } from 'unleash-client/lib/feature.js';
import type { FeatureInterface as PlaygroundFeatureInterface } from './feature-evaluator/feature.js';

type NonEmptyList<T> = [T, ...T[]];

export const mapFeaturesForClient = (
    features: FeatureConfigurationClient[],
): FeatureInterface[] =>
    features.map((feature) => mapFeatureForClient(feature));

export const mapFeatureForClient = (
    feature: FeatureConfigurationClient,
): FeatureInterface => {
    return {
        impressionData: false,
        ...feature,
        variants: (feature.variants || []).map((variant) => ({
            overrides: [],
            ...variant,
            payload: variant.payload && {
                ...variant.payload,
                type: variant.payload.type as PayloadType,
            },
        })),
        project: feature.project,
        strategies: feature.strategies.map((strategy) => ({
            parameters: {},
            ...strategy,
            title: strategy.title ?? undefined,
            disabled: strategy.disabled ?? false,
            variants: (strategy.variants || []).map((variant) => ({
                ...variant,
                payload: variant.payload && {
                    ...variant.payload,
                    type: variant.payload.type as PayloadType,
                },
            })),
            constraints:
                strategy.constraints?.map((constraint) => ({
                    inverted: false,
                    values: [],
                    ...constraint,
                    operator: constraint.operator as unknown as Operator,
                })) || [],
        })),
        dependencies: feature.dependencies,
    };
};

export const mapSegmentsForClient = (segments: ISegment[]): Segment[] =>
    serializeDates(segments) as Segment[];

export type ClientInitOptions = {
    features: NonEmptyList<FeatureConfigurationClient>;
    segments?: ISegment[];
    context: SdkContextSchema;
    logError: (message: any, ...args: any[]) => void;
};

export const offlineUnleashClient = async ({
    features,
    context,
    segments,
}: ClientInitOptions): Promise<FeatureEvaluator> => {
    const client = new FeatureEvaluator({
        ...context,
        appName: context.appName,
        storageProvider: new InMemStorageProvider(),
        bootstrap: {
            // FIXME: mismatch between playground and proxy types
            data: mapFeaturesForClient(
                features,
            ) as PlaygroundFeatureInterface[],
            segments: mapSegmentsForClient(segments || []),
        },
    });

    await client.start();

    return client;
};
