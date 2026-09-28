import Client, { type FeatureStrategiesEvaluationResult } from './client.js';
import Repository from './repository/index.js';
import type { Context } from './context.js';
import { defaultStrategies } from './strategy/index.js';

import type { FeatureInterface } from './feature.js';
import type { Variant } from './variant.js';
import {
    type BootstrapOptions,
    resolveBootstrapProvider,
} from './repository/bootstrap-provider.js';
import InMemStorageProvider from './repository/storage-provider-in-mem.js';

export interface FeatureEvaluatorConfig {
    appName: string;
    environment?: string;
    bootstrap?: BootstrapOptions;
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
        bootstrap = { data: [] },
    }: FeatureEvaluatorConfig) {
        this.staticContext = { appName, environment };
        this.repository = new Repository({
            appName,
            bootstrapProvider: resolveBootstrapProvider(bootstrap),
            storageProvider: new InMemStorageProvider(),
        });
        this.client = new Client(this.repository, defaultStrategies);
    }

    async start(): Promise<void> {
        return this.repository.start();
    }

    isEnabled(
        name: string,
        context: Context = {},
    ): FeatureStrategiesEvaluationResult {
        const enhancedContext = { ...this.staticContext, ...context };
        return this.client.isEnabled(name, enhancedContext, () => ({
            result: false,
            strategies: [],
        }));
    }

    getVariant(
        name: string,
        context: Context = {},
        fallbackVariant?: Variant,
    ): Variant {
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
        fallbackVariant?: Variant,
    ): Variant {
        const enhancedContext = { ...this.staticContext, ...context };
        return this.client.forceGetVariant(
            name,
            enhancedContext,
            forcedResults,
            fallbackVariant,
        );
    }

    getFeatureToggleDefinition(toggleName: string): FeatureInterface {
        return this.repository.getToggle(toggleName);
    }

    getFeatureToggleDefinitions(): FeatureInterface[] {
        return this.repository.getToggles();
    }
}
