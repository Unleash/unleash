import { Logger } from '../../../logger';
import { IUnleashConfig } from '../../../server-impl';
import { IClientMetricsEnv } from '../client-metrics/client-metrics-store-v2-type';
import { ILastSeenStore } from './types/last-seen-store-type';
import {
    IFeatureToggleStore,
    IFlagResolver,
    IUnleashStores,
} from '../../../types';

export type LastSeenInput = {
    featureName: string;
    environment: string;
};

export class LastSeenService {
    private lastSeenToggles: Map<String, LastSeenInput> = new Map();

    private logger: Logger;

    private lastSeenStore: ILastSeenStore;

    private featureToggleStore: IFeatureToggleStore;

    private config: IUnleashConfig;

    private flagResolver: IFlagResolver;

    constructor(
        {
            featureToggleStore,
            lastSeenStore,
        }: Pick<IUnleashStores, 'featureToggleStore' | 'lastSeenStore'>,
        config: IUnleashConfig,
    ) {
        this.lastSeenStore = lastSeenStore;
        this.featureToggleStore = featureToggleStore;
        this.logger = config.getLogger(
            '/services/client-metrics/last-seen-service.ts',
        );
        this.flagResolver = config.flagResolver;
        this.config = config;
    }

    async store(): Promise<number> {
        const count = this.lastSeenToggles.size;
        if (count > 0) {
            const lastSeenToggles = Array.from(this.lastSeenToggles.values());
            this.lastSeenToggles = new Map<String, LastSeenInput>();
            this.logger.debug(
                `Updating last seen for ${lastSeenToggles.length} toggles`,
            );

            await this.lastSeenStore.setLastSeen(lastSeenToggles);
        }
        return count;
    }

    updateLastSeen(clientMetrics: IClientMetricsEnv[]): void {
        clientMetrics
            .filter(
                (clientMetric) =>
                    !this.lastSeenToggles.has(
                        `${clientMetric.featureName}:${clientMetric.environment}`,
                    ),
            )
            .filter(
                (clientMetric) => clientMetric.yes > 0 || clientMetric.no > 0,
            )
            .forEach((clientMetric) => {
                const key = `${clientMetric.featureName}:${clientMetric.environment}`;
                this.lastSeenToggles.set(key, {
                    featureName: clientMetric.featureName,
                    environment: clientMetric.environment,
                });
            });
    }

    async cleanLastSeen() {
        await this.lastSeenStore.cleanLastSeen();
    }
}
