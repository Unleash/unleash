import type {
    IUnleashConfig,
    IUnleashServices,
    IUnleashStores,
} from '../../types';
import type { Logger } from '../../logger';
import type {
    ClientMetricsSchema,
    FrontendApiFeatureSchema,
} from '../../openapi';
import type ApiUser from '../../types/api-user';
import type { IApiUser } from '../../types/api-user';
import {
    type Context,
    InMemStorageProvider,
    Unleash,
    UnleashEvents,
} from 'unleash-client';
import { ApiTokenType } from '../../types/models/api-token';
import {
    type FrontendSettings,
    frontendSettingsKey,
} from '../../types/settings/frontend-settings';
import { validateOrigins } from '../../util';
import { BadDataError, InvalidTokenError } from '../../error';
import {
    FRONTEND_API_REPOSITORY_CREATED,
    PROXY_REPOSITORY_CREATED,
} from '../../metric-events';
import { FrontendApiRepository } from './frontend-api-repository';
import type { GlobalFrontendApiCache } from './global-frontend-api-cache';
import { ProxyRepository } from './proxy-repository';

export type Config = Pick<
    IUnleashConfig,
    'getLogger' | 'frontendApi' | 'frontendApiOrigins' | 'eventBus'
>;

export type Stores = Pick<IUnleashStores, 'segmentReadModel'>;

export type Services = Pick<
    IUnleashServices,
    | 'featureToggleServiceV2'
    | 'clientMetricsServiceV2'
    | 'settingService'
    | 'configurationRevisionService'
>;

export class FrontendApiService {
    private readonly config: Config;

    private readonly logger: Logger;

    private readonly stores: Stores;

    private readonly services: Services;

    private readonly globalFrontendApiCache: GlobalFrontendApiCache;

    /**
     * This is intentionally a Promise because we want to be able to await
     * until the client (which might be being created by a different request) is ready
     * Check this test that fails if we don't use a Promise: frontend-api.concurrency.e2e.test.ts
     */
    private readonly clients: Map<ApiUser['secret'], Promise<Unleash>> =
        new Map();
    private readonly newClients: Map<ApiUser['secret'], Promise<Unleash>> =
        new Map();

    private cachedFrontendSettings?: FrontendSettings;

    constructor(
        config: Config,
        stores: Stores,
        services: Services,
        globalFrontendApiCache: GlobalFrontendApiCache,
    ) {
        this.config = config;
        this.logger = config.getLogger('services/frontend-api-service.ts');
        this.stores = stores;
        this.services = services;
        this.globalFrontendApiCache = globalFrontendApiCache;
    }

    async getFrontendApiFeatures(
        token: IApiUser,
        context: Context,
    ): Promise<FrontendApiFeatureSchema[]> {
        const client = await this.clientForFrontendApiToken(token);
        const definitions = client.getFeatureToggleDefinitions() || [];
        const sessionId = context.sessionId || String(Math.random());

        const resultDefinitions = definitions
            .filter((feature) =>
                client.isEnabled(feature.name, {
                    ...context,
                    sessionId,
                }),
            )
            .map((feature) => ({
                name: feature.name,
                enabled: Boolean(feature.enabled),
                variant: client.getVariant(feature.name, {
                    ...context,
                    sessionId,
                }),
                impressionData: Boolean(feature.impressionData),
            }));
        return resultDefinitions;
    }

    async getNewFrontendApiFeatures(
        token: IApiUser,
        context: Context,
    ): Promise<FrontendApiFeatureSchema[]> {
        const client = await this.newClientForFrontendApiToken(token);
        const definitions = client.getFeatureToggleDefinitions() || [];
        const sessionId = context.sessionId || String(Math.random());

        const resultDefinitions = definitions
            .filter((feature) => {
                const enabled = client.isEnabled(feature.name, {
                    ...context,
                    sessionId,
                });
                return enabled;
            })
            .map((feature) => ({
                name: feature.name,
                enabled: Boolean(feature.enabled),
                variant: client.getVariant(feature.name, {
                    ...context,
                    sessionId,
                }),
                impressionData: Boolean(feature.impressionData),
            }));
        return resultDefinitions;
    }

    async registerFrontendApiMetrics(
        token: IApiUser,
        metrics: ClientMetricsSchema,
        ip: string,
    ): Promise<void> {
        FrontendApiService.assertExpectedTokenType(token);

        const environment =
            this.services.clientMetricsServiceV2.resolveMetricsEnvironment(
                token as ApiUser,
                metrics,
            );

        await this.services.clientMetricsServiceV2.registerClientMetrics(
            {
                ...metrics,
                environment,
            },
            ip,
        );
    }

    private async clientForFrontendApiToken(token: IApiUser): Promise<Unleash> {
        FrontendApiService.assertExpectedTokenType(token);

        let client = this.clients.get(token.secret);
        if (!client) {
            client = this.createClientForFrontendApiToken(token);
            this.clients.set(token.secret, client);
            this.config.eventBus.emit(PROXY_REPOSITORY_CREATED);
        }

        return client;
    }

    private async newClientForFrontendApiToken(
        token: IApiUser,
    ): Promise<Unleash> {
        FrontendApiService.assertExpectedTokenType(token);

        let newClient = this.newClients.get(token.secret);
        if (!newClient) {
            newClient = this.createNewClientForFrontendApiToken(token);
            this.newClients.set(token.secret, newClient);
            this.config.eventBus.emit(FRONTEND_API_REPOSITORY_CREATED);
        }

        return newClient;
    }

    private async createClientForFrontendApiToken(
        token: IApiUser,
    ): Promise<Unleash> {
        const repository = new ProxyRepository(
            this.config,
            this.stores,
            this.services,
            token,
        );
        const client = new Unleash({
            appName: 'proxy',
            url: 'unused',
            storageProvider: new InMemStorageProvider(),
            disableMetrics: true,
            repository,
            disableAutoStart: true,
            skipInstanceCountWarning: true,
        });

        client.on(UnleashEvents.Error, (error) => {
            this.logger.error('We found an event error', error);
        });

        await client.start();

        return client;
    }

    private async createNewClientForFrontendApiToken(
        token: IApiUser,
    ): Promise<Unleash> {
        const repository = new FrontendApiRepository(
            this.config,
            this.globalFrontendApiCache,
            token,
        );
        const client = new Unleash({
            appName: 'frontend-api',
            url: 'unused',
            storageProvider: new InMemStorageProvider(),
            disableMetrics: true,
            repository,
            disableAutoStart: true,
            skipInstanceCountWarning: true,
        });

        client.on(UnleashEvents.Error, (error) => {
            this.logger.error('We found an event error', error);
        });

        await client.start();

        return client;
    }

    async deleteClientForFrontendApiToken(secret: string): Promise<void> {
        const clientPromise = this.clients.get(secret);
        if (clientPromise) {
            const client = await clientPromise;
            client.destroy();
            this.clients.delete(secret);
        }
    }

    stopAll(): void {
        this.clients.forEach((promise) => promise.then((c) => c.destroy()));
    }

    private static assertExpectedTokenType({ type }: IApiUser) {
        if (!(type === ApiTokenType.FRONTEND || type === ApiTokenType.ADMIN)) {
            throw new InvalidTokenError();
        }
    }

    async setFrontendSettings(
        value: FrontendSettings,
        createdBy: string,
        createdByUserId: number,
    ): Promise<void> {
        const error = validateOrigins(value.frontendApiOrigins);
        if (error) {
            throw new BadDataError(error);
        }
        await this.services.settingService.insert(
            frontendSettingsKey,
            value,
            createdBy,
            createdByUserId,
            false,
        );
    }

    async fetchFrontendSettings(): Promise<FrontendSettings> {
        try {
            this.cachedFrontendSettings =
                await this.services.settingService.get(frontendSettingsKey, {
                    frontendApiOrigins: this.config.frontendApiOrigins,
                });
        } catch (error) {
            this.logger.debug('Unable to fetch frontend settings', error);
        }
        return this.cachedFrontendSettings;
    }

    async getFrontendSettings(useCache = true): Promise<FrontendSettings> {
        if (useCache && this.cachedFrontendSettings) {
            return this.cachedFrontendSettings;
        }
        return this.fetchFrontendSettings();
    }
}
