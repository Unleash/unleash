import FeatureToggleService from '../feature-toggle/feature-toggle-service';
import { SdkContextSchema } from '../../openapi/spec/sdk-context-schema';
import { IUnleashServices } from '../../types/services';
import { ALL } from '../../types/models/api-token';
import { PlaygroundFeatureSchema } from '../../openapi/spec/playground-feature-schema';
import { Logger } from '../../logger';
import {
    IFlagResolver,
    ISegment,
    ISegmentReadModel,
    IUnleashConfig,
} from '../../types';
import { offlineUnleashClient } from './offline-unleash-client';
import { FeatureInterface } from '../../features/playground/feature-evaluator/feature';
import {
    EvaluatedPlaygroundStrategy,
    FeatureStrategiesEvaluationResult,
} from '../../features/playground/feature-evaluator/client';
import { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type';
import { generateObjectCombinations } from './generateObjectCombinations';
import groupBy from 'lodash.groupby';
import { omitKeys } from '../../util';
import {
    AdvancedPlaygroundFeatureSchema,
    playgroundStrategyEvaluation,
} from '../../openapi';
import { AdvancedPlaygroundEnvironmentFeatureSchema } from '../../openapi/spec/advanced-playground-environment-feature-schema';
import { validateQueryComplexity } from './validateQueryComplexity';
import { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType';
import { getDefaultVariant } from './feature-evaluator/variant';

type EvaluationInput = {
    features: FeatureConfigurationClient[];
    segments: ISegment[];
    featureProject: Record<string, string>;
    context: SdkContextSchema;
    environment: string;
};

export type AdvancedPlaygroundEnvironmentFeatureEvaluationResult = Omit<
    AdvancedPlaygroundEnvironmentFeatureSchema,
    'strategies'
> & {
    strategies: {
        result: boolean | typeof playgroundStrategyEvaluation.unknownResult;
        data: EvaluatedPlaygroundStrategy[];
    };
};

export type AdvancedPlaygroundFeatureEvaluationResult = Omit<
    AdvancedPlaygroundFeatureSchema,
    'environments'
> & {
    environments: Record<
        string,
        AdvancedPlaygroundEnvironmentFeatureEvaluationResult[]
    >;
};

export type PlaygroundFeatureEvaluationResult = Omit<
    PlaygroundFeatureSchema,
    'strategies'
> & {
    strategies: {
        result: boolean | typeof playgroundStrategyEvaluation.unknownResult;
        data: EvaluatedPlaygroundStrategy[];
    };
};

export class PlaygroundService {
    private readonly logger: Logger;

    private readonly featureToggleService: FeatureToggleService;

    private readonly flagResolver: IFlagResolver;

    private readonly privateProjectChecker: IPrivateProjectChecker;

    private readonly segmentReadModel: ISegmentReadModel;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleServiceV2,
            privateProjectChecker,
        }: Pick<
            IUnleashServices,
            'featureToggleServiceV2' | 'privateProjectChecker'
        >,
        segmentReadModel: ISegmentReadModel,
    ) {
        this.logger = config.getLogger('services/playground-service.ts');
        this.flagResolver = config.flagResolver;
        this.featureToggleService = featureToggleServiceV2;
        this.privateProjectChecker = privateProjectChecker;
        this.segmentReadModel = segmentReadModel;
    }

    async evaluateAdvancedQuery(
        projects: typeof ALL | string[],
        environments: string[],
        context: SdkContextSchema,
        limit: number,
        userId: number,
    ): Promise<AdvancedPlaygroundFeatureEvaluationResult[]> {
        const segments = await this.segmentReadModel.getActive();

        let filteredProjects: typeof projects = projects;

        const projectAccess =
            await this.privateProjectChecker.getUserAccessibleProjects(userId);
        if (projectAccess.mode === 'all') {
            filteredProjects = projects;
        } else if (projects === ALL) {
            filteredProjects = projectAccess.projects;
        } else {
            filteredProjects = projects.filter((project) =>
                projectAccess.projects.includes(project),
            );
        }

        const environmentFeatures = await Promise.all(
            environments.map((env) =>
                this.resolveFeatures(filteredProjects, env),
            ),
        );
        const contexts = generateObjectCombinations(context);

        validateQueryComplexity(
            environments.length,
            environmentFeatures[0]?.features.length ?? 0,
            contexts.length,
            limit,
        );

        const results = await Promise.all(
            environmentFeatures.flatMap(
                ({ features, featureProject, environment }) =>
                    contexts.map((singleContext) =>
                        this.evaluate({
                            features,
                            featureProject,
                            context: singleContext,
                            segments,
                            environment,
                        }),
                    ),
            ),
        );
        const items = results.flat();
        const itemsByName = groupBy(items, (item) => item.name);
        return Object.values(itemsByName).map((entries) => {
            const groupedEnvironments = groupBy(
                entries,
                (entry) => entry.environment,
            );
            return {
                name: entries[0].name,
                projectId: entries[0].projectId,
                environments: groupedEnvironments,
            };
        });
    }

    private async evaluate({
        featureProject,
        features,
        segments,
        context,
        environment,
    }: EvaluationInput): Promise<
        AdvancedPlaygroundEnvironmentFeatureEvaluationResult[]
    > {
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

            return client
                .getFeatureToggleDefinitions()
                .map((feature: FeatureInterface) => {
                    const strategyEvaluationResult: FeatureStrategiesEvaluationResult =
                        client.isEnabled(feature.name, clientContext);

                    const hasUnsatisfiedDependency =
                        strategyEvaluationResult.hasUnsatisfiedDependency;
                    const isEnabled =
                        strategyEvaluationResult.result === true &&
                        feature.enabled &&
                        !hasUnsatisfiedDependency;

                    const variant = {
                        ...(isEnabled
                            ? client.forceGetVariant(
                                  feature.name,
                                  strategyEvaluationResult,
                                  clientContext,
                              )
                            : getDefaultVariant()),
                        feature_enabled: isEnabled,
                    };

                    return {
                        isEnabled,
                        isEnabledInCurrentEnvironment: feature.enabled,
                        hasUnsatisfiedDependency,
                        strategies: {
                            result: strategyEvaluationResult.result,
                            data: strategyEvaluationResult.strategies,
                        },
                        projectId: featureProject[feature.name],
                        variant,
                        name: feature.name,
                        environment,
                        context,
                        variants:
                            strategyEvaluationResult.variants ||
                            variantsMap[feature.name] ||
                            [],
                    };
                });
        }
    }

    private async resolveFeatures(
        projects: typeof ALL | string[],
        environment: string,
    ): Promise<
        Pick<EvaluationInput, 'features' | 'featureProject'> & {
            environment: string;
        }
    > {
        const features = await this.featureToggleService.getPlaygroundFeatures({
            project: projects === ALL ? undefined : projects,
            environment,
        });

        const featureProject: Record<string, string> = features.reduce(
            (obj, feature) => {
                obj[feature.name] = feature.project;
                return obj;
            },
            {},
        );
        return { features, featureProject, environment };
    }

    async evaluateQuery(
        projects: typeof ALL | string[],
        environment: string,
        context: SdkContextSchema,
    ): Promise<PlaygroundFeatureEvaluationResult[]> {
        const [{ features, featureProject }, segments] = await Promise.all([
            this.resolveFeatures(projects, environment),
            this.segmentReadModel.getActive(),
        ]);

        const result = await this.evaluate({
            features,
            featureProject,
            segments,
            context,
            environment,
        });

        return result.map((item) => omitKeys(item, 'environment', 'context'));
    }
}
