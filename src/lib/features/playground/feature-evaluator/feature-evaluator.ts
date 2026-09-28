import type { Context } from 'unleash-client';
import Client, {
    type EvaluatedVariant,
    type FeatureStrategiesEvaluationResult,
} from './client.js';
import type { FeatureInterface, Segment } from './feature.js';
import Repository from './repository/index.js';
import {
    explainedDefaultStrategies,
    unknownStrategyExplainer,
} from './strategy/index.js';

export interface FeatureEvaluatorConfig {
    appName: string;
    environment?: string;
    features: FeatureInterface[];
    segments?: Segment[];
}

export interface StaticContext {
    appName: string;
    environment: string;
}

export class FeatureEvaluator {
    private repository: Repository;

    private client: Client;

    private staticContext: StaticContext;

    constructor({
        appName,
        environment = 'default',
        features,
        segments,
    }: FeatureEvaluatorConfig) {
        this.staticContext = { appName, environment };
        this.repository = new Repository({ features, segments });
        this.client = new Client(
            this.repository,
            explainedDefaultStrategies,
            unknownStrategyExplainer,
        );
    }

    isEnabled(
        name: string,
        context: Context = {},
    ): FeatureStrategiesEvaluationResult {
        const enhancedContext = { ...this.staticContext, ...context };
        return this.client.isEnabled(name, enhancedContext);
    }

    getVariant(
        name: string,
        context: Context = {},
        fallbackVariant?: EvaluatedVariant,
    ): EvaluatedVariant {
        const enhancedContext = { ...this.staticContext, ...context };
        return this.client.getVariant(name, enhancedContext, fallbackVariant);
    }

    forceGetVariant(
        name: string,
        forcedResults: Pick<
            FeatureStrategiesEvaluationResult,
            'result' | 'variant'
        >,
        context: Context = {},
        fallbackVariant?: EvaluatedVariant,
    ): EvaluatedVariant {
        const enhancedContext = { ...this.staticContext, ...context };
        return this.client.forceGetVariant(
            name,
            enhancedContext,
            forcedResults,
            fallbackVariant,
        );
    }

    getFeatureToggleDefinitions(): FeatureInterface[] {
        return this.repository.getToggles();
    }
}
