import { SdkContextSchema } from 'lib/openapi/spec/sdk-context-schema';
import {
    InMemStorageProvider,
    Unleash as UnleashClient,
} from './feature-evaluator';
import {
    Unleash as UnleashClientNode,
    InMemStorageProvider as InMemStorageProviderNode,
} from 'unleash-client';
import { FeatureConfigurationClient } from 'lib/types/stores/feature-strategies-store';
import { Operator, Segment } from 'unleash-client/lib/strategy/strategy';
import { once } from 'events';
import { ISegment } from 'lib/types/model';
import { serializeDates } from '../../lib/types/serialize-dates';

enum PayloadType {
    STRING = 'string',
}

type NonEmptyList<T> = [T, ...T[]];

const mapFeaturesForBootstrap = (features: FeatureConfigurationClient[]) =>
    features.map((feature) => ({
        impressionData: false,
        ...feature,
        variants: feature.variants.map((variant) => ({
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

const mapSegmentsForBootstrap = (segments: ISegment[]): Segment[] =>
    serializeDates(segments) as Segment[];

type ClientInitOptions = {
    features: NonEmptyList<FeatureConfigurationClient>;
    segments?: ISegment[];
    context: SdkContextSchema;
    logError: (message: any, ...args: any[]) => void;
};

export const offlineUnleashClient = async ({
    features,
    context,
    logError,
    segments,
}: ClientInitOptions): Promise<UnleashClient> => {
    const client = new UnleashClient({
        ...context,
        appName: context.appName,
        disableMetrics: true,
        refreshInterval: 0,
        url: 'not-needed',
        storageProvider: new InMemStorageProvider(),
        bootstrap: {
            data: mapFeaturesForBootstrap(features),
            segments: mapSegmentsForBootstrap(segments),
        },
    });

    client.on('error', logError);
    client.start();

    await once(client, 'ready');

    return client;
};

export const offlineUnleashClientNode = async ({
    features,
    context,
    logError,
    segments,
}: ClientInitOptions): Promise<UnleashClientNode> => {
    const client = new UnleashClientNode({
        ...context,
        appName: context.appName,
        disableMetrics: true,
        refreshInterval: 0,
        url: 'not-needed',
        storageProvider: new InMemStorageProviderNode(),
        bootstrap: {
            data: mapFeaturesForBootstrap(features),
            segments: mapSegmentsForBootstrap(segments),
        },
    });

    client.on('error', logError);
    client.start();

    await once(client, 'ready');

    return client;
};
