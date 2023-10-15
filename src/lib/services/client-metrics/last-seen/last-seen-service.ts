import { secondsToMilliseconds } from 'date-fns';
import { Logger } from '../../../logger';
import { IUnleashConfig } from '../../../server-impl';
import { IClientMetricsEnv } from '../../../types/stores/client-metrics-store-v2';
import { ILastSeenStore } from './types/last-seen-store-type';
import { IFeatureToggleStore, IUnleashStores } from '../../../../lib/types';

export type LastSeenInput = {
    featureName: string;
    environment: string;
};

export class LastSeenService {
    private timers: NodeJS.Timeout[] = [];

    private lastSeenToggles: Map<String, LastSeenInput> = new Map();

    private logger: Logger;

    private lastSeenStore: ILastSeenStore;

    private featureToggleStore: IFeatureToggleStore;

    private config: IUnleashConfig;

    constructor(
        {
            featureToggleStore,
            lastSeenStore,
        }: Pick<IUnleashStores, 'featureToggleStore' | 'lastSeenStore'>,
        config: IUnleashConfig,
        lastSeenInterval = secondsToMilliseconds(30),
    ) {
        this.lastSeenStore = lastSeenStore;
        this.featureToggleStore = featureToggleStore;
        this.logger = config.getLogger(
            '/services/client-metrics/last-seen-service.ts',
        );
        this.config = config;

        this.timers.push(
            setInterval(() => this.store(), lastSeenInterval).unref(),
        );
    }

    async store(): Promise<number> {
        const count = this.lastSeenToggles.size;
        if (count > 0) {
            const lastSeenToggles = Array.from(this.lastSeenToggles.values());
            this.lastSeenToggles = new Map<String, LastSeenInput>();
            this.logger.debug(
                `Updating last seen for ${lastSeenToggles.length} toggles`,
            );

            if (this.config.flagResolver.isEnabled('useLastSeenRefactor')) {
                await this.lastSeenStore.setLastSeen(lastSeenToggles);
            } else {
                await this.featureToggleStore.setLastSeen(lastSeenToggles);
            }
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

    destroy(): void {
        this.timers.forEach(clearInterval);
    }
}
