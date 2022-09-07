import { SdkContextSchema } from 'lib/openapi/spec/sdk-context-schema';
import { InMemStorageProvider, FeatureEvaluator } from './feature-evaluator';
import { FeatureConfigurationClient } from 'lib/types/stores/feature-strategies-store';
import { Segment } from './feature-evaluator/strategy/strategy';
import { ISegment } from 'lib/types/model';
import { serializeDates } from '../../lib/types/serialize-dates';
import { FeatureInterface } from './feature-evaluator/feature';
import { Operator } from './feature-evaluator/constraint';

enum PayloadType {
    STRING = 'string',
}

type NonEmptyList<T> = [T, ...T[]];

export const mapFeaturesForClient = (
    features: FeatureConfigurationClient[],
): FeatureInterface[] =>
    features.map((feature) => ({
        impressionData: false,
        ...feature,
        variants: (feature.variants || []).map((variant) => ({
            overrides: [],
            ...variant,
            payload: variant.payload && {
                ...variant.payload,
                type: variant.payload.type as unknown as PayloadType,
            },
        })),
        strategies: feature.strategies.map((strategy) => ({
            parameters: {},
            ...strategy,
            constraints:
                strategy.constraints &&
                strategy.constraints.map((constraint) => ({
                    inverted: false,
                    values: [],
                    ...constraint,
                    operator: constraint.operator as unknown as Operator,
                })),
        })),
    }));

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
            data: mapFeaturesForClient(features),
            segments: mapSegmentsForClient(segments),
        },
    });

    client.start();

    return client;
};
