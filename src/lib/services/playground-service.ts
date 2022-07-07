import FeatureToggleService from './feature-toggle-service';
import { SdkContextSchema } from 'lib/openapi/spec/sdk-context-schema';
import { InMemStorageProvider, Unleash as UnleashClient } from 'unleash-client';
import { FeatureInterface } from 'unleash-client/lib/feature';
import { IUnleashServices } from 'lib/types/services';
import { ALL } from '../../lib/types/models/api-token';
import { PlaygroundFeatureSchema } from 'lib/openapi/spec/playground-feature-schema';
import { Logger } from '../logger';
import { IUnleashConfig } from 'lib/types';
import { FeatureConfigurationClient } from 'lib/types/stores/feature-strategies-store';

export const offlineUnleashClient = (
    toggles: FeatureConfigurationClient[],
    context: SdkContextSchema,
    logError: (message: any, ...args: any[]) => void,
): UnleashClient => {
    const client = new UnleashClient({
        ...context,
        appName: context.appName || 'playground',
        disableMetrics: true,
        refreshInterval: 0,
        url: 'not-needed',
        storageProvider: new InMemStorageProvider(),
        bootstrap: {
            data: toggles as unknown as FeatureInterface[],
        },
    });

    client.on('error', logError);

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
        projects: '*' | string[],
        environment: string,
        context: SdkContextSchema,
    ): Promise<PlaygroundFeatureSchema[]> {
        const toggles = await this.featureToggleService.getClientFeatures({
            project: projects === '*' ? [ALL] : projects,
            environment,
        });

        const client = offlineUnleashClient(
            toggles,
            context,
            this.logger.error,
        );

        const output: PlaygroundFeatureSchema[] = await Promise.all(
            client.getFeatureToggleDefinitions().map(async (x) => ({
                isEnabled: client.isEnabled(x.name),
                projectId: await this.featureToggleService.getProjectId(x.name),
                variant: client.getVariant(x.name)?.name,
                name: x.name,
            })),
        );

        return output;
    }
}
