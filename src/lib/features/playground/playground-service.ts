import FeatureToggleService from '../../services/feature-toggle-service';
import { SdkContextSchema } from 'lib/openapi/spec/sdk-context-schema';
import { IUnleashServices } from 'lib/types/services';
import { ALL } from '../../types/models/api-token';
import { PlaygroundFeatureSchema } from 'lib/openapi/spec/playground-feature-schema';
import { Logger } from '../../logger';
import { IUnleashConfig } from 'lib/types';
import { offlineUnleashClient } from './offline-unleash-client';
import { FeatureInterface } from 'lib/features/playground/feature-evaluator/feature';
import { FeatureStrategiesEvaluationResult } from 'lib/features/playground/feature-evaluator/client';
import { ISegmentService } from 'lib/segments/segment-service-interface';

export class PlaygroundService {
    private readonly logger: Logger;

    private readonly featureToggleService: FeatureToggleService;

    private readonly segmentService: ISegmentService;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleServiceV2,
            segmentService,
        }: Pick<IUnleashServices, 'featureToggleServiceV2' | 'segmentService'>,
    ) {
        this.logger = config.getLogger('services/playground-service.ts');
        this.featureToggleService = featureToggleServiceV2;
        this.segmentService = segmentService;
    }

    async evaluateQuery(
        projects: typeof ALL | string[],
        environment: string,
        context: SdkContextSchema,
    ): Promise<PlaygroundFeatureSchema[]> {
        const [features, segments] = await Promise.all([
            this.featureToggleService.getClientFeatures(
                {
                    project: projects === ALL ? undefined : projects,
                    environment,
                },
                true,
                false,
            ),
            this.segmentService.getActive(),
        ]);

        const [head, ...rest] = features;
        if (!head) {
            return [];
        } else {
            const client = await offlineUnleashClient({
                features: [head, ...rest],
                context,
                logError: this.logger.error,
                segments,
            });

            const variantsMap = features.reduce((acc, feature) => {
                acc[feature.name] = feature.variants;
                return acc;
            }, {});

            const clientContext = {
                ...context,
                currentTime: context.currentTime
                    ? new Date(context.currentTime)
                    : undefined,
            };
            const output: PlaygroundFeatureSchema[] = client
                .getFeatureToggleDefinitions()
                .map((feature: FeatureInterface) => {
                    const strategyEvaluationResult: FeatureStrategiesEvaluationResult =
                        client.isEnabled(feature.name, clientContext);

                    const isEnabled =
                        strategyEvaluationResult.result === true &&
                        feature.enabled;

                    return {
                        isEnabled,
                        isEnabledInCurrentEnvironment: feature.enabled,
                        strategies: {
                            result: strategyEvaluationResult.result,
                            data: strategyEvaluationResult.strategies,
                        },
                        projectId:
                            features.find((f) => f.name === feature.name)
                                ?.project || 'unknown',
                        variant: client.getVariant(feature.name, clientContext),
                        name: feature.name,
                        variants: variantsMap[feature.name] || [],
                    };
                });

            return output;
        }
    }
}
