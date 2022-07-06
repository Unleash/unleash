import FeatureToggleService from './feature-toggle-service';
import { SdkContextSchema } from 'lib/openapi/spec/sdk-context-schema';
import { InMemStorageProvider, Unleash as UnleashClient } from 'unleash-client';
import { FeatureInterface } from 'unleash-client/lib/feature';
import { IUnleashServices } from 'lib/types/services';

export const offlineClientFromContext = (
    context: SdkContextSchema,
    toggles: FeatureInterface[],
): UnleashClient =>
    new UnleashClient({
        appName: 'playground',
        ...context,
        disableMetrics: true,
        refreshInterval: 0,
        url: 'not-needed',
        storageProvider: new InMemStorageProvider(),
        bootstrap: {
            data: toggles,
        },
    });

export class PlaygroundService {
    // private readonly logger: Logger;

    private readonly featureToggleService: FeatureToggleService;

    constructor({
        featureToggleServiceV2,
    }: Pick<IUnleashServices, 'featureToggleServiceV2'>) {
        // this.logger = config.getLogger('services/playground-service.ts');
        this.featureToggleService = featureToggleServiceV2;
    }

    async evaluateQuery(
        projects: '*' | string[],
        environment: string,
        context: SdkContextSchema,
    ): Promise<FeatureInterface[]> {
        const toggles = await this.featureToggleService.getClientFeatures({
            project: projects === '*' ? undefined : projects, // how do I do this?
            environment,
        });

        //@ts-expect-error
        const client = offlineClientFromContext(context, toggles);

        return client.getFeatureToggleDefinitions();
    }
}
