import { IUnleashConfig, IUnleashServices, IUnleashStores } from '../types';
import { Logger } from '../logger';
import { ClientMetricsSchema, ProxyFeatureSchema } from '../openapi';
import ApiUser from '../types/api-user';
import {
    Context,
    InMemStorageProvider,
    Unleash,
    UnleashEvents,
} from 'unleash-client';
import { ProxyRepository } from '../proxy';
import { ApiTokenType } from '../types/models/api-token';
import {
    FrontendSettings,
    frontendSettingsKey,
} from '../types/settings/frontend-settings';
import { validateOrigins } from '../util';
import { BadDataError, InvalidTokenError } from '../error';
import { minutesToMilliseconds } from 'date-fns';

type Config = Pick<
    IUnleashConfig,
    'getLogger' | 'frontendApi' | 'frontendApiOrigins'
>;

type Stores = Pick<IUnleashStores, 'projectStore' | 'eventStore'>;

type Services = Pick<
    IUnleashServices,
    | 'featureToggleServiceV2'
    | 'segmentService'
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

    private timer: NodeJS.Timeout | null;

    constructor(config: Config, stores: Stores, services: Services) {
        this.config = config;
        this.logger = config.getLogger('services/proxy-service.ts');
        this.stores = stores;
        this.services = services;

        this.timer = setInterval(
            () => this.fetchFrontendSettings(),
            minutesToMilliseconds(2),
        ).unref();
    }

    async getProxyFeatures(
        token: ApiUser,
        context: Context,
    ): Promise<ProxyFeatureSchema[]> {
        const client = await this.clientForProxyToken(token);
        const definitions = client.getFeatureToggleDefinitions() || [];

        return definitions
            .filter((feature) => client.isEnabled(feature.name, context))
            .map((feature) => ({
                name: feature.name,
                enabled: Boolean(feature.enabled),
                variant: client.forceGetVariant(feature.name, context),
                impressionData: Boolean(feature.impressionData),
            }));
    }

    async registerProxyMetrics(
        token: ApiUser,
        metrics: ClientMetricsSchema,
        ip: string,
    ): Promise<void> {
        ProxyService.assertExpectedTokenType(token);

        const environment =
            this.services.clientMetricsServiceV2.resolveMetricsEnvironment(
                token,
                metrics,
            );

        await this.services.clientMetricsServiceV2.registerClientMetrics(
            { ...metrics, environment },
            ip,
        );
    }

    private async clientForProxyToken(token: ApiUser): Promise<Unleash> {
        ProxyService.assertExpectedTokenType(token);

        let client = this.clients.get(token.secret);
        if (!client) {
            client = this.createClientForProxyToken(token);
            this.clients.set(token.secret, client);
        }

        return client;
    }

    private async createClientForProxyToken(token: ApiUser): Promise<Unleash> {
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
        });

        client.on(UnleashEvents.Error, (error) => {
            this.logger.error(error);
        });

        await client.start();

        return client;
    }

    async deleteClientForProxyToken(secret: string): Promise<void> {
        let clientPromise = this.clients.get(secret);
        if (clientPromise) {
            const client = await clientPromise;
            client.destroy();
            this.clients.delete(secret);
        }
    }

    stopAll(): void {
        this.clients.forEach((promise) => promise.then((c) => c.destroy()));
    }

    private static assertExpectedTokenType({ type }: ApiUser) {
        if (!(type === ApiTokenType.FRONTEND || type === ApiTokenType.ADMIN)) {
            throw new InvalidTokenError();
        }
    }

    async setFrontendSettings(
        value: FrontendSettings,
        createdBy: string,
    ): Promise<void> {
        const error = validateOrigins(value.frontendApiOrigins);
        if (error) {
            throw new BadDataError(error);
        }
        await this.services.settingService.insert(
            frontendSettingsKey,
            value,
            createdBy,
        );
    }

    private async fetchFrontendSettings(): Promise<FrontendSettings> {
        try {
            this.cachedFrontendSettings =
                await this.services.settingService.get(frontendSettingsKey, {
                    frontendApiOrigins: this.config.frontendApiOrigins,
                });
        } catch (error) {
            this.logger.debug('Unable to fetch frontend settings');
        }
        return this.cachedFrontendSettings;
    }

    async getFrontendSettings(
        useCache: boolean = true,
    ): Promise<FrontendSettings> {
        if (useCache && this.cachedFrontendSettings) {
            return this.cachedFrontendSettings;
        }
        return this.fetchFrontendSettings();
    }

    destroy(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}
