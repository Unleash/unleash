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

enum PayloadType {
    STRING = 'string',
}

export const offlineUnleashClient = async (
    toggles: FeatureConfigurationClient[],
    context: SdkContextSchema,
    logError: (message: any, ...args: any[]) => void,
): Promise<UnleashClient> => {
    const client = new UnleashClient({
        ...context,
        appName: context.appName || 'playground', // this is required and might mess people up
        disableMetrics: true,
        refreshInterval: 0,
        url: 'not-needed',
        storageProvider: new InMemStorageProvider(),
        bootstrap: {
            data: toggles.map((x) => ({
                impressionData: false,
                ...x,
                variants: x.variants.map((v) => ({
                    overrides: [],
                    ...v,
                    payload: v.payload && {
                        ...v.payload,
                        type: v.payload.type as unknown as PayloadType,
                    },
                })),
                strategies: x.strategies.map((s) => ({
                    parameters: {},
                    ...s,
                    constraints:
                        s.constraints &&
                        s.constraints.map((c) => ({
                            inverted: false,
                            values: [],
                            ...c,
                            operator: c.operator as unknown as Operator,
                        })),
                })),
            })),
        },
    });

    client.on('error', logError);

    await client.start();

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

        const clientContext = {
            ...context,
            currentTime: context.currentTime
                ? new Date(context.currentTime)
                : undefined,
        };

        const client = await offlineUnleashClient(
            toggles,
            context,
            this.logger.error,
        );

        const output: PlaygroundFeatureSchema[] = await Promise.all(
            client.getFeatureToggleDefinitions().map(async (x) => {
                return {
                    isEnabled: client.isEnabled(x.name, clientContext),
                    projectId: await this.featureToggleService.getProjectId(
                        x.name,
                    ),
                    variant: client.getVariant(x.name),
                    name: x.name,
                };
            }),
        );

        return output;
    }
}
