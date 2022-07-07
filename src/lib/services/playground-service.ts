import FeatureToggleService from './feature-toggle-service';
import { SdkContextSchema } from 'lib/openapi/spec/sdk-context-schema';
import { InMemStorageProvider, Unleash as UnleashClient } from 'unleash-client';
import { FeatureInterface } from 'unleash-client/lib/feature';
import { IUnleashServices } from 'lib/types/services';
import { ALL } from '../../lib/types/models/api-token';
import { PlaygroundFeatureSchema } from 'lib/openapi/spec/playground-feature-schema';
// import { FeatureConfigurationClient } from 'lib/types/stores/feature-strategies-store';

export type ClientToggle = FeatureInterface;

export const offlineClientFromContext = (
    context: SdkContextSchema,
    toggles: ClientToggle[],
): UnleashClient => {
    const client = new UnleashClient({
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

    client.on('ready', console.log.bind(console, 'ready'));
    client.on('error', console.error);

    return client;
};
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
    ): Promise<PlaygroundFeatureSchema[]> {
        const toggles = await this.featureToggleService.getClientFeatures({
            project: projects === '*' ? [ALL] : projects, // how do I do this?
            environment,
        });

        console.log(context, toggles);

        // const client = offlineClientFromContext(
        //     context,
        //     //@ts-expect-error the Operator enum from unleash-client contains the same strings as the operator enums in this repo, but they're not the same
        //     toggles.map((x) => ({
        //         type: 'release',
        //         ...x,
        //         impressionData: true,
        //         strategies: x.strategies.map((s) => ({
        //             parameters: {},
        //             ...s,
        //             // parameters: s.parameters ?? {},
        //         })),
        //     })),
        // );

        // return client.getFeatureToggleDefinitions();
        // return mapToggles([]);
        return [];
    }
}

// export const mapToggles = (
//     input: FeatureConfigurationClient[],
//     client: UnleashClient,
// ): Omit<PlaygroundFeatureSchema, 'projectId'>[] =>
//     input.map((x) => ({
//         isEnabled: x.enabled,
//         variant: client.getVariant(x.name).name,
//         name: x.name,
//     }));
