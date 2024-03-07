import { IUnleashConfig, IUnleashServices, IUnleashStores } from '../types';
import { Logger } from '../logger';
import { ClientMetricsSchema, ProxyFeatureSchema } from '../openapi';
import ApiUser, { IApiUser } from '../types/api-user';
import {
    Context,
    InMemStorageProvider,
    Unleash,
    UnleashEvents,
} from 'unleash-client';
import { ApiTokenType } from '../types/models/api-token';
import {
    FrontendSettings,
    frontendSettingsKey,
} from '../types/settings/frontend-settings';
import { validateOrigins } from '../util';
import { BadDataError, InvalidTokenError } from '../error';
import { PROXY_REPOSITORY_CREATED } from '../metric-events';
import { ProxyRepository } from '../proxy';

type Config = Pick<
    IUnleashConfig,
    'getLogger' | 'frontendApi' | 'frontendApiOrigins' | 'eventBus'
>;

type Stores = Pick<
    IUnleashStores,
    'projectStore' | 'eventStore' | 'segmentReadModel'
>;

type Services = Pick<
    IUnleashServices,
    | 'featureToggleServiceV2'
    | 'clientMetricsServiceV2'
    | 'settingService'
    | 'configurationRevisionService'
>;

export class ProxyService {
    private readonly config: Config;

    private readonly logger: Logger;

    private readonly stores: Stores;

    private readonly services: Services;

    /**
     * This is intentionally a Promise becasue we want to be able to await
     * until the client (which might be being created by a different request) is ready
     * Check this test that fails if we don't use a Promise: src/test/e2e/api/proxy/proxy.concurrency.e2e.test.ts
     */
    private readonly clients: Map<ApiUser['secret'], Promise<Unleash>> =
        new Map();

    private cachedFrontendSettings?: FrontendSettings;

    constructor(config: Config, stores: Stores, services: Services) {
        this.config = config;
        this.logger = config.getLogger('services/proxy-service.ts');
        this.stores = stores;
        this.services = services;
    }

    async getProxyFeatures(
        token: IApiUser,
        context: Context,
    ): Promise<ProxyFeatureSchema[]> {
        const client = await this.clientForProxyToken(token);
        const definitions = client.getFeatureToggleDefinitions() || [];
        const sessionId = context.sessionId || String(Math.random());

        return definitions
            .filter((feature) =>
                client.isEnabled(feature.name, { ...context, sessionId }),
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
    }

    async registerProxyMetrics(
        token: IApiUser,
        metrics: ClientMetricsSchema,
        ip: string,
    ): Promise<void> {
        ProxyService.assertExpectedTokenType(token);

        const environment =
            this.services.clientMetricsServiceV2.resolveMetricsEnvironment(
                token as ApiUser,
                metrics,
            );

        await this.services.clientMetricsServiceV2.registerClientMetrics(
            { ...metrics, environment },
            ip,
        );
    }

    private async clientForProxyToken(token: IApiUser): Promise<Unleash> {
        ProxyService.assertExpectedTokenType(token);

        let client = this.clients.get(token.secret);
        if (!client) {
            client = this.createClientForProxyToken(token);
            this.clients.set(token.secret, client);
            this.config.eventBus.emit(PROXY_REPOSITORY_CREATED);
        }

        return client;
    }

    private async createClientForProxyToken(token: IApiUser): Promise<Unleash> {
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

    async deleteClientForProxyToken(secret: string): Promise<void> {
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
