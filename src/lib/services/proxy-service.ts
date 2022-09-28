import { IUnleashConfig } from '../types/option';
import { Logger } from '../logger';
import { IUnleashServices, IUnleashStores } from '../types';
import { ProxyFeatureSchema } from '../openapi/spec/proxy-feature-schema';
import ApiUser from '../types/api-user';
import {
    Context,
    InMemStorageProvider,
    startUnleash,
    Unleash,
    UnleashEvents,
} from 'unleash-client';
import { ProxyRepository } from '../proxy/proxy-repository';
import assert from 'assert';
import { ApiTokenType } from '../types/models/api-token';
import { ProxyMetricsSchema } from '../openapi/spec/proxy-metrics-schema';

type Config = Pick<IUnleashConfig, 'getLogger' | 'frontendApi'>;

type Stores = Pick<IUnleashStores, 'projectStore' | 'eventStore'>;

type Services = Pick<
    IUnleashServices,
    'featureToggleServiceV2' | 'segmentService' | 'clientMetricsServiceV2'
>;

export class ProxyService {
    private readonly config: Config;

    private readonly logger: Logger;

    private readonly stores: Stores;

    private readonly services: Services;

    private readonly clients: Map<ApiUser['secret'], Unleash> = new Map();

    constructor(config: Config, stores: Stores, services: Services) {
        this.config = config;
        this.logger = config.getLogger('services/proxy-service.ts');
        this.stores = stores;
        this.services = services;
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
        metrics: ProxyMetricsSchema,
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

        if (!this.clients.has(token.secret)) {
            this.clients.set(
                token.secret,
                await this.createClientForProxyToken(token),
            );
        }

        return this.clients.get(token.secret);
    }

    private async createClientForProxyToken(token: ApiUser): Promise<Unleash> {
        const repository = new ProxyRepository(
            this.config,
            this.stores,
            this.services,
            token,
        );

        const client = await startUnleash({
            appName: 'proxy',
            url: 'unused',
            storageProvider: new InMemStorageProvider(),
            disableMetrics: true,
            repository,
        });

        client.on(UnleashEvents.Error, (error) => {
            this.logger.error(error);
        });

        return client;
    }

    deleteClientForProxyToken(secret: string): void {
        this.clients.delete(secret);
    }

    stopAll(): void {
        this.clients.forEach((client) => client.destroy());
    }

    private static assertExpectedTokenType({ type }: ApiUser) {
        assert(type === ApiTokenType.FRONTEND || type === ApiTokenType.ADMIN);
    }
}
