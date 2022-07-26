import FeatureToggleService from './feature-toggle-service';
import { SdkContextSchema } from 'lib/openapi/spec/sdk-context-schema';
import { IUnleashServices } from 'lib/types/services';
import { ALL } from '../../lib/types/models/api-token';
import { PlaygroundFeatureSchema } from 'lib/openapi/spec/playground-feature-schema';
import { Logger } from '../logger';
import { IUnleashConfig } from 'lib/types';
import { offlineUnleashClient } from '../util/offline-unleash-client';
import { FeatureInterface } from 'lib/util/feature-evaluator/feature';
import { FeatureEvaluationResult } from 'lib/util/feature-evaluator/client';

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
            // console.log(
            //     'got these',
            //     await client.getFeatureToggleDefinitions(),
            // );
            const output: PlaygroundFeatureSchema[] = await Promise.all(
                client
                    .getFeatureToggleDefinitions()
                    .map(async (feature: FeatureInterface) => {
                        const enabledStatus: FeatureEvaluationResult =
                            client.isEnabled(feature.name, clientContext);

                        return {
                            isEnabled: enabledStatus.enabled,
                            strategies: enabledStatus.strategies,
                            projectId:
                                await this.featureToggleService.getProjectId(
                                    feature.name,
                                ),
                            variant: client.getVariant(
                                feature.name,
                                clientContext,
                            ),
                            name: feature.name,
                        };
                    }),
            );

            return output;
        }
    }
}
