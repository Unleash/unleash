import { EventEmitter } from 'events';
import Client, { FeatureEvaluationResult } from './client';
import Repository, { RepositoryInterface } from './repository';
import { Context } from './context';
import { Strategy, defaultStrategies } from './strategy';

import { ClientFeaturesResponse, FeatureInterface } from './feature';
import { Variant, getDefaultVariant } from './variant';
import { FallbackFunction, createFallbackFunction } from './helpers';
import {
    BootstrapOptions,
    resolveBootstrapProvider,
} from './repository/bootstrap-provider';
import { StorageProvider } from './repository/storage-provider';
import { UnleashEvents } from './events';

export { Strategy, UnleashEvents };

export interface UnleashConfig {
    appName: string;
    environment?: string;
    projectName?: string;
    strategies?: Strategy[];
    repository?: RepositoryInterface;
    bootstrap?: BootstrapOptions;
    bootstrapOverride?: boolean;
    storageProvider?: StorageProvider<ClientFeaturesResponse>;
}

export interface StaticContext {
    appName: string;
    environment: string;
}

export class Unleash extends EventEmitter {
    private repository: RepositoryInterface;

    private client: Client;

    private staticContext: StaticContext;

    private synchronized: boolean = false;

    private ready: boolean = false;

    constructor({
        appName,
        environment = 'default',
        strategies = [],
        repository,
        bootstrap = { data: [] },
        storageProvider,
    }: UnleashConfig) {
        super();

        this.staticContext = { appName, environment };

        const bootstrapProvider = resolveBootstrapProvider(bootstrap);

        this.repository =
            repository ||
            new Repository({
                appName,
                bootstrapProvider,
                storageProvider: storageProvider,
            });

        this.repository.on(UnleashEvents.Ready, () => {
            this.ready = true;
            process.nextTick(() => {
                this.emit(UnleashEvents.Ready);
            });
        });

        this.repository.on(UnleashEvents.Error, (err) => {
            // eslint-disable-next-line no-param-reassign
            err.message = `Unleash Repository error: ${err.message}`;
            this.emit(UnleashEvents.Error, err);
        });

        this.repository.on(UnleashEvents.Warn, (msg) =>
            this.emit(UnleashEvents.Warn, msg),
        );

        this.repository.on(UnleashEvents.Changed, (data) => {
            this.emit(UnleashEvents.Changed, data);

            // Only emit the fully synchronized event the first time.
            if (!this.synchronized) {
                this.synchronized = true;
                process.nextTick(() => this.emit(UnleashEvents.Synchronized));
            }
        });

        // setup client
        const supportedStrategies = strategies.concat(defaultStrategies);
        this.client = new Client(this.repository, supportedStrategies);
        this.client.on(UnleashEvents.Error, (err) =>
            this.emit(UnleashEvents.Error, err),
        );
        this.client.on(UnleashEvents.Warn, (msg) =>
            this.emit(UnleashEvents.Warn, msg),
        );
    }

    async start(): Promise<void> {
        await Promise.all([this.repository.start()]);
    }

    destroy(): void {
        this.repository.stop();
    }

    isEnabled(
        name: string,
        context?: Context,
        fallbackFunction?: FallbackFunction,
    ): FeatureEvaluationResult;
    isEnabled(
        name: string,
        context?: Context,
        fallbackValue?: boolean,
    ): FeatureEvaluationResult;
    isEnabled(
        name: string,
        context: Context = {},
        fallback?: FallbackFunction | boolean,
    ): FeatureEvaluationResult {
        const enhancedContext = { ...this.staticContext, ...context };
        const fallbackFunc = createFallbackFunction(
            name,
            enhancedContext,
            fallback,
        );

        let result;
        if (this.ready) {
            result = this.client.isEnabled(name, enhancedContext, fallbackFunc);
        } else {
            result = fallbackFunc();
            this.emit(
                UnleashEvents.Warn,
                `Unleash has not been initialized yet. isEnabled(${name}) defaulted to ${result}`,
            );
        }
        return result;
    }

    getVariant(
        name: string,
        context: Context = {},
        fallbackVariant?: Variant,
    ): Variant {
        const enhancedContext = { ...this.staticContext, ...context };
        let result;
        if (this.ready) {
            result = this.client.getVariant(
                name,
                enhancedContext,
                fallbackVariant,
            );
        } else {
            result =
                typeof fallbackVariant !== 'undefined'
                    ? fallbackVariant
                    : getDefaultVariant();
            this.emit(
                UnleashEvents.Warn,
                `Unleash has not been initialized yet. isEnabled(${name}) defaulted to ${result}`,
            );
        }

        return result;
    }

    forceGetVariant(
        name: string,
        context: Context = {},
        fallbackVariant?: Variant,
    ): Variant {
        const enhancedContext = { ...this.staticContext, ...context };
        let result;
        if (this.ready) {
            result = this.client.forceGetVariant(
                name,
                enhancedContext,
                fallbackVariant,
            );
        } else {
            result =
                typeof fallbackVariant !== 'undefined'
                    ? fallbackVariant
                    : getDefaultVariant();
            this.emit(
                UnleashEvents.Warn,
                `Unleash has not been initialized yet. isEnabled(${name}) defaulted to ${result}`,
            );
        }

        return result;
    }

    getFeatureToggleDefinition(toggleName: string): FeatureInterface {
        return this.repository.getToggle(toggleName);
    }

    getFeatureToggleDefinitions(): FeatureInterface[] {
        return this.repository.getToggles();
    }
}
