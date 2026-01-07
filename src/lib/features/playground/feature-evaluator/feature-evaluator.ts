import Client, { type FeatureStrategiesEvaluationResult } from './client.js';
import Repository, { type RepositoryInterface } from './repository/index.js';
import type { Context } from './context.js';
import { Strategy, defaultStrategies } from './strategy/index.js';

import type { ClientFeaturesResponse, FeatureInterface } from './feature.js';
import type { Variant } from './variant.js';
import { type FallbackFunction, createFallbackFunction } from './helpers.js';
import {
    type BootstrapOptions,
    resolveBootstrapProvider,
} from './repository/bootstrap-provider.js';
import type { StorageProvider } from './repository/storage-provider.js';
import InMemStorageProvider from './repository/storage-provider-in-mem.js';

export { Strategy };

export interface FeatureEvaluatorConfig {
    appName: string;
    environment?: string;
    strategies?: Strategy[];
    repository?: RepositoryInterface;
    bootstrap?: BootstrapOptions;
    storageProvider?: StorageProvider<ClientFeaturesResponse>;
}

export interface StaticContext {
    appName: string;
    environment: string;
}

export class FeatureEvaluator {
    private repository: RepositoryInterface;

    private client: Client;

    private staticContext: StaticContext;

    constructor({
        appName,
        environment = 'default',
        strategies = [],
        repository,
        bootstrap = { data: [] },
        storageProvider = new InMemStorageProvider(),
    }: FeatureEvaluatorConfig) {
        this.staticContext = { appName, environment };

        const bootstrapProvider = resolveBootstrapProvider(bootstrap);

        this.repository =
            repository ||
            new Repository({
                appName,
                bootstrapProvider,
                storageProvider,
            });

        // setup client
        const supportedStrategies = strategies.concat(defaultStrategies);
        this.client = new Client(this.repository, supportedStrategies);
    }

    async start(): Promise<void> {
        return this.repository.start();
    }

    destroy(): void {
        this.repository.stop();
    }

    isEnabled(
        name: string,
        context?: Context,
        fallbackFunction?: FallbackFunction,
    ): FeatureStrategiesEvaluationResult;
    isEnabled(
        name: string,
        context?: Context,
        fallbackValue?: boolean,
    ): FeatureStrategiesEvaluationResult;
    isEnabled(
        name: string,
        context: Context = {},
        fallback?: FallbackFunction | boolean,
    ): FeatureStrategiesEvaluationResult {
        const enhancedContext = { ...this.staticContext, ...context };
        const fallbackFunc = createFallbackFunction(
            name,
            enhancedContext,
            fallback,
        );

        return this.client.isEnabled(name, enhancedContext, fallbackFunc);
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
