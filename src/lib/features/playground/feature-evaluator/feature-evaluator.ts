import Client, { FeatureStrategiesEvaluationResult } from './client';
import Repository, { RepositoryInterface } from './repository';
import { Context } from './context';
import { Strategy, defaultStrategies } from './strategy';

import { ClientFeaturesResponse, FeatureInterface } from './feature';
import { Variant } from './variant';
import { FallbackFunction, createFallbackFunction } from './helpers';
import {
    BootstrapOptions,
    resolveBootstrapProvider,
} from './repository/bootstrap-provider';
import { StorageProvider } from './repository/storage-provider';

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
        storageProvider,
    }: FeatureEvaluatorConfig) {
        this.staticContext = { appName, environment };

        const bootstrapProvider = resolveBootstrapProvider(bootstrap);

        this.repository =
            repository ||
            new Repository({
                appName,
                bootstrapProvider,
                storageProvider: storageProvider,
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
        context: Context = {},
        fallbackVariant?: Variant,
    ): Variant {
        const enhancedContext = { ...this.staticContext, ...context };
        return this.client.forceGetVariant(
            name,
            enhancedContext,
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
