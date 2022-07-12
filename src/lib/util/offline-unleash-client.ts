import { SdkContextSchema } from 'lib/openapi/spec/sdk-context-schema';
import { InMemStorageProvider, Unleash as UnleashClient } from 'unleash-client';
import { FeatureConfigurationClient } from 'lib/types/stores/feature-strategies-store';
import { Operator } from 'unleash-client/lib/strategy/strategy';
import { once } from 'events';

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

export const offlineUnleashClient = async (
    features: NonEmptyList<FeatureConfigurationClient>,
    context: SdkContextSchema,
    logError: (message: any, ...args: any[]) => void,
): Promise<UnleashClient> => {
    const client = new UnleashClient({
        ...context,
        appName: context.appName,
        disableMetrics: true,
        refreshInterval: 0,
        url: 'not-needed',
        storageProvider: new InMemStorageProvider(),
        bootstrap: {
            data: mapFeaturesForBootstrap(features),
        },
    });

    client.on('error', logError);
    client.start();

    await once(client, 'ready');

    return client;
};
