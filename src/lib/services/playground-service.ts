import FeatureToggleService from './feature-toggle-service';
import { SdkContextSchema } from 'lib/openapi/spec/sdk-context-schema';
import { InMemStorageProvider, Unleash as UnleashClient } from 'unleash-client';
import { IUnleashServices } from 'lib/types/services';
import { ALL } from '../../lib/types/models/api-token';
import { PlaygroundFeatureSchema } from 'lib/openapi/spec/playground-feature-schema';
import { Logger } from '../logger';
import { IUnleashConfig } from 'lib/types';
import { FeatureConfigurationClient } from 'lib/types/stores/feature-strategies-store';
import { Operator } from 'unleash-client/lib/strategy/strategy';
import { once } from 'events';

enum PayloadType {
    STRING = 'string',
}

type NonEmptyList<T> = [T, ...T[]];

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
            data: features.map((feature) => ({
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
                            operator:
                                constraint.operator as unknown as Operator,
                        })),
                })),
            })),
        },
    });

    client.on('error', logError);
    client.start();

    await once(client, 'ready');

    return client;
};

export class PlaygroundService {
    private readonly logger: Logger;

    private readonly featureToggleService: FeatureToggleService;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleServiceV2,
        }: Pick<IUnleashServices, 'featureToggleServiceV2'>,
    ) {
        this.logger = config.getLogger('services/playground-service.ts');
        this.featureToggleService = featureToggleServiceV2;
    }

    async evaluateQuery(
        projects: typeof ALL | string[],
        environment: string,
        context: SdkContextSchema,
    ): Promise<PlaygroundFeatureSchema[]> {
        const toggles = await this.featureToggleService.getClientFeatures({
            project: projects === ALL ? undefined : projects,
            environment,
        });

        const [head, ...rest] = toggles;
        if (!head) {
            return [];
        } else {
            const client = await offlineUnleashClient(
                [head, ...rest],
                context,
                this.logger.error,
            );

            const clientContext = {
                ...context,
                currentTime: context.currentTime
                    ? new Date(context.currentTime)
                    : undefined,
            };
            const output: PlaygroundFeatureSchema[] = await Promise.all(
                client.getFeatureToggleDefinitions().map(async (feature) => {
                    return {
                        isEnabled: client.isEnabled(
                            feature.name,
                            clientContext,
                        ),
                        projectId: await this.featureToggleService.getProjectId(
                            feature.name,
                        ),
                        variant: client.getVariant(feature.name),
                        name: feature.name,
                    };
                }),
            );

            return output;
        }
    }
}
